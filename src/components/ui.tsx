import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

/** Gentle, heavy fade-up when scrolled into view. Honors reduced motion. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[transform,opacity,filter] duration-[900ms] ease-lux motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-[4px]'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/** Double-bezel: a machined outer tray with a glass inner core. */
export const Bezel: React.FC<{
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}> = ({ children, className = '', innerClassName = '' }) => (
  <div className={`rounded-[2rem] bg-white/[0.035] ring-1 ring-white/[0.09] p-1.5 ${className}`}>
    <div
      className={`h-full rounded-[calc(2rem-0.375rem)] bg-[linear-gradient(180deg,#131318,#0A0A0D)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${innerClassName}`}
    >
      {children}
    </div>
  </div>
);

/** Gradient icon square, lit from the top like the reference's app-icon tiles. */
const TILE_TONES = {
  ember: 'from-[#FF4D6D] to-[#FF8A3D]',
  magenta: 'from-[#A43DF2] to-[#FF3D8B]',
  violet: 'from-[#6D4BFF] to-[#C43DF2]',
};
export const IconTile: React.FC<{ icon: React.ElementType; tone?: keyof typeof TILE_TONES; size?: 'md' | 'lg'; className?: string }> = ({
  icon: Icon,
  tone = 'magenta',
  size = 'md',
  className = '',
}) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_10px_24px_-10px_rgba(224,36,122,0.75)] ${TILE_TONES[tone]} ${
      size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
    } ${className}`}
  >
    <Icon className={`${size === 'lg' ? 'w-5 h-5' : 'w-[18px] h-[18px]'} [stroke-width:1.8]`} aria-hidden="true" />
  </span>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span
    className={`ring-aura inline-flex items-center gap-2 rounded-full h-8 px-3.5 text-[11px] uppercase tracking-[0.18em] font-medium text-titanium-100 ${className}`}
  >
    <span className="orb-mini w-3.5 h-3.5 rounded-full" aria-hidden="true" />
    {children}
  </span>
);

export const SectionHead: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: 'center' | 'left';
}> = ({ eyebrow, title, body, align = 'center' }) => (
  <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="chrome-text mt-5 pb-[0.06em] text-[2rem] sm:text-5xl font-semibold tracking-[-0.035em] leading-[1.06] text-balance">{title}</h2>
    {body && <p className="mt-5 text-base sm:text-lg text-titanium-300 leading-relaxed text-pretty">{body}</p>}
  </div>
);

interface PillProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'light' | 'glass' | 'burgundy' | 'chrome' | 'aura';
  className?: string;
  type?: 'button' | 'submit';
}

const PILL_BASE =
  'group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-sm font-semibold whitespace-nowrap cursor-pointer select-none transition-[transform,box-shadow,background-color] duration-500 ease-lux active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300';
const PILL_VARIANT = {
  light: 'btn-chrome text-[#0B0A0F]',
  glass: 'bg-white/[0.06] text-white ring-1 ring-white/15 hover:bg-white/[0.11]',
  burgundy: 'bg-burgundy-600 text-white ring-1 ring-white/10 hover:bg-burgundy-500',
  chrome: 'btn-chrome text-[#0B0A0F]',
  aura: 'ring-aura text-white hover:shadow-[0_14px_44px_-12px_rgba(224,36,122,0.75)]',
};
const ICON_VARIANT = {
  light: 'bg-[#0B0A0F]/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.12)]',
  glass: 'bg-white/10',
  burgundy: 'bg-white/15',
  chrome: 'bg-[#0B0A0F]/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.12)]',
  aura: 'bg-gradient-to-br from-[#E0247A] to-[#FF7A2F] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]',
};

/** Pill button with its arrow nested in its own circle (button-in-button). */
export const PillButton: React.FC<PillProps> = ({ children, href, onClick, variant = 'light', className = '', type = 'button' }) => {
  const cls = `${PILL_BASE} ${PILL_VARIANT[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span
        className={`flex w-9 h-9 items-center justify-center rounded-full transition-transform duration-500 ease-lux group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105 ${ICON_VARIANT[variant]}`}
      >
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </>
  );
  return href ? (
    <a href={href} onClick={onClick} className={cls}>
      {inner}
    </a>
  ) : (
    <button type={type} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
};
