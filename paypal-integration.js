// PayPal Integration Configuration
const paypalPlans = {
    pro: {
        id: 'pro',
        name: 'Pro Monthly',
        amount: '9.99',
        description: 'Pro Monthly subscription for advanced features'
    },
    annual: {
        id: 'annual',
        name: 'Annual Plan',
        amount: '99.99',
        description: 'Annual subscription with lifetime access'
    }
};

// Initialize PayPal buttons
function initPayPalButtons() {
    // Pro Plan Button
    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: paypalPlans.pro.amount,
                        currency_code: 'USD'
                    },
                    description: paypalPlans.pro.description
                }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
                handlePaymentSuccess(details, 'pro');
            });
        },
        onError: (err) => {
            console.error('PayPal error:', err);
            showMessage('Payment failed. Please try again.');
        }
    }).render('#paypal-button-pro');

    // Annual Plan Button
    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: paypalPlans.annual.amount,
                        currency_code: 'USD'
                    },
                    description: paypalPlans.annual.description
                }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
                handlePaymentSuccess(details, 'annual');
            });
        },
        onError: (err) => {
            console.error('PayPal error:', err);
            showMessage('Payment failed. Please try again.');
        }
    }).render('#paypal-button-annual');
}

// Handle successful payment
async function handlePaymentSuccess(details, planId) {
    const user = getUser();
    const customer = getLoggedInCustomer();
    
    if (!user && !customer) {
        showMessage('Please sign in before purchasing.');
        return;
    }

    // Get customer info (prioritize logged-in customer)
    const payer = customer || user;

    // Store subscription information
    const subscription = {
        planId: planId,
        paymentId: details.id,
        payerEmail: details.payer.email_address,
        payerName: details.payer.name.given_name + ' ' + details.payer.name.surname,
        userEmail: user?.email || customer?.email,
        amount: details.purchase_units[0].amount.value,
        status: details.status,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('myWebcodeSubscription', JSON.stringify(subscription));
    
    // Add to payment history
    if (typeof addPaymentToHistory === 'function') {
        addPaymentToHistory(subscription);
    }
    
    // Update user with premium status
    if (user) {
        user.isPremium = true;
        user.plan = planId;
        localStorage.setItem('myWebcodeUser', JSON.stringify(user));
    }

    // If we have a verified customer, store payment server-side and send richer communication
    if (customer) {
        const recordResponse = await recordPaymentOnServer(customer.id, subscription);
        if (recordResponse.success) {
            const txnCode = recordResponse.transactionCode || sendPaymentThankYouEmail(subscription, customer);
            sendPaymentInvoice(subscription, customer);
            showMessage(`✓ Thank you ${customer.fullName}! Your reference code: ${txnCode}`);
        } else {
            showMessage('Payment was successful, but we could not record it to the server. Saving locally.');
        }
    } else if (!customer && typeof sendPaymentConfirmationEmail === 'function') {
        sendPaymentConfirmationEmail(subscription, payer);
    }

    if (typeof sendWelcomeEmail === 'function') {
        sendWelcomeEmail(payer);
    }

    showMessage(`✓ Welcome to ${planId === 'pro' ? 'Pro' : 'Annual'} plan! Your payment was successful.`);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Record payment on server
async function recordPaymentOnServer(customerId, subscription) {
    try {
        const payload = {
            customerId,
            planId: subscription.planId,
            planName: subscription.planName || (subscription.planId === 'pro' ? 'Pro Monthly' : 'Annual Plan'),
            amount: subscription.amount,
            currency: 'USD',
            paypalOrderId: subscription.paymentId,
            paypalPayerId: subscription.payerEmail
        };
        const response = await fetch('/api/payments/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        return { success: response.ok && data.success, ...data };
    } catch (error) {
        console.warn('Payment record failed:', error);
        return { success: false, message: 'Unable to record payment to server' };
    }
}

// Check if user has active subscription
function getSubscription() {
    try {
        const subscription = JSON.parse(localStorage.getItem('myWebcodeSubscription'));
        return subscription;
    } catch {
        return null;
    }
}

// Check if user has premium access
function isPremiumUser() {
    const user = getUser();
    return user && user.isPremium === true;
}

// Unlock premium features
function unlockPremiumFeatures() {
    if (isPremiumUser()) {
        // Enable playground
        const playgroundLink = document.querySelector('a[href="playground.html"]');
        if (playgroundLink) playgroundLink.style.opacity = '1';

        // Show pro badge
        const cards = document.querySelectorAll('.course-card');
        cards.forEach(card => {
            if (card.dataset.premium) {
                card.classList.remove('locked');
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only render PayPal buttons on pricing page
    if (document.getElementById('paypal-button-pro')) {
        // Check if PayPal SDK is loaded
        if (typeof paypal !== 'undefined') {
            initPayPalButtons();
        } else {
            console.error('PayPal SDK not loaded');
        }
    }

    // Unlock premium features on other pages
    unlockPremiumFeatures();

    // Display refund policies if on pricing page
    if (typeof showRefundPolicies === 'function') {
        showRefundPolicies();
    }

    // Process email queue
    if (typeof processEmailQueue === 'function') {
        processEmailQueue();
    }
});

// Show premium-only features when user signs in
function onUserSignIn() {
    unlockPremiumFeatures();
}
