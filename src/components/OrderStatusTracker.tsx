import React, { useState, useEffect } from 'react';
import { useApp, cleanDisplayTimestamp } from '../context/AppContext';
import { Order } from '../types';
import { SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { 
  CheckCircle2, Clock, RefreshCw, XCircle, AlertCircle, 
  Copy, Check, FileText, Zap, Play, HelpCircle
} from 'lucide-react';

interface OrderStatusTrackerProps {
  order?: Order;
  onViewReceipt?: (order: Order) => void;
  className?: string;
  compact?: boolean;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  order: propOrder,
  onViewReceipt,
  className = '',
  compact = false
}) => {
  const { orders, currentUser, activeTrackingOrderId, setActiveTrackingOrderId } = useApp();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Filter user orders
  const myOrders = currentUser ? orders.filter((o) => o.userId === currentUser.id) : [];

  // Determine current active order
  const activeOrder = propOrder || 
    (activeTrackingOrderId ? myOrders.find((o) => o.id === activeTrackingOrderId) : null) || 
    myOrders[0];

  // Auto-switch to activeTrackingOrderId if updated
  useEffect(() => {
    if (!propOrder && activeTrackingOrderId && myOrders.some((o) => o.id === activeTrackingOrderId)) {
      // already matched
    }
  }, [activeTrackingOrderId, propOrder, myOrders]);

  if (!activeOrder) {
    return null;
  }

  const handleCopy = (text: string, type: 'id' | 'uid') => {
    navigator.clipboard?.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const status = activeOrder.status;
  const isPending = status === 'pending';
  const isProcessing = status === 'processing';
  const isDelivered = status === 'delivered';
  const isFailed = status === 'failed';

  // Step calculations
  // Step 1: Pending (always completed once created)
  const step1Completed = true;
  const step1Active = isPending;

  // Step 2: Processing
  const step2Completed = isDelivered;
  const step2Active = isProcessing;

  // Step 3: Delivered
  const step3Completed = isDelivered;
  const step3Active = isDelivered;

  // Percentage for progress bar
  let progressPercent = 33;
  if (isProcessing) progressPercent = 66;
  if (isDelivered) progressPercent = 100;
  if (isFailed) progressPercent = 100;

  return (
    <div
      id={`order-status-tracker-${activeOrder.id}`}
      className={`rounded-2xl bg-white border border-slate-300 shadow-sm text-black transition-all ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-extrabold text-sm sm:text-base text-black flex items-center gap-2">
              <span>রিয়েল-টাইম অর্ডার ট্র্যাকার (Live Status)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
              ● লাইভ
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            অর্ডার গৃহীত হওয়া থেকে ডেলিভারি পর্যন্ত প্রতি ধাপের তাৎক্ষণিক অগ্রগতি
          </p>
        </div>

        {/* Order Selector Chips if multiple orders */}
        {myOrders.length > 1 && !propOrder && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-xs text-xs">
            <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">অন্যান্য অর্ডার:</span>
            {myOrders.slice(0, 4).map((o) => (
              <button
                key={o.id}
                id={`tracker-select-${o.id}`}
                onClick={() => setActiveTrackingOrderId(o.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  activeOrder.id === o.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {o.id.replace('ORD-', '#')}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Active Order Summary Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-black">{activeOrder.productTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-black font-bold">
                {activeOrder.packageName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">অর্ডার আইডি:</span>
                <span className="font-mono font-extrabold text-black">{activeOrder.id}</span>
                <button
                  onClick={() => handleCopy(activeOrder.id, 'id')}
                  className="p-0.5 text-slate-600 hover:text-black transition-colors cursor-pointer"
                  title="অর্ডার আইডি কপি করুন"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-600 font-semibold">আইডি/লিংক:</span>
                <span className="font-mono font-bold text-black max-w-[140px] truncate" title={activeOrder.playerId}>
                  {activeOrder.playerId}
                </span>
                <button
                  onClick={() => handleCopy(activeOrder.playerId, 'uid')}
                  className="p-0.5 text-slate-600 hover:text-black transition-colors cursor-pointer"
                  title="প্লেয়ার আইডি কপি করুন"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <span className="text-slate-600 font-semibold">মূল্য:</span>
                <span className="font-sans font-extrabold text-black ml-1">৳ {activeOrder.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-extrabold shadow-xs">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Pending (গৃহীত)</span>
              </span>
            )}

            {isProcessing && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-950 border border-blue-300 text-xs font-extrabold shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin" />
                <span>Processing (প্রসেসিং চলছে)</span>
              </span>
            )}

            {isDelivered && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-extrabold shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Delivered (ডেলিভার্ড)</span>
              </span>
            )}

            {isFailed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-extrabold shadow-xs">
                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                <span>{activeOrder.refunded ? 'বাতিল ও রিফান্ড সম্পন্ন' : 'Failed (ব্যর্থ)'}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3-Step Real-time Progression Stepper */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>অগ্রগতি (Progression Timeline)</span>
            <span>
              {isDelivered ? '১০০% সম্পন্ন' : isProcessing ? '৬৬% প্রসেসিং' : isPending ? '৩৩% গৃহীত' : activeOrder.refunded ? 'বাতিল ও রিফান্ডেড' : 'ব্যর্থ'}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isFailed
                  ? 'bg-rose-500'
                  : isDelivered
                  ? 'bg-emerald-600'
                  : isProcessing
                  ? 'bg-blue-600 animate-pulse'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Step 1: Pending */}
            <div
              className={`p-4 rounded-xl border transition-all space-y-2 ${
                step1Active
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
                  : step1Completed
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      step1Active
                        ? 'bg-amber-500 text-white animate-bounce'
                        : step1Completed
                        ? 'bg-black text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    1
                  </div>
                  <span className="font-extrabold text-xs text-black">Pending</span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {step1Active ? 'চলতি পর্যায়' : 'সম্পন্ন'}
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-xs text-black">অর্ডার গ্রহণ ও পেমেন্ট</h5>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  পেমেন্ট যাচাই সম্পন্ন ও সিস্টেম অর্ডার নিশ্চিত করেছে।
                </p>
              </div>

              <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>{cleanDisplayTimestamp(activeOrder.createdAt)}</span>
              </div>
            </div>

            {/* Step 2: Processing */}
            <div
              className={`p-4 rounded-xl border transition-all space-y-2 ${
                step2Active
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200'
                  : step2Completed
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      step2Active
                        ? 'bg-blue-600 text-white animate-pulse'
                        : step2Completed
                        ? 'bg-black text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step2Active ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '2'}
                  </div>
                  <span className="font-extrabold text-xs text-black">Processing</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    step2Active
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : step2Completed
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step2Active ? 'সার্ভার প্রসেসিং' : step2Completed ? 'সম্পন্ন' : 'অপেক্ষমাণ'}
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-xs text-black">সার্ভার এপিআই ডেলিভারি কিউ</h5>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  প্লেয়ার আইডি যাচাই ও গেম সার্ভারে ডায়মন্ড পাঠানোর প্রক্রিয়া চলমান।
                </p>
              </div>

              <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>
                  {cleanDisplayTimestamp(activeOrder.processingAt) || (step2Active ? 'বর্তমানে চলমান...' : step2Completed ? 'সম্পন্ন' : 'পরবর্তী ধাপ')}
                </span>
              </div>
            </div>

            {/* Step 3: Delivered */}
            <div
              className={`p-4 rounded-xl border transition-all space-y-2 ${
                step3Active
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      step3Active
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step3Active ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                  </div>
                  <span className="font-extrabold text-xs text-black">Delivered</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    step3Active
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step3Active ? 'সফল ডেলিভারি' : 'চূড়ান্ত ধাপ'}
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-xs text-black">ইন-গেম একাউন্টে সফল জমা</h5>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  ডায়মন্ড বা সার্ভিস সরাসরি একাউন্টে পৌঁছে গেছে।
                </p>
              </div>

              <div className="pt-1 text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>
                  {cleanDisplayTimestamp(activeOrder.deliveredAt) || (step3Active ? 'ডেলিভার্ড' : 'আনুমানিক ১-২ মিনিট')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Failed Banner if order status is failed */}
        {isFailed && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-rose-900 block">
                {activeOrder.refunded ? `অর্ডার বাতিল — সম্পূর্ণ মূল্য (৳ ${activeOrder.price}) ওয়ালেটে রিফান্ড করা হয়েছে` : 'ডেলিভারি প্রক্রিয়ায় সমস্যা দেখা দিয়েছে'}
              </span>
              <p className="font-medium text-slate-800">
                {activeOrder.notes || 'সার্ভার থেকে গেম আইডি বা লিংকটি বৈধভাবে সনাক্ত করা যায়নি। হেল্পলাইনে যোগাযোগ করুন।'}
              </p>
            </div>
          </div>
        )}

        {/* Live Status Note & Transaction Reference */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-slate-800 font-medium">
              সার্ভার নোট: <strong className="text-black">{activeOrder.notes || 'স্বয়ংক্রিয় এপিআই গেটওয়ের মাধ্যমে ডেলিভারি হচ্ছে।'}</strong>
            </span>
          </div>

          {activeOrder.serverRef && (
            <div className="text-[11px] text-slate-600 font-mono">
              রেফারেন্স: <strong className="text-black">{activeOrder.serverRef}</strong>
            </div>
          )}
        </div>

        {/* Interactive Controls & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">বর্তমান স্ট্যাটাস:</span>
            <span
              className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                isDelivered
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : isProcessing
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : isFailed
                  ? 'bg-rose-100 text-rose-950 border border-rose-300'
                  : 'bg-amber-100 text-amber-950 border border-amber-300'
              }`}
            >
              {isDelivered ? 'ডেলিভার্ড (Delivered)' : isProcessing ? 'প্রসেসিং (Processing)' : isFailed ? 'বাতিল' : 'অপেক্ষমাণ (Pending)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onViewReceipt && (
              <button
                id={`tracker-view-receipt-${activeOrder.id}`}
                onClick={() => onViewReceipt(activeOrder)}
                className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>অফিশিয়াল রিসিট</span>
              </button>
            )}

            <a
              id={`tracker-whatsapp-help-${activeOrder.id}`}
              href={`${SUPPORT_WHATSAPP_LINK}?text=${encodeURIComponent(`হ্যালো DC Top Up সাপোর্ট, আমার অর্ডার আইডি ${activeOrder.id} নিয়ে সহায়তা প্রয়োজন।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              title={`২৪/৭ হোয়াটসঅ্যাপ কাস্টমার সাপোর্ট হেল্পলাইন (${SUPPORT_PHONE_FORMATTED})`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>২৪/৭ WhatsApp সহায়তা</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
