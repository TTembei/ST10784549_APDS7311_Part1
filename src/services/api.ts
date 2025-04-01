import axios from 'axios';
import { User, Payment } from '../types';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Input validation patterns
const validationPatterns = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  accountNumber: /^\d{8,12}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
};

// Validate input against pattern
const validateInput = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

// Sanitize input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};

export const authService = {
  login: async (credentials: { username: string; accountNumber: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: { username: string; accountNumber: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export const paymentService = {
  createPayment: async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'userId' | 'status'>) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  },

  getPayments: async () => {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  verifyPayment: async (paymentId: string) => {
    try {
      const response = await api.post(`/payments/${paymentId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  submitToSWIFT: async (paymentId: string) => {
    try {
      const response = await api.post(`/payments/${paymentId}/submit`);
      return response.data;
    } catch (error) {
      console.error('SWIFT submission error:', error);
      throw error;
    }
  },
};

// Rate limiting configuration
const rateLimiter = {
  maxRequests: 100,
  timeWindow: 60000, // 1 minute
  requests: new Map<string, number[]>(),
};

// Rate limiting middleware
export const rateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = rateLimiter.requests.get(userId) || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter(
    time => now - time < rateLimiter.timeWindow
  );
  
  if (recentRequests.length >= rateLimiter.maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.requests.set(userId, recentRequests);
  return true;
};

export default api; 