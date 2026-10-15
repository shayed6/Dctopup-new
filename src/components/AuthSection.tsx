import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface AuthSectionProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AuthSection: React.FC<AuthSectionProps> = ({
  initialMode = 'login',
  onSuccess,
  isModal = false
}) => {
  const { signupWithEmail, loginWithEmail, setActiveTab } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Email / Password Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Loading State
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  // Email / Password Submit Handler (Real Firebase Auth)
  const handleEmailFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusType('idle');
    setStatusMsg('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setStatusType('error');
        setStatusMsg('পাসওয়ার্ড দুটো মিলছে না');
        return;
      }

      setIsProcessing(true);
      setStatusType('loading');
      setStatusMsg('অ্যাকাউন্ট তৈরি হচ্ছে...');

      const res = await signupWithEmail(name, email, password);
      setIsProcessing(false);

      if (res.success) {
        setStatusType('success');
        setStatusMsg('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! রিডাইরেক্ট হচ্ছে...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else setActiveTab('deposit');
        }, 800);
      } else {
        setStatusType('error');
        setStatusMsg(res.error || 'অ্যাকাউন্ট তৈরি করা যায় নি, আবার চেষ্টা করুন');
      }
    } else {
      // Login mode
      setIsProcessing(true);
      setStatusType('loading');
      setStatusMsg('যাচাই হচ্ছে...');

      const res = await loginWithEmail(email, password);
      setIsProcessing(false);

      if (res.success) {
        setStatusType('success');
        setStatusMsg('লগইন সফল! রিডাইরেক্ট হচ্ছে...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else setActiveTab('deposit');
        }, 800);
      } else {
        setStatusType('error');
        setStatusMsg(res.error || 'ভুল ইমেইল বা পাসওয়ার্ড');
      }
    }
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-4xl' : 'max-w-4xl my-6 sm:my-10 mx-auto px-3 sm:px-4'}`}>
      <div className="w-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] bg-white border border-[#14162E]/10 rounded-[18px] overflow-hidden shadow-[0_30px_60px_-30px_rgba(20,22,46,0.18)]">
        
        {/* Left Side: Brand & Visuals */}
        <div className="p-8 sm:p-12 relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#14162E]/10 bg-[#F7F7FA] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0A500]/8 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Coin Logo Mark */}
            <div className="flex items-center gap-2.5 font-sora font-bold text-[19px] tracking-tight text-[#14162E]">
              <span className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#E0A500] to-[#B98A00] flex items-center justify-center text-[#171B45] font-extrabold text-[14px] font-sora shadow-sm">
                DC
              </span>
              <span>DC Top Up</span>
            </div>

            {/* Headline */}
            <div className="font-sora font-bold text-2xl sm:text-[32px] md:text-[34px] leading-[1.18] tracking-[-0.015em] mt-8 sm:mt-10 mb-3.5 text-[#14162E] max-w-[22ch]">
              {mode === 'login' ? (
                <>
                  টাকা লোড করুন,<br />
                  <span className="text-[#E0A500]">তাৎক্ষণিক</span> কিনুন।
                </>
              ) : (
                <>
                  নতুন একাউন্ট<br />
                  <span className="text-[#E0A500]">তৈরি করুন</span>
                </>
              )}
            </div>

            {/* Subtitle */}
            <p className="text-[#6B6F8C] font-inter text-[14.5px] sm:text-[15px] leading-[1.6] max-w-[34ch]">
              {mode === 'login'
                ? 'আপনার ওয়ালেটে ব্যালেন্স রাখুন আর যেকোনো সময় প্রোডাক্ট পারচেজ করুন — নিরাপদ ও দ্রুত।'
                : 'একাউন্ট খুলে ওয়ালেটে ব্যালেন্স রাখুন আর যেকোনো সময় প্রোডাক্ট পারচেজ করুন।'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="relative z-10 hidden sm:flex items-center gap-7 mt-10 pt-6 border-t border-[#14162E]/10">
            {mode === 'login' ? (
              <>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">24/7</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Wallet Access</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Secure</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Firebase Auth</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Instant</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Purchase</span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Free</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Sign Up</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Secure</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Firebase Auth</span>
                </div>
                <div className="space-y-0.5">
                  <b className="block font-sora text-[20px] text-[#14162E] font-bold">Instant</b>
                  <span className="text-[#6B6F8C] text-[12.5px] font-inter">Wallet Access</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Panel */}
        <div className="p-7 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sora font-bold text-[22px] text-[#14162E]">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            {/* Quick Switch Pills */}
            <div className="flex items-center bg-[#F7F7FA] p-1 rounded-xl border border-[#14162E]/10 text-xs">
              <button
                type="button"
                id="auth-mode-login-tab"
                onClick={() => {
                  setMode('login');
                  setStatusMsg('');
                  setStatusType('idle');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-white text-[#14162E] shadow-xs' : 'text-[#6B6F8C] hover:text-[#14162E]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                id="auth-mode-signup-tab"
                onClick={() => {
                  setMode('signup');
                  setStatusMsg('');
                  setStatusType('idle');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  mode === 'signup' ? 'bg-white text-[#14162E] shadow-xs' : 'text-[#6B6F8C] hover:text-[#14162E]'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <p className="text-[#6B6F8C] font-inter text-[14px] mb-6">
            {mode === 'login'
              ? 'আপনার ইমেইল ও পাসওয়ার্ড দিয়ে একাউন্টে প্রবেশ করুন।'
              : 'নাম, ইমেইল ও পাসওয়ার্ড দিয়ে নতুন একাউন্ট তৈরি করুন।'}
          </p>

          <div className="space-y-4">
            {/* Email / Password Form */}
            <form onSubmit={handleEmailFormSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                    পুরো নাম
                  </label>
                  <input
                    id="auth-signup-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম"
                    className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                  ইমেইল
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                  পাসওয়ার্ড
                </label>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ ক্যারেক্টার"
                  className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-[12.5px] text-[#6B6F8C] font-inter mb-1.5 font-medium">
                    পাসওয়ার্ড আবার লিখুন
                  </label>
                  <input
                    id="auth-confirm-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড কনফার্ম করুন"
                    className="w-full bg-white border border-[#14162E]/10 focus:border-[#E0A500] rounded-[10px] px-3.5 py-2.5 text-[#14162E] font-inter text-[14px] focus:outline-none transition-colors"
                  />
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-5 rounded-[10px] bg-[#E0A500] hover:bg-[#B98A00] active:scale-[0.99] text-white font-inter font-semibold text-[14px] cursor-pointer transition-all shadow-[0_10px_24px_-12px_rgba(224,165,0,0.35)] mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Login করুন' : 'Create Account'}</span>
                )}
              </button>
            </form>
          </div>

          {/* Status Message Line */}
          {statusMsg && (
            <div
              id="auth-status-message"
              className={`mt-3.5 p-3 rounded-xl text-[13px] leading-relaxed transition-all ${
                statusType === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-[#D3453A] font-semibold'
                  : statusType === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-[#1F9D6B] font-bold'
                  : 'bg-slate-50 border border-slate-200 text-[#6B6F8C]'
              }`}
            >
              {statusMsg}
            </div>
          )}

          {/* Bottom Footer Switcher */}
          <div className="mt-5 pt-4 border-t border-[#14162E]/10 flex items-center justify-between text-xs text-[#6B6F8C]">
            <span className="text-[11px] text-slate-500">Firebase Auth দ্বারা সুরক্ষিত</span>
            <div className="text-right">
              {mode === 'login' ? (
                <span>
                  একাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setStatusMsg('');
                      setStatusType('idle');
                    }}
                    className="text-[#B98A00] font-semibold hover:underline cursor-pointer"
                  >
                    Sign Up করুন
                  </button>
                </span>
              ) : (
                <span>
                  একাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setStatusMsg('');
                      setStatusType('idle');
                    }}
                    className="text-[#B98A00] font-semibold hover:underline cursor-pointer"
                  >
                    Login করুন
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 text-[12px] text-[#6B6F8C] leading-[1.5] text-center border-t border-[#14162E]/5 pt-3">
            লগইন বা সাইন-আপ করার মাধ্যমে আপনি DC Top Up-এর ব্যবহারের শর্তাবলি ও নিয়মাবলি মেনে নিচ্ছেন।
          </div>
        </div>

      </div>
    </div>
  );
};
