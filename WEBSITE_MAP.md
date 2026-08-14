# 📍 Website Structure & Navigation Map

## 🌐 Complete Website Directory

### **Public Pages** (Accessible to Everyone)

| Page | URL | Purpose | Access |
|------|-----|---------|--------|
| **Home/Index** | `index.html` | Main landing page | Front navigation |
| **Tutorials** | `tutorials.html` | Learn HTML, CSS, JS, React, etc. | Home → Tutorials |
| **Exercises** | `exercises.html` | Practice coding exercises | Home → Exercises |
| **Certificates** | `certificates.html` | View earned certificates | Home → Certificates |
| **Pricing** | `pricing.html` | View plans & pricing | Home → Pricing |
| **Playground** | `playground.html` | Code editor space | Home → Spaces |
| **Dashboard** | `dashboard.html` | Learning progress tracker | Home → Academy |

---

## 🔐 Customer Authentication Pages

| Page | URL | Purpose | Who Can Access |
|------|-----|---------|---|
| **Customer Register** | `customer-register.html` | Create new account with ID verification | Public (needs email) |
| **Customer Login** | `customer-login.html` | Sign in to account | Registered users |
| **OTP Verify** | `otp-verify.html` | Verify email with OTP code | Users with OTP sent |
| **Payment History** | `payment-history.html` | View payments & subscriptions | Logged-in customers |

**Navigation from these pages:** All have "← Back to Home" button

---

## 💼 Admin & Management Pages

| Page | URL | Purpose | Features |
|------|-----|---------|----------|
| **Admin Dashboard** | `admin-dashboard.html` | System management & analytics | 7 tabs: Overview, Customers, Payments, Subscriptions, Refunds, Email, Logs |

**How to Access:**
- From homepage: Click **🔐 Admin** button (top right)
- Direct URL: `http://localhost:3000/admin-dashboard.html`

**Admin Dashboard Tabs:**
1. 📈 **Overview** - System statistics & KPIs
2. 👥 **Customers** - Manage all customer accounts
3. 💳 **Payments** - Track payment history
4. 🔄 **Subscriptions** - Monitor active subscriptions
5. ↩️ **Refunds** - Handle refund requests
6. 📧 **Email Queue** - Monitor email delivery
7. 📋 **Audit Logs** - View system activity

---

## 📂 File Structure Overview

```
my-website/
├── index.html                          ← 🏠 Main Homepage
├── dashboard.html                      ← 📚 Learning Dashboard (Academy)
├── tutorials.html                      ← 📖 Tutorials Page
├── exercises.html                      ← 💪 Exercises Page
├── certificates.html                   ← 🎓 Certificates Page
├── pricing.html                        ← 💰 Pricing Page
├── playground.html                     ← 🎮 Code Editor
│
├── customer-register.html              ← 📝 Register
├── customer-login.html                 ← 🔐 Login
├── customer-auth.js                    ← 🔑 Auth Logic
├── otp-verify.html                     ← ✅ OTP Verification
├── payment-history.html                ← 💳 Payment History
├── payment-history.js                  ← 📊 Payment Logic
│
├── admin-dashboard.html                ← 👨‍💼 Admin Dashboard
├── ADMIN_GUIDE.md                      ← 📖 Admin Guide (THIS FILE)
│
├── server.js                           ← 🖥️ Backend Server
├── db-utils.js                         ← 🗄️ Database Functions
├── database-schema.sql                 ← 📋 Database Schema
│
├── app.js                              ← 🎯 Frontend JS Logic
├── styles.css                          ← 🎨 Styling
├── package.json                        ← 📦 Dependencies
│
├── Documentation/
│   ├── DATABASE_SETUP.md               ← 🗄️ Database Setup Guide
│   ├── DATABASE_VERIFICATION_REPORT.md ← ✅ Database Verification
│   ├── CUSTOMER_AUTH_GUIDE.md          ← 🔑 Auth Guide
│   ├── PAYMENT_SETUP.md                ← 💳 Payment Guide
│   ├── QUICK_REFERENCE.md              ← 📝 Quick Tips
│   └── IMPLEMENTATION_SUMMARY.md       ← 📊 Implementation Summary
```

---

## 🗺️ User Journey Map

### **For New Visitors**
```
index.html (Home)
    ↓
[Choose path]
    ├→ tutorials.html (Learn)
    ├→ exercises.html (Practice)
    ├→ certificates.html (Certificates)
    ├→ pricing.html (See Plans)
    ├→ customer-register.html (Sign Up)
    └→ customer-login.html (Sign In)
```

### **For Customers**
```
customer-register.html (Create Account)
    ↓
customer-login.html (Sign In)
    ↓
otp-verify.html (Verify Email)
    ↓
payment-history.html (View Payments)
    ↓
pricing.html (Buy Plan)
    ↓
dashboard.html (Track Progress)
```

### **For Admins**
```
index.html (Home)
    ↓
Click "🔐 Admin" Button
    ↓
admin-dashboard.html (Admin Panel)
    ├→ Overview Tab (System Stats)
    ├→ Customers Tab (Manage Users)
    ├→ Payments Tab (Track Revenue)
    ├→ Subscriptions Tab (Active Plans)
    ├→ Refunds Tab (Handle Requests)
    ├→ Email Queue Tab (Monitor Emails)
    └→ Audit Logs Tab (Track Activity)
```

---

## 🎯 Quick Navigation Buttons

### From Homepage (index.html)

| Button | Goes To | Purpose |
|--------|---------|---------|
| MY WEBCODE Logo | index.html | Home |
| Tutorials | tutorials.html | View courses |
| Exercises | exercises.html | Practice |
| Certificates | certificates.html | View certificates |
| Spaces | playground.html | Code editor |
| Practice | exercises.html | More exercises |
| Academy | dashboard.html | Learning tracker |
| Pricing | pricing.html | View plans |
| Customer Login | customer-login.html | Sign in |
| Register | Opens dialog | Quick register |
| 🔐 Admin | admin-dashboard.html | Admin panel |

---

## 🔑 Key Entry Points

### **Customer Flow**
1. **Sign Up:** customer-register.html
2. **Login:** customer-login.html
3. **Email Verify:** otp-verify.html
4. **Payments:** payment-history.html

### **Learning Flow**
1. **Home:** index.html
2. **Pick Course:** tutorials.html
3. **Do Exercises:** exercises.html
4. **Get Certificate:** certificates.html
5. **Track Progress:** dashboard.html

### **Admin Flow**
1. **Home:** index.html
2. **Click Admin Button:** admin-dashboard.html
3. **View/Manage Data:** Choose tab

---

## 📊 Dashboard Analytics

### **Learning Dashboard** (dashboard.html)
Shows personal learning progress:
- Courses completed
- Exercise progress
- Certificate status
- Next steps

### **Admin Dashboard** (admin-dashboard.html)
Shows system-wide analytics:
- Total customers
- Revenue
- Active subscriptions
- Email delivery status
- Refund requests
- Audit trail

---

## 🔗 Direct URL Reference

### Production URLs (when deployed)
```
Homepage:              https://my-webcode.com/
Tutorials:             https://my-webcode.com/tutorials.html
Exercises:             https://my-webcode.com/exercises.html
Pricing:               https://my-webcode.com/pricing.html
Register:              https://my-webcode.com/customer-register.html
Login:                 https://my-webcode.com/customer-login.html
Payment History:       https://my-webcode.com/payment-history.html
Learning Dashboard:    https://my-webcode.com/dashboard.html
Admin Dashboard:       https://my-webcode.com/admin-dashboard.html
```

### Local Development URLs
```
Homepage:              http://localhost:3000/
Tutorials:             http://localhost:3000/tutorials.html
Exercises:             http://localhost:3000/exercises.html
Pricing:               http://localhost:3000/pricing.html
Register:              http://localhost:3000/customer-register.html
Login:                 http://localhost:3000/customer-login.html
Payment History:       http://localhost:3000/payment-history.html
Learning Dashboard:    http://localhost:3000/dashboard.html
Admin Dashboard:       http://localhost:3000/admin-dashboard.html
```

---

## 🎨 Navigation Elements

### **Header Navigation (All Pages)**
```
[Logo] [Tutorials ▼] [Exercises] [Certificates] 
[Spaces] [Practice] [Academy] [Pricing]
[Search] [Customer Login] [Register] [Sign in] [🔐 Admin]
```

### **Customer Auth Pages**
```
[Logo] [← Back to Home] [Home] [Pricing] [Payments]
```

### **Admin Dashboard**
```
[LOGO ADMIN] [← Back to Website] [Dashboard] [Logout]
[Tabs: Overview | Customers | Payments | Subscriptions | Refunds | Email | Logs]
```

---

## 📈 Page Hierarchy

```
Level 1 - Main Hub
└── index.html (Homepage)

Level 2 - Public Content
├── tutorials.html
├── exercises.html
├── certificates.html
├── pricing.html
├── playground.html
└── dashboard.html (Learning)

Level 3 - Customer Area
├── customer-register.html
├── customer-login.html
├── otp-verify.html
└── payment-history.html

Level 4 - Admin Area
└── admin-dashboard.html
```

---

## ⚡ Quick Access Shortcuts

### **For Students**
- Home → Tutorials → Learn
- Home → Exercises → Practice
- Home → Dashboard → Track Progress
- Home → Certificates → View Achievements

### **For Paying Customers**
- Login → Payment History → View Bills
- Pricing → Buy Plan → Checkout
- Payment History → Manage Subscription

### **For Administrators**
- Home → Admin Button → Dashboard
- Overview → View System Stats
- Customers → Manage Users
- Payments → Track Revenue
- Emails → Monitor Delivery
- Logs → View Activity

---

## 🔐 Access Control (To Implement)

Currently open to all. In production, implement:

```
Public Pages:
  ✅ index.html
  ✅ tutorials.html
  ✅ exercises.html
  ✅ certificates.html
  ✅ pricing.html
  ✅ playground.html
  ✅ customer-register.html
  ✅ customer-login.html

Customer-Only Pages:
  🔒 payment-history.html (requires login)
  🔒 otp-verify.html (requires registration)
  🔒 dashboard.html (requires login)

Admin-Only Pages:
  🔒 admin-dashboard.html (requires admin auth)
```

---

## 📱 Responsive Design

All pages are responsive and work on:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🚀 How to Navigate

### From Homepage:
1. Click logo to return home from any page
2. Use navigation links for main sections
3. Click "← Back to Home" on auth pages
4. Use Admin button for management area

### Keyboard Shortcuts (Optional - Can Add):
- `Home` - Go to homepage
- `Ctrl+K` - Open search
- `Esc` - Close dialogs

---

**Last Updated:** 2026-08-11  
**Total Pages:** 14  
**Total Sections:** 4 (Public, Auth, Learning, Admin)
