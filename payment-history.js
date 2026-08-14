// Payment History Management
const paymentStorageKey = 'myWebcodePayments';

// Add payment to history
function addPaymentToHistory(paymentDetails) {
    const payments = getAllPayments();
    const payment = {
        id: generatePaymentId(),
        ...paymentDetails,
        timestamp: new Date().toISOString()
    };
    payments.push(payment);
    localStorage.setItem(paymentStorageKey, JSON.stringify(payments));
    return payment;
}

// Get all payments
function getAllPayments() {
    try {
        return JSON.parse(localStorage.getItem(paymentStorageKey)) || [];
    } catch {
        return [];
    }
}

// Get payments for current user
async function getUserPayments() {
    const user = getUser();
    if (!user) return [];

    if (user.customerId) {
        const serverResult = await fetchServerPayments(user.customerId);
        if (serverResult.success && Array.isArray(serverResult.payments)) {
            return serverResult.payments.map(normalizeServerPayment);
        }
    }

    return getAllPayments().filter(p => p.userEmail === user.email);
}

async function fetchServerPayments(customerId) {
    try {
        const response = await fetch(`/api/payments/${encodeURIComponent(customerId)}`);
        const data = await response.json();
        return { success: response.ok && data.success, ...data };
    } catch (error) {
        console.warn('Failed to fetch server payments:', error);
        return { success: false, message: 'Server unavailable', payments: [] };
    }
}

function normalizeServerPayment(payment) {
    return {
        id: payment.id,
        paymentId: payment.id,
        planId: payment.planId,
        payerEmail: payment.paypalPayerId || payment.payerEmail || '',
        payerName: payment.payerName || 'Customer',
        userEmail: payment.payerEmail || '',
        amount: payment.amount,
        status: payment.status || 'COMPLETED',
        timestamp: payment.paidAt || payment.createdAt || new Date().toISOString()
    };
}

async function getSubscription() {
    const user = getUser();
    if (!user) return null;

    if (user.customerId) {
        try {
            const response = await fetch(`/api/subscriptions/${encodeURIComponent(user.customerId)}`);
            const data = await response.json();
            if (response.ok && data.success && Array.isArray(data.subscriptions) && data.subscriptions.length > 0) {
                const sub = data.subscriptions[0];
                return {
                    planId: sub.planId,
                    amount: sub.amount,
                    status: (sub.status || 'active').toUpperCase(),
                    timestamp: sub.startDate || sub.createdAt || new Date().toISOString(),
                    paymentId: sub.paypalSubscriptionId || sub.id
                };
            }
        } catch (error) {
            console.warn('Unable to fetch subscription from server:', error);
        }
    }

    try {
        return JSON.parse(localStorage.getItem('myWebcodeSubscription'));
    } catch {
        return null;
    }
}

// Generate unique payment ID
function generatePaymentId() {
    return 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Display subscription status
async function displaySubscriptionStatus() {
    const user = getUser();
    if (!user) {
        document.querySelector('[data-subscription-status]').innerHTML = 
            '<h2>Subscription Status</h2><p class="no-subscription">Please sign in to view your subscription</p>';
        return;
    }

    const subscription = await getSubscription();
    const statusDiv = document.getElementById('subscription-info');

    if (subscription && subscription.status === 'COMPLETED') {
        const planName = subscription.planId === 'pro' ? 'Pro Monthly' : 'Annual Plan';
        const startDate = new Date(subscription.timestamp).toLocaleDateString();
        
        statusDiv.innerHTML = `
            <div class="status-info">
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Status:</strong> <span class="badge-active">Active</span></p>
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>Amount:</strong> $${subscription.amount} ${subscription.planId === 'pro' ? '/month' : '/year'}</p>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button class="action-button" onclick="showCancelDialog()">Cancel Subscription</button>
                <a href="pricing.html" class="button">Upgrade Plan</a>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <p class="no-subscription">No active subscription</p>
            <a href="pricing.html" class="button">Get Started</a>
        `;
    }
}

// Display transactions
async function displayTransactions() {
    const payments = await getUserPayments();
    const container = document.querySelector('[data-transactions-list]');

    if (payments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet</p>
                <a href="pricing.html" class="button">Browse Plans</a>
            </div>
        `;
        return;
    }

    let html = '<table class="transactions-table"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    payments.forEach(payment => {
        const date = new Date(payment.timestamp).toLocaleDateString();
        const amount = payment.amount;
        const plan = payment.planId === 'pro' ? 'Pro Monthly' : 'Annual Plan';
        const status = payment.status === 'COMPLETED' ? '<span class="badge-completed">Completed</span>' : '<span class="badge-pending">Pending</span>';
        
        html += `
            <tr>
                <td>${date}</td>
                <td>${plan}</td>
                <td>$${amount}</td>
                <td>${status}</td>
                <td>
                    <button class="action-link" onclick="viewInvoice('${payment.id}')">Invoice</button>
                    <button class="action-link" onclick="showReceiptEmail('${payment.id}')">Receipt</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// View invoice
function viewInvoice(paymentId) {
    const payments = getAllPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) return;

    const invoiceContent = generateInvoiceHTML(payment);
    document.getElementById('invoice-content').innerHTML = invoiceContent;
    
    // Store current payment for download
    window.currentPayment = payment;
    
    document.getElementById('invoice-dialog').showModal();
}

// Generate invoice HTML
function generateInvoiceHTML(payment) {
    const date = new Date(payment.timestamp);
    const invoiceNo = payment.id;
    const plan = payment.planId === 'pro' ? 'Pro Monthly Subscription' : 'Annual Subscription';
    
    return `
        <div style="padding: 2rem; background: white; border-radius: 0.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0; color: #4f46e5;">MY WEBCODE</h3>
                    <p style="margin: 0.5rem 0 0;">Learning Platform</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0;"><strong>INVOICE</strong></p>
                    <p style="margin: 0.5rem 0 0; color: #64748b;">#${invoiceNo.slice(-8).toUpperCase()}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem;">INVOICE TO:</p>
                    <p style="margin: 0;"><strong>${payment.payerName || 'Customer'}</strong></p>
                    <p style="margin: 0.25rem 0 0; color: #475569;">${payment.payerEmail}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;"><strong>Invoice Date:</strong> ${date.toLocaleDateString()}</p>
                    <p style="margin: 0.5rem 0 0; color: #64748b; font-size: 0.9rem;"><strong>Due Date:</strong> ${date.toLocaleDateString()}</p>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 1rem; text-align: left; color: #64748b; font-weight: 700;">Description</th>
                        <th style="padding: 1rem; text-align: right; color: #64748b; font-weight: 700;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 1rem;">${plan}</td>
                        <td style="padding: 1rem; text-align: right;">$${payment.amount}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 1rem;">Subtotal</td>
                        <td style="padding: 1rem; text-align: right;">$${payment.amount}</td>
                    </tr>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <td style="padding: 1rem; font-weight: 700;">Total</td>
                        <td style="padding: 1rem; text-align: right; font-weight: 700; font-size: 1.2rem;">$${payment.amount}</td>
                    </tr>
                </tbody>
            </table>

            <div style="padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.85rem;">
                <p style="margin: 0;">Thank you for your business!</p>
                <p style="margin: 0.5rem 0 0;">Payment ID: ${payment.paymentId}</p>
            </div>
        </div>
    `;
}

// Download invoice as PDF (using simple HTML to PDF)
function downloadInvoice() {
    const payment = window.currentPayment;
    if (!payment) return;

    const invoiceHTML = generateInvoiceHTML(payment);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice #${payment.id.slice(-8).toUpperCase()}</title>
            <style>
                body { font-family: Arial, sans-serif; color: #172033; }
                * { margin: 0; padding: 0; }
            </style>
        </head>
        <body>
            ${invoiceHTML}
            <script>
                window.print();
                window.close();
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Show cancel subscription dialog
function showCancelDialog() {
    document.getElementById('cancel-dialog').showModal();
}

// Handle cancel subscription
document.addEventListener('DOMContentLoaded', () => {
    const cancelForm = document.querySelector('[data-cancel-form]');
    if (cancelForm) {
        cancelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCancelSubscription(e.target);
        });
    }

    loadPaymentHistory();
});

async function loadPaymentHistory() {
    await displaySubscriptionStatus();
    await displayTransactions();
    updateAccountButton();
}

// Cancel subscription
async function handleCancelSubscription(form) {
    const user = getUser();
    const reason = form.reason.value;

    if (!user) {
        showMessage('Please sign in to cancel subscription');
        return;
    }

    const subscription = await getSubscription();
    if (!subscription) {
        showMessage('No active subscription found');
        return;
    }

    // Store cancellation request
    const cancellation = {
        id: generatePaymentId(),
        userId: user.email,
        subscriptionId: subscription.paymentId,
        planId: subscription.planId,
        reason: reason,
        canceledAt: new Date().toISOString(),
        status: 'pending'
    };

    localStorage.setItem('myWebcodeCancellation', JSON.stringify(cancellation));

    // Remove subscription
    localStorage.removeItem('myWebcodeSubscription');
    user.isPremium = false;
    user.plan = null;
    localStorage.setItem('myWebcodeUser', JSON.stringify(user));

    // Close dialog
    document.getElementById('cancel-dialog').close();
    
    showMessage('Subscription canceled. Your access will end at the end of your billing period.');
    
    // Reload after 2 seconds
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Send receipt email
function showReceiptEmail(paymentId) {
    const payments = getAllPayments();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) return;

    // In a real app, this would send to backend to email
    showMessage(`Receipt email would be sent to ${payment.payerEmail}`);
    
    // Store email request
    const emailRequest = {
        type: 'receipt',
        paymentId: paymentId,
        email: payment.payerEmail,
        timestamp: new Date().toISOString()
    };

    const requests = JSON.parse(localStorage.getItem('myWebcodeEmailRequests') || '[]');
    requests.push(emailRequest);
    localStorage.setItem('myWebcodeEmailRequests', JSON.stringify(requests));
}
