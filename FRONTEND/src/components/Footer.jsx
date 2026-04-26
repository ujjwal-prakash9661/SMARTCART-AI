import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Globe, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <Zap size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                SMARTCART
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Experience the future of shopping with our intelligent, AI-powered e-commerce platform.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-emerald-600 transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-600 transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-600 transition-colors">
                <Phone size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/store" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">All Products</Link></li>
              <li><Link to="/store" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Electronics</Link></li>
              <li><Link to="/store" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Fashion</Link></li>
              <li><Link to="/store" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-3">
              <li><Link to="/auth" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Sign In</Link></li>
              <li><Link to="/cart" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">View Cart</Link></li>
              <li><Link to="/orders" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">My Orders</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SMARTCART-AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            Built with <span className="text-red-500">❤</span> using React & AI
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
