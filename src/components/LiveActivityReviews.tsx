import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Wallet, 
  ShoppingBag, 
  Star, 
  Clock, 
  Radio, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface ActivityReviewItem {
  id: string;
  type: 'order' | 'deposit' | 'review';
  userName: string;
  avatarBg?: string;
  title: string;
  description?: string;
  amount?: number;
  productName?: string;
  method?: string;
  rating?: number;
  timestamp: number; // epoch ms
  isReal?: boolean;
}

/**
 * Mask user name according to Bengali privacy conventions:
 * e.g., 'রাফাত' -> 'রাফা*', 'আরাফাত' -> 'আরা**', 'তানভীর' -> 'তান**'
 */
export function maskUserName(name: string): string {
  if (!name || !name.trim()) return 'ইউজার*';
  const clean = name.trim();
  
  // If it already has an asterisk, return as is
  if (clean.includes('*')) return clean;

  const len = clean.length;
  if (len <= 2) {
    return clean[0] + '*';
  } else if (len <= 4) {
    return clean.slice(0, 2) + '*';
  } else {
    const visible = Math.min(3, Math.max(2, Math.floor(len / 2)));
    return clean.slice(0, visible) + '**';
  }
}

// Preset authentic gamer names in Bangladesh
const PRESET_USER_NAMES = [
  'রাফাত হাসান',
  'আরাফাত চৌধুরী',
  'তানভীর আহমেদ',
  'সাকিব আল হাসান',
  'মাহির ফয়সাল',
  'নাঈম ইসলাম',
  'রায়হান তালুকদার',
  'ফারহান কবীর',
  'সিয়াম মাহমুদ',
  'আবির হোসেন',
  'সৌরভ রায়',
  'তাহমিদ জামান',
  'শাহরিয়ার নাফিস',
  'রিফাত করিম',
  'জুবায়ের আহমেদ',
  'ইমরান হোসেন',
  'হামিম সরকার',
  'শাফি আহমেদ'
];

const PRESET_PRODUCTS = [
  { name: 'ফ্রি ফায়ার ১১৫ ডায়মন্ড', price: 85, cat: 'gaming' },
  { name: 'ফ্রি ফায়ার উইকলি মেম্বারশিপ', price: 175, cat: 'gaming' },
  { name: 'পাবজি ৬০ ইউসি (PUBG UC)', price: 95, cat: 'gaming' },
  { name: 'ফ্রি ফায়ার ২৪০ ডায়মন্ড', price: 165, cat: 'gaming' },
  { name: 'ফ্রি ফায়ার মান্থলি মেম্বারশিপ', price: 820, cat: 'gaming' },
  { name: 'টিকটক ৭০ কয়েন', price: 110, cat: 'tiktok' },
  { name: 'টিকটক ৩৫০ কয়েন', price: 540, cat: 'tiktok' },
  { name: 'পাবজি ৩২৫ ইউসি', price: 470, cat: 'gaming' },
  { name: 'ফেসবুক ১০০০ ফলোয়ার্স', price: 299, cat: 'facebook' },
  { name: 'ফ্রি ফায়ার ৬১০ ডায়মন্ড', price: 410, cat: 'gaming' },
  { name: 'ফ্রি ফায়ার লেভেল আপ পাস', price: 190, cat: 'gaming' }
];

const PRESET_DEPOSITS = [
  { amount: 100, method: 'bKash' },
  { amount: 150, method: 'Nagad' },
  { amount: 200, method: 'bKash' },
  { amount: 500, method: 'bKash' },
  { amount: 300, method: 'Nagad' },
  { amount: 1000, method: 'bKash' },
  { amount: 85, method: 'Nagad' },
  { amount: 250, method: 'bKash' },
  { amount: 750, method: 'Nagad' }
];

const PRESET_REVIEWS = [
  {
    comment: 'আলহামদুলিল্লাহ মাত্র ২ মিনিটে ১১৫ ডায়মন্ড পেয়ে গেলাম! ডিসি টপআপ ট্রাস্টেড সাইট।',
    product: 'ফ্রি ফায়ার ১১৫ ডায়মন্ড',
    rating: 5
  },
  {
    comment: 'বিকাশ ডিপোজিট করার সাথে সাথে ব্যালেন্স এড হয়েছে এবং উইকলি পেয়েছি। অসাধারণ সার্ভিস!',
    product: 'ফ্রি ফায়ার উইকলি মেম্বারশিপ',
    rating: 5
  },
  {
    comment: 'পাবজি ইউসি সাথে সাথে একাউন্টে ইন হয়ে গেছে। এডমিন ভাই অনেক হেল্পফুল।',
    product: 'পাবজি ৬০ ইউসি',
    rating: 5
  },
  {
    comment: 'অনেক কম রেটে ডায়মন্ড পেলাম, অন্য সাইটের চেয়ে ডিসি টপআপ অনেক দ্রুত কাজ করে।',
    product: 'ফ্রি ফায়ার ২৪০ ডায়মন্ড',
    rating: 5
  },
  {
    comment: 'টিকটক কয়েন ইনস্ট্যান্ট পেয়েছি, কোনো সমস্যা হয়নি। ৫ স্টার রেটিং!',
    product: 'টিকটক ৩৫০ কয়েন',
    rating: 5
  },
  {
    comment: 'মান্থলি মেম্বারশিপ নিলাম, ১ মিনিটেই ডেলিভারি ডান। সবসময় এখান থেকেই নিব।',
    product: 'ফ্রি ফায়ার মান্থলি মেম্বারশিপ',
    rating: 5
  }
];

const AVATAR_BG_COLORS = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-cyan-600'
];

/**
 * Format relative time in Bengali
 */
function getBengaliRelativeTime(timestamp: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 45) return 'এইমাত্র';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '১ মিনিট আগে';
  if (diffMin === 2) return '২ মিনিট আগে';
  if (diffMin === 3) return '৩ মিনিট আগে';
  if (diffMin <= 10) return `${diffMin} মিনিট আগে`;
  if (diffMin <= 59) return `${diffMin} মি. আগে`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour === 1) return '১ ঘণ্টা আগে';
  if (diffHour <= 24) return `${diffHour} ঘণ্টা আগে`;
  return 'আজকে';
}

function generateInitialActivities(): ActivityReviewItem[] {
  const now = Date.now();
  const items: ActivityReviewItem[] = [];

  // Generate a realistic staggered history of items over the past 30 minutes
  const staggeredTimes = [
    now - 45 * 1000,        // 45s ago
    now - 110 * 1000,       // ~2m ago
    now - 220 * 1000,       // ~3.5m ago
    now - 340 * 1000,       // ~5.5m ago
    now - 480 * 1000,       // ~8m ago
    now - 650 * 1000,       // ~11m ago
    now - 820 * 1000,       // ~14m ago
    now - 1100 * 1000       // ~18m ago
  ];

  const presets = [
    {
      type: 'deposit' as const,
      name: 'রাফাত হাসান',
      amount: 100,
      method: 'bKash',
      title: 'ডিপোজিট করেছেন ৳১০০'
    },
    {
      type: 'order' as const,
      name: 'আরাফাত চৌধুরী',
      productName: 'ফ্রি ফায়ার ১১৫ ডায়মন্ড',
      amount: 85,
      title: 'অর্ডার করেছেন ফ্রি ফায়ার ১১৫ ডায়মন্ড'
    },
    {
      type: 'review' as const,
      name: 'তানভীর আহমেদ',
      productName: 'ফ্রি ফায়ার উইকলি মেম্বারশিপ',
      rating: 5,
      description: 'মাত্র ২ মিনিটে ডেলিভারি পেয়ে গেলাম! ডিসি টপআপ সত্যি অসাধারণ।',
      title: '৫★ রেটিং দিয়েছেন'
    },
    {
      type: 'deposit' as const,
      name: 'সাকিব আল হাসান',
      amount: 500,
      method: 'Nagad',
      title: 'ডিপোজিট করেছেন ৳৫০০'
    },
    {
      type: 'order' as const,
      name: 'মাহির ফয়সাল',
      productName: 'পাবজি ৬০ ইউসি (PUBG UC)',
      amount: 95,
      title: 'অর্ডার করেছেন পাবজি ৬০ ইউসি'
    },
    {
      type: 'review' as const,
      name: 'নাঈম ইসলাম',
      productName: 'ফ্রি ফায়ার ২৪০ ডায়মন্ড',
      rating: 5,
      description: 'খুবই ফাস্ট ডেলিভারি পেয়েছি। কোনো ঝামেলা নেই, ১০০% ট্রাস্টেড।',
      title: '৫★ রেটিং দিয়েছেন'
    },
    {
      type: 'deposit' as const,
      name: 'রায়হান তালুকদার',
      amount: 250,
      method: 'bKash',
      title: 'ডিপোজিট করেছেন ৳২৫০'
    },
    {
      type: 'order' as const,
      name: 'ফারহান কবীর',
      productName: 'টিকটক ৭০ কয়েন',
      amount: 110,
      title: 'অর্ডার করেছেন টিকটক ৭০ কয়েন'
    }
  ];

  presets.forEach((preset, idx) => {
    items.push({
      id: `sim_init_${idx}_${Date.now()}`,
      type: preset.type,
      userName: maskUserName(preset.name),
      avatarBg: AVATAR_BG_COLORS[idx % AVATAR_BG_COLORS.length],
      title: preset.title,
      description: preset.description,
      amount: preset.amount,
      productName: preset.productName,
      method: preset.method,
      rating: preset.rating,
      timestamp: staggeredTimes[idx] || (now - (idx + 1) * 90000),
      isReal: false
    });
  });

  return items;
}

export const LiveActivityReviews: React.FC = () => {
  const { orders, deposits } = useApp();
  const [activities, setActivities] = useState<ActivityReviewItem[]>(() => generateInitialActivities());
  const [filter, setFilter] = useState<'all' | 'order' | 'deposit' | 'review'>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [newBadgeAlert, setNewBadgeAlert] = useState<boolean>(false);
  const [nextUpdateCountdown, setNextUpdateCountdown] = useState<number>(75); // ~1.25 minutes

  // Tick relative time every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      setNextUpdateCountdown(prev => (prev <= 1 ? 75 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync real orders and deposits from AppContext
  useEffect(() => {
    const realItems: ActivityReviewItem[] = [];

    // Real Orders
    if (Array.isArray(orders)) {
      orders.slice(0, 15).forEach((order) => {
        let orderTime = Date.now();
        try {
          const parsed = new Date(order.createdAt).getTime();
          if (!isNaN(parsed)) orderTime = parsed;
        } catch {
          // ignore
        }

        const masked = maskUserName(order.userName || 'কাস্টমার');
        const prodName = order.packageName ? `${order.productTitle} (${order.packageName})` : order.productTitle;
        
        realItems.push({
          id: `real_order_${order.id}`,
          type: 'order',
          userName: masked,
          avatarBg: 'bg-emerald-600',
          title: `অর্ডার করেছেন ${prodName}`,
          description: order.status === 'delivered' 
            ? 'ইনস্ট্যান্ট ডেলিভারি সম্পন্ন হয়েছে ✓' 
            : 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে',
          amount: order.price,
          productName: prodName,
          timestamp: orderTime,
          isReal: true
        });
      });
    }

    // Real Deposits
    if (Array.isArray(deposits)) {
      deposits.slice(0, 15).forEach((dep) => {
        let depTime = Date.now();
        try {
          const parsed = new Date(dep.createdAt).getTime();
          if (!isNaN(parsed)) depTime = parsed;
        } catch {
          // ignore
        }

        const masked = maskUserName(dep.userName || 'কাস্টমার');
        const methodLabel = dep.method === 'bkash' ? 'bKash' : dep.method === 'nagad' ? 'Nagad' : 'ওয়ালেট';

        realItems.push({
          id: `real_dep_${dep.id}`,
          type: 'deposit',
          userName: masked,
          avatarBg: 'bg-blue-600',
          title: `ডিপোজিট করেছেন ৳${dep.amount}`,
          description: dep.status === 'approved' 
            ? `ব্যালেন্স সফলভাবে যোগ হয়েছে (${methodLabel}) ✓` 
            : `ডিপোজিট রিকোয়েস্ট (${methodLabel})`,
          amount: dep.amount,
          method: methodLabel,
          timestamp: depTime,
          isReal: true
        });
      });
    }

    if (realItems.length > 0) {
      setActivities(prev => {
        // Merge real items with simulated items, preventing duplicates
        const existingIds = new Set(realItems.map(r => r.id));
        const filteredPrev = prev.filter(p => !existingIds.has(p.id));
        const combined = [...realItems, ...filteredPrev];
        // Sort descending by timestamp
        combined.sort((a, b) => b.timestamp - a.timestamp);
        return combined.slice(0, 30);
      });
    }
  }, [orders, deposits]);

  // Periodic simulated live update every 60-90 seconds (1-2 minutes as requested)
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      // Pick random activity type: deposit, order, or review
      const rand = Math.random();
      const randomName = PRESET_USER_NAMES[Math.floor(Math.random() * PRESET_USER_NAMES.length)];
      const masked = maskUserName(randomName);
      const randomColor = AVATAR_BG_COLORS[Math.floor(Math.random() * AVATAR_BG_COLORS.length)];
      const now = Date.now();

      let newItem: ActivityReviewItem;

      if (rand < 0.4) {
        // Order event
        const prod = PRESET_PRODUCTS[Math.floor(Math.random() * PRESET_PRODUCTS.length)];
        newItem = {
          id: `sim_order_${Date.now()}`,
          type: 'order',
          userName: masked,
          avatarBg: randomColor,
          title: `অর্ডার করেছেন ${prod.name}`,
          description: 'ডেলিভারি সফল হয়েছে ✓',
          amount: prod.price,
          productName: prod.name,
          timestamp: now,
          isReal: false
        };
      } else if (rand < 0.75) {
        // Deposit event
        const dep = PRESET_DEPOSITS[Math.floor(Math.random() * PRESET_DEPOSITS.length)];
        newItem = {
          id: `sim_dep_${Date.now()}`,
          type: 'deposit',
          userName: masked,
          avatarBg: randomColor,
          title: `ডিপোজিট করেছেন ৳${dep.amount}`,
          description: `${dep.method} এর মাধ্যমে সফল ডিপোজিট সম্পন্ন`,
          amount: dep.amount,
          method: dep.method,
          timestamp: now,
          isReal: false
        };
      } else {
        // Review event
        const rev = PRESET_REVIEWS[Math.floor(Math.random() * PRESET_REVIEWS.length)];
        newItem = {
          id: `sim_rev_${Date.now()}`,
          type: 'review',
          userName: masked,
          avatarBg: randomColor,
          title: '৫★ রেটিং দিয়েছেন',
          description: `"${rev.comment}"`,
          productName: rev.product,
          rating: rev.rating,
          timestamp: now,
          isReal: false
        };
      }

      setActivities(prev => [newItem, ...prev.slice(0, 29)]);
      setNewBadgeAlert(true);
      setTimeout(() => setNewBadgeAlert(false), 4000);
    }, 75000); // 75 seconds = 1.25 minutes

    return () => clearInterval(cycleInterval);
  }, []);

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter(item => item.type === filter);
  }, [activities, filter]);

  return (
    <section className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden text-black">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>লাইভ রিভিউ ও এক্টিভিটি</span>
              </span>
              {newBadgeAlert && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white animate-bounce shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  নতুন আপডেট!
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>রিয়েল-টাইম কাস্টমার লেনদেন ও সন্তুষ্টি</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              ডিসি টপ-আপে প্রতি ১-২ মিনিটে লাইভ কাস্টমার অর্ডার, ডিপোজিট ও রিভিউ আপডেট হচ্ছে
            </p>
          </div>

          {/* Pulse Status */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-[11px] font-sans">
              পরবর্তী আপডেট: ~{nextUpdateCountdown} সে.
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সব এক্টিভিটি ({activities.length})
          </button>
          <button
            onClick={() => setFilter('order')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filter === 'order'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>টপ-আপ অর্ডার</span>
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filter === 'deposit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>ডিপোজিট</span>
          </button>
          <button
            onClick={() => setFilter('review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filter === 'review'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>৫★ রিভিউ</span>
          </button>
        </div>
      </div>

      {/* Activity Stream Feed */}
      <div className="p-3 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredActivities.slice(0, 12).map((item, index) => {
            const isTopNew = index === 0;
            const timeAgo = getBengaliRelativeTime(item.timestamp, currentTime);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3 relative ${
                  isTopNew
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-xs ring-1 ring-emerald-200/60'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                {/* User Avatar with Initials */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-2xs ${
                    item.avatarBg || 'bg-slate-700'
                  }`}
                >
                  {item.userName ? item.userName.charAt(0) : 'U'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {item.userName}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>ভেরিফাইড</span>
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {timeAgo}
                    </span>
                  </div>

                  {/* Activity Badge & Action */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {item.type === 'deposit' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                        <Wallet className="w-2.5 h-2.5" />
                        ডিপোজিট
                      </span>
                    )}

                    {item.type === 'order' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        <ShoppingBag className="w-2.5 h-2.5" />
                        অর্ডার
                      </span>
                    )}

                    {item.type === 'review' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        ৫★ রিভিউ
                      </span>
                    )}

                    <span className="font-bold text-slate-800 text-xs truncate">
                      {item.title}
                    </span>
                  </div>

                  {/* Rating Stars for Reviews */}
                  {item.rating && (
                    <div className="flex items-center gap-0.5 py-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 fill-amber-400 text-amber-500"
                        />
                      ))}
                      <span className="text-[10px] font-extrabold text-amber-800 ml-1">
                        ৫.০ এক্সিলেন্ট
                      </span>
                    </div>
                  )}

                  {/* Description / Review message */}
                  {item.description && (
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium line-clamp-2 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                      {item.description}
                    </p>
                  )}

                  {/* Extra context tags */}
                  <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                    {item.method && (
                      <span className="font-semibold text-slate-600">
                        মেথড: {item.method}
                      </span>
                    )}
                    {item.amount && (
                      <span className="font-sans font-bold text-slate-900">
                        পরিমাণ: ৳{item.amount}
                      </span>
                    )}
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5 ml-auto">
                      <ShieldCheck className="w-3 h-3" />
                      নিরাপদ লেনদেন
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official YouTube Tutorial Link at bottom of reviews section */}
      <div className="p-3 sm:p-4 bg-slate-50/90 border-t border-slate-200">
        <a
          id="youtube-add-money-guide-link"
          href="https://youtu.be/W7HruTspoJM?si=wGN4h_d7gCDbU7FN"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current text-red-600" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/95 bg-black/25 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ভিডিও গাইড</span>
              </span>
              <h5 className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                কিভাবে খুব সহজে ওয়েবসাইটের টাকা এড করবেন
              </h5>
              <p className="text-[10px] text-white/90">
                সম্পূর্ণ ভিডিও টিউটোরিয়াল দেখতে এখানে ক্লিক করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-600 font-extrabold text-xs shrink-0 self-start sm:self-auto group-hover:bg-slate-100 transition-colors shadow-2xs">
            <span>ভিডিও দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5 text-red-600" />
          </div>
        </a>
      </div>
    </section>
  );
};
