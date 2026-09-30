import React, { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, CalendarClock, Check, LoaderCircle, Mail } from 'lucide-react';
import { Reveal } from './ui';
import { BOOKING_URL, CONTACT_EMAIL, canBook } from '../lib/config';
import { Lead, LeadError, PLAN_EVENT, calendarFor, mailtoFor, sendLead } from '../lib/lead';
import { track } from '../lib/analytics';
import { startCall } from '../lib/call';

const TRADES = ['HVAC', 'Plumbing', 'Electrical', 'Other'];
const PLANS = ['Not sure yet', 'After-Hours', '24/7 Front Desk', 'Multi-Location'];

const STEPS = [
  { t: 'Tell us about your business', d: 'Your services, your prices, the calls you miss.' },
  { t: 'We tailor Rinxora to it', d: 'Your greeting, your fees, your emergency rules.' },
  { t: 'You hear it take your calls', d: 'Before you pay for anything.' },
];

const EMPTY: Lead = { name: '', business: '', email: '', phone: '', trade: 'HVAC', plan: PLANS[0], message: '', consent: false, website: '' };

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; via: 'sent' | 'mailto' } | { kind: 'error'; reason: LeadError['reason'] };

const field =
  'mt-2 block w-full h-12 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 text-base text-white placeholder:text-titanium-500 outline-none transition-[box-shadow,background-color] duration-300 ease-lux focus:bg-white/[0.06] focus:ring-2 focus:ring-[#FF5FA2]/70';
const labelCls = 'text-sm font-medium text-titanium-200';

export const BookDemo: React.FC<{ onTryLive: () => void }> = ({ onTryLive }) => {
  const [lead, setLead] = useState<Lead>(EMPTY);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const id = useId();
  const card = useRef<HTMLDivElement | null>(null);

  // The confirmation is shorter than the form: keep it in view on small screens
  useEffect(() => {
    if (status.kind === 'sent') card.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [status.kind]);

  // "Book a demo" on a pricing plan arrives with that plan selected
  useEffect(() => {
    const onPlan = (e: Event) => {
      const plan = (e as CustomEvent<string>).detail;
      if (PLANS.includes(plan)) setLead((l) => ({ ...l, plan }));
    };
    window.addEventListener(PLAN_EVENT, onPlan);
    return () => window.removeEventListener(PLAN_EVENT, onPlan);
  }, []);

  const set = <K extends keyof Lead>(k: K) => (v: Lead[K]) => setLead((l) => ({ ...l, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: 'sending' });
    try {
      const via = await sendLead({ ...lead, name: lead.name.trim(), email: lead.email.trim() });
      track('lead_submitted', { trade: lead.trade, plan: lead.plan, via });
      setStatus({ kind: 'sent', via });
    } catch (err) {
      const reason = err instanceof LeadError ? err.reason : 'network';
      track('lead_failed', { reason });
      setStatus({ kind: 'error', reason });
    }
  };

  const first = lead.name.trim().split(/\s+/)[0];
  const calendar = calendarFor(lead.name.trim(), lead.email.trim());

  return (
    <section id="book" className="relative isolate py-20 sm:py-28 md:py-36 overflow-hidden bg-black">
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-[-10%] -translate-x-1/2 w-[900px] max-w-[160vw] h-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(214,31,140,0.22),rgba(124,58,237,0.14)_45%,transparent_70%)]" />
        <div className="absolute right-[-10%] bottom-[-20%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,106,43,0.14),transparent_65%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* What happens next */}
        <Reveal className="lg:col-span-5 lg:sticky lg:top-32">
          <span className="ring-aura inline-flex items-center gap-2 rounded-full h-8 px-3.5 text-[11px] uppercase tracking-[0.18em] font-medium text-titanium-100">
            <span className="orb-mini w-3.5 h-3.5 rounded-full" /> Book a demo
          </span>
          <h2 className="mt-6 text-[2.5rem] sm:text-6xl font-semibold tracking-[-0.045em] leading-[1]">
            <span className="chrome-dim block pb-[0.06em]">Hear it answer</span>{' '}
            <span className="chrome-text block pb-[0.08em]">your calls.</span>
          </h2>

          <ol className="mt-10 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="w-8 h-8 shrink-0 rounded-full ring-aura flex items-center justify-center text-[13px] font-semibold text-white tabular">{i + 1}</span>
                <span>
                  <span className="block text-white font-semibold">{s.t}</span>
                  <span className="block mt-0.5 text-titanium-300">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => {
              track('book_try_live_click');
              startCall();
              onTryLive();
            }}
            className="mt-10 inline-flex items-center gap-2 h-11 text-titanium-200 hover:text-white transition-colors duration-500 ease-lux cursor-pointer"
          >
            Rather try it first? Talk to Rinxora now <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </Reveal>

        {/* The form */}
        <Reveal delay={120} className="lg:col-span-7">
          <div ref={card} className="ring-aura rounded-[2rem] p-1.5 shadow-[0_40px_120px_-40px_rgba(224,36,122,0.55)]">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[linear-gradient(180deg,#110c16,#07050a)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-6 sm:p-9">
              {status.kind === 'sent' ? (
                <div role="status" className="py-6 sm:py-10 text-center">
                  <span className="mx-auto w-14 h-14 rounded-full orb flex items-center justify-center text-white">
                    <Check className="w-6 h-6 [stroke-width:2.2]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
                    {status.via === 'mailto' ? 'Your email is ready to send.' : `Thanks${first ? `, ${first}` : ''}. You’re on the list.`}
                  </h3>
                  <p className="mt-3 text-titanium-300 max-w-md mx-auto text-pretty">
                    {status.via === 'mailto'
                      ? 'Your mail app opened with your details filled in. Press send and we’ll take it from there.'
                      : `We’ll reach you at ${lead.email.trim()} to set up your demo.`}
                  </p>
                  {calendar && (
                    <a
                      href={calendar}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track('lead_calendar_opened')}
                      className="btn-chrome group mt-8 inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-sm font-semibold text-[#0B0A0F] transition-transform duration-500 ease-lux active:scale-[0.98]"
                    >
                      <span>Pick a time now</span>
                      <span className="w-9 h-9 rounded-full bg-[#0B0A0F]/[0.08] flex items-center justify-center transition-transform duration-500 ease-lux group-hover:translate-x-1 group-hover:-translate-y-px">
                        <CalendarClock className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <form onSubmit={submit} noValidate={false} aria-describedby={`${id}-legal`}>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white">Tell us about your business</h3>
                  <p className="mt-1.5 text-sm text-titanium-300">Takes about a minute.</p>

                  {import.meta.env.DEV && !canBook && (
                    <p className="mt-5 rounded-xl bg-amber-500/10 ring-1 ring-amber-300/30 px-4 py-3 text-sm text-amber-200">
                      Dev note: booking isn’t configured. Set VITE_LEAD_ENDPOINT, VITE_BOOKING_URL or VITE_CONTACT_EMAIL in .env.local.
                    </p>
                  )}

                  <div className="mt-7 grid sm:grid-cols-2 gap-5">
                    <label className="block">
                      <span className={labelCls}>Your name</span>
                      <input required autoComplete="name" value={lead.name} onChange={(e) => set('name')(e.target.value)} className={field} />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Business name</span>
                      <input required autoComplete="organization" value={lead.business} onChange={(e) => set('business')(e.target.value)} className={field} />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Work email</span>
                      <input
                        required
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="off"
                        spellCheck={false}
                        value={lead.email}
                        onChange={(e) => set('email')(e.target.value)}
                        className={field}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Mobile number</span>
                      <input
                        required
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        pattern="[0-9()+\-.\s]{7,}"
                        title="A phone number we can reach you on"
                        value={lead.phone}
                        onChange={(e) => set('phone')(e.target.value)}
                        className={field}
                      />
                    </label>
                  </div>

                  <fieldset className="mt-6">
                    <legend className={labelCls}>Your trade</legend>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TRADES.map((t) => (
                        <label key={t} className="relative">
                          <input
                            type="radio"
                            name="trade"
                            value={t}
                            checked={lead.trade === t}
                            onChange={() => set('trade')(t)}
                            className="peer sr-only"
                          />
                          <span className="flex items-center justify-center h-12 rounded-xl ring-1 ring-white/10 bg-white/[0.03] text-sm text-titanium-200 cursor-pointer transition-[background-color,box-shadow,color] duration-300 ease-lux hover:bg-white/[0.06] peer-checked:bg-white/[0.1] peer-checked:text-white peer-checked:ring-2 peer-checked:ring-[#FF5FA2]/70 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink-300">
                            {t}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="mt-6 block">
                    <span className={labelCls}>Plan you’re considering</span>
                    <select value={lead.plan} onChange={(e) => set('plan')(e.target.value)} className={`${field} appearance-none cursor-pointer bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='8'%20fill='none'%20stroke='%23B5AFC6'%20stroke-width='1.6'%3E%3Cpath%20d='M1%201.5l5%205%205-5'/%3E%3C/svg%3E")] bg-no-repeat bg-[position:right_1rem_center] pr-10`}>
                      {PLANS.map((p) => (
                        <option key={p} value={p} className="bg-[#110c16]">
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-6 block">
                    <span className={labelCls}>
                      Anything we should know? <span className="text-titanium-400 font-normal">Optional</span>
                    </span>
                    <textarea
                      rows={3}
                      value={lead.message}
                      onChange={(e) => set('message')(e.target.value)}
                      placeholder="For example: we miss most calls after 6 PM"
                      className={`${field} h-auto py-3 resize-none`}
                    />
                  </label>

                  {/* Honeypot, hidden from people and assistive tech */}
                  <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                    <label>
                      Website
                      <input tabIndex={-1} autoComplete="off" value={lead.website} onChange={(e) => set('website')(e.target.value)} />
                    </label>
                  </div>

                  <label className="mt-6 flex items-start gap-3 cursor-pointer">
                    <input
                      required
                      type="checkbox"
                      checked={lead.consent}
                      onChange={(e) => set('consent')(e.target.checked)}
                      className="mt-0.5 w-5 h-5 shrink-0 rounded accent-[#FF5FA2] cursor-pointer"
                    />
                    <span id={`${id}-legal`} className="text-sm text-titanium-300 leading-relaxed">
                      Rinxora may contact me by phone, text or email about my demo. Consent isn’t a condition of purchase; message and data rates may
                      apply, and I can reply STOP to opt out. See the{' '}
                      <a href="/privacy.html" className="text-white underline underline-offset-2 decoration-white/30 hover:decoration-white">
                        Privacy Policy
                      </a>{' '}
                      and{' '}
                      <a href="/terms.html" className="text-white underline underline-offset-2 decoration-white/30 hover:decoration-white">
                        Terms
                      </a>
                      .
                    </span>
                  </label>

                  {status.kind === 'error' && (
                    <div role="alert" className="mt-6 rounded-xl bg-rose-500/10 ring-1 ring-rose-400/30 px-4 py-3 text-sm text-rose-100">
                      {status.reason === 'not-configured'
                        ? 'Booking is temporarily unavailable. Please try again soon.'
                        : 'That didn’t go through. Check your connection and try again.'}
                      {CONTACT_EMAIL && (
                        <>
                          {' '}
                          Or{' '}
                          <a href={mailtoFor(lead)} className="underline underline-offset-2 text-white inline-flex items-center gap-1">
                            email us instead <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                          .
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                      type="submit"
                      disabled={status.kind === 'sending'}
                      className="btn-chrome group inline-flex items-center justify-center gap-3 rounded-full pl-6 pr-2 py-2 text-sm font-semibold text-[#0B0A0F] cursor-pointer transition-transform duration-500 ease-lux active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
                    >
                      <span>{status.kind === 'sending' ? 'Sending…' : 'Request my demo'}</span>
                      <span className="w-9 h-9 rounded-full bg-[#0B0A0F]/[0.08] flex items-center justify-center transition-transform duration-500 ease-lux group-hover:translate-x-1 group-hover:-translate-y-px">
                        {status.kind === 'sending' ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                    {BOOKING_URL && <span className="text-sm text-titanium-400">Next, you can pick a time on our calendar.</span>}
                  </div>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
