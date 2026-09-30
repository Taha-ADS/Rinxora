import React, { useState } from 'react';
import { Calculator, ArrowRight, DollarSign } from 'lucide-react';

export const RoiCalculator: React.FC = () => {
  const [missedCalls, setMissedCalls] = useState<number>(45);
  const [avgTicket, setAvgTicket] = useState<number>(3800);

  // In HVAC, ~30% of emergency callers who reach a live voice convert to a paid job
  const convertedJobsPerMonth = Math.round(missedCalls * 0.32);
  const monthlyRevenueLost = convertedJobsPerMonth * avgTicket;
  const annualRevenueRecovered = monthlyRevenueLost * 12;

  return (
    <section id="roi-calculator" className="py-14 md:py-20 relative bg-titanium-950/70 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>HVAC missed revenue calculator</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            What are missed calls costing <span className="gold-gradient-text">your HVAC business</span>?
          </h2>
          <p className="text-titanium-300 text-sm mt-2">
            When a homeowner's heat goes out at 9:00 PM, they don’t leave voicemails — they call your competitor.
          </p>
        </div>

        {/* Clean 2-Column Calculator */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sliders Left */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-titanium-300">
                  After-Hours & Missed Calls / Month
                </label>
                <span className="text-sm font-bold text-white bg-titanium-900 px-3 py-1 rounded-lg border border-white/10">
                  {missedCalls} calls
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={missedCalls}
                onChange={(e) => setMissedCalls(Number(e.target.value))}
                className="w-full h-2 bg-titanium-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-xs text-titanium-500 mt-1">
                <span>10 calls</span>
                <span>100 calls</span>
                <span>200 calls</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-titanium-300">
                  Average Ticket (Repair to Replacement)
                </label>
                <span className="text-sm font-bold text-amber-400 bg-titanium-900 px-3 py-1 rounded-lg border border-white/10">
                  ${avgTicket.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="800"
                max="10000"
                step="200"
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value))}
                className="w-full h-2 bg-titanium-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-xs text-titanium-500 mt-1">
                <span>$800 (Repair)</span>
                <span>$5,000</span>
                <span>$10,000+ (Full System)</span>
              </div>
            </div>

            <p className="text-sm text-titanium-400 leading-relaxed">
              Based on standard 32% conversion rate when answering emergency furnace/AC calls immediately on the first ring.
            </p>
          </div>

          {/* Outcome Right */}
          <div className="bg-titanium-950 p-6 rounded-2xl border border-white/[0.08] text-center flex flex-col justify-between">
            <div>
              <span className="text-sm font-medium text-titanium-400 tracking-wider block mb-1">
                Annual Revenue Recovered
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-tight my-2">
                +${annualRevenueRecovered.toLocaleString()}
                <span className="text-sm font-normal text-titanium-400 ml-1">/yr</span>
              </div>
              <p className="text-sm text-titanium-300 mb-4">
                Recovers roughly <strong className="text-white">{convertedJobsPerMonth} paid HVAC jobs</strong> every month
                that are currently lost to voicemail.
              </p>
            </div>

            <a
              href="#live-demo"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-titanium-950 font-bold text-sm tracking-wider transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Stop The Revenue Leak</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
