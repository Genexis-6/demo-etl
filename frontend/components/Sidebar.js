"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  GitBranch,
  Filter,
  Database,
  Terminal,
  Layers,
  ChevronDown,
  Activity,
  X,
  Settings,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenWarehouse,
  onOpenArchitecture,
  mobileOpen,
  setMobileOpen,
}) {
  const [pipelinesOpen, setPipelinesOpen] = useState(true);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-5 min-h-screen select-none shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.04)] lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Logo & Mobile Close Button */}
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5850ec] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-base tracking-tight flex items-center gap-1.5">
                  ETL Studio <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">v2.4</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Async Pipeline Engine</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1.5">
            {/* Active Dashboard Button */}
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-[#5850ec] text-white shadow-lg shadow-indigo-200 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Section: Pipeline Components */}
            <div className="pt-4 pb-2">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ETL Workflow
              </p>
            </div>

            {/* Collapsible Pipelines */}
            <div>
              <button
                onClick={() => setPipelinesOpen(!pipelinesOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
              >
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-indigo-500" />
                  <span>Extractors</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    pipelinesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {pipelinesOpen && (
                <div className="ml-8 mt-1 space-y-1 border-l-2 border-slate-100 pl-3 text-xs">
                  <div className="flex items-center justify-between py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f68b1e]" /> Jumia Scraper
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">aiohttp</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ee1c7a]" /> Konga Scraper
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">GraphQL</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Jiji Scraper
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">REST/API</span>
                  </div>
                </div>
              )}
            </div>

            {/* Transformers & Regex Filter */}
            <button
              onClick={() => {
                onOpenArchitecture();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-emerald-500" />
                <span>Regex Filter</span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono font-medium">Smart</span>
            </button>

            {/* Data Warehouse Database */}
            <button
              onClick={() => {
                onOpenWarehouse();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-amber-500" />
                <span>Warehouse DB</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">SQLite</span>
            </button>

            {/* Architecture Concept */}
            <button
              onClick={() => {
                onOpenArchitecture();
                setMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Architecture</span>
            </button>
          </div>
        </div>

        {/* Engineer Profile Card */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                DE
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">ETL Data Engineer</p>
              <p className="text-[11px] text-slate-400 font-mono">FastAPI · Next.js</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
