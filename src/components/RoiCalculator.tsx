import React, { useState } from 'react';
import { Bezel, Reveal, SectionHead, PillButton } from './ui';
import { track } from '../lib/analytics';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const int = new Intl.NumberFormat('en-US');

const Slider: React.FC<{
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}> = ({ id, label, value, display, min, max, step, onChange }) => (
  <div>
    <div className="flex items-baseline justify-between gap-4">
      <label htmlFor={id} className="text-sm font-medium text-titanium-200">
        {label}
      </label>
      <output htmlFor={id} className="text-lg font-semibold text-white tabular">
        {display}
      </output>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="range mt-1"
      style={{ '--p': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties}
    />
  </div>
);

export const RoiCalculator: React.FC = () => {
  const [calls, setCalls] = useState(30);
  const [rate, setRate] = useState(30);
  const [value, setValue] = useState(500);

  const jobs = Math.round((calls * rate) / 100);
  const monthly = jobs * value;
  const yearly = monthly * 12;

  return (
    <section id="roi" className="relative py-20 sm:py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead
            eyebrow="The cost of a missed call"
            title={
              <>
                What is voicemail <span className="font-serif-accent accent-text">costing you</span>?
              </>
            }
            body="Clients who don’t reach a person rarely leave a message. They call the next business on the list. Estimate what that’s worth to you."
          />
        </Reveal>

        <Reveal delay={100} className="mt-16">
          <Bezel>
            <div className="grid md:grid-cols-2 gap-10 md:gap-0">
              <div className="p-7 sm:p-10 space-y-9">
                <Slider
                  id="roi-calls"
                  label="Calls you miss each month"
                  value={calls}
                  display={int.format(calls)}
                  min={5}
                  max={300}
                  step={5}
                  onChange={setCalls}
                />
                <Slider
                  id="roi-rate"
                  label="Share that would book"
                  value={rate}
                  display={`${rate}%`}
                  min={5}
                  max={70}
                  step={5}
                  onChange={setRate}
                />
                <Slider
                  id="roi-value"
                  label="Average job value"
                  value={value}
                  display={money.format(value)}
                  min={100}
                  max={10000}
                  step={50}
                  onChange={setValue}
                />
                <p className="text-xs text-titanium-400 leading-relaxed">
                  An estimate from the numbers you enter, not a guarantee. Adjust the booking share to match how well your business converts live calls.
                </p>
              </div>

              <div className="p-7 sm:p-10 md:border-l border-white/10 flex flex-col justify-between bg-gradient-to-br from-[#7C3AED]/[0.08] to-[#E0247A]/[0.1] rounded-b-[calc(2rem-0.375rem)] md:rounded-b-none md:rounded-r-[calc(2rem-0.375rem)]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-titanium-300">Revenue recovered per year</div>
                  <div className="mt-3 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] text-white tabular accent-text" aria-live="polite">
                    {money.format(yearly)}
                  </div>
                  <dl className="mt-8 grid grid-cols-2 gap-6">
                    <div>
                      <dt className="text-xs text-titanium-400">Jobs booked / month</dt>
                      <dd className="mt-1 text-2xl font-semibold text-white tabular">{int.format(jobs)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-titanium-400">Revenue / month</dt>
                      <dd className="mt-1 text-2xl font-semibold text-white tabular">{money.format(monthly)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-10">
                  <PillButton href="#pricing" onClick={() => track('roi_see_pricing', { yearly })}>
                    See plans
                  </PillButton>
                </div>
              </div>
            </div>
          </Bezel>
        </Reveal>
      </div>
    </section>
  );
};
