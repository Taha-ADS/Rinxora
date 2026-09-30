import React from 'react';
import { PhoneCall, Play } from 'lucide-react';

interface HeroProps {
  onStartDemo: () => void;
  onExploreEdgeCases: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartDemo, onExploreEdgeCases }) => {
  return (
    <section className="relative pt-32 pb-14 md:pt-40 md:pb-20 overflow-hidden">
      {/* Precision ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 -z-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Operational Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-titanium-900 border border-white/10 shadow-lg shadow-black/40 mb-6 backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-sm text-amber-300 font-medium tracking-wide">
            Built exclusively for HVAC contractors
          </span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Never lose another <span className="gold-gradient-text">$8,500 furnace job</span> to voicemail.
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-titanium-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          The autonomous 24/7 voice dispatcher engineered strictly for HVAC. 
          Triages freezing no-heat emergencies, screens for carbon monoxide safety, quotes after-hours diagnostic fees, 
          and books jobs directly into ServiceTitan in under <span className="text-white font-medium">380 milliseconds</span>.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-14">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-black text-lg tracking-wide transition-all duration-300 animate-cta-glow hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-3 group shadow-2xl shadow-amber-500/40 border-2 border-amber-300/80 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-950 text-amber-400 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
              <PhoneCall className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-zinc-950 font-black text-lg">Test Live Dispatcher Now</span>
          </button>

          <button
            onClick={onExploreEdgeCases}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-titanium-900 hover:bg-titanium-800 text-titanium-200 hover:text-white font-medium text-base transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>Hear 2:00 AM Freeze Call</span>
          </button>
        </div>

        {/* Streamlined HVAC Credibility Strips (3 clean cards instead of cluttered grids) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="glass-panel p-4 rounded-xl text-left border border-white/[0.08]">
            <div className="text-sm font-medium text-titanium-400 mb-1">Response Time</div>
            <div className="text-xl font-bold text-white tracking-tight">0 Seconds Hold</div>
            <p className="text-sm text-titanium-400 mt-1">Answers 1st ring 24/7/365, even during seasonal freeze spikes</p>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border border-white/[0.08]">
            <div className="text-sm font-medium text-titanium-400 mb-1">Direct Field Sync</div>
            <div className="text-xl font-bold text-amber-400 tracking-tight">ServiceTitan & HCP</div>
            <p className="text-sm text-titanium-400 mt-1">Dispatches closest on-call technician truck automatically</p>
          </div>

          <div className="glass-panel p-4 rounded-xl text-left border border-white/[0.08]">
            <div className="text-sm font-medium text-titanium-400 mb-1">Fee Protection</div>
            <div className="text-xl font-bold text-emerald-400 tracking-tight">100% Upfront Consent</div>
            <p className="text-sm text-titanium-400 mt-1">Captures customer approval for after-hours emergency diagnostic fees</p>
          </div>
        </div>
      </div>
    </section>
  );
};
