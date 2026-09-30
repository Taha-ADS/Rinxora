import React, { useState } from 'react';
import { Flame, Snowflake, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Check, Droplets, MapPin } from 'lucide-react';

export const EdgeCaseLab: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState(0);

  const edgeCases = [
    {
      id: 'gas-co',
      tabLabel: 'Gas / CO Emergency',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      badge: 'Life-Safety Global Override',
      title: 'Global Gas Smell & CO Alarm Evacuation',
      trigger: 'Caller mentions smelling gas, rotten eggs, sulfur, or a carbon monoxide alarm sounding at ANY point.',
      scriptSnippet: '"Please evacuate the house right away and call your gas utility or 911 from outside. Once you are safe, we can dispatch an emergency tech."',
      rules: [
        'Immediate global interrupt: overrides whatever flow step the caller is currently in',
        'Zero friction: suppresses all diagnostic pricing, name spellings, or mechanical lecturing',
        'Emergency capture: extracts street address and callback number in a single prompt once safe',
        'Instant priority dispatch push notification sent to on-call master technician',
      ],
      resultTag: 'Evacuation Advised + On-Call Tech Notified (Zero Billing Friction)',
    },
    {
      id: 'ceiling-leak',
      tabLabel: 'Active Ceiling Leak',
      icon: <Droplets className="w-4 h-4 text-cyan-400" />,
      badge: 'Property Protection Override',
      title: 'Active Ceiling Water Leak (Attic Drain Pan Overflow)',
      trigger: 'Caller reports water dripping or leaking through ceiling drywall from attic air handler.',
      scriptSnippet: '"Since you have an active ceiling leak, I\'m flagging this as an immediate priority for our on-call technician right now. If they\'re between jobs, they\'ll head straight over; otherwise, we\'ll lock you into our earliest window."',
      rules: [
        'Drywall protection priority: recognizes urgency of preventing sheetrock collapse',
        'Direct arrival window override: offers single earliest window instead of multi-choice',
        'Technical guidance: advises caller if AC fan switch can be toggled without electrical risk',
        'Immediate dispatch flag sent to on-call truck equipped with nitrogen blowers',
      ],
      resultTag: 'Priority Emergency Ticket Dispatched (Earliest Tech Slot)',
    },
    {
      id: 'fee-transparency',
      tabLabel: '$89 Fee & Territory',
      icon: <MapPin className="w-4 h-4 text-amber-400" />,
      badge: 'Billing & Territory Guardrails',
      title: 'DFW Territory Validation & $89 Fee Credit',
      trigger: 'Caller requests service breakdown in DFW metroplex or inquires about diagnostic charges.',
      scriptSnippet: '"Our standard diagnostic trip fee is $89, which covers the technician coming out and performing a complete multi-point inspection. If you approve the repair, that $89 fee is credited directly into the final repair cost."',
      rules: [
        'Strict territory gating: verifies Dallas, Plano, Frisco, McKinney, and Richardson coverage',
        'Polite out-of-area redirection for unsupported zip codes before collecting private data',
        '100% fee transparency: avoids surprises by obtaining verbal consent prior to truck dispatch',
        'Tune-up pricing clarity: $99 Single Seasonal Tune-Up / $189 Annual Comfort Plan',
      ],
      resultTag: '100% Fee Consent Recorded + Service Area Verified',
    },
  ];

  const active = edgeCases[selectedCase];

  return (
    <section id="hvac-triage" className="py-14 md:py-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Dispatch workflow & guardrails</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Engineered around <span className="gold-gradient-text">proven HVAC dispatcher flows</span>.
          </h2>
          <p className="text-titanium-300 text-sm mt-2">
            Strict sub-30-word turns, DFW territory checking, $89 fee credits, and immediate life-safety overrides.
          </p>
        </div>

        {/* 5-Step Linear Flow Diagram Strip */}
        <div className="mb-10 p-5 rounded-2xl glass-panel border border-white/10">
          <div className="text-sm text-titanium-400 mb-3">
            Core Conversation Flow Sequence (Dallas-Fort Worth Metro)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-sm">
            <div className="p-2.5 rounded-xl bg-titanium-900 border border-white/5">
              <span className="text-amber-400 block font-bold mb-1">01. Greeting</span>
              <span className="text-sm text-titanium-400">Warm intro &lt;30 words</span>
            </div>
            <div className="p-2.5 rounded-xl bg-titanium-900 border border-white/5">
              <span className="text-amber-400 block font-bold mb-1">02. Area Check</span>
              <span className="text-sm text-titanium-400">Dallas, Plano, Frisco+</span>
            </div>
            <div className="p-2.5 rounded-xl bg-titanium-900 border border-white/5">
              <span className="text-amber-400 block font-bold mb-1">03. $89 Fee Credit</span>
              <span className="text-sm text-titanium-400">100% credited into repair</span>
            </div>
            <div className="p-2.5 rounded-xl bg-titanium-900 border border-white/5">
              <span className="text-amber-400 block font-bold mb-1">04. Dispatch Window</span>
              <span className="text-sm text-titanium-400">Morning 9-1 / Aft 2-6</span>
            </div>
            <div className="p-2.5 rounded-xl bg-titanium-900 border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-emerald-400 block font-bold mb-1">05. Confirm & Close</span>
              <span className="text-sm text-titanium-400">Readback & 30m call</span>
            </div>
          </div>
        </div>

        {/* 3 Clean Selectable Edge-Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Selector (4 cols) */}
          <div className="md:col-span-4 space-y-2">
            {edgeCases.map((ec, idx) => (
              <button
                key={ec.id}
                onClick={() => setSelectedCase(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedCase === idx
                    ? 'bg-titanium-900 border-amber-400/50 shadow-lg text-white'
                    : 'bg-titanium-950/60 border-white/[0.06] text-titanium-400 hover:text-white hover:bg-titanium-900/40'
                }`}
              >
                <div className="p-2 rounded-lg bg-titanium-950 border border-white/10 flex-shrink-0">
                  {ec.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{ec.tabLabel}</div>
                  <div className="text-xs text-titanium-400">{ec.badge}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Showcase Box (8 cols) */}
          <div className="md:col-span-8 glass-panel-elevated p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <span className="text-xs font-medium text-amber-400 tracking-wider block">
                  {active.badge}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{active.title}</h3>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-titanium-400 mb-1">Trigger condition</div>
              <p className="text-sm text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 leading-relaxed">
                {active.trigger}
              </p>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-titanium-400 mb-1">Sarah's script execution</div>
              <p className="text-sm text-white bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 italic font-medium leading-relaxed">
                {active.scriptSnippet}
              </p>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-titanium-400 mb-2">Technical guardrails applied</div>
              <ul className="space-y-1.5 text-sm text-titanium-300">
                {active.rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-sm">
              <span className="text-titanium-400">Dispatch status:</span>
              <span className="text-emerald-400 font-semibold">{active.resultTag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
