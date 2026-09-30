import React from 'react';
import { PhoneIncoming, Ear, CalendarCheck, MessageSquareText } from 'lucide-react';
import { Bezel, IconTile, Reveal, SectionHead } from './ui';

const STEPS = [
  {
    icon: PhoneIncoming,
    title: 'Answers on the first ring',
    body: 'Every call is picked up instantly, day or night, in your business name. No hold music, no voicemail, no missed lead.',
  },
  {
    icon: Ear,
    title: 'Understands what the client needs',
    body: 'It listens, asks the right follow-up questions, checks your service area and flags anything urgent or unsafe before it does anything else.',
  },
  {
    icon: CalendarCheck,
    title: 'Books the appointment',
    body: 'It reads your availability, offers a window, explains pricing, gets the client’s consent and writes the job into your calendar or CRM.',
  },
  {
    icon: MessageSquareText,
    title: 'Confirms and hands off',
    body: 'The client gets a text confirmation. Your team gets the call summary and, for emergencies, an immediate alert. You never have to call back cold.',
  },
];

export const HowItWorks: React.FC = () => (
  <section id="how" className="relative py-20 sm:py-28 md:py-36">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-20">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          <Reveal>
            <SectionHead
              align="left"
              eyebrow="How it works"
              title={
                <>
                  From ringing phone to <span className="font-serif-accent accent-text">booked job</span>, with no one on your payroll.
                </>
              }
              body="Rinxora is a voice receptionist that does the whole job: it answers, qualifies and schedules, then tells you exactly what happened."
            />
          </Reveal>
        </div>
      </div>

      <ol className="lg:col-span-7 space-y-5">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 80}>
              <Bezel>
                <div className="p-6 sm:p-8 flex gap-5 sm:gap-7">
                  <div className="shrink-0">
                    <IconTile icon={s.icon} size="lg" tone={(['ember', 'magenta', 'violet', 'magenta'] as const)[i]} />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-titanium-400 tabular">Step 0{i + 1}</div>
                    <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white">{s.title}</h3>
                    <p className="mt-2 text-titanium-300 leading-relaxed text-pretty">{s.body}</p>
                  </div>
                </div>
              </Bezel>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
