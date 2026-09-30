import React from 'react';
import { Check } from 'lucide-react';
import { Bezel, Reveal, SectionHead, PillButton } from './ui';
import { choosePlan } from '../lib/lead';
import { track } from '../lib/analytics';

const PLANS = [
  {
    name: 'After-Hours',
    price: '$1,000',
    minutes: 'Up to 350 minutes / month',
    blurb: 'Never lose an evening or weekend call again.',
    features: [
      'Active 5 PM – 8 AM and all weekend',
      'Emergency triage and priority flagging',
      'Captures name, address and the issue',
      'Books into your calendar and alerts your team',
      'Text confirmation to the client',
    ],
    cta: 'Book a demo',
    featured: false,
  },
  {
    name: '24/7 Front Desk',
    price: '$1,550',
    minutes: 'Up to 750 minutes / month',
    blurb: 'Your full front line, answering every call around the clock.',
    features: [
      'Answers every call, 24/7/365',
      'Your pricing, fees and FAQs built in',
      'Live warm transfers to your team',
      'Works with your scheduling tools',
      'Automated booking with priority tagging',
      'Text confirmations and ETA links',
    ],
    cta: 'Book a demo',
    featured: true,
  },
  {
    name: 'Multi-Location',
    price: '$3,000+',
    minutes: '1,500+ minutes / month',
    blurb: 'For teams running several branches or territories.',
    features: [
      'Routing by location and territory',
      'Custom setup for your systems',
      'Priority voice cloning and brand tone',
      'Dedicated account representative',
      'Service guarantee and priority support',
    ],
    cta: 'Talk to us',
    featured: false,
  },
];

export const Pricing: React.FC = () => (
  <section id="pricing" className="relative isolate py-20 sm:py-28 md:py-36">
    <div aria-hidden className="absolute inset-x-0 top-1/4 h-[600px] -z-10 pointer-events-none overflow-hidden">
      <div className="absolute right-[5%] top-0 w-[520px] h-[520px] rounded-full bg-[#7C3AED]/[0.16] blur-[150px]" />
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHead
          eyebrow="Pricing"
          title={
            <>
              Simple monthly plans that <span className="font-serif-accent accent-text">pay for themselves</span>.
            </>
          }
          body="Pick the coverage that fits your call volume. A few recovered jobs a month covers it, and every plan includes setup to train Rinxora on your business."
        />
      </Reveal>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 90}>
            <Bezel
              className={`h-full ${p.featured ? 'lg:-translate-y-3 ring-aura !ring-0 shadow-[0_40px_100px_-30px_rgba(224,36,122,0.55)]' : ''}`}
              innerClassName="p-7 sm:p-9 flex flex-col h-full"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white tracking-[-0.01em] whitespace-nowrap">{p.name}</h3>
                {p.featured && (
                  <span className="btn-chrome shrink-0 whitespace-nowrap rounded-full text-[#0B0A0F] text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1">Most popular</span>
                )}
              </div>
              <p className="mt-2 text-sm text-titanium-300 leading-relaxed">{p.blurb}</p>

              <div className="mt-7 flex items-baseline gap-1.5">
                <span className="text-5xl font-semibold tracking-[-0.04em] text-white tabular">{p.price}</span>
                <span className="text-titanium-400 text-sm">/ month</span>
              </div>
              <div className="mt-1 text-xs text-titanium-400 tabular">{p.minutes}</div>

              <ul className="mt-8 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-titanium-200">
                    <Check className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <PillButton
                  variant={p.featured ? 'light' : 'glass'}
                  href="#book"
                  onClick={() => {
                    track('pricing_cta_click', { plan: p.name });
                    choosePlan(p.name);
                  }}
                >
                  {p.cta}
                </PillButton>
              </div>
            </Bezel>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8">
        <p className="text-center text-sm text-titanium-400 max-w-2xl mx-auto text-pretty">
          One-time setup of <span className="text-titanium-200">$1,500 – $2,500</span> covers training on your services and pricing, scheduling and CRM connections, call-forwarding rules and end-to-end phone testing.
        </p>
      </Reveal>
    </div>
  </section>
);
