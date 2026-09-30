export type CallStatus =
  | 'idle'
  | 'requesting-permission'
  | 'connecting'
  | 'active'
  | 'listening'
  | 'speaking'
  | 'ending'
  | 'ended'
  | 'error';

export type CallMode = 'live-retell' | 'interactive-simulation';

export interface TranscriptItem {
  id: string;
  speaker: 'caller' | 'agent' | 'system';
  text: string;
  timestamp: string;
  latencyMs?: number;
  sentiment?: 'neutral' | 'frustrated' | 'calm' | 'satisfied' | 'urgent';
}

export interface CallTelemetry {
  latencyMs: number;
  packetLossPercent: number;
  sampleRateKhz: number;
  sentimentScore: number; // 0 to 100
  activeIntent: string;
  entitiesDetected: Record<string, string>;
}

export interface EdgeCaseScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'de-escalation' | 'bilingual' | 'noise-filter' | 'calendar-conflict' | 'emergency-dispatch';
  difficultyBadge: string;
  audioDuration: string;
  customerProblem: string;
  receptionistStrategy: string;
  dialogue: Array<{
    speaker: 'caller' | 'receptionist';
    text: string;
    note?: string;
  }>;
  technicalSafeguards: string[];
  crmOutput: {
    intent: string;
    action: string;
    urgency: string;
    calendarStatus: string;
  };
}

export interface IndustryBlueprint {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  statNumber: string;
  statLabel: string;
  coreFeatures: string[];
  integrations: string[];
  sampleTrigger: string;
  receptionistResponse: string;
}
