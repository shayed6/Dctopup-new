import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TopUpProduct, TopUpPackage } from '../types';
import { SafeImage } from './SafeImage';
import { 
  X, AlertTriangle, ShieldCheck, Zap, Wallet, 
  PlusCircle, HelpCircle, CheckCircle2, Gift, Sparkles, Trophy, ShieldAlert, Loader2
} from 'lucide-react';

interface PurchaseModalProps {
  product: TopUpProduct;
  onClose: () => void;
  onGoToDeposit: () => void;
  onGoToOrders: () => void;
}

const MYSTERY_BOX_TIERS = [
  {
    id: 'mb_bronze',
    title: '১. ব্রোঞ্জ বক্স',
    titleEn: 'Bronze Box',
    icon: '🥉',
    badge: 'ব্রোঞ্জ বক্স',
    headerBg: 'bg-amber-100/90 text-amber-950 border-amber-300',
    cardBorder: 'border-amber-400/60',
    selectedRing: 'ring-amber-500 bg-amber-50/40',
    rewards: [
      '25 diamond',
      '110 diamond',
      'weekly light',
      '1 টা weekly'
    ]
  },
  {
    id: 'mb_silver',
    title: '২. সিলভার বক্স',
    titleEn: 'Silver Box',
    icon: '🥈',
    badge: 'সিলভার বক্স',
    headerBg: 'bg-slate-200 text-slate-900 border-slate-300',
    cardBorder: 'border-slate-400/60',
    selectedRing: 'ring-slate-500 bg-slate-50/70',
    rewards: [
      '১০০ diamond',
      '310 diamond',
      '2 টা weekly',
      '1 টা monthly'
    ]
  },
  {
    id: 'mb_gold',
    title: '৩. গোল্ড বক্স',
    titleEn: 'Gold Box',
    icon: '🥇',
    badge: 'গোল্ড বক্স',
    headerBg: 'bg-yellow-200 text-yellow-950 border-yellow-400',
    cardBorder: 'border-yellow-500/60',
    selectedRing: 'ring-yellow-500 bg-yellow-50/50',
    rewards: [
      '1 টা weekly',
      '3 টা উইকলি',
      '520 diamond',
      '১ টা monthly'
    ]
  },
  {
    id: 'mb_diamond',
    title: '৪. ডায়মন্ড বক্স',
    titleEn: 'Diamond Box',
    icon: '💎',
    badge: 'ডায়মন্ড বক্স',
    headerBg: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    cardBorder: 'border-cyan-400/60',
    selectedRing: 'ring-cyan-500 bg-cyan-50/50',
    rewards: [
      '520 Diamond',
      '1 টা monthly',
      '2100 diamond',
      '1 টা weekly'
    ]
  }
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  onClose,
  onGoToDeposit,
  onGoToOrders
}) => {
  const { currentUser, purchaseProduct, setActiveTab, showToast } = useApp();
  
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage>(
    product.packages.find((p) => p.popular) || product.packages[0]
  );
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseSuccessOrder, setPurchaseSuccessOrder] = useState<any>(null);
  const [showUidGuide, setShowUidGuide] = useState(false);

  const isMysteryBox = product.id === 'mystery_box' || product.title.toLowerCase().includes('mystery');

  const price = selectedPackage?.price || 0;
  const isOutOfStock = Boolean(product.isOutOfStock || selectedPackage?.isOutOfStock);
  const isBanned = currentUser?.status === 'banned';
  const currentBalance = currentUser?.walletBalance || 0;
  const isInsufficient = currentUser ? currentBalance < price : false;
  const shortage = isInsufficient ? price - currentBalance : 0;

  const handleConfirmPurchase = async () => {
    if (!currentUser) {
      showToast('অর্ডার সম্পন্ন করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।', 'info');
      onClose();
      setActiveTab('login');
      return;
    }

    if (isBanned) {
      showToast('আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে। নতুন অর্ডার করা সম্ভব নয়।', 'error');
      return;
    }

    if (isOutOfStock) {
      showToast('দুঃখিত, এই প্যাকেজটি বর্তমানে স্টক আউট।', 'error');
      return;
    }

    if (!playerId || playerId.trim().length < 5) {
      showToast(`অনুগ্রহ করে সঠিক ${product.playerIdLabel} প্রদান করুন।`, 'error');
      return;
    }

    if (product.requiresZoneId && (!zoneId || zoneId.trim().length < 3)) {
      showToast('সঠিক Zone ID প্রদান করুন।', 'error');
      return;
    }

    if (isInsufficient) {
      showToast(`অপর্যাপ্ত ওয়ালেট ব্যালেন্স! আপনার ঘাটতি আছে ৳ ${shortage.toFixed(2)}`, 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await purchaseProduct(product.id, selectedPackage.id, playerId.trim(), zoneId.trim());

    if (result.success && result.order) {
      setPurchaseSuccessOrder(result.order);
    } else if (result.error) {
      showToast(result.error, 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div 
        id="purchase-modal-container"
        className="w-full max-w-lg bg-white border border-slate-300 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-black"
      >
        {/* Modal Header */}
        <div className="relative p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafeImage
              src={product.image}
              alt={product.title}
              title={product.title}
              category={product.category}
              className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-black">
                  {product.title}
                </h3>
              </div>
              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-700" />
                <span>অটো ইনস্ট্যান্ট ডেলিভারি</span>
              </p>
            </div>
          </div>

          <button
            id="purchase-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Modal Body */}
        {purchaseSuccessOrder ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-black">অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h4>
              <p className="text-xs text-slate-800 font-medium">
                অর্ডার আইডি: <span className="font-mono text-black font-extrabold">{purchaseSuccessOrder.id}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">পণ্য ও প্যাকেজ:</span>
                <span className="font-extrabold text-black">{purchaseSuccessOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">প্লেয়ার আইডি:</span>
                <span className="font-mono font-extrabold text-black">{purchaseSuccessOrder.playerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-bold">কাটা হয়েছে:</span>
                <span className="font-extrabold text-black">৳ {purchaseSuccessOrder.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">অবশিষ্ট ওয়ালেট ব্যালেন্স:</span>
                <span className="font-extrabold text-black">৳ {currentUser ? currentUser.walletBalance.toFixed(2) : '0.00'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-black text-xs text-left flex items-start gap-2 shadow-xs font-medium">
              <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                আপনার ডায়মন্ড/ইউসি ১-৩ মিনিটের মধ্যে গেম একাউন্টে পৌঁছে যাবে। বর্তমান স্ট্যাটাস 'অর্ডারসমূহ' পেজে ট্র্যাক করুন।
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onGoToOrders}
                className="flex-1 py-3 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                অর্ডার ট্র্যাকিং দেখুন
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs border border-slate-300 cursor-pointer"
              >
                আরও টপ-আপ করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Step 1: Target identifier (UID or Link/Username) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] flex items-center justify-center font-bold border border-emerald-300">১</span>
                  <span>আপনার {product.playerIdLabel} প্রদান করুন *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowUidGuide(!showUidGuide)}
                  className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{product.category === 'facebook' || product.category === 'tiktok' ? 'লিংক কোথায় পাবেন?' : 'UID কোথায় পাবেন?'}</span>
                </button>
              </div>

              <input
                id="player-id-input"
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder={
                  product.category === 'tiktok'
                    ? 'যেমন: https://www.tiktok.com/@username/video/...'
                    : product.category === 'facebook'
                    ? 'যেমন: https://www.facebook.com/page-or-profile-link'
                    : `যেমন: 2849182941 (${product.playerIdLabel})`
                }
                className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
              />

              {product.requiresZoneId && (
                <div className="pt-1">
                  <label className="text-xs font-bold text-black block mb-1">
                    {product.zoneIdLabel || 'Zone ID'} *
                  </label>
                  <input
                    id="zone-id-input"
                    type="text"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="যেমন: 2049 (Zone ID)"
                    className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                  />
                </div>
              )}

              {showUidGuide && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-black space-y-1">
                  <p className="font-bold text-black">
                    {product.category === 'facebook' || product.category === 'tiktok'
                      ? 'কিভাবে লিংক বা ইউজারনেম কপি করবেন:'
                      : 'কিভাবে Player ID পাবেন:'}
                  </p>
                  <p className="text-slate-800 font-medium">
                    {product.category === 'facebook' || product.category === 'tiktok'
                      ? 'আপনার ফেসবুক বা টিকটক অ্যাপ ওপেন করে কাঙ্ক্ষিত পেজ, প্রোফাইল বা পোস্টের Share অপশন থেকে "Copy Link" এ চাপ দিয়ে লিংক কপি করে এখানে পেস্ট করুন।'
                      : 'গেম ওপেন করে বামদিকের প্রোফাইল পিকচারে ট্যাপ করুন। নামের নিচে থাকা ৮-১০ ডিজিটের আইডি নম্বরটি কপি করে এখানে পেস্ট করুন।'}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Choose Package */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-black flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] flex items-center justify-center font-bold border border-emerald-300">২</span>
                <span>প্যাকেজ নির্বাচন করুন</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {product.packages.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id;
                  const pkgOutOfStock = Boolean(product.isOutOfStock || pkg.isOutOfStock);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      id={`package-btn-${pkg.id}`}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        pkgOutOfStock
                          ? 'bg-rose-50/50 border-rose-200 text-slate-700 opacity-90'
                          : isSelected
                          ? 'bg-slate-50 border-black text-black shadow-xs ring-2 ring-black'
                          : 'bg-white border-slate-300 text-black hover:bg-slate-50'
                      }`}
                    >
                      {pkgOutOfStock ? (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white shadow-xs">
                          স্টক আউট
                        </span>
                      ) : pkg.popular ? (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-400 text-black shadow-xs">
                          জনপ্রিয়
                        </span>
                      ) : null}

                      <div className="font-bold text-xs sm:text-sm text-black flex items-center gap-1">
                        <span>{pkg.amount}</span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-black font-sans">
                          ৳ {pkg.price}
                        </span>
                        {pkg.originalPrice && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ৳ {pkg.originalPrice}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isMysteryBox && (
                <div className="pt-1 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('mystery-box-details-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-1 cursor-pointer underline underline-offset-2"
                  >
                    <span>🎁 কোন বক্সে কি পাবেন? নিচে 'Details' সেকশন দেখুন ↓</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Wallet Balance & Payment Summary */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                    <img src="/dc_logo.jpg" alt="DC Wallet" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-black block">ডিসি গেমিং ওয়ালেট (DC Wallet)</span>
                    <span className="text-[10px] text-emerald-800 font-bold">ইনস্ট্যান্ট পেমেন্ট ও ১-৩ মিনিটে অটো ডেলিভারি</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-medium flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-black" />
                    <span>আপনার বর্তমান ব্যালেন্স:</span>
                  </span>
                  <span className="font-extrabold font-sans text-black">৳ {currentBalance.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-medium">প্যাকেজের মূল্য:</span>
                  <span className="font-extrabold font-sans text-black">৳ {price.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-semibold">
                  <span className="text-black font-bold">লেনদেন পরবর্তী ব্যালেন্স:</span>
                  <span className={`font-sans font-extrabold ${isInsufficient ? 'text-rose-700' : 'text-black'}`}>
                    {isInsufficient ? `ঘাটতি ৳ ${shortage.toFixed(2)}` : `৳ ${(currentBalance - price).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Insufficient Balance Notice & Prompt */}
              {isInsufficient && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs space-y-3 animate-in fade-in shadow-xs">
                  <div className="flex items-start gap-2 text-rose-950 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">অপর্যাপ্ত ওয়ালেট ব্যালেন্স!</span>
                      <span>
                        এই প্যাকেজটি কিনতে আরও <span className="font-extrabold text-black font-mono">৳ {shortage.toFixed(2)}</span> টাকা প্রয়োজন।
                      </span>
                    </div>
                  </div>

                  <button
                    id="insufficient-add-money-btn"
                    onClick={() => {
                      onClose();
                      onGoToDeposit();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>টাকা যোগ করুন (Add ৳{Math.ceil(shortage)})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Banned User Blocked Alert */}
            {isBanned && (
              <div id="banned-user-order-blocked-alert" className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-950 text-xs space-y-1.5 animate-in fade-in shadow-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-sm text-red-900 block">
                      আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে
                    </span>
                    <p className="text-red-800 leading-relaxed font-medium mt-0.5">
                      অ্যাকাউন্ট স্থগিত (Banned) থাকায় বর্তমানে নতুন কোনো অর্ডার প্লেস করা সম্ভব নয়। বিস্তারিত জানতে সহায়তায় যোগাযোগ করুন।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Purchase Action */}
            <div className="pt-2">
              <button
                id="confirm-purchase-btn"
                type="button"
                disabled={isOutOfStock || isBanned || (currentUser !== null && isInsufficient) || isSubmitting}
                onClick={handleConfirmPurchase}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>অর্ডার প্রক্রিয়া চলছে (টাকা কাটা হচ্ছে)...</span>
                  </>
                ) : isBanned ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>অ্যাকাউন্ট সাময়িকভাবে বন্ধ রয়েছে (অর্ডার নিষ্ক্রিয়)</span>
                  </>
                ) : isOutOfStock ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>বর্তমানে স্টক আউট (Out of Stock)</span>
                  </>
                ) : !currentUser ? (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>লগইন করে অর্ডার কনফার্ম করুন (৳ {price})</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isInsufficient
                        ? 'অপর্যাপ্ত ব্যালেন্স - টাকা যোগ করুন'
                        : `ওয়ালেট দিয়ে অর্ডার কনফার্ম করুন (৳ ${price})`}
                    </span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-800 font-medium mt-2">
                {isOutOfStock
                  ? 'এই প্যাকেজটি বর্তমানে পাওয়া যাচ্ছে না। এডমিন স্টক রিস্টক করলে আবার কেনা যাবে।'
                  : `অর্ডার নিশ্চিত করার সাথে সাথে ওয়ালেট থেকে ৳ ${price} কর্তন করা হবে।`}
              </p>
            </div>

            {/* Mystery Box 'Details' Section - Exactly at the bottom */}
            {isMysteryBox && (
              <div 
                id="mystery-box-details-section"
                className="mt-6 pt-5 border-t-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/60 p-4 sm:p-5 space-y-4 text-slate-900 shadow-xs animate-in fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-sora">
                        Details
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        মিস্ট্রি বক্স প্যাকেজের বিস্তারিত তথ্য:
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                    প্যাকেজ বিবরণ
                  </span>
                </div>

                {/* 1, 2, 3, 4 Package Information Breakdown */}
                <div className="space-y-2.5 text-xs">
                  {/* 1. ব্রোঞ্জ বক্স */}
                  <div className="p-3.5 rounded-xl bg-white border border-amber-300/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                        <span>🥉</span>
                        <span>1. ব্রোঞ্জ বক্স :</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                        ৳ 45
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 pl-5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>25 diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>110 diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>weekly light</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>1 টা weekly</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. সিলভার বক্স */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                        <span>🥈</span>
                        <span>2. সিলভার বক্স :</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-900 border border-slate-300 font-mono">
                        ৳ 120
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 pl-5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>১০০ diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>310 diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>2 টা weekly</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>1 টা monthly</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. গোল্ড বক্স */}
                  <div className="p-3.5 rounded-xl bg-white border border-yellow-400 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                        <span>🥇</span>
                        <span>3. গোল্ড বক্স :</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-yellow-200 text-yellow-950 border border-yellow-300 font-mono">
                        ৳ 390
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 pl-5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>1 টা weekly</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>3 টা উইকলি</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>520 diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>১ টা monthly</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. ডায়মন্ড বক্স */}
                  <div className="p-3.5 rounded-xl bg-white border border-cyan-400 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-950 text-sm flex items-center gap-1.5">
                        <span>💎</span>
                        <span>4. ডায়মন্ড বক্স :</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-950 border border-cyan-300 font-mono">
                        ৳ 790
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 pl-5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>520 Diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>1 টা monthly</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>2100 diamond</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="text-amber-600 font-bold">=</span>
                        <span>1 টা weekly</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descriptive Text Quote */}
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-300 text-slate-900 text-xs shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="font-bold leading-relaxed text-slate-900 text-[12px] sm:text-[13px]">
                      আপনারা যারা মিস্ট্রি বক্স অর্ডার করবেন তারা কোন প্যাকেজ নিলে কি কি পাবেন উপরে দেওয়া আছে এগুলোর ভিতর থেকে যে কোন একটা পাবেন যত বেশি মিষ্টির বক্স অর্ডার করবেন অত ভালো প্রাইস পাবেন 💎
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
