# Quick Reference Guide - Customer Auth & Payment System

## 🚀 Getting Started

### Test the System Now:
1. **Register:** http://yoursite.com/customer-register.html
2. **Login:** http://yoursite.com/customer-login.html
3. **Verify OTP:** http://yoursite.com/otp-verify.html
4. **Buy Plan:** http://yoursite.com/pricing.html
5. **View History:** http://yoursite.com/payment-history.html

## 📋 What Works

### ✅ Registration
- Fill form with name, email, password, phone
- Upload ID card (passport, driver's license, etc.)
- System stores customer data
- OTP generated and queued
- Auto redirect to OTP verification page

### ✅ OTP Verification
- 6-digit code input (auto-focus between fields)
- Code expires in 10 minutes
- Resend option (60 second cooldown)
- Check browser console to see OTP code
- Email queued in localStorage

### ✅ Login
- Email + password authentication
- Auto OTP verification for first login
- Secure session management
- Returns to payment history page

### ✅ Payment
- Select Pro ($9.99/month) or Annual ($99.99/year)
- PayPal checkout completes
- Thank you email generated with reference code
- Transaction code format: `TXN-PRO-156789-A7K9X2`
- Invoice email generated
- Access granted to dashboard

### ✅ Email System
All emails queued in localStorage and logged to console:
```
Console shows:
- OTP email sent
- Thank you email with transaction code
- Invoice email with payment details
```

## 🔗 File Locations

### New Pages:
```
d:\my-website\customer-register.html      - Registration form
d:\my-website\customer-login.html         - Login form
d:\my-website\otp-verify.html             - OTP verification
```

### New Scripts:
```
d:\my-website\customer-auth.js            - Main authentication logic
d:\my-website\CUSTOMER_AUTH_GUIDE.md      - Full documentation
d:\my-website\IMPLEMENTATION_SUMMARY.md   - What's implemented
```

### Updated Files:
```
d:\my-website\index.html                  - Added "Customer Login" button
d:\my-website\pricing.html                - Added "Customer Login" button
d:\my-website\paypal-integration.js       - Added thank you emails
d:\my-website\email-notifications.js      - Added OTP templates
```

## 🧪 Test Credentials

Use these for testing:
```
Full Name:     John Doe
Email:         test@example.com
Password:      test1234
Phone:         +1-555-1234
ID Type:       Passport
ID Number:     AB123456
```

## 📝 What to Check

### In Browser Console:
1. **OTP Email:** Look for "Sending otpVerification email..."
2. **Thank You Email:** Look for "Sending paymentThankYou email..."
3. **Invoice Email:** Look for "Sending paymentInvoice email..."
4. **Transaction Code:** Example: "TXN-PRO-156789-A7K9X2"

### In localStorage (DevTools → Application → LocalStorage):
1. **myWebcodeCustomersDb** - All registered customers
2. **myWebcodeCustomer** - Current logged-in customer
3. **myWebcodeOTP** - OTP codes and verification status
4. **myWebcodeTransactionCodes** - All transaction codes
5. **myWebcodeEmailQueue** - Queued emails

## 💡 Key Features

### 1. Registration
```
- Form validation
- ID card upload with preview
- Secure password storage
- Phone number collection
- Automatic OTP generation
```

### 2. OTP System
```
- 6-digit random code
- 10-minute expiration
- 5-attempt limit
- 60-second resend cooldown
- Email delivery queue
```

### 3. Login
```
- Email/password authentication
- OTP verification for new sessions
- Session management
- Last login tracking
```

### 4. Transaction Codes
```
Format: TXN-[PLAN]-[TIMESTAMP]-[RANDOM]
Examples:
  - TXN-PRO-156789-A7K9X2
  - TXN-ANNUAL-456123-K8L2P5

Generated automatically after payment
Included in thank you email
Used for order tracking
```

### 5. Email System
```
- OTP verification email
- Payment thank you email (with transaction code)
- Invoice email with receipt
- Professional HTML templates
- Personalized with customer names
```

## 🎯 User Flow Checklist

### First Time User:
- [ ] Click "Customer Login" button
- [ ] Redirected to registration page
- [ ] Fill in registration form
- [ ] Upload ID card
- [ ] Submit form
- [ ] Receive "Check your email" message
- [ ] Check browser console for OTP
- [ ] Enter 6-digit OTP
- [ ] Account verified
- [ ] Redirect to dashboard

### Returning User:
- [ ] Click "Customer Login" button
- [ ] Enter email and password
- [ ] Receive OTP via email (logged to console)
- [ ] Enter OTP
- [ ] Login successful
- [ ] Access payment history

### During Purchase:
- [ ] Login as customer
- [ ] Go to pricing page
- [ ] Select plan
- [ ] Click PayPal button
- [ ] Complete checkout
- [ ] See "Thank you!" message
- [ ] Check console for thank you email
- [ ] Check console for transaction code
- [ ] Check console for invoice email

## 🔍 Transaction Code Format Breakdown

```
TXN-PRO-156789-A7K9X2
│    │    │      │
│    │    │      └─ Random alphanumeric (6 chars)
│    │    └──────── Last 6 digits of timestamp
│    └───────────── Plan (PRO, ANNUAL, FREE)
└────────────────── Prefix (TXN = Transaction)
```

## 📧 Email Queue System

### How It Works:
1. When email needs to be sent → Added to queue
2. Queue stored in localStorage
3. Every 30 seconds → Emails processed
4. Email marked as "sent"
5. Email logged to console and emailLogs

### To View Queued Emails:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('myWebcodeEmailQueue'))

// See email logs:
JSON.parse(localStorage.getItem('myWebcodeEmailLogs'))
```

## 🐛 Debugging Tips

### Check if Customer Registered:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('myWebcodeCustomersDb'))
```

### View Current Customer:
```javascript
JSON.parse(localStorage.getItem('myWebcodeCustomer'))
```

### Check OTP Records:
```javascript
JSON.parse(localStorage.getItem('myWebcodeOTP'))
```

### View Transaction Codes:
```javascript
JSON.parse(localStorage.getItem('myWebcodeTransactionCodes'))
```

### View Sent Emails:
```javascript
JSON.parse(localStorage.getItem('myWebcodeEmailLogs'))
```

## 🔐 Security Notes

### Current (Development):
- Passwords: Base64 encoded (NOT SECURE)
- Data: In localStorage (NOT ENCRYPTED)
- Emails: Queued in localStorage (NOT SENT)

### For Production:
- Use backend for password hashing
- Encrypt all sensitive data
- Integrate real email service
- Use HTTPS/SSL
- Implement database
- Add rate limiting

## 📞 Common Issues

### Q: OTP not showing?
A: Check browser console, it logs there in development

### Q: Email not sent?
A: Emails are queued in localStorage. Check console logs.

### Q: Transaction code not appearing?
A: Check: 
- Payment completed successfully
- Customer is logged in
- Transaction code in thank you email

### Q: Can't login?
A: 
- Check if customer registered
- Verify email and password
- Check if OTP verified

## 🎓 Learning Resources

### Documentation Files:
1. **CUSTOMER_AUTH_GUIDE.md** - Complete API reference
2. **PAYMENT_SETUP.md** - Payment system details
3. **IMPLEMENTATION_SUMMARY.md** - What's been built
4. **This file** - Quick reference

### For Developers:
1. Look at `customer-auth.js` for authentication logic
2. Check `paypal-integration.js` for payment flow
3. Review `email-notifications.js` for email templates

## 🚀 Next Steps

### To Test Locally:
1. Open `customer-register.html` in browser
2. Fill out registration form
3. Check console for OTP code
4. Go to `otp-verify.html?email=youremail@example.com`
5. Enter OTP from console
6. Try login flow
7. Make test payment on pricing page

### For Production:
1. Set up backend API
2. Implement email service
3. Add database
4. Set up HTTPS
5. Test all flows thoroughly
6. Deploy and monitor

## 💬 Support

For more details, see:
- Full API: `CUSTOMER_AUTH_GUIDE.md`
- Payment Info: `PAYMENT_SETUP.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`

---

**Quick Links:**
- Registration: `/customer-register.html`
- Login: `/customer-login.html`
- OTP Verify: `/otp-verify.html`
- Pricing: `/pricing.html`
- Payment History: `/payment-history.html`

**Ready to use! Start testing now!**
