import React from 'react';
import { Reveal, SectionHead } from './ui';
import { TESTIMONIALS } from '../lib/proof';

/** Customer quotes. Renders nothing until src/lib/proof.ts has real entries. */
export const Proof: React.FC = () => {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section id="customers" className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead eyebrow="Customers" title={<>Owners who stopped <span className="font-serif-accent accent-text">missing calls</span>.</>} />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <figure className="ring-aura h-full rounded-[2rem] p-7 flex flex-col">
                {t.metric && <p className="chrome-text text-2xl font-semibold tracking-[-0.03em]">{t.metric}</p>}
                <blockquote className="mt-4 text-titanium-100 leading-relaxed text-pretty flex-1">“{t.quote}”</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="block text-white font-semibold">{t.name}</span>
                  <span className="block text-titanium-400">{t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
