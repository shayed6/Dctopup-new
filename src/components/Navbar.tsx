import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { Wallet, PlusCircle, User, LogOut, ChevronDown, Gamepad2, ShoppingBag, MessageCircle, LogIn, Shield } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { currentUser, activeTab, setActiveTab, logout } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-logo-btn"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-amber-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              <SafeImage
                src="/dc_logo.jpg"
                alt="DC Top Up Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-black font-sans">
                  DC <span className="text-emerald-600">TOP UP</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-slate-800 font-medium -mt-1 hidden xs:block">
                ওয়ালেট রিচার্জ ও গেম টপ-আপ
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="nav-desktop-home-btn"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600" />
            <span>টপ-আপ শপ</span>
          </button>

          <button
            id="nav-desktop-deposit-btn"
            onClick={() => setActiveTab('deposit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'deposit'
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>টাকা যোগ করুন</span>
          </button>

          <button
            id="nav-desktop-orders-btn"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>অর্ডারসমূহ</span>
          </button>

          <button
            id="nav-desktop-profile-btn"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>প্রোফাইল</span>
          </button>

          <button
            id="nav-desktop-auth-btn"
            onClick={() => setActiveTab('login')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-black shadow-xs border border-slate-200'
                : 'text-black hover:bg-white/60'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#E0A500]" />
            <span>লগইন / সাইন-আপ</span>
          </button>
        </nav>

        {/* Right Section: Wallet & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Prominent Wallet Balance Card */}
              <button
                id="nav-wallet-chip-btn"
                onClick={() => setActiveTab('deposit')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 hover:border-emerald-500 shadow-xs transition-all text-left group cursor-pointer"
                title="ওয়ালেট ব্যালেন্স - টাকা যোগ করতে ক্লিক করুন"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-800 uppercase tracking-wider font-bold flex items-center gap-1">
                    <span>ব্যালেন্স</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-black tracking-tight -mt-0.5">
                    ৳ {currentUser.walletBalance.toFixed(2)}
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center pl-1 text-emerald-700">
                  <PlusCircle className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* 24/7 WhatsApp Support Helpline Button */}
              <a
                id="nav-whatsapp-support-btn"
                href={SUPPORT_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title={`২৪/৭ হোয়াটসঅ্যাপ কাস্টমার সাপোর্ট হেল্পলাইন (${SUPPORT_PHONE_FORMATTED})`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span className="hidden md:inline">২৪/৭ সাপোর্ট</span>
              </a>

              {/* Admin Panel Quick Link for role === 'admin' */}
              {currentUser.role === 'admin' && (
                <button
                  id="nav-admin-panel-btn"
                  onClick={() => {
                    window.location.hash = '#admin';
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-extrabold transition-all shadow-xs cursor-pointer shrink-0"
                  title="এডমিন কন্ট্রোল প্যানেল"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">এডমিন প্যানেল</span>
                </button>
              )}

              {/* User Account / Profile Dropdown */}
              <div className="relative">
                <button
                  id="nav-user-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-black transition-all text-xs font-bold cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs border border-emerald-300">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate text-black font-semibold">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-black hidden sm:inline" />
                </button>

                {profileDropdownOpen && (
                  <div
                    id="nav-profile-dropdown"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-300 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-black"
                  >
                    <div className="px-3 py-2 border-b border-slate-200">
                      <p className="text-xs text-slate-700">লগইন করা আছে:</p>
                      <p className="text-sm font-bold text-black truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-800 font-mono mt-0.5 truncate">{currentUser.email || currentUser.phone || 'Firebase User'}</p>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'admin' && (
                        <button
                          id="profile-dropdown-admin-panel"
                          onClick={() => {
                            window.location.hash = '#admin';
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg text-left font-extrabold cursor-pointer border border-amber-200 mb-1"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                          <span>এডমিন প্যানেলে যান</span>
                        </button>
                      )}

                      <button
                        id="profile-dropdown-my-profile"
                        onClick={() => {
                          setActiveTab('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-black font-bold hover:bg-slate-100 rounded-lg text-left cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        <span>আমার প্রোফাইল</span>
                      </button>

                      <button
                        id="profile-dropdown-add-money"
                        onClick={() => {
                          setActiveTab('deposit');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-black font-semibold hover:bg-slate-100 rounded-lg text-left cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>টাকা যোগ করুন</span>
                      </button>
                      <button
                        id="profile-dropdown-orders"
                        onClick={() => {
                          setActiveTab('orders');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-black font-semibold hover:bg-slate-100 rounded-lg text-left cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                        <span>আমার অর্ডারসমূহ</span>
                      </button>
                      <a
                        id="profile-dropdown-whatsapp"
                        href={SUPPORT_WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-950 font-bold hover:bg-emerald-50 rounded-lg text-left cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>২৪/৭ WhatsApp হেল্পলাইন</span>
                      </a>
                    </div>

                    <div className="pt-1 border-t border-slate-200">
                      <button
                        id="profile-dropdown-logout"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg text-left font-bold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>লগআউট</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* WhatsApp Helpline when logged out */}
              <a
                id="nav-whatsapp-support-btn-logged-out"
                href={SUPPORT_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title={`২৪/৭ হোয়াটসঅ্যাপ কাস্টমার সাপোর্ট হেল্পলাইন (${SUPPORT_PHONE_FORMATTED})`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span className="hidden md:inline">২৪/৭ সাপোর্ট</span>
              </a>

              {/* Login / Signup Button */}
              <button
                id="nav-login-cta-btn"
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#14162E] hover:bg-[#202347] active:scale-[0.98] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E0A500]" />
                <span>লগইন / সাইন-আপ</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
