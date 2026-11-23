import React, { useEffect, useRef } from 'react';

/**
 * Lightweight canvas particle field — entangled glowing dots drifting along
 * faint orbital paths. Pure rAF animation, zero dependencies.
 */
export default function QuantumParticles({ density = 46, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const particles = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      hue: Math.random() > 0.5 ? '34,211,238' : '139,92,246',
      phase: Math.random() * Math.PI * 2
    }));

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = (t) => {
      ctx.clearRect(0, 0, width, height);
      const time = t * 0.001;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.4 + p.phase));
        const px = p.x * width;
        const py = p.y * height;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${0.5 * twinkle})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, p.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${0.08 * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}
