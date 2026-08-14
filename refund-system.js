// Refund and Return Management System
const refundKey = 'myWebcodeRefunds';
const refundPolicyKey = 'myWebcodeRefundPolicy';

// Refund policies
const refundPolicies = {
    pro: {
        daysAllowed: 7,
        refundPercentage: 100,
        description: '7-day money-back guarantee for Pro monthly plan'
    },
    annual: {
        daysAllowed: 30,
        refundPercentage: 100,
        description: '30-day money-back guarantee for Annual plan'
    }
};

// Request refund
function requestRefund(paymentId, reason) {
    const user = getUser();
    if (!user) {
        showMessage('Please sign in to request a refund');
        return false;
    }

    const payments = getAllPayments();
    const payment = payments.find(p => p.paymentId === paymentId);

    if (!payment) {
        showMessage('Payment not found');
        return false;
    }

    // Check refund eligibility
    const eligibility = checkRefundEligibility(payment);
    if (!eligibility.eligible) {
        showMessage(eligibility.reason);
        return false;
    }

    // Create refund request
    const refund = {
        id: generateRefundId(),
        paymentId: paymentId,
        userId: user.email,
        amount: payment.amount,
        reason: reason,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        policy: refundPolicies[payment.planId]
    };

    const refunds = getAllRefunds();
    refunds.push(refund);
    localStorage.setItem(refundKey, JSON.stringify(refunds));

    // Send notification email
    sendRefundRequestEmail(refund, user);

    showMessage('Refund request submitted. We\'ll process it within 3-5 business days.');
    return true;
}

// Check refund eligibility
function checkRefundEligibility(payment) {
    const policy = refundPolicies[payment.planId];
    if (!policy) {
        return { eligible: false, reason: 'Plan not eligible for refund' };
    }

    const purchaseDate = new Date(payment.timestamp);
    const currentDate = new Date();
    const daysSincePurchase = Math.floor((currentDate - purchaseDate) / (1000 * 60 * 60 * 24));

    if (daysSincePurchase > policy.daysAllowed) {
        return {
            eligible: false,
            reason: `Refund window has expired. Refunds are available within ${policy.daysAllowed} days of purchase.`
        };
    }

    return { eligible: true };
}

// Process refund
function processRefund(refundId, approvalNotes = '') {
    const refunds = getAllRefunds();
    const refund = refunds.find(r => r.id === refundId);

    if (!refund) {
        console.error('Refund not found');
        return false;
    }

    // In a real app, integrate with PayPal API to process refund
    refund.status = 'approved';
    refund.approvedAt = new Date().toISOString();
    refund.approvalNotes = approvalNotes;
    refund.refundDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days

    localStorage.setItem(refundKey, JSON.stringify(refunds));

    // Send confirmation email
    const user = getUser();
    if (user && user.email === refund.userId) {
        sendRefundConfirmationEmail(refund, user);
    }

    return true;
}

// Deny refund
function denyRefund(refundId, denialReason) {
    const refunds = getAllRefunds();
    const refund = refunds.find(r => r.id === refundId);

    if (!refund) return false;

    refund.status = 'denied';
    refund.deniedAt = new Date().toISOString();
    refund.denialReason = denialReason;

    localStorage.setItem(refundKey, JSON.stringify(refunds));

    // Send notification
    const user = getUser();
    if (user && user.email === refund.userId) {
        showMessage(`Refund request denied: ${denialReason}`);
    }

    return true;
}

// Get all refunds
function getAllRefunds() {
    try {
        return JSON.parse(localStorage.getItem(refundKey)) || [];
    } catch {
        return [];
    }
}

// Get user's refunds
function getUserRefunds() {
    const user = getUser();
    if (!user) return [];
    return getAllRefunds().filter(r => r.userId === user.email);
}

// Get refund status
function getRefundStatus(refundId) {
    const refund = getAllRefunds().find(r => r.id === refundId);
    return refund ? refund.status : null;
}

// Generate refund ID
function generateRefundId() {
    return 'REF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Display refund policy
function getRefundPolicyText(planId) {
    const policy = refundPolicies[planId];
    if (!policy) return '';

    return `
        <div class="refund-policy">
            <h4>Money-Back Guarantee</h4>
            <p>${policy.description}</p>
            <ul>
                <li>Request refund within ${policy.daysAllowed} days of purchase</li>
                <li>${policy.refundPercentage}% refund on all plans</li>
                <li>Refund processed within 3-5 business days</li>
                <li>No questions asked</li>
            </ul>
        </div>
    `;
}

// Send refund request notification email
function sendRefundRequestEmail(refund, user) {
    const subject = 'Refund Request Received - My Webcode';
    const message = `
        Hi ${user.name},
        
        We've received your refund request for your ${refund.policy.description.toLowerCase()}.
        
        Refund Details:
        - Refund ID: ${refund.id}
        - Amount: $${refund.amount}
        - Reason: ${refund.reason}
        - Status: Pending Review
        
        We'll review your request and contact you within 1-2 business days.
        
        If you have any questions, please contact our support team.
    `;

    queueEmail('refundRequest', user.email, {
        refund: refund,
        user: user
    });
}

// Show refund UI on pricing page
function showRefundPolicies() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const planButton = card.querySelector('.plan-button');
        if (planButton) {
            const planId = planButton.dataset.plan;
            if (refundPolicies[planId]) {
                const policyHTML = getRefundPolicyText(planId);
                card.insertAdjacentHTML('beforeend', policyHTML);
            }
        }
    });
}

// Initialize refund system
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pricing-hero') || document.body.id === 'pricing') {
        showRefundPolicies();
    }
});
