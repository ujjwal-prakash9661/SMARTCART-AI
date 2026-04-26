import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const StorePage = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  const location = useLocation();
  const { user } = useAuth();

  // Fetch unique categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/products/categories');
        const cats = response.data.map(cat => ({
          raw: cat,
          display: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
        }));
        setCategories([{ raw: 'All Products', display: 'All Products' }, ...cats]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([{ raw: 'All Products', display: 'All Products' }]);
      }
    };
    fetchCategories();
  }, []);

  // Effect to reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice]);

  // Effect to fetch filtered data from backend
  useEffect(() => {
    const fetchFiltered = async () => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const params = { page, limit: 12 };
        if (selectedCategory !== 'All Products') params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (sortBy !== 'relevance') params.sort = sortBy;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const response = await axiosInstance.get('/api/products', { params });
        const { products, totalPages: fetchedTotalPages, totalProducts: fetchedTotalCount } = response.data;
        
        if (page === 1) {
          setFilteredProducts(products);
        } else {
          setFilteredProducts(prev => [...prev, ...products]);
        }
        
        setTotalPages(fetchedTotalPages);
        setTotalProductsCount(fetchedTotalCount);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchFiltered();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [page, selectedCategory, searchQuery, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearchQuery(query);
  }, [location.search]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div 
      className="px-8 py-12 w-full max-w-[1600px] mx-auto" 
      style={{ '--theme-accent': 'var(--theme-store)' }}
    >
      {/* Header Section */}
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--theme-accent)] mb-4 font-semibold">Premium Store</p>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-none uppercase max-w-3xl">
            Premium Products <br /> For You.
          </h1>
          <div className="text-[10px] text-[#4B5563] uppercase tracking-[0.2em] font-bold">
            Showing <span className="text-white">{filteredProducts.length}</span> of <span className="text-white">{totalProductsCount}</span> Items
          </div>
        </div>
        
        {/* Categories & Filters Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0A0A0A] border-y border-[rgba(255,255,255,0.08)] py-0">
          
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <div className="flex">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.raw;
                return (
                  <button 
                    key={cat.raw}
                    onClick={() => setSelectedCategory(cat.raw)}
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold transition-all ${
                      isActive 
                        ? 'bg-[var(--theme-accent)] text-black' 
                        : 'text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {cat.display}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-6 px-6 py-4 md:py-0 text-[10px] uppercase tracking-widest text-[#9CA3AF] border-t md:border-t-0 border-[rgba(255,255,255,0.08)] w-full md:w-auto">
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => { setShowSort(!showSort); setShowFilters(false); }}
              >
                <span>Sort by:</span>
                <span className="text-[var(--theme-accent)]">
                  {sortBy === 'price_asc' ? 'Price: Low to High' : sortBy === 'price_desc' ? 'Price: High to Low' : sortBy === 'newest' ? 'Newest' : 'Relevance'}
                </span>
                <ChevronDown size={12} className={`transform transition-transform ${showSort ? 'rotate-180' : ''}`} />
              </div>
              
              <AnimatePresence>
                {showSort && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-48 bg-[#111111] border border-[rgba(255,255,255,0.1)] z-50 shadow-2xl"
                  >
                    {['relevance', 'newest', 'price_asc', 'price_desc'].map(option => (
                      <div 
                        key={option}
                        onClick={() => { setSortBy(option); setShowSort(false); }}
                        className={`px-4 py-3 cursor-pointer hover:bg-[var(--theme-accent)]/10 transition-colors ${sortBy === option ? 'text-[var(--theme-accent)]' : 'text-white'}`}
                      >
                        {option === 'price_asc' ? 'Price: Low to High' : option === 'price_desc' ? 'Price: High to Low' : option === 'newest' ? 'Newest' : 'Relevance'}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="hidden md:block w-px h-4 bg-[rgba(255,255,255,0.1)]"></div>
            
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                onClick={() => { setShowFilters(!showFilters); setShowSort(false); }}
              >
                <SlidersHorizontal size={12} />
                <span>Advanced Filters</span>
              </div>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-[#111111] border border-[rgba(255,255,255,0.1)] z-50 p-6 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold tracking-widest">PRICE RANGE</h3>
                      <button onClick={() => setShowFilters(false)} className="text-[#9CA3AF] hover:text-white"><X size={14} /></button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <input 
                        type="number" 
                        placeholder="Min ₹" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] px-3 py-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors"
                      />
                      <span className="text-[#9CA3AF]">-</span>
                      <input 
                        type="number" 
                        placeholder="Max ₹" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] px-3 py-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                         className="flex-1 border border-[rgba(255,255,255,0.1)] text-[#9CA3AF] hover:text-white py-2 transition-colors"
                       >
                         RESET
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-accent)]"></div>
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-32 text-[#9CA3AF] bg-[#111111] border border-[rgba(255,255,255,0.05)] shadow-inner">
                <div className="text-3xl mb-4 opacity-50">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No products found</h3>
                <p className="text-xs uppercase tracking-wider">Zero results for current selection</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All Products');}}
                  className="mt-8 border border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[rgba(0,255,204,0.1)] px-6 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="h-px bg-white/5 w-full max-w-sm"></div>
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="group relative flex items-center gap-4 bg-[#111111] border border-white/10 px-10 py-5 hover:border-[var(--theme-accent)] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-[var(--theme-accent)]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {isLoadingMore ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--theme-accent)]"></div>
                ) : (
                  <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] relative z-10">Load More Products</span>
                )}
                <ChevronRight size={14} className="text-[var(--theme-accent)] group-hover:translate-x-2 transition-transform relative z-10" />
              </button>
              <p className="text-[9px] text-[#4B5563] uppercase tracking-widest font-bold">
                PAGE {page} OF {totalPages}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StorePage;
