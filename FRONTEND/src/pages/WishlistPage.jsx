import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlistItems, isLoading } = useWishlist();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32 w-full">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="px-8 py-20 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center transition-colors duration-300">
        <div className="bg-red-500/10 p-8 rounded-full mb-6 border border-red-500/20">
          <Heart size={64} className="text-red-500 opacity-50" />
        </div>
        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-4">Your wishlist is empty</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">Looks like you haven't saved any items yet. Find something you love and tap the heart icon to add it here.</p>
        <button 
          onClick={() => navigate('/store')}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          Explore Store
        </button>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 w-full max-w-7xl mx-auto transition-colors duration-300">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Heart size={28} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Your Wishlist</h1>
            <p className="text-[var(--text-secondary)] font-medium">Items you've loved and saved for later.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-secondary)]">
          <span className="text-[var(--text-primary)]">{wishlistItems.length}</span> Items Saved
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {wishlistItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </motion.div>
    </div>
  );
};

export default WishlistPage;
