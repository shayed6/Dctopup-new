/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeCatalog } from './components/HomeCatalog';
import { AddMoneyView } from './components/AddMoneyView';
import { OrdersView } from './components/OrdersView';
import { UserProfileView } from './components/UserProfileView';
import { AuthSection } from './components/AuthSection';
import { AdminPortalPage } from './components/AdminPortalPage';
import { PurchaseModal } from './components/PurchaseModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { TopUpProduct } from './types';
import { SafeImage } from './components/SafeImage';
import { ShieldCheck, Zap, Headphones, MessageCircle, ShieldAlert } from 'lucide-react';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from './data/initialData';

const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path.startsWith('/admin') ||
    hash.startsWith('#/admin') ||
    hash.startsWith('#admin') ||
    search.includes('page=admin') ||
    search.includes('admin=true')
  );
};

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, selectedProduct, setSelectedProduct, currentUser } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminRoute());

  // Listen to browser navigation (back/forward and hash changes)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToStore = () => {
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    } else if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('page');
      url.searchParams.delete('admin');
      window.history.pushState({}, '', url.toString());
    }
    setIsAdminRoute(false);
  };

  // If visiting /admin or #/admin, render exclusively the isolated Admin Portal
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-100 text-black flex flex-col font-sans">
        <ToastContainer />
        <AdminPortalPage onExit={navigateToStore} />
      </div>
    );
  }

  // Regular user-facing layout (zero admin badges, buttons, or links)
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-950">
      <ToastContainer />

      {/* Top Navigation Bar - Regular user navigation only */}
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Banned User Alert Message */}
      {currentUser?.status === 'banned' && (
        <div id="banned-user-alert-banner" className="bg-red-600 text-white px-4 py-3 shadow-md border-b border-red-700">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-200" />
              <span>আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Banned) করা হয়েছে। নতুন কোনো ডিপোজিট বা অর্ডার করা যাবে না।</span>
            </div>
            <a
              href={SUPPORT_WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-white text-red-700 rounded-lg text-xs font-black hover:bg-red-50 transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-red-700" />
              <span>সাপোর্টে কথা বলুন</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {activeTab === 'home' && (
          <HomeCatalog
            onSelectProduct={(product: TopUpProduct) => setSelectedProduct(product)}
          />
        )}

        {activeTab === 'deposit' && <AddMoneyView />}

        {activeTab === 'orders' && <OrdersView />}

        {activeTab === 'profile' && <UserProfileView />}

        {activeTab === 'login' && <AuthSection />}
      </main>

      {/* Purchase Modal / Checkout Drawer */}
      {selectedProduct && (
        <PurchaseModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onGoToDeposit={() => {
            setSelectedProduct(null);
            setActiveTab('deposit');
          }}
          onGoToOrders={() => {
            setSelectedProduct(null);
            setActiveTab('orders');
          }}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Desktop / Tablet Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-auto py-8 px-4 text-xs text-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0">
              <SafeImage src="/dc_logo.jpg" alt="DC" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-black font-bold text-sm">DC Top Up (ডিসি টপ-আপ বাংলাদেশ)</p>
              <p className="text-[11px] text-slate-800">
                দ্রুত ও নিরাপদ গেম কারেন্সি ও ওয়ালেট রিচার্জ প্ল্যাটফর্ম
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-black font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>১০০% আইডি নিরাপদ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>অটোমেটেড দ্রুত ডেলিভারি</span>
            </span>
            <div className="flex items-center flex-wrap gap-2 text-black font-medium">
              <a
                id="footer-whatsapp-helpline"
                href={SUPPORT_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
                title={`২৪/৭ কাস্টমার সাপোর্ট হেল্পলাইন - WhatsApp: ${SUPPORT_PHONE_FORMATTED}`}
              >
                <Headphones className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>২৪/৭ হেল্পলাইন ({SUPPORT_PHONE_FORMATTED})</span>
              </a>
              <span className="text-slate-500 text-[11px] sm:text-[12px] font-normal whitespace-nowrap">
                <span>⚡ by </span>
                <a
                  href="https://t.me/gz_holdings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-800 hover:underline transition-colors"
                >
                  Gz Holdings
                </a>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-black text-center md:text-right font-medium">
            <span>পেমেন্ট পার্টনার: </span>
            <span className="text-[#D82365] font-bold">bKash</span> •{' '}
            <span className="text-[#F25822] font-bold">Nagad</span>
          </div>
        </div>
      </footer>

      {/* Floating 24/7 WhatsApp Customer Support Helpline Button */}
      <a
        id="floating-whatsapp-helpline-btn"
        href={SUPPORT_WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
        title={`২৪/৭ কাস্টমার সাপোর্ট হেল্পলাইন - WhatsApp: ${SUPPORT_PHONE_FORMATTED}`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
        <span className="hidden sm:inline">২৪/৭ কাস্টমার সাপোর্ট ({SUPPORT_PHONE_FORMATTED})</span>
        <span className="sm:hidden">WhatsApp হেল্পলাইন</span>
      </a>

      {/* Mobile Floating Bottom Navigation Dock */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
