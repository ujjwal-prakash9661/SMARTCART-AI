import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Zap, ShoppingCart, User, Heart, Palette, RotateCcw, X, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { AnimatePresence, motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';

const Navbar = ({ onToggleChat, isChatOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, updateUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localThemes, setLocalThemes] = useState({
    navbar: user?.settings?.themeColors?.navbar || '#00FFCC',
    store: user?.settings?.themeColors?.store || '#00FFCC',
    cart: user?.settings?.themeColors?.cart || '#00FFCC',
    orders: user?.settings?.themeColors?.orders || '#00FFCC',
    profile: user?.settings?.themeColors?.profile || '#00FFCC',
    admin: user?.settings?.themeColors?.admin || '#00FFCC'
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const searchInputRef = useRef(null);
  const themeMenuRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (user?.settings?.themeColors) {
      setLocalThemes(user.settings.themeColors);
    }
  }, [user?.settings?.themeColors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (section, color) => {
    setLocalThemes(prev => ({ ...prev, [section]: color }));
    document.documentElement.style.setProperty(`--theme-${section}`, color);
    if (section === 'navbar') {
      document.documentElement.style.setProperty('--theme-accent', color);
    }
  };

  const handleThemeSave = async (section, color) => {
    if (user?.settings?.themeColors?.[section] !== color) {
      const newColors = { ...localThemes, [section]: color };
      await updateUser({ settings: { ...user?.settings, themeColors: newColors } });
    }
  };

  const handleResetTheme = async (section) => {
    const defaultColor = '#00FFCC';
    handleThemeChange(section, defaultColor);
    if (user && user?.settings?.themeColors?.[section] !== defaultColor) {
      const newColors = { ...localThemes, [section]: defaultColor };
      await updateUser({ settings: { ...user?.settings, themeColors: newColors } });
    }
  };

  const handleResetAllThemes = async () => {
    const defaultColor = '#00FFCC';
    const resetColors = {
      navbar: defaultColor,
      store: defaultColor,
      cart: defaultColor,
      orders: defaultColor,
      profile: defaultColor,
      admin: defaultColor
    };

    setLocalThemes(resetColors);
    Object.keys(resetColors).forEach(section => {
      document.documentElement.style.setProperty(`--theme-${section}`, defaultColor);
    });
    document.documentElement.style.setProperty('--theme-accent', defaultColor);

    if (user) {
      await updateUser({ settings: { ...user?.settings, themeColors: resetColors } });
    }
  };

  const hasCustomTheme = Object.values(localThemes).some(color => color.toUpperCase() !== '#00FFCC');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axiosInstance.get(`/api/products/suggestions?query=${searchQuery}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestions fetch failed:", err);
      }
    };

    const debounceId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounceId);
  }, [searchQuery]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (location.pathname === '/store') {
      navigate(`/store?search=${encodeURIComponent(val.trim())}`, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      if (location.pathname !== '/store') {
        navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.title);
    setShowSuggestions(false);
    navigate(`/product/${product._id}`);
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'ujjwalprakashrc11.22@gmail.com';

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/store' },
    { name: 'ORDERS', path: '/orders' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'ADMIN', path: '/admin' });
  }

  return (
    <header className="relative z-50 bg-[#0A0A0A] border-b border-[rgba(255,255,255,0.08)] px-4 md:px-8 py-5 flex-shrink-0 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4 md:gap-8 max-w-[1600px] mx-auto">

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-[#9CA3AF] hover:text-[var(--theme-accent)] transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg md:text-xl tracking-wider text-[var(--theme-accent)] uppercase">
            SmartCart AI
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 flex-1 ml-10">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className={`text-[10px] uppercase tracking-[0.2em] font-semibold transition-all pb-1 border-b-2 ${location.pathname === link.path ? 'text-[var(--theme-accent)] border-[var(--theme-accent)]' : 'text-[#9CA3AF] border-transparent hover:text-white'}`}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Search Bar with Suggestions */}
        <div className="hidden lg:flex max-w-sm relative flex-1">
          <div className="flex w-full items-center bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-md overflow-hidden focus-within:border-[var(--theme-accent)] transition-all">
            <div className="pl-3 text-[#9CA3AF]"><Search size={14} /></div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full bg-transparent py-2.5 px-3 text-[10px] tracking-widest text-white focus:outline-none placeholder-[#4B5563]"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSuggestions([]); }} className="pr-3 text-[#4B5563] hover:text-white transition-colors">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] shadow-2xl z-[100] overflow-hidden"
              >
                <div className="max-h-[300px] overflow-y-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleSuggestionClick(product)}
                      className="flex items-center gap-4 p-3 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer group"
                    >
                      <div className="w-8 h-8 bg-white p-1 rounded-sm flex-shrink-0">
                        <img src={product.image} className="w-full h-full object-contain" alt={product.title} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-[10px] font-bold text-white uppercase truncate group-hover:text-[var(--theme-accent)] transition-colors">
                          {product.title}
                        </div>
                        <div className="text-[8px] text-[#4B5563] uppercase tracking-widest font-medium">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link to="/wishlist" className="relative text-[#9CA3AF] hover:text-[var(--theme-accent)] transition-colors">
            <Heart size={18} />
            {wishlistCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-[var(--theme-accent)] text-[8px] font-black text-black flex items-center justify-center">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="relative text-[#9CA3AF] hover:text-[var(--theme-accent)] transition-colors">
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-[var(--theme-accent)] text-[8px] font-black text-black flex items-center justify-center">{cartCount}</span>}
          </Link>
          <button onClick={onToggleChat} className={`text-[#9CA3AF] hover:text-[var(--theme-accent)] ${isChatOpen ? 'text-[var(--theme-accent)]' : ''}`}><Zap size={18} /></button>

          <div className="flex items-center bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-md px-1 py-1 h-8">
            <div className="relative" ref={themeMenuRef}>
              <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-white"><Palette size={14} /></button>
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-4 w-64 bg-[#111111] border border-[rgba(255,255,255,0.1)] p-4 shadow-2xl">
                    <h3 className="text-[10px] font-bold text-white uppercase mb-4 tracking-widest border-b border-white/10 pb-2">Themes</h3>
                    <div className="space-y-3">
                      {['navbar', 'store', 'cart', 'orders', 'profile', 'admin'].map(id => (
                        <div key={id} className="flex items-center justify-between">
                          <span className="text-[10px] text-[#9CA3AF] uppercase">{id}</span>
                          <input
                            type="color"
                            value={localThemes[id]}
                            onChange={(e) => handleThemeChange(id, e.target.value)}
                            onBlur={(e) => handleThemeSave(id, e.target.value)}
                            className="w-4 h-4 rounded-full cursor-pointer border-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {hasCustomTheme && (
              <>
                <div className="w-px h-3 bg-white/10 mx-1"></div>
                <button onClick={handleResetAllThemes} className="w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-[var(--theme-accent)]"><RotateCcw size={12} /></button>
              </>
            )}
          </div>

          <Link to="/profile" className="hidden sm:flex items-center gap-2 border border-white/10 px-4 py-1.5 rounded-full hover:border-[var(--theme-accent)] group">
            <span className="text-[10px] font-bold text-white uppercase">Account</span>
            <User size={14} className="text-[#9CA3AF] group-hover:text-[var(--theme-accent)]" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 top-[73px] bg-[#0A0A0A] z-[60] p-6 flex flex-col gap-8 md:hidden"
          >
            {/* Mobile Search */}
            <div className="relative">
              <div className="flex w-full items-center bg-[#111111] border border-[var(--theme-accent)]/30 rounded-md overflow-hidden">
                <div className="pl-3 text-[#9CA3AF]"><Search size={14} /></div>
                <input
                  type="text"
                  placeholder="SEARCH PRODUCTS..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-transparent py-3 px-3 text-[11px] tracking-widest text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Links */}
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold uppercase tracking-[0.2em] text-[#E5E7EB] hover:text-[var(--theme-accent)] border-b border-white/5 pb-4"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold uppercase tracking-[0.2em] text-[var(--theme-accent)]"
              >
                MY ACCOUNT
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
