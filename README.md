# International Payment System (IPS)

A secure and efficient system for processing international payments with separate customer and employee portals.

## Features

### Customer Portal
- User registration and authentication
- Create new international payments
- View payment history and status
- Real-time payment tracking
- Dashboard with payment statistics
- Search and filter payment history

### Employee Portal
- Secure employee authentication
- View all customer payments
- Verify payment details
- Submit payments to SWIFT
- Comprehensive payment monitoring
- Payment status management

## Technical Stack

### Frontend
- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express
- JWT for authentication
- Express Validator for input validation
- Helmet for security headers
- Rate limiting for API protection

## Supported Currencies
- ZAR (South African Rand) - Default currency
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ips
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Create a `.env` file in the server directory:
```env
PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
# In a new terminal
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Default Accounts

### Employee Account
- Username: employee1
- Account Number: 123456789
- Password: employee123

### Customer Account
- Register a new account through the registration page

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new customer
- POST `/api/auth/login` - Login user

### Payments
- POST `/api/payments` - Create new payment
- GET `/api/payments` - Get payments (filtered by role)
- POST `/api/payments/:id/verify` - Verify payment (employee only)
- POST `/api/payments/:id/submit` - Submit to SWIFT (employee only)
- GET `/api/currencies` - Get supported currencies

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- Security headers with Helmet
- CORS protection
- Role-based access control

## Payment Workflow
1. Customer creates payment (status: pending)
2. Employee verifies payment details (status: verified)
3. Employee submits to SWIFT (status: completed)
4. Customer can track payment status

## Development

### Project Structure
```
ips/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── App.tsx
├── server/
│   ├── index.js
│   └── .env
└── package.json
```

### TypeScript Configuration
- Strict type checking enabled
- React JSX support
- Path aliases configured
- Modern ES2020 target

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
