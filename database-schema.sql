-- My Webcode Database Schema
-- Complete schema for customer authentication, payments, subscriptions, and refunds

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    phone TEXT,
    idType TEXT,
    idNumber TEXT,
    idPhoto TEXT,
    verified INTEGER DEFAULT 0,
    otpVerified INTEGER DEFAULT 0,
    registeredAt TEXT NOT NULL,
    lastLogin TEXT,
    status TEXT DEFAULT 'pending_verification',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ONE-TIME PASSWORDS (OTP) TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    customerId TEXT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    verifiedAt TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    code TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    planId TEXT NOT NULL,
    planName TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    paymentMethod TEXT DEFAULT 'paypal',
    createdAt TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    usedAt TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    transactionCode TEXT,
    planId TEXT NOT NULL,
    planName TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    paypalOrderId TEXT,
    paypalPayerId TEXT,
    status TEXT DEFAULT 'completed',
    paymentMethod TEXT DEFAULT 'paypal',
    paidAt TEXT NOT NULL,
    invoiceId TEXT,
    notes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (transactionCode) REFERENCES transactions(code)
);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    planId TEXT NOT NULL,
    planName TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    frequency TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    paypalSubscriptionId TEXT,
    startDate TEXT NOT NULL,
    nextBillingDate TEXT,
    cancelledAt TEXT,
    cancelReason TEXT,
    pausedAt TEXT,
    resumedAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- REFUNDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    paymentId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    requestedAt TEXT NOT NULL,
    processedAt TEXT,
    refundedAt TEXT,
    notes TEXT,
    refundMethod TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paymentId) REFERENCES payments(id),
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    paymentId TEXT NOT NULL,
    invoiceNumber TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'sent',
    issuedAt TEXT NOT NULL,
    dueAt TEXT,
    paidAt TEXT,
    filePath TEXT,
    notes TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (paymentId) REFERENCES payments(id)
);

-- ============================================================
-- EMAIL QUEUE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS email_queue (
    id TEXT PRIMARY KEY,
    recipientEmail TEXT NOT NULL,
    customerId TEXT,
    emailType TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    templateData TEXT,
    status TEXT DEFAULT 'pending',
    attemptCount INTEGER DEFAULT 0,
    maxAttempts INTEGER DEFAULT 3,
    sentAt TEXT,
    failureReason TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- EMAIL LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    queueId TEXT,
    recipientEmail TEXT NOT NULL,
    customerId TEXT,
    emailType TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT,
    sentAt TEXT,
    externalMessageId TEXT,
    provider TEXT,
    response TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- LOGIN SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    token TEXT UNIQUE,
    ipAddress TEXT,
    userAgent TEXT,
    loginAt TEXT NOT NULL,
    lastActivityAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    loggedOutAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    customerId TEXT,
    action TEXT NOT NULL,
    entityType TEXT,
    entityId TEXT,
    changes TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_expiresAt ON otps(expiresAt);
CREATE INDEX IF NOT EXISTS idx_transactions_customerId ON transactions(customerId);
CREATE INDEX IF NOT EXISTS idx_payments_customerId ON payments(customerId);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customerId ON subscriptions(customerId);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_refunds_paymentId ON refunds(paymentId);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_createdAt ON email_queue(createdAt);
CREATE INDEX IF NOT EXISTS idx_sessions_customerId ON sessions(customerId);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
