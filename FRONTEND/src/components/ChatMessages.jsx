import React from 'react';

const ChatMessages = ({ messages }) => {
  return (
    <div className="flex flex-col gap-6 py-2">
      {messages.map((msg, index) => {
        const isUser = msg.isUser;
        // Mock timestamps for aesthetic preview
        const timeStr = index === 0 ? '10:31 AM' : (isUser ? '10:30 AM' : '10:32 AM');
        
        return (
          <div key={index} className={`flex flex-col gap-2 w-full ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex flex-col gap-2 max-w-[90%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
              
              {/* Message Header (Timestamp + Avatar for AI) */}
              <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                  <div className="w-5 h-5 border border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 flex items-center justify-center overflow-hidden">
                    <img src="/ai-robot.png" alt="" className="w-full h-full object-cover scale-150 opacity-80" />
                  </div>
                )}
                <span className="text-[8px] text-[#4B5563] font-bold uppercase tracking-widest">{isUser ? 'COMMAND SENT' : 'SYSTEM RESPONSE'} • {timeStr}</span>
              </div>

              {/* Text Message */}
              {msg.message && (
                <div className={`px-5 py-4 text-[11px] tracking-wide leading-relaxed relative group transition-all duration-500 ${
                  isUser 
                    ? 'bg-[#111111] border border-[var(--theme-accent)]/30 text-white shadow-[0_0_20px_rgba(0,255,204,0.05)]' 
                    : 'bg-[#0A0A0A] text-[#D1D5DB] border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.02)]'
                }`}>
                  {!isUser && <div className="absolute top-0 left-0 w-1 h-1 bg-[var(--theme-accent)]"></div>}
                  {isUser && <div className="absolute top-0 right-0 w-1 h-1 bg-[var(--theme-accent)]"></div>}
                  
                  <div className="relative z-10 whitespace-pre-wrap">{msg.message}</div>
                </div>
              )}
              
              {/* Product Carousel */}
              {msg.type === 'products' && msg.data && (
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide w-full max-w-full mt-2">
                  {msg.data.map((product) => (
                    <div key={product._id} className="min-w-[140px] max-w-[140px] bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-md flex-shrink-0 flex flex-col group hover:border-[var(--theme-accent)] transition-colors">
                      <div className="h-32 bg-[#111111] relative overflow-hidden flex items-center justify-center p-3 border-b border-[rgba(255,255,255,0.08)] group-hover:border-[var(--theme-accent)]/50">
                        {product.image ? (
                           <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-screen" />
                        ) : (
                           <div className="w-full h-full bg-[#111111] flex flex-col items-center justify-center border border-dashed border-[rgba(255,255,255,0.1)]">
                             <div className="text-[var(--theme-accent)] text-xs font-bold uppercase tracking-[0.2em] opacity-50">NO IMAGE</div>
                           </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <h4 className="text-[9px] font-bold text-white uppercase tracking-wider line-clamp-2 mb-2 leading-snug">{product.title}</h4>
                        <div className="mt-auto">
                           <p className="text-[var(--theme-accent)] font-bold text-[11px] tracking-widest">₹{(Number(product.price)).toLocaleString()}</p>
                           <div className="flex items-center gap-1 mt-1">
                             <span className="text-[var(--theme-accent)] text-[8px] uppercase tracking-widest">RATING: 4.4</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders List */}
              {msg.type === 'orders' && msg.data && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  {msg.data.map((order, idx) => {
                    const isDelivered = order.status?.toLowerCase() === 'delivered';
                    return (
                      <div key={idx} className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] p-4 flex flex-col gap-3 w-full max-w-[280px] hover:border-[var(--theme-accent-secondary)] transition-colors">
                        <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.05)] pb-2">
                           <span className="text-[10px] text-white font-bold uppercase tracking-widest">ORDER: #{order._id?.substring(0, 7).toUpperCase() || 'SC12345'}</span>
                           <span className={`text-[9px] font-bold uppercase tracking-widest ${isDelivered ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-accent-secondary)]'}`}>
                             {order.status || 'SHIPPED'}
                           </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                           <span className="text-[9px] text-[#9CA3AF] uppercase tracking-widest">12.05.2024</span>
                           <span className="text-sm font-bold text-white tracking-widest">₹{(Number(order.totalPrice)).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Categories List */}
              {msg.type === 'categories' && msg.data && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.data.map((cat, idx) => (
                    <div key={idx} className="px-3 py-1 bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 text-[var(--theme-accent)] text-[9px] font-bold uppercase tracking-widest hover:bg-[var(--theme-accent)]/20 transition-colors cursor-default">
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
