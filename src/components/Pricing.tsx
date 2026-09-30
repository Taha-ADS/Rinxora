import React from 'react';
import { Check, ArrowRight, ShieldCheck, Wrench, Clock, Zap } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (planName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Tier 1: After-Hours Capture',
      tierLabel: 'After-Hours & Weekends',
      price: '$1,000',
      period: '/month',
      minutes: 'Up to 350 mins/mo included',
      description: 'Active 5:00 PM – 8:00 AM and weekends. Captures lost after-hours emergency tickets, logs address/issue, and syncs calendar.',
      features: [
        'Up to 350 voice dispatch minutes / month',
        'Active 5:00 PM – 8:00 AM & 24hr weekends',
        'Emergency triage & after-hours dispatching',
        'Address, symptom & caller detail extraction',
        'Direct calendar sync & on-call technician alert',
        'Instant SMS confirmation sent to homeowner',
      ],
      popular: false,
      cta: 'Deploy Tier 1 Capture',
    },
    {
      name: 'Tier 2: 24/7 Full Front-Desk',
      tierLabel: 'Complete 24/7 Front-Line',
      price: '$1,550',
      period: '/month',
      badge: 'Most Popular',
      minutes: 'Up to 750 mins/mo included',
      description: 'Full front-line call answering 24/7/365. Custom pricing FAQs, dynamic live warm transfers to staff, calendar bookings, and instant SMS confirmations.',
      features: [
        'Up to 750 voice dispatch minutes / month',
        'Full front-line call answering 24/7/365',
        'Custom pricing FAQs & $89 diagnostic fee handling',
        'Dynamic live warm transfers to staff & techs',
        'Direct ServiceTitan, Housecall Pro & Jobber sync',
        'Automated calendar booking & priority tagging',
        'Instant SMS confirmations & ETA links',
      ],
      popular: true,
      cta: 'Deploy 24/7 Front-Desk',
    },
    {
      name: 'Tier 3: Multi-Branch Enterprise',
      tierLabel: 'Multi-Location Fleets',
      price: '$3,000+',
      period: '/month',
      minutes: '1,500+ mins/mo included',
      description: 'Multi-location routing, custom ServiceTitan/Jobber enterprise API integrations, dedicated account rep, and priority voice cloning.',
      features: [
        '1,500+ voice dispatch minutes / month',
        'Multi-location & branch territory routing',
        'Custom ServiceTitan / Jobber enterprise API wiring',
        'Priority voice cloning & custom brand cadence',
        'Dedicated account representative & direct line',
        'Custom telephony verification & SLA guarantee',
      ],
      popular: false,
      cta: 'Request Enterprise Tier',
    },
  ];

  return (
    <section id="pricing" className="py-14 md:py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-2">
            <span>Business-outcome tiers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Predictable retainers. <span className="gold-gradient-text">Measurable HVAC ROI</span>.
          </h2>
          <p className="text-titanium-300 text-sm mt-2">
            Choose the outcome tier that fits your call volume. Captures emergency jobs that cover your retainer on day one.
          </p>
        </div>

        {/* Mandatory Implementation Fee Banner */}
        <div className="mb-10 max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-titanium-900/90 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-amber-400 tracking-wider">
                Mandatory one-time implementation setup ($1,500 – $2,500)
              </div>
              <p className="text-sm text-titanium-300 mt-0.5">
                Applies to all tiers. Covers knowledge base grounding, CRM webhook wiring, staff call forwarding rules, and end-to-end telephony verification.
              </p>
            </div>
          </div>
          <span className="text-sm text-titanium-400 whitespace-nowrap bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            One-time Onboarding
          </span>
        </div>

        {/* 3 Outcome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                p.popular
                  ? 'glass-panel-elevated border-2 border-amber-400/50 shadow-2xl shadow-amber-500/10 scale-100 lg:-translate-y-1.5'
                  : 'glass-panel border border-white/10'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-titanium-950 font-bold text-xs uppercase tracking-wider shadow-md">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="mb-2">
                  <span className="text-xs font-medium text-amber-400 tracking-wider block">
                    {p.tierLabel}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{p.name}</h3>
                </div>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-mono font-black text-white">{p.price}</span>
                  <span className="text-sm text-titanium-400">{p.period}</span>
                </div>

                <div className="text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 mb-3 inline-block">
                  {p.minutes}
                </div>

                <p className="text-sm text-titanium-300 leading-relaxed mb-4">{p.description}</p>

                <div className="space-y-2 pt-3 border-t border-white/[0.08] mb-6">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-titanium-200">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectPlan(p.name)}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  p.popular
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-titanium-950 shadow-md shadow-amber-500/20 hover:scale-[1.02]'
                    : 'bg-titanium-900 hover:bg-titanium-800 text-white border border-white/10'
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
