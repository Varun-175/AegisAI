import React from 'react';

interface AegisAILogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon-only' | 'full' | 'stacked' | 'badge';
  className?: string;
  glow?: boolean;
}

export const AegisAILogo: React.FC<AegisAILogoProps> = ({
  size = 'md',
  variant = 'icon-only',
  className = '',
  glow = true,
}) => {
  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  const idSuffix = React.useId().replace(/:/g, '');

  const IconSVG = (
    <div
      className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} ${
        glow ? 'drop-shadow-[0_0_24px_rgba(45,212,191,0.4)]' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Aegis Shield Outer Gradient */}
          <linearGradient id={`aegisRim_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#2dd4bf" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
          </linearGradient>

          {/* Obsidian Glass Fill */}
          <linearGradient id={`aegisGlass_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Luminous Teal Sweep */}
          <linearGradient id={`tealSweep_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Warm Amber Gold Accents */}
          <linearGradient id={`goldAccent_${idSuffix}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Core Aegis Star */}
          <linearGradient id={`starCore_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f0f9ff" />
            <stop offset="70%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Core Glow Filter */}
          <filter id={`aegisGlow_${idSuffix}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Aegis Protection Shield Base Plate */}
        <path
          d="M 50 6
             L 88 20
             C 88 56, 72 82, 50 94
             C 28 82, 12 56, 12 20
             Z"
          fill={`url(#aegisGlass_${idSuffix})`}
          stroke={`url(#aegisRim_${idSuffix})`}
          strokeWidth="2.5"
        />

        {/* Inner Shield Inset Line */}
        <path
          d="M 50 12
             L 82 24
             C 82 52, 68 76, 50 86
             C 32 76, 18 52, 18 24
             Z"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.2"
        />

        {/* Left Shield Wing (Teal Sweep) */}
        <path
          d="M 50 12 L 18 24 C 18 52, 32 76, 50 86 Z"
          fill={`url(#tealSweep_${idSuffix})`}
          opacity="0.18"
        />

        {/* Right Shield Wing (Gold Accent) */}
        <path
          d="M 50 12 L 82 24 C 82 52, 68 76, 50 86 Z"
          fill={`url(#goldAccent_${idSuffix})`}
          opacity="0.12"
        />

        {/* Central Governance Core (4-point Aegis Intelligence Star) */}
        <g filter={`url(#aegisGlow_${idSuffix})`}>
          <path
            d="M 50 28 
               Q 50 50, 72 50 
               Q 50 50, 50 72 
               Q 50 50, 28 50 
               Q 50 50, 50 28 Z"
            fill={`url(#starCore_${idSuffix})`}
          />
          <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
        </g>

        {/* Cardinal Aegis Nodes */}
        <circle cx="50" cy="18" r="2" fill="#38bdf8" />
        <circle cx="78" cy="50" r="2" fill="#f59e0b" />
        <circle cx="50" cy="80" r="2" fill="#10b981" />
        <circle cx="22" cy="50" r="2" fill="#38bdf8" />
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return IconSVG;
  }

  if (variant === 'badge') {
    return (
      <div className="flex items-center gap-2.5">
        {IconSVG}
        <div className="flex flex-col">
          <span className="text-xs font-extrabold tracking-tight text-white font-sans">
            Aegis<span className="text-amber-300 font-semibold">AI</span>
          </span>
          <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">
            AI Governance Plane
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className="flex flex-col items-center text-center space-y-3">
        {IconSVG}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Aegis<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-semibold">AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 tracking-wide uppercase font-mono">
            Your AI. Your Rules. Your Data.
          </p>
        </div>
      </div>
    );
  }

  // Default 'full' horizontal lockup
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {IconSVG}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold tracking-tight text-white leading-none font-sans">
            Aegis<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-300 to-amber-300 font-semibold">AI</span>
          </span>
        </div>
        <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase mt-1 font-semibold">
          AI Governance Plane
        </span>
      </div>
    </div>
  );
};





