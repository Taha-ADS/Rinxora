import { RetellClient } from 'retell-client-js-sdk';
import { CallStatus, TranscriptItem } from '../types/call';

export const DEFAULT_AGENT_ID = 'agent_c43073d7aac77bb4ea80e4ef6e';
export const STORAGE_KEY_PUBLIC_KEY = 'vocalis_retell_public_key';
export const STORAGE_KEY_AGENT_ID = 'vocalis_retell_agent_id';

export interface RetellConfig {
  publicKey: string;
  agentId: string;
}

export function getStoredRetellConfig(): RetellConfig {
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PUBLIC_KEY) || '' : '';
  const savedAgent = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_AGENT_ID) || DEFAULT_AGENT_ID : DEFAULT_AGENT_ID;
  return {
    publicKey: savedKey,
    agentId: savedAgent || DEFAULT_AGENT_ID,
  };
}

export function saveRetellConfig(config: RetellConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PUBLIC_KEY, config.publicKey);
    localStorage.setItem(STORAGE_KEY_AGENT_ID, config.agentId);
  }
}

// Active Call Session Manager
export class VoiceSessionManager {
  private client: RetellClient | null = null;
  private activeCall: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isMuted: boolean = false;

  // Real Retell WebCall launcher
  async startRetellCall(
    publicKey: string,
    agentId: string,
    callbacks: {
      onStatusChange: (status: CallStatus) => void;
      onTranscript: (item: TranscriptItem) => void;
      onError: (err: any) => void;
      onEnd: () => void;
    }
  ) {
    try {
      callbacks.onStatusChange('requesting-permission');

      // Request browser audio permission and setup Web Audio Analyser
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;
      this.setupAudioAnalyser(stream);

      callbacks.onStatusChange('connecting');

      // Initialize Retell SDK client
      this.client = new RetellClient({ key: publicKey });

      // Create Web Call
      this.activeCall = await this.client.createWebCall({
        agent_id: agentId || DEFAULT_AGENT_ID,
        hooks: {
          onStatus: (status: string) => {
            console.log('[Retell SDK] Status:', status);
            if (status === 'connected' || status === 'active' || status === 'ongoing') {
              callbacks.onStatusChange('active');
            } else if (status === 'ended') {
              callbacks.onStatusChange('ended');
              callbacks.onEnd();
            }
          },
          onEnd: ({ disconnection_reason }: any = {}) => {
            console.log('[Retell SDK] Call ended:', disconnection_reason);
            this.cleanupAudio();
            callbacks.onStatusChange('ended');
            callbacks.onEnd();
          },
          onError: (err: any) => {
            console.error('[Retell SDK] Error:', err);
            callbacks.onError(err);
            callbacks.onStatusChange('error');
          },
        },
      });

      callbacks.onStatusChange('active');
      callbacks.onTranscript({
        id: `sys-${Date.now()}`,
        speaker: 'system',
        text: `Encrypted WebRTC link established with agent ${agentId.slice(0, 14)}... Voice channel live.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });

      return this.activeCall;
    } catch (err: any) {
      console.error('[VoiceSessionManager] Failed to start call:', err);
      callbacks.onError(err);
      callbacks.onStatusChange('error');
      this.cleanupAudio();
      throw err;
    }
  }

  // Setup Web Audio Analyser for live frequency visualization
  private setupAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
    } catch (e) {
      console.warn('Web Audio Analyser not supported or error:', e);
    }
  }

  getAudioFrequencyData(dataArray: any): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    }
  }

  toggleMute(): boolean {
    if (this.activeCall && typeof this.activeCall.mute === 'function') {
      if (this.isMuted) {
        this.activeCall.unmute();
        this.isMuted = false;
      } else {
        this.activeCall.mute();
        this.isMuted = true;
      }
    } else {
      this.isMuted = !this.isMuted;
    }

    if (this.micStream) {
      this.micStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }

    return this.isMuted;
  }

  async endCall() {
    try {
      if (this.activeCall && typeof this.activeCall.end === 'function') {
        await this.activeCall.end();
      }
    } catch (e) {
      console.warn('Error ending call:', e);
    } finally {
      this.cleanupAudio();
      this.activeCall = null;
    }
  }

  cleanupAudio() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
