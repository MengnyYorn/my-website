// Database Utilities - Helper functions for database operations
// Use this in Node.js with your server.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

// Initialize database connection
const DB_PATH = path.join(__dirname, 'mywebcode.sqlite');
const db = new sqlite3.Database(DB_PATH);

// ============================================================
// DATABASE HELPER FUNCTIONS
// ============================================================

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function (err) { 
    if (err) reject(err); 
    else resolve(this); 
  }));
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (err, row) => { 
    if (err) reject(err); 
    else resolve(row); 
  }));
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => { 
    if (err) reject(err); 
    else resolve(rows); 
  }));
}

// ============================================================
// CUSTOMER OPERATIONS
// ============================================================

async function createCustomer(fullName, email, password, phone, idType, idNumber, idPhoto) {
  const id = generateId('CUST');
  const passwordHash = hashPassword(password);
  const registeredAt = new Date().toISOString();
  
  await runAsync(
    `INSERT INTO customers (id, fullName, email, passwordHash, phone, idType, idNumber, idPhoto, registeredAt, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, fullName, email.toLowerCase(), passwordHash, phone || '', idType || null, idNumber || null, idPhoto || null, registeredAt, 'pending_verification']
  );
  
  return id;
}

async function getCustomerByEmail(email) {
  return await getAsync('SELECT * FROM customers WHERE email = ?', [email.toLowerCase()]);
}

async function getCustomerById(customerId) {
  return await getAsync('SELECT * FROM customers WHERE id = ?', [customerId]);
}

async function updateCustomerStatus(customerId, status) {
  const updatedAt = new Date().toISOString();
  return await runAsync('UPDATE customers SET status = ?, updatedAt = ? WHERE id = ?', [status, updatedAt, customerId]);
}

async function verifyCustomer(customerId) {
  const updatedAt = new Date().toISOString();
  return await runAsync('UPDATE customers SET verified = 1, otpVerified = 1, status = ?, updatedAt = ? WHERE id = ?', 
    ['active', updatedAt, customerId]);
}

// ============================================================
// OTP OPERATIONS
// ============================================================

async function createOTP(email, customerId = null) {
  const code = generateOTP();
  const otpId = generateId('OTP');
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  
  await runAsync(
    'INSERT INTO otps (id, customerId, email, code, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
    [otpId, customerId || null, email.toLowerCase(), code, createdAt, expiresAt]
  );
  
  return { id: otpId, code, expiresAt };
}

async function verifyOTP(email, code) {
  const otp = await getAsync(
    'SELECT * FROM otps WHERE email = ? AND code = ? AND verified = 0 ORDER BY createdAt DESC LIMIT 1',
    [email.toLowerCase(), code]
  );
  
  if (!otp) return null;
  if (new Date() > new Date(otp.expiresAt)) return null;
  
  const verifiedAt = new Date().toISOString();
  await runAsync('UPDATE otps SET verified = 1, verifiedAt = ? WHERE id = ?', [verifiedAt, otp.id]);
  
  return otp;
}

async function getLatestOTP(email) {
  return await getAsync(
    'SELECT * FROM otps WHERE email = ? ORDER BY createdAt DESC LIMIT 1',
    [email.toLowerCase()]
  );
}

// ============================================================
// PAYMENT OPERATIONS
// ============================================================

async function recordPayment(customerId, planId, planName, amount, currency, paypalOrderId, paypalPayerId) {
  const paymentId = generateId('PAY');
  const transactionCode = `TXN-${planId.toUpperCase()}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const paidAt = new Date().toISOString();
  
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
  
  return { paymentId, transactionCode };
}

async function getCustomerPayments(customerId) {
  return await allAsync('SELECT * FROM payments WHERE customerId = ? ORDER BY paidAt DESC', [customerId]);
}

async function getPaymentByTransactionCode(transactionCode) {
  return await getAsync('SELECT * FROM payments WHERE transactionCode = ?', [transactionCode]);
}

// ============================================================
// SUBSCRIPTION OPERATIONS
// ============================================================

async function createSubscription(customerId, planId, planName, amount, frequency, paypalSubscriptionId = null) {
  const subscriptionId = generateId('SUB');
  const startDate = new Date().toISOString();
  const monthsOrYears = frequency === 'MONTH' ? 1 : 12;
  const nextBillingDate = new Date(Date.now() + monthsOrYears * 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await runAsync(
    `INSERT INTO subscriptions (id, customerId, planId, planName, amount, frequency, startDate, nextBillingDate, paypalSubscriptionId, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [subscriptionId, customerId, planId, planName || '', amount, frequency, startDate, nextBillingDate, paypalSubscriptionId || '', 'active']
  );
  
  return subscriptionId;
}

async function getActiveSubscription(customerId) {
  return await getAsync(
    'SELECT * FROM subscriptions WHERE customerId = ? AND status = ? ORDER BY startDate DESC LIMIT 1',
    [customerId, 'active']
  );
}

async function getCustomerSubscriptions(customerId, status = 'active') {
  return await allAsync(
    'SELECT * FROM subscriptions WHERE customerId = ? AND status = ? ORDER BY startDate DESC',
    [customerId, status]
  );
}

async function cancelSubscription(subscriptionId, reason = 'User cancelled') {
  const cancelledAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  
  return await runAsync(
    'UPDATE subscriptions SET status = ?, cancelledAt = ?, cancelReason = ?, updatedAt = ? WHERE id = ?',
    ['cancelled', cancelledAt, reason, updatedAt, subscriptionId]
  );
}

// ============================================================
// REFUND OPERATIONS
// ============================================================

async function requestRefund(paymentId, customerId, amount, currency, reason) {
  const refundId = generateId('REF');
  const requestedAt = new Date().toISOString();
  
  await runAsync(
    `INSERT INTO refunds (id, paymentId, customerId, amount, currency, reason, status, requestedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [refundId, paymentId, customerId, amount, currency, reason, 'pending', requestedAt]
  );
  
  return refundId;
}

async function getCustomerRefunds(customerId) {
  return await allAsync('SELECT * FROM refunds WHERE customerId = ? ORDER BY requestedAt DESC', [customerId]);
}

async function updateRefundStatus(refundId, status, notes = null) {
  const updatedAt = new Date().toISOString();
  
  return await runAsync(
    'UPDATE refunds SET status = ?, notes = ?, updatedAt = ? WHERE id = ?',
    [status, notes, updatedAt, refundId]
  );
}

// ============================================================
// INVOICE OPERATIONS
// ============================================================

async function createInvoice(customerId, paymentId, invoiceNumber, amount, currency, notes = null) {
  const invoiceId = generateId('INV');
  const issuedAt = new Date().toISOString();
  
  await runAsync(
    `INSERT INTO invoices (id, customerId, paymentId, invoiceNumber, amount, currency, issuedAt, notes, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [invoiceId, customerId, paymentId, invoiceNumber, amount, currency || 'USD', issuedAt, notes || '', 'sent']
  );
  
  return invoiceId;
}

async function getCustomerInvoices(customerId) {
  return await allAsync('SELECT * FROM invoices WHERE customerId = ? ORDER BY issuedAt DESC', [customerId]);
}

// ============================================================
// EMAIL QUEUE OPERATIONS
// ============================================================

async function queueEmail(recipientEmail, customerId, emailType, subject, body, templateData = null) {
  const emailId = generateId('EMAIL');
  const createdAt = new Date().toISOString();
  
  await runAsync(
    `INSERT INTO email_queue (id, recipientEmail, customerId, emailType, subject, body, templateData, status, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [emailId, recipientEmail, customerId || null, emailType, subject, body, templateData || null, 'pending', createdAt]
  );
  
  return emailId;
}

async function getPendingEmails(limit = 100) {
  return await allAsync(
    `SELECT * FROM email_queue 
     WHERE status = 'pending' AND attemptCount < maxAttempts 
     ORDER BY createdAt ASC LIMIT ?`,
    [limit]
  );
}

async function markEmailSent(emailId) {
  const sentAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  
  return await runAsync(
    'UPDATE email_queue SET status = ?, sentAt = ?, updatedAt = ? WHERE id = ?',
    ['sent', sentAt, updatedAt, emailId]
  );
}

async function markEmailFailed(emailId, reason) {
  const updatedAt = new Date().toISOString();
  
  return await runAsync(
    'UPDATE email_queue SET status = ?, failureReason = ?, attemptCount = attemptCount + 1, updatedAt = ? WHERE id = ?',
    ['failed', reason, updatedAt, emailId]
  );
}

async function logEmailSent(emailId, recipientEmail, customerId, emailType, subject, status, externalMessageId = null, provider = null) {
  const logId = generateId('LOG');
  const sentAt = new Date().toISOString();
  
  await runAsync(
    `INSERT INTO email_logs (id, queueId, recipientEmail, customerId, emailType, subject, status, sentAt, externalMessageId, provider) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [logId, emailId, recipientEmail, customerId, emailType, subject, status, sentAt, externalMessageId, provider]
  );
  
  return logId;
}

// ============================================================
// SESSION OPERATIONS
// ============================================================

async function createSession(customerId, ipAddress, userAgent) {
  const sessionId = generateId('SESS');
  const token = crypto.randomBytes(32).toString('hex');
  const loginAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  
  await runAsync(
    `INSERT INTO sessions (id, customerId, token, ipAddress, userAgent, loginAt, lastActivityAt, expiresAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, customerId, token, ipAddress, userAgent, loginAt, loginAt, expiresAt]
  );
  
  return { sessionId, token };
}

async function validateSession(token) {
  const session = await getAsync('SELECT * FROM sessions WHERE token = ? AND loggedOutAt IS NULL', [token]);
  if (!session) return null;
  
  const now = new Date();
  if (new Date(session.expiresAt) < now) return null;
  
  // Update last activity
  await runAsync('UPDATE sessions SET lastActivityAt = ? WHERE id = ?', [now.toISOString(), session.id]);
  
  return session;
}

async function logoutSession(sessionId) {
  const loggedOutAt = new Date().toISOString();
  return await runAsync('UPDATE sessions SET loggedOutAt = ? WHERE id = ?', [loggedOutAt, sessionId]);
}

// ============================================================
// AUDIT LOG OPERATIONS
// ============================================================

async function logAuditEvent(customerId, action, entityType, entityId, changes = null, ipAddress = null, userAgent = null) {
  const logId = generateId('AUD');
  const createdAt = new Date().toISOString();
  
  await runAsync(
    `INSERT INTO audit_logs (id, customerId, action, entityType, entityId, changes, ipAddress, userAgent, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [logId, customerId || null, action, entityType || null, entityId || null, changes || null, ipAddress || null, userAgent || null, createdAt]
  );
  
  return logId;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync,
  
  // Customer operations
  createCustomer,
  getCustomerByEmail,
  getCustomerById,
  updateCustomerStatus,
  verifyCustomer,
  
  // OTP operations
  createOTP,
  verifyOTP,
  getLatestOTP,
  
  // Payment operations
  recordPayment,
  getCustomerPayments,
  getPaymentByTransactionCode,
  
  // Subscription operations
  createSubscription,
  getActiveSubscription,
  getCustomerSubscriptions,
  cancelSubscription,
  
  // Refund operations
  requestRefund,
  getCustomerRefunds,
  updateRefundStatus,
  
  // Invoice operations
  createInvoice,
  getCustomerInvoices,
  
  // Email queue operations
  queueEmail,
  getPendingEmails,
  markEmailSent,
  markEmailFailed,
  logEmailSent,
  
  // Session operations
  createSession,
  validateSession,
  logoutSession,
  
  // Audit log operations
  logAuditEvent,
  
  // Utility functions
  generateId,
  hashPassword,
  verifyPassword,
  generateOTP
};
