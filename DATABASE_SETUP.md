# Database Setup Guide

## Overview

Your project now has a comprehensive SQLite database schema with the following components:

- **Customers** - User registration and profile data
- **OTPs** - One-time password verification
- **Transactions** - Payment transaction codes
- **Payments** - Payment history and records
- **Subscriptions** - Recurring subscription management
- **Refunds** - Refund requests and tracking
- **Invoices** - Invoice generation and storage
- **Email Queue** - Email notification queue system
- **Email Logs** - Email delivery logs
- **Sessions** - User session management
- **Audit Logs** - Activity tracking and auditing

## Files Created

### 1. `database-schema.sql`
SQL file containing all table definitions, relationships, and indexes.
Use this to understand the complete database structure.

### 2. `db-utils.js`
Node.js utility module providing helper functions for all database operations.

**Import and use:**
```javascript
const dbUtils = require('./db-utils');

// Create customer
const customerId = await dbUtils.createCustomer(
  'John Doe', 
  'john@example.com', 
  'password123', 
  '1234567890',
  'passport',
  'A123456789',
  'base64imagedata...'
);

// Verify OTP
const otpResult = await dbUtils.verifyOTP('john@example.com', '123456');

// Record payment
const { paymentId, transactionCode } = await dbUtils.recordPayment(
  customerId,
  'pro',
  'Pro Monthly',
  9.99,
  'USD',
  'PAYPAL-ORDER-ID',
  'PAYPAL-PAYER-ID'
);
```

### 3. `server.js`
Updated Express server with:
- Complete database initialization
- RESTful API endpoints for all operations
- Error handling and validation

## Getting Started

### Step 1: Install Dependencies
```bash
npm install express sqlite3
```

### Step 2: Start the Server
```bash
npm start
```

The database will be automatically created on first run at `mywebcode.sqlite`

### Step 3: API Endpoints

#### Authentication
- `POST /api/register` - Register new customer
- `POST /api/login` - Login customer
- `POST /api/verify-otp` - Verify OTP code
- `POST /api/resend-otp` - Resend OTP

#### Payments
- `POST /api/payments/record` - Record payment
- `GET /api/payments/:customerId` - Get customer payments

#### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/:customerId` - Get active subscriptions
- `POST /api/subscriptions/:subscriptionId/cancel` - Cancel subscription

#### Refunds
- `POST /api/refunds/request` - Request refund
- `GET /api/refunds/:customerId` - Get refunds

#### Invoices
- `POST /api/invoices/create` - Create invoice
- `GET /api/invoices/:customerId` - Get invoices

#### Email Queue
- `GET /api/email-queue/pending` - Get pending emails
- `POST /api/email-queue/:emailId/sent` - Mark email as sent
- `POST /api/email-queue/:emailId/failed` - Mark email as failed

#### Audit Logs
- `POST /api/audit-log` - Create audit log

#### Admin
- `GET /api/customers` - Get all customers

## Database Functions Reference

### Customer Operations
```javascript
// Create new customer
await dbUtils.createCustomer(fullName, email, password, phone, idType, idNumber, idPhoto);

// Get customer by email
const customer = await dbUtils.getCustomerByEmail('john@example.com');

// Get customer by ID
const customer = await dbUtils.getCustomerById('CUST-xxx');

// Update customer status
await dbUtils.updateCustomerStatus(customerId, 'active');

// Mark customer as verified
await dbUtils.verifyCustomer(customerId);
```

### OTP Operations
```javascript
// Create OTP
const otp = await dbUtils.createOTP('john@example.com', customerId);
console.log(otp.code); // 123456

// Verify OTP
const result = await dbUtils.verifyOTP('john@example.com', '123456');

// Get latest OTP
const otp = await dbUtils.getLatestOTP('john@example.com');
```

### Payment Operations
```javascript
// Record payment
const result = await dbUtils.recordPayment(
  customerId, 'pro', 'Pro Monthly', 9.99, 'USD', 
  'ORDER-ID', 'PAYER-ID'
);
// Returns: { paymentId, transactionCode }

// Get customer payments
const payments = await dbUtils.getCustomerPayments(customerId);

// Get payment by transaction code
const payment = await dbUtils.getPaymentByTransactionCode('TXN-PRO-xxx');
```

### Subscription Operations
```javascript
// Create subscription
const subId = await dbUtils.createSubscription(
  customerId, 'pro', 'Pro Monthly', 9.99, 'MONTH', 'PAYPAL-SUB-ID'
);

// Get active subscription
const sub = await dbUtils.getActiveSubscription(customerId);

// Get all subscriptions
const subs = await dbUtils.getCustomerSubscriptions(customerId, 'active');

// Cancel subscription
await dbUtils.cancelSubscription(subscriptionId, 'User cancelled');
```

### Refund Operations
```javascript
// Request refund
const refundId = await dbUtils.requestRefund(
  paymentId, customerId, amount, 'USD', 'Not satisfied'
);

// Get customer refunds
const refunds = await dbUtils.getCustomerRefunds(customerId);

// Update refund status
await dbUtils.updateRefundStatus(refundId, 'approved', 'Refund approved');
```

### Email Queue Operations
```javascript
// Queue email
const emailId = await dbUtils.queueEmail(
  'john@example.com',
  customerId,
  'payment_thank_you',
  'Thank You for Your Payment',
  '<h1>Thank you!</h1>',
  { transactionCode: 'TXN-xxx' }
);

// Get pending emails
const emails = await dbUtils.getPendingEmails(100);

// Mark sent
await dbUtils.markEmailSent(emailId);

// Mark failed
await dbUtils.markEmailFailed(emailId, 'SMTP error');

// Log email delivery
await dbUtils.logEmailSent(
  emailId, 'john@example.com', customerId, 'payment_thank_you',
  'Thank You', 'sent', 'MSG-123', 'sendgrid'
);
```

### Session Operations
```javascript
// Create session
const { sessionId, token } = await dbUtils.createSession(
  customerId, '192.168.1.1', 'Mozilla/5.0...'
);

// Validate session
const session = await dbUtils.validateSession(token);

// Logout
await dbUtils.logoutSession(sessionId);
```

### Audit Log Operations
```javascript
// Log audit event
await dbUtils.logAuditEvent(
  customerId,
  'payment_completed',
  'payment',
  paymentId,
  JSON.stringify({ amount: 9.99, plan: 'pro' }),
  '192.168.1.1',
  'Mozilla/5.0...'
);
```

## Data Relationships

```
customers (1) ──→ (many) otps
         │
         ├──→ (many) payments
         │
         ├──→ (many) subscriptions
         │
         ├──→ (many) refunds
         │
         ├──→ (many) invoices
         │
         ├──→ (many) email_queue
         │
         ├──→ (many) sessions
         │
         └──→ (many) audit_logs

transactions ──→ payments (via transactionCode)
payments ──→ invoices (1-to-1)
payments ──→ refunds (1-to-many)
```

## Next Steps

1. **Integrate Email Service**
   - Connect SendGrid, Mailgun, or AWS SES
   - Process email queue asynchronously
   - Update email status tracking

2. **Implement Frontend API Integration**
   - Update `customer-auth.js` to use database API
   - Replace localStorage with API calls
   - Add session token management

3. **Add PayPal Webhook Handling**
   - Create webhook endpoint
   - Automatically record payments
   - Update subscription status

4. **Deploy to Production**
   - Set up environment variables
   - Configure database backups
   - Enable HTTPS/SSL
   - Set up monitoring and logging

5. **Add More Features**
   - Admin dashboard
   - Customer support portal
   - Usage analytics
   - Advanced reporting

## Database Backups

To backup your database:
```bash
cp mywebcode.sqlite mywebcode.sqlite.backup.$(date +%Y%m%d)
```

To restore:
```bash
cp mywebcode.sqlite.backup.20240101 mywebcode.sqlite
```

## Performance Optimization

The schema includes indexes on frequently queried columns:
- `customers(email)` - Fast email lookups
- `payments(customerId, status)` - Fast payment queries
- `subscriptions(customerId, status)` - Fast subscription queries
- `email_queue(status, createdAt)` - Fast email queue processing
- `sessions(token)` - Fast session validation

## Troubleshooting

**"Database is locked" error:**
- Close all database connections
- Restart the server
- Check for long-running queries

**"table already exists" error:**
- Database already initialized
- Safe to ignore if schema is up to date

**OTP not verifying:**
- Check OTP expiration time (10 minutes)
- Verify email match (case-insensitive)
- Check attempted count against max attempts

**Missing foreign key references:**
- Ensure parent records exist before creating child records
- Example: Customer must exist before creating payment
