import React, { useState } from 'react';
import { useApp, cleanDisplayTimestamp } from '../context/AppContext';
import { Order } from '../types';
import { 
  ShoppingBag, Clock, CheckCircle2, XCircle, Gamepad2, 
  Search, FileText, Activity, MessageCircle
} from 'lucide-react';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { OrderStatusTracker } from './OrderStatusTracker';

export const OrdersView: React.FC = () => {
  const { orders, currentUser, setActiveTab, activeTrackingOrderId, setActiveTrackingOrderId } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-sora">
            অর্ডার হিস্ট্রি দেখতে লগইন করুন
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
            আপনার ক্রয়কৃত সকল অর্ডার ও লাইভ ডেলিভারি ট্র্যাকিং দেখতে আপনার অ্যাকাউন্টে লগইন করুন।
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('login')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E0A500] hover:bg-[#B98A00] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            লগইন করুন
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all cursor-pointer"
          >
            টপ-আপ শপ দেখুন
          </button>
        </div>
      </div>
    );
  }

  // User's orders
  const myOrders = orders.filter((o) => o.userId === currentUser.id);

  const filteredOrders = myOrders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.playerId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSelectToTrack = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    const element = document.getElementById(`order-status-tracker-${orderId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span>আমার অর্ডারসমূহ ও লাইভ ট্র্যাকিং</span>
          </h2>
          <p className="text-xs text-slate-800 mt-1 font-medium">
            প্রতিটি ক্রয়ের 'Pending' থেকে 'Processing' হয়ে 'Delivered' পর্যন্ত রিয়েল-টাইম পর্যবেক্ষণ
          </p>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>নতুন টপ-আপ করুন</span>
        </button>
      </div>

      {/* Prominent Real-Time Order Status Tracker */}
      {myOrders.length > 0 && (
        <OrderStatusTracker
          onViewReceipt={(order) => setSelectedReceiptOrder(order)}
        />
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'সব অর্ডার' },
            { id: 'pending', label: 'পেন্ডিং (Pending)' },
            { id: 'processing', label: 'প্রসেসিং (Processing)' },
            { id: 'delivered', label: 'ডেলিভার্ড (Delivered)' },
            { id: 'failed', label: 'ব্যর্থ' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`orders-filter-${tab.id}`}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap border cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white border-slate-300 text-black hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
          <input
            id="orders-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি বা UID খুঁজুন..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-black placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-black shadow-xs"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-extrabold text-black">কোনো অর্ডার পাওয়া যায়নি</p>
          <p className="text-xs text-slate-800 max-w-sm mx-auto font-medium">
            আপনি এখনো কোনো গেম টপ-আপ করেননি অথবা ফিল্টারে কোনো ম্যাচ মেলেনি।
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-slate-800"
          >
            টপ-আপ ক্যাটালগে যান
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>অর্ডারের ইতিহাস ({filteredOrders.length})</span>
            <span>সর্বশেষ অর্ডার আগে</span>
          </div>

          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isProcessing = order.status === 'processing';
            const isDelivered = order.status === 'delivered';
            const isFailed = order.status === 'failed';
            const isCurrentlyTracked = activeTrackingOrderId === order.id;

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all space-y-4 shadow-xs ${
                  isCurrentlyTracked
                    ? 'border-black ring-2 ring-slate-200'
                    : 'border-slate-300 hover:border-slate-500'
                }`}
              >
                {/* Top Row: Game & Status */}
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-800 shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-black">{order.productTitle}</h4>
                        {isCurrentlyTracked && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-black text-white">
                            ট্র্যাক করা হচ্ছে
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-800 font-bold">{order.packageName}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                        <span>Pending</span>
                      </span>
                    )}

                    {isProcessing && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-950 border border-blue-300 text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <span>Processing</span>
                      </span>
                    )}

                    {isDelivered && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Delivered</span>
                      </span>
                    )}

                    {isFailed && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        <span>{order.refunded ? 'বাতিল ও রিফান্ডেড (Refunded)' : 'বাতিল (Rejected)'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Progression Mini-Stepper Bar */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600">ডেলিভারি পর্যায়:</span>
                    <span className="text-black font-extrabold">
                      {isPending
                        ? 'ধাপ ১: Pending (অর্ডার গৃহীত ও ওয়ালেট কর্তন সম্পন্ন)'
                        : isProcessing
                        ? 'ধাপ ২: Processing (সার্ভার প্রসেসিং চলছে)'
                        : isDelivered
                        ? 'ধাপ ৩: Delivered (সফল ডেলিভারি)'
                        : order.refunded
                        ? `বাতিল — সম্পূর্ণ মূল্য (৳ ${order.price}) ওয়ালেটে রিফান্ড করা হয়েছে`
                        : 'অর্ডারটি বাতিল করা হয়েছে'}
                    </span>
                  </div>

                  {/* 3 Step Indicator Dots & Line */}
                  <div className="flex items-center justify-between relative px-2 pt-1">
                    {/* Connecting background bar */}
                    <div className="absolute left-6 right-6 top-3 h-1 bg-slate-200 -z-0">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDelivered
                            ? 'bg-emerald-500 w-full'
                            : isProcessing
                            ? 'bg-blue-500 w-1/2'
                            : 'bg-amber-400 w-0'
                        }`}
                      ></div>
                    </div>

                    {/* Step 1: Pending */}
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isPending
                            ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                            : 'bg-black text-white'
                        }`}
                      >
                        1
                      </div>
                      <span className="text-[10px] font-bold text-slate-800">Pending</span>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isProcessing
                            ? 'bg-blue-600 text-white ring-2 ring-blue-200 animate-pulse'
                            : isDelivered
                            ? 'bg-black text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        2
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isProcessing ? 'text-blue-700 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        Processing
                      </span>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isDelivered
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isDelivered ? '✓' : '3'}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isDelivered ? 'text-emerald-700 font-extrabold' : 'text-slate-600'
                        }`}
                      >
                        Delivered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-600 text-[10px] block font-bold">অর্ডার আইডি</span>
                    <span className="font-mono text-black font-extrabold">{order.id}</span>
                  </div>

                  <div>
                    <span className="text-slate-600 text-[10px] block font-bold">প্লেয়ার আইডি / লিংক</span>
                    <span className="font-mono text-black font-bold truncate block" title={order.playerId}>
                      {order.playerId}
                    </span>
                    {order.zoneId && (
                      <span className="text-[10px] text-slate-700 block font-semibold">({order.zoneId})</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-600 text-[10px] block font-bold">পরিশোধিত মূল্য</span>
                    <span className="font-sans font-extrabold text-black text-sm">৳ {order.price.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-slate-600 text-[10px] block font-bold">অর্ডারের সময়</span>
                    <span className="text-black font-medium">{cleanDisplayTimestamp(order.createdAt)}</span>
                  </div>
                </div>

                {/* Notes & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-slate-200">
                  <div className="text-slate-700 font-medium text-[11px] truncate max-w-md">
                    {order.notes ? (
                      <span>স্ট্যাটাস নোট: <strong className="text-black">{order.notes}</strong></span>
                    ) : (
                      <span>স্বয়ংক্রিয় এপিআই গেটওয়ের মাধ্যমে ডেলিভারি প্রক্রিয়া সম্পন্ন হচ্ছে।</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      id={`track-order-btn-${order.id}`}
                      onClick={() => handleSelectToTrack(order.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                        isCurrentlyTracked
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-black hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>লাইভ ট্র্যাকার</span>
                    </button>

                    <button
                      id={`view-receipt-${order.id}`}
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="inline-flex items-center gap-1 text-black hover:bg-slate-200 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-black" />
                      <span>রিসিট</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 shadow-2xl text-black">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-black" />
                <span className="font-extrabold text-base text-black">অফিশিয়াল পেমেন্ট রিসিট</span>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-xs text-black font-bold hover:bg-slate-200 px-2 py-1 bg-slate-100 border border-slate-300 rounded cursor-pointer"
              >
                বন্ধ
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs shadow-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="text-xs font-extrabold text-black tracking-wider">DC TOP UP BANGLADESH</span>
                <p className="text-[10px] text-slate-800 font-medium">অটোমেটেড ইন-গেম টপ-আপ ইনভয়েস</p>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">ইনভয়েস নং:</span>
                <span className="font-mono font-bold text-black">{selectedReceiptOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">গ্রাহকের নাম:</span>
                <span className="text-black font-bold">{selectedReceiptOrder.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">গেম ও প্যাকেজ:</span>
                <span className="text-black font-bold">{selectedReceiptOrder.productTitle} - {selectedReceiptOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">প্লেয়ার আইডি (UID):</span>
                <span className="font-mono text-black font-extrabold">{selectedReceiptOrder.playerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-800 font-medium">স্ট্যাটাস:</span>
                <span className="font-bold capitalize text-emerald-800">{selectedReceiptOrder.status}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
                <span className="text-black">মোট কর্তন:</span>
                <span className="text-black font-sans font-extrabold">৳ {selectedReceiptOrder.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-800 text-center font-medium">
              যেকোনো সমস্যায় আমাদের WhatsApp হেল্পলাইনে ({SUPPORT_PHONE_FORMATTED}) এই ইনভয়েস নম্বরটি উল্লেখ করুন।
            </div>

            <a
              id="invoice-modal-whatsapp-btn"
              href={`${SUPPORT_WHATSAPP_LINK}?text=${encodeURIComponent(`হ্যালো DC Top Up, আমার ইনভয়েস নং ${selectedReceiptOrder.id} নিয়ে সহায়তা চাই।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp হেল্পলাইনে মেসেজ দিন ({SUPPORT_PHONE_FORMATTED})</span>
            </a>

            <button
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

