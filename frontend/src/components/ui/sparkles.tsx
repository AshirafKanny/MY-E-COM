"use client";

import React, { useMemo } from "react";

function cn(...classes: Array<string | null | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type SparklesCoreProps = {
  className?: string;
  particleCount?: number;
};

export function SparklesCore({ className, particleCount = 80 }: SparklesCoreProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => {
        const size = 1 + Math.random() * 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 4;
        const opacity = 0.4 + Math.random() * 0.6;
        return { id: i, size, left, top, delay, duration, opacity };
      }),
    [particleCount]
  );

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white/90 animate-ping"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
