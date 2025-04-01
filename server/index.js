require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Supported currencies
const SUPPORTED_CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP'];

// In-memory storage (replace with database in production)
const users = [];
const payments = [];

// Add a default employee account
const defaultEmployee = {
  id: 'emp1',
  username: 'employee1',
  accountNumber: '123456789',
  password: bcrypt.hashSync('employee123', 10),
  role: 'employee'
};
users.push(defaultEmployee);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is employee
const isEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: 'Access denied. Employee only.' });
  }
  next();
};

// Validation middleware
const validateRegistration = [
  body('username').isLength({ min: 3, max: 20 }).trim().escape(),
  body('accountNumber').isLength({ min: 8, max: 12 }).isNumeric(),
  body('password').isLength({ min: 8 })
];

const validateLogin = [
  body('username').trim().escape(),
  body('accountNumber').isNumeric(),
  body('password').notEmpty()
];

const validatePayment = [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isIn(SUPPORTED_CURRENCIES).withMessage('Unsupported currency. Supported currencies are: ' + SUPPORTED_CURRENCIES.join(', ')),
  body('provider').notEmpty(),
  body('accountInfo').notEmpty(),
  body('swiftCode').matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/).withMessage('Invalid SWIFT code format')
];

// Routes
app.post('/api/auth/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, accountNumber, password } = req.body;

    // Check if user already exists
    if (users.find(u => u.username === username || u.accountNumber === accountNumber)) {
      return res.status(400).json({ error: 'Username or account number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      username,
      accountNumber,
      password: hashedPassword,
      role: 'customer'
    };

    users.push(user);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, accountNumber, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username && u.accountNumber === accountNumber);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        accountNumber: user.accountNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Payment routes
app.post('/api/payments', authenticateToken, validatePayment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency, provider, accountInfo, swiftCode } = req.body;

    const payment = {
      id: Date.now().toString(),
      amount,
      currency: currency || 'ZAR', // Default to ZAR if not specified
      provider,
      accountInfo,
      swiftCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: req.user.id,
      username: req.user.username
    };

    payments.push(payment);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payments (filtered by role)
app.get('/api/payments', authenticateToken, (req, res) => {
  try {
    let userPayments;
    if (req.user.role === 'employee') {
      // Employees can see all payments
      userPayments = payments;
    } else {
      // Customers can only see their own payments
      userPayments = payments.filter(p => p.userId === req.user.id);
    }
    res.json(userPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status (employee only)
app.post('/api/payments/:id/verify', authenticateToken, isEmployee, (req, res) => {
  try {
    const payment = payments.find(p => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = 'verified';
    res.json(payment);
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit payment to SWIFT (employee only)
app.post('/api/payments/:id/submit', authenticateToken, isEmployee, (req, res) => {
  try {
    const payment = payments.find(p => p.id === req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'verified') {
      return res.status(400).json({ error: 'Payment must be verified first' });
    }

    payment.status = 'completed';
    res.json(payment);
  } catch (error) {
    console.error('SWIFT submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supported currencies
app.get('/api/currencies', (req, res) => {
  res.json(SUPPORTED_CURRENCIES);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 