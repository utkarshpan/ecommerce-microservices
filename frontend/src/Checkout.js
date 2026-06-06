import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';

function Checkout({ cart, getCartTotal, onOrderPlaced, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    zip: '',
    phone: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zip || !shippingInfo.phone) {
      setError('Please fill all shipping fields');
      return false;
    }
    if (shippingInfo.phone.length < 10) {
      setError('Please enter valid phone number');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv || !paymentInfo.name) {
      setError('Please fill all payment fields');
      return false;
    }
    if (paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter valid card number');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          total_amount: getCartTotal(),
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_zip: shippingInfo.zip,
          phone: shippingInfo.phone
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setOrderId(data.orderId);
        setOrderComplete(true);
        onOrderPlaced();
        setActiveStep(2);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateShipping()) {
        setActiveStep(1);
        setError(null);
      }
    } else if (activeStep === 1) {
      if (validatePayment()) {
        placeOrder();
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError(null);
  };

  const steps = ['Shipping Information', 'Payment Details', 'Order Confirmation'];

  if (orderComplete) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            🎉 Order Placed Successfully!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Order ID: #{orderId}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for your purchase! You will receive an email confirmation shortly.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            {activeStep === 0 && (
              <>
                <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zip"
                  value={shippingInfo.zip}
                  onChange={handleShippingChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  margin="normal"
                  required
                />
              </>
            )}
            
            {activeStep === 1 && (
              <>
                <Typography variant="h6" gutterBottom>Payment Details</Typography>
                <TextField
                  fullWidth
                  label="Card Number"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentChange}
                  margin="normal"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expiry"
                      value={paymentInfo.expiry}
                      onChange={handlePaymentChange}
                      margin="normal"
                      placeholder="MM/YY"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={handlePaymentChange}
                      margin="normal"
                      type="password"
                      required
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Name on Card"
                  name="name"
                  value={paymentInfo.name}
                  onChange={handlePaymentChange}
                  margin="normal"
                  required
                />
              </>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (activeStep === 1 ? 'Place Order' : 'Next')}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            <Divider />
            {cart.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography variant="body2">
                  {item.name} x {item.quantity}
                </Typography>
                <Typography variant="body2">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${getCartTotal()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Checkout;