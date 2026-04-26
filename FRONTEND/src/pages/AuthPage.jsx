import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Package, AlertCircle, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, token, setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      setToken(urlToken);
      navigate('/');
      return;
    }

    if (token) {
      navigate('/');
    }
  }, [token, navigate, setToken]);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!isLogin && name.trim().length < 3) {
      setError('Full name must be at least 3 characters.');
      return;
    }

    const emailRegex = /^[A-Za-z][^\s@]*@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (/^[^A-Za-z]/.test(email)) {
        setError('Email address must start with a letter.');
      } else {
        setError('Please enter a valid email address.');
      }
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (!result.success) {
        setError(result.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const slides = [
    {
      id: 0,
      title1: "Next-Gen",
      title2: "Shopping.",
      desc: "Experience an ultra-modern, neon-lit dashboard designed for the ultimate smart shopping journey.",
      gradient: "from-violet-400 to-blue-500",
      bgBlur1: "bg-violet-600/20",
      bgBlur2: "bg-blue-600/20",
      dotColor: "bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.8)]"
    },
    {
      id: 1,
      title1: "AI-Powered",
      title2: "Assistant.",
      desc: "Let our smart AI guide you to the perfect products with personalized, real-time recommendations.",
      gradient: "from-fuchsia-400 to-pink-500",
      bgBlur1: "bg-fuchsia-600/20",
      bgBlur2: "bg-pink-600/20",
      dotColor: "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]"
    },
    {
      id: 2,
      title1: "Lightning Fast",
      title2: "Delivery.",
      desc: "Track your orders in real-time with our advanced logistics and beautifully designed tracking system.",
      gradient: "from-cyan-400 to-emerald-500",
      bgBlur1: "bg-cyan-600/20",
      bgBlur2: "bg-emerald-600/20",
      dotColor: "bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0A0A0A] relative z-10 border-r border-[rgba(255,255,255,0.05)]">

        {/* Subtle glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[var(--theme-accent)]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 bg-[#111111] p-8 sm:p-10 border border-[rgba(255,255,255,0.08)] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 bg-[#0A0A0A] border border-[var(--theme-accent)] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,204,0.15)]">
                <Package className="text-[var(--theme-accent)]" size={20} />
              </div>
              <span className="font-extrabold text-2xl tracking-widest text-white uppercase">
                SmartCart <span className="text-[var(--theme-accent)]">AI</span>
              </span>
            </Link>

            <h1 className="text-3xl font-extrabold text-white mb-3 tracking-widest uppercase">
              {isLogin ? 'SYSTEM LOGIN' : 'INITIALIZE ACCOUNT'}
            </h1>
            <p className="text-[#9CA3AF] text-[10px] uppercase tracking-[0.2em] font-bold">
              {isLogin ? 'AUTHENTICATE TO ACCESS SECURE DASHBOARD.' : 'REGISTER CREDENTIALS FOR AI-POWERED COMMERCE.'}
            </p>
          </div>

          {/* Social Login Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-4 px-2 border border-[rgba(255,255,255,0.1)] text-white font-bold text-[10px] uppercase tracking-widest bg-[#0A0A0A] hover:bg-white/5 hover:border-[rgba(255,255,255,0.2)] transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              CONTINUE WITH GOOGLE
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(255,255,255,0.05)]"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em]">
              <span className="bg-[#111111] px-4 text-[#4B5563] font-bold">OR SECURE LOGIN VIA EMAIL</span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-[10px] uppercase tracking-widest font-bold"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-[9px] font-bold text-[#4B5563] mb-2 uppercase tracking-[0.2em]">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={14} className="text-[#9CA3AF]" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-[rgba(255,255,255,0.1)] focus:border-[var(--theme-accent)] transition-colors outline-none bg-[#0A0A0A] text-white placeholder-[#4B5563] text-xs tracking-widest uppercase"
                    placeholder="JOHN DOE"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-bold text-[#4B5563] mb-2 uppercase tracking-[0.2em]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={14} className="text-[#9CA3AF]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-[rgba(255,255,255,0.1)] focus:border-[var(--theme-accent)] transition-colors outline-none bg-[#0A0A0A] text-white placeholder-[#4B5563] text-xs tracking-widest lowercase"
                  placeholder="user@system.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-[#4B5563] mb-2 uppercase tracking-[0.2em]">Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={14} className="text-[#9CA3AF]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-[rgba(255,255,255,0.1)] focus:border-[var(--theme-accent)] transition-colors outline-none bg-[#0A0A0A] text-white placeholder-[#4B5563] text-sm tracking-[0.3em]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-[var(--theme-accent)] hover:bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'EXECUTE LOGIN' : 'INITIALIZE REGISTRATION'} <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-bold text-[#4B5563] uppercase tracking-[0.2em]">
            {isLogin ? "UNREGISTERED ENTITY? " : "EXISTING ENTITY? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[var(--theme-accent)] hover:text-white hover:underline transition-colors ml-1">
              {isLogin ? 'INITIALIZE' : 'AUTHENTICATE'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right Panel: Beautiful Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-[#0B0C10] to-[#0B0C10] z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000"
          alt="Retro Neon Gaming setup / Future E-commerce"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        />

        {/* Animated Neon decorative circles based on current slide */}
        <motion.div
          animate={{ className: `absolute top-1/4 right-1/4 w-64 h-64 blur-[80px] rounded-full z-10 transition-colors duration-1000 ${slides[currentSlide].bgBlur1}` }}
        />
        <motion.div
          animate={{ className: `absolute bottom-1/4 left-1/4 w-96 h-96 blur-[100px] rounded-full z-10 transition-colors duration-1000 ${slides[currentSlide].bgBlur2}` }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end items-start p-20 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-transparent">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              {slides[currentSlide].title1} <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slides[currentSlide].gradient}`}>
                {slides[currentSlide].title2}
              </span>
            </h2>
            <p className="text-xl text-[#9CA3AF] max-w-md leading-relaxed mb-8 min-h-[84px]">
              {slides[currentSlide].desc}
            </p>
          </motion.div>

          {/* Animated Slide Indicators */}
          <div className="flex gap-4">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full cursor-pointer transition-all duration-500 ease-in-out ${currentSlide === index
                  ? `w-12 ${slide.dotColor}`
                  : "w-4 bg-white/20 hover:bg-white/40"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
