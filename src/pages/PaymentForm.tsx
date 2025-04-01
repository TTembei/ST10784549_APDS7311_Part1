import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
} from '@mui/material';
import { validateInput } from '../utils/validation';
import { paymentService } from '../services/api';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
const providers = ['SWIFT'];

const PaymentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    accountInfo: '',
    swiftCode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs
    if (!validateInput.amount(formData.amount)) {
      setError('Invalid amount format');
      return;
    }
    if (!validateInput.swiftCode(formData.swiftCode)) {
      setError('Invalid SWIFT code format');
      return;
    }

    try {
      const paymentData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        provider: formData.provider,
        accountInfo: formData.accountInfo,
        swiftCode: formData.swiftCode,
      };

      await paymentService.createPayment(paymentData);
      setSuccess('Payment created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Payment creation failed. Please try again.');
      console.error('Payment creation error:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Create International Payment
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              type="number"
              inputProps={{ step: "0.01" }}
              autoFocus
              value={formData.amount}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              id="currency"
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              select
              id="provider"
              label="Provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
            >
              {providers.map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              id="accountInfo"
              label="Account Information"
              name="accountInfo"
              value={formData.accountInfo}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="swiftCode"
              label="SWIFT Code"
              name="swiftCode"
              value={formData.swiftCode}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create Payment
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentForm; 