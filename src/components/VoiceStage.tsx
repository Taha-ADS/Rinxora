import React, { useEffect, useRef } from 'react';
import type { Persona } from '../lib/voice';

export type VoiceMode = 'idle' | 'speaking' | 'listening' | 'thinking' | 'paused';

interface VoiceStageProps {
  persona: Persona;
  mode: VoiceMode;
  /** Current 0..1 loudness: metered mic while listening, shaped speech energy while speaking. */
  getLevel: () => number;
  className?: string;
}

/**
 * The voice rhythm. A liquid core sits at the centre, sound ripples travel out
 * while Rinxora speaks and draw in while it listens, and a wave plus a bar
 * rhythm flow left and right of the core. Each persona owns its palette,
 * tempo and wave frequency. Pausing freezes the motion and dims it.
 */
export const VoiceStage: React.FC<VoiceStageProps> = ({ persona, mode, getLevel, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef(mode);
  const personaRef = useRef(persona);
  const levelRef = useRef(getLevel);
  modeRef.current = mode;
  personaRef.current = persona;
  levelRef.current = getLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let level = 0;
    let dim = 1;
    let think = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = personaRef.current;
      const v = p.viz;
      const m = modeRef.current;
      const paused = m === 'paused';

      const breathe = 0.05 + 0.03 * Math.sin(now / 900);
      const target = paused ? 0 : m === 'idle' ? Math.max(breathe, levelRef.current()) : m === 'thinking' ? 0.16 : Math.max(breathe, levelRef.current());
      level += (target - level) * Math.min(1, dt * (target > level ? 14 : 5));
      dim += ((paused ? 0.45 : 1) - dim) * Math.min(1, dt * 6);
      if (!paused) t += dt * (0.6 + v.speed * (0.7 + level * 2.4));
      think += dt * (m === 'thinking' ? 4 : 0);

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(h * 0.17, 34);
      const inward = m === 'listening';
      ctx.globalAlpha = dim;

      // Ripples
      const maxR = Math.min(h * 0.5, w * 0.45);
      for (let i = 0; i < v.rings; i++) {
        let ph = (t * 0.3 + i / v.rings) % 1;
        if (inward) ph = 1 - ph;
        const radius = R * 1.3 + ph * (maxR - R * 1.3) * (0.55 + level * 0.7);
        const fade = Math.pow(1 - (inward ? 1 - ph : ph), 1.5);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${inward ? '225,227,238' : v.ring},${fade * (0.1 + level * 0.5)})`;
        ctx.lineWidth = 1 + level * 1.6 * (1 - ph);
        ctx.stroke();
      }

      // Bar rhythm
      const step = w < 480 ? 7 : 9;
      const bars = Math.floor(w / step);
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      for (let i = 0; i < bars; i++) {
        const x = (i + 0.5) * step + (w - bars * step) / 2;
        const d = Math.abs(x - cx) / (w / 2);
        const env = Math.exp(-Math.pow(d * 1.7, 2));
        const noise = 0.5 + 0.5 * Math.sin(i * 0.9 - t * 3.2 + Math.sin(i * 0.37 + t) * 2);
        const half = 1.5 + level * h * 0.34 * env * (0.35 + 0.65 * noise);
        ctx.strokeStyle = `rgba(${v.ring},${0.12 + 0.5 * env})`;
        ctx.beginPath();
        ctx.moveTo(x, cy - half);
        ctx.lineTo(x, cy + half);
        ctx.stroke();
      }

      // Flowing wave lines (additive so crossings glow)
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(${v.ring},0)`);
      grad.addColorStop(0.28, v.core[0]);
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(0.72, `rgb(${v.ring})`);
      grad.addColorStop(1, `rgba(${v.ring},0)`);
      for (let L = 0; L < 3; L++) {
        ctx.beginPath();
        ctx.lineWidth = L === 0 ? 2 : 1.2;
        ctx.strokeStyle = grad;
        ctx.globalAlpha = dim * (L === 0 ? 0.95 : 0.5);
        const amp = (2 + level * h * (0.36 - L * 0.07)) * (m === 'thinking' ? 0.6 + 0.4 * Math.sin(think) : 1);
        for (let x = 0; x <= w; x += 3) {
          const d = (x - cx) / (w / 2);
          const env = Math.exp(-Math.pow(d * 1.25, 2));
          const y = cy + Math.sin(d * v.freq * Math.PI * 1.4 + t * (1.6 + L * 0.5) + L * 1.7) * amp * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = dim;

      // Liquid core
      const pts = 90;
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const wob = Math.sin(a * v.freq + t * 2.2) * 0.6 + Math.sin(a * (v.freq + 2) - t * 1.6) * 0.4;
        const r = R * (1 + level * 0.3) + R * v.wobble * (0.25 + level * 1.5) * wob;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const core = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.3);
      core.addColorStop(0, v.core[0]);
      core.addColorStop(1, v.core[1]);
      ctx.shadowColor = `rgba(${v.ring},${0.55 + level * 0.4})`;
      ctx.shadowBlur = 18 + level * 26;
      ctx.fillStyle = core;
      ctx.fill();
      ctx.shadowBlur = 0;
      const hi = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.5, 0, cx - R * 0.4, cy - R * 0.5, R * 0.8);
      hi.addColorStop(0, 'rgba(255,255,255,0.5)');
      hi.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hi;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.stroke();

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} aria-hidden="true" />;
};
