"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils/utils";

function diff(target: number) {
  const total = Math.max(0, target - Date.now());
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

const pad = (n: number) => formatPrice(n).padStart(2, "۰");

interface CountdownProps {
  endsAt: string;
  className?: string;
  /** smaller boxes for compact card placement */
  compact?: boolean;
}

export default function Countdown({
  endsAt,
  className = "",
  compact = false,
}: CountdownProps) {
  const target = new Date(endsAt).getTime();
  const [time, setTime] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.total <= 0) {
    return (
      <span className={`text-xs font-bold text-coral ${className}`}>
        پایان یافت
      </span>
    );
  }

  const units = [
    { label: "روز", value: time.days },
    { label: "ساعت", value: time.hours },
    { label: "دقیقه", value: time.minutes },
    { label: "ثانیه", value: time.seconds },
  ];

  return (
    <div
      dir="ltr"
      className={`flex items-center gap-1.5 ${className}`}
      role="timer"
      aria-label="زمان باقی‌مانده تا پایان تخفیف"
    >
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1.5">
          <div
            className={
              compact
                ? "flex min-w-[2rem] flex-col items-center rounded-lg bg-navy px-1.5 py-1 text-white"
                : "flex min-w-[3rem] flex-col items-center rounded-xl bg-navy px-2 py-1.5 text-white"
            }
          >
            <span
              className={
                compact
                  ? "text-sm font-extrabold tabular-nums"
                  : "text-lg font-extrabold tabular-nums"
              }
            >
              {pad(u.value)}
            </span>
            <span className="text-[9px] text-white/70">{u.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="font-bold text-coral">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
