import React from 'react';
import { CalendarCheck2, BadgeCheck, PhoneForwarded, Mic2, Plug, MapPin } from 'lucide-react';
import { Bezel, IconTile, Reveal, SectionHead } from './ui';

const Card: React.FC<{
  className?: string;
  icon: React.ElementType;
  title: string;
  body: string;
  delay?: number;
  tone?: 'ember' | 'magenta' | 'violet';
  children?: React.ReactNode;
}> = ({ className = '', icon: Icon, title, body, delay = 0, tone = 'magenta', children }) => (
  <Reveal delay={delay} className={className}>
    <Bezel className="h-full" innerClassName="p-6 sm:p-8 flex flex-col">
      <IconTile icon={Icon} tone={tone} />
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">{title}</h3>
      <p className="mt-2 text-sm sm:text-base text-titanium-300 leading-relaxed text-pretty">{body}</p>
      {children}
    </Bezel>
  </Reveal>
);

export const Capabilities: React.FC = () => (
  <section id="capabilities" className="relative isolate py-20 sm:py-28 md:py-36">
    <div aria-hidden className="absolute inset-x-0 top-1/3 h-[500px] -z-10 pointer-events-none overflow-hidden">
      <div className="absolute left-[-5%] top-0 w-[480px] h-[480px] rounded-full bg-[#E0247A]/[0.14] blur-[140px]" />
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHead
          eyebrow="What it does"
          title={
            <>
              Everything a great receptionist does, <span className="font-serif-accent accent-text">minus the missed calls</span>.
            </>
          }
          body="Built first for HVAC, and designed for any business that lives on booked appointments."
        />
      </Reveal>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Hero card: the booking */}
        <Reveal className="md:col-span-7 md:row-span-2">
          <Bezel className="h-full" innerClassName="p-6 sm:p-8 flex flex-col h-full">
            <IconTile icon={CalendarCheck2} size="lg" tone="ember" />
            <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">Books the job while the client is still on the line</h3>
            <p className="mt-3 text-titanium-300 leading-relaxed max-w-lg text-pretty">
              Rinxora checks the on-call calendar, offers a real time window, and writes the appointment straight into your system. The client hangs up with a confirmation, not a promise to call back.
            </p>

            {/* Example booking card (illustrative) */}
            <div className="mt-8 md:mt-auto pt-8">
              <div className="rounded-3xl bg-black/30 ring-1 ring-white/10 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-titanium-400">New booking · example</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                    <BadgeCheck className="w-4 h-4" aria-hidden="true" /> Confirmed
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-titanium-400 text-xs">Service</dt>
                    <dd className="text-white mt-0.5">AC not cooling · diagnostic visit</dd>
                  </div>
                  <div>
                    <dt className="text-titanium-400 text-xs">Window</dt>
                    <dd className="text-white mt-0.5">Today, 2 – 6 PM</dd>
                  </div>
                  <div>
                    <dt className="text-titanium-400 text-xs">Location</dt>
                    <dd className="text-white mt-0.5 inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" /> Plano, TX · in service area
                    </dd>
                  </div>
                  <div>
                    <dt className="text-titanium-400 text-xs">Fee consent</dt>
                    <dd className="text-white mt-0.5">Approved on the call</dd>
                  </div>
                </dl>
                <div className="mt-5 pt-4 border-t border-white/10 text-xs text-titanium-400">
                  Text confirmation sent to the client · Summary sent to your team
                </div>
              </div>
            </div>
          </Bezel>
        </Reveal>

        <Card
          className="md:col-span-5"
          delay={80}
          icon={Mic2}
          title="Sounds like your front desk"
          body="Choose a voice, name the business, set the tone. Upload a minute of your best dispatcher and Rinxora can speak in their voice."
        />
        <Card
          className="md:col-span-5"
          delay={120}
          icon={PhoneForwarded}
          tone="violet"
          title="Warm transfers to your team"
          body="High-value or sensitive calls are handed to you live, with the client’s details already briefed."
        />
        <Card
          className="md:col-span-6"
          delay={80}
          icon={BadgeCheck}
          title="Quotes and gets consent"
          body="It states your fees plainly and records the client’s approval before anyone is dispatched, so there are no billing surprises."
        />
        <Card
          className="md:col-span-6"
          delay={120}
          icon={Plug}
          tone="violet"
          title="Fits the way you work"
          body="Keep your phone number and your calendar. Rinxora works alongside the tools your team already uses."
        />
      </div>
    </div>
  </section>
);
