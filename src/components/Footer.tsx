import React from 'react';
import { Flame } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-titanium-950 border-t border-white/[0.08] py-12 text-xs text-titanium-400">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-titanium-900 border border-white/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-display font-bold text-white text-base tracking-tight">VOCALIS</span>
            <span className="text-xs bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-400 border border-amber-500/20 font-bold">
              HVAC
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-titanium-300">
            <a href="#live-demo" className="hover:text-white transition-colors">Live Demo</a>
            <a href="#hvac-triage" className="hover:text-white transition-colors">Emergency Triage</a>
            <a href="#roi-calculator" className="hover:text-white transition-colors">HVAC ROI</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="text-sm text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>24/7 Carrier-Grade Dispatch Active</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-titanium-500">
          <div>
            Built for ServiceTitan, Housecall Pro & Jobber Contractors.
          </div>
          <div>
            © {new Date().getFullYear()} Vocalis HVAC Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
