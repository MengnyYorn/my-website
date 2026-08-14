// Customer Authentication System
// Handles registration, OTP verification, login, and transaction codes

const customerKey = 'myWebcodeCustomer';
const appUserKey = 'myWebcodeUser';
const customersDbKey = 'myWebcodeCustomersDb';
const otpKey = 'myWebcodeOTP';
const transactionCodeKey = 'myWebcodeTransactionCodes';

// ============ Registration & Customer Management ============

// Register new customer
function registerCustomer(formData) {
    // Validate input
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
        return { success: false, message: 'Please fill in all required fields' };
    }

    if (formData.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Check if customer already exists
    const existingCustomer = getCustomerByEmail(formData.email);
    if (existingCustomer) {
        return { success: false, message: 'An account with this email already exists' };
    }

    // Create customer object
    const customer = {
        id: generateCustomerId(),
        fullName: formData.fullName,
        email: formData.email,
        password: hashPassword(formData.password), // In production, use bcrypt on server
        phone: formData.phone,
        idType: formData.idType,
        idNumber: formData.idNumber,
        idPhoto: formData.idPhoto, // Base64 encoded image
        verified: false,
        otpVerified: false,
        registeredAt: new Date().toISOString(),
        lastLogin: null,
        status: 'pending_verification'
    };

    // Store customer in database
    const customers = getAllCustomers();
    customers.push(customer);
    localStorage.setItem(customersDbKey, JSON.stringify(customers));

    // Store current session (but not verified yet)
    syncCustomerSession({
        ...customer,
        password: undefined // Don't store password in session
    });

    // Generate and send OTP
    const otp = generateOTP();
    sendOTPEmail(customer.email, otp, customer.fullName);

    return {
        success: true,
        message: 'Registration successful! Check your email for OTP verification code.',
        customer: { id: customer.id, email: customer.email, fullName: customer.fullName }
    };
}

// Customer login
function loginCustomer(email, password) {
    const customer = getCustomerByEmail(email);

    if (!customer) {
        return { success: false, message: 'Email not found. Please register first.' };
    }

    if (!verifyPassword(password, customer.password)) {
        return { success: false, message: 'Incorrect password. Please try again.' };
    }

    if (!customer.otpVerified) {
        // Send new OTP for verification
        const otp = generateOTP();
        sendOTPEmail(customer.email, otp, customer.fullName);
        
        return {
            success: false,
            message: 'Please verify your email first. Check your email for OTP code.',
            requiresOTP: true,
            email: email
        };
    }

    // Update last login
    const customers = getAllCustomers();
    const customerIndex = customers.findIndex(c => c.email === email);
    if (customerIndex !== -1) {
        customers[customerIndex].lastLogin = new Date().toISOString();
        customers[customerIndex].status = 'active';
        localStorage.setItem(customersDbKey, JSON.stringify(customers));
    }

    // Store in session
    const sessionCustomer = { ...customer };
    delete sessionCustomer.password;
    syncCustomerSession(sessionCustomer);

    return {
        success: true,
        message: `Welcome back, ${customer.fullName}!`,
        customer: sessionCustomer
    };
}

// Logout customer
function logoutCustomer() {
    localStorage.removeItem(customerKey);
    localStorage.removeItem(appUserKey);
    return true;
}

// Get current logged-in customer
function getLoggedInCustomer() {
    try {
        return JSON.parse(localStorage.getItem(customerKey));
    } catch {
        return null;
    }
}

// Get customer by email
function getCustomerByEmail(email) {
    const customers = getAllCustomers();
    return customers.find(c => c.email === email.toLowerCase());
}

// Get all customers (admin function)
function getAllCustomers() {
    try {
        return JSON.parse(localStorage.getItem(customersDbKey)) || [];
    } catch {
        return [];
    }
}

// Generate customer ID
function generateCustomerId() {
    return 'CUST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Hash password (simple version - use bcrypt in production)
function hashPassword(password) {
    return btoa(password); // Base64 encoding - NOT SECURE, use proper hashing on server
}

// Verify password
function verifyPassword(password, hash) {
    return btoa(password) === hash;
}

// ============ OTP Management ============

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
function sendOTPEmail(email, otp, customerName) {
    const otpRecord = {
        id: 'OTP-' + Date.now(),
        email: email,
        code: otp,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        attempts: 0,
        verified: false
    };

    // Store OTP
    const otps = JSON.parse(localStorage.getItem(otpKey) || '[]');
    otps.push(otpRecord);
    localStorage.setItem(otpKey, JSON.stringify(otps.slice(-100))); // Keep last 100

    // Queue email
    const emailContent = `
        <h2>Email Verification Code</h2>
        <p>Hi ${customerName},</p>
        <p>Your one-time verification code is:</p>
        <h1 style="font-size: 2.5rem; letter-spacing: 0.2em; color: #4f46e5; font-weight: bold; margin: 1rem 0;">
            ${otp}
        </h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Security Note: Never share this code with anyone.</p>
    `;

    queueEmail('otpVerification', email, {
        subject: 'Your OTP Verification Code - My Webcode',
        body: emailContent,
        otp: otp,
        customerName: customerName
    });

    return otpRecord;
}

// Verify OTP
function verifyOTP(email, otpCode) {
    const otps = JSON.parse(localStorage.getItem(otpKey) || '[]');
    const otpRecord = otps.find(o => o.email === email && o.code === otpCode);

    if (!otpRecord) {
        return { success: false, message: 'Invalid OTP code' };
    }

    // Check if expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
        return { success: false, message: 'OTP has expired. Please request a new code.' };
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
        return { success: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    // Mark as verified
    otpRecord.verified = true;
    otpRecord.verifiedAt = new Date().toISOString();
    localStorage.setItem(otpKey, JSON.stringify(otps));

    // Update customer as OTP verified
    const customer = getCustomerByEmail(email);
    if (customer) {
        const customers = getAllCustomers();
        const customerIndex = customers.findIndex(c => c.email === email);
        if (customerIndex !== -1) {
            customers[customerIndex].otpVerified = true;
            customers[customerIndex].verified = true;
            customers[customerIndex].status = 'active';
            localStorage.setItem(customersDbKey, JSON.stringify(customers));
        }

        // Update session
        const sessionCustomer = getLoggedInCustomer();
        if (sessionCustomer) {
            sessionCustomer.otpVerified = true;
            sessionCustomer.verified = true;
            syncCustomerSession(sessionCustomer);
        }
    }

    return { success: true, message: 'Email verified successfully!' };
}

// Resend OTP
function resendOTP(email) {
    // Cancel old OTPs
    const otps = JSON.parse(localStorage.getItem(otpKey) || '[]');
    const customerOTPs = otps.filter(o => o.email === email);
    const lastOTP = customerOTPs[customerOTPs.length - 1];

    if (lastOTP && new Date(lastOTP.createdAt).getTime() > Date.now() - 60000) {
        return { success: false, message: 'Please wait 60 seconds before requesting a new code.' };
    }

    const customer = getCustomerByEmail(email);
    if (!customer) {
        return { success: false, message: 'Customer not found' };
    }

    const newOTP = generateOTP();
    sendOTPEmail(email, newOTP, customer.fullName);

    return { success: true, message: 'New OTP sent to your email' };
}

// ============ Backend API Helpers ============

async function apiRequest(path, body) {
    try {
        const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({ success: false, message: 'Unexpected server response' }));
        if (!response.ok) {
            return { ...data, success: false };
        }

        return { ...data, success: data.success !== false };
    } catch (error) {
        console.warn('Backend request failed:', error);
        return { success: false, message: 'Server unavailable. Falling back to offline mode.', serverUnavailable: true };
    }
}

async function serverRegisterCustomer(customerData) {
    const result = await apiRequest('/api/register', customerData);
    return result.serverUnavailable ? registerCustomer(customerData) : result;
}

async function serverLoginCustomer(email, password) {
    const result = await apiRequest('/api/login', { email, password });
    if (result.serverUnavailable) {
        return loginCustomer(email, password);
    }

    if (result.success && result.customer) {
        syncCustomerSession(result.customer);
    }

    return result;
}

function syncCustomerSession(customer) {
    const sessionCustomer = { ...customer };
    delete sessionCustomer.password;
    localStorage.setItem(customerKey, JSON.stringify(sessionCustomer));
    localStorage.setItem(appUserKey, JSON.stringify({
        name: sessionCustomer.fullName,
        email: sessionCustomer.email,
        customerId: sessionCustomer.id,
        signInAt: new Date().toISOString(),
        isPremium: sessionCustomer.isPremium || false,
        plan: sessionCustomer.plan || null
    }));
}

async function serverVerifyOTP(email, otpCode) {
    const result = await apiRequest('/api/verify-otp', { email, code: otpCode });
    if (result.serverUnavailable) {
        return verifyOTP(email, otpCode);
    }
    return result;
}

async function serverResendOTP(email) {
    const result = await apiRequest('/api/resend-otp', { email });
    if (result.serverUnavailable) {
        return resendOTP(email);
    }
    return result;
}

// ============ Transaction Codes ============

// Generate transaction/reference code
function generateTransactionCode(planId, customerId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    const code = `TXN-${planId.toUpperCase()}-${timestamp}-${random}`;

    const transaction = {
        code: code,
        customerId: customerId,
        planId: planId,
        createdAt: new Date().toISOString(),
        used: false,
        usedAt: null
    };

    // Store transaction code
    const codes = JSON.parse(localStorage.getItem(transactionCodeKey) || '[]');
    codes.push(transaction);
    localStorage.setItem(transactionCodeKey, JSON.stringify(codes));

    return code;
}

// Use transaction code
function useTransactionCode(code) {
    const codes = JSON.parse(localStorage.getItem(transactionCodeKey) || '[]');
    const transaction = codes.find(t => t.code === code);

    if (!transaction) {
        return { success: false, message: 'Invalid transaction code' };
    }

    if (transaction.used) {
        return { success: false, message: 'This code has already been used' };
    }

    transaction.used = true;
    transaction.usedAt = new Date().toISOString();
    localStorage.setItem(transactionCodeKey, JSON.stringify(codes));

    return { success: true, transaction: transaction };
}

// ============ Thank You Messages & Confirmations ============

// Send thank you email after payment
function sendPaymentThankYouEmail(paymentDetails, customer) {
    const txnCode = generateTransactionCode(paymentDetails.planId, customer.id);

    const thankYouEmail = `
        <h2>Thank You for Your Purchase! 🎉</h2>
        <p>Hi ${customer.fullName},</p>
        
        <p>We're thrilled to have you as a premium member! Your payment has been received and processed successfully.</p>

        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
            <h3 style="margin-top: 0; color: #312e81;">Order Confirmation</h3>
            <p><strong>Plan:</strong> ${paymentDetails.planId === 'pro' ? 'Pro Monthly' : 'Annual Subscription'}</p>
            <p><strong>Amount:</strong> $${paymentDetails.amount}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.paymentId}</p>
            <p><strong>Reference Code:</strong> <code style="background: #e0e7ff; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${txnCode}</code></p>
            <p><strong>Date:</strong> ${new Date(paymentDetails.timestamp).toLocaleString()}</p>
        </div>

        <h3>What's Included in Your Plan?</h3>
        <ul>
            <li>✓ Access to all premium courses</li>
            <li>✓ Advanced code playground editor</li>
            <li>✓ Verified certificates</li>
            <li>✓ Priority email support</li>
            <li>✓ Progress tracking & learning paths</li>
        </ul>

        <p><a href="https://yoursite.com/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: bold;">Start Learning Now</a></p>

        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p>Happy learning!<br>
        The My Webcode Team</p>
    `;

    queueEmail('paymentThankYou', customer.email, {
        subject: `Thank You for Your Purchase - Reference: ${txnCode}`,
        body: thankYouEmail,
        customer: customer,
        payment: paymentDetails,
        transactionCode: txnCode
    });

    return txnCode;
}

// Send invoice after payment
function sendPaymentInvoice(paymentDetails, customer) {
    const invoiceHTML = generateInvoiceHTML(paymentDetails, customer);

    queueEmail('paymentInvoice', customer.email, {
        subject: `Invoice #${paymentDetails.paymentId.slice(-8).toUpperCase()} - My Webcode`,
        body: invoiceHTML,
        customer: customer,
        payment: paymentDetails
    });
}

// Generate invoice HTML for email
function generateInvoiceHTML(payment, customer) {
    const date = new Date(payment.timestamp);
    
    return `
        <div style="font-family: Arial, sans-serif; color: #172033;">
            <h1 style="color: #4f46e5; margin-bottom: 1rem;">INVOICE</h1>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                <tr>
                    <td style="width: 50%;">
                        <strong>MY WEBCODE</strong><br>
                        Learning Platform<br>
                        Email: support@mywebcode.com
                    </td>
                    <td style="width: 50%; text-align: right;">
                        <strong>Invoice #:</strong> ${payment.paymentId.slice(-8).toUpperCase()}<br>
                        <strong>Invoice Date:</strong> ${date.toLocaleDateString()}<br>
                        <strong>Due Date:</strong> ${date.toLocaleDateString()}
                    </td>
                </tr>
            </table>

            <h3 style="color: #312e81; margin-bottom: 0.5rem;">INVOICE TO:</h3>
            <p style="margin: 0; margin-bottom: 1.5rem;">
                <strong>${customer.fullName}</strong><br>
                ${customer.email}<br>
                ${customer.phone}
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border: 1px solid #e2e8f0;">
                <thead style="background: #f8fafc;">
                    <tr>
                        <th style="padding: 0.75rem; text-align: left; border: 1px solid #e2e8f0;">Description</th>
                        <th style="padding: 0.75rem; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">
                            ${payment.planId === 'pro' ? 'Pro Monthly Subscription' : 'Annual Subscription'}
                        </td>
                        <td style="padding: 0.75rem; text-align: right; border: 1px solid #e2e8f0;">
                            $${payment.amount}
                        </td>
                    </tr>
                    <tr style="background: #f8fafc; font-weight: bold;">
                        <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">TOTAL</td>
                        <td style="padding: 0.75rem; text-align: right; border: 1px solid #e2e8f0;">
                            $${payment.amount}
                        </td>
                    </tr>
                </tbody>
            </table>

            <p style="color: #64748b; font-size: 0.85rem;">
                Payment ID: ${payment.paymentId}<br>
                Status: ${payment.status}<br>
                <strong>Please keep this invoice for your records.</strong>
            </p>
        </div>
    `;
}

// ============ Form Handling ============

// Handle registration form submission
document.addEventListener('DOMContentLoaded', () => {
    // Registration form
    const registrationForm = document.querySelector('[data-login-form]');
    if (registrationForm) {
        // Handle file upload preview
        const idPhotoInput = document.getElementById('idPhoto');
        if (idPhotoInput) {
            idPhotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    document.getElementById('idPhotoName').textContent = file.name;
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const preview = document.getElementById('idPhotoPreview');
                        preview.src = event.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registrationForm);
            
            // Read file as base64
            const idPhotoFile = document.getElementById('idPhoto').files[0];
            if (idPhotoFile) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const customerData = {
                        fullName: formData.get('fullName'),
                        email: formData.get('email'),
                        password: formData.get('password'),
                        phone: formData.get('phone'),
                        idType: formData.get('idType'),
                        idNumber: formData.get('idNumber'),
                        idPhoto: event.target.result
                    };

                    const result = await serverRegisterCustomer(customerData);
                    if (result.success) {
                        showMessage(result.message);
                        setTimeout(() => {
                            window.location.href = 'otp-verify.html?email=' + encodeURIComponent(customerData.email);
                        }, 2000);
                    } else {
                        showMessage(result.message);
                    }
                };
                reader.readAsDataURL(idPhotoFile);
            }
        });
    }

    // Login form
    const loginForm = document.querySelector('[data-customer-signin]');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');

            const result = await serverLoginCustomer(email, password);
            if (result.success) {
                showMessage(result.message);
                setTimeout(() => {
                    window.location.href = 'payment-history.html';
                }, 1500);
            } else if (result.requiresOTP) {
                showMessage(result.message);
                setTimeout(() => {
                    window.location.href = 'otp-verify.html?email=' + encodeURIComponent(email);
                }, 2000);
            } else {
                showMessage(result.message);
            }
        });
    }

    // OTP verification form
    const otpForm = document.querySelector('[data-otp-verify]');
    if (otpForm) {
        const otpInputs = document.querySelectorAll('.otp-digit-input');
        
        // OTP input handling
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value) {
                    e.target.classList.add('filled');
                    if (index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });
        });

        // Countdown timer
        let timeLeft = 60;
        const timerElement = document.getElementById('timer');
        const timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = 'Resend';
            }
        }, 1000);

        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const otpCode = Array.from(otpInputs).map(input => input.value).join('');
            const referenceCode = document.getElementById('referenceCode').value;
            
            const urlParams = new URLSearchParams(window.location.search);
            const email = urlParams.get('email');

            if (otpCode.length !== 6) {
                showMessage('Please enter a 6-digit code');
                return;
            }

            const result = await serverVerifyOTP(email, otpCode);
            if (result.success) {
                showMessage('✓ Email verified! Welcome aboard!');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(result.message);
            }
        });
    }
});

// Resend OTP function
async function resendOTP() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (!email) {
        showMessage('Email not found');
        return;
    }

    const result = resendOTP(email);
    showMessage(result.message);
}
