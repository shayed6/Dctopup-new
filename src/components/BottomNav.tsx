import React from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, PlusCircle, ShoppingBag, User, Shield } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, orders, currentUser } = useApp();

  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 pb-safe shadow-lg text-black">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          id="mobile-nav-home-btn"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-emerald-800 font-extrabold'
              : 'text-black hover:text-emerald-700 font-semibold'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5 text-emerald-700" />
          <span className="text-[10px] leading-tight">টপ-আপ</span>
        </button>

        {/* Add Money - Hero Button */}
        <button
          id="mobile-nav-deposit-btn"
          onClick={() => setActiveTab('deposit')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'deposit'
              ? 'text-emerald-800 font-extrabold'
              : 'text-black hover:text-emerald-700 font-semibold'
          }`}
        >
          <div className="relative">
            <PlusCircle className="w-5 h-5 mb-0.5 text-emerald-700" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          </div>
          <span className="text-[10px] leading-tight">টাকা যোগ</span>
        </button>

        {/* Orders */}
        <button
          id="mobile-nav-orders-btn"
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'text-blue-900 font-extrabold'
              : 'text-black hover:text-blue-700 font-semibold'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-blue-700" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[9px] flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">অর্ডার</span>
        </button>

        {/* Profile */}
        <button
          id="mobile-nav-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-purple-900 font-extrabold'
              : 'text-black hover:text-purple-700 font-semibold'
          }`}
        >
          <User className="w-5 h-5 mb-0.5 text-purple-700" />
          <span className="text-[10px] leading-tight">প্রোফাইল</span>
        </button>

        {/* Admin Quick Button for role === 'admin' */}
        {currentUser?.role === 'admin' && (
          <button
            id="mobile-nav-admin-btn"
            onClick={() => {
              window.location.hash = '#admin';
            }}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-amber-600 font-black cursor-pointer bg-amber-50 border border-amber-200"
          >
            <Shield className="w-5 h-5 mb-0.5 text-amber-600" />
            <span className="text-[10px] leading-tight font-extrabold">এডমিন</span>
          </button>
        )}
      </div>
    </nav>
  );
};
