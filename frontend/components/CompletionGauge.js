"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

export default function CompletionGauge({ stats, usedSlots, totalSlots }) {
  const extracted = stats.total_extracted || 0;
  const loaded = stats.total_loaded || 0;
  const filtered = stats.total_filtered || 0;

  // Calculate dynamic real progress based on active platform stages
  const platforms = stats.platforms ? Object.values(stats.platforms) : [];
  const avgProgress =
    platforms.length > 0
      ? Math.round(platforms.reduce((acc, p) => acc + (p.progress || 0), 0) / platforms.length)
      : 0;

  const percent = stats.status === "completed" ? 100 : avgProgress;

  // SVG circular calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const conversionRate = extracted > 0 ? Math.round((loaded / extracted) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[230px]">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Pipeline Progress</h3>
          <p className="text-[11px] text-slate-400 font-medium">Async lifecycle completion</p>
        </div>
      </div>

      <div className="flex items-center justify-around my-2">
        {/* Circular SVG Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Progress line */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#5850ec"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold font-mono text-slate-800 leading-none">
              {percent}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Sync
            </span>
          </div>
        </div>

        {/* Sub-metrics */}
        <div className="space-y-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[120px]">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Yield:</span>
              <span className="font-mono font-bold text-slate-700">{conversionRate}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[120px]">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-indigo-500" /> Semaphore:</span>
              <span className="font-mono font-bold text-indigo-600">{usedSlots}/{totalSlots}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(usedSlots / totalSlots) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
