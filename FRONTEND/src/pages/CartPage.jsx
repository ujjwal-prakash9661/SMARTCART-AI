import React, { useState, useEffect } from 'react';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, User, Phone, MapPin, CreditCard, ChevronLeft, X, Globe, Building, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const CheckoutModal = ({ isOpen, onClose, total, cartItems, clearCart, user }) => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    pincode: '',
    country: 'INDIA'
  });

  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.addresses?.find(a => a.isDefault)?.text || user.addresses?.[0]?.text || ''
      }));
    }
  }, [user, isOpen]);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Order on Backend
      const { data: orderResponse } = await axiosInstance.post('/api/payment/create-order', {
        amount: total
      });

      const options = {
        key: orderResponse.key_id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "SmartCart AI",
        description: "Transaction for Order #" + orderResponse.id.slice(-6),
        order_id: orderResponse.id,
        handler: async (response) => {
          try {
            // 2. Verify Payment on Backend
            const { data: verifyData } = await axiosInstance.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyData.message === "Payment verified successfully") {
              // 3. Place Final Order in Database
              const products = cartItems.flatMap(item => Array(item.quantity || 1).fill(item._id));
              const fullAddress = `${data.address}, ${data.city}, ${data.state}, ${data.country} - ${data.pincode}`;
              
              await axiosInstance.post('/api/orders', { 
                products,
                location: fullAddress,
                paymentMethod: "Razorpay Gateway",
                paymentStatus: "PAID & CONFIRMED"
              });

              clearCart();
              toast.success('Payment Successful! Order placed. 🎉');
              onClose();
              navigate('/orders');
            }
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: data.name,
          email: user?.email,
          contact: data.phone
        },
        image: "https://cdn-icons-png.flaticon.com/512/1162/1162499.png", // Remote logo to avoid localhost CORS
        theme: {
          color: "#00FFCC"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      toast.error("Could not initialize payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0A0A0A] border-2 border-[var(--theme-accent)] shadow-[0_0_50px_rgba(0,255,204,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center bg-[#111111]">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="text-[var(--theme-accent)]" />
              Secure Checkout
            </h2>
            <div className="flex gap-2 mt-2">
               <div className={`h-1 w-12 ${step >= 1 ? 'bg-[var(--theme-accent)]' : 'bg-white/10'}`}></div>
               <div className={`h-1 w-12 ${step >= 2 ? 'bg-[var(--theme-accent)]' : 'bg-white/10'}`}></div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#4B5563] hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="ship" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">Full Name</label>
                    <div className="flex items-center bg-[#111111] border border-white/5 p-3 gap-3 focus-within:border-[var(--theme-accent)] transition-all">
                      <User size={14} className="text-[var(--theme-accent)]" />
                      <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="bg-transparent border-none w-full text-xs text-white focus:outline-none uppercase" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">Phone Number</label>
                    <div className="flex items-center bg-[#111111] border border-white/5 p-3 gap-3 focus-within:border-[var(--theme-accent)] transition-all">
                      <Phone size={14} className="text-[var(--theme-accent)]" />
                      <input type="text" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="bg-transparent border-none w-full text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">Street Address</label>
                  <div className="flex items-start bg-[#111111] border border-white/5 p-3 gap-3 focus-within:border-[var(--theme-accent)] transition-all">
                    <MapPin size={14} className="text-[var(--theme-accent)] mt-1" />
                    <textarea rows="2" value={data.address} onChange={e => setData({...data, address: e.target.value})} className="bg-transparent border-none w-full text-xs text-white focus:outline-none uppercase resize-none"></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">City</label>
                    <input type="text" value={data.city} onChange={e => setData({...data, city: e.target.value})} className="bg-[#111111] border border-white/5 p-3 w-full text-xs text-white focus:outline-none focus:border-[var(--theme-accent)] uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">State</label>
                    <input type="text" value={data.state} onChange={e => setData({...data, state: e.target.value})} className="bg-[#111111] border border-white/5 p-3 w-full text-xs text-white focus:outline-none focus:border-[var(--theme-accent)] uppercase" />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">Country</label>
                    <input type="text" value={data.country} onChange={e => setData({...data, country: e.target.value})} className="bg-[#111111] border border-white/5 p-3 w-full text-xs text-white focus:outline-none focus:border-[var(--theme-accent)] uppercase" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">Zipcode</label>
                    <div className="flex items-center bg-[#111111] border border-white/5 p-3 gap-3 focus-within:border-[var(--theme-accent)] transition-all">
                      <Navigation size={14} className="text-[var(--theme-accent)]" />
                      <input type="text" value={data.zipcode} onChange={e => setData({...data, zipcode: e.target.value})} className="bg-transparent border-none w-full text-xs text-white focus:outline-none uppercase" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#4B5563] font-bold">Pincode</label>
                    <div className="flex items-center bg-[#111111] border border-white/5 p-3 gap-3 focus-within:border-[var(--theme-accent)] transition-all">
                      <Building size={14} className="text-[var(--theme-accent)]" />
                      <input type="text" value={data.pincode} onChange={e => setData({...data, pincode: e.target.value})} className="bg-transparent border-none w-full text-xs text-white focus:outline-none uppercase" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="pay" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="p-6 bg-[#111111] border-2 border-[var(--theme-accent)] shadow-[0_0_20px_rgba(0,255,204,0.1)] flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-black flex items-center justify-center border border-white/10">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" className="h-4" alt="Razorpay" />
                      </div>
                      <div>
                        <p className="text-white text-[10px] font-bold tracking-widest uppercase">Razorpay Gateway</p>
                        <p className="text-[8px] text-[#4B5563] tracking-widest uppercase">Cards, UPI, Netbanking</p>
                      </div>
                   </div>
                   <div className="w-4 h-4 rounded-full bg-[var(--theme-accent)]"></div>
                </div>

                <div className="bg-[#0A0A0A] p-6 border border-white/5 space-y-4">
                   <div className="flex justify-between text-[10px] uppercase tracking-widest">
                      <span className="text-[#4B5563]">Ship To</span>
                      <span className="text-white font-bold">{data.name}</span>
                   </div>
                   <div className="flex justify-between text-[10px] uppercase tracking-widest border-t border-white/5 pt-4">
                      <span className="text-[#4B5563]">Total Payable</span>
                      <span className="text-[var(--theme-accent)] text-xl font-bold">₹{total.toLocaleString()}</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-[#111111] border-t border-white/10 flex gap-4">
          {step === 1 ? (
             <button onClick={() => setStep(2)} className="flex-1 bg-[var(--theme-accent)] hover:bg-white text-black py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3">
               CONTINUE TO PAYMENT <ArrowRight size={14} />
             </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 border border-white/10 text-[#4B5563] hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <button onClick={handleRazorpayPayment} disabled={isProcessing} className="flex-1 bg-[var(--theme-accent)] hover:bg-white text-black py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                {isProcessing ? <Loader /> : <>PROCEED WITH RAZORPAY <ArrowRight size={14} /></>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Loader = () => <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>;

const CartPage = () => {
  const { cartItems, removeFromCart, cartTotal, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cartTotal;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  useEffect(() => {
    const handleAICheckout = () => {
      setShowCheckout(true);
    };
    window.addEventListener('ai-trigger-checkout', handleAICheckout);
    return () => window.removeEventListener('ai-trigger-checkout', handleAICheckout);
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="px-8 py-20 w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[60vh]" style={{ '--theme-accent': 'var(--theme-cart)' }}>
        <div className="bg-[#111111] p-10 border border-white/5 mb-8"><ShoppingBag size={64} className="text-[#4B5563]" /></div>
        <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-widest">Your cart is empty</h2>
        <button onClick={() => navigate('/store')} className="border border-[var(--theme-accent)] text-[var(--theme-accent)] px-10 py-4 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[var(--theme-accent)] hover:text-black transition-colors">EXPLORE STORE</button>
      </div>
    );
  }

  return (
    <div className="px-8 py-12 w-full max-w-[1400px] mx-auto transition-colors duration-300" style={{ '--theme-accent': 'var(--theme-cart)' }}>
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-[var(--theme-accent)] text-[10px] uppercase tracking-[0.3em] font-bold">Shopping Cart</p>
          <div className="h-px bg-white/10 w-32"></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Active Session</h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-4">
           {cartItems.map(item => (
             <div key={item._id} className="bg-[#111111] border border-white/5 p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-[var(--theme-accent)]/30 transition-all">
                <div className="w-20 h-20 bg-[#0A0A0A] p-2 flex-shrink-0 border border-white/5"><img src={item.image} alt="" className="max-h-full max-w-full object-contain mix-blend-screen" /></div>
                <div className="flex-1">
                   <p className="text-[var(--theme-accent)] text-[8px] uppercase tracking-widest font-bold mb-1">{item.category}</p>
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider">{item.title}</h3>
                </div>
                <div className="flex items-center border border-white/10 bg-[#0A0A0A]">
                  <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)} className="px-4 py-2 text-[#4B5563] hover:text-white">-</button>
                  <span className="w-10 text-center text-white font-bold text-xs">{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)} className="px-4 py-2 text-[#4B5563] hover:text-white">+</button>
                </div>
                <div className="text-right font-bold text-white w-24">₹{(item.price * (item.quantity || 1)).toLocaleString()}</div>
                <button onClick={() => removeFromCart(item._id)} className="text-[#4B5563] hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
             </div>
           ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-[#0A0A0A] border border-white/10 p-8 sticky top-24">
            <h3 className="text-white text-[11px] uppercase tracking-widest font-bold mb-8">Transaction Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[#9CA3AF] text-[10px] uppercase tracking-widest"><span>Subtotal</span><span className="text-white">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-[#9CA3AF] text-[10px] uppercase tracking-widest"><span>Tax (8%)</span><span className="text-white">₹{tax.toLocaleString()}</span></div>
            </div>
            <div className="border-t border-white/5 pt-6 mb-8 flex justify-between items-end">
              <span className="text-white font-bold uppercase tracking-widest text-xs">Total</span>
              <span className="text-3xl font-bold text-[var(--theme-accent)]">₹{total.toLocaleString()}</span>
            </div>
            <button onClick={() => setShowCheckout(true)} className="w-full bg-[var(--theme-accent)] hover:bg-white text-black py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3">
               AUTHORIZE PAYMENT <ArrowRight size={14} />
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-[#4B5563] text-[8px] uppercase tracking-widest font-bold opacity-50">
               <ShieldCheck size={12} className="text-[var(--theme-accent)]" /> SECURE SSL ENCRYPTION
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        total={total} 
        cartItems={cartItems} 
        clearCart={clearCart} 
        user={user} 
      />
    </div>
  );
};

export default CartPage;
