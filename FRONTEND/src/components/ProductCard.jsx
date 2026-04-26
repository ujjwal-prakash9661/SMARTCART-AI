import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isWishlisted = isInWishlist(product._id);

  const priceInINR = (Number(product.price)).toLocaleString();

  const isNew = product.createdAt 
    ? (new Date() - new Date(product.createdAt)) <= 3 * 24 * 60 * 60 * 1000 
    : false;

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-[#111111] border border-[rgba(255,255,255,0.08)] overflow-hidden hover:border-[var(--theme-accent)] transition-all duration-300 cursor-pointer group flex flex-col h-full relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    >
      {/* Top badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center justify-between w-[calc(100%-2rem)]">
        {isNew ? (
          <div className="bg-transparent border border-[var(--theme-accent-secondary)] text-[var(--theme-accent-secondary)] text-[8px] uppercase tracking-widest px-2 py-0.5" style={{ textShadow: '0 0 5px rgba(0, 229, 255, 0.5)' }}>
            NEW RELEASE
          </div>
        ) : (
          <div></div>
        )}
        
        <motion.button 
          whileTap={{ scale: 1.5 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`p-1.5 transition-colors ${isWishlisted ? 'text-[var(--theme-accent)]' : 'text-[#4B5563] hover:text-[var(--theme-accent)]'}`}
        >
          <motion.div animate={isWishlisted ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "drop-shadow-[0_0_5px_rgba(0,255,204,0.6)]" : ""} />
          </motion.div>
        </motion.button>
      </div>

      {/* Image Container */}
      <div className="h-56 bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden transition-colors border-b border-[rgba(255,255,255,0.05)]">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <span className="text-[#4B5563] text-xs tracking-widest uppercase font-bold">NO SIGNAL</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#9CA3AF]">
            {product.category || 'PRODUCT'}
          </span>
          <span className="font-bold text-[var(--theme-accent)] text-sm tracking-wider" style={{ textShadow: '0 0 10px rgba(0, 255, 204, 0.2)' }}>
            ₹{priceInINR}
          </span>
        </div>

        {/* Rating Display */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={10} 
                className={`${(product.averageRating || 0) >= star ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]' : 'text-gray-600'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-[#4B5563] font-bold">
            ({product.numReviews || 0})
          </span>
        </div>
        
        <h3 className="font-bold text-white text-base mb-3 line-clamp-2 uppercase tracking-wide group-hover:text-[var(--theme-accent-secondary)] transition-colors">
          {product.title}
        </h3>
        
        <p className="text-[#9CA3AF] text-xs leading-relaxed line-clamp-2 mb-4">
          {product.description || `Premium quality product designed for optimal performance and durability.`}
        </p>
        
        <div className="mt-auto pt-2 grid grid-cols-[1fr_auto] gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-transparent border border-[rgba(255,255,255,0.15)] hover:border-[var(--theme-accent)] hover:bg-[rgba(0,255,204,0.05)] text-white text-[10px] uppercase tracking-widest font-semibold py-2.5 flex items-center justify-center transition-all group/btn"
          >
            ADD TO CART
          </button>
          <div className="border border-[rgba(255,255,255,0.15)] w-10 flex items-center justify-center bg-[rgba(255,255,255,0.02)]">
            <ShoppingCart size={14} className="text-[#9CA3AF]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
