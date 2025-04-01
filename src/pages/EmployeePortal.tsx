import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Payment, PaymentStatus } from '../types';

const EmployeePortal = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalPending: 0,
    totalVerified: 0,
    totalCompleted: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    // TODO: Implement API call to fetch payments
    // For now, we'll use dummy data
    const dummyPayments: Payment[] = [
      {
        id: '1',
        amount: 1000,
        currency: 'USD',
        provider: 'SWIFT',
        accountInfo: '1234567890',
        swiftCode: 'NEDSZAJJ',
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: 'user1',
      },
      {
        id: '2',
        amount: 2500,
        currency: 'EUR',
        provider: 'SWIFT',
        accountInfo: '0987654321',
        swiftCode: 'HSBCGB2L',
        status: 'verified',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userId: 'user1',
      },
      {
        id: '3',
        amount: 500,
        currency: 'GBP',
        provider: 'SWIFT',
        accountInfo: '5555555555',
        swiftCode: 'DEUTDEFF',
        status: 'completed',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        userId: 'user1',
      },
    ];

    setPayments(dummyPayments);

    // Calculate statistics
    const totalPending = dummyPayments.filter(p => p.status === 'pending').length;
    const totalVerified = dummyPayments.filter(p => p.status === 'verified').length;
    const totalCompleted = dummyPayments.filter(p => p.status === 'completed').length;
    const totalAmount = dummyPayments.reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalPending,
      totalVerified,
      totalCompleted,
      totalAmount,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedPayment) return;

    try {
      // TODO: Implement API call to verify payment
      // For now, we'll simulate the verification
      const updatedPayments = payments.map(payment =>
        payment.id === selectedPayment.id
          ? { ...payment, status: 'verified' as PaymentStatus }
          : payment
      );
      setPayments(updatedPayments);
      setSuccess('Payment verified successfully');
      setVerifyDialogOpen(false);
      setSelectedPayment(null);
    } catch (err) {
      setError('Failed to verify payment');
    }
  };

  const handleSubmitToSWIFT = async (payment: Payment) => {
    try {
      // TODO: Implement API call to submit to SWIFT
      // For now, we'll simulate the submission
      const updatedPayments = payments.map(p =>
        p.id === payment.id
          ? { ...p, status: 'completed' as PaymentStatus }
          : p
      );
      setPayments(updatedPayments);
      setSuccess('Payment submitted to SWIFT successfully');
    } catch (err) {
      setError('Failed to submit payment to SWIFT');
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.swiftCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'verified':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Employee Payment Verification Portal
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Security Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <SecurityIcon sx={{ mr: 1 }} />
        All transactions are monitored and logged for security purposes.
      </Alert>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Pending Verifications
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalPending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <VerifiedIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Verified Payments
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalVerified}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Completed Payments
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalCompleted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Total Amount
                </Typography>
              </Box>
              <Typography variant="h4">
                ${stats.totalAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by currency, provider, or SWIFT code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>SWIFT Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${payment.amount.toLocaleString()}</TableCell>
                <TableCell>{payment.currency}</TableCell>
                <TableCell>{payment.provider}</TableCell>
                <TableCell>{payment.swiftCode}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {payment.status === 'pending' && (
                    <Tooltip title="Verify Payment">
                      <IconButton
                        color="primary"
                        onClick={() => handleVerifyClick(payment)}
                      >
                        <VerifiedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {payment.status === 'verified' && (
                    <Tooltip title="Submit to SWIFT">
                      <IconButton
                        color="success"
                        onClick={() => handleSubmitToSWIFT(payment)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)}>
        <DialogTitle>Verify Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to verify this payment? This action cannot be undone.
          </Typography>
          {selectedPayment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Payment Details:</Typography>
              <Typography>Amount: ${selectedPayment.amount.toLocaleString()}</Typography>
              <Typography>Currency: {selectedPayment.currency}</Typography>
              <Typography>SWIFT Code: {selectedPayment.swiftCode}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleVerifyConfirm} color="primary" variant="contained">
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeePortal; 