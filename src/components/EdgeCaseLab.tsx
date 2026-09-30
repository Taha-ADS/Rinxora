import React, { useState } from 'react';
import { AlertTriangle, Check, Droplets, MapPin } from 'lucide-react';
import { Bezel, IconTile, Reveal, SectionHead } from './ui';
import { track } from '../lib/analytics';

const FLOW = [
  { n: '01', t: 'Greets', d: 'Your business name, warm and short' },
  { n: '02', t: 'Qualifies', d: 'Issue, urgency and service area' },
  { n: '03', t: 'Quotes', d: 'Fees stated, consent recorded' },
  { n: '04', t: 'Books', d: 'Offers a real time window' },
  { n: '05', t: 'Confirms', d: 'Read-back, text and team alert' },
];

const CASES = [
  {
    id: 'gas-co',
    tab: 'Safety emergency',
    sub: 'Gas smell or CO alarm',
    icon: AlertTriangle,
    title: 'A gas smell overrides everything',
    trigger: 'The caller mentions a gas smell, rotten eggs, or a carbon monoxide alarm at any point in the call.',
    script:
      '“Please leave the house right away and call your gas utility or 911 from outside. Once you’re safe, I’ll get an emergency technician on the way.”',
    rules: [
      'Interrupts whatever step the call is on, immediately',
      'Skips pricing and small talk entirely',
      'Collects the address and callback number once the caller is safe',
      'Pages the on-call technician straight away',
    ],
    result: 'Evacuation advised · on-call technician alerted',
  },
  {
    id: 'ceiling-leak',
    tab: 'Property damage',
    sub: 'Active ceiling leak',
    icon: Droplets,
    title: 'An active leak gets the earliest slot',
    trigger: 'The caller reports water coming through the ceiling from an attic unit or drain pan.',
    script:
      '“Since that’s actively leaking, I’m marking this as an immediate priority. If a technician is between jobs they’ll head straight over, otherwise I’ll lock in our earliest window.”',
    rules: [
      'Recognizes the urgency of limiting damage',
      'Offers one earliest window instead of a menu of choices',
      'Advises on safely switching the unit off where appropriate',
      'Flags the job for the nearest equipped truck',
    ],
    result: 'Priority ticket created · earliest slot booked',
  },
  {
    id: 'fee',
    tab: 'Pricing & coverage',
    sub: 'Fees and service area',
    icon: MapPin,
    title: 'Fees and coverage, stated plainly',
    trigger: 'The caller asks about cost, or calls from an area you may not serve.',
    script:
      '“Our diagnostic visit is $89 and covers a full inspection. If you approve the repair, that $89 is credited toward it.”',
    rules: [
      'Checks the address against your service area first',
      'Politely redirects out-of-area callers before collecting personal details',
      'Gets spoken consent to the fee before dispatching',
      'Explains tune-up and membership pricing when asked',
    ],
    result: 'Fee consent recorded · service area verified',
  },
];

export const EdgeCaseLab: React.FC = () => {
  const [sel, setSel] = useState(0);
  const active = CASES[sel];

  return (
    <section id="playbooks" className="relative py-20 sm:py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead
            eyebrow="Real-call playbooks"
            title={
              <>
                It handles the calls that <span className="font-serif-accent accent-text">actually matter</span>.
              </>
            }
            body="Every business has calls where a mistake is expensive. Rinxora follows your rules on each one, every time."
          />
        </Reveal>

        {/* Conversation flow */}
        <Reveal delay={100} className="mt-14">
          <ol className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {FLOW.map((f, i) => (
              <li
                key={f.n}
                className={`rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.08] px-4 py-4 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300 tabular">{f.n}</div>
                <div className="mt-1.5 text-white font-semibold">{f.t}</div>
                <div className="mt-0.5 text-xs text-titanium-400 leading-snug">{f.d}</div>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          <div role="tablist" aria-label="Call scenarios" className="md:col-span-4 space-y-2">
            {CASES.map((c, i) => {
              const on = sel === i;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setSel(i);
                    track('playbook_selected', { playbook: c.id });
                  }}
                  className={`w-full text-left rounded-2xl p-4 ring-1 flex items-center gap-4 cursor-pointer transition-[background-color,box-shadow] duration-500 ease-lux ${
                    on
                      ? 'bg-white/[0.08] ring-[#FF5FA2]/50 shadow-[0_10px_40px_-15px_rgba(224,36,122,0.6)]'
                      : 'bg-white/[0.02] ring-white/[0.07] hover:bg-white/[0.05]'
                  }`}
                >
                  <IconTile icon={c.icon} tone={(['ember', 'magenta', 'violet'] as const)[i]} />
                  <span>
                    <span className="block text-white font-semibold">{c.tab}</span>
                    <span className="block text-xs text-titanium-400">{c.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Bezel className="md:col-span-8">
            <div role="tabpanel" key={active.id} className="p-6 sm:p-9 animate-[fadeUp_700ms_cubic-bezier(0.32,0.72,0,1)_both]">
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white text-balance">{active.title}</h3>

              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-titanium-400">When this happens</div>
                <p className="mt-2 text-titanium-200 leading-relaxed">{active.trigger}</p>
              </div>

              <div className="ring-aura mt-6 rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300">Rinxora says</div>
                <p className="mt-2 text-white font-medium leading-relaxed text-lg">{active.script}</p>
              </div>

              <ul className="mt-6 space-y-2.5">
                {active.rules.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-titanium-200">
                    <Check className="w-4 h-4 text-emerald-300 mt-1 shrink-0" aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-titanium-400">Outcome</span>
                <span className="text-emerald-300 font-medium">{active.result}</span>
              </div>
            </div>
          </Bezel>
        </div>
      </div>
    </section>
  );
};
