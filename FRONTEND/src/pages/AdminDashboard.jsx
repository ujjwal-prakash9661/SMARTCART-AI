import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { Shield, BrainCircuit, Activity, CloudUpload, Key, Star, Heart, Search, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === 'ujjwalprakashrc11.22@gmail.com';

  const [viewMode, setViewMode] = useState('main'); // 'main' or 'activity'
  const [addProductMode, setAddProductMode] = useState('manual'); // 'manual' or 'bulk'
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: ''
  });
  const [jsonInput, setJsonInput] = useState('');
  const [roleEmail, setRoleEmail] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    conversionRate: 0,
    avgOrderValue: 0
  });
  const [activityData, setActivityData] = useState({
    recentRatings: [],
    wishlistLeaderboard: [],
    topSearches: []
  });

  const fetchAdmins = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/admins');
      setAdminUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/activity');
      setActivityData(res.data);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    }
  };

  React.useEffect(() => {
    fetchAdmins();
    fetchStats();
    fetchActivity();
  }, []);

  const handleRefreshStats = async () => {
    await fetchStats();
    await fetchActivity();
    toast.success('Stats refreshed successfully!');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ stats, activity: activityData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartcart_admin_stats_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported successfully!');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingProduct(true);
      if (addProductMode === 'manual') {
        await axiosInstance.post('/api/products', productForm);
        setProductForm({ title: '', price: '', description: '', category: '', image: '' });
      } else {
        const products = JSON.parse(jsonInput);
        await axiosInstance.post('/api/products/bulk', products);
        setJsonInput('');
      }
      toast.success(addProductMode === 'manual' ? 'Product added successfully!' : 'Bulk products imported!');
      fetchStats();
    } catch (error) {
      const msg = error instanceof SyntaxError ? 'Invalid JSON format' : (error.response?.data?.message || 'Operation failed');
      toast.error(msg);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const copyTemplate = () => {
    const template = [
      {
        "title": "Example Product",
        "price": 1200,
        "description": "High quality description here...",
        "category": "ELECTRONICS",
        "image": "https://example.com/image.jpg"
      }
    ];
    setJsonInput(JSON.stringify(template, null, 2));
    toast.success('Template copied to input!');
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingRole(true);
      await axiosInstance.post('/api/admin/grant-access', { email: roleEmail });
      toast.success(`Access granted to ${roleEmail}`);
      setRoleEmail('');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Access denied');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  return (
    <div
      className="px-8 py-12 w-full max-w-[1600px] mx-auto transition-colors duration-300"
      style={{ '--theme-accent': 'var(--theme-admin)' }}
    >

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <p className="text-[var(--theme-accent)] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            {viewMode === 'main' ? 'Dashboard Overview' : 'Analytics Intelligence'}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
            {viewMode === 'main' ? 'Admin Dashboard' : 'User Activity'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {viewMode === 'main' ? (
            <button
              onClick={() => setViewMode('activity')}
              className="bg-[var(--theme-accent-secondary)] text-black text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              View User Activity
            </button>
          ) : (
            <button
              onClick={() => setViewMode('main')}
              className="flex items-center gap-2 border border-white text-white text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:bg-white hover:text-black transition-all"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          )}
          <button onClick={handleExportData} className="border border-[rgba(255,255,255,0.2)] text-white text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:border-white transition-colors">
            Export Data
          </button>
          <button onClick={handleRefreshStats} className="bg-[var(--theme-accent)] text-black text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,255,204,0.3)]">
            Refresh Stats
          </button>
        </div>
      </div>

      {viewMode === 'main' ? (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-6">
              <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] font-bold mb-4">Conversion Rate</p>
              <div className="text-3xl font-bold text-white mb-2 tracking-tighter">{stats.conversionRate}<span className="text-[var(--theme-accent)]">%</span></div>
              <p className="text-[var(--theme-accent)] text-[9px] uppercase tracking-widest">BASED ON USERS/ORDERS</p>
            </div>
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-6">
              <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] font-bold mb-4 flex justify-between">
                Avg. Order Value <BrainCircuit size={14} className="opacity-50" />
              </p>
              <div className="text-3xl font-bold text-[var(--theme-accent-secondary)] mb-2 tracking-tighter">₹{(Number(stats.avgOrderValue)).toLocaleString()}</div>
              <p className="text-[var(--theme-accent-secondary)] text-[9px] uppercase tracking-widest">TOTAL REVENUE: ₹{(Number(stats.totalRevenue)).toLocaleString()}</p>
            </div>
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-6">
              <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] font-bold mb-4 flex justify-between">
                Total Users <Activity size={14} className="opacity-50" />
              </p>
              <div className="text-3xl font-bold text-white mb-2 tracking-tighter">{stats.totalUsers}</div>
              <p className="text-[var(--theme-accent)] text-[9px] uppercase tracking-widest">{stats.totalProducts} TOTAL PRODUCTS</p>
            </div>
            <div className="bg-[#0A0A0A] border border-[var(--theme-accent)]/30 p-6 shadow-[inset_0_0_20px_rgba(0,255,204,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme-accent)]/10 blur-[50px]"></div>
              <p className="text-[var(--theme-accent)] text-[9px] uppercase tracking-[0.2em] font-bold mb-4 flex justify-between">
                System Uptime <Shield size={14} />
              </p>
              <div className="text-3xl font-bold text-white mb-2 tracking-tighter">100%</div>
              <p className="text-[var(--theme-accent)] text-[9px] uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] animate-pulse"></span> ALL SYSTEMS OPERATIONAL
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-white uppercase">Product Management</h2>
                <div className="flex bg-[#0A0A0A] p-1 rounded-sm border border-white/5">
                  <button
                    onClick={() => setAddProductMode('manual')}
                    className={`px-4 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${addProductMode === 'manual' ? 'bg-[var(--theme-accent)] text-black' : 'text-[#4B5563] hover:text-white'}`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setAddProductMode('bulk')}
                    className={`px-4 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${addProductMode === 'bulk' ? 'bg-[var(--theme-accent)] text-black' : 'text-[#4B5563] hover:text-white'}`}
                  >
                    Bulk JSON
                  </button>
                </div>
              </div>
              <p className="text-[#9CA3AF] text-sm mb-8">
                {addProductMode === 'manual' ? 'Register a single product.' : 'Import multiple products via JSON array.'}
              </p>

              <form onSubmit={handleProductSubmit} className="space-y-8">
                {addProductMode === 'manual' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#9CA3AF] mb-2">Product Name</label>
                        <input
                          required
                          type="text"
                          placeholder="SC-9000-X"
                          className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder-[#4B5563]"
                          value={productForm.title}
                          onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#9CA3AF] mb-2">Price Point (INR)</label>
                        <input
                          required
                          type="number"
                          placeholder="0.00"
                          className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder-[#4B5563]"
                          value={productForm.price}
                          onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#9CA3AF] mb-2">Category</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. MOBILE, BIKE, LAPTOP"
                          className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder-[#4B5563] uppercase"
                          value={productForm.category}
                          onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#9CA3AF] mb-2">Image URL</label>
                        <input
                          required
                          type="url"
                          placeholder="https://..."
                          className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder-[#4B5563]"
                          value={productForm.image}
                          onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#9CA3AF] mb-2">Product Description</label>
                      <textarea
                        required
                        placeholder="Describe the product details and specifications..."
                        className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-2 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder-[#4B5563] min-h-[60px] resize-none"
                        value={productForm.description}
                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-[#9CA3AF]">JSON Array Input</label>
                      <button
                        type="button"
                        onClick={copyTemplate}
                        className="text-[var(--theme-accent)] text-[8px] font-bold uppercase tracking-widest hover:underline"
                      >
                        Copy JSON Template
                      </button>
                    </div>
                    <textarea
                      required
                      placeholder='[ { "title": "...", "price": 0, ... }, ... ]'
                      className="w-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] p-6 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors placeholder-[#4B5563] min-h-[300px] font-mono text-[11px] leading-relaxed"
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                    />
                    <p className="text-[8px] text-[#4B5563] uppercase tracking-widest">Make sure the image URL is valid and all required fields are present.</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    disabled={isSubmittingProduct}
                    type="submit"
                    className="bg-[var(--theme-accent)] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-10 py-4 hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,204,0.2)] disabled:opacity-50"
                  >
                    {isSubmittingProduct ? 'Processing...' : addProductMode === 'manual' ? 'Add Product' : 'Import All Products'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Access Management */}
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-white uppercase">Admin Users</h2>
                <Shield size={20} className="text-[var(--theme-accent-secondary)]" />
              </div>
              <p className="text-[#9CA3AF] text-sm mb-8">Manage admin access roles.</p>

              <div className="flex-1">
                <div className="space-y-4 mb-8">
                  {adminUsers.length === 0 ? (
                    <p className="text-[#9CA3AF] text-xs uppercase tracking-widest">Loading admins...</p>
                  ) : (
                    adminUsers.map(admin => (
                      <div key={admin.id} className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-800 rounded-sm flex items-center justify-center text-xs font-bold text-[#9CA3AF]">
                            {admin.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-xs font-bold uppercase tracking-wider">{admin.name}</div>
                            <div className={`${admin.isSuper ? 'text-[var(--theme-accent)]' : 'text-[#9CA3AF]'} text-[8px] uppercase tracking-[0.2em]`}>
                              {admin.isSuper ? 'Super Admin' : 'Admin'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="mt-auto">
                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                      <div>
                        <input
                          required
                          type="email"
                          placeholder="USER EMAIL"
                          className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] pb-2 text-white focus:outline-none focus:border-[var(--theme-accent-secondary)] transition-colors placeholder-[#4B5563] text-xs uppercase tracking-widest"
                          value={roleEmail}
                          onChange={e => setRoleEmail(e.target.value)}
                        />
                      </div>
                      <button
                        disabled={isSubmittingRole}
                        type="submit"
                        className="w-full border border-[rgba(255,255,255,0.1)] hover:border-[var(--theme-accent-secondary)] hover:text-[var(--theme-accent-secondary)] hover:bg-[rgba(0,229,255,0.05)] text-[#9CA3AF] text-[9px] font-bold uppercase tracking-[0.2em] py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Key size={12} />
                        {isSubmittingRole ? 'Granting...' : 'Grant Access'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase">Sales Overview</h2>
                <p className="text-[#9CA3AF] text-sm">Monthly sales performance.</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-[var(--theme-accent)] text-black text-[9px] font-bold px-3 py-1 uppercase tracking-widest cursor-pointer">24H</span>
                <span className="text-[#9CA3AF] border border-[rgba(255,255,255,0.1)] text-[9px] font-bold px-3 py-1 uppercase tracking-widest cursor-pointer hover:text-white">7D</span>
                <span className="text-[#9CA3AF] border border-[rgba(255,255,255,0.1)] text-[9px] font-bold px-3 py-1 uppercase tracking-widest cursor-pointer hover:text-white">30D</span>
              </div>
            </div>
            <div className="h-48 border-b border-[rgba(255,255,255,0.1)] flex items-end gap-2 px-4 pb-0 relative">
              {/* Dummy bars */}
              {[40, 60, 50, 80, 100, 70, 50, 90, 60].map((h, i) => (
                <div key={i} className={`flex-1 rounded-full ${i === 4 ? 'bg-[var(--theme-accent-secondary)]' : 'bg-[rgba(0,255,204,0.2)]'} transition-all hover:bg-[var(--theme-accent)] relative group`} style={{ height: `${h}%` }}>
                  {i === 4 && <div className="absolute top-2 left-0 w-full h-1 bg-white opacity-50 rounded-full"></div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 mt-4 text-[9px] text-[#4B5563] uppercase tracking-widest">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>
          </div>
        </>
      ) : (
        /* Activity Insights View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Ratings Log */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <Star size={20} className="text-[var(--theme-accent)]" /> Recent Ratings
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {activityData.recentRatings.length === 0 ? (
                <p className="text-[#4B5563] text-xs uppercase tracking-widest py-10 text-center">No recent ratings found.</p>
              ) : (
                activityData.recentRatings.map((rating, idx) => (
                  <div key={idx} className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.03)] p-4 flex items-center justify-between group hover:border-[var(--theme-accent)]/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center border border-[rgba(255,255,255,0.05)]">
                        <span className="text-[10px] font-bold text-[#4B5563]">{rating.user?.name?.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">{rating.user?.name || 'Unknown User'}</div>
                        <div className="text-[#9CA3AF] text-[9px] tracking-widest line-clamp-1">{rating.productTitle}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={10} className={s <= rating.rating ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]' : 'text-zinc-800'} />
                        ))}
                      </div>
                      <div className="text-[8px] text-[#4B5563] font-bold">{new Date(rating.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Wishlist Leaderboard */}
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8">
              <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <Heart size={20} className="text-red-500" /> Most Wishlisted
              </h2>
              <div className="space-y-4">
                {activityData.wishlistLeaderboard.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0A0A0A] border border-[rgba(255,255,255,0.03)] group hover:border-red-500/30 transition-colors">
                    <div className="text-xl font-black text-zinc-800 w-6">#{idx + 1}</div>
                    <div className="w-12 h-12 bg-white p-1 rounded-sm">
                      <img src={item.image} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">{item.title}</div>
                      <div className="text-[#4B5563] text-[9px] font-bold tracking-widest">{item.count} Global Wishes</div>
                    </div>
                  </div>
                ))}
                {activityData.wishlistLeaderboard.length === 0 && (
                  <p className="text-[#4B5563] text-xs uppercase tracking-widest py-10 text-center">No wishlist data yet.</p>
                )}
              </div>
            </div>

            {/* Search Trends */}
            <div className="bg-[#111111] border border-[rgba(255,255,255,0.08)] p-8">
              <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <Search size={20} className="text-[var(--theme-accent-secondary)]" /> Search Trends
              </h2>
              <div className="flex flex-wrap gap-2">
                {activityData.topSearches.length === 0 ? (
                  <p className="text-[#4B5563] text-xs uppercase tracking-widest py-4">No search data yet.</p>
                ) : (
                  activityData.topSearches.map((s, idx) => (
                    <div key={idx} className="px-4 py-2 bg-[#0A0A0A] border border-[rgba(255,255,255,0.05)] rounded-full flex items-center gap-3 hover:border-[var(--theme-accent-secondary)]/50 transition-colors">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">{s.term}</span>
                      <span className="text-[var(--theme-accent-secondary)] text-[10px] font-black">{s.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
