import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarCheck, MessageSquareText, Mic, Phone, RotateCcw, TriangleAlert } from 'lucide-react';
import { PillButton } from './ui';
import { Horizon } from './Horizon';
import { track } from '../lib/analytics';
import { startCall } from '../lib/call';
import { LITE } from '../lib/device';

interface HeroProps {
  onTalk: () => void;
  onBook: () => void;
}

/*
 * The hero is a short film, not a page: a call comes in at 2:14 AM, Rinxora
 * answers, the conversation plays out as kinetic type around the orb, the job
 * gets booked, and the film resolves into the headline and the CTA.
 *
 * Everything on screen is a pure function of one clock `t` (seconds), so the
 * film can play, pause off-screen, skip to the end or replay without drift.
 * Only transform, opacity and filter are animated.
 */

type Who = 'caller' | 'agent';

const SCRIPT: { who: Who; text: string }[] = [
  { who: 'agent', text: 'Northside Heating, this is Rinxora. How can I help?' },
  { who: 'caller', text: 'My furnace just died. It’s freezing in here.' },
  { who: 'agent', text: 'I’ve got you. Is anyone at risk from the cold?' },
  { who: 'caller', text: 'My daughter. She’s two.' },
  { who: 'agent', text: 'Then you’re first. Mike can be there by 2:45.' },
  { who: 'caller', text: 'Thank you. Really.' },
];

const HEADLINE = ['Every call answered.', 'Every job booked.'];

const WORD = 0.21; // speaking pace, seconds per word
const TAIL = 0.5; // the last word settling
const BREATH = 0.52; // pause between turns

const T_PILL = 0.3;
const T_RING = 0.6;
const T_ANSWER = 3.2;

const LINES = (() => {
  let at = T_ANSWER + 0.9;
  return SCRIPT.map((l) => {
    const words = l.text.split(' ');
    const start = at;
    const end = start + words.length * WORD + TAIL;
    at = end + BREATH;
    return { ...l, words, start, end };
  });
})();

const T_HANGUP = LINES[LINES.length - 1].end + 0.7;
const T_FINALE = T_HANGUP + 0.8;
const T_HEAD = T_FINALE + 0.5;
const T_CTA = T_HEAD + 1.1;
const END = T_CTA + 0.9;

const CHIPS = [
  { at: LINES[4].start + 0.3, Icon: TriangleAlert, tone: 'bg-gradient-to-br from-[#FF4D6D] to-[#FF8A3D]', title: 'Priority call', text: 'No heat, toddler at home' },
  { at: LINES[4].start + 4 * WORD + 0.3, Icon: CalendarCheck, tone: 'bg-gradient-to-br from-[#A43DF2] to-[#FF3D8B]', title: 'Booked for 2:45 AM', text: 'Mike R., on-call tech' },
  { at: LINES[5].start - 0.1, Icon: MessageSquareText, tone: 'bg-gradient-to-br from-[#6D4BFF] to-[#C43DF2]', title: 'Details texted', text: 'Address sent to Mike' },
];

const PILL_STATES: { from: number; to: number }[] = [
  { from: 0, to: T_ANSWER },
  { from: T_ANSWER, to: T_HANGUP },
  { from: T_HANGUP, to: T_FINALE + 0.3 },
  { from: T_FINALE + 0.3, to: 1e9 },
];

// ---- easing -------------------------------------------------------------
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const outExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const outCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const inOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const outBack = (p: number) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2);

/** How loud each side of the call is at time t (0..1). */
const voiceAt = (t: number) => {
  let amt = 0;
  let who: Who | null = null;
  for (const l of LINES) {
    const v = seg(t, l.start, l.start + 0.15) * (1 - seg(t, l.end - 0.4, l.end - 0.1));
    if (v > amt) {
      amt = v;
      who = l.who;
    }
  }
  const n = t * 1000;
  const syllables = clamp01(0.5 + 0.24 * Math.sin(n / 95) + 0.17 * Math.sin(n / 41 + 1.3) + 0.09 * Math.sin(n / 23));
  return { agent: who === 'agent' ? amt * syllables : 0, caller: who === 'caller' ? amt * syllables : 0, who, amt };
};

// ---- painting -----------------------------------------------------------

type Paint = { o?: number; x?: number; y?: number; s?: number; b?: number };
type El = HTMLElement & { _k?: string };

function paint(el: El | undefined, { o = 1, x = 0, y = 0, s = 1, b = 0 }: Paint) {
  if (!el) return;
  const op = o < 0.002 ? 0 : o > 0.998 ? 1 : +o.toFixed(3);
  const tr = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
  const f = !LITE && b > 0.05 ? `blur(${b.toFixed(1)}px)` : 'none';
  const key = `${op}|${tr}|${f}`;
  if (el._k === key) return;
  el._k = key;
  el.style.opacity = String(op);
  el.style.transform = tr;
  el.style.filter = f;
  el.style.visibility = op === 0 ? 'hidden' : 'visible';
}

/** Layout position of an element's centre inside `root`, ignoring transforms. */
function centreIn(el: HTMLElement, root: HTMLElement) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return [x, y];
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The soft glows. Chrome and Android blur on the GPU, so they get real blur;
 * Safari re-paints blurred layers on the CPU, so LITE gets wider gradients that
 * fade out on their own and look the same without a filter.
 */
const GLOW = LITE
  ? {
      hazeL: 'left-[8%] top-[14%] w-[48%] h-[86%] bg-[radial-gradient(closest-side,rgba(124,58,237,0.24),rgba(124,58,237,0.08)_55%,transparent)]',
      hazeR: 'right-[6%] top-[18%] w-[46%] h-[82%] bg-[radial-gradient(closest-side,rgba(214,31,140,0.2),rgba(214,31,140,0.07)_55%,transparent)]',
      rimBox: 'w-[60%] h-[16%]',
      rim: '',
      rimFill: 'radial-gradient(closest-side, rgba(255,170,120,0.7), rgba(255,77,58,0.42) 26%, rgba(214,31,140,0.2) 52%, rgba(124,58,237,0.06) 76%, transparent)',
      orb: 'w-[calc(var(--orb)*2.3)] h-[calc(var(--orb)*2.3)]',
      orbFill: 'radial-gradient(closest-side at 50% 56%, rgba(255,110,60,0.8), rgba(224,36,122,0.62) 30%, rgba(124,58,237,0.34) 55%, rgba(124,58,237,0.08) 78%, transparent)',
    }
  : {
      hazeL: 'left-[18%] top-[30%] w-[30%] h-[55%] rounded-full bg-[#7C3AED]/25 blur-[90px]',
      hazeR: 'right-[16%] top-[34%] w-[28%] h-[50%] rounded-full bg-[#D61F8C]/20 blur-[90px]',
      rimBox: 'w-[46%] h-[10%]',
      rim: 'rounded-[50%] blur-[70px]',
      rimFill: 'radial-gradient(ellipse at 50% 50%, rgba(255,170,120,0.8), rgba(255,77,58,0.5) 28%, rgba(214,31,140,0.28) 52%, transparent 72%)',
      orb: 'w-[calc(var(--orb)*1.7)] h-[calc(var(--orb)*1.7)] rounded-full blur-[36px]',
      orbFill: 'radial-gradient(circle at 50% 62%, rgba(255,110,60,0.85), rgba(224,36,122,0.75) 38%, rgba(124,58,237,0.6) 58%, transparent 74%)',
    };

export const Hero: React.FC<HeroProps> = ({ onTalk, onBook }) => {
  const [done, setDone] = useState(false);
  const els = useRef<Record<string, El>>({});
  const geo = useRef({ lineH: LINES.map(() => 0), gap: 12, chip: CHIPS.map(() => [0, 0]), drop: 160 });
  const tRef = useRef(0);
  const playing = useRef(false);
  const visible = useRef(true);
  const raf = useRef(0);
  const last = useRef(0);

  const k = (name: string) => (el: HTMLElement | null) => {
    if (el) els.current[name] = el;
  };

  const render = useCallback((t: number) => {
    const E = els.current;
    const G = geo.current;
    const v = voiceAt(t);
    const lift = v.agent + v.caller * 0.35;

    // Status pill: incoming → on the line → ended → eyebrow
    paint(E.pill, { o: outCubic(seg(t, T_PILL, T_PILL + 0.7)), y: 10 * (1 - outCubic(seg(t, T_PILL, T_PILL + 0.7))) });
    PILL_STATES.forEach(({ from, to }, i) => {
      const inP = i === 0 ? 1 : outCubic(seg(t, from, from + 0.45));
      const outP = seg(t, to, to + 0.3);
      paint(E[`pill${i}`], { o: inP * (1 - outP), y: (1 - inP) * 8 - outP * 8, b: (1 - inP) * 4 + outP * 4 });
    });
    const secs = Math.max(0, Math.floor(t - T_ANSWER));
    const clock = `0:${pad(secs)}`;
    if (E.timer && E.timer.textContent !== clock) E.timer.textContent = clock;

    // Ringing: a small phone glyph with rings, buzzing twice
    const ring = seg(t, T_RING, T_RING + 0.5) * (1 - seg(t, T_ANSWER, T_ANSWER + 0.3));
    const buzz = (t > 1.3 && t < 1.8) || (t > 2.3 && t < 2.8) ? Math.sin(t * 115) * 2.4 : 0;
    paint(E.caller, {
      o: ring,
      x: buzz,
      s: lerp(0.55, 1, outBack(seg(t, T_RING, T_RING + 0.7))) * (1 - 0.5 * inOutCubic(seg(t, T_ANSWER, T_ANSWER + 0.3))),
    });
    for (let i = 0; i < 3; i++) {
      const t0 = T_RING + 0.2 + i * 0.45;
      const ph = t > t0 ? ((t - t0) % 1.35) / 1.35 : 0;
      paint(E[`rip${i}`], { o: t > t0 ? (1 - ph) * 0.6 * ring : 0, s: 1 + ph * 1.6 });
    }

    const clockIn = outCubic(seg(t, T_PILL + 0.1, T_PILL + 1.1));
    const clockOut = inOutCubic(seg(t, T_ANSWER - 0.1, T_ANSWER + 0.6));
    paint(E.clock, { o: clockIn * (1 - clockOut), y: (1 - clockIn) * 16 - clockOut * 30, s: 1 - clockOut * 0.06, b: (1 - clockIn) * 10 + clockOut * 10 });

    // The answer: a bloom, the orb is born, the horizon rises and ignites
    const flash = seg(t, T_ANSWER, T_ANSWER + 0.9);
    paint(E.flash, { o: seg(t, T_ANSWER, T_ANSWER + 0.12) * (1 - seg(t, T_ANSWER + 0.12, T_ANSWER + 0.9)), s: lerp(0.3, 3.4, outExpo(flash)) });

    const born = outExpo(seg(t, T_ANSWER + 0.05, T_ANSWER + 1.2));
    paint(E.orb, { o: outCubic(seg(t, T_ANSWER, T_ANSWER + 0.4)), s: lerp(0.2, 1, born) * (1 + lift * 0.075) });
    paint(E.orbGlow, { o: born * (0.4 + lift * 0.6), s: 0.9 + lift * 0.35 });
    paint(E.mic, { o: outCubic(seg(t, T_HEAD + 0.5, T_HEAD + 1.1)), s: lerp(0.5, 1, outBack(seg(t, T_HEAD + 0.5, T_HEAD + 1.1))) });

    for (let i = 0; i < 3; i++) {
      const inP = outExpo(seg(t, T_ANSWER + 0.2 + i * 0.12, T_ANSWER + 1.4 + i * 0.12));
      const lag = voiceAt(t - 0.07 * (i + 1));
      paint(E[`ring${i}`], { o: inP, s: lerp(0.55, 1, inP) * (1 + (lag.agent + lag.caller * 0.4) * 0.035 * (i + 1)) });
    }

    // Voice waves: out of the orb while Rinxora speaks, into it while the caller does
    for (let i = 0; i < 3; i++) {
      const ph = (((t * 0.85 + i / 3) % 1) + 1) % 1;
      const speaking = v.who === 'agent' ? v.amt : 0;
      const listening = v.who === 'caller' ? v.amt : 0;
      if (speaking >= listening) paint(E[`wave${i}`], { o: (1 - ph) * 0.5 * speaking, s: 1 + ph * 1.5 });
      else paint(E[`wave${i}`], { o: ph * (1 - ph) * 1.6 * listening, s: 2.5 - ph * 1.5 });
    }

    const rise = inOutCubic(seg(t, T_ANSWER - 0.2, T_ANSWER + 1.8));
    paint(E.horizon, { o: 0.2 + 0.8 * rise, y: (1 - rise) * G.drop });
    paint(E.hzGlow, { o: rise * (0.35 + lift * 0.5), s: 0.94 + lift * 0.12 });
    paint(E.ambient, { o: rise * (0.75 + lift * 0.25), s: 1 + lift * 0.05 });

    // Slow push in on the orb during the call, easing back for the finale
    const push = 0.04 * inOutCubic(seg(t, T_ANSWER, T_FINALE)) * (1 - inOutCubic(seg(t, T_FINALE, T_FINALE + 1.6)));
    paint(E.stage, { s: 1 + push });

    // Captions: newest line at the bottom, earlier lines lift, dim and soften
    const entered = (j: number) => (j < LINES.length ? outCubic(seg(t, LINES[j].start, LINES[j].start + 0.55)) : 0);
    const gone = seg(t, T_FINALE, T_FINALE + 0.6);
    LINES.forEach((l, i) => {
      const e0 = entered(i);
      const e1 = entered(i + 1);
      const e2 = entered(i + 2);
      const y = -(G.lineH[i + 1] + G.gap) * e1 - ((G.lineH[i + 2] ?? 0) + G.gap) * e2;
      paint(E[`line${i}`], {
        o: e0 * (1 - 0.62 * e1) * (1 - e2) * (1 - gone),
        y: y - gone * 24,
        s: 1 - 0.05 * e1,
        b: 0.8 * e1 + 5 * e2 + gone * 8,
      });
      if (e0 === 0 || e1 === 1) return;
      l.words.forEach((_, w) => {
        const p = outCubic(seg(t, l.start + w * WORD, l.start + w * WORD + 0.45));
        paint(E[`w${i}-${w}`], { o: p, y: (1 - p) * 14, b: (1 - p) * 9 });
      });
    });

    // Booked: cards fly out of the orb, then clear for the finale
    CHIPS.forEach((c, i) => {
      const fly = outExpo(seg(t, c.at, c.at + 1));
      const out = seg(t, T_FINALE + i * 0.07, T_FINALE + 0.6 + i * 0.07);
      const [dx, dy] = G.chip[i];
      paint(E[`chip${i}`], {
        o: outCubic(seg(t, c.at, c.at + 0.35)) * (1 - out),
        x: dx * (1 - fly),
        y: dy * (1 - fly) - out * 12,
        s: lerp(0.25, 1, fly),
        b: (1 - fly) * 8 + out * 6,
      });
    });

    // Finale: the headline, then the CTA on the horizon
    HEADLINE.forEach((line, li) =>
      line.split(' ').forEach((_, w) => {
        const a = T_HEAD + li * 0.4 + w * 0.09;
        const p = outCubic(seg(t, a, a + 0.8));
        paint(E[`h${li}-${w}`], { o: p, y: (1 - p) * 22, b: (1 - p) * 12 });
      }),
    );
    const cta = outCubic(seg(t, T_CTA, T_CTA + 0.8));
    paint(E.cta, { o: cta, y: (1 - cta) * 18, b: (1 - cta) * 6 });
    if (E.cta) E.cta.inert = t < T_CTA;
  }, []);

  const measure = useCallback(() => {
    const E = els.current;
    const G = geo.current;
    G.lineH = LINES.map((_, i) => E[`line${i}`]?.offsetHeight ?? 0);
    G.gap = E.line0 ? parseFloat(getComputedStyle(E.line0).fontSize) * 0.28 : 12;
    G.drop = window.innerHeight * 0.2;
    if (E.lower && E.orb) {
      const [ox, oy] = centreIn(E.orb, E.lower);
      G.chip = CHIPS.map((_, i) => {
        const c = E[`chip${i}`];
        if (!c) return [0, 0];
        const [cx, cy] = centreIn(c, E.lower);
        return [ox - cx, oy - cy];
      });
    }
    Object.values(E).forEach((el) => (el._k = undefined));
    render(tRef.current);
  }, [render]);

  const tick = useCallback(
    (now: number) => {
      // Real time, so a slow device drops frames instead of playing in slow motion.
      // Long gaps (a backgrounded tab) are capped so the film doesn't leap ahead.
      const dt = last.current ? Math.min(0.25, (now - last.current) / 1000) : 0;
      last.current = now;
      if (visible.current) {
        tRef.current = Math.min(END, tRef.current + dt);
        render(tRef.current);
      }
      if (tRef.current >= END) {
        playing.current = false;
        raf.current = 0;
        setDone(true);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    },
    [render],
  );

  const play = useCallback(() => {
    playing.current = true;
    last.current = 0;
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const skip = () => {
    track('hero_film_skipped', { at: Math.round(tRef.current) });
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    playing.current = false;
    tRef.current = END;
    render(END);
    setDone(true);
  };

  const replay = () => {
    track('hero_film_replayed');
    setDone(false);
    tRef.current = 0;
    render(0);
    play();
  };

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (els.current.root) ro.observe(els.current.root);
    document.fonts?.ready.then(measure);

    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      last.current = 0;
    });
    if (els.current.root) io.observe(els.current.root);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seek = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('heroT') : null;
    if (reduce || seek) {
      tRef.current = reduce ? END : Math.min(END, Number(seek) || 0);
      render(tRef.current);
      if (tRef.current >= END) setDone(true);
    } else {
      play();
    }

    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      ro.disconnect();
      io.disconnect();
    };
  }, [measure, play, render]);

  // Starts the live call in the same tap (iOS only allows audio and the mic from a gesture), then scrolls to it
  const talk = () => {
    track('hero_talk_live');
    startCall();
    onTalk();
  };

  return (
    <section id="top" ref={k('root')} className={`relative isolate min-h-[100dvh] flex flex-col overflow-hidden bg-black ${LITE ? 'hero-lite' : ''} ${done ? 'hero-idle' : ''}`}>
      <div id="nav-sentinel" aria-hidden className="absolute top-0 h-px w-px" />

      <p className="sr-only">
        A short film of a real kind of call. Rinxora is a 24/7 AI receptionist. At 2:14 AM a homeowner calls a heating company: their furnace has died and their two-year-old is at
        home. Rinxora answers in the company’s name, marks the call as a priority, books Mike, the on-call technician, for 2:45 AM and texts him the address.
      </p>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        {/* Status pill */}
        <div
          ref={k('pill')}
          aria-hidden
          className="ring-aura relative h-9 w-[18.5rem] rounded-full shadow-[0_10px_40px_-12px_rgba(224,36,122,0.55)] text-[12.5px] text-titanium-100"
        >
          <span ref={k('pill0')} className="absolute inset-0 flex items-center justify-center gap-2 uppercase tracking-[0.18em] text-[11px] font-medium">
            <span className="w-4 h-4 rounded-full orb-mini" />
            The 24/7 AI receptionist
          </span>
          <span ref={k('pill1')} className="absolute inset-0 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5FA2] shadow-[0_0_10px_2px_rgba(255,95,162,0.8)]" /> Rinxora is on the line
            <span ref={k('timer')} className="tabular text-titanium-400">0:00</span>
          </span>
          <span ref={k('pill2')} className="absolute inset-0 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D06B]" /> Call ended · Job booked
          </span>
          <span ref={k('pill3')} className="absolute inset-0 flex items-center justify-center gap-2 uppercase tracking-[0.18em] text-[11px] font-medium">
            <span className="w-4 h-4 rounded-full orb-mini" />
            The 24/7 AI receptionist
          </span>
        </div>

        {/* Captions resolve into the headline */}
        <div className="relative mt-6 sm:mt-8 w-full max-w-5xl h-[8.75rem] sm:h-[10.5rem] lg:h-[12.5rem]">
          <p
            ref={k('clock')}
            aria-hidden
            className="chrome-text absolute inset-x-0 bottom-0 text-center font-extralight tracking-[-0.05em] leading-none tabular text-[5.5rem] sm:text-[8rem] lg:text-[10rem]"
          >
            2:14<span className="ml-[0.12em] text-[0.28em] tracking-[0.02em] font-normal">AM</span>
          </p>
          <div aria-hidden className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_42%)]">
            {LINES.map((l, i) => (
              <p
                key={i}
                ref={k(`line${i}`)}
                className={`absolute inset-x-0 bottom-0 origin-bottom text-center text-balance px-2 ${
                  l.who === 'caller'
                    ? 'font-serif italic text-[2rem] sm:text-[3rem] lg:text-[4.1rem] leading-[1.02]'
                    : 'font-semibold tracking-[-0.035em] text-[1.7rem] sm:text-[2.6rem] lg:text-[3.5rem] leading-[1.06]'
                }`}
              >
                {l.words.map((w, j) => (
                  <React.Fragment key={j}>
                    <span ref={k(`w${i}-${j}`)} className={`inline-block pb-[0.06em] ${l.who === 'caller' ? 'chrome-rose' : 'chrome-text'}`}>
                      {w}
                    </span>{' '}
                  </React.Fragment>
                ))}
              </p>
            ))}
          </div>

          <h1 className="absolute inset-x-0 bottom-0 text-center font-semibold tracking-[-0.045em] text-[2.3rem] sm:text-6xl lg:text-[5.4rem] leading-[1]">
            {HEADLINE.map((line, li) => (
              <span key={li} className="block">
                {line.split(' ').map((w, j) => (
                  <React.Fragment key={j}>
                    <span ref={k(`h${li}-${j}`)} className={`inline-block pb-[0.08em] ${li === 0 ? 'chrome-dim' : 'chrome-text'}`}>
                      {w}
                    </span>{' '}
                  </React.Fragment>
                ))}
              </span>
            ))}
          </h1>
          {/* A light sweep across the finished headline, like light over polished metal */}
          <p
            aria-hidden
            className={`absolute inset-x-0 bottom-0 text-center font-semibold tracking-[-0.045em] text-[2.3rem] sm:text-6xl lg:text-[5.4rem] leading-[1] pointer-events-none transition-opacity duration-1000 ease-lux ${
              done ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {HEADLINE.map((line, li) => (
              <span key={li} className="block">
                <span className="chrome-shine inline-block pb-[0.08em]" style={{ animationDelay: `${li * 0.18}s` }}>
                  {line}
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* The orb on its horizon */}
        <div
          ref={k('lower')}
          className="relative mt-2 sm:mt-4 w-full flex flex-col items-center"
          style={{ '--orb': 'clamp(6.25rem, 16dvh, 9.5rem)', '--st': 'calc(var(--orb) * 2.5)' } as React.CSSProperties}
        >
          <div ref={k('stage')} className="relative w-[var(--st)] h-[var(--st)]">
            {/* Ambient light the orb throws above the horizon */}
            <div aria-hidden className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-[190vw] lg:w-[110vw] h-[calc(var(--st)*1.9)] pointer-events-none">
              <div
                ref={k('ambient')}
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 36% 42% at 50% 60%, rgba(255,70,60,0.28), rgba(214,31,140,0.22) 38%, rgba(109,40,217,0.14) 62%, transparent 78%)',
                }}
              />
              <div className={`absolute animate-drift ${GLOW.hazeL}`} />
              <div className={`absolute animate-drift [animation-delay:-9s] ${GLOW.hazeR}`} />
            </div>

            {/* Horizon */}
            <div aria-hidden className="absolute top-[62%] left-1/2 -translate-x-1/2 w-[260vw] sm:w-[175vw] lg:w-[135vw] max-w-[2600px] aspect-square pointer-events-none">
              <div ref={k('horizon')} className="absolute inset-0">
                <Horizon />
                {/* The part of the rim that breathes with the voice */}
                <div className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 ${GLOW.rimBox}`}>
                  <div
                    ref={k('hzGlow')}
                    className={`idle-rim absolute inset-0 mix-blend-screen ${GLOW.rim}`}
                    style={{ background: GLOW.rimFill }}
                  />
                </div>
              </div>
            </div>

            {/* Glass lenses */}
            {[2.42, 1.9, 1.42].map((m, i) => (
              <span
                key={m}
                ref={k(`ring${2 - i}`)}
                aria-hidden
                className="glass-lens idle-lens absolute inset-0 m-auto rounded-full pointer-events-none"
                style={{ width: `calc(var(--orb) * ${m})`, height: `calc(var(--orb) * ${m})`, animationDelay: `${(3 - i) * 0.3}s` }}
              />
            ))}

            {/* Once the film ends: slow rings drift out of the orb as it breathes */}
            {done &&
              [0, 1, 2].map((i) => (
                <span
                  key={`idle${i}`}
                  aria-hidden
                  className="idle-ripple absolute inset-0 m-auto w-[var(--orb)] h-[var(--orb)] rounded-full pointer-events-none"
                  style={{ animationDelay: `${i * 3}s` }}
                />
              ))}

            {/* Voice waves */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                ref={k(`wave${i}`)}
                aria-hidden
                className="absolute inset-0 m-auto w-[var(--orb)] h-[var(--orb)] rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 0 1px rgba(255,140,190,0.55), 0 0 24px -2px rgba(255,90,140,0.45)' }}
              />
            ))}

            {/* Ringing */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                ref={k(`rip${i}`)}
                aria-hidden
                className="absolute inset-0 m-auto w-[calc(var(--orb)*0.5)] h-[calc(var(--orb)*0.5)] rounded-full ring-1 ring-[#6BF09A]/50 pointer-events-none"
              />
            ))}
            <div ref={k('caller')} aria-hidden className="absolute inset-0 m-auto w-[calc(var(--orb)*0.5)] h-[calc(var(--orb)*0.5)]">
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,#9DFFC0_0%,#34D06B_40%,#138A3E_100%)] shadow-[0_0_50px_-4px_rgba(52,208,107,0.75),inset_0_1px_1px_rgba(255,255,255,0.7)] flex items-center justify-center text-white">
                <Phone className="w-[42%] h-[42%] fill-current" />
              </span>
              <span className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-center leading-tight">
                <span className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#6BF09A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D06B] animate-pulse" /> Incoming call
                </span>
                <span className="chrome-text block mt-1.5 text-sm tabular">(614) 555‑0182</span>
              </span>
            </div>

            {/* The answer */}
            <span
              ref={k('flash')}
              aria-hidden
              className="absolute inset-0 m-auto w-[var(--orb)] h-[var(--orb)] rounded-full pointer-events-none mix-blend-screen"
              style={{ background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255,170,200,0.8) 25%, rgba(224,36,122,0.45) 48%, rgba(124,58,237,0) 72%)' }}
            />
            <span
              ref={k('orbGlow')}
              aria-hidden
              className={`idle-glow absolute inset-0 m-auto pointer-events-none mix-blend-screen ${GLOW.orb}`}
              style={{ background: GLOW.orbFill }}
            />

            {/* The orb, which becomes the call button */}
            <button
              ref={k('orb')}
              type="button"
              onClick={talk}
              tabIndex={done ? 0 : -1}
              aria-hidden={!done}
              aria-label="Talk to Rinxora live"
              className={`idle-orb absolute inset-0 m-auto w-[var(--orb)] h-[var(--orb)] rounded-full focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-pink-300 ${
                done ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <span className="orb absolute inset-0 rounded-full overflow-hidden transition-transform duration-700 ease-lux hover:scale-[1.04] active:scale-[0.97]">
                <span className="absolute -inset-[30%] animate-orb-swirl orb-swirl" />
                <span className="orb-gloss absolute inset-0 rounded-full" />
              </span>
              <span ref={k('mic')} className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_10px_rgba(80,0,40,0.55)]">
                <Mic className="w-[32%] h-[32%] [stroke-width:1.8]" aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* What Rinxora did, flying out of the orb */}
          {CHIPS.map(({ Icon, tone, title, text }, i) => (
            <div key={title} className="hero-chip" data-i={i} style={{ '--i': i } as React.CSSProperties} aria-hidden>
              <div
                ref={k(`chip${i}`)}
                className="ring-aura flex items-center gap-3 rounded-2xl pl-2 pr-4 py-1.5 sm:py-2 shadow-[0_24px_60px_-20px_rgba(224,36,122,0.55),inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_6px_16px_-6px_rgba(224,36,122,0.8)] ${tone}`}>
                  <Icon className="w-4 h-4 [stroke-width:1.9]" />
                </span>
                <span className="text-left leading-tight whitespace-nowrap">
                  <span className="block text-[13px] font-semibold text-white">{title}</span>
                  <span className="block text-[12px] text-titanium-300">{text}</span>
                </span>
              </div>
            </div>
          ))}

          {/* CTA on the horizon */}
          <div ref={k('cta')} className="relative z-10 -mt-[calc(var(--st)*0.24)] flex flex-col sm:flex-row items-center gap-3">
            <PillButton variant="chrome" onClick={talk}>
              Talk to Rinxora
            </PillButton>
            <PillButton
              variant="aura"
              onClick={() => {
                track('hero_book_demo');
                onBook();
              }}
            >
              Book a demo
            </PillButton>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={done ? replay : skip}
        className="absolute z-10 bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 h-11 px-5 rounded-full text-xs whitespace-nowrap text-titanium-400 hover:text-white transition-colors duration-500 ease-lux cursor-pointer"
      >
        {done ? (
          <>
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Replay the call
          </>
        ) : (
          'Skip to the end'
        )}
      </button>
    </section>
  );
};
