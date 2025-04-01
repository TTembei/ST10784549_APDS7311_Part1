export const validateInput = {
  username: (username: string): boolean => {
    // Username should be 3-20 characters, alphanumeric with underscores
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  },
  accountNumber: (accountNumber: string): boolean => {
    // Account number should be 8-12 digits
    return /^\d{8,12}$/.test(accountNumber);
  },
  password: (password: string): boolean => {
    // Password must be at least 8 characters, contain at least one number,
    // one uppercase letter, one lowercase letter, and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  },
  amount: (amount: string): boolean => {
    // Amount should be a positive number with up to 2 decimal places
    return /^\d+(\.\d{1,2})?$/.test(amount);
  },
  swiftCode: (swiftCode: string): boolean => {
    // SWIFT code should be 8 or 11 characters
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swiftCode);
  }
}; 