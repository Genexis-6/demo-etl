"use client";

import React from "react";
import { X, Layers, ShieldCheck, Cpu, RefreshCw, Filter, Database, CheckCircle2 } from "lucide-react";

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const pillars = [
    {
      title: "1. Non-Blocking Async Extraction",
      tech: "Python aiohttp + asyncio.gather",
      desc: "Concurrently requests catalog pages and product detail coroutines across 3 e-commerce platforms simultaneously without thread contention.",
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      code: "await asyncio.gather(*[fetch(session, url) for p in pages])",
    },
    {
      title: "2. Semaphore Worker Throttling",
      tech: "asyncio.Semaphore(limit=8)",
      desc: "Strictly bounds in-flight network sockets so target servers and proxies are never overwhelmed, dynamically lighting up worker slots.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      code: "async with semaphore:\n    response = await session.get(url)",
    },
    {
      title: "3. 429 Resilience & Exponential Backoff",
      tech: "Adaptive Backoff + Jitter",
      desc: "When a marketplace returns HTTP 429 (Too Many Requests), the coroutine catches the status, calculates wait = (2^attempt) * 10 + jitter, backs off, and retries safely.",
      icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
      code: "if resp.status == 429:\n    await asyncio.sleep((2 ** attempt) * 10 + random())",
    },
    {
      title: "4. Query-Aware Regex Noise Filter",
      tech: "Dynamic Regex Compilation",
      desc: "Filters out accessory keywords (e.g. screen protector, silicone case, battery) EXCEPT when the user explicitly queried for that accessory, preventing false negatives.",
      icon: <Filter className="w-5 h-5 text-purple-500" />,
      code: "active_kw = [k for k in ACCESSORY_KW if k not in query]\npattern = r'\\b(' + '|'.join(active_kw) + r')\\b'",
    },
    {
      title: "5. Bulk Database Ingestion",
      tech: "SQLAlchemy Async + SQLite / PostgreSQL",
      desc: "Cleaned and normalized records are bulk-inserted in single transactional sessions to maximize disk write I/O and query speed.",
      icon: <Database className="w-5 h-5 text-rose-500" />,
      code: "async with db_session_manager.session() as session:\n    await jumia_query.save_bulk_data(rows)",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">ETL Pipeline Engineering Architecture</h3>
              <p className="text-xs text-slate-400">Technical breakdown of concurrency, resilience, and transformation logic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {pillars.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-800">{p.title}</h4>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                      {p.tech}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                  <pre className="mt-2 p-2 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto">
                    <code>{p.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
