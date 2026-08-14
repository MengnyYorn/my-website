const express = require('express');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'mywebcode.sqlite');
const db = new sqlite3.Database(DB_PATH);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function (err) { if (err) reject(err); else resolve(this); }));
}
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); }));
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); }));
}

async function initDb() {
  // Customers table
  await runAsync(`CREATE TABLE IF NOT EXISTS customers (
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
  )`);

  // OTPs table
  await runAsync(`CREATE TABLE IF NOT EXISTS otps (
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
  )`);

  // Transactions table
  await runAsync(`CREATE TABLE IF NOT EXISTS transactions (
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
  )`);

  // Payments table
  await runAsync(`CREATE TABLE IF NOT EXISTS payments (
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
  )`);

  // Subscriptions table
  await runAsync(`CREATE TABLE IF NOT EXISTS subscriptions (
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
  )`);

  // Refunds table
  await runAsync(`CREATE TABLE IF NOT EXISTS refunds (
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
  )`);

  // Invoices table
  await runAsync(`CREATE TABLE IF NOT EXISTS invoices (
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
  )`);

  // Email queue table
  await runAsync(`CREATE TABLE IF NOT EXISTS email_queue (
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
  )`);

  // Email logs table
  await runAsync(`CREATE TABLE IF NOT EXISTS email_logs (
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
  )`);

  // Sessions table
  await runAsync(`CREATE TABLE IF NOT EXISTS sessions (
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
  )`);

  // Audit logs table
  await runAsync(`CREATE TABLE IF NOT EXISTS audit_logs (
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
  )`);

  // Create indexes
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_otps_expiresAt ON otps(expiresAt)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_customerId ON transactions(customerId)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_payments_customerId ON payments(customerId)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_subscriptions_customerId ON subscriptions(customerId)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_refunds_paymentId ON refunds(paymentId)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_email_queue_createdAt ON email_queue(createdAt)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_sessions_customerId ON sessions(customerId)`);
  await runAsync(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/register', async (req, res) => {
  const { fullName, email, password, phone, idType, idNumber, idPhoto } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ success: false, message: 'Missing required fields' });
  try {
    const existing = await getAsync('SELECT id FROM customers WHERE email = ?', [email.toLowerCase()]);
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });
    const id = generateId('CUST');
    const passwordHash = hashPassword(password);
    const registeredAt = new Date().toISOString();
    await runAsync(`INSERT INTO customers (id, fullName, email, passwordHash, phone, idType, idNumber, idPhoto, registeredAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, fullName, email.toLowerCase(), passwordHash, phone || '', idType || null, idNumber || null, idPhoto || null, registeredAt, 'pending_verification']);

    // create OTP
    const code = generateOTP();
    const otpId = generateId('OTP');
    const createdAt = registeredAt;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await runAsync('INSERT INTO otps (id, email, code, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)', [otpId, email.toLowerCase(), code, createdAt, expiresAt]);
    console.log(`OTP for ${email}: ${code}`);
    res.json({ success: true, message: 'Registered. OTP sent (check server logs).', customer: { id, fullName, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const customer = await getAsync('SELECT * FROM customers WHERE email = ?', [email.toLowerCase()]);
    if (!customer) return res.status(404).json({ success: false, message: 'Email not found' });
    if (customer.passwordHash !== hashPassword(password)) return res.status(401).json({ success: false, message: 'Incorrect password' });
    if (!customer.otpVerified) {
      const code = generateOTP();
      const otpId = generateId('OTP');
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await runAsync('INSERT INTO otps (id, email, code, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)', [otpId, email.toLowerCase(), code, createdAt, expiresAt]);
      console.log(`OTP for ${email}: ${code}`);
      return res.json({ success: false, message: 'OTP required', requiresOTP: true, email });
    }
    const now = new Date().toISOString();
    await runAsync('UPDATE customers SET lastLogin = ?, status = ? WHERE email = ?', [now, 'active', email.toLowerCase()]);
    res.json({ success: true, message: `Welcome back, ${customer.fullName}`, customer: { id: customer.id, fullName: customer.fullName, email: customer.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const otp = await getAsync('SELECT * FROM otps WHERE email = ? AND code = ? ORDER BY createdAt DESC LIMIT 1', [email.toLowerCase(), code]);
    if (!otp) return res.status(404).json({ success: false, message: 'Invalid OTP' });
    if (otp.verified) return res.status(400).json({ success: false, message: 'OTP already used' });
    if (new Date() > new Date(otp.expiresAt)) return res.status(400).json({ success: false, message: 'OTP expired' });
    await runAsync('UPDATE otps SET verified = 1 WHERE id = ?', [otp.id]);
    await runAsync('UPDATE customers SET otpVerified = 1, verified = 1, status = ? WHERE email = ?', ['active', email.toLowerCase()]);
    res.json({ success: true, message: 'Email verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Missing email' });
  try {
    const customer = await getAsync('SELECT * FROM customers WHERE email = ?', [email.toLowerCase()]);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const now = new Date().toISOString();
    const code = generateOTP();
    const otpId = generateId('OTP');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await runAsync('INSERT INTO otps (id, email, code, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?)', [otpId, email.toLowerCase(), code, now, expiresAt]);
    console.log(`OTP for ${email}: ${code}`);
    res.json({ success: true, message: 'OTP resent (check server logs)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const rows = await allAsync('SELECT id, fullName, email, verified, otpVerified, registeredAt, lastLogin, status FROM customers');
    res.json({ success: true, customers: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ PAYMENT ENDPOINTS ============

app.post('/api/payments/record', async (req, res) => {
  const { customerId, planId, planName, amount, currency, paypalOrderId, paypalPayerId } = req.body;
  if (!customerId || !planId || !amount) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const paymentId = generateId('PAY');
    const transactionCode = `TXN-${planId.toUpperCase()}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const paidAt = new Date().toISOString();
    
    // Record payment
    await runAsync(
      `INSERT INTO payments (id, customerId, transactionCode, planId, planName, amount, currency, paypalOrderId, paypalPayerId, paidAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, customerId, transactionCode, planId, planName || '', amount, currency || 'USD', paypalOrderId || '', paypalPayerId || '', paidAt]
    );

    // Record transaction code
    await runAsync(
      `INSERT INTO transactions (code, customerId, planId, planName, amount, currency, createdAt, used, usedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionCode, customerId, planId, planName || '', amount, currency || 'USD', paidAt, 1, paidAt]
    );

    // Queue thank you email
    const emailId = generateId('EMAIL');
    const customer = await getAsync('SELECT * FROM customers WHERE id = ?', [customerId]);
    const emailContent = `
      <h2>Thank You for Your Payment!</h2>
      <p>Hi ${customer?.fullName || 'Customer'},</p>
      <p>Your payment of $${amount} for the ${planName} plan has been received.</p>
      <p><strong>Transaction Code:</strong> ${transactionCode}</p>
      <p>Thank you for choosing our service!</p>
    `;
    
    await runAsync(
      `INSERT INTO email_queue (id, recipientEmail, customerId, emailType, subject, body, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [emailId, customer?.email || '', customerId, 'payment_thank_you', 'Thank You for Your Payment', emailContent, 'pending']
    );

    res.json({ success: true, paymentId, transactionCode, message: 'Payment recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/payments/:customerId', async (req, res) => {
  try {
    const rows = await allAsync(
      'SELECT * FROM payments WHERE customerId = ? ORDER BY paidAt DESC',
      [req.params.customerId]
    );
    res.json({ success: true, payments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ SUBSCRIPTION ENDPOINTS ============

app.post('/api/subscriptions/create', async (req, res) => {
  const { customerId, planId, planName, amount, frequency, paypalSubscriptionId } = req.body;
  if (!customerId || !planId || !amount || !frequency) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const subscriptionId = generateId('SUB');
    const startDate = new Date().toISOString();
    const nextBillingDate = new Date(Date.now() + (frequency === 'MONTH' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();
    
    await runAsync(
      `INSERT INTO subscriptions (id, customerId, planId, planName, amount, frequency, startDate, nextBillingDate, paypalSubscriptionId, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subscriptionId, customerId, planId, planName || '', amount, frequency, startDate, nextBillingDate, paypalSubscriptionId || '', 'active']
    );
    
    res.json({ success: true, subscriptionId, message: 'Subscription created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/subscriptions/:customerId', async (req, res) => {
  try {
    const rows = await allAsync(
      'SELECT * FROM subscriptions WHERE customerId = ? AND status = ? ORDER BY startDate DESC',
      [req.params.customerId, 'active']
    );
    res.json({ success: true, subscriptions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/subscriptions/:subscriptionId/cancel', async (req, res) => {
  const { reason } = req.body;
  try {
    const cancelledAt = new Date().toISOString();
    await runAsync(
      'UPDATE subscriptions SET status = ?, cancelledAt = ?, cancelReason = ? WHERE id = ?',
      ['cancelled', cancelledAt, reason || 'User cancelled', req.params.subscriptionId]
    );
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ REFUND ENDPOINTS ============

app.post('/api/refunds/request', async (req, res) => {
  const { paymentId, customerId, reason } = req.body;
  if (!paymentId || !customerId || !reason) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const payment = await getAsync('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const refundId = generateId('REF');
    const requestedAt = new Date().toISOString();
    
    await runAsync(
      `INSERT INTO refunds (id, paymentId, customerId, amount, currency, reason, status, requestedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [refundId, paymentId, customerId, payment.amount, payment.currency, reason, 'pending', requestedAt]
    );
    
    res.json({ success: true, refundId, message: 'Refund requested' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/refunds/:customerId', async (req, res) => {
  try {
    const rows = await allAsync(
      'SELECT * FROM refunds WHERE customerId = ? ORDER BY requestedAt DESC',
      [req.params.customerId]
    );
    res.json({ success: true, refunds: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ EMAIL QUEUE ENDPOINTS ============

app.get('/api/email-queue/pending', async (req, res) => {
  try {
    const rows = await allAsync(
      `SELECT * FROM email_queue 
       WHERE status = 'pending' AND attemptCount < maxAttempts 
       ORDER BY createdAt ASC LIMIT 100`,
      []
    );
    res.json({ success: true, emails: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/email-queue/:emailId/sent', async (req, res) => {
  try {
    const sentAt = new Date().toISOString();
    await runAsync(
      'UPDATE email_queue SET status = ?, sentAt = ?, updatedAt = ? WHERE id = ?',
      ['sent', sentAt, sentAt, req.params.emailId]
    );
    res.json({ success: true, message: 'Email marked as sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/email-queue/:emailId/failed', async (req, res) => {
  const { reason } = req.body;
  try {
    const now = new Date().toISOString();
    await runAsync(
      'UPDATE email_queue SET status = ?, failureReason = ?, attemptCount = attemptCount + 1, updatedAt = ? WHERE id = ?',
      ['failed', reason || 'Unknown error', now, req.params.emailId]
    );
    res.json({ success: true, message: 'Email marked as failed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ INVOICE ENDPOINTS ============

app.post('/api/invoices/create', async (req, res) => {
  const { customerId, paymentId, invoiceNumber, amount, currency, notes } = req.body;
  if (!customerId || !paymentId || !invoiceNumber || !amount) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const invoiceId = generateId('INV');
    const issuedAt = new Date().toISOString();
    
    await runAsync(
      `INSERT INTO invoices (id, customerId, paymentId, invoiceNumber, amount, currency, issuedAt, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, customerId, paymentId, invoiceNumber, amount, currency || 'USD', issuedAt, notes || '', 'sent']
    );
    
    res.json({ success: true, invoiceId, message: 'Invoice created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/invoices/:customerId', async (req, res) => {
  try {
    const rows = await allAsync(
      'SELECT * FROM invoices WHERE customerId = ? ORDER BY issuedAt DESC',
      [req.params.customerId]
    );
    res.json({ success: true, invoices: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ AUDIT LOG ENDPOINTS ============

app.post('/api/audit-log', async (req, res) => {
  const { customerId, action, entityType, entityId, changes, ipAddress, userAgent } = req.body;
  if (!action) return res.status(400).json({ success: false, message: 'Missing action' });
  try {
    const logId = generateId('AUD');
    const createdAt = new Date().toISOString();
    
    await runAsync(
      `INSERT INTO audit_logs (id, customerId, action, entityType, entityId, changes, ipAddress, userAgent, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, customerId || null, action, entityType || null, entityId || null, changes || null, ipAddress || null, userAgent || null, createdAt]
    );
    
    res.json({ success: true, logId, message: 'Audit log recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
initDb().then(() => {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});
