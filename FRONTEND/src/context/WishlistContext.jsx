import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist when token changes (user logs in)
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setWishlistItems([]);
        return;
      }
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/api/auth/wishlist');
        setWishlistItems(res.data || []);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  const toggleWishlist = async (product) => {
    if (!token) {
      toast.error("Please login to add items to your wishlist.");
      return;
    }

    // Optimistic UI update
    const isAlreadyWishlisted = wishlistItems.some(item => item._id === product._id);
    if (isAlreadyWishlisted) {
      setWishlistItems(prev => prev.filter(item => item._id !== product._id));
      toast.error('Removed from wishlist');
    } else {
      setWishlistItems(prev => [...prev, product]);
      toast.success('Added to wishlist', { icon: '❤️' });
    }

    try {
      const res = await axiosInstance.post(`/api/auth/wishlist/${product._id}`);
      // Server returns updated populated wishlist
      setWishlistItems(res.data);
    } catch (error) {
      console.error("Failed to toggle wishlist item:", error);
      // Revert optimistic update on failure
      const res = await axiosInstance.get('/api/auth/wishlist');
      setWishlistItems(res.data || []);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, wishlistCount, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
