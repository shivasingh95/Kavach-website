"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Fingerprint } from "lucide-react";

// ─── Floating Particle System ────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 50;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? "#00f0ff" : "#7c3aed",
    });

    const init = () => {
      resize();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color === "#00f0ff"
            ? `rgba(0, 240, 255, ${p.opacity})`
            : `rgba(124, 58, 237, ${p.opacity})`;
        ctx.fill();
      });

      drawConnections();
      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

// ─── Floating Security Icons ─────────────────────────────────────────────────

const floatingIcons = [
  { Icon: Shield, delay: 0, x: "15%", y: "20%" },
  { Icon: Lock, delay: 0.5, x: "75%", y: "15%" },
  { Icon: Eye, delay: 1, x: "60%", y: "70%" },
  { Icon: Fingerprint, delay: 1.5, x: "25%", y: "75%" },
];

// ─── Auth Background (Left Panel) ───────────────────────────────────────────

interface AuthBackgroundProps {
  title: string;
  subtitle: string;
}

export function AuthBackground({ title, subtitle }: AuthBackgroundProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#050816] items-center justify-center">
      {/* Particle system */}
      <ParticleCanvas />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,240,255,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.06)_0%,transparent_60%)]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating security icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, i) => (
        <motion.div
          key={i}
          className="absolute text-kavach-cyan/15"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={40} strokeWidth={1} />
        </motion.div>
      ))}

      {/* Center content */}
      <div className="relative z-10 px-12 text-center max-w-md">
        {/* Animated shield */}
        <motion.div
          className="mx-auto mb-8 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.2, bounce: 0.3 }}
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-kavach-cyan/20 to-[#7c3aed]/20 border border-kavach-cyan/20 flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-12 h-12 text-kavach-cyan" strokeWidth={1.5} />
          </div>
          {/* Pulsing ring */}
          <motion.div
            className="absolute -inset-3 rounded-3xl border border-kavach-cyan/20"
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h2
          className="text-3xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="text-[var(--text-secondary)] leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {subtitle}
        </motion.p>

        {/* Trust badges */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            { label: "Encrypted", icon: Lock },
            { label: "Secure", icon: Shield },
            { label: "Private", icon: Fingerprint },
          ].map(({ label, icon: TrustIcon }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <TrustIcon size={14} className="text-kavach-cyan/60" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Auth Page Wrapper ───────────────────────────────────────────────────────

interface AuthPageWrapperProps {
  children: React.ReactNode;
  backgroundTitle: string;
  backgroundSubtitle: string;
}

export function AuthPageWrapper({
  children,
  backgroundTitle,
  backgroundSubtitle,
}: AuthPageWrapperProps) {
  return (
    <div className="min-h-screen flex relative">
      {/* Left branding panel (desktop) */}
      <AuthBackground title={backgroundTitle} subtitle={backgroundSubtitle} />

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden">
        {/* Background effects for mobile */}
        <div className="absolute inset-0 bg-[#050816] lg:bg-[#070b19]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,240,255,0.06)_0%,transparent_50%)] lg:opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.04)_0%,transparent_50%)]" />

        {/* Form content */}
        <div className="relative z-10 w-full max-w-md px-6 py-12 sm:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
