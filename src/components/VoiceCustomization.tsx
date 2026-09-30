import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Fingerprint } from 'lucide-react';
import { Bezel, Reveal, SectionHead } from './ui';
import { PERSONAS, loadVoices, pickVoice, setAudioSession, speak, stopSpeaking } from '../lib/voice';
import { track } from '../lib/analytics';

const SAMPLES: Record<string, string> = {
  sarah: 'Thanks for calling! Oh no, let’s get that looked at before the house gets any hotter.',
  marcus: 'Got it. Sounds like an ignition lockout. Let’s get our emergency truck rolling your way.',
  aria: 'Good afternoon, and thank you for calling. I’d be delighted to find you a time that suits.',
};

export const VoiceCustomization: React.FC = () => {
  const [playing, setPlaying] = useState<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    loadVoices().then((v) => (voicesRef.current = v));
    return () => stopSpeaking();
  }, []);

  const play = (id: string) => {
    if (playing === id) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    track('voice_sample_played', { voice: id });
    setAudioSession('playback');
    const p = PERSONAS.find((x) => x.id === id)!;
    const sarah = pickVoice(PERSONAS[0], voicesRef.current);
    const voice = id === 'aria' ? pickVoice(p, voicesRef.current, sarah) : pickVoice(p, voicesRef.current);
    setPlaying(id);
    speak(SAMPLES[id], p, voice, { onEnd: () => setPlaying((cur) => (cur === id ? null : cur)) });
  };

  return (
    <section id="voices" className="relative py-20 sm:py-28 md:py-36">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHead
            eyebrow="Voices"
            title={
              <>
                A voice your clients will <span className="font-serif-accent accent-text">trust</span>.
              </>
            }
            body="Pick from the library, or have Rinxora speak in the voice of your best dispatcher. Press play to hear each one."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PERSONAS.map((p, i) => {
            const on = playing === p.id;
            return (
              <Reveal key={p.id} delay={i * 80}>
                <Bezel className="h-full" innerClassName="p-6 flex flex-col h-full">
                  <div
                    className="w-16 h-16 rounded-full ring-1 ring-white/30 shadow-[0_0_40px_-8px_rgba(155,108,240,0.8)]"
                    style={{ background: `radial-gradient(circle at 30% 28%, ${p.viz.core[0]}, ${p.viz.core[1]})` }}
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">{p.name}</h3>
                  <div className="text-xs uppercase tracking-[0.16em] text-amber-300 mt-1">{p.role}</div>
                  <p className="mt-3 text-sm text-titanium-300 leading-relaxed flex-1">{p.blurb}</p>
                  <p className="mt-4 text-sm text-titanium-400 italic leading-relaxed">“{SAMPLES[p.id]}”</p>
                  <button
                    onClick={() => play(p.id)}
                    aria-pressed={on}
                    className="mt-6 group inline-flex items-center gap-3 self-start rounded-full bg-white/[0.07] ring-1 ring-white/15 pl-2 pr-5 py-2 text-sm font-medium text-white cursor-pointer transition-[background-color,transform] duration-500 ease-lux hover:bg-white/[0.12] active:scale-[0.98]"
                  >
                    <span className="w-8 h-8 rounded-full bg-white text-titanium-950 flex items-center justify-center">
                      {on ? <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />}
                    </span>
                    {on ? (
                      <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
                        {[0, 1, 2, 3, 4].map((b) => (
                          <span key={b} className="w-[3px] rounded-full bg-amber-300 animate-soundwave" style={{ animationDelay: `${b * 0.1}s` }} />
                        ))}
                      </span>
                    ) : null}
                    <span>{on ? 'Stop' : 'Play sample'}</span>
                  </button>
                </Bezel>
              </Reveal>
            );
          })}

          <Reveal delay={240}>
            <Bezel className="h-full" innerClassName="p-6 flex flex-col h-full">
              <div className="w-16 h-16 rounded-full ring-aura flex items-center justify-center text-amber-300" aria-hidden="true">
                <Fingerprint className="w-7 h-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">Your own voice</h3>
              <div className="text-xs uppercase tracking-[0.16em] text-amber-300 mt-1">Custom clone</div>
              <p className="mt-3 text-sm text-titanium-300 leading-relaxed flex-1">
                Send about a minute of audio from your owner or top dispatcher. Clients hear a familiar voice, answering around the clock.
              </p>
              <p className="mt-4 text-sm text-titanium-400">Included in implementation setup.</p>
            </Bezel>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
