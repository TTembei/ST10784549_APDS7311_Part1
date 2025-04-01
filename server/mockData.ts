import bcrypt from 'bcryptjs';

// Pre-registered employee credentials
export const preRegisteredEmployee = {
  username: 'employee1',
  accountNumber: '1234567890',
  password: 'Employee@123', // This will be hashed
  role: 'employee'
};

// Hash the password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Mock payment data
const mockPayments = [
  {
    id: '1',
    amount: '15000.00',
    currency: 'ZAR',
    recipientName: 'John Smith',
    recipientAccount: '9876543210',
    swiftCode: 'NEDBZAZX',
    status: 'pending',
    createdAt: '2024-03-30T10:00:00Z',
    userId: 'employee1'
  },
  {
    id: '2',
    amount: '25000.00',
    currency: 'ZAR',
    recipientName: 'Sarah Johnson',
    recipientAccount: '8765432109',
    swiftCode: 'FNBZAZX',
    status: 'verified',
    createdAt: '2024-03-29T15:30:00Z',
    userId: 'employee1'
  },
  {
    id: '3',
    amount: '5000.00',
    currency: 'ZAR',
    recipientName: 'Michael Brown',
    recipientAccount: '7654321098',
    swiftCode: 'ABSAZAZX',
    status: 'completed',
    createdAt: '2024-03-28T09:15:00Z',
    userId: 'employee1'
  }
];

// Initialize mock database with pre-registered employee
export const initializeMockDatabase = async () => {
  const users = new Map();
  const payments = new Map();

  // Hash the employee password
  const hashedPassword = await hashPassword(preRegisteredEmployee.password);
  
  // Add employee to users map
  users.set(preRegisteredEmployee.username, {
    ...preRegisteredEmployee,
    password: hashedPassword
  });

  // Add mock payments to payments map
  mockPayments.forEach(payment => {
    payments.set(payment.id, payment);
  });

  return { users, payments };
}; 