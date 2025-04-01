export type PaymentStatus = 'pending' | 'verified' | 'completed';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  accountInfo: string;
  swiftCode: string;
  status: PaymentStatus;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  accountNumber: string;
  role: 'customer' | 'employee';
} 