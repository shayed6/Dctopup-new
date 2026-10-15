import React, { useState } from 'react';
import { Gamepad2, Sparkles, Video, ThumbsUp } from 'lucide-react';

export const FALLBACK_PLACEHOLDER_IMG = '/dc_logo.jpg';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  category?: string;
  title?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = FALLBACK_PLACEHOLDER_IMG,
  category,
  title,
  ...props
}) => {
  const [errorCount, setErrorCount] = useState(0);

  // Normalize /src/assets/images/... or relative path into reliable public path /images/...
  const cleanSrc = (src || '')
    .replace(/^\/src\/assets\/images\//, '/images/')
    .replace(/^src\/assets\/images\//, '/images/');

  const handleError = () => {
    setErrorCount((prev) => prev + 1);
  };

  // If first error occurred, try fallbackSrc (e.g. /dc_logo.jpg)
  // If fallbackSrc also fails or errorCount > 1, render a styled, reliable gradient card
  if (errorCount > 1 || (!cleanSrc && errorCount > 0)) {
    const isGaming = category === 'gaming' || !category;
    const isTiktok = category === 'tiktok';
    const isFacebook = category === 'facebook';

    return (
      <div
        className={`w-full h-full min-h-[100px] flex flex-col items-center justify-center p-3 text-center transition-all overflow-hidden ${
          isGaming
            ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white'
            : isTiktok
            ? 'bg-gradient-to-br from-slate-950 via-rose-950 to-black text-white'
            : isFacebook
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white'
            : 'bg-gradient-to-br from-slate-900 to-slate-950 text-white'
        } ${className}`}
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1.5 backdrop-blur-xs">
          {isTiktok ? (
            <Video className="w-4 h-4 text-rose-400" />
          ) : isFacebook ? (
            <ThumbsUp className="w-4 h-4 text-blue-400" />
          ) : (
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <span className="font-extrabold text-xs tracking-tight line-clamp-1">
          {title || alt || 'DC Top Up'}
        </span>
        <span className="text-[9px] text-amber-300 font-mono mt-0.5 uppercase tracking-wider font-bold">
          DC Verified
        </span>
      </div>
    );
  }

  const currentSource = errorCount === 0 ? cleanSrc : fallbackSrc;

  return (
    <img
      {...props}
      src={currentSource}
      alt={alt || title || 'DC Top Up'}
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
};
