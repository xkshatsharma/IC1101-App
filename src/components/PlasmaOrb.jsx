import React, { useRef, useEffect } from 'react';

/**
 * PlasmaOrb — 60fps GPU-accelerated Canvas & Shader Plasma Energy Orb
 * Specifications:
 * - ~160px centerpiece sphere
 * - Deep purple core (#4A00E0), swirling violet (#8E2DE2) & soft pink (#E471ED) wisps
 * - Translucent plasma sphere with subtle rim highlights & outer bloom halo
 * - Continuous slow rotation (~20s cycle), floating up/down (±8px), breathing glow
 * - Reacts dynamically to listening states and refresh/calibration pulses
 */
export default function PlasmaOrb({ 
  size = 170, 
  isListening = false, 
  isCalibrating = false,
  onClick
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    // High DPI canvas support
    const dpr = window.devicePixelRatio || 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const center = size / 2;
    const radius = size * 0.44;

    let time = 0;

    const render = () => {
      time += 0.016; // standard 60fps tick

      ctx.clearRect(0, 0, size, size);

      // Dynamic activity multiplier
      const energy = isListening ? 1.4 : isCalibrating ? 2.5 : 1.0;
      const speed = time * 0.5 * energy;

      // 1. Soft Deep Purple Base Core Glow
      const coreGrad = ctx.createRadialGradient(
        center, center, radius * 0.1,
        center, center, radius
      );
      coreGrad.addColorStop(0, 'rgba(142, 45, 226, 0.95)');    // #8E2DE2 bright violet
      coreGrad.addColorStop(0.35, 'rgba(74, 0, 224, 0.85)');   // #4A00E0 deep purple
      coreGrad.addColorStop(0.75, 'rgba(35, 7, 85, 0.7)');     // dark indigo depth
      coreGrad.addColorStop(1, 'rgba(10, 10, 15, 0)');         // fade to edge

      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      ctx.restore();

      // 2. Swirling Internal Wisps & Plasma Ribbons
      // Using harmonic parametric curves that twist and loop over ~20s
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.95, 0, Math.PI * 2);
      ctx.clip(); // Keep wisps inside the plasma sphere

      const numWisps = 5;
      for (let i = 0; i < numWisps; i++) {
        const offset = (i * Math.PI * 2) / numWisps;
        const wispRotation = speed * 0.35 + offset;
        const phase = time * (0.8 + i * 0.2) * energy;

        ctx.beginPath();
        const steps = 60;
        for (let j = 0; j <= steps; j++) {
          const t = (j / steps) * Math.PI * 2;
          // Harmonic wave calculation
          const rWisp = radius * (0.35 + 0.45 * Math.sin(t * 2 + phase) * Math.cos(t * 3 - phase * 0.5));
          const angle = t + wispRotation;
          
          const x = center + Math.cos(angle) * rWisp;
          const y = center + Math.sin(angle) * (rWisp * (0.7 + 0.3 * Math.sin(phase + i)));

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        // Gradient for this ribbon: soft pink to electric violet
        const ribbonGrad = ctx.createLinearGradient(
          center - radius, center - radius,
          center + radius, center + radius
        );
        if (i % 2 === 0) {
          ribbonGrad.addColorStop(0, 'rgba(228, 113, 237, 0.75)'); // Soft pink
          ribbonGrad.addColorStop(0.5, 'rgba(178, 75, 243, 0.6)'); // Vivid magenta
          ribbonGrad.addColorStop(1, 'rgba(142, 45, 226, 0.2)');  // Violet
        } else {
          ribbonGrad.addColorStop(0, 'rgba(255, 138, 238, 0.85)'); // Hot pink
          ribbonGrad.addColorStop(0.6, 'rgba(110, 56, 255, 0.5)'); // Electric indigo
          ribbonGrad.addColorStop(1, 'rgba(74, 0, 224, 0.1)');
        }

        ctx.strokeStyle = ribbonGrad;
        ctx.lineWidth = 2.4 + Math.sin(phase) * 1.2;
        ctx.shadowColor = 'rgba(228, 113, 237, 0.8)';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      // Dynamic central energy nexus
      const nexusGrad = ctx.createRadialGradient(
        center, center, 2,
        center, center, radius * 0.4
      );
      nexusGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      nexusGrad.addColorStop(0.3, 'rgba(228, 113, 237, 0.8)');
      nexusGrad.addColorStop(0.7, 'rgba(142, 45, 226, 0.4)');
      nexusGrad.addColorStop(1, 'rgba(74, 0, 224, 0)');

      ctx.beginPath();
      ctx.arc(center, center, radius * 0.38 + Math.sin(time * 3) * 4, 0, Math.PI * 2);
      ctx.fillStyle = nexusGrad;
      ctx.fill();

      ctx.restore();

      // 3. Translucent Plasma Glass Rim & Specular Highlights
      // Outer rim gradient
      ctx.save();
      const rimGrad = ctx.createRadialGradient(
        center, center, radius * 0.85,
        center, center, radius
      );
      rimGrad.addColorStop(0, 'rgba(178, 75, 243, 0)');
      rimGrad.addColorStop(0.8, 'rgba(228, 113, 237, 0.45)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.65)');

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = rimGrad;
      ctx.shadowColor = 'rgba(178, 75, 243, 0.9)';
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Specular glass highlight at top-left curvature
      ctx.beginPath();
      ctx.ellipse(
        center - radius * 0.35, 
        center - radius * 0.35, 
        radius * 0.3, 
        radius * 0.15, 
        -Math.PI / 4, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, isListening, isCalibrating]);

  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Outer Soft Bloom Halo (Breathes gently) */}
      <div 
        className={`absolute rounded-full pointer-events-none transition-all duration-700 ${
          isListening 
            ? 'w-[230px] h-[230px] bg-gradient-to-r from-[#4A00E0]/40 via-[#8E2DE2]/50 to-[#E471ED]/40 blur-2xl animate-pulse'
            : isCalibrating
            ? 'w-[260px] h-[260px] bg-gradient-to-r from-white/60 via-[#E471ED]/70 to-[#4A00E0]/60 blur-3xl'
            : 'w-[210px] h-[210px] bg-gradient-to-r from-[#4A00E0]/30 via-[#8E2DE2]/35 to-[#E471ED]/25 blur-2xl animate-breathe'
        }`}
      />

      {/* Floating Wrapper (±8px gentle floating loop) */}
      <div className="relative animate-float flex items-center justify-center">
        {/* Soft atmospheric ambient glow ring */}
        <div 
          className="absolute inset-0 rounded-full border border-purple-400/20 shadow-[0_0_30px_rgba(178,75,243,0.3)] pointer-events-none"
          style={{ width: size * 0.9, height: size * 0.9, margin: 'auto' }}
        />

        {/* 60FPS Dynamic Plasma Canvas */}
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: size, 
            height: size,
            filter: 'drop-shadow(0 0 16px rgba(178, 75, 243, 0.55))' 
          }}
          className="transition-transform duration-500 hover:scale-105"
        />
      </div>
    </div>
  );
}
