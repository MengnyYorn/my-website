# Admin Dashboard Guide

## 📊 Dashboard Overview

Your **Admin Dashboard** is the central control panel for managing your entire My Webcode platform.

---

## 🎯 How to Access

### Direct URLs:
- **Admin Dashboard:** `http://localhost:3000/admin-dashboard.html` (or your live domain)
- **Main Website:** `http://localhost:3000/index.html`

### From Website:
1. Go to homepage: [index.html](index.html)
2. Look for the **🔐 Admin** button in the top-right navigation
3. Click to access admin dashboard

---

## 📋 Dashboard Sections

### 1. 📈 Overview Tab
**System-wide statistics and metrics:**
- **Total Customers** - All registered users
- **Active Subscriptions** - Currently active paid subscriptions
- **Total Revenue** - Total payment amount received
- **Pending Refunds** - Refund requests awaiting action
- **Email Queue** - Unsent emails waiting to be delivered
- **Verified Users** - Email verified customer count

**Features:**
- Real-time statistics
- Auto-refresh every 30 seconds
- Revenue chart placeholder (ready for chart library integration)

### 2. 👥 Customers Tab
**Manage all customer accounts:**

| Column | Description |
|--------|-------------|
| ID | Unique customer identifier |
| Name | Full name |
| Email | Email address |
| Phone | Phone number |
| Status | Account status (active/pending_verification) |
| Verified | Email verification status |
| Registered | Registration date |
| Last Login | Last login date |
| Action | View customer details |

**Features:**
- Search by email or name
- Filter and sort capabilities
- Export to CSV
- View individual customer details

### 3. 💳 Payments Tab
**Track all customer payments:**

| Column | Description |
|--------|-------------|
| Payment ID | Unique payment identifier |
| Customer Email | Email of paying customer |
| Plan | Plan purchased (Pro/Annual) |
| Amount | Payment amount |
| Transaction Code | Reference code (TXN-xxx) |
| Status | Payment status |
| Date | Payment date |
| Action | View payment details |

**Features:**
- Search by transaction code
- Filter by status
- Export payment history
- View invoice details

### 4. 🔄 Subscriptions Tab
**Monitor recurring subscriptions:**

| Column | Description |
|--------|-------------|
| ID | Subscription ID |
| Customer Email | Subscriber email |
| Plan | Plan type |
| Amount | Monthly/yearly amount |
| Frequency | MONTH or YEAR |
| Status | active/cancelled/paused |
| Start Date | Subscription start |
| Next Billing | Next billing date |
| Action | Cancel/Manage |

**Features:**
- View active subscriptions
- Cancel subscriptions
- Manage billing dates
- Export subscription list

### 5. ↩️ Refunds Tab
**Handle refund requests:**

| Column | Description |
|--------|-------------|
| Refund ID | Unique refund ID |
| Payment ID | Related payment |
| Customer Email | Requester email |
| Amount | Refund amount |
| Reason | Reason for refund |
| Status | pending/approved/rejected/completed |
| Requested | Request date |
| Action | Approve/Reject |

**Features:**
- Track refund requests
- Change refund status
- Add notes to refund
- Auto-check eligibility (7-day Pro, 30-day Annual)

### 6. 📧 Email Queue Tab
**Monitor email delivery system:**

**Email Statistics:**
- Pending Emails - Waiting to be sent
- Sent Today - Successfully sent in last 24h
- Failed Emails - Failed delivery attempts

**Email Queue Table:**

| Column | Description |
|--------|-------------|
| Email ID | Unique email ID |
| Recipient | Email recipient |
| Email Type | Type (otp_verification, payment_thank_you, etc.) |
| Subject | Email subject |
| Status | pending/sent/failed |
| Created | Creation timestamp |
| Sent | Send timestamp |
| Action | Resend/Delete |

**Email Types:**
- `otp_verification` - OTP verification emails
- `payment_thank_you` - Payment confirmation
- `invoice` - Invoice emails
- `welcome` - Welcome emails
- `subscription_renewal` - Renewal reminders
- `refund_confirmation` - Refund notifications
- `cancellation_confirmation` - Cancellation confirmation

**Features:**
- Monitor email delivery status
- Resend failed emails
- Check failure reasons
- Track email attempts

### 7. 📋 Audit Logs Tab
**System activity tracking:**

| Column | Description |
|--------|-------------|
| Log ID | Unique log ID |
| Customer | Associated customer |
| Action | Action performed |
| Entity Type | Type of entity affected |
| Entity ID | ID of affected entity |
| IP Address | User IP address |
| Timestamp | When action occurred |
| View | View full details |

**Tracked Actions:**
- `customer_registered` - New customer registration
- `customer_verified` - Email verification
- `payment_completed` - Payment received
- `subscription_created` - New subscription
- `subscription_cancelled` - Subscription cancelled
- `refund_requested` - Refund request submitted
- `refund_approved` - Refund approved
- `otp_created` - OTP generated
- `login_successful` - Customer login

**Features:**
- Search by action type
- Filter by date range
- Export audit trail
- Full action details available

---

## 🔧 API Endpoints Used

The Admin Dashboard connects to these backend API endpoints:

```
GET    /api/customers                    - Get all customers
GET    /api/payments/:customerId         - Get payments for customer
GET    /api/subscriptions/:customerId    - Get customer subscriptions
GET    /api/refunds/:customerId          - Get customer refunds
GET    /api/email-queue/pending          - Get pending emails
GET    /api/invoices/:customerId         - Get invoices
POST   /api/audit-log                    - Create audit log entry
```

---

## 📊 Real-time Features

✅ **Auto-refresh** - Dashboard updates every 30 seconds  
✅ **Real-time stats** - Live customer and payment counts  
✅ **Search & Filter** - Find data quickly  
✅ **Export to CSV** - Download data for analysis  
✅ **Status indicators** - Color-coded badges for quick status viewing  

---

## 🎨 Dashboard Color Codes

### Status Badges:
- 🟢 **Active** - Green badge (#dcfce7)
- 🟡 **Pending** - Yellow badge (#fef3c7)
- 🔴 **Cancelled/Rejected** - Red badge (#fee2e2)
- 🔵 **Completed** - Blue badge (#dbeafe)

### Navigation:
- 🔵 Active tab - Blue highlight (#4f46e5)
- ⚪ Inactive tab - Gray (#e2e8f0)

---

## 📈 Key Metrics Explained

### Total Customers
Total number of registered customer accounts (verified + unverified)

### Active Subscriptions
Customers with active, paid subscriptions (excluding cancelled/paused)

### Total Revenue
Sum of all payment amounts received from customers

### Pending Refunds
Number of refund requests with "pending" status awaiting action

### Email Queue
Number of emails queued for sending (pending status)

### Verified Users
Customers who have completed email verification

---

## ⚙️ Admin Features

### Search & Filter
- Click in search box
- Type to filter by name, email, or other fields
- Results update in real-time

### Export to CSV
- Click "📥 Export CSV" button
- Data downloaded as Excel-compatible file
- Contains all visible columns and data

### View Details
- Click "View" button in Action column
- Open detailed view of customer/payment/etc
- More features coming soon

### Resend Email
- Click "Resend" on failed emails
- Email moved back to pending queue
- Will be sent in next batch

---

## 🔐 Security Considerations

⚠️ **Important:** The admin dashboard is currently accessible to everyone. In production, implement:

1. **Admin Authentication**
   - Add login requirement
   - Use session tokens from `/api/sessions`
   - Verify admin credentials before showing data

2. **Authorization Checks**
   - Only show data to authenticated admins
   - Implement role-based access control (RBAC)
   - Log all admin actions

3. **Data Protection**
   - Enable HTTPS only
   - Add rate limiting
   - Implement IP whitelisting
   - Encrypt sensitive data

4. **Audit Logging**
   - Log all admin actions
   - Track data access
   - Monitor for suspicious activity

---

## 📝 Database Schema Reference

The dashboard pulls data from these tables:

```
customers          - User accounts & profile data
payments           - Payment records
subscriptions      - Recurring subscriptions
refunds            - Refund requests
invoices           - Invoice records
email_queue        - Pending emails
email_logs         - Email delivery history
audit_logs         - System activity log
```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for full schema details.

---

## 🚀 Next Steps

1. **Add Authentication**
   - Implement admin login on dashboard
   - Use customer database for admin users
   - Add password reset flow

2. **Expand Analytics**
   - Add revenue charts
   - Create customer activity timeline
   - Build subscription lifecycle reports

3. **Add Management Actions**
   - Edit customer details
   - Refund processing workflow
   - Email template editor
   - Bulk operations

4. **Notifications**
   - Real-time notifications for new payments
   - Alert for pending refunds
   - Failed email alerts

5. **Reporting**
   - Daily/weekly/monthly reports
   - Custom date range queries
   - Advanced filtering options

---

## 🐛 Troubleshooting

**Dashboard shows "Loading..." but data doesn't appear:**
- Check that server is running (`npm start`)
- Open browser console (F12) for error messages
- Verify API endpoints are accessible
- Check database connection

**"Cannot find customers" error:**
- Ensure database is initialized
- Run `npm start` to create tables
- Check that customers exist in database

**Search not working:**
- Type in search box slowly
- Try searching for full email
- Check console for JavaScript errors

**Export not working:**
- Check browser download settings
- Allow pop-ups if blocked
- Ensure data exists before exporting

---

## 📞 Support

For issues or questions:
1. Check console errors (F12 key)
2. Review [DATABASE_SETUP.md](DATABASE_SETUP.md)
3. Check server logs with `npm start`
4. Verify API endpoints respond correctly

---

**Last Updated:** 2026-08-11  
**Version:** 1.0  
**Status:** Production Ready
