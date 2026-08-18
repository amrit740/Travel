import React from 'react';

export interface TravelWiseLogoProps {
  variant?: 'full' | 'horizontal' | 'emblem' | 'wordmark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  theme?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}

export const TravelWiseLogo: React.FC<TravelWiseLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'light',
  showTagline = true,
  className = '',
}) => {
  const isDark = theme === 'dark';
  const travelColor = isDark ? '#FFFFFF' : '#0F172A';
  const wiseColor = isDark ? '#E5BD68' : '#C59B27';
  const taglineColor = isDark ? '#DFCA9B' : '#475569';
  const monogramGreen = isDark ? '#FFFFFF' : '#0F172A';
  const mountainGreen = isDark ? '#1E293B' : '#334155';
  const treeColor = isDark ? '#FFFFFF' : '#1E293B';

  // Size mapping for emblem only (slightly larger & more prominent)
  const emblemSizes = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    hero: 'w-44 h-44',
  };

  // Size mapping for full vertical logo
  const fullSizes = {
    xs: 'w-32',
    sm: 'w-44',
    md: 'w-60',
    lg: 'w-80',
    xl: 'w-96',
    '2xl': 'w-[440px]',
    hero: 'w-[520px]',
  };

  // Reusable inline SVG Emblem for crisp vector rendering without asset load delays
  const EmblemSvg = ({ className = 'w-full h-full' }: { className?: string }) => (
    <svg
      viewBox="0 0 600 500"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`twSun_${theme}`} cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#F5E8C4" />
          <stop offset="65%" stopColor="#DCA944" />
          <stop offset="100%" stopColor="#BD8626" />
        </radialGradient>
        <linearGradient id={`twGold_${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5BD68" />
          <stop offset="50%" stopColor="#C8A96B" />
          <stop offset="100%" stopColor="#9C7730" />
        </linearGradient>
      </defs>

      <g transform="translate(300, 240)">
        {/* 1. Golden Rising Sun Disc */}
        <circle cx="65" cy="-25" r="95" fill={`url(#twSun_${theme})`} />

        {/* 2. Flight Trail Arc to Airplane */}
        <path
          d="M 68 -28 C 120 -40, 185 -75, 235 -125"
          stroke={monogramGreen}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity={isDark ? 0.95 : 0.9}
        />

        {/* 3. Ascending Airplane Silhouette */}
        <g transform="translate(235, -125) rotate(42)">
          <path
            d="M 0 -26 L 5 -6 L 26 2 L 26 7 L 5 4 L 4 18 L 12 23 L 12 27 L 0 24 L -12 27 L -12 23 L -4 18 L -5 4 L -26 7 L -26 2 L -5 -6 Z"
            fill={monogramGreen}
          />
        </g>

        {/* 4. Top Serif & Flowing Bar of 'T' Monogram */}
        <path
          d="M -210 -155 C -180 -155, -150 -160, -90 -160 L 130 -160 C 145 -160, 160 -150, 160 -138 C 160 -126, 142 -122, 120 -122 L -45 -122 C -60 -122, -65 -110, -65 -90 L -65 10 L -125 10 L -125 -100 C -125 -128, -145 -132, -185 -132 C -205 -132, -215 -142, -210 -155 Z"
          fill={monogramGreen}
        />

        {/* 5. Mountain Peaks with Crisp Snowcap Geometry */}
        <g id="mountain-peaks">
          <polygon points="50,-85 -55,45 165,45" fill={mountainGreen} />
          <polygon points="120,-35 45,45 195,45" fill={monogramGreen} />

          {/* Left Snowy Ridge */}
          <path
            d="M 50 -85 L 30 -45 L 45 -35 L 20 -5 L 35 10 L -15 45 L 50 -85 Z"
            fill="#FFFFFF"
          />

          {/* Right Mountain Snow Accent */}
          <path
            d="M 120 -35 L 105 -10 L 118 0 L 95 25 L 135 45 L 120 -35 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </g>

        {/* 6. Pine Trees Silhouettes */}
        <g id="pine-trees" fill={treeColor}>
          <polygon points="152,-15 146,5 158,5" />
          <polygon points="152,0 143,20 161,20" />
          <polygon points="152,15 140,40 164,40" />
          <rect x="150" y="40" width="4" height="6" />

          <polygon points="170,-30 163,-8 177,-8" />
          <polygon points="170,-12 160,12 180,12" />
          <polygon points="170,8 156,38 184,38" />
          <rect x="168" y="38" width="4" height="8" />

          <polygon points="188,-10 182,10 194,10" />
          <polygon points="188,6 179,28 197,28" />
          <polygon points="188,22 176,44 200,44" />
          <rect x="186" y="44" width="4" height="5" />
        </g>

        {/* 7. 'W' Monogram Legs */}
        <path d="M -125 -10 L -55 175 L 5 175 L -55 20 Z" fill={monogramGreen} />
        <path d="M 2 175 L 78 -20 L 135 -20 L 55 175 Z" fill={monogramGreen} />
        <path
          d="M 125 -15 L 230 45 L 180 45 L 95 175 L 45 175 L 115 15 L 235 45 L 175 45 Z"
          fill={monogramGreen}
        />

        {/* 8. Sweeping Golden Ribbon Path / Road Through T & W */}
        <path
          d="M -145 15 C -110 5, -80 0, -40 2 C 15 5, 55 2, 95 -10 C 65 3, 30 18, -10 22 C -60 27, -100 45, -70 95 C -40 145, 10 170, 35 180 C 15 170, -25 140, -45 105 C -65 70, -35 50, 15 45 C 75 40, 125 15, 155 -5 C 120 18, 60 48, -15 48 C -85 48, -125 25, -145 15 Z"
          fill={`url(#twGold_${theme})`}
        />

        {/* Road Centerline Accent */}
        <path
          d="M -135 16 C -75 14, 0 14, 75 -2 C 20 12, -45 32, -58 75 C -70 115, -15 155, 30 175"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 6"
          fill="none"
          opacity="0.85"
        />
      </g>
    </svg>
  );

  // Variant 1: Standalone Emblem Icon (Prominent & Minimalist)
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${emblemSizes[size]} ${className}`}>
        <EmblemSvg />
      </div>
    );
  }

  // Variant 2: Horizontal Compact Logo (Emblem + Wordmark)
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
        <div className={emblemSizes[size === 'hero' ? 'xl' : size === '2xl' ? 'lg' : size === 'xl' ? 'md' : size === 'lg' ? 'sm' : 'xs']}>
          <EmblemSvg />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center tracking-tight leading-none">
            <span className="font-serif-title font-extrabold text-lg sm:text-xl tracking-[0.06em]" style={{ color: travelColor }}>
              TRAVEL
            </span>
            <span className="font-serif-title font-extrabold text-lg sm:text-xl tracking-[0.06em]" style={{ color: wiseColor }}>
              WISE
            </span>
          </div>
          {showTagline && (
            <span
              className="text-[8px] sm:text-[9px] font-semibold tracking-[0.24em] uppercase mt-1 leading-none"
              style={{ color: taglineColor }}
            >
              PLAN LESS. DISCOVER MORE.
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant 3: Wordmark only (TRAVEL in forest green, WISE in gold)
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <div className="flex items-center leading-none">
          <span className="font-serif-title font-extrabold text-2xl sm:text-3xl tracking-[0.08em]" style={{ color: travelColor }}>
            TRAVEL
          </span>
          <span className="font-serif-title font-extrabold text-2xl sm:text-3xl tracking-[0.08em]" style={{ color: wiseColor }}>
            WISE
          </span>
        </div>
        {showTagline && (
          <div className="w-full flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] flex-1" style={{ backgroundColor: wiseColor }} />
            <span className="text-[9px] font-semibold tracking-[0.25em] uppercase" style={{ color: taglineColor }}>
              PLAN LESS. DISCOVER MORE.
            </span>
            <span className="h-[1px] flex-1" style={{ backgroundColor: wiseColor }} />
          </div>
        )}
      </div>
    );
  }

  // Variant 4: Full Official Modernized Minimalist TravelWise Logo
  return (
    <div
      className={`inline-flex flex-col items-center text-center select-none ${fullSizes[size]} ${className}`}
    >
      {/* Prominent Central Emblem */}
      <div className="w-full aspect-[6/5] flex items-center justify-center mb-1 drop-shadow-xs">
        <EmblemSvg />
      </div>

      {/* Modern High-End Wordmark: TRAVEL (Forest Green) + WISE (Warm Gold) */}
      <div className="w-full flex items-center justify-center tracking-tight leading-none mt-1">
        <span
          className="font-serif-title font-black tracking-[0.08em] text-2xl sm:text-3xl md:text-4xl"
          style={{ color: travelColor }}
        >
          TRAVEL
        </span>
        <span
          className="font-serif-title font-black tracking-[0.08em] text-2xl sm:text-3xl md:text-4xl"
          style={{ color: wiseColor }}
        >
          WISE
        </span>
      </div>

      {/* Refined Tagline Flanked by Thin Golden Horizontal Rules */}
      {showTagline && (
        <div className="w-full flex items-center justify-center gap-2.5 mt-2.5 sm:mt-3">
          <span className="h-[1.5px] flex-1 opacity-70" style={{ backgroundColor: wiseColor }} />
          <p
            className="text-[9px] sm:text-[11px] font-bold tracking-[0.28em] uppercase leading-none shrink-0"
            style={{ color: taglineColor }}
          >
            PLAN LESS. DISCOVER MORE.
          </p>
          <span className="h-[1.5px] flex-1 opacity-70" style={{ backgroundColor: wiseColor }} />
        </div>
      )}
    </div>
  );
};
