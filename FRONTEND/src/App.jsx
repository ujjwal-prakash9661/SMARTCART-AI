import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import WishlistPage from './pages/WishlistPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return null;
  if (!token) return <Navigate to="/auth" />;
  
  return children;
};

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

// Main Layout for Dashboard
const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = React.useState(true);
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) {
    return <main className="w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">{children}</main>;
  }

  return (
    <div className="flex min-h-screen md:h-screen w-full md:overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Top Navigation replaces Sidebar */}

      {/* Center Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Navbar onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-10">
          {children}
        </main>

        {/* Floating Chat Button (when closed) */}
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)] z-50 hover:bg-violet-500 transition-all hover:scale-110 active:scale-95"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </div>

      {/* Mobile Chat Overlay (Fixed) */}
      <AnimatePresence mode="wait">
        {isChatOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0, x: 100 }}
            animate={{ 
              width: window.innerWidth < 768 ? "100%" : "380px", 
              opacity: 1, 
              x: 0 
            }}
            exit={{ width: 0, opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`flex-shrink-0 bg-[var(--bg-secondary)] border-l border-[var(--border-color)] flex flex-col h-screen z-50 transition-colors duration-300 overflow-hidden ${
              window.innerWidth < 768 ? 'fixed inset-0' : 'relative'
            }`}
          >
            <ChatWidget onClose={() => setIsChatOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ThemeProvider>
            <BrowserRouter>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/store" element={<ProtectedRoute><StorePage /></ProtectedRoute>} />
                  <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="*" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                </Routes>
              </DashboardLayout>
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  className: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]',
                  style: {
                    borderRadius: '16px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  },
                }}
              />
            </BrowserRouter>
          </ThemeProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
