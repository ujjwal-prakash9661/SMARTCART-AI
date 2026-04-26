import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Shield, ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingHover, setRatingHover] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/api/products/${id}`);
        setProduct(response.data);
        if (user && response.data.reviews) {
          const existingReview = response.data.reviews.find(r => (r.user._id || r.user) === user._id);
          if (existingReview) setUserRating(existingReview.rating);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleRateProduct = async (selectedRating) => {
    if (!user) {
      alert("Please log in to rate this product.");
      return;
    }
    
    setIsSubmittingRating(true);
    try {
      const response = await axiosInstance.post(`/api/products/${id}/reviews`, { rating: selectedRating });
      setProduct(prev => ({
        ...prev,
        averageRating: response.data.averageRating,
        numReviews: response.data.numReviews
      }));
      setUserRating(selectedRating);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/store')} className="text-violet-500 font-semibold hover:underline">
          Go back to store
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#050505] min-h-screen pt-4 pb-12">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-6 lg:gap-10">
        
        {/* Left Column: Image & Actions */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 relative">
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="bg-white rounded-sm p-8 flex items-start justify-center relative border border-[rgba(255,255,255,0.1)] w-full h-[400px] overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-300 origin-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300 min-h-[400px]">
                  <Zap size={48} className="mb-4 opacity-50 text-gray-300" />
                  <p className="text-[12px] uppercase font-bold tracking-widest">No Image</p>
                </div>
              )}
              
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded-sm">
                TRENDING
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => addToCart(product)}
                className="flex-1 bg-[#111111] text-white border border-[rgba(255,255,255,0.2)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] py-4 font-bold uppercase tracking-widest text-[12px] flex justify-center items-center gap-2 transition-colors rounded-sm"
              >
                <ShoppingCart size={16} /> ADD TO CART
              </button>
              <button 
                onClick={() => { addToCart(product); navigate('/cart'); }}
                className="flex-1 bg-[var(--theme-accent)] text-black py-4 font-bold uppercase tracking-widest text-[12px] hover:bg-white shadow-[0_0_15px_rgba(0,255,204,0.2)] transition-colors rounded-sm"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="w-full lg:w-[60%] flex flex-col text-white pt-2">
          
          {/* Breadcrumbs */}
          <div className="text-[#9CA3AF] text-[11px] mb-4 flex items-center gap-2 font-medium">
            <span onClick={() => navigate(-1)} className="hover:text-[var(--theme-accent)] cursor-pointer hover:underline">Home</span> 
            <span>/</span>
            <span onClick={() => navigate('/store')} className="hover:text-[var(--theme-accent)] cursor-pointer hover:underline">Store</span> 
            <span>/</span>
            <span className="text-gray-300">{product.category || 'General'}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-[28px] font-medium leading-snug mb-3">
            {product.title}
          </h1>
          
          {/* Ratings */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[var(--theme-accent)] text-black px-2 py-1 text-[11px] font-bold flex items-center gap-1 rounded-sm">
              {product.averageRating ? product.averageRating.toFixed(1) : "0.0"} <Star size={10} className="fill-black" />
            </div>
            <span className="text-[#9CA3AF] text-sm font-medium">
              {product.numReviews || 0} Ratings
            </span>
          </div>

          {/* Interactive Rating */}
          <div className="flex items-center gap-2 mb-6 bg-[#111111] p-3 rounded-sm border border-[rgba(255,255,255,0.05)] w-fit">
            <span className="text-[#9CA3AF] text-xs uppercase tracking-wider font-bold mr-2">
              {userRating > 0 ? "Your Rating:" : "Rate this:"}
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={`cursor-pointer transition-colors ${
                  (ratingHover >= star || (!ratingHover && userRating >= star)) 
                    ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]' 
                    : 'text-gray-600'
                } ${isSubmittingRating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onMouseEnter={() => !isSubmittingRating && setRatingHover(star)}
                onMouseLeave={() => !isSubmittingRating && setRatingHover(0)}
                onClick={() => !isSubmittingRating && handleRateProduct(star)}
              />
            ))}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-white tracking-tight">₹{(Number(product.price)).toLocaleString()}</span>
            <span className="text-sm text-[#9CA3AF] line-through mb-1.5">₹{(Number(product.price) * 1.25).toLocaleString()}</span>
            <span className="text-sm text-[var(--theme-accent)] font-bold mb-1.5">20% off</span>
          </div>

          {/* Offers */}
          <div className="flex flex-col gap-4 mb-8">
            <h3 className="text-[14px] font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-2">Available offers</h3>
            <div className="flex items-start gap-3 text-sm">
              <Zap size={16} className="text-[var(--theme-accent)] mt-0.5 shrink-0" />
              <p className="text-[#D1D5DB]"><span className="font-bold text-white">Bank Offer:</span> 5% Unlimited Cashback on CyberGrid Credit Card <span className="text-[var(--theme-accent)] cursor-pointer hover:underline text-xs ml-1">T&C</span></p>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Shield size={16} className="text-[var(--theme-accent)] mt-0.5 shrink-0" />
              <p className="text-[#D1D5DB]"><span className="font-bold text-white">Warranty:</span> 1 Year Premium Grid Warranty covered by manufacturer</p>
            </div>
          </div>

          {/* Specs / Highlights */}
          <div className="flex flex-col gap-4 mb-8">
            <h3 className="text-[14px] font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-2">Highlights</h3>
            <ul className="list-disc pl-5 text-sm text-[#D1D5DB] flex flex-col gap-2">
              <li>Premium build quality and high performance.</li>
              <li>Seamless integration with your smart ecosystem.</li>
              <li>7 Days Replacement Policy.</li>
              <li>Cash on Delivery available.</li>
            </ul>
          </div>

          {/* Description */}
          <div className="border border-[rgba(255,255,255,0.1)] rounded-sm p-6 mb-8 bg-[#0A0A0A]">
            <h3 className="text-[14px] font-bold text-white mb-4">Product Description</h3>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              {product.description || "Experience unparalleled quality with this premium product. Designed to seamlessly fit into your lifestyle and bring a touch of luxury to your everyday routine. Built with advanced materials to ensure durability and top-tier performance."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
