import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Clock,
  Volume2,
  Wrench,
  RefreshCw,
  Radio
} from 'lucide-react';
import { CallStatus, TranscriptItem } from '../types/call';
import { VoiceSessionManager, DEFAULT_AGENT_ID } from '../lib/retell';
import { HVAC_SCENARIOS } from '../lib/scenarios';
import confetti from 'canvas-confetti';

interface VoiceTerminalProps {
  publicKey: string;
  agentId: string;
  onOpenSettings: () => void;
}

export const VoiceTerminal: React.FC<VoiceTerminalProps> = ({
  publicKey,
  agentId,
  onOpenSettings,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = HVAC_SCENARIOS[selectedScenarioIndex];

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isLiveRetellMode, setIsLiveRetellMode] = useState<boolean>(Boolean(publicKey));
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sessionManagerRef = useRef<VoiceSessionManager | null>(null);
  const simulationTimeoutRef = useRef<any[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    if (publicKey) {
      setIsLiveRetellMode(true);
    }
  }, [publicKey]);

  // Canvas Audio Visualizer
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const isActive = callStatus === 'active' || callStatus === 'speaking' || callStatus === 'listening';
      const isSpeaking = callStatus === 'speaking' || (isActive && Math.sin(phase * 2) > 0);

      // Draw clean sine-waves
      const waveCount = 2;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = w === 0 ? 2.5 : 1.5;

        if (isActive) {
          ctx.strokeStyle = w === 0 ? 'rgba(245, 158, 11, 0.95)' : 'rgba(16, 185, 129, 0.6)';
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        }

        const frequency = 0.02 + w * 0.01;
        const amplitude = isActive ? (isSpeaking ? 18 + w * 6 : 8 + w * 3) : 2;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * frequency + phase + w) * amplitude * Math.sin((x / width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isActive ? 0.05 : 0.015;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [callStatus]);

  useEffect(() => {
    return () => {
      simulationTimeoutRef.current.forEach(clearTimeout);
      if (sessionManagerRef.current) {
        sessionManagerRef.current.cleanupAudio();
      }
    };
  }, []);

  const handleStartCall = async () => {
    setErrorMessage(null);

    if (publicKey && isLiveRetellMode) {
      try {
        setCallStatus('connecting');
        const session = new VoiceSessionManager();
        sessionManagerRef.current = session;

        await session.startRetellCall(publicKey, agentId || DEFAULT_AGENT_ID, {
          onStatusChange: (status) => setCallStatus(status),
          onTranscript: (item) => {
            setTranscripts((prev) => [...prev, item]);
          },
          onError: (err) => {
            setErrorMessage(err?.message || 'Retell WebCall error. Check your public key and microphone permissions.');
            setCallStatus('error');
          },
          onEnd: () => {
            setCallStatus('ended');
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
          },
        });
      } catch (e: any) {
        setErrorMessage(e?.message || 'Microphone access denied or network failed.');
        setCallStatus('error');
      }
    } else {
      startSimulationFlow();
    }
  };

  const startSimulationFlow = () => {
    setCallStatus('connecting');
    simulationTimeoutRef.current.forEach(clearTimeout);
    simulationTimeoutRef.current = [];

    const t1 = setTimeout(() => {
      setCallStatus('active');
      setTranscripts([
        {
          id: `sys-${Date.now()}`,
          speaker: 'system',
          text: `Connected — Sarah is ready to take the call.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);

      scenario.dialogue.forEach((turn, idx) => {
        const stepDelay = 2200 * (idx + 1);

        const tStep = setTimeout(() => {
          setCallStatus(turn.speaker === 'receptionist' ? 'speaking' : 'listening');

          setTranscripts((prev) => [
            ...prev,
            {
              id: `${turn.speaker}-${idx + 1}`,
              speaker: turn.speaker === 'receptionist' ? 'agent' : 'caller',
              text: turn.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            },
          ]);

          if (idx === scenario.dialogue.length - 1) {
            setTimeout(() => {
              setCallStatus('ended');
              confetti({
                particleCount: 45,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F59E0B', '#10B981', '#38BDF8'],
              });
            }, 2500);
          }
        }, stepDelay);

        simulationTimeoutRef.current.push(tStep);
      });
    }, 900);

    simulationTimeoutRef.current.push(t1);
  };

  const handleEndCall = async () => {
    simulationTimeoutRef.current.forEach(clearTimeout);
    simulationTimeoutRef.current = [];

    if (sessionManagerRef.current) {
      await sessionManagerRef.current.endCall();
    }
    setCallStatus('ended');
  };

  const handleToggleMute = () => {
    if (sessionManagerRef.current) {
      const muted = sessionManagerRef.current.toggleMute();
      setIsMuted(muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const isCallInProgress = callStatus === 'connecting' || callStatus === 'active' || callStatus === 'speaking' || callStatus === 'listening';

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'idle': return 'bg-titanium-500';
      case 'connecting': return 'bg-amber-400';
      case 'active':
      case 'speaking':
      case 'listening': return 'bg-emerald-400';
      case 'error': return 'bg-rose-500';
      case 'ended': return 'bg-titanium-400';
      default: return 'bg-titanium-500';
    }
  };

  return (
    <section id="live-demo" className="py-12 md:py-16 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Live HVAC dispatch terminal</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Hear Sarah triage <span className="gold-gradient-text">a live HVAC emergency</span>.
          </h2>
          <p className="text-titanium-300 text-sm sm:text-base mt-2">
            Test how Sarah screens for gas safety, captures customer fee approval, and dispatches the on-call truck.
          </p>
        </div>

        <div className="glass-panel-elevated rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 p-1 bg-titanium-950 rounded-xl border border-white/[0.08] overflow-x-auto">
              {HVAC_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    if (!isCallInProgress) {
                      setSelectedScenarioIndex(idx);
                      setTranscripts([]);
                      setCallStatus('idle');
                    }
                  }}
                  disabled={isCallInProgress}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedScenarioIndex === idx
                      ? 'bg-titanium-800 text-white border border-white/15'
                      : 'text-titanium-400 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {sc.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm px-3 py-1.5 rounded-lg bg-titanium-950 border border-white/[0.08] text-titanium-300 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${publicKey && isLiveRetellMode ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span>{publicKey && isLiveRetellMode ? 'Live Call' : 'Interactive Simulation'}</span>
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="underline ml-2">Dismiss</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-5 flex flex-col justify-between bg-titanium-950/80 rounded-2xl p-5 border border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 text-sm text-titanium-300 pb-3 border-b border-white/[0.06]">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(callStatus)}`}></span>
                  <span className="font-medium">{formatStatus(callStatus)}</span>
                </div>

                <div className="relative h-28 w-full my-4 rounded-xl bg-titanium-900/60 border border-white/[0.05] overflow-hidden flex items-center justify-center">
                  <canvas ref={canvasRef} width={380} height={112} className="w-full h-full object-cover" />
                  {callStatus === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-titanium-950/60 text-sm text-titanium-300 gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Ready to initiate HVAC dispatch</span>
                    </div>
                  )}
                  {callStatus === 'connecting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-titanium-950/80 text-sm text-amber-300 gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Connecting...</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm">
                  <div className="font-semibold text-white mb-1">Sarah — Head HVAC Dispatcher</div>
                  <div className="text-titanium-300 line-clamp-3">{scenario.customerProblem}</div>
                </div>
              </div>

              <div className="mt-6">
                {!isCallInProgress ? (
                  <button
                    onClick={handleStartCall}
                    className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base uppercase tracking-wider animate-cta-glow-emerald transition-all flex items-center justify-center gap-3"
                  >
                    <PhoneCall className="w-5 h-5" />
                    <span>{publicKey && isLiveRetellMode ? '▶ Start Live Call' : '▶ Test Call Now — Instant'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEndCall}
                      className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Call</span>
                    </button>
                    <button
                      onClick={handleToggleMute}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isMuted
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                          : 'bg-titanium-900 border-white/10 text-titanium-300 hover:text-white'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between bg-titanium-950/80 rounded-2xl p-5 border border-white/[0.06] min-h-[340px]">
              <div>
                <div className="pb-3 border-b border-white/[0.06] text-sm font-medium text-white">
                  Conversation
                </div>

                <div className="space-y-4 my-4 max-h-[190px] overflow-y-auto pr-2">
                  {transcripts.length === 0 ? (
                    <div className="py-12 text-center text-titanium-500 text-sm">
                      <Clock className="w-6 h-6 mx-auto mb-3 text-titanium-600 opacity-60" />
                      Press <span className="text-amber-400 font-medium">"Test Call Now"</span> to hear Sarah handle this HVAC emergency.
                    </div>
                  ) : (
                    transcripts.map((t) => (
                      <div
                        key={t.id}
                        className={`text-sm rounded-xl p-4 ${
                          t.speaker === 'system'
                            ? 'bg-titanium-900/50 text-titanium-400'
                            : t.speaker === 'caller'
                            ? 'bg-titanium-900 text-titanium-100 border border-white/5 ml-4'
                            : 'bg-amber-500/10 text-white border border-amber-500/20 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 text-xs text-titanium-400">
                          <span className={t.speaker === 'agent' ? 'text-amber-400 font-semibold' : ''}>
                            {t.speaker === 'agent' ? 'Sarah' : t.speaker === 'caller' ? 'Caller' : 'System'}
                          </span>
                          <span>{t.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{t.text}</p>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span>What happens next</span>
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${callStatus === 'ended' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-titanium-800 text-titanium-300'}`}>
                    {callStatus === 'ended' ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-titanium-900 p-4 rounded-xl border border-white/[0.04]">
                  <div>
                    <span className="text-titanium-400 text-xs block mb-1">Action</span>
                    <span className="text-white block">{scenario.crmOutput.action}</span>
                  </div>
                  <div>
                    <span className="text-titanium-400 text-xs block mb-1">Status</span>
                    <span className="text-amber-400 block">{scenario.crmOutput.calendarStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
