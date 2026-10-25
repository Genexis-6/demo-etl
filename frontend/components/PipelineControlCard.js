"use client";

import React from "react";
import { Sliders, Zap, Database, Globe, Search, Clock, Layers, Plus, Minus } from "lucide-react";

export default function PipelineControlCard({
  query,
  setQuery,
  pages,
  setPages,
  batchDelay = 1.2,
  setBatchDelay,
  semaphoreLimit,
  setSemaphoreLimit,
  isRunning,
  onTriggerRun,
  onClearWarehouse,
}) {
  const getDelayBadge = (delay) => {
    if (delay < 0.8) return { label: "Fast / Aggressive", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (delay <= 1.8) return { label: "Optimal / Balanced", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    return { label: "Stealth / Polite", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  const delayBadge = getDelayBadge(batchDelay);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between min-h-[460px] sm:min-h-[440px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">Live Scraper Parameters</h3>
          </div>
          <button
            onClick={onClearWarehouse}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition flex items-center gap-1 font-medium"
            title="Reset DB warehouse"
          >
            <Database className="w-3 h-3" />
            <span>Reset DB</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Query Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Search E-Commerce Marketplaces
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isRunning && onTriggerRun()}
                disabled={isRunning}
                placeholder="Search anything (e.g. nike shoes, iphone, laptop)..."
                className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-60 font-medium"
              />
            </div>
          </div>

          {/* Configurable Number of Pages */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-500" />
                <span>Pages per Platform</span>
              </span>
              <span className="font-mono text-indigo-600 font-bold text-xs">
                {pages} {pages === 1 ? "page" : "pages"} (~{pages * 40} items/site)
              </span>
            </div>

            {/* Stepper + Quick Presets */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200/80 rounded-xl bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setPages(Math.max(1, pages - 1))}
                  disabled={isRunning || pages <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 transition text-xs font-bold"
                  title="Decrease pages"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={pages}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= 10) setPages(val);
                  }}
                  disabled={isRunning}
                  className="w-10 text-center text-xs font-mono font-bold bg-transparent border-0 focus:outline-none text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setPages(Math.min(10, pages + 1))}
                  disabled={isRunning || pages >= 10}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 transition text-xs font-bold"
                  title="Increase pages"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex-1 grid grid-cols-4 gap-1">
                {[1, 2, 3, 5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPages(p)}
                    disabled={isRunning}
                    className={`text-[11px] py-1.5 rounded-lg font-medium transition ${
                      pages === p
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                    }`}
                  >
                    {p}p
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configurable Duration / Scraping Delay */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>Delay Between Batches</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${delayBadge.color}`}>
                  {delayBadge.label}
                </span>
                <span className="font-mono text-indigo-600 font-bold text-xs">{batchDelay.toFixed(1)}s</span>
              </div>
            </div>

            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={batchDelay}
              onChange={(e) => setBatchDelay && setBatchDelay(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            {/* Quick Delay Presets */}
            <div className="grid grid-cols-3 gap-1 mt-1.5">
              {[
                { label: "0.5s Fast", val: 0.5 },
                { label: "1.2s Optimal", val: 1.2 },
                { label: "2.5s Safe", val: 2.5 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setBatchDelay && setBatchDelay(preset.val)}
                  disabled={isRunning}
                  className={`text-[10px] py-1 rounded-md font-medium transition ${
                    Math.abs(batchDelay - preset.val) < 0.05
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Semaphore Concurrency Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Concurrency Limit (Semaphore)</span>
              <span className="font-mono text-indigo-600">{semaphoreLimit} workers</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="2"
              value={semaphoreLimit}
              onChange={(e) => setSemaphoreLimit(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 font-mono">
              <span>2 workers</span>
              <span>8 (recommended)</span>
              <span>16 workers</span>
            </div>
          </div>

          {/* Live Targets Indicator */}
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Globe className="w-3 h-3 text-indigo-500" />
              <span>Target Sites:</span>
            </span>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-[#f68b1e]">Jumia</span>
              <span>•</span>
              <span className="text-[#ee1c7a]">Konga</span>
              <span>•</span>
              <span className="text-[#10b981]">Jiji</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={onTriggerRun}
        disabled={isRunning}
        className="w-full mt-3 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#5850ec] hover:bg-[#4a42dc] disabled:opacity-50 transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
      >
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span>{isRunning ? "Scraping Live Marketplaces..." : `Scrape & Run ETL (${pages}p · ${batchDelay.toFixed(1)}s)`}</span>
      </button>
    </div>
  );
}
