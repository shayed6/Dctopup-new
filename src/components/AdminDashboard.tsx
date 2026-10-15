import React, { useState } from 'react';
import { useApp, cleanDisplayTimestamp } from '../context/AppContext';
import { DepositRequest, TopUpProduct, TopUpPackage, ProductCategory, HomeBanner, Order } from '../types';
import { PRESET_PRODUCT_IMAGES } from '../data/initialData';
import { SafeImage } from './SafeImage';
import { 
  Clock, CheckCircle2, XCircle, 
  Users, ShoppingBag, Package, Plus, Trash2, AlertCircle, 
  Search, Copy, Check, DollarSign, RefreshCw, Image as ImageIcon,
  Megaphone, Flame, Info, AlertTriangle, Sparkles, ExternalLink,
  ArrowRight, Tag, Eye, EyeOff, CheckSquare, Lock, ShieldAlert, Edit3, Database,
  UserX, UserCheck, ArrowUp, ArrowDown, Wallet, Ban
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    deposits, 
    orders, 
    products, 
    approveDeposit, 
    rejectDeposit, 
    updateOrderStatus,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    toggleProductActive,
    togglePackageStock,
    updateProductImage,
    updateProductPackages,
    seedProductsToFirestore,
    notice,
    updateNotice,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    saveAllBanners,
    allUsers,
    toggleUserBan,
    addManualDeposit,
    showToast,
    currentUser
  } = useApp();

  const [currentAdminTab, setCurrentAdminTab] = useState<
    'pending_deposits' | 'all_deposits' | 'products' | 'notices_banners' | 'orders' | 'users'
  >('pending_deposits');

  // Reject deposit modal state
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('ভুল TrxID বা অ্যাকাউন্টে কোনো টাকা পাওয়া যায়নি।');
  const [processingDepositId, setProcessingDepositId] = useState<string | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState<boolean>(false);

  // Product Image change modal state
  const [editingImageProduct, setEditingImageProduct] = useState<TopUpProduct | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Edit existing product full metadata state
  const [editingDetailsProduct, setEditingDetailsProduct] = useState<TopUpProduct | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBadgeTag, setEditBadgeTag] = useState('');
  const [editSortOrder, setEditSortOrder] = useState<number>(1);
  const [editCategory, setEditCategory] = useState<ProductCategory>('gaming');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editPlayerIdLabel, setEditPlayerIdLabel] = useState('');

  // Add package to existing product state
  const [addingPackageToProduct, setAddingPackageToProduct] = useState<TopUpProduct | null>(null);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgAmount, setNewPkgAmount] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');

  // Edit package in existing product state
  const [editingPackageProduct, setEditingPackageProduct] = useState<{
    product: TopUpProduct;
    package: TopUpPackage;
  } | null>(null);
  const [editPkgName, setEditPkgName] = useState('');
  const [editPkgAmount, setEditPkgAmount] = useState('');
  const [editPkgPrice, setEditPkgPrice] = useState('');

  const [isSeedingProducts, setIsSeedingProducts] = useState(false);

  // Add new product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('gaming');
  const [newProductSubCategory, setNewProductSubCategory] = useState('Special Offer');
  const [newProductBadge, setNewProductBadge] = useState('Special Offer');
  const [newProductPlayerIdLabel, setNewProductPlayerIdLabel] = useState('Player ID (UID)');
  const [newProductImageUrl, setNewProductImageUrl] = useState('/images/ff_friday_offer_1790099054219.jpg');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductSortOrder, setNewProductSortOrder] = useState<number>(1);
  const [newPackageList, setNewPackageList] = useState<Array<{ name: string; amount: string; price: number; popular: boolean }>>([
    { name: '115 Diamonds', amount: '115 💎', price: 85, popular: true }
  ]);

  // Notice state in admin form
  const [noticeDraftText, setNoticeDraftText] = useState(notice.text);
  const [noticeDraftDate, setNoticeDraftDate] = useState(notice.date || notice.updatedAt || '১ অক্টোবর, ২০২৬');
  const [noticeDraftType, setNoticeDraftType] = useState<'urgent' | 'offer' | 'warning' | 'info'>(notice.type);
  const [noticeDraftIsActive, setNoticeDraftIsActive] = useState(notice.isActive);

  // Banner modal state
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('/images/ff_friday_offer_1790099054219.jpg');
  const [newBannerLinkUrl, setNewBannerLinkUrl] = useState('');
  const [newBannerBadge, setNewBannerBadge] = useState('স্পেশাল অফার');
  const [newBannerActionText, setNewBannerActionText] = useState('টাকা যোগ করুন');
  const [newBannerActionTab, setNewBannerActionTab] = useState<'deposit' | 'orders' | 'home'>('deposit');

  // Edit banner modal state
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [editBannerTitle, setEditBannerTitle] = useState('');
  const [editBannerSubtitle, setEditBannerSubtitle] = useState('');
  const [editBannerImageUrl, setEditBannerImageUrl] = useState('');
  const [editBannerLinkUrl, setEditBannerLinkUrl] = useState('');
  const [editBannerBadge, setEditBannerBadge] = useState('');
  const [editBannerActionText, setEditBannerActionText] = useState('');
  const [editBannerActionTab, setEditBannerActionTab] = useState<'deposit' | 'orders' | 'home'>('deposit');

  // User search and filter
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'banned'>('all');

  // Manual Deposit Modal State
  const [showManualDepositModal, setShowManualDepositModal] = useState(false);
  const [manualDepositUserId, setManualDepositUserId] = useState('');
  const [manualDepositAmount, setManualDepositAmount] = useState('100');
  const [manualDepositNote, setManualDepositNote] = useState('');
  const [userDropdownSearch, setUserDropdownSearch] = useState('');
  const [isSubmittingManualDeposit, setIsSubmittingManualDeposit] = useState(false);

  // Reject / Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelOrderReason, setCancelOrderReason] = useState('স্টক স্বল্পতা বা সার্ভার সংযোগ ব্যর্থতার কারণে অর্ডারটি বাতিল ও মূল্য রিফান্ড করা হলো।');

  // TrxID copied feedback
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

  // Search in deposits
  const [depositSearch, setDepositSearch] = useState('');
  const [depositFilterStatus, setDepositFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Search & Filter in products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'gaming' | 'tiktok' | 'facebook'>('all');

  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'approved');

  const totalPendingDeposits = pendingDeposits.length;
  const todayApprovedAmount = approvedDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCompletedOrders = orders.filter((o) => o.status === 'delivered').length;

  // Real-time verification of admin role from users/{uid} document
  const isAdmin = currentUser?.role === 'admin';

  const handleCopyTrx = (trx: string) => {
    navigator.clipboard.writeText(trx);
    setCopiedTrx(trx);
    showToast(`TrxID ${trx} কপি করা হয়েছে!`, 'success');
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const handleConfirmReject = async () => {
    if (!rejectingDeposit) return;
    await rejectDeposit(rejectingDeposit.id, rejectReason);
    setRejectingDeposit(null);
  };

  // Filtered deposits for All Deposits tab
  const filteredAllDeposits = deposits.filter((d) => {
    if (depositFilterStatus !== 'all' && d.status !== depositFilterStatus) return false;
    if (!depositSearch) return true;
    const q = depositSearch.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.trxId.toLowerCase().includes(q) ||
      d.senderPhone.toLowerCase().includes(q) ||
      d.userName.toLowerCase().includes(q)
    );
  });

  // Filtered products for Products tab
  const filteredAdminProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all') {
      if (productCategoryFilter === 'gaming' && p.category !== 'gaming' && p.category !== 'games') return false;
      if (productCategoryFilter === 'tiktok' && p.category !== 'tiktok') return false;
      if (productCategoryFilter === 'facebook' && p.category !== 'facebook') return false;
    }
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
      p.packages.some((pkg) => pkg.name.toLowerCase().includes(q))
    );
  });

  // Filtered users for Users tab
  const filteredUsers = allUsers.filter((u) => {
    if (userStatusFilter !== 'all') {
      if (userStatusFilter === 'active' && u.status === 'banned') return false;
      if (userStatusFilter === 'banned' && u.status !== 'banned') return false;
    }
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-black border border-slate-300 text-xs font-bold uppercase tracking-wider">
              এডমিন কন্ট্রোল প্যানেল
            </span>
            <span className="text-xs text-slate-800 font-semibold">DC Top Up Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-black mt-1">
            ডিপোজিট, প্রোডাক্ট প্রাইসিং, হোম নোটিশ ও ব্যানার
          </h2>
          <p className="text-xs text-slate-800 mt-0.5 font-medium">
            প্রোডাক্ট স্টক আউট, নতুন ছবি ও প্যাকেজ যুক্ত করুন, এবং হোমপেজের নোটিশ ও ব্যানার নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs shadow-xs">
          <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <div>
            <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wide">
              {isAdmin ? 'এডমিন পারমিশন: সক্রিয় (role: admin)' : currentUser ? `অননুমোদিত (role: ${currentUser.role})` : 'লগইন করা নেই'}
            </span>
            <span className="font-extrabold text-black text-xs font-mono">
              UID: {currentUser ? `${currentUser.id.slice(0, 12)}...` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Security notice if logged-in user is not admin */}
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">
                এডমিন অ্যাকশন লকড: Firestore ক্লায়েন্ট SDK এক্সেস সীমিত
              </p>
              <p className="text-xs text-amber-900 mt-0.5">
                সরাসরি ব্রাউজার থেকে ডিপোজিট অ্যাপ্রুভ/রিজেক্ট এবং অর্ডার স্ট্যাটাস আপডেট করতে আপনার <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">users/{'{uid}'}</code> ডকুমেন্টে <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">role: "admin"</code> থাকতে হবে।
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-md bg-amber-200 text-amber-950 text-xs font-extrabold shrink-0">
            অ্যাকশন বোতামসমূহ নিষ্ক্রিয়
          </span>
        </div>
      )}

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Pending Deposits */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">পেন্ডিং ডিপোজিট</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-950 font-sans">{totalPendingDeposits} টি</p>
          <span className="text-[11px] text-amber-800 font-semibold block">যাচাইয়ের অপেক্ষায়</span>
        </div>

        {/* Stat 2: Today Approved Deposits */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">অনুমোদিত ডিপোজিট</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 font-sans">৳ {todayApprovedAmount.toFixed(0)}</p>
          <span className="text-[11px] text-emerald-800 font-semibold block">{approvedDeposits.length} টি সফল ট্রানজেকশন</span>
        </div>

        {/* Stat 3: Orders Completed */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">ডেলিভারড অর্ডার</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-950 font-sans">{totalCompletedOrders} টি</p>
          <span className="text-[11px] text-blue-800 font-semibold block">সরাসরি গেম আইডিতে ডেলিভারি</span>
        </div>

        {/* Stat 4: Active Products */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">মোট প্রোডাক্ট</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-extrabold text-black font-sans">{products.length} টি</p>
          <span className="text-[11px] text-slate-700 font-semibold block">
            {products.filter((p) => p.isOutOfStock).length} টি স্টক আউট
          </span>
        </div>
      </div>

      {/* Main Control Panel Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Navigation Tabs Header */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100 p-1.5 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            id="admin-tab-pending-btn"
            onClick={() => setCurrentAdminTab('pending_deposits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'pending_deposits'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>পেন্ডিং ডিপোজিট</span>
            {totalPendingDeposits > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {totalPendingDeposits}
              </span>
            )}
          </button>

          <button
            id="admin-tab-all-deposits-btn"
            onClick={() => setCurrentAdminTab('all_deposits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'all_deposits'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>সব ট্রানজেকশন ({deposits.length})</span>
          </button>

          <button
            id="admin-tab-products-btn"
            onClick={() => setCurrentAdminTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'products'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট ও প্রাইসিং ({products.length})</span>
          </button>

          <button
            id="admin-tab-notices-banners-btn"
            onClick={() => setCurrentAdminTab('notices_banners')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'notices_banners'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Site Content (নোটিশ ও ব্যানার) ({banners.length})</span>
          </button>

          <button
            id="admin-tab-orders-btn"
            onClick={() => setCurrentAdminTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'orders'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>গ্রাহক অর্ডার কিউ ({orders.length})</span>
          </button>

          <button
            id="admin-tab-users-btn"
            onClick={() => setCurrentAdminTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              currentAdminTab === 'users'
                ? 'bg-black text-white shadow-xs'
                : 'text-black hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users (ইউজার লিস্ট ও ব্যান) ({allUsers.length})</span>
          </button>
        </div>

        {/* Tab 1: Pending Deposits */}
        {currentAdminTab === 'pending_deposits' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>অপেক্ষমাণ ডিপোজিট ভেরিফিকেশন তালিকা</span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  গ্রাহকের TrxID ও প্রেরক নম্বর আপনার বিকাশ/নগদ স্টেটমেন্টের সাথে মিলিয়ে অ্যাপ্রুভ অথবা রিজেক্ট করুন।
                </p>
              </div>

              {isAdmin && (
                <button
                  id="admin-add-manual-deposit-btn-pending"
                  type="button"
                  onClick={() => {
                    setShowManualDepositModal(true);
                    setManualDepositUserId('');
                    setManualDepositAmount('100');
                    setUserDropdownSearch('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manual Deposit (সরাসরি জমা)</span>
                </button>
              )}
            </div>

            {pendingDeposits.length === 0 ? (
              <div className="p-10 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <p className="font-extrabold text-sm text-black">কোনো পেন্ডিং ডিপোজিট নেই!</p>
                <p className="text-xs text-slate-800 font-medium">
                  সব ট্রানজেকশন সফলভাবে যাচাই করা হয়েছে। নতুন কোনো রিকোয়েস্ট আসলে এখানে তালিকাভুক্ত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    id={`admin-pending-${dep.id}`}
                    className="p-4 rounded-xl bg-white border border-slate-300 hover:border-slate-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded text-white ${
                            dep.method === 'manual' || dep.type === 'manual' || dep.isManual
                              ? 'bg-purple-600'
                              : dep.method === 'refund' || dep.type === 'refund'
                              ? 'bg-rose-600'
                              : dep.method === 'bkash'
                              ? 'bg-[#D82365]'
                              : dep.method === 'nagad'
                              ? 'bg-[#F25822]'
                              : 'bg-[#8C3494]'
                          }`}
                        >
                          {dep.method === 'manual' || dep.type === 'manual' || dep.isManual
                            ? 'MANUAL'
                            : dep.method === 'refund' || dep.type === 'refund'
                            ? 'REFUND'
                            : dep.method}
                        </span>
                        <span className="font-mono font-extrabold text-sm text-black">{dep.id}</span>
                        <span className="text-xs text-slate-800 font-bold">({dep.userName})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="text-slate-700 font-bold">টাকার পরিমাণ: </span>
                          <span className="font-extrabold text-base text-black font-sans">
                            ৳ {dep.amount}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-700 font-bold">প্রেরক নম্বর: </span>
                          <span className="font-mono font-extrabold text-black">{dep.senderPhone}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700 font-bold">TrxID: </span>
                          <span className="font-mono font-extrabold text-black bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {dep.trxId}
                          </span>
                          <button
                            onClick={() => handleCopyTrx(dep.trxId)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-800 transition-colors cursor-pointer"
                            title="TrxID কপি করুন"
                          >
                            {copiedTrx === dep.trxId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div>
                          <span className="text-slate-700 font-bold">সময়: </span>
                          <span className="text-slate-800 font-semibold">{dep.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {isAdmin ? (
                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                        <button
                          id={`approve-btn-${dep.id}`}
                          disabled={processingDepositId === dep.id}
                          onClick={async () => {
                            if (processingDepositId) return;
                            setProcessingDepositId(dep.id);
                            try {
                              await approveDeposit(dep.id);
                            } finally {
                              setProcessingDepositId(null);
                            }
                          }}
                          className={`flex-1 md:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                            processingDepositId === dep.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          {processingDepositId === dep.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>{processingDepositId === dep.id ? 'অনুমোদন হচ্ছে...' : 'অ্যাপ্রুভ ও টাকা যোগ করুন'}</span>
                        </button>

                        <button
                          id={`reject-btn-${dep.id}`}
                          onClick={() => setRejectingDeposit(dep)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-300 hover:border-rose-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>অ্যাকশন লকড (role: admin প্রয়োজন)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Deposits */}
        {currentAdminTab === 'all_deposits' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="TrxID, নম্বর বা আইডি দিয়ে খুঁজুন..."
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black shadow-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setDepositFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                        depositFilterStatus === st
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'all'
                        ? 'সব'
                        : st === 'pending'
                        ? 'পেন্ডিং'
                        : st === 'approved'
                        ? 'অনুমোদিত'
                        : 'বাতিল'}
                    </button>
                  ))}
                </div>

                {isAdmin && (
                  <button
                    id="admin-add-manual-deposit-btn-all"
                    type="button"
                    onClick={() => {
                      setShowManualDepositModal(true);
                      setManualDepositUserId('');
                      setManualDepositAmount('100');
                      setUserDropdownSearch('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manual Deposit</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">আইডি ও গেটওয়ে</th>
                    <th className="p-3">গ্রাহক</th>
                    <th className="p-3">প্রেরক নম্বর</th>
                    <th className="p-3">TrxID</th>
                    <th className="p-3">টাকার পরিমাণ</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">তারিখ ও সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAllDeposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-black flex items-center gap-1.5">
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded text-white font-extrabold ${
                            dep.method === 'manual' || dep.type === 'manual' || dep.isManual
                              ? 'bg-purple-600'
                              : dep.method === 'refund' || dep.type === 'refund'
                              ? 'bg-rose-600'
                              : dep.method === 'bkash'
                              ? 'bg-[#D82365]'
                              : dep.method === 'nagad'
                              ? 'bg-[#F25822]'
                              : 'bg-[#8C3494]'
                          }`}
                        >
                          {dep.method === 'manual' || dep.type === 'manual' || dep.isManual
                            ? 'MANUAL'
                            : dep.method === 'refund' || dep.type === 'refund'
                            ? 'REFUND'
                            : dep.method}
                        </span>
                        <span>{dep.id}</span>
                      </td>
                      <td className="p-3 font-semibold text-black">{dep.userName}</td>
                      <td className="p-3 font-mono text-black font-semibold">{dep.senderPhone}</td>
                      <td className="p-3 font-mono font-bold text-black select-all">{dep.trxId}</td>
                      <td className="p-3 font-extrabold text-black font-sans">৳ {dep.amount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dep.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : dep.status === 'pending'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : 'bg-rose-100 text-rose-950 border border-rose-300'
                          }`}
                        >
                          {dep.status === 'approved'
                            ? 'Approved'
                            : dep.status === 'pending'
                            ? 'Pending'
                            : 'Rejected'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{dep.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {currentAdminTab === 'products' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-black flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>টপ-আপ প্রোডাক্ট, প্যাকেজ ও মূল্য তালিকা (Firestore)</span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  নতুন প্রোডাক্ট ও প্যাকেজ যোগ করুন, ছবি বা মূল্য পরিবর্তন করুন এবং স্টোর থেকে শো/হাইড নিয়ন্ত্রণ করুন।
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Seed / Sync Catalog Button */}
                {isAdmin && (
                  <button
                    id="admin-seed-products-btn"
                    onClick={async () => {
                      setIsSeedingProducts(true);
                      await seedProductsToFirestore();
                      setIsSeedingProducts(false);
                    }}
                    disabled={isSeedingProducts}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="প্রয়োজনে ডিফল্ট ক্যাটালগ Firestore-এ সিড করুন"
                  >
                    <Database className={`w-3.5 h-3.5 text-blue-600 ${isSeedingProducts ? 'animate-spin' : ''}`} />
                    <span>{isSeedingProducts ? 'Firestore-এ সিঙ্ক হচ্ছে...' : 'Firestore-এ সিঙ্ক করুন'}</span>
                  </button>
                )}

                {/* Add New Product Button */}
                <button
                  id="admin-add-product-btn"
                  onClick={() => {
                    if (!isAdmin) {
                      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট যোগ করতে পারেন।', 'error');
                      return;
                    }
                    setShowAddProductModal(true);
                  }}
                  disabled={!isAdmin}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    isAdmin
                      ? 'bg-black hover:bg-slate-800 text-white cursor-pointer transform active:scale-95'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রোডাক্ট যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="প্রোডাক্টের নাম বা প্যাকেজ দিয়ে খুঁজুন..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-black shadow-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'gaming', 'tiktok', 'facebook'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                      productCategoryFilter === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all'
                      ? 'সবগুলো'
                      : cat === 'gaming'
                      ? 'গেমিং'
                      : cat === 'tiktok'
                      ? 'টিকটক'
                      : 'ফেসবুক'}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAdminProducts.map((prod) => (
                <div
                  key={prod.id}
                  id={`admin-product-item-${prod.id}`}
                  className={`p-4 rounded-xl bg-white border transition-all space-y-3.5 shadow-xs ${
                    prod.isOutOfStock ? 'border-rose-300 bg-rose-50/20' : prod.isActive === false ? 'border-slate-300 bg-slate-50/60 opacity-90' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail & Image Change Trigger */}
                      <div className="relative group shrink-0">
                        <SafeImage
                          src={prod.bannerImageUrl || prod.image}
                          alt={prod.title}
                          title={prod.title}
                          category={prod.category}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-xs"
                        />
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingImageProduct(prod);
                              setCustomImageUrl(prod.bannerImageUrl || prod.image);
                            }}
                            className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-[9px] font-bold text-center"
                            title="ব্যানার ছবি পরিবর্তন করুন"
                          >
                            <ImageIcon className="w-3.5 h-3.5 mb-0.5" />
                            <span>ছবি পাল্টান</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm text-black">{prod.title}</h4>
                          {/* Badge tag */}
                          {(prod.badgeTag || prod.badge) && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-950 border border-amber-300">
                              {prod.badgeTag || prod.badge}
                            </span>
                          )}
                          {prod.isOutOfStock && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                              স্টক আউট
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-700">
                          <span className="font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                            {prod.category}
                          </span>
                          {prod.subCategory && (
                            <span className="text-slate-800 font-medium">({prod.subCategory})</span>
                          )}
                          {typeof prod.sortOrder === 'number' && (
                            <span className="text-[10px] text-slate-500 font-mono">#{prod.sortOrder}</span>
                          )}
                        </div>

                        {prod.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-1 max-w-xs">{prod.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Stock & Action Controls */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Product Active Toggle (Show/Hide from public page) */}
                      <button
                        onClick={() => toggleProductActive(prod.id)}
                        disabled={!isAdmin}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all flex items-center gap-1 ${
                          !isAdmin
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : prod.isActive !== false
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 cursor-pointer shadow-xs'
                            : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300 cursor-pointer'
                        }`}
                        title="পাবলিক পেজে প্রোডাক্টটি দেখান অথবা লুকান"
                      >
                        {prod.isActive !== false ? (
                          <Eye className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-slate-600" />
                        )}
                        <span>{prod.isActive !== false ? 'স্টোরে দৃশ্যমান' : 'লুকানো (Hidden)'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Edit Info Button */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingDetailsProduct(prod);
                              setEditTitle(prod.title);
                              setEditDescription(prod.description || '');
                              setEditBadgeTag(prod.badgeTag || prod.badge || '');
                              setEditSortOrder(typeof prod.sortOrder === 'number' ? prod.sortOrder : 1);
                              setEditCategory(prod.category);
                              setEditSubCategory(prod.subCategory || '');
                              setEditPlayerIdLabel(prod.playerIdLabel || 'Player ID (UID)');
                            }}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black flex items-center gap-1 cursor-pointer"
                            title="প্রোডাক্টের বিবরণ, নাম ও ট্যাগ পরিবর্তন করুন"
                          >
                            <Edit3 className="w-3 h-3 text-slate-700" />
                            <span>এডিট</span>
                          </button>
                        )}

                        {/* Change Image Button */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingImageProduct(prod);
                              setCustomImageUrl(prod.bannerImageUrl || prod.image);
                            }}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black flex items-center gap-1 cursor-pointer"
                            title="ব্যানার ছবি পরিবর্তন করুন"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>ছবি</span>
                          </button>
                        )}

                        {/* Stock Toggle Button */}
                        {isAdmin && (
                          <button
                            onClick={() => toggleProductStock(prod.id)}
                            className={`px-2 py-1 rounded text-[10px] font-extrabold border transition-all cursor-pointer flex items-center gap-1 ${
                              prod.isOutOfStock
                                ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                                : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                            }`}
                            title="স্টক আউট টগল করুন"
                          >
                            <span>{prod.isOutOfStock ? 'স্টক আউট' : 'ইন স্টক'}</span>
                          </button>
                        )}

                        {/* Delete Product */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি নিশ্চিতভাবে '${prod.title}' প্রোডাক্টটি মুছে ফেলতে চান?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="প্রোডাক্ট মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Packages Table inside Product */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">
                        প্যাকেজসমূহ ({prod.packages.length} টি):
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setAddingPackageToProduct(prod);
                            setNewPkgName('');
                            setNewPkgAmount('');
                            setNewPkgPrice('');
                          }}
                          className="text-[10px] text-emerald-800 font-extrabold hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        >
                          <Plus className="w-3 h-3" />
                          <span>প্যাকেজ যোগ করুন</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {prod.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                            pkg.isOutOfStock
                              ? 'bg-rose-50/50 border-rose-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-black font-bold">{pkg.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({pkg.amount || pkg.diamonds})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Package Stock Toggle */}
                            {isAdmin && (
                              <button
                                onClick={() => togglePackageStock(prod.id, pkg.id)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                                  pkg.isOutOfStock
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                }`}
                                title="প্যাকেজ স্টক আউট টগল করুন"
                              >
                                {pkg.isOutOfStock ? 'স্টক আউট' : 'স্টকে আছে'}
                              </button>
                            )}

                            {/* Price Display */}
                            <span className="font-extrabold text-black text-xs font-sans bg-white px-2 py-0.5 rounded border border-slate-200">
                              ৳ {pkg.price}
                            </span>

                            {/* Edit Package Button */}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingPackageProduct({ product: prod, package: pkg });
                                  setEditPkgName(pkg.name);
                                  setEditPkgAmount(pkg.amount || pkg.diamonds || '');
                                  setEditPkgPrice(String(pkg.price));
                                }}
                                className="p-1 rounded text-slate-600 hover:text-black hover:bg-slate-200 transition-colors cursor-pointer"
                                title="প্যাকেজ ও মূল্য এডিট করুন"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}

                            {/* Remove Package */}
                            {isAdmin && prod.packages.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি '${pkg.name}' প্যাকেজটি মুছে ফেলতে চান?`)) {
                                    const updatedPkgs = prod.packages.filter((p) => p.id !== pkg.id);
                                    updateProductPackages(prod.id, updatedPkgs);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="প্যাকেজ মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Notices & Banners Management */}
        {currentAdminTab === 'notices_banners' && (
          <div className="p-4 sm:p-5 space-y-8">
            {/* Section 1: Homepage Announcement Notice */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-rose-600" />
                    <span>হোমপেজ জরুরি নোটিশ / ঘোষণা পাঠানো অপশন</span>
                  </h3>
                  <p className="text-xs text-slate-800 font-medium">
                    গ্রাহকরা অ্যাপ ওপেন করার সাথে সাথে হোমপেজের শীর্ষে এই নোটিশটি দেখতে পাবেন।
                  </p>
                </div>

                {/* Notice Active Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">নোটিশ স্ট্যাটাস:</span>
                  <button
                    onClick={() => setNoticeDraftIsActive(!noticeDraftIsActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
                      noticeDraftIsActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${noticeDraftIsActive ? 'bg-white' : 'bg-slate-500'}`} />
                    <span>{noticeDraftIsActive ? 'সক্রিয় (অন)' : 'বন্ধ (অফ)'}</span>
                  </button>
                </div>
              </div>

              {/* Notice Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-black block">নোটিশের ধরন (Theme / Badge):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('urgent')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'urgent'
                        ? 'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>জরুরি নোটিশ 🚨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('offer')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'offer'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-2 ring-amber-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>স্পেশাল অফার 🔥</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('warning')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'warning'
                        ? 'bg-orange-50 border-orange-600 text-orange-950 ring-2 ring-orange-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>ওয়ার্নিং বার্তা ⚠️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeDraftType('info')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      noticeDraftType === 'info'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500'
                        : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                    }`}
                  >
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>অফিসিয়াল ঘোষণা 📢</span>
                  </button>
                </div>
              </div>

              {/* Notice Text & Date Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-extrabold text-black block">নোটিশ বার্তা (Text) *:</label>
                  <textarea
                    rows={3}
                    value={noticeDraftText}
                    onChange={(e) => setNoticeDraftText(e.target.value)}
                    placeholder="যেমন: ফ্রাইডে স্পেশাল অফারে ১০০% বোনাস ডায়মন্ড চালু হয়েছে! বিকাশ ও নগদে দ্রুত রিচার্জ করুন।"
                    className="w-full bg-white border border-slate-300 focus:border-black rounded-xl p-3 text-sm text-black shadow-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-black block mb-1">নোটিশের তারিখ (Date):</label>
                    <input
                      type="text"
                      value={noticeDraftDate}
                      onChange={(e) => setNoticeDraftDate(e.target.value)}
                      placeholder="যেমন: ১ অক্টোবর, ২০২৬"
                      className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-3 py-2 text-xs text-black shadow-xs font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    গ্রাহকরা হোমপেজের শীর্ষে নোটিশের সাথে এই তারিখটি দেখতে পাবেন।
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-xl bg-white border border-slate-300 space-y-1.5 shadow-xs">
                <span className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                  হোমপেজে যেভাবে দেখা যাবে (Live Preview):
                </span>
                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    noticeDraftType === 'urgent'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : noticeDraftType === 'offer'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : noticeDraftType === 'warning'
                      ? 'bg-orange-50 border-orange-300 text-orange-950'
                      : 'bg-blue-50 border-blue-300 text-blue-950'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      noticeDraftType === 'urgent'
                        ? 'bg-rose-600 text-white'
                        : noticeDraftType === 'offer'
                        ? 'bg-amber-500 text-black'
                        : noticeDraftType === 'warning'
                        ? 'bg-orange-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/10">
                        {noticeDraftType === 'urgent'
                          ? 'জরুরি নোটিশ 🚨'
                          : noticeDraftType === 'offer'
                          ? 'স্পেশাল অফার 🔥'
                          : noticeDraftType === 'warning'
                          ? 'ওয়ার্নিং বার্তা ⚠️'
                          : 'অফিসিয়াল ঘোষণা 📢'}
                      </span>
                      {noticeDraftDate && (
                        <span className="text-[10px] text-slate-600 font-mono font-bold">
                          {noticeDraftDate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-bold mt-0.5">
                      {noticeDraftText || 'নোটিশের লেখা এখানে প্রদর্শিত হবে...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Notice Button */}
              <button
                onClick={() => {
                  updateNotice({
                    text: noticeDraftText,
                    date: noticeDraftDate,
                    type: noticeDraftType,
                    isActive: noticeDraftIsActive
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>নোটিশ সেভ ও প্রকাশ করুন</span>
              </button>
            </div>

            {/* Section 2: Promotional Banners Manager */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>হোমপেজ ব্যানার ম্যানেজমেন্ট (Hero Slider Banners)</span>
                  </h3>
                  <p className="text-xs text-slate-800 font-medium">
                    হোমপেজের স্লাইডারে প্রদর্শিত প্রমোশনাল ব্যানার যোগ, সচল/বন্ধ অথবা রিমুভ করুন।
                  </p>
                </div>

                <button
                  id="admin-add-banner-btn"
                  onClick={() => setShowAddBannerModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ব্যানার যোগ করুন</span>
                </button>
              </div>

              {/* Banners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-4 bg-white space-y-3 shadow-xs transition-all ${
                      b.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Visual Banner Preview Card */}
                    <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                      <SafeImage
                        src={b.imageUrl}
                        alt={b.title}
                        title={b.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent p-3 flex flex-col justify-between text-white">
                        <div>
                          {b.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase">
                              {b.badge}
                            </span>
                          )}
                          <h4 className="font-extrabold text-sm text-white mt-1 line-clamp-1">
                            {b.title}
                          </h4>
                          {b.subtitle && (
                            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                              {b.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-extrabold flex items-center gap-1">
                            <span>{b.actionText || 'বাটন'}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Banner Info Details */}
                    <div className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-black">ছবি (Image URL): </span>
                        <span className="font-mono text-slate-600 truncate block text-[10px]">{b.imageUrl}</span>
                      </div>
                      {b.linkUrl && (
                        <div>
                          <span className="font-bold text-black">লিংক (Link URL): </span>
                          <span className="font-mono text-blue-700 truncate block text-[10px]">{b.linkUrl}</span>
                        </div>
                      )}
                    </div>

                    {/* Banner Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-200">
                      <div className="flex items-center gap-1.5">
                        {/* Reorder Buttons */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => reorderBanners(idx, idx - 1)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="উপরে নিন (Move Up)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === banners.length - 1}
                          onClick={() => reorderBanners(idx, idx + 1)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="নিচে নিন (Move Down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => updateBanner({ ...b, isActive: !b.isActive })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            b.isActive
                              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {b.isActive ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBanner(b);
                            setEditBannerTitle(b.title);
                            setEditBannerSubtitle(b.subtitle || '');
                            setEditBannerImageUrl(b.imageUrl);
                            setEditBannerLinkUrl(b.linkUrl || '');
                            setEditBannerActionText(b.actionText || 'টাকা যোগ করুন');
                            setEditBannerActionTab(b.actionTab || 'deposit');
                            setEditBannerBadge(b.badge || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>এডিট</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি '${b.title}' ব্যানারটি রিমুভ করতে চান?`)) {
                              deleteBanner(b.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Orders Queue */}
        {currentAdminTab === 'orders' && (
          <div className="p-4 sm:p-5 space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-black flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>গ্রাহক টপ-আপ ডেলিভারি ও প্রসেসিং কিউ</span>
            </h3>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-black text-sm">{ord.id}</span>
                      <span className="font-extrabold text-black">{ord.productTitle}</span>
                      <span className="text-slate-800 font-semibold">({ord.packageName})</span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 text-slate-700 font-medium">
                      <span>গ্রাহক: <strong className="text-black">{ord.userName}</strong></span>
                      <span>UID: <strong className="font-mono text-black font-extrabold">{ord.playerId}</strong></span>
                      <span>মূল্য: <strong className="text-black font-sans font-extrabold">৳ {ord.price}</strong></span>
                      <span>সময়: {cleanDisplayTimestamp(ord.createdAt)}</span>
                    </div>
                  </div>

                  {/* Order Status & Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    {isAdmin ? (
                      <>
                        {ord.status === 'pending' && (
                          <>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                              Pending
                            </span>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'processing', 'এডমিন থেকে প্রসেসিং কিউতে পাঠানো হয়েছে।')}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Processing এ দিন</span>
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'delivered', 'এডমিন দ্বারা সরাসরি ডেলিভারি সম্পন্ন।')}
                              className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered</span>
                            </button>
                            <button
                              onClick={() => {
                                setCancellingOrder(ord);
                                setCancelOrderReason('স্টক স্বল্পতা বা ইন-গেম সার্ভার সংযোগ ব্যর্থতার কারণে অর্ডারটি বাতিল ও ওয়ালেটে মূল্য রিফান্ড করা হলো।');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                              title="অর্ডার বাতিল ও রিফান্ড"
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>বাতিল ও রিফান্ড</span>
                            </button>
                          </>
                        )}

                        {ord.status === 'processing' && (
                          <>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300">
                              Processing
                            </span>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'delivered', 'সরাসরি গেটওয়ে দিয়ে ডেলিভারি সম্পন্ন।')}
                              className="px-3 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered করুন</span>
                            </button>
                            <button
                              onClick={() => {
                                setCancellingOrder(ord);
                                setCancelOrderReason('প্রসেসিং সমস্যাজনিত কারণে অর্ডারটি বাতিল ও ওয়ালেটে মূল্য রিফান্ড করা হলো।');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                              title="অর্ডার বাতিল ও রিফান্ড"
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>বাতিল ও রিফান্ড</span>
                            </button>
                          </>
                        )}

                        {ord.status === 'delivered' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Delivered সম্পন্ন</span>
                          </span>
                        )}

                        {(ord.status === 'rejected' || ord.status === 'cancelled') && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-700" />
                            <span>বাতিল ও রিফান্ডেড (৳ {ord.price})</span>
                          </span>
                        )}

                        <button
                          id={`admin-delete-order-${ord.id}`}
                          onClick={() => {
                            if (window.confirm(`আপনি কি নিশ্চিতভাবে অর্ডার #${ord.id} (${ord.productTitle}) মুছে ফেলতে চান? এটি ডাটাবেজ থেকে স্থায়ীভাবে মুছে যাবে।`)) {
                              deleteOrder(ord.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer shadow-xs ml-1"
                          title="অর্ডার রেকর্ড মুছুন (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>{ord.status.toUpperCase()} (লকড)</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Users List & Account Ban Management */}
        {currentAdminTab === 'users' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-black flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>নিবন্ধিত ব্যবহারকারী তালিকা ও একাউন্ট ব্যান কন্ট্রোল</span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  Firestore 'users' কালেকশনের সকল ইউজার তালিকা। এখান থেকে ইউজারকে সক্রিয় বা ব্যান করতে পারবেন।
                </p>
              </div>

              {/* Status summary badges */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
                  মোট: <strong>{allUsers.length}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950">
                  সক্রিয়: <strong>{allUsers.filter((u) => u.status !== 'banned').length}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-rose-950">
                  স্থগিত (Banned): <strong>{allUsers.filter((u) => u.status === 'banned').length}</strong>
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ইউজার খুঁজুন (নাম, ইমেইল, ফোন বা UID)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setUserStatusFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    userStatusFilter === 'all'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  সব ({allUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserStatusFilter('active')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    userStatusFilter === 'active'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  সক্রিয় ({allUsers.filter((u) => u.status !== 'banned').length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserStatusFilter('banned')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    userStatusFilter === 'banned'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  ব্যান ({allUsers.filter((u) => u.status === 'banned').length})
                </button>
              </div>
            </div>

            {/* Users Cards / Table */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs">
                  কোনো ইউজার পাওয়া যায়নি।
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isBanned = u.status === 'banned';
                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs transition-all ${
                        isBanned ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-black">{u.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isBanned
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            }`}
                          >
                            {isBanned ? 'স্থগিত (Banned)' : 'সক্রিয় (Active)'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {u.role === 'admin' ? 'এডমিন (Admin)' : 'গ্রাহক'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 font-medium">
                          <span>ইমেইল: <strong className="text-black">{u.email || 'N/A'}</strong></span>
                          <span>মোবাইল: <strong className="text-black">{u.phone || 'N/A'}</strong></span>
                          <span>
                            UID:{' '}
                            <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-black text-[11px]">
                              {u.id}
                            </code>
                          </span>
                          <span>যোগদান: <strong className="text-black">{u.joinedAt || '২০২৬'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 justify-between md:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-600 block font-bold">ওয়ালেট ব্যালেন্স</span>
                          <span className="text-base font-extrabold text-black font-sans">
                            ৳ {typeof u.walletBalance === 'number' ? u.walletBalance.toFixed(2) : '0.00'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Ban / Unban Toggle Button */}
                          {isBanned ? (
                            <button
                              type="button"
                              onClick={() => toggleUserBan(u.id, 'active')}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>আনব্যান করুন (Unban)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleUserBan(u.id, 'banned')}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>ব্যান করুন (Ban)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Deposit Modal */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-sm text-black">ডিপোজিট রিজেক্ট নিশ্চিতকরণ</h3>
            </div>

            <p className="text-xs text-slate-800 font-medium">
              আইডি: <strong className="font-mono text-black">{rejectingDeposit.id}</strong> | পরিমাণ:{' '}
              <strong className="text-black font-sans font-extrabold">৳ {rejectingDeposit.amount}</strong>
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-800 font-bold block">রিজেক্ট করার কারণ:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-black shadow-xs focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
              >
                নিশ্চিত রিজেক্ট করুন
              </button>
              <button
                onClick={() => setRejectingDeposit(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Image Changer Modal */}
      {editingImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-black">
                  প্রোডাক্ট ছবি পরিবর্তন করুন ({editingImageProduct.title})
                </h3>
              </div>
              <button
                onClick={() => setEditingImageProduct(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            {/* Live Preview */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={customImageUrl || editingImageProduct.image}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border border-slate-300 shadow-xs"
              />
              <div className="text-xs space-y-1">
                <span className="font-extrabold text-black block">বর্তমান প্রিভিউ</span>
                <span className="text-slate-600 break-all text-[11px] block line-clamp-2">
                  {customImageUrl || editingImageProduct.image}
                </span>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-800 font-bold block">কাস্টম ইমেজ লিংক (URL):</label>
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs text-xs"
              />
            </div>

            {/* Preset Images Gallery */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-800 font-bold block">
                অথবা প্রস্তুতকৃত আর্টওয়ার্ক থেকে ১-ক্লিকে নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomImageUrl(preset.url)}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      customImageUrl === preset.url
                        ? 'border-black bg-white ring-2 ring-black'
                        : 'border-slate-300 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <SafeImage
                      src={preset.url}
                      alt={preset.label}
                      className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                    />
                    <span className="text-[10px] font-bold text-black truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!customImageUrl) {
                    showToast('অনুগ্রহ করে সঠিক ছবির লিংক দিন বা প্রিসেট বেছে নিন।', 'error');
                    return;
                  }
                  updateProductImage(editingImageProduct.id, customImageUrl);
                  setEditingImageProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                ছবি সেভ করুন
              </button>
              <button
                onClick={() => setEditingImageProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Package to Existing Product Modal */}
      {addingPackageToProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>নতুন প্যাকেজ যোগ ({addingPackageToProduct.title})</span>
              </h3>
              <button
                onClick={() => setAddingPackageToProduct(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">প্যাকেজের নাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: 530 Diamonds বা 300 UC"
                  value={newPkgName}
                  onChange={(e) => setNewPkgName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">অ্যামাউন্ট ও আইকন</label>
                <input
                  type="text"
                  placeholder="যেমন: 530 💎 বা 300 🪙"
                  value={newPkgAmount}
                  onChange={(e) => setNewPkgAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">বিক্রয়মূল্য (৳) *</label>
                <input
                  type="number"
                  placeholder="যেমন: 380"
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-sans shadow-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  const price = parseFloat(newPkgPrice);
                  if (!newPkgName || isNaN(price) || price <= 0) {
                    showToast('সঠিক প্যাকেজ নাম ও মূল্য প্রদান করুন।', 'error');
                    return;
                  }
                  const newPkg: TopUpPackage = {
                    id: 'pkg_' + Date.now(),
                    name: newPkgName.trim(),
                    amount: newPkgAmount.trim() || newPkgName.trim(),
                    diamonds: newPkgAmount.trim() || newPkgName.trim(),
                    price: price,
                    instantDelivery: true
                  };
                  await updateProductPackages(addingPackageToProduct.id, [
                    ...addingPackageToProduct.packages,
                    newPkg
                  ]);
                  setAddingPackageToProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                প্যাকেজ যুক্ত করুন
              </button>
              <button
                onClick={() => setAddingPackageToProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {editingPackageProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-sm text-black flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>প্যাকেজ ও মূল্য পরিবর্তন ({editingPackageProduct.product.title})</span>
              </h3>
              <button
                onClick={() => setEditingPackageProduct(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">প্যাকেজের নাম *</label>
                <input
                  type="text"
                  value={editPkgName}
                  onChange={(e) => setEditPkgName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">ডায়মন্ড / অ্যামাউন্ট ট্যাগ</label>
                <input
                  type="text"
                  value={editPkgAmount}
                  onChange={(e) => setEditPkgAmount(e.target.value)}
                  placeholder="যেমন: 115 💎"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">বিক্রয়মূল্য (৳) *</label>
                <input
                  type="number"
                  value={editPkgPrice}
                  onChange={(e) => setEditPkgPrice(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-sans font-bold shadow-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  const price = parseFloat(editPkgPrice);
                  if (!editPkgName || isNaN(price) || price <= 0) {
                    showToast('সঠিক প্যাকেজ নাম ও মূল্য প্রদান করুন।', 'error');
                    return;
                  }
                  const updatedPkgs = editingPackageProduct.product.packages.map((p) =>
                    p.id === editingPackageProduct.package.id
                      ? {
                          ...p,
                          name: editPkgName.trim(),
                          amount: editPkgAmount.trim() || editPkgName.trim(),
                          diamonds: editPkgAmount.trim() || editPkgName.trim(),
                          price: price
                        }
                      : p
                  );
                  await updateProductPackages(editingPackageProduct.product.id, updatedPkgs);
                  setEditingPackageProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                আপডেট সেভ করুন
              </button>
              <button
                onClick={() => setEditingPackageProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Full Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>নতুন টপ-আপ প্রোডাক্ট যোগ করুন</span>
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">প্রোডাক্টের নাম (Title) *</label>
                <input
                  type="text"
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  placeholder="যেমন: FC Mobile Points বা Friday offer"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-bold"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">প্রোডাক্টের বিবরণ (Description) *</label>
                <textarea
                  rows={2}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="যেমন: বাংলাদেশ সার্ভারের জন্য অফিসিয়াল টপ-আপ। দ্রুত ও নিরাপদ ডেলিভারি।"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ব্যাজ ট্যাগ (badgeTag) *</label>
                  <input
                    type="text"
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    placeholder="যেমন: Special Offer, BD Server ইত্যাদি"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">সর্ট অর্ডার (sortOrder)</label>
                  <input
                    type="number"
                    value={newProductSortOrder}
                    onChange={(e) => setNewProductSortOrder(parseInt(e.target.value) || 1)}
                    placeholder="1, 2, 3..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-sans font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ক্যাটেগরি *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e: any) => setNewProductCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-semibold"
                  >
                    <option value="gaming">গেম অফার ও মেম্বারশিপ (Gaming)</option>
                    <option value="tiktok">টিকটক সার্ভিস (TikTok)</option>
                    <option value="facebook">ফেসবুক সার্ভিস (Facebook)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">প্লেয়ার আইডি লেবেল *</label>
                  <input
                    type="text"
                    value={newProductPlayerIdLabel}
                    onChange={(e) => setNewProductPlayerIdLabel(e.target.value)}
                    placeholder="Player ID (UID)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-mono"
                  />
                </div>
              </div>

              {/* Image Selection with Presets */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">ব্যানার ছবির লিংক (bannerImageUrl) *</span>
                  <img
                    src={newProductImageUrl}
                    alt="Preview"
                    className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/dc_logo.jpg'; }}
                  />
                </div>
                <input
                  type="text"
                  value={newProductImageUrl}
                  onChange={(e) => setNewProductImageUrl(e.target.value)}
                  placeholder="ছবির লিঙ্ক (URL পেস্ট করুন)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-black"
                />

                <span className="text-[10px] text-slate-700 font-bold block">বা প্রস্তুতকৃত ছবি থেকে বেছে নিন:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_PRODUCT_IMAGES.slice(0, 8).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProductImageUrl(p.url)}
                      className={`shrink-0 p-1 rounded-lg border flex items-center gap-1 cursor-pointer ${
                        newProductImageUrl === p.url ? 'border-black bg-white ring-1 ring-black' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-5 h-5 rounded object-cover" />
                      <span className="text-[9px] font-bold text-black">{p.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Starter Packages Builder */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">প্যাকেজসমূহ ও বিক্রয়মূল্য (packages)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPackageList([
                        ...newPackageList,
                        { name: 'প্যাকেজ নাম', amount: '100 Credits', price: 150, popular: false }
                      ]);
                    }}
                    className="text-[10px] text-emerald-800 font-extrabold hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-300"
                  >
                    <Plus className="w-3 h-3" />
                    <span>প্যাকেজ যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newPackageList.map((pkg, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-lg border border-slate-200">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="প্যাকেজ নাম"
                          value={pkg.name}
                          onChange={(e) => {
                            const updated = [...newPackageList];
                            updated[idx].name = e.target.value;
                            setNewPackageList(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-black font-semibold text-xs"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="অ্যামাউন্ট / ডায়মন্ড"
                          value={pkg.amount}
                          onChange={(e) => {
                            const updated = [...newPackageList];
                            updated[idx].amount = e.target.value;
                            setNewPackageList(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-black text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="মূল্য ৳"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...newPackageList];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setNewPackageList(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-black font-sans font-bold text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        {newPackageList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewPackageList(newPackageList.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!newProductTitle.trim()) {
                    showToast('প্রোডাক্টের নাম লিখুন।', 'error');
                    return;
                  }
                  const newProd: TopUpProduct = {
                    id: 'prod_' + Date.now(),
                    title: newProductTitle.trim(),
                    category: newProductCategory,
                    subCategory: newProductSubCategory.trim() || 'Special Offer',
                    badge: newProductBadge.trim() || 'Special Offer',
                    badgeTag: newProductBadge.trim() || 'Special Offer',
                    description: newProductDescription.trim() || `${newProductTitle.trim()} সরাসরি ${newProductPlayerIdLabel} দিয়ে দ্রুত টপ-আপ করুন।`,
                    playerIdLabel: newProductPlayerIdLabel.trim() || 'Player ID (UID)',
                    image: newProductImageUrl.trim() || '/images/ff_friday_offer_1790099054219.jpg',
                    bannerImageUrl: newProductImageUrl.trim() || '/images/ff_friday_offer_1790099054219.jpg',
                    bannerGradient: 'from-blue-600/30 to-purple-950/60',
                    isActive: true,
                    sortOrder: Number(newProductSortOrder) || (products.length + 1),
                    isOutOfStock: false,
                    packages: newPackageList.map((p, i) => ({
                      id: 'pkg_' + Date.now() + '_' + i,
                      name: p.name.trim(),
                      amount: p.amount.trim() || p.name.trim(),
                      diamonds: p.amount.trim() || p.name.trim(),
                      price: Number(p.price) || 0,
                      popular: p.popular,
                      instantDelivery: true
                    }))
                  };
                  addProduct(newProd);
                  setShowAddProductModal(false);
                  setNewProductTitle('');
                  setNewProductDescription('');
                  setNewProductBadge('Special Offer');
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                প্রোডাক্ট পাবলিশ করুন
              </button>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Existing Product Details Modal */}
      {editingDetailsProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>প্রোডাক্ট বিবরণ এডিট করুন ({editingDetailsProduct.title})</span>
              </h3>
              <button
                onClick={() => setEditingDetailsProduct(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">প্রোডাক্টের নাম (Title) *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-bold"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">প্রোডাক্টের বিবরণ (Description) *</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ব্যাজ ট্যাগ (badgeTag) *</label>
                  <input
                    type="text"
                    value={editBadgeTag}
                    onChange={(e) => setEditBadgeTag(e.target.value)}
                    placeholder="Special Offer"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">সর্ট অর্ডার (sortOrder)</label>
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-sans font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ক্যাটেগরি *</label>
                  <select
                    value={editCategory}
                    onChange={(e: any) => setEditCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-semibold"
                  >
                    <option value="gaming">গেম অফার ও মেম্বারশিপ (Gaming)</option>
                    <option value="tiktok">টিকটক সার্ভিস (TikTok)</option>
                    <option value="facebook">ফেসবুক সার্ভিস (Facebook)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">প্লেয়ার আইডি লেবেল</label>
                  <input
                    type="text"
                    value={editPlayerIdLabel}
                    onChange={(e) => setEditPlayerIdLabel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => {
                  if (!editTitle.trim()) {
                    showToast('প্রোডাক্টের নাম দেওয়া আবশ্যক।', 'error');
                    return;
                  }
                  await updateProduct({
                    ...editingDetailsProduct,
                    title: editTitle.trim(),
                    description: editDescription.trim(),
                    badgeTag: editBadgeTag.trim() || 'Special Offer',
                    badge: editBadgeTag.trim() || 'Special Offer',
                    sortOrder: Number(editSortOrder) || 1,
                    category: editCategory,
                    subCategory: editSubCategory.trim() || editingDetailsProduct.subCategory,
                    playerIdLabel: editPlayerIdLabel.trim() || 'Player ID (UID)'
                  });
                  setEditingDetailsProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                আপডেট সেভ করুন
              </button>
              <button
                onClick={() => setEditingDetailsProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Banner Modal */}
      {showAddBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>নতুন হোমপেজ ব্যানার যোগ করুন</span>
              </h3>
              <button
                onClick={() => setShowAddBannerModal(false)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">ব্যানার শিরোনাম (Title) *</label>
                <input
                  type="text"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="যেমন: শুক্রবারের স্পেশাল ডাবল ডায়মন্ড অফার 🔥"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-bold shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">সাবটাইটেল / বিবরণ</label>
                <input
                  type="text"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  placeholder="যেমন: আজকের ডিপোজিটে বিকাশ ও নগদে পাচ্ছেন অতিরিক্ত ছাড় ও ইনস্ট্যান্ট ডেলিভারি।"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ব্যাজ ট্যাগ</label>
                  <input
                    type="text"
                    value={newBannerBadge}
                    onChange={(e) => setNewBannerBadge(e.target.value)}
                    placeholder="ফ্রাইডে স্পেশাল"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">বাটন অ্যাকশন</label>
                  <select
                    value={newBannerActionTab}
                    onChange={(e: any) => setNewBannerActionTab(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-semibold shadow-xs"
                  >
                    <option value="deposit">ডিপোজিট পেজে যাবে (টাকা যোগ)</option>
                    <option value="orders">অর্ডার কিউতে যাবে</option>
                    <option value="home">হোম প্রোডাক্টে স্ক্রল করবে</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">বাটন টেক্সট</label>
                <input
                  type="text"
                  value={newBannerActionText}
                  onChange={(e) => setNewBannerActionText(e.target.value)}
                  placeholder="টাকা যোগ করুন"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">ঐচ্ছিক লিংক (Link URL)</label>
                <input
                  type="text"
                  value={newBannerLinkUrl}
                  onChange={(e) => setNewBannerLinkUrl(e.target.value)}
                  placeholder="যেমন: https://... অথবা খালি রাখুন"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-mono"
                />
              </div>

              {/* Banner Image with Presets */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">ব্যানার ব্যাকগ্রাউন্ড ছবি</span>
                  <img
                    src={newBannerImageUrl}
                    alt="Preview"
                    className="w-12 h-7 rounded object-cover border border-slate-300"
                  />
                </div>
                <input
                  type="text"
                  value={newBannerImageUrl}
                  onChange={(e) => setNewBannerImageUrl(e.target.value)}
                  placeholder="ছবির লিংক (URL)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-black"
                />

                <span className="text-[10px] text-slate-700 font-bold block">বা ছবি নির্বাচন করুন:</span>
                <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto">
                  {PRESET_PRODUCT_IMAGES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewBannerImageUrl(p.url)}
                      className={`p-1 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer ${
                        newBannerImageUrl === p.url ? 'border-black bg-white ring-1 ring-black' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="text-[9px] font-bold text-black truncate">{p.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!newBannerTitle) {
                    showToast('ব্যানারের শিরোনাম প্রদান করুন।', 'error');
                    return;
                  }
                  const banner: HomeBanner = {
                    id: 'banner_' + Date.now(),
                    title: newBannerTitle,
                    subtitle: newBannerSubtitle,
                    badge: newBannerBadge || 'স্পেশাল অফার',
                    imageUrl: newBannerImageUrl || '/src/assets/images/ff_friday_offer_1790099054219.jpg',
                    linkUrl: newBannerLinkUrl.trim(),
                    actionTab: newBannerActionTab,
                    actionText: newBannerActionText || 'বিস্তারিত দেখুন',
                    isActive: true
                  };
                  addBanner(banner);
                  setShowAddBannerModal(false);
                  setNewBannerTitle('');
                  setNewBannerSubtitle('');
                  setNewBannerLinkUrl('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                ব্যানার প্রকাশ করুন
              </button>
              <button
                onClick={() => setShowAddBannerModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Existing Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>হোমপেজ ব্যানার সম্পাদনা (Edit Banner)</span>
              </h3>
              <button
                onClick={() => setEditingBanner(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">ব্যানার শিরোনাম (Title) *</label>
                <input
                  type="text"
                  value={editBannerTitle}
                  onChange={(e) => setEditBannerTitle(e.target.value)}
                  placeholder="ব্যানার শিরোনাম"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-bold shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">সাবটাইটেল / বিবরণ</label>
                <input
                  type="text"
                  value={editBannerSubtitle}
                  onChange={(e) => setEditBannerSubtitle(e.target.value)}
                  placeholder="ব্যানার সাবটাইটেল"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">ব্যাজ ট্যাগ</label>
                  <input
                    type="text"
                    value={editBannerBadge}
                    onChange={(e) => setEditBannerBadge(e.target.value)}
                    placeholder="যেমন: স্পেশাল অফার"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">বাটন অ্যাকশন</label>
                  <select
                    value={editBannerActionTab}
                    onChange={(e: any) => setEditBannerActionTab(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black font-semibold shadow-xs"
                  >
                    <option value="deposit">ডিপোজিট পেজে যাবে (টাকা যোগ)</option>
                    <option value="orders">অর্ডার কিউতে যাবে</option>
                    <option value="home">হোম প্রোডাক্টে স্ক্রল করবে</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">বাটন টেক্সট</label>
                <input
                  type="text"
                  value={editBannerActionText}
                  onChange={(e) => setEditBannerActionText(e.target.value)}
                  placeholder="যেমন: টাকা যোগ করুন"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">ঐচ্ছিক লিংক (Link URL)</label>
                <input
                  type="text"
                  value={editBannerLinkUrl}
                  onChange={(e) => setEditBannerLinkUrl(e.target.value)}
                  placeholder="যেমন: https://... অথবা খালি রাখুন"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-black shadow-xs font-mono"
                />
              </div>

              {/* Banner Image with Presets */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-black block">ব্যানার ব্যাকগ্রাউন্ড ছবি</span>
                  <img
                    src={editBannerImageUrl || '/dc_logo.jpg'}
                    alt="Preview"
                    className="w-12 h-7 rounded object-cover border border-slate-300"
                  />
                </div>
                <input
                  type="text"
                  value={editBannerImageUrl}
                  onChange={(e) => setEditBannerImageUrl(e.target.value)}
                  placeholder="ছবির লিংক (URL)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-black"
                />

                <span className="text-[10px] text-slate-700 font-bold block">বা প্রিসেট ছবি নির্বাচন করুন:</span>
                <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto">
                  {PRESET_PRODUCT_IMAGES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditBannerImageUrl(p.url)}
                      className={`p-1 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer ${
                        editBannerImageUrl === p.url ? 'border-black bg-white ring-1 ring-black' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <img src={p.url} alt="" className="w-6 h-6 rounded object-cover" />
                      <span className="text-[9px] font-bold text-black truncate">{p.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!editBannerTitle) {
                    showToast('ব্যানারের শিরোনাম প্রদান করুন।', 'error');
                    return;
                  }
                  updateBanner({
                    ...editingBanner,
                    title: editBannerTitle,
                    subtitle: editBannerSubtitle,
                    badge: editBannerBadge,
                    imageUrl: editBannerImageUrl || editingBanner.imageUrl,
                    linkUrl: editBannerLinkUrl.trim(),
                    actionText: editBannerActionText,
                    actionTab: editBannerActionTab
                  });
                  setEditingBanner(null);
                  showToast('ব্যানার সফলভাবে আপডেট করা হয়েছে!', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-xs"
              >
                পরিবর্তন সংরক্ষণ করুন
              </button>
              <button
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Deposit Modal */}
      {showManualDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-black flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-600" />
                <span>ম্যানুয়াল ডিপোজিট যোগ করুন (Add Manual Deposit)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowManualDepositModal(false);
                  setManualDepositUserId('');
                  setUserDropdownSearch('');
                }}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* User Search & Selection */}
              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold block">
                  ইউজার খুঁজুন (ইমেইল / নাম / ফোন নম্বর) *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userDropdownSearch}
                    onChange={(e) => {
                      setUserDropdownSearch(e.target.value);
                      if (!e.target.value) setManualDepositUserId('');
                    }}
                    placeholder="ইউজারের ইমেইল বা নাম লিখুন..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-black"
                  />
                </div>

                {/* Filtered user matches dropdown list */}
                {userDropdownSearch && (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/70 divide-y divide-slate-100 mt-1">
                    {allUsers
                      .filter((u) => {
                        const q = userDropdownSearch.toLowerCase();
                        return (
                          (u.email && u.email.toLowerCase().includes(q)) ||
                          u.name.toLowerCase().includes(q) ||
                          u.phone.includes(q) ||
                          u.id.toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 8)
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setManualDepositUserId(u.id);
                            setUserDropdownSearch(u.email || u.name);
                          }}
                          className={`w-full text-left p-2 hover:bg-white flex items-center justify-between transition-colors cursor-pointer ${
                            manualDepositUserId === u.id ? 'bg-purple-50 text-purple-950 font-bold' : 'text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="font-extrabold text-black">{u.name}</div>
                            <div className="text-[10px] text-slate-500">{u.email || u.phone}</div>
                          </div>
                          <span className="text-[11px] font-sans font-extrabold text-black">
                            ৳ {typeof u.walletBalance === 'number' ? u.walletBalance.toFixed(2) : '0.00'}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Selected User Info Card */}
              {(() => {
                const targetU = allUsers.find(
                  (u) => u.id === manualDepositUserId || (u.email && u.email.toLowerCase() === userDropdownSearch.toLowerCase().trim())
                );
                if (!targetU) return null;
                const depositNum = parseFloat(manualDepositAmount) || 0;
                const newBal = (targetU.walletBalance || 0) + depositNum;

                return (
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950">নির্বাচিত গ্রাহক:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                        {targetU.status === 'banned' ? 'স্থগিত (Banned)' : 'সক্রিয়'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>নাম: <strong className="text-black">{targetU.name}</strong></div>
                      <div>ইমেইল: <strong className="text-black">{targetU.email || 'N/A'}</strong></div>
                      <div>বর্তমান ব্যালেন্স: <strong className="text-black font-sans">৳ {targetU.walletBalance.toFixed(2)}</strong></div>
                      <div>জমার পর ব্যালেন্স: <strong className="text-emerald-700 font-sans font-extrabold">৳ {newBal.toFixed(2)}</strong></div>
                    </div>
                  </div>
                );
              })()}

              {/* Deposit Amount Input & Presets */}
              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold block">
                  জমার পরিমাণ (Amount in BDT) *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setManualDepositAmount(amt.toString())}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        manualDepositAmount === amt.toString()
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                      }`}
                    >
                      ৳ {amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                  <input
                    type="number"
                    min="1"
                    value={manualDepositAmount}
                    onChange={(e) => setManualDepositAmount(e.target.value)}
                    placeholder="যেমন: ১০০"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs text-black font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Note / Reason */}
              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold block">
                  রেফারেন্স / নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={manualDepositNote}
                  onChange={(e) => setManualDepositNote(e.target.value)}
                  placeholder="যেমন: সরাসরি নগদ ক্যাশ রিসিভ, বা এডমিন বোনাস"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-black shadow-xs focus:outline-none focus:border-black"
                />
              </div>

              {/* Transaction Guarantee Badge */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Firestore runTransaction:</strong> ইউজারের ওয়ালেট ব্যালেন্স বৃদ্ধি এবং approved স্ট্যাটাসের ডিপোজিট রেকর্ড (method: 'manual') একই পারমাণবিক ট্রানজেকশনে সংরক্ষিত হবে।
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={isSubmittingManualDeposit || !manualDepositUserId || Number(manualDepositAmount) <= 0}
                onClick={async () => {
                  if (!manualDepositUserId) {
                    showToast('অনুগ্রহ করে গ্রাহক নির্বাচন করুন।', 'error');
                    return;
                  }
                  const num = parseFloat(manualDepositAmount);
                  if (isNaN(num) || num <= 0) {
                    showToast('সঠিক টাকার পরিমাণ লিখুন।', 'error');
                    return;
                  }

                  setIsSubmittingManualDeposit(true);
                  const success = await addManualDeposit(manualDepositUserId, num, manualDepositNote);
                  setIsSubmittingManualDeposit(false);

                  if (success) {
                    setShowManualDepositModal(false);
                    setManualDepositUserId('');
                    setManualDepositAmount('100');
                    setManualDepositNote('');
                    setUserDropdownSearch('');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isSubmittingManualDeposit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>প্রসেসিং হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>সরাসরি ডিপোজিট সম্পন্ন করুন</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowManualDepositModal(false);
                  setManualDepositUserId('');
                  setUserDropdownSearch('');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order with Auto-Refund Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-2xl p-5 space-y-4 animate-in fade-in shadow-2xl text-black max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-rose-700 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>অর্ডার বাতিল ও স্বয়ংক্রিয় রিফান্ড (Cancel & Auto-Refund)</span>
              </h3>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Order Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-black text-sm">#{cancellingOrder.id}</span>
                  <span className="text-base font-black text-rose-600 font-sans">
                    ৳ {cancellingOrder.price}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>পণ্য: <strong className="text-black">{cancellingOrder.productTitle}</strong></div>
                  <div>প্যাকেজ: <strong className="text-black">{cancellingOrder.packageName}</strong></div>
                  <div>গ্রাহক: <strong className="text-black">{cancellingOrder.userName}</strong></div>
                  <div>Player ID (UID): <strong className="text-black font-mono">{cancellingOrder.playerId}</strong></div>
                </div>
              </div>

              {/* Refund Notice */}
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-rose-950">
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>অটো-রিফান্ড প্রতিশ্রুতি (Firestore runTransaction):</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  অর্ডারটি বাতিল করলে <strong>৳ {cancellingOrder.price}</strong> সরাসরি গ্রাহক <strong>{cancellingOrder.userName}</strong>-এর ওয়ালেটে রিফান্ড করা হবে এবং ডিপোজিট হিস্ট্রিতে <strong>'Refund'</strong> লেবেলযুক্ত একটি অনুমোদিত রেকর্ড তৈরি হবে।
                </p>
              </div>

              {/* Reason / Note Textarea */}
              <div className="space-y-1.5">
                <label className="text-slate-800 font-bold block">
                  বাতিলের কারণ (গ্রাহকের কাছে প্রদর্শিত হবে):
                </label>
                <textarea
                  value={cancelOrderReason}
                  onChange={(e) => setCancelOrderReason(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-black font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={isCancellingOrder}
                onClick={async () => {
                  if (isCancellingOrder) return;
                  setIsCancellingOrder(true);
                  try {
                    await updateOrderStatus(cancellingOrder.id, 'rejected', cancelOrderReason);
                    setCancellingOrder(null);
                  } finally {
                    setIsCancellingOrder(false);
                  }
                }}
                className={`flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-1.5 ${
                  isCancellingOrder ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isCancellingOrder ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>{isCancellingOrder ? 'রিফান্ড ও বাতিল হচ্ছে...' : 'হ্যাঁ, বাতিল ও রিফান্ড সম্পন্ন করুন'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 text-xs font-bold cursor-pointer"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
