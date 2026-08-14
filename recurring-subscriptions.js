// Recurring Subscription Management with PayPal Billing Plans
const recurringSubscriptionKey = 'myWebcodeRecurringSubscription';

// Subscription configuration
const recurringPlans = {
    pro: {
        id: 'pro-monthly',
        name: 'Pro Monthly',
        amount: '9.99',
        currency: 'USD',
        frequency: 'MONTH',
        frequencyCount: 1,
        billingCycles: 0, // 0 = infinite
        description: 'Pro Monthly subscription with unlimited access to premium features'
    },
    annual: {
        id: 'annual',
        name: 'Annual Plan',
        amount: '99.99',
        currency: 'USD',
        frequency: 'YEAR',
        frequencyCount: 1,
        billingCycles: 0,
        description: 'Annual subscription with all premium features'
    }
};

// Initialize PayPal Billing Plans Buttons
function initPayPalSubscriptionButtons() {
    // PayPal subscription buttons configuration
    const subscriptionConfig = {
        pro: {
            planId: 'I-YOUR_PRO_PLAN_ID', // Get from PayPal
            vault: true,
            intent: 'subscription',
            style: {
                size: 'responsive',
                color: 'blue',
                shape: 'pill',
                label: 'subscribe'
            }
        },
        annual: {
            planId: 'I-YOUR_ANNUAL_PLAN_ID', // Get from PayPal
            vault: true,
            intent: 'subscription',
            style: {
                size: 'responsive',
                color: 'blue',
                shape: 'pill',
                label: 'subscribe'
            }
        }
    };

    // Create Pro subscription button
    if (document.getElementById('paypal-subscription-pro')) {
        try {
            paypal.Buttons({
                createSubscription: (data, actions) => {
                    return actions.subscription.create({
                        plan_id: subscriptionConfig.pro.planId,
                        custom_id: getUser()?.email || 'guest',
                        payer: {
                            name: {
                                given_name: getUser()?.name || 'User'
                            },
                            email_address: getUser()?.email || ''
                        }
                    });
                },
                onApprove: (data, actions) => {
                    handleSubscriptionApproval(data, 'pro');
                },
                onError: (err) => {
                    console.error('Subscription error:', err);
                    showMessage('Subscription setup failed. Please try again.');
                }
            }).render('#paypal-subscription-pro');
        } catch (e) {
            console.error('Error initializing subscription button:', e);
        }
    }

    // Create Annual subscription button
    if (document.getElementById('paypal-subscription-annual')) {
        try {
            paypal.Buttons({
                createSubscription: (data, actions) => {
                    return actions.subscription.create({
                        plan_id: subscriptionConfig.annual.planId,
                        custom_id: getUser()?.email || 'guest',
                        payer: {
                            name: {
                                given_name: getUser()?.name || 'User'
                            },
                            email_address: getUser()?.email || ''
                        }
                    });
                },
                onApprove: (data, actions) => {
                    handleSubscriptionApproval(data, 'annual');
                },
                onError: (err) => {
                    console.error('Subscription error:', err);
                    showMessage('Subscription setup failed. Please try again.');
                }
            }).render('#paypal-subscription-annual');
        } catch (e) {
            console.error('Error initializing subscription button:', e);
        }
    }
}

// Handle subscription approval
function handleSubscriptionApproval(data, planId) {
    const user = getUser();
    if (!user) {
        showMessage('Please sign in to complete subscription');
        return;
    }

    const subscription = {
        subscriptionId: data.subscriptionID,
        planId: planId,
        userId: user.email,
        userName: user.name,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        nextBillingDate: calculateNextBillingDate(planId),
        amount: recurringPlans[planId].amount,
        frequency: recurringPlans[planId].frequency
    };

    // Save subscription
    localStorage.setItem(recurringSubscriptionKey, JSON.stringify(subscription));

    // Update user
    user.hasRecurringSubscription = true;
    user.subscriptionId = data.subscriptionID;
    localStorage.setItem('myWebcodeUser', JSON.stringify(user));

    // Send welcome email
    sendWelcomeEmail(user);

    // Send payment confirmation
    sendPaymentConfirmationEmail(
        { ...subscription, paymentId: data.subscriptionID },
        user
    );

    showMessage('✓ Subscription activated! Welcome to premium!');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
}

// Get active subscription
function getActiveSubscription() {
    try {
        const subscription = JSON.parse(localStorage.getItem(recurringSubscriptionKey));
        return subscription && subscription.status === 'ACTIVE' ? subscription : null;
    } catch {
        return null;
    }
}

// Check if user has active subscription
function hasActiveSubscription() {
    return getActiveSubscription() !== null;
}

// Calculate next billing date
function calculateNextBillingDate(planId) {
    const date = new Date();
    if (planId === 'annual') {
        date.setFullYear(date.getFullYear() + 1);
    } else {
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString();
}

// Suspend subscription
function suspendSubscription(reason = '') {
    const subscription = getActiveSubscription();
    if (!subscription) {
        showMessage('No active subscription to suspend');
        return false;
    }

    subscription.status = 'SUSPENDED';
    subscription.suspendedAt = new Date().toISOString();
    subscription.suspensionReason = reason;

    localStorage.setItem(recurringSubscriptionKey, JSON.stringify(subscription));

    // In real app, make API call to PayPal to suspend
    console.log('Subscription suspended:', subscription.subscriptionId);

    return true;
}

// Resume subscription
function resumeSubscription() {
    const subscription = getActiveSubscription();
    if (!subscription) {
        showMessage('No suspended subscription to resume');
        return false;
    }

    subscription.status = 'ACTIVE';
    subscription.resumedAt = new Date().toISOString();
    delete subscription.suspendedAt;

    localStorage.setItem(recurringSubscriptionKey, JSON.stringify(subscription));

    // In real app, make API call to PayPal to resume
    console.log('Subscription resumed:', subscription.subscriptionId);

    return true;
}

// Cancel subscription
function cancelRecurringSubscription(reason = '') {
    const subscription = getActiveSubscription();
    if (!subscription) {
        showMessage('No active subscription to cancel');
        return false;
    }

    const user = getUser();
    const cancellation = {
        subscriptionId: subscription.subscriptionId,
        planId: subscription.planId,
        userId: user?.email,
        reason: reason,
        canceledAt: new Date().toISOString(),
        status: 'CANCELLED',
        refundStatus: 'pending'
    };

    subscription.status = 'CANCELLED';
    subscription.canceledAt = new Date().toISOString();
    subscription.cancellationReason = reason;

    localStorage.setItem(recurringSubscriptionKey, JSON.stringify(subscription));

    // Store cancellation record
    let cancellations = JSON.parse(localStorage.getItem('myWebcodeCancellations') || '[]');
    cancellations.push(cancellation);
    localStorage.setItem('myWebcodeCancellations', JSON.stringify(cancellations));

    // Remove premium status
    if (user) {
        user.isPremium = false;
        localStorage.setItem('myWebcodeUser', JSON.stringify(user));

        // Send cancellation email
        sendCancellationEmail(cancellation, user);
    }

    // In real app, make API call to PayPal to cancel
    console.log('Subscription canceled:', subscription.subscriptionId);

    return true;
}

// Get billing history
function getBillingHistory() {
    try {
        return JSON.parse(localStorage.getItem('myWebcodeBillingHistory') || '[]');
    } catch {
        return [];
    }
}

// Add billing record
function addBillingRecord(record) {
    const history = getBillingHistory();
    history.push({
        id: generatePaymentId(),
        ...record,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('myWebcodeBillingHistory', JSON.stringify(history));
}

// Display subscription info
function displaySubscriptionInfo() {
    const subscription = getActiveSubscription();
    const container = document.querySelector('[data-subscription-status]');

    if (!container) return;

    if (subscription) {
        const plan = recurringPlans[subscription.planId];
        const nextBilling = new Date(subscription.nextBillingDate).toLocaleDateString();

        container.innerHTML = `
            <div class="subscription-details">
                <h3>${plan.name}</h3>
                <p><strong>Status:</strong> <span class="badge-active">${subscription.status}</span></p>
                <p><strong>Amount:</strong> $${subscription.amount}/${subscription.frequency.toLowerCase()}</p>
                <p><strong>Next Billing Date:</strong> ${nextBilling}</p>
                <p><strong>Subscription ID:</strong> ${subscription.subscriptionId}</p>
                <div class="subscription-actions">
                    <button onclick="suspendSubscription()" class="action-button">Pause Subscription</button>
                    <button onclick="showCancelDialog()" class="action-button danger">Cancel Subscription</button>
                    <a href="payment-history.html" class="button">View Billing</a>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <p>No active subscription</p>
            <a href="pricing.html" class="button">Get Started</a>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof paypal !== 'undefined' && document.body.id === 'pricing') {
        // For future enhancement - currently using regular buttons
        // initPayPalSubscriptionButtons();
    }

    displaySubscriptionInfo();
});
