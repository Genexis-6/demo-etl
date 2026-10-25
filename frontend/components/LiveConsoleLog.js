"use client";

import React, { useRef, useEffect, useState } from "react";
import { Terminal, Trash2, ArrowDown } from "lucide-react";

export default function LiveConsoleLog({ logs, onClearLogs }) {
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLogLevelStyle = (level) => {
    switch (level?.toUpperCase()) {
      case "WARNING":
        return "text-amber-500 font-bold";
      case "ERROR":
        return "text-rose-500 font-bold";
      case "DEBUG":
        return "text-slate-400";
      default:
        return "text-indigo-400 font-medium";
    }
  };

  const getPlatformColor = (msg) => {
    if (!msg) return "";
    if (msg.includes("[JUMIA]")) return "text-[#f68b1e]";
    if (msg.includes("[KONGA]")) return "text-[#ee1c7a]";
    if (msg.includes("[JIJI]")) return "text-[#10b981]";
    return "text-slate-300";
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] flex flex-col justify-between h-[230px] text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-slate-100 text-sm tracking-tight">ETL Coroutine Stream</h3>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
              autoScroll ? "bg-indigo-900/60 text-indigo-300" : "bg-slate-800 text-slate-400"
            }`}
          >
            Auto-scroll: {autoScroll ? "ON" : "OFF"}
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 text-slate-400 hover:text-rose-400 transition"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log view */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto font-mono text-[11px] leading-relaxed space-y-1 pr-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80"
      >
        {(!logs || logs.length === 0) ? (
          <div className="text-slate-500 italic py-6 text-center">
            Awaiting pipeline coroutines... Run ETL to inspect real-time log emissions.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 break-all hover:bg-slate-900/50 px-1 rounded transition-colors">
              <span className="text-slate-500 shrink-0 text-[10px]">
                {log.timestamp || "00:00:00"}
              </span>
              <span className={`shrink-0 text-[10px] ${getLogLevelStyle(log.level)}`}>
                [{log.level || "INFO"}]
              </span>
              <span className={`${getPlatformColor(log.message || log.formatted)}`}>
                {log.message || log.formatted}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
