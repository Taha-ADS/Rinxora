import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, Sliders, PhoneForwarded, Radio, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const VoiceCustomization: React.FC = () => {
  const [activeVoice, setActiveVoice] = useState('sarah-warm');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const voiceOptions = [
    {
      id: 'sarah-warm',
      name: 'Sarah (Cartesia Sonic-3)',
      vibe: 'Warm, reassuring front-desk dispatcher (Default)',
      sampleText: '"Thanks for calling! Oh no, let’s get that AC looked at before the house gets any hotter."',
    },
    {
      id: 'marcus-direct',
      name: 'Marcus (Technical Coordinator)',
      vibe: 'Confident, clear, experienced trade coordinator',
      sampleText: '"Gotcha, sounds like an ignition lockout. Let’s get our emergency truck rolling your way."',
    },
    {
      id: 'custom-clone',
      name: 'Custom Voice Clone (Your Staff)',
      vibe: 'Trained on 60 seconds of your top dispatcher or owner',
      sampleText: '"Hey, thanks for calling our family business! We’ll take care of you right away."',
    },
  ];

  const salesPillars = [
    {
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      title: 'Full-Duplex Barge-In (0.85 Sensitivity)',
      desc: 'Powered by Retell AI. When an urgent caller interrupts mid-sentence, Sarah stops speaking instantly in under 150ms—just like a real human receptionist.',
    },
    {
      icon: <Volume2 className="w-5 h-5 text-cyan-400" />,
      title: 'Subtle Office Ambiance Layer',
      desc: 'Dead silence sounds artificial. Sarah injects subtle, natural front-desk background presence so callers perceive a busy, established local HVAC office.',
    },
    {
      icon: <PhoneForwarded className="w-5 h-5 text-emerald-400" />,
      title: 'Agentic Warm Transfers',
      desc: 'For high-stakes commercial accounts, Sarah dials the owner or on-call tech, privately whispers the caller’s address and problem, then smoothly bridges the call.',
    },
    {
      icon: <Sliders className="w-5 h-5 text-purple-400" />,
      title: '100% Custom Pricing & Territory Rules',
      desc: 'Ground Sarah on your exact diagnostic fees ($89, $99, $149), maintenance club plans, and exact county/zip code territory boundaries.',
    },
  ];

  const faqs = [
    {
      q: 'Will our callers know they are speaking to an AI?',
      a: 'In live tests, over 94% of callers assume they are talking to a dedicated in-house dispatcher. Powered by Retell AI and Cartesia Sonic-3, Sarah operates at sub-400ms latency, uses natural conversational bridges ("Gotcha," "I hear you"), and pauses naturally without robotic cadence.',
    },
    {
      q: 'What if a caller asks a complex technical or repair question?',
      a: 'Sarah has strict guardrails: she is programmed as your head dispatcher, never a field mechanic. She never guesses diagnoses over the phone. She validates the caller’s symptom, notes it for the technician’s truck tablet, and books the diagnostic inspection.',
    },
    {
      q: 'How does this connect to our existing business phone number?',
      a: 'Zero new hardware or telephone disruption. You simply set up standard call forwarding (either after 3 rings during the day, or after 5:00 PM on weeknights and weekends) from RingCentral, Grasshopper, Vonage, 8x8, or your landline carrier in under 60 seconds.',
    },
    {
      q: 'How does Sarah handle an on-call emergency technician rotation?',
      a: 'Sarah syncs with your on-call calendar. If Tech Mike is on call Monday and Tech Dave is on call Tuesday, she dispatches the emergency ticket, sends an automated PagerDuty/SMS ping to the right technician, and texts the customer a live confirmation.',
    },
    {
      q: 'What is the ROI for an HVAC shop?',
      a: 'Answering services put callers on hold for 10 minutes, causing homeowners to hang up and call the next HVAC contractor on Google. Capturing just ONE single missed after-hours furnace or AC replacement ($8,500+) covers 6 to 8 months of your service retainer.',
    },
  ];

  return (
    <section className="py-14 md:py-20 relative bg-titanium-950/80 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice customization & features</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Sounds like she’s sat at your <br />
            <span className="gold-gradient-text">front desk for five years</span>.
          </h2>
          <p className="text-titanium-300 text-sm mt-2">
            Built on Retell AI’s enterprise voice pipeline. 100% white-labeled to your company name, local accent, and service rules.
          </p>
        </div>

        {/* 4 Superpowers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {salesPillars.map((p, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/[0.08] hover:border-amber-400/30 transition-all">
              <div className="p-2.5 rounded-xl bg-titanium-900 border border-white/10 w-fit mb-3">
                {p.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{p.title}</h3>
              <p className="text-sm text-titanium-300 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Voice Selection & Custom Cloning Box */}
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08] mb-6">
            <div>
              <div className="text-sm font-medium text-amber-400 tracking-wider">
                Voice Library & Custom Cloning
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">Select a Voice or Clone Your Star Dispatcher</h3>
            </div>
            <span className="text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 w-fit">
              Cartesia Sonic-3 & ElevenLabs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voiceOptions.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveVoice(v.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  activeVoice === v.id
                    ? 'bg-titanium-900 border-amber-400/50 shadow-md text-white'
                    : 'bg-titanium-950/60 border-white/[0.06] text-titanium-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{v.name}</span>
                  {activeVoice === v.id && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                </div>
                <div className="text-xs text-titanium-400 mb-2">{v.vibe}</div>
                <p className="text-sm italic text-titanium-300 bg-titanium-950 p-2.5 rounded-lg border border-white/5">
                  {v.sampleText}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm text-titanium-400">
            <span>Voice Cloning Setup: Send 60 seconds of staff audio</span>
            <span className="text-amber-400 font-semibold">Included in Implementation Setup</span>
          </div>
        </div>

        {/* Sales Objection-Buster FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-display font-bold text-white">Frequently Asked Contractor Questions</h3>
            <p className="text-sm text-titanium-400 mt-1">Everything you need to know before deploying your 24/7 AI dispatcher.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl glass-panel border border-white/[0.08] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 text-sm font-semibold text-white"
                  >
                    <span>{f.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-titanium-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-sm text-titanium-300 leading-relaxed pt-1 border-t border-white/[0.04]">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
