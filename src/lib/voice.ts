// Browser voice layer for the hero studio: persona definitions, speech
// synthesis with progress events, speech recognition, and mic level metering.

export interface Persona {
  id: string;
  name: string;
  role: string;
  blurb: string;
  gender: 'f' | 'm';
  pitch: number;
  rate: number;
  /** Name fragments used to pick the best installed system voice. */
  prefer: RegExp;
  /** Ripple look, so every voice has its own visual signature. */
  viz: {
    core: [string, string];
    ring: string;
    rings: number;
    speed: number;
    wobble: number;
    freq: number;
  };
}

export const PERSONAS: Persona[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Warm front desk',
    blurb: 'Reassuring and human. Our most-booked voice.',
    gender: 'f',
    pitch: 1.05,
    rate: 1,
    prefer: /samantha|zira|jenny|aria|sonia|google uk english female|female|karen|victoria/i,
    viz: { core: ['#FF7AB8', '#6A1B9A'], ring: '255,122,184', rings: 4, speed: 0.55, wobble: 0.12, freq: 3 },
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Senior dispatcher',
    blurb: 'Calm, confident, built for emergencies.',
    gender: 'm',
    pitch: 0.82,
    rate: 0.97,
    prefer: /david|mark|guy|daniel|alex|google uk english male|male|james|ryan/i,
    viz: { core: ['#8B5CF6', '#26060F'], ring: '139,92,246', rings: 3, speed: 0.8, wobble: 0.2, freq: 5 },
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'Concierge',
    blurb: 'Polished and unhurried. Made for premium brands.',
    gender: 'f',
    pitch: 0.95,
    rate: 0.93,
    prefer: /ava|allison|emma|libby|hazel|susan|moira|tessa|serena|female/i,
    viz: { core: ['#F1F2F8', '#6D4BB8'], ring: '225,227,238', rings: 6, speed: 0.4, wobble: 0.07, freq: 2 },
  },
];

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export const getRecognitionCtor = (): any =>
  typeof window === 'undefined' ? null : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve([]);
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length) return resolve(existing);
    const done = () => resolve(synth.getVoices());
    synth.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
}

const FEMALE_HINT = /female|samantha|zira|jenny|aria|sonia|karen|victoria|ava|allison|emma|libby|hazel|susan|moira|tessa|serena|fiona|joanna|salli/i;
const MALE_HINT = /\bmale\b|david|mark|guy|daniel|alex|james|ryan|fred|tom|oliver|george/i;

/** Best installed voice for a persona; `avoid` keeps same-gender personas sounding different. */
export function pickVoice(
  persona: Persona,
  voices: SpeechSynthesisVoice[],
  avoid: SpeechSynthesisVoice | null = null,
): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : voices;
  if (!pool.length) return null;
  const gendered = pool.filter((v) =>
    persona.gender === 'f' ? FEMALE_HINT.test(v.name) && !/male/i.test(v.name) : MALE_HINT.test(v.name),
  );
  const list = (gendered.length ? gendered : pool).filter((v) => v !== avoid);
  const candidates = list.length ? list : pool;
  const score = (v: SpeechSynthesisVoice) =>
    (persona.prefer.test(v.name) ? 2 : 0) + (/natural|neural|online/i.test(v.name) ? 1 : 0);
  return [...candidates].sort((a, b) => score(b) - score(a))[0] ?? null;
}

export interface SpeakHandlers {
  onStart?: () => void;
  /** Character offset (into the full text) reached so far. */
  onProgress?: (charIndex: number) => void;
  onEnd?: () => void;
}

/**
 * Chrome cuts utterances off after ~200 chars / 15 s, so replies are spoken one
 * sentence at a time. That also makes pause/resume dependable everywhere
 * (Android treats pause() as cancel): pause stops at the sentence, resume replays it.
 */
function toChunks(text: string, max = 170): { text: string; offset: number }[] {
  const out: { text: string; offset: number }[] = [];
  const re = /[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    let chunk = m[0];
    let offset = m.index;
    while (chunk.length > max) {
      const cut = chunk.lastIndexOf(',', max) > 40 ? chunk.lastIndexOf(',', max) + 1 : chunk.lastIndexOf(' ', max);
      const at = cut > 0 ? cut : max;
      out.push({ text: chunk.slice(0, at), offset });
      chunk = chunk.slice(at);
      offset += at;
    }
    if (chunk.trim()) out.push({ text: chunk, offset });
  }
  return out;
}

class Speaker {
  private chunks: { text: string; offset: number }[] = [];
  private idx = 0;
  private gen = 0;
  private paused = false;
  private persona: Persona | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private h: SpeakHandlers = {};

  start(text: string, persona: Persona, voice: SpeechSynthesisVoice | null, h: SpeakHandlers) {
    this.stop();
    this.chunks = toChunks(text);
    this.idx = 0;
    this.persona = persona;
    this.voice = voice;
    this.h = h;
    this.paused = false;
    if (!canSpeak() || !this.chunks.length) {
      h.onEnd?.();
      return;
    }
    this.next(true);
  }

  private next(first = false) {
    if (this.idx >= this.chunks.length) {
      this.h.onEnd?.();
      return;
    }
    const gen = this.gen;
    const c = this.chunks[this.idx];
    const u = new SpeechSynthesisUtterance(c.text);
    if (this.voice) {
      u.voice = this.voice;
      u.lang = this.voice.lang;
    }
    u.pitch = this.persona?.pitch ?? 1;
    u.rate = this.persona?.rate ?? 1;
    if (first || this.idx === 0) u.onstart = () => gen === this.gen && this.h.onStart?.();
    u.onboundary = (e) => gen === this.gen && this.h.onProgress?.(c.offset + e.charIndex + (e.charLength || 0));
    u.onend = () => {
      if (gen !== this.gen) return;
      this.h.onProgress?.(c.offset + c.text.length);
      this.idx++;
      this.next();
    };
    u.onerror = (e) => {
      if (gen !== this.gen || e.error === 'canceled' || e.error === 'interrupted') return;
      this.idx++;
      this.next();
    };
    // Chrome occasionally drops an utterance queued in the same tick as cancel().
    window.setTimeout(() => gen === this.gen && window.speechSynthesis.speak(u), 40);
  }

  pause() {
    if (!canSpeak()) return;
    this.paused = true;
    this.gen++;
    window.speechSynthesis.cancel();
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.gen++;
    this.next();
  }

  stop() {
    this.gen++;
    this.paused = false;
    this.chunks = [];
    if (canSpeak()) window.speechSynthesis.cancel();
  }
}

export const speaker = new Speaker();

export const speak = (text: string, persona: Persona, voice: SpeechSynthesisVoice | null, h: SpeakHandlers) =>
  speaker.start(text, persona, voice, h);
export const stopSpeaking = () => speaker.stop();

/** iOS/Safari only allow speech after a user gesture; call this synchronously inside a tap. */
export function unlockSpeech() {
  if (!canSpeak()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* noop */
  }
}

/**
 * On iPhone the ring/silent switch mutes ordinary web audio, so a visitor on
 * silent would hear nothing. Declaring the page a call ('play-and-record') or
 * media ('playback') keeps it audible, like a real call. Safari 17+; a no-op elsewhere.
 */
export function setAudioSession(type: 'play-and-record' | 'playback' | 'auto') {
  try {
    const session = (navigator as any).audioSession;
    if (session && session.type !== type) session.type = type;
  } catch {
    /* unsupported */
  }
}

/** Meters the microphone so the ripple can respond to the visitor's own voice. */
export class MicMeter {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private buf: Uint8Array<ArrayBuffer> | null = null;

  async start(): Promise<boolean> {
    if (this.stream) return true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.6;
      src.connect(this.analyser);
      this.buf = new Uint8Array(this.analyser.fftSize);
      return true;
    } catch {
      return false;
    }
  }

  setMuted(muted: boolean) {
    this.stream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  /** 0..1 loudness of the mic right now. */
  level(): number {
    if (!this.analyser || !this.buf) return 0;
    this.analyser.getByteTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) {
      const v = (this.buf[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.buf.length) * 5);
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
    this.stream = null;
    this.ctx = null;
    this.analyser = null;
    this.buf = null;
  }
}
