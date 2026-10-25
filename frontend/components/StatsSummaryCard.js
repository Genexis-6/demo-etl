"use client";

import React from "react";
import { Play, Square, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";

export default function StatsSummaryCard({ stats, isRunning, onTriggerRun, onStopRun }) {
  const getStatusBadge = () => {
    switch (stats.status) {
      case "running":
        return { text: "Active", bg: "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse" };
      case "completed":
        return { text: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "stopped":
        return { text: "Stopped", bg: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { text: "Idle", bg: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[230px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Pipeline Metrics</h3>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.text}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
              Extracted
            </span>
            <span className="text-lg font-bold text-slate-800 font-mono">
              {stats.total_extracted || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
              Loaded DB
            </span>
            <span className="text-lg font-bold text-indigo-600 font-mono">
              {stats.total_loaded || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
              Filtered Out
            </span>
            <span className="text-lg font-bold text-amber-600 font-mono">
              {stats.total_filtered || 0}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
              429 Retries
            </span>
            <span className="text-lg font-bold text-rose-500 font-mono">
              {stats.total_retries || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button - matches the purple button in the image */}
      <button
        onClick={isRunning ? onStopRun : onTriggerRun}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
          isRunning
            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200"
            : "bg-[#5850ec] hover:bg-[#4a42dc] text-white shadow-indigo-200"
        }`}
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Pipeline</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Trigger ETL Run</span>
          </>
        )}
      </button>
    </div>
  );
}
