import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  // Cart State
  const [cart, setCart] = useState([]);
  
  // Products & Categories
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categories] = useState(["All", "Furniture", "Electronics", "Appliances", "Decor"]);
  
  // Orders
  const [myOrders, setMyOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Admin
  
  // Billing Info
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    address: "",
    phone: "",
    landmark: "",
    city: "",
    state: "",
    pincode: ""
  });

  // Check local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ecom_token');
    const savedUser = localStorage.getItem('ecom_user');
    const savedCart = localStorage.getItem('ecom_cart');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    fetchProducts();
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(cart));
  }, [cart]);

  // Products
  const fetchProducts = async (category = "", search = "") => {
    setLoadingProducts(true);
    try {
      let url = `${API_BASE}/products`;
      if (category && category !== "All") {
        url += `?category=${category}`;
      } else if (search) {
        url += `?search=${search}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setToken(data.token);
        localStorage.setItem('ecom_token', data.token);
        localStorage.setItem('ecom_user', JSON.stringify(data));
        
        // Seed default billing from user account
        setBillingDetails(prev => ({
          ...prev,
          name: data.name,
          address: data.address || "",
          phone: data.phone || ""
        }));
        
        return { success: true };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (err) {
      return { success: false, message: "Server connection failed" };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (err) {
      return { success: false, message: "Server connection failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    setMyOrders([]);
    setAllOrders([]);
    localStorage.removeItem('ecom_token');
    localStorage.removeItem('ecom_user');
    localStorage.removeItem('ecom_cart');
  };

  // Cart Operations
  const addToCart = (product, qty = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + qty, product.stock) } 
            : item
        );
      }
      return [...prevCart, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, qty) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, qty) } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Orders Operations
  const fetchMyOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/orders/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data);
      }
    } catch (err) {
      console.error("Error loading customer orders:", err);
    }
  };

  const fetchAllOrders = async () => {
    if (!token || user?.role !== "ROLE_ADMIN") return;
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      }
    } catch (err) {
      console.error("Error loading admin orders:", err);
    }
  };

  const placeOrder = async (orderDetails) => {
    if (!token) return { success: false, message: "Please log in first" };
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderDetails)
      });
      if (res.ok) {
        const data = await res.json();
        clearCart();
        fetchProducts(); // Refresh stocks
        return { success: true, order: data };
      } else {
        const msg = await res.text();
        return { success: false, message: msg || "Checkout failed" };
      }
    } catch (err) {
      return { success: false, message: "Order placement failed" };
    }
  };

  // Product CRUD (Admin Only)
  const createProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        fetchProducts();
        return { success: true };
      } else {
        const msg = await res.text();
        return { success: false, message: msg || "Failed to create product" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        fetchProducts();
        return { success: true };
      } else {
        const msg = await res.text();
        return { success: false, message: msg || "Failed to update product" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
        return { success: true };
      } else {
        const msg = await res.text();
        return { success: false, message: msg || "Failed to delete product" };
      }
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  // Admin Order Status Update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        fetchAllOrders();
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
    return { success: false };
  };

  return (
    <AppContext.Provider value={{
      user, token, cart, products, categories, loadingProducts,
      myOrders, allOrders, billingDetails, API_BASE,
      setBillingDetails, login, signup, logout,
      addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal,
      fetchProducts, fetchMyOrders, fetchAllOrders, placeOrder,
      createProduct, updateProduct, deleteProduct, updateOrderStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
