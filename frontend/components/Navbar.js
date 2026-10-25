"use client";

import React from "react";
import {
  Menu,
  Bell,
  Search,
  Wifi,
  WifiOff,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function Navbar({
  wsConnected,
  usedSlots,
  totalSlots,
  onSelectQuery,
  currentQuery,
  onOpenArchitecture,
  onToggleMobileMenu,
}) {
  const queryPresets = [
    { label: "iPhone", query: "iphone" },
    { label: "Samsung", query: "samsung" },
    { label: "Nike Shoes", query: "shoes" },
    { label: "Laptop", query: "laptop" },
    { label: "Headphones", query: "headphones" },
    { label: "Blender", query: "blender" },
  ];

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-20">
      {/* Left: Mobile Hamburger & Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">Dashboard</h2>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden xs:block">Real-time Concurrent ETL Ingestion</p>
        </div>

        {/* Query Presets Chips - scrollable horizontally on tablet/desktop */}
        <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-100 overflow-x-auto py-1">
          <span className="text-xs text-slate-400 font-medium mr-1 shrink-0">Presets:</span>
          {queryPresets.map((p) => (
            <button
              key={p.query}
              onClick={() => onSelectQuery(p.query)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium whitespace-nowrap shrink-0 ${
                currentQuery.toLowerCase() === p.query.toLowerCase()
                  ? "bg-indigo-50 text-indigo-600 font-semibold border border-indigo-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Real-time badges and notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Concurrency Slots Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] sm:text-xs font-medium text-slate-700">
          <Cpu className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">Semaphore:</span>
          <span className="font-mono font-semibold text-indigo-600">
            {usedSlots}/{totalSlots}
          </span>
          <div className="hidden sm:flex gap-0.5 ml-1">
            {Array.from({ length: totalSlots }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-3.5 rounded-sm transition-all duration-200 ${
                  i < usedSlots
                    ? "bg-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* WebSocket Connection Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border ${
            wsConnected
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {wsConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="hidden sm:inline">WebSocket Live</span>
              <span className="sm:hidden">Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="hidden sm:inline">Connecting...</span>
              <span className="sm:hidden">Sync</span>
            </>
          )}
        </div>

        {/* Architecture Button */}
        <button
          onClick={onOpenArchitecture}
          className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title="ETL Architecture & Logic Explainer"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </header>
  );
}
