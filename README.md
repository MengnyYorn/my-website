# My Website

A comprehensive web application featuring customer authentication, payment processing, admin dashboard, and subscription management.

## Features

- **Customer Authentication**: Secure login and registration system with OTP verification
- **Admin Dashboard**: Complete administration panel for managing users and operations
- **Payment Integration**: PayPal integration for online payments and subscription management
- **Recurring Subscriptions**: Support for recurring billing and subscription management
- **Email Notifications**: Automated email notifications for important events
- **Refund System**: Automated refund processing and management
- **Payment History**: Complete transaction and payment history tracking
- **Database**: Robust SQL database with comprehensive schema

## Project Structure

```
├── index.html                 # Main landing page
├── admin-dashboard.html       # Admin dashboard interface
├── customer-login.html        # Customer login page
├── customer-register.html     # Customer registration page
├── otp-verify.html           # OTP verification page
├── payment-history.html      # Payment history display
├── certificates.html         # Certificates page
├── pricing.html              # Pricing information
├── exercises.html            # Exercises/tutorials
├── tutorials.html            # Tutorial resources
├── playground.html           # Interactive playground
│
├── app.js                    # Main application logic
├── server.js                 # Express.js server
├── db-utils.js              # Database utilities
│
├── customer-auth.js         # Customer authentication logic
├── admin-auth.js            # Admin authentication logic
│
├── paypal-integration.js    # PayPal payment integration
├── payment-history.js       # Payment history management
├── recurring-subscriptions.js # Subscription management
├── refund-system.js         # Refund processing
├── email-notifications.js   # Email notification service
│
├── database-schema.sql      # Database schema definition
├── styles.css               # Global styles
└── package.json             # Project dependencies
```

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:setup
```

4. Configure environment variables (create `.env` file):
```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
MAIL_SERVICE=your_mail_service
MAIL_USER=your_email
MAIL_PASS=your_password
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_website
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Authentication

### Customer Authentication
- Registration: `/customer-register.html`
- Login: `/customer-login.html`
- OTP Verification: `/otp-verify.html`

### Admin Access
- Dashboard: `/admin-dashboard.html`
- Requires admin credentials

## Payment Processing

This application integrates with PayPal for:
- Single payments
- Recurring subscriptions
- Refund processing
- Payment history tracking

## Database

The application uses MySQL with a comprehensive schema. See `database-schema.sql` for details.

Key tables:
- `users` - Customer information
- `admins` - Admin users
- `payments` - Payment records
- `subscriptions` - Subscription data
- `refunds` - Refund history

## Email Notifications

Automated emails are sent for:
- Registration confirmation
- Payment receipts
- Subscription updates
- Refund notifications

## Documentation

- [Admin Guide](./ADMIN_GUIDE.md) - Administrator documentation
- [Customer Auth Guide](./CUSTOMER_AUTH_GUIDE.md) - Authentication guide
- [Payment Setup](./PAYMENT_SETUP.md) - Payment configuration
- [Database Setup](./DATABASE_SETUP.md) - Database initialization
- [Quick Reference](./QUICK_REFERENCE.md) - Quick start guide
- [Website Map](./WEBSITE_MAP.md) - Site structure overview

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Payment**: PayPal API
- **Email**: NodeMailer or similar service

## License

[Add your license information here]

## Support

For issues or questions, please create an issue in the repository.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.
