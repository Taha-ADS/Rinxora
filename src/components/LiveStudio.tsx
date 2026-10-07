import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Hand, Mic, MicOff, Pause, Play, PhoneOff, Zap } from 'lucide-react';
import { VoiceStage, VoiceMode } from './VoiceStage';
import { CallButton } from './CallButton';
import { Eyebrow, Reveal } from './ui';
import {
  MicMeter,
  PERSONAS,
  canSpeak,
  getRecognitionCtor,
  loadVoices,
  pickVoice,
  speak,
  setAudioSession,
  speaker,
  stopSpeaking,
  unlockSpeech,
} from '../lib/voice';
import { DialogState, greeting, initialState, respond } from '../lib/receptionist';
import { track } from '../lib/analytics';
import { CALL_EVENT } from '../lib/call';
import { LiveAgent, agentIdFor, liveEnabled, preloadAgent, Turn } from '../lib/agent';

interface LiveStudioProps {
  onExploreEdgeCases: () => void;
}

interface Message {
  id: number;
  who: 'agent' | 'you';
  text: string;
}

const TRY_SAYING = [
  'My furnace stopped working',
  'My AC is blowing warm air',
  'I smell gas in the basement',
  'How much is a visit?',
];

const STATUS: Record<VoiceMode, string> = {
  idle: 'Ready',
  speaking: 'Speaking',
  listening: 'Listening',
  thinking: 'Thinking',
  paused: 'Paused',
};

// On a live call only voices that have a Retell agent are offered.
const LIVE_VOICES = liveEnabled ? PERSONAS.filter((p) => agentIdFor(p.id)) : PERSONAS;
const VOICES = LIVE_VOICES.length ? LIVE_VOICES : PERSONAS;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** The live console: talk to Rinxora for real, right after the hero film. */
export const LiveStudio: React.FC<LiveStudioProps> = ({ onExploreEdgeCases }) => {
  const [personaId, setPersonaId] = useState(VOICES[0].id);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [live, setLive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<VoiceMode>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [caption, setCaption] = useState<{ text: string; spoken: number } | null>(null);
  const [interim, setInterim] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [micState, setMicState] = useState<'unknown' | 'ok' | 'denied'>('unknown');
  const [note, setNote] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [liveCall, setLiveCall] = useState(false); // true while the real agent is on the line

  const persona = useMemo(() => PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0], [personaId]);
  const sttSupported = useMemo(() => Boolean(getRecognitionCtor()), []);
  const canListen = sttSupported && micState !== 'denied';

  // Refs mirror state for callbacks that outlive a render (speech + recognition events).
  const liveRef = useRef(false);
  const pausedRef = useRef(false);
  const mutedRef = useRef(false);
  const resumeRef = useRef<'speak' | 'listen' | 'think' | null>(null);
  const modeRef = useRef<VoiceMode>('idle');
  const personaRef = useRef(persona);
  const dialogRef = useRef<DialogState>(initialState());
  const micRef = useRef(new MicMeter());
  const recogRef = useRef<any>(null);
  const micStateRef = useRef(micState);
  const pulseRef = useRef(0);
  const idRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const silentRetries = useRef(0);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const agentRef = useRef(new LiveAgent());
  const liveCallRef = useRef(false);
  const lastAgentText = useRef('');
  personaRef.current = persona;
  micStateRef.current = micState;

  const setPhase = (m: VoiceMode) => {
    modeRef.current = m;
    setMode(m);
  };

  useEffect(() => {
    loadVoices().then(setVoices);
  }, []);

  // Fetch the call SDK as the visitor approaches the console, so the first tap connects quickly
  useEffect(() => {
    const el = document.getElementById('studio');
    if (!el || !('IntersectionObserver' in window)) return preloadAgent();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          preloadAgent();
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Call timer (frozen while paused)
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) setSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [live]);

  // Live call: reveal the agent's words at speaking pace (the stream carries no word timing)
  useEffect(() => {
    if (!liveCall || mode !== 'speaking') return;
    const id = window.setInterval(() => {
      setCaption((c) => (c ? { text: c.text, spoken: Math.min(c.text.length, c.spoken + 1.1) } : c));
    }, 70);
    return () => window.clearInterval(id);
  }, [liveCall, mode]);

  // Each persona gets its own system voice; same-gender personas are kept distinct.
  const voiceFor = useCallback(
    (id: string) => {
      const p = PERSONAS.find((x) => x.id === id) ?? PERSONAS[0];
      const sarah = pickVoice(PERSONAS[0], voices);
      return p.id === 'aria' ? pickVoice(p, voices, sarah) : pickVoice(p, voices);
    },
    [voices],
  );
  const voiceForRef = useRef(voiceFor);
  voiceForRef.current = voiceFor;

  // The loudness that drives the wave, the ripples and the halo.
  const getLevel = useCallback(() => {
    const m = modeRef.current;
    if (m === 'idle' && !liveRef.current) {
      // Beckoning: a slow swell that invites a first tap
      const swell = Math.max(0, Math.sin(performance.now() / 1150));
      return 0.07 + 0.2 * swell * swell * swell;
    }
    if (m === 'listening') return micRef.current.level();
    if (m === 'speaking' && liveCallRef.current) {
      const v = agentRef.current.volume();
      const now = performance.now();
      const fallback = 0.26 + 0.2 * Math.sin(now / 95) + 0.12 * Math.sin(now / 41 + 1.3);
      return Math.max(0.1, Math.min(1, v > 0.01 ? v * 1.8 : fallback));
    }
    if (m === 'speaking') {
      const now = performance.now();
      const base = 0.3 + 0.22 * Math.sin(now / 95) + 0.16 * Math.sin(now / 41 + 1.3);
      pulseRef.current *= 0.9;
      return Math.max(0.12, Math.min(1, base + pulseRef.current * 0.4));
    }
    return 0;
  }, []);

  const clearTick = () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = null;
  };

  const stopListening = () => {
    const r = recogRef.current;
    recogRef.current = null;
    if (r) {
      r.onresult = r.onerror = r.onend = null;
      try {
        r.abort();
      } catch {
        /* already stopped */
      }
    }
    setInterim('');
  };

  const addMessage = (who: Message['who'], text: string) =>
    setMessages((prev) => [...prev, { id: ++idRef.current, who, text }]);

  const handleUserRef = useRef<(text: string) => void>(() => {});
  const listenRef = useRef<() => void>(() => {});

  const listen = useCallback(() => {
    if (!liveRef.current || pausedRef.current) return;
    const Ctor = getRecognitionCtor();
    if (!Ctor || micStateRef.current === 'denied' || mutedRef.current) {
      setPhase('idle');
      return;
    }
    stopListening();
    const r = new Ctor();
    recogRef.current = r;
    r.lang = 'en-US';
    r.interimResults = true;
    r.continuous = false;
    let heard = false;

    r.onresult = (e: any) => {
      let text = '';
      let final = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      heard = true;
      setInterim(text);
      if (final) {
        stopListening();
        handleUserRef.current(text);
      }
    };
    r.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setMicState('denied');
    };
    r.onend = () => {
      if (recogRef.current !== r) return;
      recogRef.current = null;
      setInterim('');
      if (!liveRef.current || pausedRef.current || modeRef.current !== 'listening') return;
      if (!heard && ++silentRetries.current >= 3) {
        silentRetries.current = 0;
        setPhase('idle'); // go quiet instead of listening forever
        return;
      }
      window.setTimeout(() => liveRef.current && modeRef.current === 'listening' && listenRef.current(), 150);
    };

    try {
      r.start();
      setPhase('listening');
    } catch {
      setPhase('idle');
    }
  }, []);
  listenRef.current = listen;

  const say = useCallback((text: string, then: 'listen' | 'idle' = 'listen') => {
    stopListening();
    clearTick();
    setCaption({ text, spoken: 0 });
    setPhase('speaking');
    const p = personaRef.current;

    // Word highlighting: snap to real boundary events, estimate where a platform doesn't emit them.
    const charsPerSec = 15 * p.rate;
    let elapsed = 0;
    tickRef.current = window.setInterval(() => {
      if (pausedRef.current) return;
      elapsed += 70;
      const est = (elapsed / 1000) * charsPerSec;
      setCaption((c) => (c && c.text === text ? { text, spoken: Math.max(c.spoken, Math.min(text.length, est)) } : c));
    }, 70);

    const finish = () => {
      clearTick();
      setCaption({ text, spoken: text.length });
      if (pausedRef.current) {
        resumeRef.current = then === 'listen' ? 'listen' : null;
        return;
      }
      if (modeRef.current !== 'speaking') return;
      if (then === 'listen' && liveRef.current) {
        silentRetries.current = 0;
        listenRef.current();
      } else {
        setPhase('idle');
      }
    };

    if (!canSpeak()) {
      window.setTimeout(finish, Math.max(1500, (text.length / charsPerSec) * 1000));
      return;
    }
    speak(text, p, voiceForRef.current(p.id), {
      onProgress: (i) => {
        pulseRef.current = 1;
        setCaption((c) => (c && c.text === text ? { text, spoken: Math.max(c.spoken, i) } : c));
      },
      onEnd: finish,
    });
  }, []);

  const handleUser = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      stopSpeaking();
      stopListening();
      addMessage('you', text);
      setCaption(null);
      setPhase('thinking');
      const p = personaRef.current;
      const reply = () => {
        if (!liveRef.current) return;
        if (pausedRef.current) {
          window.setTimeout(reply, 300);
          return;
        }
        const turn = respond(text, dialogRef.current, p.name);
        dialogRef.current = turn.state;
        if (turn.action) {
          setActions((a) => [...a.slice(-3), turn.action as string]);
          if (/booked/i.test(turn.action)) track('demo_job_booked', { voice: p.id });
        }
        addMessage('agent', turn.reply);
        say(turn.reply);
      };
      window.setTimeout(reply, 550);
    },
    [say],
  );
  handleUserRef.current = handleUser;

  const beginSession = () => {
    setAudioSession('play-and-record');
    liveRef.current = true;
    pausedRef.current = false;
    resumeRef.current = null;
    setLive(true);
    setSeconds(0);
    setMessages([]);
    setActions([]);
    setCaption(null);
    dialogRef.current = initialState();
  };

  const ensureMic = async () => {
    if (!sttSupported || micStateRef.current === 'ok') return;
    const ok = await micRef.current.start();
    setMicState(ok ? 'ok' : 'denied');
    micStateRef.current = ok ? 'ok' : 'denied';
  };

  const finishLive = () => {
    setAudioSession('auto');
    track('voice_call_ended', { mode: 'live' });
    liveRef.current = false;
    liveCallRef.current = false;
    setLiveCall(false);
    setLive(false);
    setConnecting(false);
    mutedRef.current = false;
    setMuted(false);
    micRef.current.stop();
    setInterim('');
    setPhase('idle');
    setCaption(null);
  };

  const startLive = () => {
    const id = agentIdFor(personaRef.current.id);
    track('voice_call_started', { voice: personaRef.current.id, mode: 'live' });
    beginSession();
    liveCallRef.current = true;
    setLiveCall(true);
    setConnecting(true);
    setNote('');
    lastAgentText.current = '';
    setPhase('thinking');
    agentRef.current.start(id, {
      onLive: () => {
        setConnecting(false);
        setPhase('listening');
        micRef.current.start().then((ok) => {
          setMicState(ok ? 'ok' : 'denied');
          micStateRef.current = ok ? 'ok' : 'denied';
        });
      },
      onAgentTalking: (talking) => {
        if (!liveRef.current) return;
        if (talking) {
          setPhase('speaking');
        } else {
          setCaption((c) => (c ? { text: c.text, spoken: c.text.length } : c));
          setPhase(mutedRef.current ? 'idle' : 'listening');
        }
      },
      onTranscript: (turns: Turn[]) => {
        setMessages(turns.map((t, i) => ({ id: i, who: t.role === 'agent' ? 'agent' : 'you', text: t.content })));
        const last = turns[turns.length - 1];
        const lastAgent = [...turns].reverse().find((t) => t.role === 'agent');
        if (lastAgent && lastAgent.content !== lastAgentText.current) {
          const grew = lastAgentText.current.length > 0 && lastAgent.content.startsWith(lastAgentText.current);
          lastAgentText.current = lastAgent.content;
          setCaption((c) => ({ text: lastAgent.content, spoken: grew && c ? c.spoken : 0 }));
        }
        setInterim(last && last.role === 'user' && modeRef.current === 'listening' ? last.content : '');
      },
      onEnd: () => finishLive(),
      onError: (err, wasLive) => {
        console.warn('[Rinxora] live agent error', err);
        if (wasLive) return finishLive();
        // Keep failed live calls from silently switching to a different browser voice.
        agentRef.current.end();
        finishLive();
        setNote('We could not reach Sarah right now. Please try again.');
      },
    });
  };

  const startCall = () => (liveEnabled ? startLive() : startDemo());

  const startDemo = async () => {
    unlockSpeech();
    track('voice_call_started', { voice: personaRef.current.id, mode: 'demo' });
    if (!liveRef.current || liveCallRef.current === false) beginSession();
    const line = greeting(personaRef.current.name);
    addMessage('agent', line);
    say(line);
    ensureMic(); // permission prompt runs while the greeting plays
  };

  const endCall = () => {
    if (liveCallRef.current) {
      agentRef.current.end();
      return finishLive();
    }
    track('voice_call_ended', { seconds });
    setAudioSession('auto');
    liveRef.current = false;
    pausedRef.current = false;
    resumeRef.current = null;
    mutedRef.current = false;
    setMuted(false);
    setLive(false);
    stopSpeaking();
    stopListening();
    clearTick();
    micRef.current.stop();
    micStateRef.current = micStateRef.current === 'denied' ? 'denied' : 'unknown';
    setMicState(micStateRef.current);
    setPhase('idle');
    setCaption(null);
  };

  const pauseCall = () => {
    track('voice_call_paused');
    const m = modeRef.current;
    pausedRef.current = true;
    if (m === 'speaking') {
      speaker.pause();
      resumeRef.current = 'speak';
    } else if (m === 'thinking') {
      resumeRef.current = 'think';
    } else {
      stopListening();
      resumeRef.current = 'listen';
    }
    setPhase('paused');
  };

  const resumeCall = () => {
    track('voice_call_resumed');
    pausedRef.current = false;
    const r = resumeRef.current;
    resumeRef.current = null;
    if (r === 'speak' && canSpeak()) {
      setPhase('speaking');
      speaker.resume();
    } else if (r === 'think') {
      setPhase('thinking');
    } else {
      listenRef.current();
    }
  };

  const interrupt = () => {
    track('voice_interrupt');
    stopSpeaking();
    clearTick();
    silentRetries.current = 0;
    if (canListen && !mutedRef.current) listen();
    else setPhase('idle');
  };

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    micRef.current.setMuted(next);
    if (liveCallRef.current) {
      agentRef.current.mute(next);
      return;
    }
    if (next) {
      if (modeRef.current === 'listening') {
        stopListening();
        setPhase('idle');
      }
    } else if (modeRef.current === 'idle' && liveRef.current && !pausedRef.current) {
      listenRef.current();
    }
  };

  useEffect(
    () => () => {
      liveRef.current = false;
      agentRef.current.end();
      stopSpeaking();
      clearTick();
      micRef.current.stop();
      const r = recogRef.current;
      recogRef.current = null;
      if (r) {
        r.onresult = r.onerror = r.onend = null;
        try {
          r.abort();
        } catch {
          /* noop */
        }
      }
    },
    [],
  );

  const pickPersona = (id: string) => {
    if (id === personaId) return;
    unlockSpeech();
    track('voice_selected', { voice: id });
    setPersonaId(id);
    personaRef.current = PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
    if (liveCallRef.current) {
      agentRef.current.end();
      finishLive();
      window.setTimeout(startLive, 250);
    } else if (live && !pausedRef.current) {
      const line = `Hi, it's ${personaRef.current.name}. I'll take it from here. Go ahead, I'm listening.`;
      addMessage('agent', line);
      say(line);
    } else if (!live) {
      const line = `Hi, I'm ${personaRef.current.name}. Thanks for calling. How can I help?`;
      say(line, 'idle');
    }
  };

  const mainAction = () => {
    if (!live) return void startCall();
    if (liveCall) return toggleMute(); // on the real line the big button is the mic
    if (mode === 'paused') return resumeCall();
    pauseCall();
  };

  // "Talk to Rinxora" anywhere on the page starts a call here, inside the same tap
  const startFromCta = useRef<() => void>(() => {});
  startFromCta.current = () => {
    if (!liveRef.current) startCall();
  };
  useEffect(() => {
    const on = () => startFromCta.current();
    window.addEventListener(CALL_EVENT, on);
    return () => window.removeEventListener(CALL_EVENT, on);
  }, []);

  const sendText = (text: string) => {
    unlockSpeech();
    track('demo_message_sent', { via: 'text' });
    if (!liveRef.current) {
      beginSession();
      ensureMic();
    }
    if (pausedRef.current) resumeCall();
    handleUser(text);
  };

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const text = draft;
    setDraft('');
    sendText(text);
  };

  const captionWords = useMemo(() => {
    if (!caption) return [];
    const out: { w: string; start: number }[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(caption.text))) out.push({ w: m[0], start: m.index });
    return out;
  }, [caption]);

  const lastYou = [...messages].reverse().find((m) => m.who === 'you')?.text;
  const dot =
    mode === 'speaking' ? 'bg-violet-400' : mode === 'listening' ? 'bg-emerald-300' : mode === 'thinking' ? 'bg-fuchsia-300' : mode === 'paused' ? 'bg-rose-400' : 'bg-titanium-500';
  const mainLabel = !live ? `Talk to ${persona.name}` : liveCall ? (muted ? 'Unmute microphone' : 'Mute microphone') : mode === 'paused' ? 'Resume' : 'Pause';

  const idleHint = !live
    ? `${persona.name} is ready to take your call.`
    : connecting
      ? `Connecting you to ${persona.name}…`
      : mode === 'paused'
        ? 'Paused. Press resume to continue.'
        : mode === 'listening'
          ? 'Go ahead, I’m listening.'
          : mode === 'thinking'
            ? ''
            : muted
              ? 'Your mic is muted. Tap the mic to unmute.'
              : canListen || liveCall
                ? 'Your turn. Speak whenever you’re ready.'
                : 'Type your reply below.';

  return (
    <section id="studio" className="relative isolate py-20 sm:py-28 md:py-36 overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[1000px] -z-10 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 top-[14%] -translate-x-1/2 w-[1000px] max-w-[180vw] h-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(224,36,122,0.2),rgba(124,58,237,0.13)_42%,transparent_70%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-4xl mx-auto">
          <Eyebrow>Live demo</Eyebrow>

          <h2 className="mt-5 text-4xl sm:text-6xl font-semibold tracking-[-0.035em] leading-[1.02] text-white">
            Now you <span className="font-serif-accent silver-sheen">call her.</span>
          </h2>
        </Reveal>

        {/* Voice console */}
        <Reveal delay={150} className="mt-8 sm:mt-10">
          <div
            id="live-studio"
            className="ring-aura mx-auto max-w-2xl rounded-[2rem] p-1.5 shadow-[0_50px_140px_-40px_rgba(224,36,122,0.5)]"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[linear-gradient(180deg,#131318,#07070A)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden">
              {/* Voice selector (or, with a single voice, who you're talking to) */}
              {VOICES.length === 1 ? (
                <div className="pt-4 sm:pt-5 flex justify-center">
                  <div className="inline-flex items-center gap-3 rounded-full bg-black/30 ring-1 ring-white/10 pl-1.5 pr-4 h-11">
                    <span
                      className="w-8 h-8 rounded-full ring-1 ring-white/30"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${persona.viz.core[0]}, ${persona.viz.core[1]})` }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-white">{persona.name}</span>
                    <span className="text-xs text-titanium-400">{persona.role}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" aria-hidden="true" /> Online
                    </span>
                  </div>
                </div>
              ) : (
              <div className="px-3 sm:px-5 pt-3 sm:pt-4 flex justify-center">
                <div role="radiogroup" aria-label="Choose a voice" className="flex w-full sm:w-auto items-center gap-1 rounded-full bg-black/30 ring-1 ring-white/10 p-1">
                  {VOICES.map((p) => {
                    const active = p.id === personaId;
                    return (
                      <button
                        key={p.id}
                        role="radio"
                        aria-checked={active}
                        onClick={() => pickPersona(p.id)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full pl-1.5 pr-3 h-10 text-sm font-medium cursor-pointer touch-manipulation transition-[background-color,color] duration-500 ease-lux focus-visible:outline-2 focus-visible:outline-violet-300 ${
                          active ? 'bg-white/[0.12] text-white' : 'text-titanium-300 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full ring-1 ring-white/30 shrink-0"
                          style={{ background: `radial-gradient(circle at 30% 30%, ${p.viz.core[0]}, ${p.viz.core[1]})` }}
                        />
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              )}

              {/* What Rinxora is saying, word by word */}
              <div className="px-5 sm:px-10 pt-4 min-h-[7.5rem] sm:min-h-[8.5rem] text-center flex flex-col items-center justify-center">
                <p className="sr-only" aria-live="polite">
                  {caption?.text}
                </p>
                {caption ? (
                  <p aria-hidden="true" className="font-serif text-[1.55rem] sm:text-[2rem] leading-[1.15] tracking-[-0.01em] text-pretty">
                    {captionWords.map((x, i) => (
                      <span key={i} className={`transition-colors duration-300 ease-lux ${x.start < caption.spoken ? 'text-white' : 'text-titanium-500'}`}>
                        {x.w}{' '}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="text-titanium-400 text-base sm:text-lg max-w-sm text-pretty">{idleHint}</p>
                )}
                <p className="mt-3 h-5 text-sm text-titanium-300 italic truncate max-w-full" aria-hidden={!interim && !lastYou}>
                  {interim ? `“${interim}”` : lastYou ? `You: “${lastYou}”` : ''}
                </p>
              </div>

              {/* Voice rhythm + start / pause */}
              <div className="relative h-[230px] sm:h-[250px]">
                <VoiceStage persona={persona} mode={mode} getLevel={getLevel} />
                {(live || mode !== 'idle') && (
                  <span
                    role="status"
                    className="absolute left-1/2 -translate-x-1/2 bottom-2 inline-flex items-center gap-2 rounded-full bg-black/80 ring-1 ring-white/10 px-3 h-8 text-xs text-titanium-200 tabular"
                  >
                    <span className={`w-2 h-2 rounded-full ${dot} ${mode === 'speaking' || mode === 'listening' ? 'animate-pulse' : ''}`} />
                    <span>{connecting ? 'Connecting' : STATUS[mode]}</span>
                    {live && !connecting && <span className="text-titanium-400">{clock(seconds)}</span>}
                  </span>
                )}
                <CallButton
                  invite={!live}
                  onClick={mainAction}
                  label={mainLabel}
                  inviteText={`Tap to talk to ${persona.name}`}
                >
                  {!live ? (
                    <Mic className="w-9 h-9 drop-shadow" aria-hidden="true" />
                  ) : liveCall ? (
                    muted ? <MicOff className="w-8 h-8 drop-shadow" aria-hidden="true" /> : <Mic className="w-8 h-8 drop-shadow" aria-hidden="true" />
                  ) : mode === 'paused' ? (
                    <Play className="w-7 h-7 fill-current ml-0.5 drop-shadow" aria-hidden="true" />
                  ) : (
                    <Pause className="w-7 h-7 fill-current drop-shadow" aria-hidden="true" />
                  )}
                </CallButton>
              </div>

              {/* Call controls */}
              <div className="px-3 sm:px-5 pb-4 flex items-center justify-center gap-2 sm:gap-3 min-h-[3.5rem]">
                {live ? (
                  <>
                    {mode === 'speaking' && !liveCall && (
                      <button onClick={interrupt} className="ctl">
                        <Hand className="w-4 h-4" aria-hidden="true" /> Interrupt
                      </button>
                    )}
                    {(canListen || liveCall) && (
                      <button onClick={toggleMute} aria-pressed={muted} className={`ctl ${muted ? '!bg-burgundy-600/40' : ''}`}>
                        {muted ? <MicOff className="w-4 h-4" aria-hidden="true" /> : <Mic className="w-4 h-4" aria-hidden="true" />}
                        {muted ? 'Unmute' : 'Mute'}
                      </button>
                    )}
                    <button onClick={endCall} className="ctl !bg-burgundy-600 hover:!bg-burgundy-500">
                      <PhoneOff className="w-4 h-4" aria-hidden="true" /> End call
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-titanium-400 text-center">
                    {micState === 'denied'
                      ? 'Microphone blocked. Allow it in your browser to talk.'
                      : 'Your microphone is only used during the call.'}
                  </p>
                )}
              </div>

              {note && (
                <p className="px-5 pb-3 text-center text-xs text-titanium-400" role="status">
                  {note}
                </p>
              )}
              {liveCall && (
                <p className="px-5 pb-3 text-center text-xs text-titanium-500">
                  You’re speaking with {persona.name}, Rinxora’s AI assistant.
                </p>
              )}

              {/* Live actions */}
              {actions.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap justify-center gap-1.5">
                  {actions.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20">
                      <Zap className="w-3 h-3" aria-hidden="true" /> {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Conversation starters */}
              <div className="px-3 sm:px-5 pb-4">
                {liveEnabled ? (
                  <p className="text-center text-xs text-titanium-400 text-pretty">
                    <span className="uppercase tracking-[0.18em] text-titanium-500 mr-2">Try saying</span>
                    “My AC stopped working” · “How much is a visit?” · “Can you come today?”
                  </p>
                ) : (
                  <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] -mx-1 px-1">
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-titanium-500">Try saying</span>
                    {TRY_SAYING.map((t) => (
                      <button
                        key={t}
                        onClick={() => sendText(t)}
                        className="shrink-0 h-9 px-3.5 rounded-full ring-1 ring-white/10 bg-white/[0.04] text-xs text-titanium-200 hover:bg-white/[0.1] hover:text-white cursor-pointer touch-manipulation transition-colors duration-500 ease-lux"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Transcript + typing, tucked away: this is a voice call, not a chat */}
              <details className="group border-t border-white/[0.08]" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track('transcript_opened')}>
                <summary className="flex items-center justify-between px-5 py-3.5 text-sm text-titanium-300 cursor-pointer list-none hover:text-white transition-colors duration-500 ease-lux [&::-webkit-details-marker]:hidden">
                  <span>{liveEnabled ? 'Transcript' : 'Transcript & type instead'}</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-500 ease-lux group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="px-4 pb-4">
                  <div ref={transcriptRef} className="max-h-48 overflow-y-auto space-y-2.5 pr-1" role="log" aria-label="Call transcript">
                    {messages.length === 0 ? (
                      <p className="text-sm text-titanium-500 py-2">The transcript appears here as you talk.</p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className={`flex ${m.who === 'you' ? 'justify-end' : 'justify-start'}`}>
                          <p
                            className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                              m.who === 'you' ? 'bg-white/[0.1] text-white rounded-br-md' : 'bg-violet-500/15 text-titanium-100 rounded-bl-md'
                            }`}
                          >
                            <span className="block text-[11px] uppercase tracking-[0.14em] text-titanium-400 mb-0.5">{m.who === 'you' ? 'You' : persona.name}</span>
                            {m.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {!liveEnabled && (
                  <form onSubmit={submitDraft} className="mt-3 flex items-center gap-2 rounded-full bg-white/[0.06] ring-1 ring-white/10 focus-within:ring-[#FF5FA2]/60 pl-4 pr-1.5 py-1.5 transition-shadow duration-500 ease-lux">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type your reply…"
                      aria-label="Type a reply to Rinxora"
                      autoComplete="off"
                      className="flex-1 min-w-0 bg-transparent text-base sm:text-sm text-white placeholder:text-titanium-500 outline-none py-1.5"
                    />
                    <button
                      type="submit"
                      aria-label="Send"
                      disabled={!draft.trim()}
                      className="w-9 h-9 rounded-full bg-white text-titanium-950 flex items-center justify-center disabled:opacity-30 transition-opacity duration-300 ease-lux cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </form>
                  )}
                </div>
              </details>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-titanium-400 max-w-2xl mx-auto md:max-w-none">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
            <span><strong className="text-white font-semibold">Always on</strong> answers every call</span>
            <span><strong className="text-white font-semibold">Books</strong> while you sleep</span>
            <span><strong className="text-white font-semibold">Sounds</strong> like part of your team</span>
          </div>
          <button
            onClick={() => {
              track('hero_see_playbooks');
              onExploreEdgeCases();
            }}
            className="inline-flex items-center gap-2 h-11 text-titanium-200 hover:text-white transition-colors duration-500 ease-lux cursor-pointer"
          >
            See it handle real calls <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
