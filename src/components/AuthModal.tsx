import React from 'react';
import { AuthSection } from './AuthSection';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#14162E]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 my-auto">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-20 w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-[#14162E] flex items-center justify-center cursor-pointer shadow-lg border border-[#14162E]/15 transition-transform hover:scale-105 active:scale-95"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <AuthSection
          initialMode={initialMode}
          isModal={true}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
};
