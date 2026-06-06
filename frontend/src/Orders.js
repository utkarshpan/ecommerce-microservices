import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';

function Orders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedOrder(data);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (res.ok) {
        setMessage({ text: 'Order cancelled successfully', severity: 'success' });
        fetchOrders();
        if (selectedOrder) setOpenDialog(false);
      } else {
        const data = await res.json();
        setMessage({ text: data.error, severity: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to cancel order', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        My Orders
      </Typography>
      
      {message && (
        <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}
      
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No orders yet
          </Typography>
          <Button variant="contained" href="/" sx={{ mt: 2 }}>
            Start Shopping
          </Button>
        </Paper>
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="h6">Order #{order.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Chip 
                    label={order.status.toUpperCase()} 
                    color={getStatusColor(order.status)}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="h6" color="primary" display="inline">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="body2" gutterBottom>
                Shipping to: {order.shipping_address}, {order.shipping_city} - {order.shipping_zip}
              </Typography>
              
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button 
                  size="small" 
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  View Details
                </Button>
                {order.status === 'pending' && (
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => cancelOrder(order.id)}
                    sx={{ ml: 1 }}
                  >
                    Cancel Order
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details #{selectedOrder.id}
              <Chip 
                label={selectedOrder.status.toUpperCase()} 
                color={getStatusColor(selectedOrder.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>Items:</Typography>
              {selectedOrder.items && selectedOrder.items.map((item) => (
                <Box key={item.id} display="flex" justifyContent="space-between" sx={{ py: 1 }}>
                  <Typography variant="body2">
                    {item.product_name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>Shipping Information:</Typography>
              <Typography variant="body2">{selectedOrder.shipping_address}</Typography>
              <Typography variant="body2">{selectedOrder.shipping_city} - {selectedOrder.shipping_zip}</Typography>
              <Typography variant="body2">Phone: {selectedOrder.phone}</Typography>
              
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              {selectedOrder.status === 'pending' && (
                <Button color="error" onClick={() => cancelOrder(selectedOrder.id)}>
                  Cancel Order
                </Button>
              )}
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Orders;