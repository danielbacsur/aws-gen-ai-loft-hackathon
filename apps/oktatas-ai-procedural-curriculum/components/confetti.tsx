"use client";

import { useEffect, useRef } from "react";

interface ConfettiParticle {
  color: string;
  x: number;
  y: number;
  diameter: number;
  tilt: number;
  tiltAngleIncrement: number;
  tiltAngle: number;
  particleSpeed: number;
  waveAngle: number;
  waveAngleIncrement: number;
  opacity: number;
}

const generateConfettiParticles = (count: number): ConfettiParticle[] => {
  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      diameter: Math.random() * 10 + 1,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
      particleSpeed: Math.random() * 10 + 1,
      waveAngle: 0,
      waveAngleIncrement: Math.random() * 0.1 + 0.05,
      opacity: 1,
    });
  }
  return particles;
};

const updateConfettiParticles = (
  particles: ConfettiParticle[],
  duration: number
): ConfettiParticle[] => {
  const opacityDecrement = 1 / (60 * (duration / 1000));
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + Math.sin(particle.waveAngle) * 2,
      y: particle.y + particle.particleSpeed,
      tiltAngle: particle.tiltAngle + particle.tiltAngleIncrement,
      tilt: particle.tilt + Math.sin(particle.tiltAngle) * 12,
      waveAngle: particle.waveAngle + particle.waveAngleIncrement,
      opacity: Math.max(0, particle.opacity - opacityDecrement),
    }))
    .filter((particle) => particle.y < window.innerHeight);
};

export function Confetti({
  isActive,
  duration,
}: {
  isActive: boolean;
  duration: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = generateConfettiParticles(1000);
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = updateConfettiParticles(particles, duration);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.diameter / 2, 0, 2 * Math.PI);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
    }, duration);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="h-lvh w-full absolute"
      style={{
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
