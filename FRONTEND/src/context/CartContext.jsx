import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      toast.error("Could not find product to add.");
      return;
    }
    const existing = cartItems.find(item => item._id === product._id);
    if (existing) {
      toast.success(`Increased ${product.title} quantity by ${quantity}`);
      setCartItems(prev => prev.map(item => 
        item._id === product._id ? { ...item, quantity: (item.quantity || 1) + quantity } : item
      ));
    } else {
      toast.success(`Added ${quantity}x ${product.title} to cart`);
      setCartItems(prev => [...prev, { ...product, quantity: quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
    toast.error('Item removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 1) return;
    setCartItems(prev => prev.map(item => 
      item._id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
