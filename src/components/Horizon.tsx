import React from 'react';

/**
 * The planet under the orb. Only its upper rim is ever on screen: a grainy
 * band of light that burns orange-red beneath the orb and cools to magenta and
 * violet at the edges, a chrome hairline on top, and satin strata underneath.
 *
 * The soft, grainy light is a pre-rendered image (source: design/horizon-glow.svg)
 * because Safari paints SVG filters on the CPU. The body is a CSS gradient and
 * the hairline a single vector stroke, so nothing here is filtered at runtime.
 */
export const Horizon: React.FC = () => (
  <>
    <div
      className="absolute inset-0 rounded-full"
      style={{ background: 'radial-gradient(56% 56% at 50% 0%, #4A0B38 0%, #1E0726 14%, #07030B 35%, #000 100%)' }}
    />
    {/* The image covers x -40…1040 and y -90…430 of the 1000-unit planet */}
    <img
      src="/horizon-glow.webp"
      alt=""
      decoding="async"
      fetchPriority="high"
      draggable={false}
      className="absolute max-w-none select-none"
      style={{ left: '-4%', top: '-9%', width: '108%', height: '52%' }}
    />
    <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="hz-chrome" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0.1" stopColor="#6E6A80" stopOpacity="0" />
          <stop offset="0.3" stopColor="#B9B6C8" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#B9B6C8" stopOpacity="0.55" />
          <stop offset="0.9" stopColor="#6E6A80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="500" cy="500" r="500.4" fill="none" stroke="url(#hz-chrome)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
    </svg>
  </>
);
