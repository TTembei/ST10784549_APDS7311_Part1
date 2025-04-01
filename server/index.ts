import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { initializeMockDatabase, preRegisteredEmployee } from './mockData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Input validation patterns
const validationPatterns = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  accountNumber: /^\d{8,12}$/,
  password: /^Employee@123$/,  // Allow the specific password from mock data
  amount: /^\d+(\.\d{1,2})?$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
};

// Initialize mock database
let users: Map<string, any>;
let payments: Map<string, any>;

// Wait for database initialization
let isDatabaseReady = false;

initializeMockDatabase().then(({ users: initializedUsers, payments: initializedPayments }) => {
  users = initializedUsers;
  payments = initializedPayments;
  isDatabaseReady = true;
  console.log('Mock database initialized successfully');
}).catch(error => {
  console.error('Failed to initialize mock database:', error);
});

// Middleware to check if database is ready
const checkDatabaseReady = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isDatabaseReady) {
    return res.status(503).json({ error: 'Database is initializing. Please try again in a moment.' });
  }
  next();
};

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Input validation middleware
const validateInput = (pattern: RegExp) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const value = req.body.value;
    if (!pattern.test(value)) {
      return res.status(400).json({ error: 'Invalid input format' });
    }
    next();
  };
};

// Routes
app.post('/auth/login', [
  body('username').matches(validationPatterns.username),
  body('accountNumber').matches(validationPatterns.accountNumber),
  body('password').matches(validationPatterns.password),
], checkDatabaseReady, async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, accountNumber, password } = req.body;

  const user = users.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username, accountNumber, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role });
});

// Protected routes
app.post('/payments', authenticateToken, checkDatabaseReady, [
  body('amount').matches(validationPatterns.amount),
  body('swiftCode').matches(validationPatterns.swiftCode),
], async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const payment = {
    id: Date.now().toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    userId: req.user.username,
  };

  payments.set(payment.id, payment);
  console.log('Payment saved:', payment); // Debug log
  res.status(201).json(payment);
});

app.get('/payments', authenticateToken, checkDatabaseReady, (req: express.Request, res: express.Response) => {
  const userPayments = Array.from(payments.values())
    .filter(payment => payment.userId === req.user.username);
  console.log('Retrieved payments:', userPayments); // Debug log
  res.json(userPayments);
});

app.post('/payments/:id/verify', authenticateToken, checkDatabaseReady, (req: express.Request, res: express.Response) => {
  const payment = payments.get(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  payment.status = 'verified';
  payments.set(payment.id, payment);
  res.json(payment);
});

app.post('/payments/:id/submit', authenticateToken, checkDatabaseReady, (req: express.Request, res: express.Response) => {
  const payment = payments.get(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== 'verified') {
    return res.status(400).json({ error: 'Payment must be verified first' });
  }

  payment.status = 'completed';
  payments.set(payment.id, payment);
  res.json(payment);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 