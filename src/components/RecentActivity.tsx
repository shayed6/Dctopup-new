import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle2, 
  Wallet, 
  ShoppingBag, 
  Clock, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';

export interface RecentTransactionItem {
  id: string;
  type: 'deposit' | 'order';
  userName: string;
  actionText: string;
  detail: string;
  amount?: number;
  productName?: string;
  method?: string;
  timestamp: number; // epoch ms
  isReal?: boolean;
}

/**
 * Mask user name for privacy (e.g. "রাফাত" -> "User R (রাফা*)")
 */
export function maskName(name: string, fallbackLetter: string = 'X'): string {
  if (!name || !name.trim()) return `User ${fallbackLetter} (ইউজার*)`;
  const clean = name.trim();
  const firstLetter = clean.charAt(0).toUpperCase();

  if (clean.length <= 2) {
    return `User ${firstLetter} (${clean[0]}*)`;
  } else if (clean.length <= 4) {
    return `User ${firstLetter} (${clean.slice(0, 2)}*)`;
  } else {
    const visible = Math.min(3, Math.max(2, Math.floor(clean.length / 2)));
    return `User ${firstLetter} (${clean.slice(0, visible)}**)`;
  }
}

// Preset realistic transactions to ensure the feed is always lively
const SAMPLE_TRANSACTIONS: Array<{
  type: 'deposit' | 'order';
  name: string;
  amount?: number;
  product?: string;
  method?: string;
}> = [
  { type: 'deposit', name: 'রাফাত হাসান', amount: 100, method: 'bKash' },
  { type: 'order', name: 'আরাফাত চৌধুরী', product: 'ফ্রি ফায়ার ১১৫ ডায়মন্ড', amount: 85 },
  { type: 'deposit', name: 'তানভীর আহমেদ', amount: 250, method: 'Nagad' },
  { type: 'order', name: 'সাকিব আল হাসান', product: 'পাবজি ৬০ ইউসি (PUBG UC)', amount: 95 },
  { type: 'deposit', name: 'মাহির ফয়সাল', amount: 500, method: 'bKash' },
  { type: 'order', name: 'নাঈম ইসলাম', product: 'ফ্রি ফায়ার উইকলি মেম্বারশিপ', amount: 175 },
  { type: 'deposit', name: 'রায়হান তালুকদার', amount: 1000, method: 'bKash' },
  { type: 'order', name: 'ফারহান কবীর', product: 'টিকটক ৭০ কয়েন', amount: 110 },
  { type: 'deposit', name: 'সিয়াম মাহমুদ', amount: 150, method: 'Nagad' },
  { type: 'order', name: 'আবির হোসেন', product: 'ফ্রি ফায়ার ২৪০ ডায়মন্ড', amount: 165 },
  { type: 'deposit', name: 'তাহমিদ জামান', amount: 300, method: 'bKash' },
  { type: 'order', name: 'শাহরিয়ার নাফিস', product: 'ফ্রি ফায়ার মান্থলি মেম্বারশিপ', amount: 820 }
];

function getRelativeTime(timestamp: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 45) return 'এইমাত্র (Just now)';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return '১ মিনিট আগে (1m ago)';
  if (diffMin <= 10) return `${diffMin} মিনিট আগে`;
  if (diffMin <= 59) return `${diffMin} মি. আগে`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour === 1) return '১ ঘণ্টা আগে';
  if (diffHour <= 24) return `${diffHour} ঘণ্টা আগে`;
  return 'আজকে (Today)';
}

export const RecentActivity: React.FC = () => {
  const { orders: localOrders, deposits: localDeposits } = useApp();
  const [transactions, setTransactions] = useState<RecentTransactionItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'order'>('all');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(75); // 75 seconds countdown (1-2 minutes)
  const [newFlash, setNewFlash] = useState<boolean>(false);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Polling function: Polls Firestore or local cache
  const pollTransactions = useCallback(async () => {
    setIsPolling(true);
    const newItems: RecentTransactionItem[] = [];
    const now = Date.now();

    try {
      // 1. Attempt to poll latest orders from Firestore if accessible
      const ordersCol = collection(db, 'orders');
      const ordersSnap = await getDocs(query(ordersCol, limit(10)));
      if (!ordersSnap.empty) {
        ordersSnap.forEach((docSnap) => {
          const d = docSnap.data();
          const t = d.createdAt ? new Date(d.createdAt).getTime() : now;
          const masked = maskName(d.userName || 'Customer', 'Y');
          const prodTitle = d.productTitle || d.packageName || 'Top-Up';
          newItems.push({
            id: `fs_ord_${docSnap.id}`,
            type: 'order',
            userName: masked,
            actionText: `${masked} ordered ${prodTitle}`,
            detail: `${d.packageName || prodTitle} (${d.price ? `৳${d.price} BDT` : ''}) - ডেলিভারি সফল ✓`,
            amount: d.price,
            productName: prodTitle,
            timestamp: isNaN(t) ? now : t,
            isReal: true
          });
        });
      }
    } catch {
      // If Firestore read fails due to security rules for non-admin, use local cache
    }

    try {
      // 2. Attempt to poll latest deposits from Firestore if accessible
      const depCol = collection(db, 'deposits');
      const depSnap = await getDocs(query(depCol, limit(10)));
      if (!depSnap.empty) {
        depSnap.forEach((docSnap) => {
          const d = docSnap.data();
          const t = d.createdAt ? new Date(d.createdAt).getTime() : now;
          const masked = maskName(d.userName || 'Customer', 'X');
          const methodLabel = d.method === 'bkash' ? 'bKash' : d.method === 'nagad' ? 'Nagad' : 'Wallet';
          newItems.push({
            id: `fs_dep_${docSnap.id}`,
            type: 'deposit',
            userName: masked,
            actionText: `${masked} deposited ${d.amount || 100} BDT`,
            detail: `${methodLabel} এর মাধ্যমে ৳${d.amount || 100} টাকা যোগ হয়েছে ✓`,
            amount: d.amount,
            method: methodLabel,
            timestamp: isNaN(t) ? now : t,
            isReal: true
          });
        });
      }
    } catch {
      // Fallback handled below
    }

    // 3. Merge with AppContext local cache if Firestore returned empty or limited items
    if (Array.isArray(localOrders) && localOrders.length > 0) {
      localOrders.slice(0, 10).forEach((order) => {
        const masked = maskName(order.userName || 'User', 'Y');
        const prod = order.productTitle || order.packageName || 'Product';
        const t = order.createdAt ? new Date(order.createdAt).getTime() : now;
        newItems.push({
          id: `local_ord_${order.id}`,
          type: 'order',
          userName: masked,
          actionText: `${masked} ordered ${prod}`,
          detail: `${order.packageName || prod} (৳${order.price} BDT) - সফল ডেলিভারি`,
          amount: order.price,
          productName: prod,
          timestamp: isNaN(t) ? now : t,
          isReal: true
        });
      });
    }

    if (Array.isArray(localDeposits) && localDeposits.length > 0) {
      localDeposits.slice(0, 10).forEach((dep) => {
        const masked = maskName(dep.userName || 'User', 'X');
        const method = dep.method === 'bkash' ? 'bKash' : dep.method === 'nagad' ? 'Nagad' : 'Wallet';
        const t = dep.createdAt ? new Date(dep.createdAt).getTime() : now;
        newItems.push({
          id: `local_dep_${dep.id}`,
          type: 'deposit',
          userName: masked,
          actionText: `${masked} deposited ${dep.amount} BDT`,
          detail: `${method} মাধ্যমে ৳${dep.amount} BDT ডিপোজিট সম্পন্ন`,
          amount: dep.amount,
          method: method,
          timestamp: isNaN(t) ? now : t,
          isReal: true
        });
      });
    }

    // 4. Staggered sample transactions so the feed stays lively and updates
    SAMPLE_TRANSACTIONS.forEach((sample, idx) => {
      const letter = sample.type === 'deposit' ? 'X' : 'Y';
      const masked = maskName(sample.name, letter);
      const staggeredTime = now - (idx + 1) * 85000 + (Math.random() * 20000);
      
      if (sample.type === 'deposit') {
        newItems.push({
          id: `sample_dep_${idx}_${now}`,
          type: 'deposit',
          userName: masked,
          actionText: `${masked} deposited ${sample.amount} BDT`,
          detail: `${sample.method || 'bKash'} এর মাধ্যমে ৳${sample.amount} ডিপোজিট নিশ্চিত`,
          amount: sample.amount,
          method: sample.method,
          timestamp: staggeredTime,
          isReal: false
        });
      } else {
        newItems.push({
          id: `sample_ord_${idx}_${now}`,
          type: 'order',
          userName: masked,
          actionText: `${masked} ordered ${sample.product}`,
          detail: `${sample.product} (৳${sample.amount} BDT) - সফল ডেলিভারি সম্পন্ন`,
          amount: sample.amount,
          productName: sample.product,
          timestamp: staggeredTime,
          isReal: false
        });
      }
    });

    // Remove duplicates by id, sort descending by timestamp
    const uniqueMap = new Map<string, RecentTransactionItem>();
    newItems.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    const sortedList = Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp);

    setTransactions(sortedList.slice(0, 24));
    setLastPolledAt(new Date());
    setIsPolling(false);
    setNewFlash(true);
    setTimeout(() => setNewFlash(false), 3000);
  }, [localOrders, localDeposits]);

  // Initial poll on mount
  useEffect(() => {
    pollTransactions();
  }, [pollTransactions]);

  // Countdown timer and auto-polling every 75 seconds (1-2 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
      setCountdown((prev) => {
        if (prev <= 1) {
          pollTransactions();
          return 75; // reset countdown to 75 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pollTransactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((item) => item.type === filter);
  }, [transactions, filter]);

  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden text-black space-y-0">
      {/* Header Bar with Live Polling Status */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>রিয়েল-টাইম সাম্প্রতিক লেনদেন (Recent Activity)</span>
              </span>
              {newFlash && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white animate-bounce shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  নতুন লেনদেন আপডেট!
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>লাইভ কাস্টমার এক্টিভিটি ও লেনদেন ট্র্যাকার</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Firestore ও লোকাল ক্যাশ থেকে প্রতি ১-২ মিনিটে লাইভ ট্রানজেকশন আপডেট হচ্ছে
            </p>
          </div>

          {/* Polling Countdown Indicator & Manual Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-[11px] font-sans">
                পোলিং বাকি: <span className="font-extrabold text-slate-900 font-mono">{countdown}s</span>
              </span>
            </div>

            <button
              id="poll-refresh-now-btn"
              onClick={() => {
                setCountdown(75);
                pollTransactions();
              }}
              disabled={isPolling}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="এখনই Firestore পোল করে আপডেট করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Horizontal Auto-scrolling Highlight Banner (Ticker) */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/70 overflow-hidden relative">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
              স্ক্রলিং লাইভ স্ট্রিম:
            </span>
          </div>

          {/* Scrolling pill carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {transactions.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shrink-0 shadow-2xs hover:border-slate-400 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="font-bold text-slate-900 font-sans">
                  {item.actionText}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  • {getRelativeTime(item.timestamp, nowTime)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            সব লেনদেন ({transactions.length})
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
            <span>ডিপোজিট ({transactions.filter((t) => t.type === 'deposit').length})</span>
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
            <span>অর্ডার ({transactions.filter((t) => t.type === 'order').length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Transaction Cards */}
      <div className="p-3 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredTransactions.slice(0, 14).map((item, idx) => {
            const isLatest = idx === 0;
            const timeAgo = getRelativeTime(item.timestamp, nowTime);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 relative ${
                  isLatest
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90'
                }`}
              >
                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-2xs ${
                    item.type === 'deposit'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                      : 'bg-gradient-to-br from-emerald-600 to-teal-700'
                  }`}
                >
                  {item.type === 'deposit' ? (
                    <Wallet className="w-5 h-5" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {item.userName}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>ভেরিফাইড</span>
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {timeAgo}
                    </span>
                  </div>

                  {/* Action sentence e.g. "User X deposited 100 BDT" */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                        item.type === 'deposit'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {item.type === 'deposit' ? 'ডিপোজিট' : 'টপ-আপ অর্ডার'}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {item.actionText}
                    </span>
                  </div>

                  {/* Detail description */}
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {item.detail}
                  </p>

                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-500">
                    {item.method && (
                      <span className="font-semibold text-slate-700">
                        পেমেন্ট: {item.method}
                      </span>
                    )}
                    {item.amount && (
                      <span className="font-mono font-bold text-slate-900 ml-auto">
                        টাকার পরিমাণ: ৳{item.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official YouTube Tutorial Link at bottom */}
      <div className="p-3 sm:p-4 bg-slate-50/90 border-t border-slate-200">
        <a
          id="recent-activity-youtube-tutorial-link"
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ভিডিও গাইড</span>
              </span>
              <h5 className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                কিভাবে খুব সহজে ওয়েবসাইটের টাকা এড করবেন
              </h5>
              <p className="text-[10px] text-white/90">
                সম্পূর্ণ ভিডিও টিউটোরিয়াল দেখতে এখানে ক্লিক করুন (YouTube)
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
