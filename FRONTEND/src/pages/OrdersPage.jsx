import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Search, ChevronRight, ChevronDown, Download, MapPin, User, Mail, Phone, FileText, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/orders/myorders');
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return { icon: <CheckCircle size={12} />, color: 'text-[var(--theme-accent)]', text: 'DELIVERED' };
      case 'shipped':
        return { icon: <Truck size={12} />, color: 'text-[var(--theme-accent-secondary)]', text: 'IN TRANSIT' };
      case 'processing':
      case 'order placed':
        return { icon: <Clock size={12} />, color: 'text-amber-400', text: 'PROCESSING' };
      default:
        return { icon: <Package size={12} />, color: 'text-[#9CA3AF]', text: (status || 'UNKNOWN').toUpperCase() };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-accent)]"></div>
      </div>
    );
  }

  const downloadBill = (order) => {
    const printWindow = window.open('', '_blank');
    
    const itemsHtml = order.products?.map(item => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #000;">${item.title.toUpperCase()}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #000; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #000; text-align: right;">INR ${Number(item.price * (item.quantity || 1)).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>INVOICE - ${order._id.toUpperCase()}</title>
          <style>
            body { 
              background-color: white !important; 
              color: black !important;
              font-family: 'Courier New', Courier, monospace !important;
              padding: 40px;
              line-height: 1.6;
            }
            .header { border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 2px solid black; padding: 10px 0; }
            .total-row { font-weight: bold; font-size: 1.2em; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">SMARTCART STATEMENT</h1>
            <p style="margin: 5px 0;">ORDER ID: #${order._id.toUpperCase()}</p>
            <p style="margin: 5px 0;">DATE: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h3 style="margin-bottom: 10px;">CUSTOMER & SHIPPING DETAILS</h3>
            <p style="margin: 2px 0;">NAME: ${order.user?.name?.toUpperCase() || 'GUEST'}</p>
            <p style="margin: 2px 0;">EMAIL: ${order.user?.email?.toUpperCase() || 'N/A'}</p>
            <p style="margin: 2px 0;">PHONE: ${order.user?.phone || 'N/A'}</p>
            <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
              <p style="margin: 2px 0;">PAYMENT METHOD: ${order.paymentMethod?.toUpperCase() || 'RAZORPAY GATEWAY'}</p>
              <p style="margin: 2px 0;">PAYMENT STATUS: ${order.paymentStatus?.toUpperCase() || 'PAID & CONFIRMED'}</p>
              <p style="margin: 15px 0 5px 0; text-decoration: underline;">SHIPPING ADDRESS:</p>
              <p style="margin: 2px 0; font-weight: bold; font-size: 14px;">${order.location?.toUpperCase() || 'NO ADDRESS PROVIDED'}</p>
            </div>
          </div>

          <div class="section">
            <h3 style="margin-bottom: 10px;">ORDER ITEMS</h3>
            <table>
              <thead>
                <tr>
                  <th>ITEM DESCRIPTION</th>
                  <th style="text-align: center;">QTY</th>
                  <th style="text-align: right;">PRICE</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section" style="text-align: right;">
            <p style="margin: 5px 0;">SUBTOTAL: INR ${(order.totalPrice / 1.18).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p style="margin: 5px 0;">TAX (18%): INR ${(order.totalPrice - (order.totalPrice / 1.18)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p class="total-row" style="margin: 10px 0; border-top: 1px solid black; pt: 10px;">TOTAL AMOUNT: INR ${order.totalPrice.toLocaleString()}</p>
          </div>

          <div style="margin-top: 50px; border-top: 1px dashed black; padding-top: 20px; font-size: 12px;">
            <p>THIS IS A SYSTEM GENERATED ELECTRONIC STATEMENT. NO SIGNATURE REQUIRED.</p>
            <p>THANK YOU FOR SHOPPING WITH SMARTCART AI.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const totalAssets = orders.reduce((acc, order) => acc + (order.products?.length || 0), 0);

  return (
    <div 
      className="px-8 py-12 w-full max-w-[1600px] mx-auto transition-colors duration-300"
      style={{ '--theme-accent': 'var(--theme-orders)' }}
    >
      
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-[var(--theme-accent)] text-[10px] uppercase tracking-[0.3em] font-bold">Order History</p>
          <div className="h-px bg-[rgba(255,255,255,0.2)] w-32"></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Your Orders</h1>
        <p className="text-[#9CA3AF] text-sm max-w-xl leading-relaxed">
          Review your past orders and their details. Download invoices and track shipping status.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Sidebar (Acquisition Stats) */}
        <div className="lg:w-80 flex flex-col gap-6 flex-shrink-0">
           <div className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-6">
              <div className="flex justify-between items-start mb-8">
                 <h3 className="text-white text-[10px] uppercase tracking-[0.2em] font-bold">Order Summary</h3>
                 <div className="bg-[#111111] p-2 rounded-sm border border-[rgba(255,255,255,0.05)] text-[#4B5563]">
                    <BarChart2 size={16} />
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] mb-1">Total Items</p>
                    <div className="text-3xl font-bold text-[var(--theme-accent-secondary)] tracking-tighter">{totalAssets}</div>
                 </div>
                 <div>
                    <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] mb-1">Delivered</p>
                    <div className="text-3xl font-bold text-[var(--theme-accent)] tracking-tighter">100%</div>
                 </div>
                 <div>
                    <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.2em] mb-1">Total Spent</p>
                    <div className="text-xl font-bold text-white tracking-tighter">₹{orders.reduce((acc, order) => acc + order.totalPrice, 0).toLocaleString()}</div>
                 </div>
              </div>
           </div>

           <div className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-6">
              <h3 className="text-white text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Advanced Filters</h3>
              <div className="space-y-4">
                 {['All Orders', 'Electronics', 'Accessories', 'Software'].map(filter => (
                    <div 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`text-[11px] font-bold tracking-widest pl-3 border-l-2 cursor-pointer transition-colors ${
                        activeFilter === filter 
                          ? 'text-[var(--theme-accent)] border-[var(--theme-accent)]' 
                          : 'text-[#9CA3AF] border-transparent hover:text-white'
                      }`}
                    >
                       {filter}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Section (Transactions List) */}
        <div className="flex-1 space-y-6">
          {(() => {
            const filteredOrders = orders.filter(order => {
              if (activeFilter === 'All Orders') return true;
              return order.products?.some(p => p.category?.toLowerCase() === activeFilter.toLowerCase());
            });

            if (filteredOrders.length === 0) {
              return (
                <div className="bg-[#111111] border border-[rgba(255,255,255,0.05)] p-20 text-center">
                   <Package size={48} className="mx-auto mb-4 text-[#4B5563]" />
                   <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">No orders found</h3>
                </div>
              );
            }

            return filteredOrders.map((order, index) => {
              const statusConfig = getStatusDisplay(order.status);
              const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              }).replace(/\//g, '.');
              
              const isExpanded = expandedOrderId === order._id;
              
              return (
                <motion.div 
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-[#0A0A0A] border ${isExpanded ? 'border-[var(--theme-accent)]' : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'} transition-colors overflow-hidden`}
                >
                  {/* Transaction Header */}
                  <div className="p-6 cursor-pointer" onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}>
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-[#111111] border border-[rgba(255,255,255,0.05)] flex items-center justify-center flex-shrink-0">
                              <Package size={24} className={isExpanded ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-accent-secondary)]'} />
                           </div>
                           <div>
                              <p className="text-[#4B5563] text-[9px] uppercase tracking-[0.2em] font-bold mb-1">
                                 ORDER: #{order._id.slice(-6).toUpperCase()}
                              </p>
                              <h3 className="font-bold text-white text-xl tracking-tight mb-2">
                                 {order.products?.length === 1 ? order.products[0].title : `${order.products?.length} Items`}
                              </h3>
                               <div className="flex items-center gap-3">
                                 <span className={`border ${order.paymentStatus === 'PAID & CONFIRMED' ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]' : 'border-amber-500 text-amber-500'} text-[8px] uppercase tracking-widest px-2 py-0.5`}>
                                    {order.paymentStatus?.toUpperCase() || 'PAID & CONFIRMED'}
                                 </span>
                                 <span className="text-[#9CA3AF] text-[10px] tracking-widest">{date}</span>
                               </div>
                           </div>
                        </div>

                        <div className="text-left md:text-right flex flex-col justify-center h-full">
                           <p className="text-2xl font-bold text-white mb-2">₹{Number(order.totalPrice).toLocaleString()}</p>
                           <div className={`flex items-center justify-start md:justify-end gap-1 text-[9px] uppercase tracking-widest font-bold ${statusConfig.color}`}>
                              {statusConfig.icon}
                              {statusConfig.text}
                           </div>
                        </div>

                     </div>

                     {/* Metrics Row (Bottom of header) */}
                     <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-10">
                           <div>
                              <p className="text-[#4B5563] text-[8px] uppercase tracking-[0.2em] mb-1">Quantity</p>
                              <p className="text-white text-sm font-bold">{order.products?.length || 0} Units</p>
                           </div>
                           <div>
                              <p className="text-[#4B5563] text-[8px] uppercase tracking-[0.2em] mb-1">Status</p>
                              <p className="text-[var(--theme-accent)] text-sm font-bold">Confirmed</p>
                           </div>
                           <div>
                              <p className="text-[#4B5563] text-[8px] uppercase tracking-[0.2em] mb-1">Order ID</p>
                              <p className="text-white text-sm font-bold">#{order._id.slice(-4).toUpperCase()}</p>
                           </div>
                        </div>
                        <div className="text-[var(--theme-accent-secondary)] text-[9px] uppercase tracking-[0.2em] font-bold hover:text-white transition-colors flex items-center gap-1">
                           {isExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                        </div>
                     </div>
                  </div>

                  {/* Expanded Preview (Stays Dark) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#111111] border-t border-[rgba(255,255,255,0.08)]"
                      >
                        <div className="p-8">
                          <div className="flex justify-between items-start mb-10 pb-6 border-b border-[rgba(255,255,255,0.1)]">
                            <div>
                              <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                                <FileText size={24} className="text-[var(--theme-accent)]" />
                                Order Preview
                              </h2>
                              <p className="text-xs text-[#9CA3AF] mt-2 tracking-widest uppercase">ORDER ID: #{order._id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white uppercase tracking-wider">SmartCart</p>
                              <p className="text-[10px] text-[#9CA3AF] tracking-widest uppercase mt-1">123 Main Street</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-1 space-y-6">
                                <div>
                                <h4 className="text-[10px] font-bold text-[var(--theme-accent)] uppercase tracking-[0.2em] mb-4">Shipping Info</h4>
                                <div className="border border-[rgba(255,255,255,0.1)] p-6 space-y-4 bg-[rgba(255,255,255,0.02)]">
                                  <p className="text-white text-sm font-bold uppercase">{order.user?.name || 'GUEST'}</p>
                                  <p className="text-[#9CA3AF] text-xs uppercase tracking-[0.2em] leading-relaxed">
                                     {order.location || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="lg:col-span-2">
                               <div className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-4 md:p-6 overflow-x-auto scrollbar-hide">
                                  <table className="w-full text-left min-w-[500px]">
                                     <thead>
                                        <tr className="text-[#4B5563] text-[9px] uppercase tracking-widest border-b border-[rgba(255,255,255,0.1)]">
                                           <th className="pb-4">ITEM</th>
                                           <th className="pb-4 text-center">QTY</th>
                                           <th className="pb-4 text-right">PRICE</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {order.products?.map((item, i) => (
                                          <tr key={i} className="text-white text-xs border-b border-[rgba(255,255,255,0.05)]">
                                             <td className="py-4 font-bold uppercase">{item.title}</td>
                                             <td className="py-4 text-center font-bold">{item.quantity || 1}</td>
                                             <td className="py-4 text-right font-bold">₹{item.price.toLocaleString()}</td>
                                          </tr>
                                        ))}
                                     </tbody>
                                  </table>
                               </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="p-6 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.08)] flex justify-end">
                          <button 
                            onClick={(e) => { e.stopPropagation(); downloadBill(order); }}
                            className="flex items-center gap-2 border border-[var(--theme-accent)] hover:bg-[var(--theme-accent)] text-[var(--theme-accent)] hover:text-black font-bold uppercase tracking-[0.2em] text-[10px] px-8 py-3 transition-colors"
                          >
                            <Download size={14} />
                            Download Plain Statement
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
