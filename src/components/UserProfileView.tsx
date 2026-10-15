import React, { useState } from 'react';
import { useApp, cleanDisplayTimestamp } from '../context/AppContext';
import { Order } from '../types';
import { 
  User as UserIcon, Wallet, PlusCircle, 
  ShoppingBag, CheckCircle2, Clock, ShieldCheck, 
  Copy, Check, Edit3, Save, X, RefreshCw, 
  Gamepad2, ChevronRight, Phone, Mail, Calendar, MessageCircle, AlertCircle,
  Lock, KeyRound, Eye, EyeOff, Loader2
} from 'lucide-react';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const UserProfileView: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    products,
    deposits,
    setActiveTab, 
    setSelectedProduct,
    setActiveTrackingOrderId, 
    updateUserProfile, 
    showToast,
    logout
  } = useApp();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editGameUid, setEditGameUid] = useState(currentUser?.savedGameUid || '');

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Order summary filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'delivered' | 'processing' | 'pending'>('all');

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-sora">
            প্রোফাইল দেখতে লগইন করুন
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
            আপনার ওয়ালেট ব্যালেন্স, ব্যক্তিগত তথ্য এবং অর্ডার হিস্ট্রি দেখতে আপনার অ্যাকাউন্টে লগইন করুন।
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('login')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E0A500] hover:bg-[#B98A00] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            লগইন / সাইন-আপ করুন
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // User orders
  const myOrders = orders.filter((o) => o.userId === currentUser.id);
  const totalOrders = myOrders.length;
  const totalSpent = myOrders.reduce((sum, o) => sum + o.price, 0);
  const deliveredOrders = myOrders.filter((o) => o.status === 'delivered');
  const activeOrders = myOrders.filter((o) => o.status === 'pending' || o.status === 'processing');

  const filteredOrders = myOrders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast(`${label} কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('নাম খালি রাখা যাবে না!', 'error');
      return;
    }
    updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      savedGameUid: editGameUid.trim()
    });
    setIsEditingProfile(false);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const user = auth.currentUser;
    const userEmail = user?.email || currentUser?.email;

    if (!user || !userEmail) {
      setPasswordError('লগইন সেশন পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।');
      return;
    }

    if (!currentPassword) {
      setPasswordError('বর্তমান পাসওয়ার্ড লিখুন');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('নতুন পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('পাসওয়ার্ড দুটো মিলছে না');
      return;
    }

    setIsChangingPassword(true);

    try {
      // 1. Re-authenticate the user using Firebase's reauthenticateWithCredential
      try {
        const credential = EmailAuthProvider.credential(userEmail, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } catch (reauthErr: any) {
        console.warn('Firebase reauthentication failed:', reauthErr);
        setPasswordError('বর্তমান পাসওয়ার্ড সঠিক নয়');
        setIsChangingPassword(false);
        return;
      }

      // 2. Call Firebase's updatePassword with new password
      await updatePassword(user, newPassword);

      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordError('');
    } catch (err: any) {
      console.error('Firebase password update error:', err);
      let msg = 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি। আবার চেষ্টা করুন।';
      if (err?.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড খুব দুর্বল, কমপক্ষে ৬ ক্যারেক্টারের শক্তিশালী পাসওয়ার্ড দিন।';
      } else if (err?.code === 'auth/requires-recent-login') {
        msg = 'নিরাপত্তার স্বার্থে অনুগ্রহ করে অ্যাকাউন্ট থেকে লগআউট করে আবার লগইন করুন।';
      } else if (err?.message) {
        msg = err.message;
      }
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setActiveTab('orders');
  };

  const handleReorder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12 bg-white text-black">
      {/* 1. Account Profile Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>

            {/* User Core Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ভেরিফাইড অ্যাকাউন্ট</span>
                </span>
              </div>

              {/* Clean typographic metadata without static pills */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700 font-medium">
                <span className="font-mono text-black font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{currentUser.phone}</span>
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{currentUser.email || 'ইমেইল যুক্ত করুন'}</span>
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>যোগদান: {currentUser.joinedAt}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-500">
                <span>অ্যাকাউন্ট আইডি: </span>
                <span className="font-mono font-bold text-black">{currentUser.id}</span>
                <button
                  onClick={() => handleCopy(currentUser.id, 'অ্যাকাউন্ট আইডি')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer transition-colors"
                  title="কপি করুন"
                >
                  {copiedId === currentUser.id ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              id="profile-switch-account-btn"
              onClick={() => setActiveTab('login')}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>লগইন / নতুন অ্যাকাউন্ট</span>
            </button>

            <button
              id="profile-edit-trigger-btn"
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone);
                setEditEmail(currentUser.email || '');
                setEditGameUid(currentUser.savedGameUid || '');
                setIsEditingProfile(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-700" />
              <span>প্রোফাইল পরিবর্তন</span>
            </button>

            <button
              id="profile-change-password-trigger-btn"
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPasswordError('');
                setShowCurrentPass(false);
                setShowNewPass(false);
                setShowConfirmPass(false);
                setIsPasswordModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-700" />
              <span>পাসওয়ার্ড পরিবর্তন করুন</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                id="profile-admin-panel-cta-btn"
                onClick={() => {
                  window.location.hash = '#admin';
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border border-slate-700"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>এডমিন প্যানেলে যান</span>
              </button>
            )}

            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Saved Player UID bar if exists */}
        {currentUser.savedGameUid && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">সংরক্ষিত গেম Player ID (UID):</span>
              <span className="font-mono font-extrabold text-black bg-white px-2 py-0.5 rounded border border-slate-300">
                {currentUser.savedGameUid}
              </span>
            </div>
            <button
              onClick={() => handleCopy(currentUser.savedGameUid!, 'Player UID')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>কপি</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Wallet & Account Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Current Wallet Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              বর্তমান ওয়ালেট ব্যালেন্স
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black font-sans">
              ৳ {currentUser.walletBalance.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">ইনস্ট্যান্ট গেম টপ-আপের জন্য প্রস্তুত</span>
          </div>
          <button
            onClick={() => setActiveTab('deposit')}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>টাকা যোগ করুন (Deposit)</span>
          </button>
        </div>

        {/* Lifetime Top-Up Spend */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              মোট টপ-আপ ব্যয়
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black font-sans">
              ৳ {totalSpent.toFixed(0)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{totalOrders} টি অর্ডারে সফলভাবে সম্পন্ন</span>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-slate-600" />
            <span>নতুন টপ-আপ শপ</span>
          </button>
        </div>

        {/* Completed Delivery Stat */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              সফল ডেলিভারি ও সক্রিয় অর্ডার
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black font-sans">
              {deliveredOrders.length} <span className="text-base text-slate-600 font-bold">/ {totalOrders} টি</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">
              {activeOrders.length > 0 ? `${activeOrders.length} টি অর্ডার প্রক্রিয়াধীন রয়েছে` : 'সব অর্ডার সফলভাবে ডেলিভার্ড'}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>লাইভ ট্র্যাকিং দেখুন</span>
          </button>
        </div>
      </div>

      {/* 3. Order History Summary (অর্ডার ইতিহাস ও লেনদেন সারসংক্ষেপ) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-black text-black">
                অর্ডার ইতিহাস ও লেনদেন সারসংক্ষেপ
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              আপনার সাম্প্রতিক কেনাকাটা ও ডায়মন্ড টপ-আপের স্ট্যাটাস দেখুন।
            </p>
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-extrabold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>সব অর্ডার বিস্তারিত দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <button
            onClick={() => setOrderFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            সব ({totalOrders})
          </button>
          <button
            onClick={() => setOrderFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'delivered'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            ডেলিভার্ড ({deliveredOrders.length})
          </button>
          <button
            onClick={() => setOrderFilter('processing')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'processing'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            প্রসেসিং ({myOrders.filter((o) => o.status === 'processing').length})
          </button>
          <button
            onClick={() => setOrderFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
              orderFilter === 'pending'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-slate-300 hover:bg-slate-100'
            }`}
          >
            পেন্ডিং ({myOrders.filter((o) => o.status === 'pending').length})
          </button>
        </div>

        {/* Orders List / Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm text-black">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-600">আপনি এখনো কোনো টপ-আপ করেননি অথবা এই ফিল্টারে কোনো অর্ডার নেই।</p>
            <button
              onClick={() => setActiveTab('home')}
              className="mt-2 px-4 py-2 rounded-xl bg-black text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>টপ-আপ শপে যান</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.slice(0, 6).map((order) => {
              const matchingProduct = products.find((p) => p.id === order.productId);
              return (
                <div
                  key={order.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    {matchingProduct?.image ? (
                      <img
                        src={matchingProduct.image}
                        alt={order.productTitle}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 text-slate-600">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-black">{order.productTitle}</span>
                        <span className="font-mono text-xs text-slate-500">#{order.id}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-700">
                        <span className="font-bold text-black">{order.packageName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-600">UID: <span className="font-mono font-bold text-black">{order.playerId}</span></span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-500">{cleanDisplayTimestamp(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price, Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-black font-sans">
                        ৳ {order.price}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block ${
                          order.status === 'delivered'
                            ? 'text-emerald-700'
                            : order.status === 'processing'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {order.status === 'delivered'
                          ? 'ডেলিভার্ড ✓'
                          : order.status === 'processing'
                          ? 'প্রসেসিং ⚡'
                          : 'পেন্ডিং ⏳'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTrackOrder(order.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="লাইভ ট্র্যাকিং দেখুন"
                      >
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>ট্র্যাক</span>
                      </button>

                      <button
                        onClick={() => handleReorder(order.productId)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="একই পণ্য আবার কিনুন"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-700" />
                        <span>পুনরায়</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3.5. Wallet Deposits, Manual Credits & Refund History */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              <h3 className="text-base sm:text-lg font-black text-black">
                ওয়ালেট লেনদেন ও রিফান্ড ইতিহাস
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              আপনার সকল ডিপোজিট, এডমিন সরাসরি জমা এবং বাতিলকৃত অর্ডারের রিফান্ড বিবরণী।
            </p>
          </div>

          <button
            onClick={() => setActiveTab('deposit')}
            className="text-xs font-extrabold text-purple-700 hover:text-purple-900 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন ডিপোজিট করুন</span>
          </button>
        </div>

        {/* Transactions List */}
        {(() => {
          const myDeposits = deposits.filter((d) => d.userId === currentUser.id);

          if (myDeposits.length === 0) {
            return (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1.5">
                <Wallet className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="font-bold text-xs text-black">কোনো ডিপোজিট বা রিফান্ড রেকর্ড নেই</p>
                <p className="text-[11px] text-slate-600">আপনি বিকাশ বা নগদে ডিপোজিট করলে তা এখানে প্রদর্শিত হবে।</p>
              </div>
            );
          }

          return (
            <div className="space-y-2.5">
              {myDeposits.map((dep) => {
                const isRefund = dep.type === 'refund' || dep.method === 'refund';
                const isManual = dep.type === 'manual' || dep.method === 'manual' || dep.isManual;

                return (
                  <div
                    key={dep.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs transition-all ${
                      isRefund
                        ? 'bg-rose-50/30 border-rose-200'
                        : isManual
                        ? 'bg-purple-50/30 border-purple-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isRefund ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-950 border border-rose-300">
                            রিফান্ড (Refund)
                          </span>
                        ) : isManual ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-950 border border-purple-300">
                            ম্যানুয়াল জমা (Manual Deposit)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-900 border border-slate-300 uppercase">
                            {dep.method}
                          </span>
                        )}

                        <span className="font-mono text-xs text-slate-500 font-bold">
                          TrxID: {dep.trxId}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            dep.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : dep.status === 'pending'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : 'bg-rose-100 text-rose-950 border border-rose-300'
                          }`}
                        >
                          {dep.status === 'approved' ? 'অনুমোদিত (Approved)' : dep.status === 'pending' ? 'যাচাই চলছে (Pending)' : 'বাতিল (Rejected)'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>সময়: <strong>{dep.createdAt}</strong></span>
                        {dep.rejectReason && (
                          <span className="text-slate-800 font-medium">বিবরণ: {dep.rejectReason}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-[10px] text-slate-500 block font-bold">ওয়ালেটে যোগ</span>
                      <span className="text-base font-black text-emerald-700 font-sans">
                        + ৳ {dep.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* 4. Account Security & Support Helpline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Security & Verification Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-black">অ্যাকাউন্ট নিরাপত্তা ও স্থিতি</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-medium">মোবাইল নম্বর যাচাই</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>যাচাইকৃত (Active)</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="font-medium">পেমেন্ট মেথড গেটওয়ে</span>
              <span className="text-slate-800 font-semibold">বিকাশ, নগদ ও রকেট সক্রিয়</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-medium">লগইন সেশন</span>
              <span className="text-slate-800 font-mono">সুরক্ষিত ব্রাউজার সেশন</span>
            </div>
          </div>
        </div>

        {/* Support Helpline Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-black">সাহায্য ও কাস্টমার সাপোর্ট</h4>
          </div>
          <p className="text-xs text-slate-600">
            টপ-আপ বা ডিপোজিট সংক্রান্ত যেকোনো প্রয়োজনে আমাদের ডেডিকেটেড হোয়াটসঅ্যাপ হেল্পলাইনে যোগাযোগ করুন।
          </p>
          <a
            href={SUPPORT_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>২৪/৭ WhatsApp সাপোর্ট ({SUPPORT_PHONE_FORMATTED})</span>
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-black" />
                <h3 className="font-extrabold text-base text-black">প্রোফাইল তথ্য পরিবর্তন</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 text-slate-500 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black block">আপনার পুরো নাম</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">ফোন নম্বর</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">ডিফল্ট গেম Player ID (UID)</label>
                <input
                  type="text"
                  value={editGameUid}
                  onChange={(e) => setEditGameUid(e.target.value)}
                  placeholder="যেমন: 2847591028"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <span className="text-[11px] text-slate-500 block">
                  এটি সেভ রাখলে টপ-আপ করার সময় অটো-ফিল হবে।
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">নিরাপত্তা:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setPasswordError('');
                    setShowCurrentPass(false);
                    setShowNewPass(false);
                    setShowConfirmPass(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="text-xs text-black hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>পাসওয়ার্ড পরিবর্তন করুন</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-black animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-black" />
                <h3 className="font-extrabold text-base text-black">পাসওয়ার্ড পরিবর্তন করুন</h3>
              </div>
              <button
                id="close-change-password-modal-btn"
                type="button"
                onClick={() => {
                  if (!isChangingPassword) setIsPasswordModalOpen(false);
                }}
                disabled={isChangingPassword}
                className="p-1 text-slate-500 hover:text-black rounded-lg cursor-pointer disabled:opacity-40"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div id="change-password-error-alert" className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span className="font-bold leading-relaxed">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-black block">বর্তমান পাসওয়ার্ড</label>
                <div className="relative">
                  <input
                    id="current-password-input"
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                    className="w-full px-3 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                    required
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black p-1 cursor-pointer"
                    title={showCurrentPass ? 'লুকান' : 'দেখান'}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">নতুন পাসওয়ার্ড (কমপক্ষে ৬ ক্যারেক্টার)</label>
                <div className="relative">
                  <input
                    id="new-password-input"
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ ক্যারেক্টারের নতুন পাসওয়ার্ড"
                    className="w-full px-3 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                    required
                    minLength={6}
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black p-1 cursor-pointer"
                    title={showNewPass ? 'লুকান' : 'দেখান'}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-black block">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <div className="relative">
                  <input
                    id="confirm-new-password-input"
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                    className="w-full px-3 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black"
                    required
                    minLength={6}
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black p-1 cursor-pointer"
                    title={showConfirmPass ? 'লুকান' : 'দেখান'}
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isChangingPassword}
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold cursor-pointer disabled:opacity-40"
                >
                  বাতিল
                </button>
                <button
                  id="submit-change-password-btn"
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>পরিবর্তন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>পাসওয়ার্ড পরিবর্তন করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
