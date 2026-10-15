import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart
} from '../services/api';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemLoadingMap, setItemLoadingMap] = useState({});

  // Fetch cart on mount if session is active
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First verify session
      const authRes = await api.get('/customers/me');
      if (authRes.data.success) {
        const data = await getCart();
        if (data.success) {
          setCartItems(data.cart || []);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]); // Unauthenticated guest starts with empty cart
      } else {
        setError('Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Helper to mark single item loading
  const setItemLoading = (productId, isLoading) => {
    setItemLoadingMap((prev) => ({ ...prev, [productId]: isLoading }));
  };

  // 1. Add to Cart
  const addToCart = async (productId, quantity = 1) => {
    setItemLoading(productId, true);
    try {
      const res = await apiAddToCart(productId, quantity);
      if (res.success) {
        setCartItems(res.cart || []);
        return { success: true, message: res.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add product to cart';
      throw new Error(msg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  // 2. Update Quantity
  const updateQuantity = async (productId, quantity) => {
    setItemLoading(productId, true);
    try {
      const res = await apiUpdateCartQuantity(productId, quantity);
      if (res.success) {
        setCartItems(res.cart || []);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      throw new Error(msg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  // 3. Remove from Cart
  const removeFromCart = async (productId) => {
    setItemLoading(productId, true);
    try {
      const res = await apiRemoveFromCart(productId);
      if (res.success) {
        setCartItems(res.cart || []);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      throw new Error(msg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  // 4. Clear Entire Cart on backend
  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await apiClearCart();
      if (res.success) {
        setCartItems([]);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear cart';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 5. Immediate Global Cart State Reset (post successful checkout verification)
  const resetCartState = () => {
    setCartItems([]);
  };

  // 6. Derived Values: Total Units Count & Subtotal
  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  const formattedSubtotal = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(subtotal);
  }, [subtotal]);

  const value = {
    cartItems,
    loading,
    error,
    itemLoadingMap,
    totalItems,
    subtotal,
    formattedSubtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    resetCartState,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
