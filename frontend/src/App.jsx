import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext.jsx';
import { 
  ShoppingCart, User as UserIcon, LogOut, Plus, Edit2, Trash2, 
  Search, ArrowLeft, CheckCircle, XCircle, Package, Lock, 
  MapPin, CreditCard, ArrowRight, Filter, Sparkles, TrendingUp, 
  Layers, Settings, AlertCircle, Check, ShoppingBag, Eye, Mail, Phone
} from 'lucide-react';

function App() {
  const {
    user, token, cart, products, categories, loadingProducts,
    myOrders, allOrders, billingDetails, setBillingDetails,
    login, signup, logout, addToCart, removeFromCart,
    updateCartQuantity, clearCart, getCartTotal, placeOrder,
    createProduct, updateProduct, deleteProduct, updateOrderStatus, fetchProducts,
    fetchMyOrders, fetchAllOrders
  } = useApp();

  // Navigation & View State
  const [currentView, setCurrentView] = useState('landing'); // landing, home, checkout, my-orders, admin-dashboard, about, contact, privacy, terms
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Control State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // login, signup
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Form States
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', address: '', phone: '' });
  
  // Razorpay Card State
  const [paymentForm, setPaymentForm] = useState({ cardNo: '', expiry: '', cvv: '', name: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Contact Page Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Admin CRUD Form State
  const [adminTab, setAdminTab] = useState('products'); // products, orders
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', imageUrl: '', category: 'Furniture', stock: ''
  });

  // Watchers & Hydration
  useEffect(() => {
    fetchProducts(activeCategory, searchQuery);
  }, [activeCategory]);

  useEffect(() => {
    if (currentView === 'my-orders') {
      fetchMyOrders();
    } else if (currentView === 'admin-dashboard') {
      fetchAllOrders();
    }
  }, [currentView, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentView('home');
    fetchProducts(activeCategory, searchQuery);
  };

  const handleAutofill = (role) => {
    if (role === 'customer') {
      setLoginForm({ email: 'customer@ecommart.com', password: 'password123' });
    } else {
      setLoginForm({ email: 'admin@ecommart.com', password: 'admin123' });
    }
    setAuthError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await login(loginForm.email, loginForm.password);
    if (res.success) {
      setIsAuthOpen(false);
      setLoginForm({ email: '', password: '' });
    } else {
      setAuthError(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    const res = await signup(signupForm);
    if (res.success) {
      setAuthMessage("Account created successfully. Logging in...");
      setTimeout(async () => {
        const loginRes = await login(signupForm.email, signupForm.password);
        if (loginRes.success) {
          setIsAuthOpen(false);
          setSignupForm({ name: '', email: '', password: '', address: '', phone: '' });
          setAuthMessage('');
        }
      }, 1200);
    } else {
      setAuthError(res.message);
    }
  };

  // Payment Execution
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      
      const payload = {
        items: orderItems,
        totalAmount: getCartTotal(),
        shippingAddress: `${billingDetails.address}, Landmark: ${billingDetails.landmark}, City: ${billingDetails.city}, State: ${billingDetails.state} - ${billingDetails.pincode}`,
        phone: billingDetails.phone
      };

      const res = await placeOrder(payload);
      setPaymentLoading(false);
      setIsPaymentOpen(false);
      
      if (res.success) {
        setLastOrder(res.order);
        setShowSuccessScreen(true);
        setCurrentView('home');
      } else {
        alert(res.message || "Payment processing failed. Please check card inputs.");
      }
    }, 1500);
  };

  const startCheckout = () => {
    if (!token) {
      setAuthTab('login');
      setIsAuthOpen(true);
    } else {
      setIsCartOpen(false);
      setCurrentView('checkout');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  // Admin Operations
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock)
    };

    let res;
    if (editingProductId) {
      res = await updateProduct(editingProductId, payload);
    } else {
      res = await createProduct(payload);
    }

    if (res.success) {
      setProductFormOpen(false);
      setEditingProductId(null);
      setProductForm({ name: '', description: '', price: '', imageUrl: '', category: 'Furniture', stock: '' });
    } else {
      alert(res.message);
    }
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      imageUrl: p.imageUrl,
      category: p.category,
      stock: p.stock.toString()
    });
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const res = await deleteProduct(id);
      if (!res.success) alert(res.message);
    }
  };

  // Admin Metrics
  const adminMetrics = () => {
    const totalRev = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lowStock = products.filter(p => p.stock <= 5).length;
    return {
      revenue: totalRev,
      orders: allOrders.length,
      lowStock
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg-darkest)' }}>
      {/* 1. Header (Navbar) */}
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--color-border)', height: '76px' }}>
        <div className="container flex-between" style={{ height: '100%' }}>
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('landing')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ backgroundColor: 'var(--color-orange-primary)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              <span style={{ color: 'var(--color-orange-primary)' }}>Ecom</span>
              <span style={{ color: 'var(--color-text-primary)' }}>Mart</span>
            </span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ flex: '0 1 420px', display: 'flex', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '44px', background: '#FFFFFF', height: '42px', fontSize: '0.9rem', borderColor: 'var(--color-border)' }}
            />
            <Search size={18} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px', top: '12px' }} />
          </form>

          {/* Right Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Catalog navigation */}
            <button 
              onClick={() => { setCurrentView('home'); setActiveCategory('All'); }}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Shop Catalog
            </button>

            {/* View Switcher for Admin */}
            {user?.role === 'ROLE_ADMIN' && (
              <button 
                onClick={() => setCurrentView(currentView === 'admin-dashboard' ? 'home' : 'admin-dashboard')}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'var(--color-orange-primary)', color: 'var(--color-orange-primary)' }}
              >
                <Settings size={15} />
                {currentView === 'admin-dashboard' ? "Store Front" : "Admin Panel"}
              </button>
            )}

            {/* Orders */}
            {token && user?.role !== 'ROLE_ADMIN' && (
              <button 
                onClick={() => setCurrentView('my-orders')}
                className="btn btn-secondary btn-sm"
              >
                <Package size={15} />
                My Orders
              </button>
            )}

            {/* User Account / Login */}
            {token ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{user.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}</span>
                </div>
                <button onClick={logout} className="btn btn-danger btn-sm" title="Log Out">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button onClick={() => { setAuthTab('login'); setIsAuthOpen(true); }} className="btn btn-secondary">
                <UserIcon size={16} />
                Login
              </button>
            )}

            {/* Shopping Cart Button */}
            {user?.role !== 'ROLE_ADMIN' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="btn btn-primary"
                style={{ position: 'relative' }}
              >
                <ShoppingCart size={18} />
                <span style={{ display: 'none' }}>Cart</span>
                {cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    backgroundColor: 'var(--color-blue-primary)', color: 'white',
                    borderRadius: '50%', width: '20px', height: '20px',
                    fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, border: '2px solid var(--color-bg-darkest)'
                  }}>
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories Bar (Home view only) */}
      {currentView === 'home' && (
        <div style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', padding: '12px 0' }}>
          <div className="container" style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="btn btn-sm"
                style={{
                  backgroundColor: activeCategory === cat ? 'var(--color-orange-primary)' : 'var(--color-bg-hover)',
                  color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
                  borderRadius: '20px', padding: '6px 16px', fontWeight: 500
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main style={{ flex: 1, padding: '36px 0' }}>
        <div className="container">
          
          {/* Order Success Confetti Banner */}
          {showSuccessScreen && lastOrder && (
            <div className="scale-up" style={{ 
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.04) 0%, rgba(79, 70, 229, 0.04) 100%)',
              border: '1px solid var(--color-success)', borderRadius: 'var(--border-radius-lg)',
              padding: '36px', textAlign: 'center', marginBottom: '32px', position: 'relative',
              backgroundColor: '#FFFFFF'
            }}>
              <button 
                onClick={() => setShowSuccessScreen(false)} 
                style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
              <div className="flex-center" style={{ color: 'var(--color-success)', marginBottom: '16px' }}>
                <CheckCircle size={56} />
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '8px' }}>Order Placed Successfully</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
                Thank you for your purchase. Your payment was processed successfully.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: 'var(--color-bg-darkest)', padding: '12px 24px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>ORDER ID</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-orange-primary)' }}>#ECOM-{lastOrder.id}</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-bg-darkest)', padding: '12px 24px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>TOTAL PAID</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{lastOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button 
                onClick={() => { setShowSuccessScreen(false); setCurrentView('my-orders'); }}
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '24px' }}
              >
                Track Order
              </button>
            </div>
          )}

          {/* VIEW: Landing Page */}
          {currentView === 'landing' && (
            <div className="fade-in">
              {/* Hero Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #EEF2F6 0%, #E2E8F0 100%)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '64px',
                marginBottom: '48px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '32px'
              }}>
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-orange-primary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
                    <Sparkles size={14} />
                    Official Retail Partner
                  </div>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.5px', color: 'var(--color-text-primary)' }}>
                    Premium Quality Essentials <br />For Modern Indian Homes
                  </h1>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '1.05rem', maxWidth: '580px', lineHeight: 1.6 }}>
                    Explore handcrafted solid wood dining sets, high-performance tech devices, and designer home accessories. Directly sourced from leading brands and local craftspeople.
                  </p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => setCurrentView('home')} className="btn btn-primary btn-lg">
                      Shop Full Catalog
                      <ArrowRight size={18} />
                    </button>
                    <button onClick={() => { setCurrentView('home'); setActiveCategory('Furniture'); }} className="btn btn-secondary btn-lg">
                      Browse Furniture
                    </button>
                  </div>
                </div>
                {/* Visual Image */}
                <div style={{ flex: '1 1 350px', height: '320px', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop" 
                    alt="Interior Design" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Categories Section */}
              <div style={{ marginBottom: '56px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.3px' }}>
                  Shop by Categories
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                  {[
                    { name: 'Furniture', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop', desc: 'Sheesham wood chairs, sofas & dining sets' },
                    { name: 'Electronics', img: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop', desc: 'Smartwatches, earbuds & mobile devices' },
                    { name: 'Appliances', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop', desc: 'Induction cooktops & UV water purifiers' },
                    { name: 'Decor', img: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=600&auto=format&fit=crop', desc: 'Handcrafted vases & premium bedsheets' }
                  ].map(cat => (
                    <div 
                      key={cat.name}
                      onClick={() => { setActiveCategory(cat.name); setCurrentView('home'); }}
                      className="glass"
                      style={{ 
                        borderRadius: 'var(--border-radius-md)', overflow: 'hidden', cursor: 'pointer',
                        transition: 'transform var(--transition-fast)', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ height: '140px', overflow: 'hidden' }}>
                        <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{cat.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Props */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px',
                marginBottom: '56px', borderTop: '1px solid var(--color-border)', paddingTop: '48px'
              }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-orange-primary)', backgroundColor: 'var(--color-orange-glow)', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Free Pan-India Delivery</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>No hidden charges. We ship all products free of charge across 19,000+ pincodes.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-orange-primary)', backgroundColor: 'var(--color-orange-glow)', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>1-Year Brand Warranty</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Buy with complete peace of mind. All catalog products come with an official warranty policy.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--color-orange-primary)', backgroundColor: 'var(--color-orange-glow)', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Secure Gateway Checkout</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Your card transactions are fully encrypted and verified via standard Razorpay APIs.</p>
                  </div>
                </div>
              </div>

              {/* Featured Products List (Curated) */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Featured Highlights</span>
                  <button onClick={() => setCurrentView('home')} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                    Browse All ({products.length})
                  </button>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {products.slice(0, 3).map(p => (
                    <div 
                      key={p.id}
                      className="glass"
                      style={{ 
                        borderRadius: 'var(--border-radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        cursor: 'pointer', height: '100%', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)'
                      }}
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div style={{ height: '210px', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                        </div>
                        <div className="flex-between" style={{ marginTop: '16px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                          <span className="badge badge-orange">{p.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Home (Catalog) */}
          {currentView === 'home' && (
            <div>
              {/* Products Section */}
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                <TrendingUp size={18} color="var(--color-orange-primary)" />
                Catalog: {activeCategory}
              </h2>

              {loadingProducts ? (
                <div className="flex-center" style={{ minHeight: '300px' }}>
                  <div className="spinner"></div>
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#FFFFFF' }}>
                  <ShoppingBag size={40} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
                  <h3>No products found</h3>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Try changing your category or search filters.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {products.map(p => (
                    <div 
                      key={p.id}
                      className="glass"
                      style={{ 
                        borderRadius: 'var(--border-radius-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        transition: 'transform var(--transition-fast)', cursor: 'pointer', height: '100%',
                        backgroundColor: '#FFFFFF', borderColor: 'var(--color-border)'
                      }}
                      onClick={() => setSelectedProduct(p)}
                    >
                      {/* Image container */}
                      <div style={{ height: '210px', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop";
                          }}
                        />
                        <span className="badge badge-orange" style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '0.65rem' }}>
                          {p.category}
                        </span>
                        {p.stock <= 5 && (
                          <span className="badge badge-success" style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.65rem', backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-error)', borderColor: 'rgba(220, 38, 38, 0.12)' }}>
                            {p.stock === 0 ? "Out of Stock" : `Only ${p.stock} left`}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3, color: 'var(--color-text-primary)' }}>
                            {p.name}
                          </h3>
                          <p style={{ 
                            fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '16px',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px'
                          }}>
                            {p.description}
                          </p>
                        </div>
                        <div className="flex-between">
                          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          {user?.role === 'ROLE_ADMIN' ? (
                            <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleEditProduct(p)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (p.stock > 0) addToCart(p);
                              }}
                              disabled={p.stock === 0}
                              className="btn btn-primary btn-sm"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: Checkout / Billing */}
          {currentView === 'checkout' && (
            <div>
              <button onClick={() => setCurrentView('home')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
                <ArrowLeft size={14} />
                Back to Shop
              </button>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '24px' }}>Delivery & Billing Details</h2>

              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {/* Left side: Billing Address */}
                <div style={{ flex: '2 1 600px' }}>
                  <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: '32px', backgroundColor: '#FFFFFF' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={18} color="var(--color-orange-primary)" />
                      Shipping Address
                    </h3>
                    <form onSubmit={(e) => { e.preventDefault(); setIsPaymentOpen(true); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Full Name *</label>
                        <input 
                          type="text" 
                          required 
                          value={billingDetails.name} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Street Address *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Flat/House No., Building, Street Name"
                          value={billingDetails.address} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Landmark</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Near Apollo Hospital"
                          value={billingDetails.landmark} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, landmark: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Mobile Number *</label>
                        <input 
                          type="text" 
                          required 
                          pattern="[0-9]{10}"
                          placeholder="10-digit mobile number"
                          value={billingDetails.phone} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label>City *</label>
                        <input 
                          type="text" 
                          required 
                          value={billingDetails.city} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input 
                          type="text" 
                          required 
                          value={billingDetails.state} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input 
                          type="text" 
                          required 
                          pattern="[0-9]{6}"
                          placeholder="6-digit pincode"
                          value={billingDetails.pincode} 
                          onChange={(e) => setBillingDetails({ ...billingDetails, pincode: e.target.value })} 
                          className="form-input" 
                        />
                      </div>

                      <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                          Proceed to Payment
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right side: Order Summary */}
                <div style={{ flex: '1 1 350px' }}>
                  <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: '24px', backgroundColor: '#FFFFFF' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingCart size={18} color="var(--color-orange-primary)" />
                      Items Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '6px' }}>
                      {cart.map(item => (
                        <div key={item.product.id} className="flex-between" style={{ fontSize: '0.85rem' }}>
                          <div style={{ flex: 1, paddingRight: '12px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>{item.product.name}</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>Quantity: {item.quantity}</span>
                          </div>
                          <span style={{ fontWeight: 600 }}>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <hr style={{ borderColor: 'var(--color-border)', margin: '16px 0' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      <div className="flex-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                        <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Shipping Charges</span>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                      </div>
                      <hr style={{ borderColor: 'var(--color-border)', margin: '8px 0' }} />
                      <div className="flex-between" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                        <span>Total Payable</span>
                        <span style={{ color: 'var(--color-orange-primary)' }}>₹{getCartTotal().toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Customer Orders Panel */}
          {currentView === 'my-orders' && (
            <div>
              <button onClick={() => setCurrentView('home')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
                <ArrowLeft size={14} />
                Back to Shop
              </button>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '24px' }}>Your Orders</h2>

              {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#FFFFFF' }}>
                  <Package size={40} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
                  <h3>No orders placed yet</h3>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Add items to cart and checkout to create an order.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {myOrders.map(o => (
                    <div key={o.id} className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF' }}>
                      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>ORDER NUMBER</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-orange-primary)' }}>#ECOM-{o.id}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>ORDER DATE</span>
                          <span>{new Date(o.orderDate).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>DELIVERY STATUS</span>
                          <span className={`badge ${o.orderStatus === 'DELIVERED' ? 'badge-success' : 'badge-blue'}`}>{o.orderStatus}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>PAYMENT STATUS</span>
                          <span className="badge badge-success">{o.paymentStatus}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>TOTAL AMOUNT</span>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {o.orderItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#F1F5F9' }} 
                            />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>{item.product.name}</span>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Category: {item.product.category}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span>₹{item.price.toLocaleString('en-IN')} x {item.quantity}</span>
                              <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-orange-primary)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '16px', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <strong>Shipping Address:</strong> {o.shippingAddress}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: Admin Dashboard */}
          {currentView === 'admin-dashboard' && (
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '24px' }}>Store Management Portal</h2>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Total Sales</span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-success)' }}>₹{adminMetrics().revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Orders Processed</span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-blue-primary)' }}>{adminMetrics().orders}</span>
                </div>
                <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px' }}>Low Stock Items</span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: adminMetrics().lowStock > 0 ? 'var(--color-error)' : 'var(--color-text-primary)' }}>{adminMetrics().lowStock}</span>
                </div>
              </div>

              {/* Tabs selector */}
              <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '24px', display: 'flex', gap: '16px' }}>
                <button 
                  onClick={() => setAdminTab('products')} 
                  style={{
                    padding: '12px 16px', background: 'none', border: 'none', 
                    borderBottom: adminTab === 'products' ? '3px solid var(--color-orange-primary)' : 'none',
                    color: adminTab === 'products' ? 'var(--color-orange-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Products ({products.length})
                </button>
                <button 
                  onClick={() => setAdminTab('orders')} 
                  style={{
                    padding: '12px 16px', background: 'none', border: 'none', 
                    borderBottom: adminTab === 'orders' ? '3px solid var(--color-orange-primary)' : 'none',
                    color: adminTab === 'orders' ? 'var(--color-orange-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Customer Orders ({allOrders.length})
                </button>
              </div>

              {/* Subview: Admin Product List */}
              {adminTab === 'products' && (
                <div>
                  <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Inventory Catalog</h3>
                    <button onClick={() => { setEditingProductId(null); setProductForm({ name: '', description: '', price: '', imageUrl: '', category: 'Furniture', stock: '' }); setProductFormOpen(true); }} className="btn btn-primary btn-sm">
                      <Plus size={16} />
                      Add Product
                    </button>
                  </div>

                  {/* Add/Edit Product Modal */}
                  {productFormOpen && (
                    <div className="flex-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, padding: '24px', backdropFilter: 'blur(4px)' }}>
                      <div className="glass scale-up" style={{ borderRadius: 'var(--border-radius-lg)', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{editingProductId ? "Edit Product" : "Add Product"}</h3>
                          <button onClick={() => setProductFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleProductSubmit}>
                          <div className="form-group">
                            <label>Product Title *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Product title"
                              value={productForm.name} 
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} 
                              className="form-input" 
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                              <label>Category *</label>
                              <select 
                                value={productForm.category} 
                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} 
                                className="form-input"
                              >
                                <option value="Furniture">Furniture</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Appliances">Appliances</option>
                                <option value="Decor">Decor</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Price (INR) *</label>
                              <input 
                                type="number" 
                                required 
                                min="1"
                                placeholder="Price"
                                value={productForm.price} 
                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} 
                                className="form-input" 
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                              <label>Stock Count *</label>
                              <input 
                                type="number" 
                                required 
                                min="0"
                                placeholder="Quantity"
                                value={productForm.stock} 
                                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} 
                                className="form-input" 
                              />
                            </div>
                            <div className="form-group">
                              <label>Image Link URL *</label>
                              <input 
                                type="url" 
                                required 
                                placeholder="Image link URL"
                                value={productForm.imageUrl} 
                                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} 
                                className="form-input" 
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Description *</label>
                            <textarea 
                              rows="4" 
                              required 
                              placeholder="Product details..."
                              value={productForm.description} 
                              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} 
                              className="form-input"
                              style={{ resize: 'vertical' }}
                            ></textarea>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button type="button" onClick={() => setProductFormOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                              {editingProductId ? "Save" : "Add Product"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Desktop Table View */}
                  <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#FFFFFF' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                          <th style={{ padding: '16px' }}>Image</th>
                          <th style={{ padding: '16px' }}>Product</th>
                          <th style={{ padding: '16px' }}>Category</th>
                          <th style={{ padding: '16px' }}>Price</th>
                          <th style={{ padding: '16px' }}>Stock</th>
                          <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '16px' }}>
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#F1F5F9' }} 
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop";
                                }}
                              />
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</td>
                            <td style={{ padding: '16px' }}>
                              <span className="badge badge-blue">{p.category}</span>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 700, color: 'var(--color-orange-primary)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ color: p.stock <= 5 ? 'var(--color-error)' : 'var(--color-text-primary)', fontWeight: p.stock <= 5 ? 700 : 500 }}>
                                {p.stock} units
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleEditProduct(p)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-danger btn-sm" style={{ padding: '6px' }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subview: Admin Orders Management */}
              {adminTab === 'orders' && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Customer Orders</h3>

                  {allOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--color-border)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#FFFFFF' }}>
                      <Package size={40} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
                      <h3>No orders received</h3>
                      <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Customer checkout orders will appear here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {allOrders.map(o => (
                        <div key={o.id} className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF' }}>
                          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>ORDER NUMBER</span>
                              <span style={{ fontWeight: 700, color: 'var(--color-orange-primary)' }}>#ECOM-{o.id}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>CUSTOMER</span>
                              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{o.user.name}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>ORDER DATE</span>
                              <span>{new Date(o.orderDate).toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block' }}>TOTAL PRICE</span>
                              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>ORDER STATUS</span>
                              <select 
                                value={o.orderStatus} 
                                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                className="form-input"
                                style={{ padding: '4px 8px', fontSize: '0.8rem', height: '30px', borderRadius: '4px' }}
                              >
                                <option value="PLACED">PLACED</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                              </select>
                            </div>
                          </div>

                          {/* Items List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {o.orderItems.map(item => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name} 
                                  style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#F1F5F9' }} 
                                />
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.product.name}</span>
                                </div>
                                <span>₹{item.price.toLocaleString('en-IN')} x {item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '16px', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            <div><strong>Address:</strong> {o.shippingAddress}</div>
                            <div><strong>Phone:</strong> {o.phone}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: About Us */}
          {currentView === 'about' && (
            <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
              <button onClick={() => setCurrentView('landing')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
                <ArrowLeft size={14} />
                Back to Home
              </button>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)' }}>About EcomMart</h1>
              <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: '36px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '16px', color: 'var(--color-text-primary)' }}>
                  Welcome to <strong>EcomMart</strong>, your premier destination for exceptional home living products and cutting-edge technology. Established with a commitment to quality and elegance, we curate products that elevate your everyday life.
                </p>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                  Our diverse selection features beautifully crafted solid Sheesham wood furniture, designed to bring timeless charm and structure to your dining room, living space, and bedrooms. In addition to premium furniture, we offer high-performance personal electronics, including smartwatches, wireless audio accessories, and essential home appliances.
                </p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Our Philosophy</h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                  We believe that craftsmanship and modern utility should go hand-in-hand. That is why we work closely with local artisans and leading tech manufacturers to ensure every item in our catalog meets strict standards of durability, functionality, and visual excellence.
                </p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '28px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Why Choose EcomMart?</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
                  <li><strong>Premium Materials:</strong> Genuine Sheesham wood and high-grade materials.</li>
                  <li><strong>Free Pan-India Delivery:</strong> Reliable shipping to over 19,000+ pincodes across the country.</li>
                  <li><strong>1-Year Brand Warranty:</strong> Comprehensive coverage for all electronics and appliances.</li>
                  <li><strong>Secure Transactions:</strong> Encrypted payment verification simulated via industry standard Razorpay.</li>
                </ul>
              </div>
            </div>
          )}

          {/* VIEW: Contact Us */}
          {currentView === 'contact' && (
            <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
              <button onClick={() => setCurrentView('landing')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
                <ArrowLeft size={14} />
                Back to Home
              </button>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)' }}>Contact Us</h1>
              
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1.2 1 400px' }}>
                  <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: '36px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Send us a Message</h3>
                    {contactSubmitted ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: '16px', display: 'inline-block' }} />
                        <h4>Message Sent Successfully!</h4>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Thank you for reaching out. We will get back to you within 24 hours.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit}>
                        <div className="form-group">
                          <label>Your Name *</label>
                          <input type="text" required placeholder="John Doe" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="form-input" />
                        </div>
                        <div className="form-group">
                          <label>Email Address *</label>
                          <input type="email" required placeholder="john@example.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="form-input" />
                        </div>
                        <div className="form-group">
                          <label>Subject *</label>
                          <input type="text" required placeholder="Query topic" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} className="form-input" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                          <label>Message *</label>
                          <textarea rows="5" required placeholder="Describe your query..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="form-input" style={{ resize: 'vertical' }}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Submit Message</button>
                      </form>
                    )}
                  </div>
                </div>
                
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-primary)' }}>Customer Support</h4>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      <Mail size={16} color="var(--color-orange-primary)" />
                      support@ecommart.com
                    </p>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                      <Phone size={16} color="var(--color-orange-primary)" />
                      +91 80 4123 4567
                    </p>
                  </div>
                  <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text-primary)' }}>Corporate Office</h4>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                      EcomMart Retail Private Limited,<br />
                      No. 45, 14th Main Road, Sector 7,<br />
                      HSR Layout, Bengaluru,<br />
                      Karnataka - 560102, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Privacy Policy */}
          {currentView === 'privacy' && (
            <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
              <button onClick={() => setCurrentView('landing')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
                <ArrowLeft size={14} />
                Back to Home
              </button>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)' }}>Privacy Policy</h1>
              <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: '36px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Last Updated: June 11, 2026</p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '20px', marginBottom: '10px' }}>1. Data Collection</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  We collect personal data that you provide directly to us when creating an account, placing an order, or communicating with us. This includes your name, email address, physical shipping address, phone number, and account credentials.
                </p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>2. How We Use Your Data</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Your information is used to process checkouts, coordinate delivery logistics to your specified shipping address, notify you of order status changes, and manage your customer account portal.
                </p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>3. Secure Payments Disclaimer</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  All card entries processed on our platform are simulated in a sandbox test environment. No actual payment data or credit card details are stored, transferred, or charged. The payment gateway visual is a simulation designed to replicate Razorpay authorization mechanisms.
                </p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>4. Data Protection</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  We implement industry-standard encryption protocols (including secure SSL certificates and stateless API validation filters) to protect your account tokens from unauthorized access, modification, or disclosure.
                </p>
              </div>
            </div>
          )}

          {/* VIEW: Terms of Service */}
          {currentView === 'terms' && (
            <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
              <button onClick={() => setCurrentView('landing')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
                <ArrowLeft size={14} />
                Back to Home
              </button>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)' }}>Terms of Service</h1>
              <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: '36px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Last Updated: June 11, 2026</p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '20px', marginBottom: '10px' }}>1. Sandbox Demonstration</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  EcomMart is a demonstration e-commerce application. All products, user logins, orders, and transactions are purely simulated for review and testing. No real items will be shipped, and no financial liabilities exist.
                </p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>2. Account Creation & User Security</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Users are responsible for maintaining the confidentiality of their test account credentials. While credentials provided for testing are public on screen, any newly created accounts should avoid using real-world personal passwords.
                </p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>3. Pan-India Delivery Simulation</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  All shipping options refer to a simulated 3-7 business days pan-India delivery. Orders are marked in standard statuses (PLACED, CONFIRMED, SHIPPED, DELIVERED) which can be updated dynamically in the Admin panel.
                </p>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', marginBottom: '10px' }}>4. Limitation of Liability</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Under no circumstances shall EcomMart, its developers, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use of this demonstration sandbox environment.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', padding: '48px 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'block', marginBottom: '16px' }}>
              <span style={{ color: 'var(--color-orange-primary)' }}>Ecom</span>Mart
            </span>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '300px', lineHeight: 1.5 }}>
              Premium home furniture, high-performance electronics, and curated interior decoration items delivered nationwide.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '64px' }}>
            <div>
              <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>Shop Categories</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a onClick={() => { setCurrentView('home'); setActiveCategory('Furniture'); }} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Premium Furniture</a></li>
                <li><a onClick={() => { setCurrentView('home'); setActiveCategory('Electronics'); }} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Electronics & Tech</a></li>
                <li><a onClick={() => { setCurrentView('home'); setActiveCategory('Appliances'); }} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Home Appliances</a></li>
                <li><a onClick={() => { setCurrentView('home'); setActiveCategory('Decor'); }} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Home Decor</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a onClick={() => setCurrentView('about')} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>About Us</a></li>
                <li><a onClick={() => setCurrentView('contact')} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Contact Us</a></li>
                <li><a onClick={() => setCurrentView('privacy')} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Privacy Policy</a></li>
                <li><a onClick={() => setCurrentView('terms')} style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid var(--color-border)', marginTop: '36px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <span>© {new Date().getFullYear()} EcomMart India. All rights reserved.</span>
          <span>Terms & Conditions Apply</span>
        </div>
      </footer>

      {/* --- Overlay Modals & Drawers --- */}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="flex-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, backdropFilter: 'blur(2px)' }} onClick={() => setIsCartOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass slide-in-drawer" style={{ position: 'absolute', top: 0, right: 0, width: '100%', maxWidth: '440px', height: '100vh', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
            <div>
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <ShoppingCart size={20} color="var(--color-orange-primary)" />
                  Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h3>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <ShoppingCart size={48} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
                  <h4>Your cart is empty</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Add products from the catalog to continue.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                  {cart.map(item => (
                    <div key={item.product.id} className="flex-between" style={{ gap: '12px' }}>
                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', backgroundColor: '#F1F5F9' }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', lineHeight: 1.3 }}>{item.product.name}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-orange-primary)', fontWeight: 700 }}>₹{item.product.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} style={{ width: '24px', height: '24px', backgroundColor: 'var(--color-bg-hover)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: '4px' }}>-</button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} style={{ width: '24px', height: '24px', backgroundColor: 'var(--color-bg-hover)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div>
                <hr style={{ borderColor: 'var(--color-border)', margin: '20px 0' }} />
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Subtotal:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>₹{getCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <button onClick={startCheckout} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Checkout
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="flex-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, padding: '24px', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedProduct(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass scale-up" style={{ borderRadius: 'var(--border-radius-lg)', padding: '32px', width: '100%', maxWidth: '800px', display: 'flex', gap: '32px', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
            <div style={{ flex: '1 1 300px', height: '360px', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1.2 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <span className="badge badge-orange">{selectedProduct.category}</span>
                  <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: 'var(--color-text-primary)' }}>{selectedProduct.name}</h2>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-orange-primary)', display: 'block', marginBottom: '16px' }}>₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>{selectedProduct.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: 'var(--color-bg-darkest)', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>STOCK STATUS</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedProduct.stock} units left</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-bg-darkest)', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>WARRANTY</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>1 Year Brand Warranty</span>
                  </div>
                </div>
              </div>
              {user?.role !== 'ROLE_ADMIN' && (
                <button onClick={() => { selectedProduct.stock > 0 && (addToCart(selectedProduct), setSelectedProduct(null)) }} disabled={selectedProduct.stock === 0} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Login/Signup) */}
      {isAuthOpen && (
        <div className="flex-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setIsAuthOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass scale-up" style={{ borderRadius: 'var(--border-radius-lg)', padding: '36px', width: '100%', maxWidth: '440px', backgroundColor: '#FFFFFF' }}>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => { setAuthTab('login'); setAuthError(''); setAuthMessage(''); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', color: authTab === 'login' ? 'var(--color-orange-primary)' : 'var(--color-text-secondary)' }}>Login</button>
                <button onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthMessage(''); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', color: authTab === 'signup' ? 'var(--color-orange-primary)' : 'var(--color-text-secondary)' }}>Sign Up</button>
              </div>
              <button onClick={() => setIsAuthOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            {authError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(220, 38, 38, 0.05)', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}
            {authMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(5, 150, 105, 0.05)', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <Check size={16} />
                <span>{authMessage}</span>
              </div>
            )}
            {authTab === 'login' && (
              <div>
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required placeholder="Enter email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Password</label>
                    <input type="password" required placeholder="Enter password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="form-input" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>Log In</button>
                </form>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '10px', fontWeight: 600 }}>TEST LOGIN CREDENTIALS</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleAutofill('customer')} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.75rem' }}>Customer Account</button>
                    <button onClick={() => handleAutofill('admin')} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.75rem', borderColor: 'var(--color-blue-primary)' }}>Admin Account</button>
                  </div>
                </div>
              </div>
            )}
            {authTab === 'signup' && (
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" required placeholder="First and last name" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" required placeholder="email@example.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" required placeholder="Create secure password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input type="text" required pattern="[0-9]{10}" placeholder="10-digit mobile number" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} className="form-input" />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label>Delivery Address *</label>
                  <input type="text" required placeholder="Full shipping address" value={signupForm.address} onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })} className="form-input" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Razorpay Simulation Modal */}
      {isPaymentOpen && (
        <div className="flex-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 2000, padding: '24px', backdropFilter: 'blur(4px)' }}>
          <div className="scale-up" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', width: '100%', maxWidth: '380px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ backgroundColor: '#023c8e', color: 'white', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: '#e28743', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>TEST MODE</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Razorpay Secure Checkout</h4>
              </div>
              <button onClick={() => setIsPaymentOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }} className="flex-between">
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', display: 'block' }}>MERCHANT</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>EcomMart India</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', display: 'block' }}>AMOUNT</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-orange-primary)' }}>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              {paymentLoading ? (
                <div className="flex-center" style={{ minHeight: '180px', flexDirection: 'column', gap: '16px' }}>
                  <div className="spinner"></div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Processing payment...</span>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit}>
                  <div className="form-group">
                    <label style={{ color: 'var(--color-text-secondary)' }}>Card Number</label>
                    <input type="text" required placeholder="4111 1111 1111 1111" value={paymentForm.cardNo} onChange={(e) => setPaymentForm({ ...paymentForm, cardNo: e.target.value })} className="form-input" style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border)', fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ color: 'var(--color-text-secondary)' }}>Expiry Date</label>
                      <input type="text" required placeholder="MM/YY" value={paymentForm.expiry} onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })} className="form-input" style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border)', fontSize: '0.9rem' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ color: 'var(--color-text-secondary)' }}>CVV</label>
                      <input type="password" required maxLength="3" placeholder="123" value={paymentForm.cvv} onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })} className="form-input" style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border)', fontSize: '0.9rem' }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ color: 'var(--color-text-secondary)' }}>Cardholder Name</label>
                    <input type="text" required placeholder="Cardholder Name" value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} className="form-input" style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border)', fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button type="button" onClick={() => setPaymentForm({ cardNo: '4111 1111 1111 1111', expiry: '12/29', cvv: '123', name: billingDetails.name })} className="btn btn-secondary btn-sm">Autofill Demo Card</button>
                    <button type="submit" className="btn btn-blue btn-lg" style={{ width: '100%', backgroundColor: '#023c8e', color: 'white' }}>Pay ₹{getCartTotal().toLocaleString('en-IN')}</button>
                  </div>
                </form>
              )}
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', textAlign: 'center', borderTop: '1px solid var(--color-border)', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>🔒 Secured by Razorpay API (Sandbox Mode)</div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
