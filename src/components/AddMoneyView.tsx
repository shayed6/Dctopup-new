import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PAYMENT_ACCOUNTS, PAYMENT_NUMBERS, SUPPORT_WHATSAPP_LINK, SUPPORT_PHONE_FORMATTED } from '../data/initialData';
import { PaymentMethodType } from '../types';
import { SafeImage } from './SafeImage';
import { 
  Copy, Check, CheckCircle2, 
  Wallet, ShieldAlert, Info, RefreshCw, Smartphone, MessageCircle, ExternalLink 
} from 'lucide-react';

export const AddMoneyView: React.FC = () => {
  const { submitDeposit, currentUser, setActiveTab, showToast } = useApp();
  
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [amount, setAmount] = useState<string>('250');
  const [senderPhone, setSenderPhone] = useState<string>(currentUser?.phone || '');
  const [trxId, setTrxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNum, setCopiedNum] = useState<string | null>(null);
  const [lastSubmittedSuccess, setLastSubmittedSuccess] = useState<{ amount: number; trxId: string; method: string } | null>(null);

  const isBanned = currentUser?.status === 'banned';

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-sora">
            টাকা যোগ করতে লগইন প্রয়োজন
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
            ডিসি ওয়ালেটে ব্যালেন্স রিচার্জ ও লেনদেনের সঠিক রেকর্ডের জন্য অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।
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
            স্টোরফ্রন্ট ব্রাউজ করুন
          </button>
        </div>
      </div>
    );
  }

  const currentAccount = PAYMENT_ACCOUNTS[selectedMethod];

  const quickAmounts = [100, 250, 500, 1000, 2000];

  const handleCopyNumber = (rawNum: string, formattedNum: string) => {
    navigator.clipboard.writeText(rawNum.replace(/[^0-9]/g, ''));
    setCopiedNum(rawNum);
    showToast(`${formattedNum} নম্বরটি ক্লিপবোর্ডে কপি হয়েছে!`, 'success');
    setTimeout(() => setCopiedNum(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBanned) {
      showToast('আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে। ডিপোজিট গ্রহণ করা সম্ভব নয়।', 'error');
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 20) {
      showToast('সর্বনিম্ন ২০ টাকা ডিপোজিট করতে হবে।', 'error');
      return;
    }

    if (!senderPhone || senderPhone.trim().length < 11) {
      showToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের প্রেরক নম্বর লিখুন (01XXXXXXXXX)।', 'error');
      return;
    }

    if (!trxId || trxId.trim().length < 6) {
      showToast('অনুগ্রহ করে সঠিক Transaction ID (TrxID) লিখুন।', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDeposit(selectedMethod, numAmount, senderPhone.trim(), trxId.trim());
      setLastSubmittedSuccess({
        amount: numAmount,
        trxId: trxId.trim(),
        method: selectedMethod
      });
      setTrxId('');
      showToast('ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! শীঘ্রই ব্যালেন্স যুক্ত হবে।', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-10 bg-white text-black">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-amber-400 shrink-0 shadow-md shadow-cyan-500/20">
            <SafeImage
              src="/dc_logo.jpg"
              alt="DC Wallet"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-700" />
              <span>ডিসি ওয়ালেটে টাকা যোগ (DC Wallet Recharge)</span>
            </h2>
            <p className="text-xs text-slate-800 mt-0.5 font-medium">
              বিকাশ বা নগদে সেন্ড মানি করে ব্যালেন্স রিচার্জ করুন। ৩-৫ মিনিটে ভেরিফিকেশন সম্পন্ন হবে।
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 shrink-0 text-left sm:text-right shadow-xs">
          <span className="text-[10px] text-slate-700 uppercase tracking-wider font-bold block">বর্তমান ওয়ালেট ব্যালেন্স</span>
          <span className="text-xl font-extrabold text-black font-sans">
            ৳ {currentUser.walletBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Banned User Blocked Alert Banner */}
      {isBanned && (
        <div id="banned-account-deposit-banner" className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex items-start gap-3.5 shadow-xs">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-red-900">
              আপনার অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে
            </h4>
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              অ্যাকাউন্ট স্থগিত (Banned) থাকায় বর্তমানে নতুন কোনো টাকা যোগ (Deposit) বা রিকোয়েস্ট পাঠানোর সুবিধা নিষ্ক্রিয় করা হয়েছে। ওয়ালেট সংক্রান্ত কোনো প্রশ্ন বা সহায়তার জন্য নিচে দেওয়া হেল্পলাইনে যোগাযোগ করুন।
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Alert if just submitted */}
      {lastSubmittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">
                ৳{lastSubmittedSuccess.amount} ডিপোজিট রিকোয়েস্ট জমা নেওয়া হয়েছে!
              </p>
              <p className="text-xs text-emerald-900 mt-0.5">
                TrxID: <span className="font-mono font-bold">{lastSubmittedSuccess.trxId}</span> ({lastSubmittedSuccess.method.toUpperCase()})। সাধারণত ৩-১০ মিনিটের মধ্যে ভেরিফাই করে ওয়ালেটে টাকা যুক্ত হবে।
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastSubmittedSuccess(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Main Deposit Form Container */}
      <div className="space-y-6">
        {/* Video Guide: কিভাবে খুব সহজে ওয়েবসাইটের টাকা এড করবেন */}
        <a
          id="deposit-youtube-tutorial-link"
          href="https://youtube.com/@badshah_999x"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white transition-all shadow-sm hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current text-red-600" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-white/90 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ভিডিও টিউটোরিয়াল</span>
              </p>
              <h5 className="text-xs sm:text-sm font-extrabold text-white">
                কিভাবে খুব সহজে ওয়েবসাইটের টাকা এড করবেন
              </h5>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/20 text-white group-hover:bg-white group-hover:text-red-600 transition-colors flex items-center gap-1">
            <span>ভিডিও দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </a>

        {/* Step 1: Select Payment Method - Clean 2-column layout (bKash & Nagad only) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-xs flex items-center justify-center font-extrabold border border-emerald-300">১</span>
              <span>পেমেন্ট মাধ্যম বেছে নিন</span>
            </label>
            <span className="text-xs text-slate-800 font-bold">শুধু Send Money প্রযোজ্য</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* bKash */}
            <button
              type="button"
              id="select-method-bkash"
              onClick={() => setSelectedMethod('bkash')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center cursor-pointer ${
                selectedMethod === 'bkash'
                  ? 'bg-rose-50 border-[#D82365] text-black shadow-xs scale-[1.01]'
                  : 'bg-white border-slate-300 text-black hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#D82365] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                বিকাশ
              </div>
              <div>
                <span className="text-sm font-bold text-black block">bKash</span>
                <span className="text-[11px] text-slate-600 font-semibold">পার্সোনাল সেন্ড মানি</span>
              </div>
            </button>

            {/* Nagad */}
            <button
              type="button"
              id="select-method-nagad"
              onClick={() => setSelectedMethod('nagad')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center cursor-pointer ${
                selectedMethod === 'nagad'
                  ? 'bg-orange-50 border-[#F25822] text-black shadow-xs scale-[1.01]'
                  : 'bg-white border-slate-300 text-black hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F25822] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                নগদ
              </div>
              <div>
                <span className="text-sm font-bold text-black block">Nagad</span>
                <span className="text-[11px] text-slate-600 font-semibold">পার্সোনাল সেন্ড মানি</span>
              </div>
            </button>
          </div>

          {/* Account Details Box - Showing Official Number */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-xs font-extrabold text-black flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>আমাদের {selectedMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল নম্বর:</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 self-start sm:self-auto">
                বিকাশ ও নগদ পার্সোনাল
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PAYMENT_NUMBERS.map((item, idx) => {
                const isCopied = copiedNum === item.raw;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 hover:border-black transition-all flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                          অফিসিয়াল নম্বর
                        </span>
                        <span className="text-[11px] font-bold text-slate-700">বিকাশ ও নগদ পার্সোনাল</span>
                      </div>
                      <span className="text-lg sm:text-xl font-black text-black tracking-wider font-mono select-all">
                        {item.number}
                      </span>
                    </div>

                    <button
                      type="button"
                      id={`copy-number-${idx + 1}-btn`}
                      onClick={() => handleCopyNumber(item.raw, item.number)}
                      className="px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span>
                <strong>01806030750</strong> — এই নম্বরে বিকাশ এবং নগদ পার্সোনাল রয়েছে। আপনি সেন্ড মানি করতে পারবেন।
              </span>
            </div>
          </div>

          {/* Step-by-step instructions in Bangla */}
          <div className="space-y-2 pt-2 text-xs text-black">
            <p className="font-bold text-black flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>টাকা পাঠানোর নিয়মাবলি ({currentAccount.method.toUpperCase()}):</span>
            </p>
            <ul className="space-y-1.5 pl-5 list-decimal text-slate-800 font-medium">
              {currentAccount.instructions.map((inst: string, idx: number) => (
                <li key={idx} className="leading-relaxed">
                  {inst}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step 2: Verification Form */}
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-950 text-xs flex items-center justify-center font-extrabold border border-emerald-300">২</span>
              <span>লেনদেনের তথ্য পূরণ করুন</span>
            </label>
            <span className="text-[11px] text-emerald-800 font-bold">চার্জ: ৳ ০.০০ (ফ্রি)</span>
          </div>

          {/* Quick Amount Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black block">
              টাকার পরিমাণ (Amount in BDT) *
            </label>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    amount === q.toString()
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-slate-300 text-black hover:bg-slate-100'
                  }`}
                >
                  ৳ {q}
                </button>
              ))}
            </div>

            <div className="relative mt-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-sm">৳</span>
              <input
                id="deposit-amount-input"
                type="number"
                min="20"
                max="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="পরিমাণ লিখুন (যেমন ২৫০)"
                className="w-full bg-white border border-slate-300 focus:border-black rounded-xl pl-8 pr-4 py-2.5 text-sm text-black font-semibold focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
                required
              />
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              সর্বনিম্ন ডিপোজিট ২০ টাকা, সর্বোচ্চ ৫০,০০০ টাকা।
            </p>
          </div>

          {/* Sender Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black block">
              যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Number) *
            </label>
            <input
              id="deposit-sender-phone-input"
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
              required
            />
            <p className="text-[11px] text-slate-700 font-medium">
              আপনার বিকাশ/নগদ/রকেট মোবাইল নম্বরটি সঠিকভাবে লিখুন।
            </p>
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black block">
              ট্রানজেকশন আইডি (TrxID) *
            </label>
            <input
              id="deposit-trxid-input"
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="উদাহরণ: BL83K9X2, 9K48X7P..."
              className="w-full bg-white border border-slate-300 focus:border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-xs"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            id="deposit-submit-btn"
            type="submit"
            disabled={isSubmitting || isBanned}
            className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBanned ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>অ্যাকাউন্ট সাময়িকভাবে বন্ধ রয়েছে (ডিপোজিট নিষ্ক্রিয়)</span>
              </>
            ) : isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>ডিপোজিট রিকোয়েস্ট সাবমিট করুন</span>
              </>
            )}
          </button>

          {/* Guarantee Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-[11px] text-black font-medium flex items-start gap-2 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              সতর্কতা: ভুল TrxID বা ফেক রিকোয়েস্ট দিলে একাউন্ট সাময়িক সাসপেন্ড হতে পারে। টাকা সেন্ড মানি সফল হলে তবেই TrxID দিন।
            </span>
          </div>
        </form>

        {/* 24/7 WhatsApp Helpline Assistance Card */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                ডিপোজিট বা পেমেন্টে কোনো সমস্যা হচ্ছে?
              </h4>
              <p className="text-[11px] text-emerald-900 font-medium">
                আমাদের ২৪/৭ হোয়াটসঅ্যাপ হেল্পলাইনে সরাসরি মেসেজ দিয়ে তাৎক্ষণিক সমাধান নিন।
              </p>
            </div>
          </div>
          <a
            id="deposit-whatsapp-support-link"
            href={`${SUPPORT_WHATSAPP_LINK}?text=${encodeURIComponent(`হ্যালো DC Top Up, ওয়ালেটে টাকা যোগ করা নিয়ে আমার সহায়তা প্রয়োজন।`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>WhatsApp হেল্পলাইন ({SUPPORT_PHONE_FORMATTED})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
