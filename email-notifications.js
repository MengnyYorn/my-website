// Email Notification System
const emailQueue = 'myWebcodeEmailQueue';

// Email Templates
const emailTemplates = {
    paymentConfirmation: {
        subject: 'Payment Confirmed - My Webcode',
        template: (payment, user) => `
            <h2>Payment Confirmed</h2>
            <p>Thank you for your purchase!</p>
            <p><strong>Plan:</strong> ${payment.planId === 'pro' ? 'Pro Monthly' : 'Annual'}</p>
            <p><strong>Amount:</strong> $${payment.amount}</p>
            <p><strong>Transaction ID:</strong> ${payment.paymentId}</p>
            <p>Your account has been upgraded. You can now access all premium features.</p>
            <a href="https://yoursite.com/dashboard" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        `
    },
    paymentThankYou: {
        subject: 'Thank You for Your Purchase',
        template: (payment, user) => `<p>Thank you message</p>`
    },
    paymentInvoice: {
        subject: 'Your Invoice',
        template: (payment, user) => `<p>Invoice</p>`
    },
    otpVerification: {
        subject: 'Your OTP Verification Code',
        template: (data) => `
            <h2>Email Verification</h2>
            <p>Your OTP code is: ${data.otp}</p>
        `
    },
    renewalReminder: {
        subject: 'Your Subscription Renews Soon - My Webcode',
        template: (subscription, user) => `
            <h2>Subscription Renewal Reminder</h2>
            <p>Hi ${user.name},</p>
            <p>Your ${subscription.planId === 'pro' ? 'Pro' : 'Annual'} subscription will renew in 3 days.</p>
            <p><strong>Renewal Amount:</strong> $${subscription.amount}</p>
            <p>No action required. We'll process the payment automatically.</p>
            <p>If you'd like to manage your subscription, visit your account page.</p>
        `
    },
    cancellationConfirmation: {
        subject: 'Subscription Canceled - My Webcode',
        template: (cancellation, user) => `
            <h2>Subscription Canceled</h2>
            <p>Hi ${user.name},</p>
            <p>Your subscription has been canceled as requested.</p>
            <p>You'll have access until the end of your current billing period.</p>
            <p>We'd love to hear why you canceled. Your feedback: ${cancellation.reason}</p>
            <p>You can resubscribe anytime. We'll miss you!</p>
        `
    },
    invoiceEmail: {
        subject: 'Your Invoice - My Webcode',
        template: (payment, user) => `
            <h2>Invoice for Your Purchase</h2>
            <p>Hi ${user.name},</p>
            <p>Please see the attached invoice for your recent payment.</p>
            <p><strong>Invoice Number:</strong> ${payment.id}</p>
            <p><strong>Amount:</strong> $${payment.amount}</p>
            <p><strong>Date:</strong> ${new Date(payment.timestamp).toLocaleDateString()}</p>
        `
    },
    welcomeEmail: {
        subject: 'Welcome to My Webcode Premium',
        template: (user) => `
            <h2>Welcome to My Webcode Premium!</h2>
            <p>Hi ${user.name},</p>
            <p>Welcome to our premium community of learners!</p>
            <h3>What's Included:</h3>
            <ul>
                <li>Access to all premium courses</li>
                <li>Advanced code playground</li>
                <li>Verified certificates</li>
                <li>Priority support</li>
                <li>Progress tracking</li>
            </ul>
            <p>Start learning: <a href="https://yoursite.com/dashboard">Open Dashboard</a></p>
        `
    },
    refundConfirmation: {
        subject: 'Refund Processed - My Webcode',
        template: (refund, user) => `
            <h2>Refund Confirmation</h2>
            <p>Hi ${user.name},</p>
            <p>Your refund has been processed successfully.</p>
            <p><strong>Amount:</strong> $${refund.amount}</p>
            <p><strong>Refund ID:</strong> ${refund.id}</p>
            <p>The funds should appear in your account within 3-5 business days.</p>
        `
    }
};

// Queue email notification
function queueEmail(type, recipient, data = {}) {
    const template = emailTemplates[type];
    if (!template) {
        console.error('Email template not found:', type);
        return false;
    }

    const email = {
        id: generateEmailId(),
        type: type,
        recipient: recipient,
        subject: template.subject,
        body: template.template(data.payment || data.subscription || data.cancellation || data.refund || {}, data.user || {}),
        data: data,
        timestamp: new Date().toISOString(),
        status: 'queued'
    };

    const queue = getEmailQueue();
    queue.push(email);
    localStorage.setItem(emailQueue, JSON.stringify(queue));

    return true;
}

// Get email queue
function getEmailQueue() {
    try {
        return JSON.parse(localStorage.getItem(emailQueue)) || [];
    } catch {
        return [];
    }
}

// Send queued emails (in real app, this would hit backend)
function processEmailQueue() {
    const queue = getEmailQueue();
    const pending = queue.filter(e => e.status === 'queued');

    pending.forEach(email => {
        // In a real application, send via API to backend
        console.log(`Sending ${email.type} email to ${email.recipient}`);
        
        // Simulate send
        email.status = 'sent';
        email.sentAt = new Date().toISOString();

        // Log for debugging
        logEmailSend(email);
    });

    localStorage.setItem(emailQueue, JSON.stringify(queue));
}

// Log email send (for analytics/debugging)
function logEmailSend(email) {
    const logs = JSON.parse(localStorage.getItem('myWebcodeEmailLogs') || '[]');
    logs.push({
        id: email.id,
        type: email.type,
        recipient: email.recipient,
        sentAt: email.sentAt,
        status: 'sent'
    });
    localStorage.setItem('myWebcodeEmailLogs', JSON.stringify(logs.slice(-100))); // Keep last 100
}

// Generate email ID
function generateEmailId() {
    return 'EMAIL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Send email on payment success
function sendPaymentConfirmationEmail(paymentDetails, user) {
    return queueEmail('paymentConfirmation', user.email, {
        payment: paymentDetails,
        user: user
    });
}

// Send welcome email
function sendWelcomeEmail(user) {
    return queueEmail('welcomeEmail', user.email, { user: user });
}

// Send cancellation email
function sendCancellationEmail(cancellation, user) {
    return queueEmail('cancellationConfirmation', user.email, {
        cancellation: cancellation,
        user: user
    });
}

// Send invoice email
function sendInvoiceEmail(payment, user) {
    return queueEmail('invoiceEmail', payment.payerEmail, {
        payment: payment,
        user: user
    });
}

// Send refund confirmation
function sendRefundConfirmationEmail(refund, user) {
    return queueEmail('refundConfirmation', user.email, {
        refund: refund,
        user: user
    });
}

// Initialize email processing (run periodically)
function initEmailProcessing() {
    // Process emails every 30 seconds
    setInterval(() => {
        processEmailQueue();
    }, 30000);

    // Process immediately on page load
    processEmailQueue();
}

// Start email processing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailProcessing);
} else {
    initEmailProcessing();
}
