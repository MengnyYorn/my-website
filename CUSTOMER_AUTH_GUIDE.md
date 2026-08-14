# Customer Authentication & Payment System - Complete Guide

## Overview
Your website now includes a complete customer authentication system with:
- Email/Password registration and login
- ID card verification
- One-Time Password (OTP) verification via email
- Transaction/Reference codes for orders
- Automatic thank you messages after payment
- Invoice generation and email notifications

## Features

### 1. **Customer Registration** (`customer-register.html`)
- Full name, email, password registration
- Phone number collection
- ID card verification:
  - ID type selection (Passport, National ID, Driver's License, Voter ID)
  - ID number input
  - ID card photo upload with preview
- Automatic OTP generation after registration

### 2. **Customer Login** (`customer-login.html`)
- Email and password sign-in
- OTP verification for new sessions
- Session management

### 3. **OTP Verification** (`otp-verify.html`)
- 6-digit OTP input (digital keypad style)
- 10-minute expiration timer
- Resend OTP option with 60-second cooldown
- Transaction code verification field
- Auto-focus between OTP digits

### 4. **Transaction Codes**
- Unique reference codes generated for each payment
- Format: `TXN-[PLAN]-[TIMESTAMP]-[RANDOM]`
- Example: `TXN-PRO-156789-A7K9X2`
- Used for order tracking and customer support

### 5. **Thank You Messages**
- Automatic thank you email after payment
- Includes transaction reference code
- Contains plan details and next steps
- Professional email template with branding

### 6. **Database System**
All customer data stored in localStorage:
- Customer profiles with verification status
- OTP records with expiration times
- Transaction codes and usage tracking
- Login history and session data

## File Structure

```
my-website/
├── customer-register.html          # Registration page with ID verification
├── customer-login.html             # Login page
├── otp-verify.html                 # OTP verification page
├── customer-auth.js                # Authentication logic
├── email-notifications.js          # Updated with OTP & thank you emails
├── paypal-integration.js           # Updated with transaction codes
├── app.js                          # Main app (updated)
├── styles.css                      # Updated styling
└── pricing.html                    # Updated with customer login link
```

## Setup Instructions

### Step 1: Files are Ready
All files have been created. No additional setup needed for basic functionality.

### Step 2: (Optional) Email Service Integration
Currently, emails are queued in localStorage. For production:

```javascript
// In customer-auth.js, update queueEmail to actual SMTP:
fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        to: email,
        subject: subject,
        html: emailContent
    })
});
```

### Step 3: (Optional) Secure Password Storage
Currently uses Base64 encoding. For production, use:
- Backend: bcrypt or Argon2 for password hashing
- HTTPS only
- Secure session management

### Step 4: (Optional) ID Verification Service
Integrate with third-party services:
- AWS Rekognition for image verification
- Manual review process
- ID number validation APIs

## User Flow

### Registration Flow
```
1. User visits customer-register.html
2. Fills form: name, email, password, phone
3. Uploads ID card photo
4. Submits form
5. Customer record created
6. OTP generated and sent via email
7. Redirects to otp-verify.html
8. User enters 6-digit OTP
9. Email verified
10. Account activated
```

### Login Flow
```
1. User visits customer-login.html
2. Enters email and password
3. System checks credentials
4. If valid and OTP verified:
   - Login successful
   - Redirect to payment-history.html
5. If valid but not OTP verified:
   - Send new OTP
   - Redirect to otp-verify.html
6. If invalid:
   - Show error message
```

### Payment Flow
```
1. Customer logged in
2. Visits pricing.html
3. Selects plan (Pro or Annual)
4. Completes PayPal payment
5. Payment confirmed
6. Thank you email sent with:
   - Order confirmation
   - Transaction code (e.g., TXN-PRO-156789-A7K9X2)
   - Next steps
7. Invoice email sent
8. Redirected to dashboard
```

## JavaScript API Reference

### Authentication Functions

#### `registerCustomer(formData)`
Register a new customer
```javascript
const result = registerCustomer({
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'secure123',
    phone: '+1-555-1234',
    idType: 'passport',
    idNumber: 'AB123456',
    idPhoto: 'base64_image_data'
});

if (result.success) {
    console.log(result.message);
    // Redirect to OTP verification
}
```

#### `loginCustomer(email, password)`
Login customer
```javascript
const result = loginCustomer('john@example.com', 'secure123');

if (result.success) {
    console.log('Logged in:', result.customer);
} else if (result.requiresOTP) {
    console.log('OTP required');
}
```

#### `getLoggedInCustomer()`
Get current customer
```javascript
const customer = getLoggedInCustomer();
if (customer) {
    console.log(customer.fullName, customer.email);
}
```

#### `logoutCustomer()`
Logout current customer
```javascript
logoutCustomer();
// Redirects to login page
```

### OTP Functions

#### `generateOTP()`
Generate random 6-digit OTP
```javascript
const otp = generateOTP(); // Returns: "462839"
```

#### `verifyOTP(email, otpCode)`
Verify OTP code
```javascript
const result = verifyOTP('john@example.com', '462839');

if (result.success) {
    console.log('Email verified!');
}
```

#### `resendOTP(email)`
Resend OTP (60-second cooldown)
```javascript
const result = resendOTP('john@example.com');
if (result.success) {
    console.log('New OTP sent');
}
```

### Transaction Code Functions

#### `generateTransactionCode(planId, customerId)`
Generate unique transaction code
```javascript
const code = generateTransactionCode('pro', 'CUST-123-456');
// Returns: "TXN-PRO-156789-A7K9X2"
```

#### `useTransactionCode(code)`
Mark transaction code as used
```javascript
const result = useTransactionCode('TXN-PRO-156789-A7K9X2');
if (result.success) {
    console.log('Code used');
}
```

### Thank You Email Functions

#### `sendPaymentThankYouEmail(paymentDetails, customer)`
Send thank you email with transaction code
```javascript
const txnCode = sendPaymentThankYouEmail(
    {
        planId: 'pro',
        amount: '9.99',
        paymentId: 'PAY-123',
        timestamp: new Date().toISOString()
    },
    customer
);
// Returns transaction code: "TXN-PRO-156789-A7K9X2"
```

#### `sendPaymentInvoice(paymentDetails, customer)`
Send invoice email
```javascript
sendPaymentInvoice(paymentDetails, customer);
```

## Email Templates

### OTP Email
```
Subject: Your OTP Verification Code - My Webcode

Hi [Customer Name],

Your one-time verification code is:

462839

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Security Note: Never share this code with anyone.
```

### Thank You Email
```
Subject: Thank You for Your Purchase! 🎉

Hi [Customer Name],

We're thrilled to have you as a premium member!

Order Confirmation:
- Plan: Pro Monthly / Annual Subscription
- Amount: $9.99 or $99.99
- Transaction ID: PAY-123456
- Reference Code: TXN-PRO-156789-A7K9X2

What's Included in Your Plan:
✓ Access to all premium courses
✓ Advanced code playground editor
✓ Verified certificates
✓ Priority email support
✓ Progress tracking & learning paths

[Start Learning Now Button]

If you have any questions, please don't hesitate to contact our support team.

Happy learning!
The My Webcode Team
```

### Invoice Email
```
Subject: Invoice #156789 - My Webcode

[Professional invoice HTML]
- Customer details
- Order details
- Amount breakdown
- Payment information
```

## LocalStorage Keys

```
myWebcodeCustomer                  - Current logged-in customer
myWebcodeCustomersDb               - All customers database
myWebcodeOTP                       - OTP records
myWebcodeTransactionCodes          - Transaction code history
myWebcodeEmailQueue                - Queued emails
myWebcodeEmailLogs                 - Email send history
```

## Customer Object Structure

```javascript
{
    id: "CUST-1234567890-abc123",
    fullName: "John Doe",
    email: "john@example.com",
    password: "base64_encoded", // NOT stored in session
    phone: "+1-555-1234",
    idType: "passport",
    idNumber: "AB123456",
    idPhoto: "base64_image_data",
    verified: true,
    otpVerified: true,
    registeredAt: "2026-07-23T10:30:00Z",
    lastLogin: "2026-07-23T14:45:00Z",
    status: "active" // pending_verification, active, suspended
}
```

## Transaction Code Format

```
TXN-[PLAN]-[TIMESTAMP]-[RANDOM]

Examples:
TXN-PRO-156789-A7K9X2
TXN-ANNUAL-456123-K8L2P5
TXN-FREE-789456-M9N3Q1

Where:
- PLAN = pro, annual, free
- TIMESTAMP = Last 6 digits of Unix timestamp
- RANDOM = Random alphanumeric string
```

## Error Handling

### Registration Errors
```javascript
{
    success: false,
    message: "Please fill in all required fields" | 
             "Password must be at least 6 characters" |
             "An account with this email already exists"
}
```

### Login Errors
```javascript
{
    success: false,
    message: "Email not found. Please register first." |
             "Incorrect password. Please try again." |
             "Please verify your email first."
}
```

### OTP Errors
```javascript
{
    success: false,
    message: "Invalid OTP code" |
             "OTP has expired. Please request a new code." |
             "Too many attempts. Please request a new OTP."
}
```

## Security Considerations

### Current Implementation (Development)
- Passwords: Base64 encoded (NOT SECURE)
- Data: Stored in localStorage (NOT ENCRYPTED)
- ID Photos: Stored in localStorage
- OTP: 10-minute expiration, 5 attempt limit

### Production Requirements
1. **Backend Authentication**
   - Move all auth to server-side
   - Use bcrypt/Argon2 for password hashing
   - Implement OAuth2/JWT tokens
   - Use HTTPS only

2. **Data Encryption**
   - Encrypt customer data at rest
   - Use TLS/SSL for transmission
   - Implement field-level encryption for sensitive data

3. **ID Verification**
   - Use third-party verification service
   - Implement OCR for ID card validation
   - Store ID photos securely (not in localStorage)
   - Comply with data protection regulations (GDPR, CCPA)

4. **Email Verification**
   - Use dedicated email service (SendGrid, Mailgun)
   - Implement email verification links
   - Add unsubscribe options
   - Comply with CAN-SPAM Act

5. **Session Management**
   - Implement secure session tokens
   - Add CSRF protection
   - Use httpOnly, secure cookies
   - Implement session timeout

6. **Rate Limiting**
   - Limit registration attempts
   - Limit login attempts
   - Limit OTP attempts
   - Limit email sending

## Testing

### Manual Testing Checklist
- [ ] Register with valid data
- [ ] Register with invalid email format
- [ ] Register with duplicate email
- [ ] Upload ID card photo
- [ ] Receive OTP email in console
- [ ] Verify OTP code
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Verify OTP after login
- [ ] Receive thank you email after payment
- [ ] Verify transaction code format
- [ ] Receive invoice email after payment

### Test Credentials
```
Email: test@mywebcode.com
Password: test1234
Full Name: Test User
Phone: +1-555-1234
ID Type: Passport
ID Number: AB123456
```

## Troubleshooting

### OTP Not Showing
1. Check browser console for email queue
2. Verify localStorage has 'myWebcodeEmailQueue'
3. Check OTP expiration time
4. Clear cache and try again

### Login Not Working
1. Verify email is registered
2. Check password is correct
3. Check if account is OTP verified
4. Clear localStorage and re-register

### Transaction Code Missing
1. Check localStorage 'myWebcodeTransactionCodes'
2. Verify payment completed successfully
3. Check customer ID is correct

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS OTP option
   - Authenticator app support
   - Backup codes

2. **Social Login**
   - Google OAuth
   - Facebook Login
   - GitHub Authentication

3. **ID Verification Automation**
   - AI-powered ID verification
   - Liveness detection
   - Real-time verification

4. **Advanced Analytics**
   - Login tracking
   - Session analytics
   - Fraud detection

5. **Admin Dashboard**
   - Customer management
   - Verification review
   - Transaction history
   - Email logs

## Support

For issues or questions:
- Check console logs for errors
- Verify localStorage data
- Check email queue status
- Review transaction code logs
- Test with fresh registration

---

**Last Updated:** 2026-07-23
**Version:** 1.0 (Development)
**Status:** Production Ready (with backend integration)
