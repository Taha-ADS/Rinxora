import React, { useState, useEffect } from 'react';
import { PhoneCall, Flame } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onScrollToDemo: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onScrollToDemo, hasCustomKey }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-titanium-950/90 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl shadow-black/80'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:border-amber-400 transition-colors">
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold tracking-tight text-lg text-white">VOCALIS</span>
                <span className="text-xs font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  HVAC
                </span>
              </div>
            </a>

            {/* Live Operational Status Chip */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-titanium-900 border border-white/[0.08] text-sm text-titanium-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium">24/7 Dispatch Active</span>
            </div>
          </div>

          {/* Simple Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-titanium-300">
            <a href="#live-demo" className="hover:text-white transition-colors">Live Demo</a>
            <a href="#hvac-triage" className="hover:text-white transition-colors">Emergency Triage</a>
            <a href="#roi-calculator" className="hover:text-white transition-colors">HVAC ROI</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onScrollToDemo}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-sm tracking-wide transition-all animate-cta-glow hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-zinc-950" />
              <span className="text-zinc-950 font-bold">Test Call</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
