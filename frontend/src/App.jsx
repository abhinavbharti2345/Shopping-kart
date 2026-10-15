import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Default root path is the Product Store Catalog */}
          <Route path="/" element={<Products />} />
          <Route path="/home" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Public Authentication Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Wishlist Route (Lab-04) */}
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Shopping Cart Route (Lab-05) */}
          <Route path="/cart" element={<Cart />} />

          {/* Checkout & Orders Routes (Lab-06) */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderSuccess />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />

          {/* Customer Profile Route */}
          <Route path="/profile" element={<Profile />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
