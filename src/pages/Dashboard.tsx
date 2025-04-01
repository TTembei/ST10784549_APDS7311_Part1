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
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { Payment } from '../types';
import { paymentService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingPayments: 0,
    completedPayments: 0,
    averageAmount: 0,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const fetchedPayments = await paymentService.getPayments();
        setPayments(fetchedPayments);

        // Calculate statistics
        const total = fetchedPayments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
        const pending = fetchedPayments.filter((p: Payment) => p.status === 'pending').length;
        const completed = fetchedPayments.filter((p: Payment) => p.status === 'completed').length;
        const average = fetchedPayments.length > 0 ? total / fetchedPayments.length : 0;

        setStats({
          totalAmount: total,
          pendingPayments: pending,
          completedPayments: completed,
          averageAmount: average,
        });
      } catch (err) {
        setError('Failed to fetch payments. Please try again later.');
        console.error('Error fetching payments:', err);
      }
    };

    fetchPayments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    handleFilterClose();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.swiftCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
            International Payments Dashboard
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/payment')}
              sx={{ mr: 2 }}
            >
              New Payment
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
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
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Pending Payments
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.pendingPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SwapHorizIcon color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Completed Payments
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.completedPayments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Average Amount
                </Typography>
              </Box>
              <Typography variant="h4">
                ${stats.averageAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={handleFilterClick}
        >
          Filter
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterChange('all')}>All</MenuItem>
          <MenuItem onClick={() => handleFilterChange('pending')}>Pending</MenuItem>
          <MenuItem onClick={() => handleFilterChange('verified')}>Verified</MenuItem>
          <MenuItem onClick={() => handleFilterChange('completed')}>Completed</MenuItem>
        </Menu>
      </Box>

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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard; 