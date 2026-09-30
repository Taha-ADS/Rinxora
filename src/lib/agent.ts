// Live voice agent (Retell). Configure in .env.local, see .env.example.
// A Retell *public* key is safe in the browser: restrict it to your domains in the Retell dashboard.
const env = import.meta.env as Record<string, string | undefined>;

export const RETELL_PUBLIC_KEY = env.VITE_RETELL_PUBLIC_KEY ?? '';

// One Retell agent per voice. Sarah falls back to the original agent so a single key is enough to go live.
const AGENTS: Record<string, string> = {
  sarah: env.VITE_RETELL_AGENT_ID_SARAH || env.VITE_RETELL_AGENT_ID || 'agent_c43073d7aac77bb4ea80e4ef6e',
  marcus: env.VITE_RETELL_AGENT_ID_MARCUS || '',
  aria: env.VITE_RETELL_AGENT_ID_ARIA || '',
};

export const liveEnabled = Boolean(RETELL_PUBLIC_KEY);
export const agentIdFor = (personaId: string) => AGENTS[personaId] || '';

// The SDK is large and only needed once someone starts a call, so it loads on demand.
let sdk: Promise<typeof import('retell-client-js-sdk')> | null = null;
const loadSdk = () => (sdk ??= import('retell-client-js-sdk'));
/** Warm the SDK before the visitor reaches the call button. */
export const preloadAgent = () => {
  if (liveEnabled) loadSdk().catch(() => (sdk = null));
};

export interface Turn {
  role: 'agent' | 'user';
  content: string;
}

export interface LiveHandlers {
  onLive: () => void;
  onAgentTalking: (talking: boolean) => void;
  onTranscript: (turns: Turn[]) => void;
  onEnd: () => void;
  onError: (err: Error, wasLive: boolean) => void;
}

export class LiveAgent {
  private session: any = null;
  private live = false;

  private attempt = 0;

  start(agentId: string, h: LiveHandlers) {
    this.live = false;
    const attempt = ++this.attempt;
    loadSdk().then(
      ({ RetellClient }) => {
        if (attempt !== this.attempt) return; // hung up before the SDK arrived
        this.connect(new RetellClient({ key: RETELL_PUBLIC_KEY }), agentId, h);
      },
      (err) => {
        sdk = null;
        if (attempt === this.attempt) h.onError(err instanceof Error ? err : new Error(String(err)), false);
      },
    );
  }

  private connect(client: any, agentId: string, h: LiveHandlers) {
    this.session = client.createWebCall({
      agent_id: agentId,
      hooks: {
        onStatus: (status: string) => {
          if (status === 'live') {
            this.live = true;
            h.onLive();
          }
        },
        onAgentStartTalking: () => h.onAgentTalking(true),
        onAgentStopTalking: () => h.onAgentTalking(false),
        onUpdate: (e: any) => {
          const turns: Turn[] = (e?.transcript ?? []).filter(
            (t: any) => (t.role === 'agent' || t.role === 'user') && typeof t.content === 'string' && t.content.trim(),
          );
          h.onTranscript(turns);
        },
        onEnd: () => h.onEnd(),
        onError: (err: Error) => h.onError(err, this.live),
      },
    });
    // Startup failures also surface through onError; this only prevents an unhandled rejection.
    this.session?.ready?.catch?.(() => {});
  }

  mute(muted: boolean) {
    try {
      muted ? this.session?.mute() : this.session?.unmute();
    } catch {
      /* noop */
    }
  }

  /** Loudness of the agent's voice right now, 0..1 (0 when unavailable). */
  volume(): number {
    try {
      return Math.min(1, Math.max(0, this.session?.analyzerComponent?.calculateVolume?.() ?? 0));
    } catch {
      return 0;
    }
  }

  async end() {
    this.attempt++;
    const s = this.session;
    this.session = null;
    this.live = false;
    try {
      await s?.end();
    } catch {
      /* noop */
    }
  }
}
