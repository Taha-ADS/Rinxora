import React, { useEffect, useState } from 'react';
import { track } from '../lib/analytics';

interface NavbarProps {
  onScrollToDemo: () => void;
}

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#voices', label: 'Voices' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export const Navbar: React.FC<NavbarProps> = ({ onScrollToDemo }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: '-40px 0px 0px 0px' });
    const sentinel = document.getElementById('nav-sentinel');
    if (sentinel) io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tryLive = () => {
    setOpen(false);
    track('nav_try_live');
    onScrollToDemo();
  };

  const bar = 'block absolute left-0 h-px w-5 bg-white transition-transform duration-500 ease-lux';

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          aria-label="Primary"
          className={`pointer-events-auto mt-4 sm:mt-6 flex items-center gap-2 sm:gap-6 rounded-full pl-4 pr-2 py-2 ring-1 backdrop-blur-2xl transition-[background-color,box-shadow] duration-700 ease-lux ${
            scrolled
              ? 'bg-titanium-950/70 ring-white/15 shadow-[0_20px_60px_-20px_rgba(124,58,237,0.5)]'
              : 'bg-white/[0.04] ring-white/10'
          }`}
        >
          <a href="#top" className="flex items-center gap-2.5 pr-1 sm:pr-2" aria-label="Rinxora home" translate="no">
            <span className="orb-mini w-6 h-6 rounded-full ring-1 ring-white/30" />
            <span className="font-semibold tracking-[0.22em] text-[13px] text-white">RINXORA</span>
          </a>

          <ul className="hidden md:flex items-center gap-1 text-sm text-titanium-300">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="px-3.5 py-2 rounded-full transition-colors duration-500 ease-lux hover:text-white hover:bg-white/[0.07]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            onClick={tryLive}
            className="btn-chrome hidden sm:inline-flex items-center rounded-full text-[#0B0A0F] text-sm font-semibold px-5 py-2.5 transition-[transform,box-shadow] duration-500 ease-lux active:scale-[0.97] cursor-pointer"
          >
            Try it live
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden relative w-11 h-11 rounded-full bg-white/[0.07] ring-1 ring-white/10 cursor-pointer"
          >
            <span className="absolute left-1/2 top-1/2 -ml-2.5 w-5 h-5">
              <span className={`${bar} top-[6px] ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
              <span className={`${bar} top-[13px] ${open ? '-translate-y-[4px] -rotate-45' : ''}`} />
            </span>
          </button>
        </nav>
      </header>

      {/* Screen-filling menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-30 md:hidden bg-titanium-950/85 backdrop-blur-3xl transition-opacity duration-700 ease-lux ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="min-h-[100dvh] flex flex-col justify-center px-8 pt-24 pb-12">
          <ul className="space-y-1">
            {LINKS.map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${100 + i * 60}ms` : '0ms' }}
                  className={`block py-2.5 text-4xl font-semibold tracking-[-0.03em] text-white transition-[transform,opacity] duration-700 ease-lux ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={tryLive}
            style={{ transitionDelay: open ? '450ms' : '0ms' }}
            className={`mt-10 self-start rounded-full bg-white text-titanium-950 font-semibold px-7 py-3.5 transition-[transform,opacity] duration-700 ease-lux cursor-pointer ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            Try it live
          </button>
          <a
            href="#book"
            onClick={() => {
              setOpen(false);
              track('nav_book_demo');
            }}
            style={{ transitionDelay: open ? '510ms' : '0ms' }}
            className={`ring-aura mt-3 self-start rounded-full text-white font-semibold px-7 py-3.5 transition-[transform,opacity] duration-700 ease-lux ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            Book a demo
          </a>
        </div>
      </div>
    </>
  );
};
