import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Reveal, SectionHead } from './ui';
import { track } from '../lib/analytics';

const FAQS = [
  {
    q: 'Will clients know they’re talking to an AI?',
    a: 'Rinxora sounds natural and answers quickly, but it never pretends to be human. If a client asks, it says it’s the company’s AI assistant, then carries on helping.',
  },
  {
    q: 'What happens when a client asks something it can’t answer?',
    a: 'It doesn’t guess. It takes the client’s details and question, flags it for your team, and can transfer the call live to a person when you want that.',
  },
  {
    q: 'How does it connect to our existing phone number?',
    a: 'You keep your number. Set up call forwarding with your current carrier, after a few rings or outside business hours, and Rinxora answers the forwarded calls. No new hardware.',
  },
  {
    q: 'Does it work with our scheduling software?',
    a: 'Rinxora syncs with calendars and with ServiceTitan, Housecall Pro and Jobber, so bookings appear where your team already works.',
  },
  {
    q: 'How do we know it’s worth it?',
    a: 'A handful of recovered jobs usually covers a month of service. The calculator above lets you test that with your own call volume and average job value.',
  },
];

export const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 sm:py-28 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead eyebrow="FAQ" title={<>Questions, <span className="font-serif-accent accent-text">answered</span>.</>} />
        </Reveal>
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden">
                  <h3>
                    <button
                      onClick={() => {
                        setOpen(isOpen ? null : i);
                        if (!isOpen) track('faq_opened', { q: i });
                      }}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      className="w-full flex items-center justify-between gap-6 text-left px-6 py-5 min-h-16 text-white font-medium cursor-pointer"
                    >
                      <span>{f.q}</span>
                      <span className="shrink-0 w-9 h-9 rounded-full bg-white/[0.07] flex items-center justify-center text-titanium-200">
                        {isOpen ? <Minus className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-${i}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-700 ease-lux ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-titanium-300 leading-relaxed text-pretty">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
