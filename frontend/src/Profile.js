import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person } from '@mui/icons-material';

function Profile({ user, token, onProfileUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setUpdating(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok) {
        onProfileUpdate(data);
        setMessage({ text: 'Profile updated!', severity: 'success' });
      } else {
        setMessage({ text: data.error, severity: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Update failed', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      {message && (
        <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#f50057' }}>
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5">My Profile</Typography>
        </Box>
        
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Email"
          value={user?.email || ''}
          disabled
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={updateProfile}
          disabled={updating}
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Order History</Typography>
        <Divider sx={{ mb: 2 }} />
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Typography align="center" color="text.secondary" py={4}>
            No orders yet. Start shopping!
          </Typography>
        ) : (
          orders.map((order) => (
            <Card key={order.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Order #{order.id}</Typography>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date: {new Date(order.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Shipping: {order.shipping_address || 'Not specified'}
                </Typography>
                <Divider sx={{ my: 1 }} />
                {order.items && order.items.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" sx={{ py: 0.5 }}>
                    <Typography variant="body2">
                      {item.product_name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="subtitle1">Total:</Typography>
                  <Typography variant="subtitle1" color="primary">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Paper>
    </Container>
  );
}

export default Profile;