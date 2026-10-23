import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard, AdminTabType } from './AdminDashboard';
import { 
  ShieldCheck, ArrowLeft, ShieldAlert, LogIn, Loader2,
  Clock, DollarSign, Package, Image as ImageIcon, Megaphone, ShoppingBag, Users
} from 'lucide-react';

interface AdminPortalPageProps {
  onExit: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ onExit }) => {
  const { currentUser, isAuthReady, setActiveTab, banners, deposits } = useApp();
  const [selectedAdminTab, setSelectedAdminTab] = useState<AdminTabType>('pending_deposits');

  const isRoleAdmin = currentUser?.role === 'admin';
  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Isolated Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center font-sora text-sm shadow-md">
              DC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  DC Top Up <span className="text-amber-400">Admin Portal</span>
                </span>
                {isRoleAdmin && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                আইসোলেটেড ম্যানেজমেন্ট কনসোল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onExit}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>স্টোরফ্রন্টে ফিরে যান</span>
            </button>
          </div>
        </div>

        {/* Top-Level Quick Tab Navigation Bar for Admin */}
        {isRoleAdmin && (
          <div className="border-t border-slate-800 bg-slate-950/80 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
            <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 text-xs">
              <button
                onClick={() => setSelectedAdminTab('pending_deposits')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'pending_deposits'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>পেন্ডিং ডিপোজিট</span>
                {pendingDepositsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                    {pendingDepositsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedAdminTab('all_deposits')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'all_deposits'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>সব ট্রানজেকশন</span>
              </button>

              <button
                onClick={() => setSelectedAdminTab('products')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'products'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>প্রোডাক্ট ও প্যাকেজ</span>
              </button>

              <button
                id="portal-banners-tab-btn"
                onClick={() => setSelectedAdminTab('banners')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'banners'
                    ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>হোম ব্যানার (Banners)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  {banners.length}
                </span>
              </button>

              <button
                onClick={() => setSelectedAdminTab('notices')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'notices'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>জরুরি নোটিশ</span>
              </button>

              <button
                onClick={() => setSelectedAdminTab('orders')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'orders'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>অর্ডার কিউ</span>
              </button>

              <button
                onClick={() => setSelectedAdminTab('users')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  selectedAdminTab === 'users'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ইউজার ও ব্যালেন্স</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {!isAuthReady ? (
          /* Authentication verifying state */
          <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">এডমিন প্রোফাইল যাচাই করা হচ্ছে...</p>
          </div>
        ) : !currentUser ? (
          /* Unauthenticated */
          <div className="max-w-md mx-auto my-12 sm:my-20 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 font-sora">
                এডমিন অ্যাকাউন্টে লগইন প্রয়োজন
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                এই প্যানেলটি শুধুমাত্র DC Top Up এডমিনের জন্য সংরক্ষিত। অনুগ্রহ করে আপনার অনুমোদিত এডমিন অ্যাকাউন্টে লগইন করুন।
              </p>
            </div>

            <button
              onClick={() => {
                onExit();
                setActiveTab('login');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>লগইন পেজে যান</span>
            </button>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={onExit}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                ← গ্রাহক শপে ফিরে যান
              </button>
            </div>
          </div>
        ) : !isRoleAdmin ? (
          /* Logged-in Customer: 403 Forbidden */
          <div className="max-w-md mx-auto my-12 sm:my-20 p-6 sm:p-8 bg-white border border-rose-200 rounded-2xl shadow-xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                403 Forbidden
              </span>
              <h2 className="text-xl font-black text-slate-900 font-sora mt-2">
                অননুমোদিত অ্যাক্সেস
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                আপনার অ্যাকাউন্ট (<span className="font-mono font-bold text-slate-900">{currentUser.email || currentUser.phone || currentUser.id}</span>) গ্রাহক (customer) রোলে নিবন্ধিত। শুধুমাত্র Firestore-এ <span className="font-mono font-bold text-amber-600">role: "admin"</span> প্রাপ্ত ব্যবহারকারীরা এই পেজ ব্যবহার করতে পারেন।
              </p>
            </div>

            <button
              onClick={onExit}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>গ্রাহক স্টোরফ্রন্টে ফিরে যান</span>
            </button>
          </div>
        ) : (
          /* Live Synchronized Admin Dashboard strictly for role === 'admin' */
          <div className="space-y-6">
            <AdminDashboard 
              activeTab={selectedAdminTab} 
              onTabChange={setSelectedAdminTab} 
            />
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        DC Top Up BD — Isolated Administrator Gateway · Single Source of Truth Synchronized
      </footer>
    </div>
  );
};
