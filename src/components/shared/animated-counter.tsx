"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

function formatNumber(num: number, target: number): string {
  if (target >= 1_000_000) {
    const m = num / 1_000_000;
    return m >= 1 ? `${m.toFixed(0)}M` : Math.round(num).toLocaleString();
  }
  if (target >= 1_000) {
    return Math.round(num).toLocaleString();
  }
  return Math.round(num).toLocaleString();
}

export default function AnimatedCounter({
  value,
  suffix = "",
  label,
  duration = 2,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(formatNumber(latest, value));
      },
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="text-4xl font-extrabold text-primary-500 sm:text-5xl lg:text-6xl">
        <span>{display}</span>
        {suffix && <span>{suffix}</span>}
      </div>
      <p className="mt-2 text-text-secondary">{label}</p>
    </div>
  );
}
