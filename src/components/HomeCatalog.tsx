import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TopUpProduct } from '../types';
import { SafeImage } from './SafeImage';
import { RecentActivity } from './RecentActivity';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { 
  Search, X, Gamepad2, Sparkles, 
  ArrowUpDown, Zap, ShieldCheck, MessageCircle, PlusCircle, 
  ShoppingBag, ArrowRight, Tag, RefreshCw, Video, ThumbsUp, ExternalLink,
  Megaphone, Bell, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, Info, Flame, ImageIcon
} from 'lucide-react';

interface HomeCatalogProps {
  onSelectProduct: (product: TopUpProduct) => void;
}

export const HomeCatalog: React.FC<HomeCatalogProps> = ({ onSelectProduct }) => {
  const { products, currentUser, setActiveTab, setIsAdminMode, notice, banners, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gaming' | 'tiktok' | 'facebook'>('all');
  const [selectedSubGenre, setSelectedSubGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'name_asc'>('popular');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  // Active banners
  const activeBanners = useMemo(() => {
    return banners.filter((b) => b.isActive);
  }, [banners]);

  // Auto-cycle banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handleNextBanner = () => {
    if (activeBanners.length <= 1) return;
    setActiveBannerIdx((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrevBanner = () => {
    if (activeBanners.length <= 1) return;
    setActiveBannerIdx((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const categories = [
    { id: 'all' as const, label: 'সবকিছু', labelEn: 'All (13)', icon: Sparkles },
    { id: 'gaming' as const, label: 'গেম অফার ও মেম্বারশিপ', labelEn: 'Gaming', icon: Gamepad2 },
    { id: 'tiktok' as const, label: 'টিকটক সার্ভিস', labelEn: 'TikTok', icon: Video },
    { id: 'facebook' as const, label: 'ফেসবুক সার্ভিস', labelEn: 'Facebook', icon: ThumbsUp }
  ];

  const subGenresGaming = [
    { id: 'all', label: 'সব গেম অফার' },
    { id: 'Special Offer', label: 'ফ্রাইডে অফার' },
    { id: 'Lucky Box', label: 'মিস্ট্রি বক্স' },
    { id: 'BD Server', label: 'UID Top up (BD)' },
    { id: 'Membership', label: 'উইকলি/মান্থলি' },
    { id: 'Combo Offer', label: 'কম্বো অফার' },
    { id: 'Level Up Pass', label: 'লেভেল আপ পাস' }
  ];

  const subGenresTikTok = [
    { id: 'all', label: 'সব টিকটক সার্ভিস' },
    { id: 'TikTok Engagement', label: 'ভিডিও লাইক' },
    { id: 'TikTok Growth', label: 'একাউন্ট ফলোয়ার্স' }
  ];

  const subGenresFacebook = [
    { id: 'all', label: 'সব ফেসবুক সার্ভিস' },
    { id: 'Page Growth', label: 'পেজ ফলোয়ার্স' },
    { id: 'Post Engagement', label: 'পোস্ট রিঅ্যাক্ট' },
    { id: 'Video / Reels', label: 'ভিডিও ভিউজ' },
    { id: 'Profile Growth', label: 'আইডি ফলোয়ার্স' }
  ];

  const quickSearchTags = [
    { label: 'UID Top up', icon: '⚡' },
    { label: 'Friday offer', icon: '🔥' },
    { label: 'Mystery Box', icon: '🎁' },
    { label: 'weekly/monthly', icon: '💎' },
    { label: 'combo offer', icon: '💥' },
    { label: 'weekly lite', icon: '⭐' },
    { label: 'level up pass', icon: '🏆' },
    { label: 'TikTok like', icon: '❤️' },
    { label: 'TikTok followers', icon: '🚀' },
    { label: 'Facebook page', icon: '👍' },
    { label: 'Facebook react', icon: '🥰' },
    { label: 'Facebook views', icon: '👁️' },
    { label: 'Facebook id', icon: '👤' }
  ];

  // Calculate live count per category
  const categoryCounts = useMemo(() => {
    const counts = { all: 0, gaming: 0, tiktok: 0, facebook: 0 };
    products.forEach((p) => {
      if (!p.isActive) return;
      counts.all++;
      if (p.category === 'gaming' || p.category === 'games') {
        counts.gaming++;
      } else if (p.category === 'tiktok') {
        counts.tiktok++;
      } else if (p.category === 'facebook') {
        counts.facebook++;
      }
    });
    return counts;
  }, [products]);

  // Filtering & Search
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.isActive) return false;

        // Category filter
        let matchesCategory = true;
        if (selectedCategory === 'gaming') {
          matchesCategory = p.category === 'gaming' || p.category === 'games';
        } else if (selectedCategory === 'tiktok') {
          matchesCategory = p.category === 'tiktok';
        } else if (selectedCategory === 'facebook') {
          matchesCategory = p.category === 'facebook';
        }

        // Subgenre filter
        if (matchesCategory && selectedSubGenre !== 'all') {
          matchesCategory = p.subCategory?.toLowerCase() === selectedSubGenre.toLowerCase();
        }

        // Search Query filter
        const q = searchQuery.trim().toLowerCase();
        if (!q) return matchesCategory;

        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSubCat = p.subCategory?.toLowerCase().includes(q) || false;
        const matchesPackages = p.packages.some(
          (pkg) => pkg.name.toLowerCase().includes(q) || pkg.amount.toLowerCase().includes(q)
        );
        const matchesBadge = p.badge?.toLowerCase().includes(q) || false;

        return matchesCategory && (matchesTitle || matchesDesc || matchesSubCat || matchesPackages || matchesBadge);
      })
      .sort((a, b) => {
        const lowestA = Math.min(...a.packages.map((pkg) => pkg.price));
        const lowestB = Math.min(...b.packages.map((pkg) => pkg.price));

        if (sortBy === 'price_asc') return lowestA - lowestB;
        if (sortBy === 'price_desc') return lowestB - lowestA;
        if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [products, selectedCategory, selectedSubGenre, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubGenre('all');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* App Home Announcement Notice */}
      {notice?.isActive && notice?.text && !isNoticeDismissed && (
        <div
          id="home-announcement-notice-bar"
          className={`rounded-2xl p-3.5 sm:p-4 border transition-all animate-in fade-in shadow-xs flex items-start sm:items-center justify-between gap-3 ${
            notice.type === 'urgent'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : notice.type === 'offer'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : notice.type === 'warning'
              ? 'bg-orange-50 border-orange-300 text-orange-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                notice.type === 'urgent'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : notice.type === 'offer'
                  ? 'bg-amber-500 text-black'
                  : notice.type === 'warning'
                  ? 'bg-orange-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {notice.type === 'urgent' && <Megaphone className="w-4 h-4" />}
              {notice.type === 'offer' && <Flame className="w-4 h-4" />}
              {notice.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
              {notice.type === 'info' && <Info className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/10 tracking-wider">
                  {notice.type === 'urgent'
                    ? 'জরুরি নোটিশ 🚨'
                    : notice.type === 'offer'
                    ? 'স্পেশাল অফার 🔥'
                    : notice.type === 'warning'
                    ? 'ওয়ার্নিং বার্তা ⚠️'
                    : 'অফিসিয়াল ঘোষণা 📢'}
                </span>
                {notice.updatedAt && (
                  <span className="text-[11px] opacity-75 font-mono">{notice.updatedAt}</span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold mt-0.5 leading-snug">
                {notice.text}
              </p>
            </div>
          </div>
          <button
            id="dismiss-notice-btn"
            onClick={() => setIsNoticeDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-black/10 text-current transition-colors shrink-0 cursor-pointer"
            title="নোটিশ লুকান"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Promotional Banner Carousel Slider */}
      {activeBanners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-md group">
          {/* Quick Admin Shortcut to Manage Banners */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAdminMode(true);
              }}
              className="absolute top-2.5 right-2.5 z-30 px-2.5 py-1 rounded-lg bg-black/85 hover:bg-black text-amber-300 hover:text-amber-200 text-[10px] font-bold border border-amber-400/50 backdrop-blur-xs flex items-center gap-1 shadow-lg cursor-pointer transition-all"
              title="এডমিন প্যানেলে ব্যানার পরিবর্তন ও নতুন ব্যানার যোগ করুন"
            >
              <ImageIcon className="w-3 h-3 text-amber-400" />
              <span>ব্যানার ছবি ও স্লাইডার পরিচালনা (Admin)</span>
            </button>
          )}

          {(() => {
            const banner = activeBanners[activeBannerIdx] || activeBanners[0];
            const handleBannerClick = () => {
              if (banner.linkUrl) {
                window.location.href = banner.linkUrl;
                return;
              }
              if (banner.actionTab === 'deposit') {
                setActiveTab('deposit');
              } else if (banner.actionTab === 'orders') {
                setActiveTab('orders');
              } else {
                const catalogEl = document.getElementById('catalog-search-input');
                if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
              }
            };

            return (
              <div
                onClick={handleBannerClick}
                className="relative w-full h-44 sm:h-56 md:h-64 flex items-end p-4 sm:p-6 overflow-hidden cursor-pointer select-none"
              >
                {/* Full-bleed Vivid Banner Image */}
                <SafeImage
                  src={banner.imageUrl}
                  alt={banner.title}
                  title={banner.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
                />

                {/* Subtle bottom gradient overlay for text readability without obscuring artwork */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none" />

                {/* Slide Text Content */}
                <div className="relative z-10 max-w-xl space-y-1.5 sm:space-y-2">
                  {banner.badge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold tracking-wide shadow-xs uppercase">
                      <Sparkles className="w-3 h-3 text-black" />
                      <span>{banner.badge}</span>
                    </span>
                  )}
                  {banner.title && (
                    <h3 className="text-base sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-1 sm:line-clamp-2 max-w-md drop-shadow-sm">
                      {banner.subtitle}
                    </p>
                  )}
                  <div className="pt-1 flex items-center gap-2">
                    <span
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 transform active:scale-95"
                    >
                      <span>{banner.actionText || 'অফার দেখুন'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Prev/Next arrows if multiple */}
          {activeBanners.length > 1 && (
            <>
              <button
                id="banner-prev-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevBanner();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-xs transition-all z-20 cursor-pointer shadow-md"
                title="আগের ব্যানার"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="banner-next-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextBanner();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 backdrop-blur-xs transition-all z-20 cursor-pointer shadow-md"
                title="পরের ব্যানার"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Indicator dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBannerIdx(i);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === activeBannerIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hero: Wallet & Instant Top-Up Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200 p-4 sm:p-6 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Brand Emblem + Wallet Balance Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* The Custom DC Top Up Wallet Emblem */}
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-amber-400 shadow-md shadow-cyan-500/20 relative">
                <img
                  src="/dc_logo.jpg"
                  alt="DC Top Up Wallet"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black text-[9px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap shadow-md">
                  DC WALLET
                </span>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-950 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                <span>অফিসিয়াল ডিসি টপ-আপ ওয়ালেট (DC Wallet)</span>
              </div>

              <div>
                <p className="text-xs text-slate-800 font-bold">
                  {currentUser ? 'আপনার বর্তমান ওয়ালেট ব্যালেন্স' : 'ডিসি টপ-আপ ওয়ালেট'}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black font-sans">
                    ৳ {currentUser ? currentUser.walletBalance.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-xs text-emerald-950 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    {currentUser ? 'সক্রিয় ওয়ালেট' : 'লগইন করুন'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-800 max-w-md leading-relaxed font-medium">
                বিকাশ, নগদ বা রকেটে সেন্ড মানি করে মাত্র ৩ মিনিটে ওয়ালেট রিচার্জ করুন এবং যেকোনো গেমের ডায়মন্ড ও ইউসি কিনুন সরাসরি।
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              id="hero-add-money-btn"
              onClick={() => setActiveTab('deposit')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
              <span>টাকা যোগ করুন</span>
            </button>

            <button
              id="hero-view-orders-btn"
              onClick={() => setActiveTab('orders')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-black font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>আমার অর্ডার</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Control Center */}
      <div className="space-y-4">
        {/* Top Control Bar: Search Input & Sort Dropdown */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Enhanced Search Input */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
              <Search className="w-4 h-4" />
            </div>

            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সার্ভিস খুঁজুন (Friday offer, Mystery Box, UID Top up, TikTok, Facebook...)"
              className="w-full bg-white border border-slate-300 focus:border-black rounded-xl pl-10 pr-24 py-2.5 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all shadow-xs"
            />

            {/* Clear Button or Query Feedback */}
            {searchQuery && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  id="catalog-clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="flex items-center gap-1 text-[11px] text-black hover:bg-slate-200 px-2 py-1 rounded-lg bg-slate-100 border border-slate-300 transition-colors font-bold"
                  title="সার্চ ক্লিয়ার করুন"
                >
                  <X className="w-3 h-3 text-black" />
                  <span>মুছুন</span>
                </button>
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-black font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">সর্ট:</span>
            </div>
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 focus:border-black text-xs text-black font-bold rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="popular">সবচেয়ে জনপ্রিয় (Popular)</option>
              <option value="price_asc">মূল্য: কম থেকে বেশি</option>
              <option value="price_desc">মূল্য: বেশি থেকে কম</option>
              <option value="name_asc">নাম অনুযায়ী (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Search Tag Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-black shrink-0 flex items-center gap-1 pr-1">
            <Tag className="w-3 h-3 text-black" />
            <span>জনপ্রিয় সার্চ:</span>
          </span>
          {quickSearchTags.map((tag) => {
            const isActive = searchQuery.toLowerCase() === tag.label.toLowerCase();
            return (
              <button
                key={tag.label}
                id={`quick-search-${tag.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSearchQuery(isActive ? '' : tag.label)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1 border ${
                  isActive
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-slate-300 text-black hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Category Filter Tabs: 'All', 'Games', 'Wallet', 'Gift Cards' */}
        <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id];

              return (
                <button
                  key={cat.id}
                  id={`filter-category-${cat.id}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubGenre('all');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-black'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-700'}`}>({cat.labelEn})</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-extrabold ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-slate-100 text-black border border-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Result Count & Reset Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-black font-bold">
            <span>
              মোট <strong className="text-emerald-700 font-extrabold font-sans text-sm">{filteredProducts.length}</strong> টি সার্ভিস অপশন
            </span>
            {(searchQuery || selectedCategory !== 'all' || selectedSubGenre !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-black hover:text-emerald-700 flex items-center gap-1 transition-colors underline underline-offset-2 font-bold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>রিসেট করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Category Filter: Gaming */}
        {selectedCategory === 'gaming' && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-black font-bold mr-1 shrink-0">গেম ফিল্টার:</span>
            {subGenresGaming.map((sub) => {
              const isSelected = selectedSubGenre === sub.id;
              return (
                <button
                  key={sub.id}
                  id={`subgenre-${sub.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedSubGenre(sub.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap border font-bold ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-Category Filter: TikTok */}
        {selectedCategory === 'tiktok' && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-black font-bold mr-1 shrink-0">টিকটক ফিল্টার:</span>
            {subGenresTikTok.map((sub) => {
              const isSelected = selectedSubGenre === sub.id;
              return (
                <button
                  key={sub.id}
                  id={`subgenre-${sub.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedSubGenre(sub.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap border font-bold ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-Category Filter: Facebook */}
        {selectedCategory === 'facebook' && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-black font-bold mr-1 shrink-0">ফেসবুক ফিল্টার:</span>
            {subGenresFacebook.map((sub) => {
              const isSelected = selectedSubGenre === sub.id;
              return (
                <button
                  key={sub.id}
                  id={`subgenre-${sub.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedSubGenre(sub.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap border font-bold ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4 bg-slate-50">
          <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto border border-slate-300 shadow-xs">
            <Search className="w-7 h-7 text-black" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-extrabold text-black">কোনো সার্ভিস বা প্রোডাক্ট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-800 font-medium max-w-sm mx-auto leading-relaxed">
              {searchQuery ? (
                <>
                  <span className="text-black font-extrabold">"{searchQuery}"</span> এর সাথে মেলে এমন কোনো অপশন পাওয়া যায়নি।
                </>
              ) : (
                'নির্বাচিত ক্যাটেগরিতে বর্তমানে কোনো সক্রিয় আইটেম নেই।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              id="empty-state-clear-btn"
              onClick={handleClearFilters}
              className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              সব সার্ভিস দেখুন
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold border border-slate-300 shadow-xs cursor-pointer"
            >
              ওয়ালেটে টাকা যোগ করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3.5 lg:gap-4">
          {filteredProducts.map((product) => {
            const lowestPrice = Math.min(...product.packages.map((p) => p.price));
            const packageCount = product.packages.length;
            const isSocial = product.category === 'facebook' || product.category === 'tiktok';

            // Readable category tag in Bengali
            const categoryBadgeLabel =
              product.category === 'tiktok'
                ? 'TikTok'
                : product.category === 'facebook'
                ? 'Facebook'
                : product.subCategory || 'Gaming';

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="group cursor-pointer rounded-xl sm:rounded-2xl bg-white border border-slate-200 hover:border-black transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md p-1.5 sm:p-2.5 active:scale-[0.98]"
              >
                {/* Square 1:1 Aspect Ratio Thumbnail */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-slate-100">
                  <SafeImage
                    src={product.image}
                    alt={product.title}
                    title={product.title}
                    category={product.category}
                    className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
                      product.isOutOfStock ? 'grayscale-50 opacity-70' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Out of Stock Overlay */}
                  {product.isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center z-10">
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] sm:text-[10px] font-black tracking-wide uppercase shadow border border-rose-400 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>স্টক শেষ</span>
                      </span>
                    </div>
                  )}

                  {/* Top Left Badge */}
                  {product.badge && (
                    <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/20 text-white text-[8px] sm:text-[10px] font-bold flex items-center gap-0.5 shadow-xs max-w-[85%]">
                      <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-400 shrink-0" />
                      <span className="truncate">{product.badge}</span>
                    </div>
                  )}

                  {/* Package Count Pill Bottom Right */}
                  <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 px-1 sm:px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-bold font-sans">
                    {packageCount} টি
                  </div>
                </div>

                {/* Body Content: Title & Details below image */}
                <div className="pt-1.5 sm:pt-2 flex-1 flex flex-col justify-between bg-white text-black">
                  <div className="space-y-0.5">
                    <h3
                      className="text-[11px] sm:text-xs md:text-sm font-bold text-black group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">
                      {categoryBadgeLabel}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <span className="text-[8px] sm:text-[9px] text-slate-500 block uppercase font-bold leading-none">শুরু</span>
                      <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-black font-sans truncate block">
                        ৳{lowestPrice}
                      </span>
                    </div>

                    {product.isOutOfStock ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-extrabold text-[8px] sm:text-[10px] border border-rose-200 shrink-0">
                        শেষ
                      </span>
                    ) : (
                      <button
                        id={`buy-btn-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="flex items-center justify-center gap-0.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-[9px] sm:text-[11px] transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <span>{isSocial ? 'অর্ডার' : 'কিনুন'}</span>
                        <ArrowRight className="w-2.5 h-2.5 hidden sm:inline" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RecentActivity: Scrolling auto-updating list polling Firestore/cache every 1-2 minutes */}
      <RecentActivity />
    </div>
  );
};
