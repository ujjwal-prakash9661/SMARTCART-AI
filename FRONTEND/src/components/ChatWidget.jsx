import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, X, RefreshCw, Zap } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ChatMessages from './ChatMessages';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ChatWidget = ({ onClose }) => {
  const { token, user } = useAuth();
  const { addToCart, removeFromCart, updateQuantity, cartItems, cartTotal, clearCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const [messages, setMessages] = useState([
    {
      type: 'text',
      message: `Hi ${firstName}! I'm your SmartCart AI assistant. How can I elevate your shopping experience today?`,
      isUser: false,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const quickPrompts = [
    { label: 'Find a laptop', icon: '💻' },
    { label: 'Track order', icon: '📦' },
    { label: 'Best deals', icon: '🔥' },
    { label: 'Gift ideas', icon: '🎁' },
  ];

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    setShowSuggestions(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const executeAction = async (action) => {
    if (!action) return;

    try {
      if (action.type === 'add_to_cart') {
        addToCart(action.product, action.quantity);
      } else if (action.type === 'remove_from_cart') {
        removeFromCart(action.product._id);
      } else if (action.type === 'update_quantity') {
        updateQuantity(action.product._id, action.quantity);
      } else if (action.type === 'clear_cart') {
        clearCart();
      } else if (action.type === 'add_to_wishlist') {
        if (!isInWishlist(action.product._id)) {
          toggleWishlist(action.product);
        }
      } else if (action.type === 'remove_from_wishlist') {
        if (isInWishlist(action.product._id)) {
          toggleWishlist(action.product);
        }
      } else if (action.type === 'create_product') {
        await axiosInstance.post('/api/products', action.data);
        toast.success("Product created by AI");
      } else if (action.type === 'update_product') {
        await axiosInstance.put(`/api/products/${action.productId}`, action.data);
        toast.success("Product updated by AI");
      } else if (action.type === 'delete_product') {
        await axiosInstance.delete(`/api/products/${action.productId}`);
        toast.success("Product deleted by AI");
      } else if (action.type === 'rate_product') {
        await axiosInstance.post(`/api/products/${action.productId}/reviews`, { rating: action.rating });
        toast.success(`Rated ${action.rating} stars via AI`);
      } else if (action.type === 'change_theme') {
        const root = document.documentElement;
        if (action.accent) root.style.setProperty('--theme-accent', action.accent);
        if (action.secondary) root.style.setProperty('--theme-accent-secondary', action.secondary);
        toast.success("UI Aesthetic Updated");
      } else if (action.type === 'reset_theme') {
        const root = document.documentElement;
        root.style.removeProperty('--theme-accent');
        root.style.removeProperty('--theme-accent-secondary');
        toast.success("UI Reset to Initial State");
      } else if (action.type === 'checkout_confirm') {
        window.dispatchEvent(new CustomEvent('ai-trigger-checkout'));
        toast.success("Proceeding to Secure Checkout");
      } else if (action.type === 'configure_account') {
        await axiosInstance.put('/api/users/profile', action.data);
        toast.success("Account configured by AI");
      }
    } catch (err) {
      console.error("Action execution failed:", err);
      toast.error("AI action failed. Check console.");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!token) {
      setMessages(prev => [...prev, {
        type: 'text',
        message: "Please sign in to chat with me!",
        isUser: false,
      }]);
      return;
    }

    const userMessage = { type: 'text', message: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/ai', {
        message: input,
        cartContext: { items: cartItems, total: cartTotal }
      });

      const aiResponse = { ...response.data, isUser: false };

      if (aiResponse.type === 'navigation' && aiResponse.route) {
        setTimeout(() => navigate(aiResponse.route), 1500);
      }

      // Execute Agentic Actions (Single or Multiple)
      if (aiResponse.actions && Array.isArray(aiResponse.actions)) {
        for (const action of aiResponse.actions) {
          await executeAction(action);
        }
      } else if (aiResponse.action) {
        await executeAction(aiResponse.action);
      }

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'text',
        message: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        type: 'text',
        message: `Hi ${firstName}! I'm your SmartCart AI assistant. How can I elevate your shopping experience today?`,
        isUser: false,
      }
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-4 transition-colors duration-300">
      <div className="flex flex-col h-full bg-[#0A0A0A] border-2 border-[var(--theme-accent)] overflow-hidden relative shadow-[0_0_40px_rgba(0,255,204,0.15)] rounded-none">
        {/* Header */}
        <div className="p-4 px-5 flex justify-between items-center border-b-2 border-[var(--theme-accent)]/30 bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[var(--theme-accent)] flex items-center justify-center bg-[var(--theme-accent)]/10 overflow-hidden">
              <img src="/ai-robot.png" alt="AI Robot" className="w-full h-full object-cover scale-[1.3] mix-blend-screen opacity-80" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--theme-accent)] text-sm uppercase tracking-widest">SmartCart AI</h3>
              <p className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-[0.2em]">Shopping Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[var(--theme-accent)]">
            <button
              onClick={handleResetChat}
              className="hover:text-[var(--text-primary)] transition-colors p-1"
              title="Reset Chat"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="hover:text-red-500 transition-colors p-1"
              title="Close Assistant"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
          {messages.length > 0 ? (
            <ChatMessages messages={messages} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
              <Zap size={48} className="text-[var(--theme-accent)] mb-4" />
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">Chat history cleared.<br />Start a new conversation!</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 self-end px-1">Just now</span>
              <div className="flex items-center gap-2 text-[var(--theme-accent)] self-start bg-[#111111] p-3 rounded-none w-fit max-w-[85%] border border-[rgba(255,255,255,0.1)] shadow-sm">
                <Loader2 size={16} className="animate-spin text-[var(--theme-accent)]" />
                <span className="text-[11px] uppercase tracking-widest font-bold">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 px-5 pb-6">
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
              >
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handleQuickPrompt(prompt.label)}
                    className="flex-shrink-0 bg-[#111111] border border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-4 py-2 rounded-none text-[9px] uppercase tracking-widest font-bold hover:bg-[var(--theme-accent)] hover:text-black transition-all whitespace-nowrap"
                  >
                    <span className="mr-1">{prompt.icon}</span> {prompt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`w-12 h-12 flex-shrink-0 border flex items-center justify-center transition-all rounded-none ${showSuggestions ? 'bg-[var(--theme-accent)] text-black border-[var(--theme-accent)]' : 'bg-[#111111] border-[var(--theme-accent)]/30 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/20'}`}
            >
              <Zap size={16} />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="TYPE YOUR MESSAGE..."
                className="w-full bg-[#111111] border border-[var(--theme-accent)]/50 rounded-none py-3.5 pl-4 pr-14 text-[11px] font-bold uppercase tracking-widest text-[var(--theme-accent)] focus:outline-none focus:border-[var(--theme-accent)] transition-all placeholder-[#4B5563]"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--theme-accent)] hover:bg-white disabled:opacity-50 disabled:hover:bg-[var(--theme-accent)] text-black rounded-none flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,255,204,0.4)]"
              >
                <Send size={14} className="transform translate-x-px" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
