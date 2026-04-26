import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Package, ShoppingCart, Heart, User, Settings, Sparkles, MoreVertical, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, token } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Categories', path: '/store', icon: <Grid size={20} /> },
    { name: 'Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingCart size={20} />, badge: cartCount },
    { name: 'Wishlist', path: '/wishlist', icon: <Heart size={20} />, badge: wishlistCount },
    { name: 'Profile', path: token ? '/profile' : '/auth', icon: <User size={20} /> },
    { name: 'Settings', path: '#', icon: <Settings size={20} /> },
  ];

  const isSuperAdmin = user?.email === 'ujjwalprakashrc11.22@gmail.com';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: <ShieldAlert size={20} /> });
  }

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-64 bg-[var(--bg-secondary)] h-screen flex flex-col border-r border-[var(--border-color)] flex-shrink-0 relative z-20 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cubeGrad" x1="20" y1="32" x2="20" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            {/* Outer Hexagon */}
            <path d="M20 2 L35.6 11 V29 L20 38 L4.4 29 V11 Z" stroke="var(--accent-primary)" strokeOpacity="0.3" strokeWidth="1"/>
            
            {/* Inner Cube */}
            <path d="M20 10 L28.66 15 V25 L20 30 L11.34 25 V15 Z" stroke="url(#cubeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.34 15 L20 20 L28.66 15" stroke="url(#cubeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 30 V20" stroke="url(#cubeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[19px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-1">SmartCart <span className="text-[var(--accent-primary)]">AI</span></h1>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-none">AI Powered Shopping</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-hide">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? 'bg-violet-600/10 text-[var(--text-primary)] border border-violet-500/30 shadow-[inset_0_0_20px_rgba(124,58,237,0.1)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.8)]"
                />
              )}
              <div className={`${isActive ? 'text-violet-400' : 'group-hover:text-[var(--text-primary)] transition-colors'}`}>
                {link.icon}
              </div>
              <span className="font-medium text-[12px]">{link.name}</span>
              
              {link.badge > 0 && (
                <div className="ml-auto bg-violet-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(124,58,237,0.6)]">
                  {link.badge}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* AI Assistant Promo */}
      <div className="px-3 pb-3 mt-auto">
        <div className="relative rounded-[16px] overflow-hidden p-4 border border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-tertiary)] to-[var(--bg-primary)] backdrop-blur-md">
          <div className="relative z-10">
            <h3 className="text-[var(--text-primary)] font-bold text-[13px] mb-0.5 leading-tight">AI Shopping</h3>
            <p className="text-[#9D4EDD] font-bold text-[13px] leading-tight mb-2">Assistant</p>
            
            <div className="flex justify-center mb-2 relative h-20 mt-1">
               <div className="absolute inset-0 flex items-center justify-center">
                 <img 
                   src="/ai-robot.png" 
                   alt="AI Robot" 
                   className="w-full h-full object-cover scale-[1.5] mix-blend-screen" 
                   style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 80%)', maskImage: 'radial-gradient(circle at center, black 50%, transparent 80%)' }}
                 />
               </div>
            </div>

            <div className="text-[11px] text-[var(--text-secondary)] mb-3 space-y-0.5 leading-tight">
              <p>Ask anything.</p>
              <p>Find everything.</p>
              <p>Buy smarter.</p>
            </div>
            
            <button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white py-2 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
              Start Chatting ✨
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)] text-xs overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name || (token ? 'Loading...' : 'Guest User')}</h4>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[var(--text-secondary)]">{token ? 'Premium Member' : 'Not signed in'}</span>
              {token && (
                <div className="w-3 h-3 bg-violet-500 rounded-full flex items-center justify-center shadow-[0_0_5px_rgba(124,58,237,0.8)]">
                  <Sparkles size={8} className="text-white" />
                </div>
              )}
            </div>
          </div>
          {token && (
            <button 
              onClick={logout}
              className="text-[var(--text-secondary)] hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
