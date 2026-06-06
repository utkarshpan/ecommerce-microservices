import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CardMedia,
  CircularProgress,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Avatar,
  Menu,
  MenuItem,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Slider,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { 
  ShoppingCart, 
  Add, 
  Remove, 
  Person, 
  Search, 
  FilterList,
  Category,
  AttachMoney,
  Close
} from '@mui/icons-material';
import Profile from './Profile';
import Checkout from './Checkout';
import Orders from './Orders';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [openCart, setOpenCart] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [categories, setCategories] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [openAuth, setOpenAuth] = useState(false);
  const [authTab, setAuthTab] = useState(0);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    checkAuth();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, priceRange, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/products?';
      if (selectedCategory !== 'All') {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (priceRange[0] > 0) {
        url += `minPrice=${priceRange[0]}&`;
      }
      if (priceRange[1] < 1000) {
        url += `maxPrice=${priceRange[1]}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      
      const res = await fetch(url);
      const responseData = await res.json();
      
      // Handle both response formats: { success: true, data: [...] } or direct array
      let productsArray = [];
      if (Array.isArray(responseData)) {
        productsArray = responseData;
      } else if (responseData.success && Array.isArray(responseData.data)) {
        productsArray = responseData.data;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        productsArray = responseData.data;
      } else {
        productsArray = [];
      }
      
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const responseData = await res.json();
      
      let categoriesArray = [];
      if (Array.isArray(responseData)) {
        categoriesArray = responseData;
      } else if (responseData.success && Array.isArray(responseData.data)) {
        categoriesArray = responseData.data;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        categoriesArray = responseData.data;
      } else {
        categoriesArray = [];
      }
      
      setCategories(['All', ...categoriesArray]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const responseData = await res.json();
          // Handle response format
          const userData = responseData.data || responseData;
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        const userData = data.data || data.user;
        localStorage.setItem('token', data.token || (data.data && data.data.token));
        setUser(userData);
        setOpenAuth(false);
        setAuthForm({ name: '', email: '', password: '' });
        setShowProfile(false);
        setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.error || data.message || 'Login failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Login failed', severity: 'error' });
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: authForm.name, 
          email: authForm.email, 
          password: authForm.password 
        })
      });
      const data = await res.json();
      if (res.ok) {
        const userData = data.data || data.user;
        localStorage.setItem('token', data.token || (data.data && data.data.token));
        setUser(userData);
        setOpenAuth(false);
        setAuthForm({ name: '', email: '', password: '' });
        setSnackbar({ open: true, message: 'Account created!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.error || data.message || 'Signup failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Signup failed', severity: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAnchorEl(null);
    setShowProfile(false);
    setSnackbar({ open: true, message: 'Logged out', severity: 'success' });
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSnackbar({ open: true, message: `${product.name} added to cart!`, severity: 'success' });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const addProduct = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          category: newProduct.category || 'Uncategorized'
        })
      });
      const data = await res.json();
      const newProductData = data.data || data;
      setProducts([...products, newProductData]);
      setFilteredProducts([...products, newProductData]);
      setOpenProduct(false);
      setNewProduct({ name: '', price: '', stock: '', category: '' });
      setSnackbar({ open: true, message: 'Product added successfully!', severity: 'success' });
      fetchCategories();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error adding product', severity: 'error' });
    }
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 1000]);
    setSearchQuery('');
  };

  const FiltersDrawer = () => (
    <Drawer anchor="left" open={openFilters} onClose={() => setOpenFilters(false)}>
      <Box sx={{ width: 280, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setOpenFilters(false)}>
            <Close />
          </IconButton>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Category fontSize="small" /> Category
        </Typography>
        <List dense>
          {categories.map((cat) => (
            <ListItem
              key={cat}
              component="div"
              onClick={() => setSelectedCategory(cat)}
              sx={{
                bgcolor: selectedCategory === cat ? '#e3f2fd' : 'transparent',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <ListItemText primary={cat} />
            </ListItem>
          ))}
        </List>
        
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <AttachMoney fontSize="small" /> Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, newValue) => setPriceRange(newValue)}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          sx={{ mt: 2 }}
        />
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="body2">${priceRange[0]}</Typography>
          <Typography variant="body2">${priceRange[1]}</Typography>
        </Box>
        
        <Button
          fullWidth
          variant="outlined"
          onClick={clearFilters}
          sx={{ mt: 3 }}
        >
          Clear All Filters
        </Button>
      </Box>
    </Drawer>
  );

  const SearchBar = () => (
    <Box sx={{ flexGrow: 1, mx: 2, maxWidth: 400 }}>
      <TextField
        size="small"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          bgcolor: 'white',
          borderRadius: 1,
          width: '100%',
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: 'none' }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );

  // Checkout Page View
  if (showCheckout) {
    return (
      <>
        <AppBar position="sticky" sx={{ bgcolor: '#1a1a2e' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowCheckout(false)}>
              🛒 ShopEase
            </Typography>
            <IconButton color="inherit" onClick={() => setShowCheckout(false)}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Checkout 
          cart={cart} 
          getCartTotal={getCartTotal} 
          onOrderPlaced={() => { setCart([]); }}
          onClose={() => setShowCheckout(false)}
        />
      </>
    );
  }

  // Orders Page View
  if (showOrders) {
    return (
      <>
        <AppBar position="sticky" sx={{ bgcolor: '#1a1a2e' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowOrders(false)}>
              🛒 ShopEase
            </Typography>
            <IconButton color="inherit" onClick={() => setShowOrders(false)}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Orders token={token} />
      </>
    );
  }

  // Profile Page View
  if (showProfile && user) {
    return (
      <>
        <AppBar position="sticky" sx={{ bgcolor: '#1a1a2e' }}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => setOpenFilters(true)}>
              <FilterList />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowProfile(false)}>
              🛒 ShopEase
            </Typography>
            <SearchBar />
            <IconButton color="inherit" onClick={() => setOpenCart(true)}>
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#f50057' }}>
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { setShowProfile(true); setAnchorEl(null); }}>My Profile</MenuItem>
              <MenuItem onClick={() => { setShowOrders(true); setAnchorEl(null); setShowProfile(false); }}>My Orders</MenuItem>
              <MenuItem onClick={() => { setOpenProduct(true); setAnchorEl(null); }}>Add Product</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <FiltersDrawer />
        <Profile user={user} token={token} onProfileUpdate={handleProfileUpdate} />
        
        <Dialog open={openCart} onClose={() => setOpenCart(false)} maxWidth="md" fullWidth>
          <DialogTitle>Shopping Cart ({cart.length} items)</DialogTitle>
          <DialogContent>
            {cart.length === 0 ? (
              <Typography align="center" sx={{ py: 4 }}>Your cart is empty</Typography>
            ) : (
              cart.map(item => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Typography variant="body2" color="primary">${item.price}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                      <Remove />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                      <Add />
                    </IconButton>
                    <Button size="small" color="error" onClick={() => removeFromCart(item.id)} sx={{ ml: 2 }}>
                      Remove
                    </Button>
                  </Box>
                </Box>
              ))
            )}
            {cart.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid #eee' }}>
                <Typography variant="h6">Total: ${getCartTotal()}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCart(false)}>Continue Shopping</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => { setOpenCart(false); setShowCheckout(true); }} 
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openProduct} onClose={() => setOpenProduct(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Product Name"
              margin="normal"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              margin="normal"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <TextField
              fullWidth
              label="Stock"
              type="number"
              margin="normal"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <TextField
              fullWidth
              label="Category"
              margin="normal"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              placeholder="Electronics, Clothing, Books, etc."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenProduct(false)}>Cancel</Button>
            <Button onClick={addProduct} variant="contained" color="primary">Add Product</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Main Store View
  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: '#1a1a2e' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpenFilters(true)}>
            <FilterList />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 0, fontWeight: 'bold' }}>
            🛒 ShopEase
          </Typography>
          <SearchBar />
          <IconButton color="inherit" onClick={() => setOpenCart(true)}>
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {user ? (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#f50057' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setShowProfile(true); setAnchorEl(null); }}>My Profile</MenuItem>
                <MenuItem onClick={() => { setShowOrders(true); setAnchorEl(null); }}>My Orders</MenuItem>
                <MenuItem onClick={() => { setOpenProduct(true); setAnchorEl(null); }}>Add Product</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => setOpenAuth(true)} startIcon={<Person />}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <FiltersDrawer />

      <Container sx={{ py: 4 }}>
        {/* Active Filters Chips */}
        {(selectedCategory !== 'All' || priceRange[0] > 0 || priceRange[1] < 1000 || searchQuery) && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedCategory !== 'All' && (
              <Chip label={`Category: ${selectedCategory}`} onDelete={() => setSelectedCategory('All')} />
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Chip label={`Price: $${priceRange[0]} - $${priceRange[1]}`} onDelete={() => setPriceRange([0, 1000])} />
            )}
            {searchQuery && (
              <Chip label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />
            )}
            <Chip label="Clear All" onClick={clearFilters} color="primary" variant="outlined" />
          </Box>
        )}

        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Featured Products
        </Typography>
        
        {(!filteredProducts || filteredProducts.length === 0) && !loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              No products found
            </Typography>
            <Button variant="text" onClick={clearFilters} sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts && filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      bgcolor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}
                  >
                    🏷️
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {product.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {product.stock} units
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Auth Dialog */}
      <Dialog open={openAuth} onClose={() => setOpenAuth(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Tabs value={authTab} onChange={(e, v) => setAuthTab(v)}>
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
        </DialogTitle>
        <DialogContent>
          {authTab === 0 ? (
            <>
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuth(false)}>Cancel</Button>
          <Button variant="contained" onClick={authTab === 0 ? handleLogin : handleSignup}>
            {authTab === 0 ? 'Login' : 'Sign Up'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={openCart} onClose={() => setOpenCart(false)} maxWidth="md" fullWidth>
        <DialogTitle>Shopping Cart ({cart.length} items)</DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Typography align="center" sx={{ py: 4 }}>Your cart is empty</Typography>
          ) : (
            cart.map(item => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Box>
                  <Typography variant="subtitle1">{item.name}</Typography>
                  <Typography variant="body2" color="primary">${item.price}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                    <Remove />
                  </IconButton>
                  <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                    <Add />
                  </IconButton>
                  <Button size="small" color="error" onClick={() => removeFromCart(item.id)} sx={{ ml: 2 }}>
                    Remove
                  </Button>
                </Box>
              </Box>
            ))
          )}
          {cart.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid #eee' }}>
              <Typography variant="h6">Total: ${getCartTotal()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCart(false)}>Continue Shopping</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => { setOpenCart(false); setShowCheckout(true); }} 
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={openProduct} onClose={() => setOpenProduct(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Product Name"
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <TextField
            fullWidth
            label="Stock"
            type="number"
            margin="normal"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
          <TextField
            fullWidth
            label="Category"
            margin="normal"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            placeholder="Electronics, Clothing, Books, Home"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProduct(false)}>Cancel</Button>
          <Button onClick={addProduct} variant="contained" color="primary">Add Product</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;