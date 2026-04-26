import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Headphones, Laptop, Watch, Bike, Briefcase, Grid } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


const HomePage = () => {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState([]);

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/api/products');
        const data = response.data || [];
        setAllProducts(data);
        setTrendingProducts(data.slice(0, 4));

        // Aggregate categories
        const catMap = data.reduce((acc, p) => {
          if (p.category) {
            const cat = p.category.trim();
            acc[cat] = (acc[cat] || 0) + 1;
          }
          return acc;
        }, {});

        // Map icons dynamically or use default
        const getIconForCat = (catName) => {
          const lower = catName.toLowerCase();
          if (lower.includes('electronic') || lower.includes('phone') || lower.includes('mobile')) return <Headphones size={24} />;
          if (lower.includes('laptop') || lower.includes('computer')) return <Laptop size={24} />;
          if (lower.includes('watch')) return <Watch size={24} />;
          if (lower.includes('bike') || lower.includes('cycle')) return <Bike size={24} />;
          if (lower.includes('access')) return <Briefcase size={24} />;
          return <Grid size={24} />;
        };

        const aggregated = Object.keys(catMap).map(key => ({
          name: key,
          items: `${catMap[key]} Items`,
          icon: getIconForCat(key)
        }));

        setDynamicCategories(aggregated);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const slides = [
    {
      title: "Smart",
      highlight: "Shopping",
      subtitle: "Experience seamless shopping powered by advanced AI.\nDiscover top-tier products tailored just for you.",
      image: "/neon-cart.png"
    },
    {
      title: "Next-Gen",
      highlight: "Gaming Gear",
      subtitle: "Step into the future of immersive entertainment\nwith our curated gaming selection.",
      image: "/neon-vr.png"
    },
    {
      title: "Smart",
      highlight: "Wearables",
      subtitle: "Track your life and stay connected\nwherever you go.",
      image: "/neon-watch.png"
    },
    {
      title: "Premium",
      highlight: "Audio Fidelity",
      subtitle: "Experience sound that moves you\nwith our high-end headphones.",
      image: "/neon-headphones.png"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="px-8 py-12 w-full max-w-[1600px] mx-auto">

      {/* Hero Banner */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-24 gap-12">
        <div className="flex-1 z-20">
          <div className="flex items-center gap-4 mb-6">
            <div className="border border-[var(--theme-accent)] text-[var(--theme-accent)] text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-bold">
              Your Smart Cart
            </div>
            <div className="h-px bg-[rgba(255,255,255,0.2)] w-16"></div>
            <span className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em]">Premium Quality</span>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-[200px]"
            >
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter leading-[0.9] uppercase">
                {slides[currentSlide].title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-secondary)] drop-shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                  {slides[currentSlide].highlight}
                </span>
              </h1>
              
              <p className="text-[#9CA3AF] text-sm mb-10 max-w-md leading-relaxed whitespace-pre-line">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex items-center gap-4">
            <Link to="/store" className="bg-[var(--theme-accent)] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,255,204,0.3)]">
              Start Shopping
            </Link>
            <Link to="/store" className="border border-[rgba(255,255,255,0.2)] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] transition-colors">
              View Categories
            </Link>
          </div>
        </div>

        {/* 3D Image placeholder / Element */}
        <div className="flex-1 relative h-[500px] w-full flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--theme-accent)]/5 blur-[150px] rounded-full"></div>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={slides[currentSlide].image}
              alt={slides[currentSlide].highlight}
              className="absolute h-full object-contain drop-shadow-[0_0_40px_rgba(0,255,204,0.2)] z-10"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8 relative overflow-hidden group">
          <div className="text-[var(--theme-accent)] mb-4"><Zap size={20} /></div>
          <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] mb-2">Customer Satisfaction</p>
          <div className="text-5xl font-bold text-white tracking-tighter">99.8<span className="text-[var(--theme-accent)] text-3xl">%</span></div>
          <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)] text-[10px] text-[#4B5563] uppercase tracking-wider italic">
            Based on recent reviews.
          </div>
        </div>
        
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8 relative overflow-hidden flex flex-col justify-end min-h-[200px]">
          <div className="absolute inset-0 bg-[url('/neon-cart.png')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity mix-blend-screen"></div>
          <h3 className="text-xl font-bold text-white z-10 relative">New Arrivals</h3>
          <p className="text-[var(--theme-accent)] text-[10px] uppercase tracking-[0.2em] font-bold z-10 relative">Shop Now</p>
        </div>

        <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8 relative overflow-hidden flex flex-col justify-end min-h-[200px]">
          <div className="absolute inset-0 bg-[url('/neon-headphones.png')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity mix-blend-screen"></div>
          <h3 className="text-xl font-bold text-white z-10 relative">Best Sellers</h3>
          <p className="text-[var(--theme-accent-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold z-10 relative">Trending</p>
        </div>
      </div>

      {/* Trending Products */}
      <div className="mb-24">
        <div className="flex justify-between items-end mb-10 border-b border-[rgba(255,255,255,0.08)] pb-4">
          <div>
            <p className="text-[var(--theme-accent)] text-[9px] uppercase tracking-[0.2em] font-bold mb-2">Top Picks</p>
            <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Trending Products</h2>
          </div>
          <Link to="/store" className="text-[#9CA3AF] text-[10px] uppercase tracking-[0.2em] font-bold hover:text-[var(--theme-accent)] transition-colors flex items-center gap-2">
            Explore All Products <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--theme-accent)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="py-24 text-center border-t border-b border-[rgba(255,255,255,0.05)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-[var(--theme-accent)]/5 blur-[100px] -z-10"></div>
        <div className="flex justify-center mb-6 text-[var(--theme-accent)]"><Zap size={32} /></div>
        
        {user ? (
          <>
            <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-6">
              Welcome Back, <br /> <span className="text-[var(--theme-accent)]">{user.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-[#9CA3AF] text-sm max-w-xl mx-auto mb-10 uppercase tracking-widest font-medium">
              Your personalized AI recommendations are waiting. <br /> Continue your premium shopping journey.
            </p>
            <Link to="/store" className="bg-[var(--theme-accent)] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-10 py-4 hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,204,0.2)] inline-block">
              Explore The Store
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-6">
              Premium Shopping <br /> Experience
            </h2>
            <p className="text-[#9CA3AF] text-sm max-w-xl mx-auto mb-10">
              Sign up today to discover exclusive deals and personalized recommendations powered by SmartCart AI.
            </p>
            <Link to="/auth" className="border border-[rgba(255,255,255,0.2)] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] transition-colors inline-block">
              Sign Up Now
            </Link>
          </>
        )}
      </div>

    </div>
  );
};

export default HomePage;
