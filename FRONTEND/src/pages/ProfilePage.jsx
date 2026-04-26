import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, MapPin, CreditCard, Bell, LogOut, Camera, ChevronRight, Star, X, Zap, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('Personal Information');
  const [isEditing, setIsEditing] = React.useState(false);
  const [isAddingAddress, setIsAddingAddress] = React.useState(false);
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);
  const fileInputRef = React.useRef(null);
  
  const [orders, setOrders] = React.useState([]);
  
  // Use DB data or fallback to empty arrays
  const addresses = user?.addresses || [];
  const paymentMethods = user?.paymentMethods || [];

  const [newAddr, setNewAddr] = React.useState({ type: 'HOME', text: '' });
  const [newPayment, setNewPayment] = React.useState({ 
    type: 'CARD', 
    cardType: 'VISA', 
    cardNumber: '', 
    expiry: '', 
    cvv: '',
    cardName: '',
    upiId: '' 
  });
  const [editUser, setEditUser] = React.useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwords, setPasswords] = React.useState({ new: '', confirm: '' });
  const [notificationState, setNotificationState] = React.useState({
    orderUpdates: user?.settings?.notifications?.orderUpdates ?? true,
    promotions: user?.settings?.notifications?.promotions ?? false,
    securityAlerts: user?.settings?.notifications?.securityAlerts ?? true
  });
  const [twoFactorAuth, setTwoFactorAuth] = React.useState(user?.settings?.twoFactorAuth ?? false);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/orders/myorders');
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const result = await updateUser({ avatar: base64 });
        if (!result.success) {
          alert(`Upload Error: ${result.message}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async (e) => {
    e.stopPropagation();
    const result = await updateUser({ avatar: '' });
    if (!result.success) {
      alert(`Remove Error: ${result.message}`);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.text.trim()) return;
    const newAddresses = [...addresses, { type: newAddr.type, text: newAddr.text, isDefault: addresses.length === 0 }];
    const result = await updateUser({ addresses: newAddresses });
    if (result.success) {
      setNewAddr({ type: 'HOME', text: '' });
      setIsAddingAddress(false);
    } else {
      alert(`Failed to add address: ${result.message}`);
    }
  };

  const handleRemoveAddress = async (idToRemove) => {
    const newAddresses = addresses.filter(a => a._id !== idToRemove);
    await updateUser({ addresses: newAddresses });
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    let paymentData = { type: newPayment.type, isDefault: paymentMethods.length === 0 };
    
    if (newPayment.type === 'CARD') {
      const cleanCard = newPayment.cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 15) {
        alert("Please enter a valid card number");
        return;
      }
      if (newPayment.cvv.length < 3) {
        alert("Please enter a valid CVV");
        return;
      }
      if (newPayment.expiry.length < 5) {
        alert("Please enter a valid expiry date (MM/YY)");
        return;
      }
      
      // Determine card type roughly
      paymentData.cardType = cleanCard.startsWith('4') ? 'VISA' : cleanCard.startsWith('5') ? 'MASTERCARD' : 'AMEX';
      paymentData.last4 = cleanCard.slice(-4);
      paymentData.expiry = newPayment.expiry;
    } else {
      if (!newPayment.upiId.includes('@')) {
        alert("Please enter a valid UPI ID");
        return;
      }
      paymentData.upiId = newPayment.upiId;
    }

    const newPaymentMethods = [...paymentMethods, paymentData];
    const result = await updateUser({ paymentMethods: newPaymentMethods });
    if (result.success) {
      setNewPayment({ type: 'CARD', cardType: 'VISA', cardNumber: '', expiry: '', cvv: '', cardName: '', upiId: '' });
      setIsAddingPayment(false);
    } else {
      alert(`Failed to add payment method: ${result.message}`);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Format with spaces
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setNewPayment({...newPayment, cardNumber: parts.join(' ')});
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setNewPayment({...newPayment, expiry: value});
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setNewPayment({...newPayment, cvv: value});
  };

  const handleRemovePayment = async (idToRemove) => {
    const newPaymentMethods = paymentMethods.filter(p => p._id !== idToRemove);
    await updateUser({ paymentMethods: newPaymentMethods });
  };

  const handleUpdateProfile = async () => {
    if (isEditing) {
      const result = await updateUser({ 
        name: editUser.name, 
        email: editUser.email,
        phone: editUser.phone
      });
      if (result.success) {
        setIsEditing(false);
      } else {
        alert(result.message);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match");
      return;
    }
    if (passwords.new.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    const result = await updateUser({ password: passwords.new });
    if (result.success) {
      alert("Password updated successfully!");
      setPasswords({ new: '', confirm: '' });
    } else {
      alert(result.message);
    }
  };

  const handleToggleNotification = async (key) => {
    const newState = { ...notificationState, [key]: !notificationState[key] };
    setNotificationState(newState);
    await updateUser({ 
      settings: { 
        ...user?.settings, 
        notifications: newState 
      } 
    });
  };

  const handleToggle2FA = async () => {
    const newState = !twoFactorAuth;
    setTwoFactorAuth(newState);
    await updateUser({ 
      settings: { 
        ...user?.settings, 
        twoFactorAuth: newState 
      } 
    });
  };

  const menuItems = [
    { id: 'Personal Information', icon: <User size={16} /> },
    { id: 'Shipping Addresses', icon: <MapPin size={16} /> },
    { id: 'Payment Methods', icon: <CreditCard size={16} /> },
    { id: 'Order History', icon: <Package size={16} />, isLink: true },
    { id: 'Security Configuration', icon: <Shield size={16} /> },
    { id: 'Notification Settings', icon: <Bell size={16} /> }
  ];

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className="px-8 py-12 w-full max-w-[1400px] mx-auto transition-colors duration-300"
      style={{ '--theme-accent': 'var(--theme-profile)' }}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
      
      {/* Techy Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[rgba(255,255,255,0.08)] pb-8">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 bg-[#111111] border border-[var(--theme-accent)] flex items-center justify-center text-3xl font-black text-[var(--theme-accent)] overflow-hidden relative cursor-pointer shadow-[0_0_15px_rgba(0,255,204,0.15)]"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                getInitials(user?.name)
              )}
              <div className="absolute inset-0 bg-[var(--theme-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Camera size={20} className="text-[var(--theme-accent)]" />
              </div>
            </div>
            {/* Online indicator */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-[var(--theme-accent)] shadow-[0_0_10px_rgba(0,255,204,0.8)] rounded-none"></div>
            
            {/* Remove Image Button */}
            {user?.avatar && (
              <button 
                onClick={handleRemoveImage}
                className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-500 text-black flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:bg-white transition-colors z-10"
                title="Remove Avatar"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
          <div>
            <p className="text-[var(--theme-accent)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
              <Star size={10} className="fill-[var(--theme-accent)]" /> VERIFIED MEMBER
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">{user?.name || 'GUEST USER'}</h1>
            <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mt-2">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={logout} className="border border-red-500/50 text-red-500 text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:bg-red-500 hover:text-black transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <LogOut size={14} /> SYSTEM LOGOUT
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Menu Sidebar */}
        <div className="lg:w-64 flex-shrink-0 space-y-2">
          <h3 className="text-[#4B5563] text-[9px] uppercase tracking-[0.3em] font-bold mb-6 pl-4">Account Modules</h3>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isLink) {
                  navigate('/orders');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] border-l-2 border-[var(--theme-accent)]' 
                  : 'text-[#9CA3AF] border-l-2 border-transparent hover:text-white hover:bg-[#111111]'
              }`}
            >
              {item.icon}
              {item.id}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-8 min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(255,255,255,0.05)]">
                 <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                   {activeTab}
                 </h2>
                 {activeTab === 'Personal Information' && (
                    <button 
                      onClick={handleUpdateProfile}
                      className="text-[var(--theme-accent)] text-[10px] uppercase tracking-widest font-bold border border-[var(--theme-accent)] px-4 py-2 hover:bg-[var(--theme-accent)] hover:text-black transition-colors"
                    >
                      {isEditing ? 'SAVE CONFIG' : 'EDIT DETAILS'}
                    </button>
                 )}
              </div>

              {activeTab === 'Security Configuration' && (
                <div className="space-y-8">
                  {/* Password Change Form */}
                  <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 md:p-8">
                    <h3 className="text-white text-[10px] uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
                      <Shield size={14} className="text-[var(--theme-accent)]" />
                      Update Access Credentials
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">New Password</label>
                           <input 
                             required
                             type="password"
                             value={passwords.new}
                             onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                             className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] font-mono tracking-widest"
                             placeholder="••••••••"
                           />
                        </div>
                        <div>
                           <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Confirm Password</label>
                           <input 
                             required
                             type="password"
                             value={passwords.confirm}
                             onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                             className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] font-mono tracking-widest"
                             placeholder="••••••••"
                           />
                        </div>
                      </div>
                      <button type="submit" className="border border-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black text-[var(--theme-accent)] px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-2">
                        <Zap size={14} /> Commit Changes
                      </button>
                    </form>
                  </div>

                  {/* 2FA Toggle */}
                  <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 md:p-8 flex justify-between items-center">
                     <div>
                       <h3 className="text-white text-[11px] uppercase tracking-[0.2em] font-bold mb-1">Two-Factor Authentication</h3>
                       <p className="text-[#4B5563] text-[9px] uppercase tracking-widest">Enhance security by requiring an OTP for login.</p>
                     </div>
                     <button 
                       onClick={handleToggle2FA}
                       className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${twoFactorAuth ? 'bg-[var(--theme-accent)]' : 'bg-[#374151]'}`}
                     >
                        <motion.div 
                          className="bg-white w-4 h-4 rounded-full shadow-md"
                          animate={{ x: twoFactorAuth ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                     </button>
                  </div>
                </div>
              )}

              {activeTab === 'Notification Settings' && (
                <div className="space-y-4">
                  {[
                    { id: 'orderUpdates', title: 'Order Updates', desc: 'Receive updates on shipping, delivery, and refunds.' },
                    { id: 'promotions', title: 'Promotions & Offers', desc: 'Get notified about exclusive discounts and new product drops.' },
                    { id: 'securityAlerts', title: 'Security Alerts', desc: 'Important warnings regarding unrecognized logins or password changes.' }
                  ].map(setting => (
                    <div key={setting.id} className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 flex justify-between items-center group hover:border-[rgba(255,255,255,0.1)] transition-colors">
                       <div className="flex items-start gap-4">
                         <div className={`p-2 rounded-full border ${notificationState[setting.id] ? 'border-[var(--theme-accent)]/30 text-[var(--theme-accent)] bg-[var(--theme-accent)]/5' : 'border-[#4B5563] text-[#4B5563]'}`}>
                            <Bell size={16} />
                         </div>
                         <div>
                           <h3 className="text-white text-[11px] uppercase tracking-[0.2em] font-bold mb-1">{setting.title}</h3>
                           <p className="text-[#4B5563] text-[9px] uppercase tracking-widest leading-relaxed">{setting.desc}</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => handleToggleNotification(setting.id)}
                         className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notificationState[setting.id] ? 'bg-[var(--theme-accent)]' : 'bg-[#374151]'}`}
                       >
                          <motion.div 
                            className="bg-white w-3 h-3 rounded-full shadow-md"
                            animate={{ x: notificationState[setting.id] ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                       </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Personal Information' && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Metric Cards */}
                      <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 hover:border-[var(--theme-accent)]/30 transition-colors">
                        <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] font-bold mb-4">Total Orders</p>
                        <div className="text-3xl font-bold text-white tracking-tighter">{orders.length}</div>
                      </div>
                      <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 hover:border-[var(--theme-accent)]/30 transition-colors">
                        <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] font-bold mb-4">Saved Addresses</p>
                        <div className="text-3xl font-bold text-white tracking-tighter">{addresses.length}</div>
                      </div>
                      <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 hover:border-[var(--theme-accent)]/30 transition-colors">
                        <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] font-bold mb-4">Account Status</p>
                        <div className="text-3xl font-bold text-[var(--theme-accent)] tracking-tighter flex items-center gap-2">SECURE</div>
                      </div>
                   </div>

                   <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                         <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-2">Full Name</label>
                         {isEditing ? (
                           <input 
                             type="text" 
                             value={editUser.name}
                             onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                             className="w-full bg-transparent border-b border-[var(--theme-accent)] pb-2 text-white text-sm focus:outline-none transition-colors"
                           />
                         ) : (
                           <p className="text-white font-bold uppercase tracking-wider pb-2 border-b border-[rgba(255,255,255,0.05)]">{user?.name}</p>
                         )}
                       </div>
                       <div>
                         <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-2">Email Address</label>
                         {isEditing ? (
                           <input 
                             type="email" 
                             value={editUser.email}
                             onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                             className="w-full bg-transparent border-b border-[var(--theme-accent)] pb-2 text-white text-sm focus:outline-none transition-colors"
                           />
                         ) : (
                           <p className="text-white font-bold uppercase tracking-wider pb-2 border-b border-[rgba(255,255,255,0.05)]">{user?.email}</p>
                         )}
                       </div>
                       <div>
                         <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-2">Phone Number</label>
                         {isEditing ? (
                           <input 
                             type="tel" 
                             value={editUser.phone}
                             onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                             className="w-full bg-transparent border-b border-[var(--theme-accent)] pb-2 text-white text-sm focus:outline-none transition-colors placeholder-[#4B5563]"
                             placeholder="N/A"
                           />
                         ) : (
                           <p className="text-white font-bold uppercase tracking-wider pb-2 border-b border-[rgba(255,255,255,0.05)]">{user?.phone || 'N/A'}</p>
                         )}
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {activeTab === 'Shipping Addresses' && (
                <div className="space-y-6">
                  {addresses.map((addr, idx) => (
                    <div key={addr._id || idx} className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 relative group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <span className="text-[var(--theme-accent)] text-[10px] font-bold uppercase tracking-widest">{addr.type}</span>
                            {addr.isDefault && <span className="bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] text-[8px] px-2 py-0.5 uppercase tracking-widest border border-[var(--theme-accent)]/20">Primary</span>}
                         </div>
                         <button 
                           onClick={() => handleRemoveAddress(addr._id)}
                           className="text-[#4B5563] hover:text-red-500 transition-colors"
                         >
                           <X size={16} />
                         </button>
                      </div>
                      <p className="text-[#9CA3AF] text-sm uppercase tracking-wider leading-relaxed">{addr.text}</p>
                    </div>
                  ))}

                  <AnimatePresence>
                    {isAddingAddress ? (
                      <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddAddress}
                        className="bg-[#111111] border border-[var(--theme-accent)]/30 p-6 space-y-6"
                      >
                         <div>
                            <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Address Type</label>
                            <div className="flex gap-4">
                              {['HOME', 'OFFICE', 'OTHER'].map(t => (
                                <button 
                                  key={t}
                                  type="button"
                                  onClick={() => setNewAddr({...newAddr, type: t})}
                                  className={`px-6 py-2 border text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${
                                    newAddr.type === t 
                                      ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-accent)]/5' 
                                      : 'border-[rgba(255,255,255,0.1)] text-[#9CA3AF] hover:text-white'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                         </div>
                         <div>
                            <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Full Address</label>
                            <textarea 
                              required
                              value={newAddr.text}
                              onChange={(e) => setNewAddr({...newAddr, text: e.target.value})}
                              className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] min-h-[100px] resize-none uppercase"
                              placeholder="ENTER YOUR FULL DELIVERY ADDRESS..."
                            />
                         </div>
                         <div className="flex gap-4">
                           <button type="submit" className="bg-[var(--theme-accent)] text-black px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-white transition-colors">
                             SAVE ADDRESS
                           </button>
                           <button type="button" onClick={() => setIsAddingAddress(false)} className="border border-[rgba(255,255,255,0.1)] text-[#9CA3AF] px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:text-white hover:border-white transition-colors">
                             CANCEL
                           </button>
                         </div>
                      </motion.form>
                    ) : (
                      <button 
                        onClick={() => setIsAddingAddress(true)}
                        className="w-full py-6 border border-dashed border-[rgba(255,255,255,0.1)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/5 text-[#9CA3AF] hover:text-[var(--theme-accent)] transition-all flex flex-col items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold"
                      >
                        <MapPin size={24} />
                        ADD NEW LOCATION
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activeTab === 'Payment Methods' && (
                <div className="space-y-6">
                  {paymentMethods.map((pay, idx) => (
                    <div key={pay._id || idx} className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-6 relative group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-8 bg-black/40 border border-[var(--theme-accent)]/30 flex items-center justify-center font-bold italic text-[var(--theme-accent)] text-xs">
                             {pay.type === 'CARD' ? pay.cardType : 'UPI'}
                           </div>
                           <div>
                             <p className="text-white text-sm font-bold uppercase tracking-widest">
                               {pay.type === 'UPI' ? pay.upiId : `•••• •••• •••• ${pay.last4}`}
                             </p>
                             <p className="text-[#4B5563] text-[10px] uppercase tracking-widest mt-1">
                               {pay.type === 'UPI' ? 'UPI HANDLE' : `EXPIRES ${pay.expiry}`}
                             </p>
                           </div>
                        </div>
                        <button 
                           onClick={() => handleRemovePayment(pay._id)}
                           className="text-[#4B5563] hover:text-red-500 transition-colors"
                        >
                           <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <AnimatePresence>
                    {isAddingPayment ? (
                      <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddPayment}
                        className="bg-[#111111] border border-[var(--theme-accent)]/30 p-6 space-y-6"
                      >
                         <div>
                            <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Method Type</label>
                            <div className="flex gap-4">
                              {['CARD', 'UPI'].map(t => (
                                <button 
                                  key={t}
                                  type="button"
                                  onClick={() => setNewPayment({...newPayment, type: t})}
                                  className={`px-6 py-2 border text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${
                                    newPayment.type === t 
                                      ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-accent)]/5' 
                                      : 'border-[rgba(255,255,255,0.1)] text-[#9CA3AF] hover:text-white'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                         </div>
                         
                         {newPayment.type === 'CARD' ? (
                           <div className="space-y-6">
                             <div>
                                <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Name on Card</label>
                                <input 
                                  required
                                  type="text"
                                  value={newPayment.cardName}
                                  onChange={(e) => setNewPayment({...newPayment, cardName: e.target.value.toUpperCase()})}
                                  className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] uppercase"
                                  placeholder="JOHN DOE"
                                />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="md:col-span-2">
                                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Card Number</label>
                                  <div className="relative">
                                    <input 
                                      required
                                      type="text"
                                      value={newPayment.cardNumber}
                                      onChange={handleCardNumberChange}
                                      className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] font-mono tracking-widest"
                                      placeholder="0000 0000 0000 0000"
                                    />
                                    {newPayment.cardNumber && (
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--theme-accent)] uppercase tracking-widest">
                                        {newPayment.cardNumber.startsWith('4') ? 'VISA' : newPayment.cardNumber.startsWith('5') ? 'MASTERCARD' : 'CARD'}
                                      </div>
                                    )}
                                  </div>
                               </div>
                               <div>
                                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">Expiry Date</label>
                                  <input 
                                    required
                                    type="text"
                                    value={newPayment.expiry}
                                    onChange={handleExpiryChange}
                                    className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] font-mono tracking-widest text-center md:text-left"
                                    placeholder="MM/YY"
                                  />
                               </div>
                               <div>
                                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">CVV</label>
                                  <input 
                                    required
                                    type="password"
                                    value={newPayment.cvv}
                                    onChange={handleCvvChange}
                                    className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] font-mono tracking-widest text-center md:text-left"
                                    placeholder="•••"
                                  />
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div>
                              <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#4B5563] mb-3">UPI ID</label>
                              <input 
                                required
                                type="text"
                                value={newPayment.upiId}
                                onChange={(e) => setNewPayment({...newPayment, upiId: e.target.value.toLowerCase()})}
                                className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-4 text-white text-sm focus:outline-none focus:border-[var(--theme-accent)] lowercase"
                                placeholder="username@upi"
                              />
                           </div>
                         )}

                         <div className="flex gap-4">
                           <button type="submit" className="bg-[var(--theme-accent)] text-black px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-white transition-colors">
                             SAVE PAYMENT
                           </button>
                           <button type="button" onClick={() => setIsAddingPayment(false)} className="border border-[rgba(255,255,255,0.1)] text-[#9CA3AF] px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:text-white hover:border-white transition-colors">
                             CANCEL
                           </button>
                         </div>
                      </motion.form>
                    ) : (
                      <button 
                        onClick={() => setIsAddingPayment(true)}
                        className="w-full py-6 border border-dashed border-[rgba(255,255,255,0.1)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/5 text-[#9CA3AF] hover:text-[var(--theme-accent)] transition-all flex flex-col items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold"
                      >
                        <CreditCard size={24} />
                        ADD PAYMENT METHOD
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
