import React from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const OrderCard = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'shipped':
        return <Truck size={16} className="text-blue-500" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Package size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 p-1.5 rounded-lg">
            <Package size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Order ID</p>
            <p className="text-sm font-semibold text-gray-800">#{order._id?.substring(0, 8) || 'N/A'}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="capitalize">{order.status || 'Pending'}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-50 pt-2 mt-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">Total Price:</span>
        <span className="text-sm font-bold text-gray-900">${Number(order.totalPrice || 0).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderCard;
