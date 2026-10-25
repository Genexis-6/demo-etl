"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ThroughputChart from "../components/ThroughputChart";
import LatencyBarChart from "../components/LatencyBarChart";
import StatsSummaryCard from "../components/StatsSummaryCard";
import LiveTransformTable from "../components/LiveTransformTable";
import PipelineControlCard from "../components/PipelineControlCard";
import DistributionDonut from "../components/DistributionDonut";
import CompletionGauge from "../components/CompletionGauge";
import LiveConsoleLog from "../components/LiveConsoleLog";
import WarehouseModal from "../components/WarehouseModal";
import ArchitectureModal from "../components/ArchitectureModal";
import { BACKEND_URL, WS_URL } from "../config/api";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wsConnected, setWsConnected] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // ETL Form state
  const [query, setQuery] = useState("phone");
  const [pages, setPages] = useState(1);
  const [batchDelay, setBatchDelay] = useState(1.2);
  const [semaphoreLimit, setSemaphoreLimit] = useState(8);

  // Real-time Pipeline state
  const [stats, setStats] = useState({
    status: "idle",
    query: "phone",
    pages: 1,
    semaphore_limit: 8,
    total_extracted: 0,
    total_filtered: 0,
    total_loaded: 0,
    total_retries: 0,
    used_slots: 0,
    platforms: {
      jumia: { extracted: 0, loaded: 0 },
      konga: { extracted: 0, loaded: 0 },
      jiji: { extracted: 0, loaded: 0 },
    },
  });

  const [usedSlots, setUsedSlots] = useState(0);
  const [throughputHistory, setThroughputHistory] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [streamingItems, setStreamingItems] = useState([]);
  const [logs, setLogs] = useState([]);

  const wsRef = useRef(null);

  // Fetch initial stats snapshot via REST
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/etl/status`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setStats((prev) => ({ ...prev, ...data }));
            if (data.used_slots !== undefined) setUsedSlots(data.used_slots);
          }
        }
      } catch (err) {
        console.warn("Initial status fetch error:", err);
      }
    };
    fetchInitialStatus();
  }, []);

  // WebSocket connection & auto-reconnect logic
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      try {
        const wsUrl = WS_URL;

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          console.log("[WS] Connected to ETL Pipeline Engine");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            handleIncomingMessage(msg);
          } catch (e) {
            console.error("Failed to parse WS message:", e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          console.log("[WS] Disconnected. Reconnecting in 2s...");
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = (err) => {
          console.warn("[WS] Error encountered, closing...", err);
          ws.close();
        };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const handleIncomingMessage = useCallback((msg) => {
    const { type, data, event } = msg;

    switch (type) {
      case "init_state":
      case "stats_event":
        if (data) {
          setStats((prev) => ({ ...prev, ...data }));
          if (data.used_slots !== undefined) setUsedSlots(data.used_slots);
        }
        break;

      case "pipeline_event":
        if (event) {
          setStats((prev) => ({ ...prev, status: event }));
          if (event === "started") {
            setStreamingItems([]);
            setThroughputHistory([]);
            setLatencyHistory([]);
          }
        }
        break;

      case "semaphore_event":
        if (data && data.used !== undefined) {
          setUsedSlots(data.used);
        }
        break;

      case "throughput_event":
        if (data) {
          setThroughputHistory((prev) => [...prev.slice(-20), data]);
        }
        break;

      case "batch_latency_event":
        if (data) {
          setLatencyHistory((prev) => [...prev.slice(-15), data]);
        }
        break;

      case "item_event":
        if (data) {
          setStreamingItems((prev) => [data, ...prev.slice(0, 50)]);
        }
        break;

      case "log_event":
        if (data) {
          setLogs((prev) => [...prev.slice(-100), data]);
        }
        break;

      default:
        break;
    }
  }, []);

  // Trigger ETL Run
  const handleTriggerRun = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "start",
          query: query.trim() || "phone",
          pages,
          semaphore_limit: semaphoreLimit,
          batch_size: 10,
          batch_delay: batchDelay,
        })
      );
    } else {
      try {
        await fetch(`${BACKEND_URL}/api/etl/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query.trim() || "phone",
            pages,
            semaphore_limit: semaphoreLimit,
            batch_size: 10,
            batch_delay: batchDelay,
          }),
        });
      } catch (err) {
        console.error("Failed to start ETL via REST:", err);
      }
    }
  };

  // Stop ETL Run
  const handleStopRun = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "stop" }));
    } else {
      try {
        await fetch(`${BACKEND_URL}/api/etl/stop`, { method: "POST" });
      } catch (err) {
        console.error("Failed to stop ETL via REST:", err);
      }
    }
  };

  // Clear Warehouse DB
  const handleClearWarehouse = async () => {
    if (confirm("Reset warehouse database?")) {
      try {
        await fetch(`${BACKEND_URL}/api/warehouse/clear`, { method: "DELETE" });
        setStats((prev) => ({ ...prev, total_loaded: 0 }));
        alert("Warehouse database cleared!");
      } catch (err) {
        console.error("Failed to clear warehouse:", err);
      }
    }
  };

  const isRunning = stats.status === "running";

  const queryPresets = [
    { label: "iPhone", query: "iphone" },
    { label: "Samsung", query: "samsung" },
    { label: "Nike Shoes", query: "shoes" },
    { label: "Laptop", query: "laptop" },
    { label: "Headphones", query: "headphones" },
    { label: "Blender", query: "blender" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F5FA] overflow-x-hidden">
      {/* Sidebar Navigation - Left (Desktop static + Mobile slide-over) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWarehouse={() => setIsWarehouseOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          wsConnected={wsConnected}
          usedSlots={usedSlots}
          totalSlots={semaphoreLimit}
          onSelectQuery={(q) => setQuery(q)}
          currentQuery={query}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

        {/* Mobile Horizontal Query Presets Bar */}
        <div className="flex md:hidden items-center gap-1.5 px-4 py-2 bg-white/70 border-b border-slate-100 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Presets:</span>
          {queryPresets.map((p) => (
            <button
              key={p.query}
              onClick={() => setQuery(p.query)}
              className={`text-[11px] px-2 py-0.5 rounded-lg whitespace-nowrap transition-all font-medium shrink-0 ${
                query.toLowerCase() === p.query.toLowerCase()
                  ? "bg-indigo-50 text-indigo-600 font-semibold border border-indigo-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Dashboard Grid - Fully Mobile Responsive */}
        <main className="p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Row: Dual-Line Chart (Ingestion) | Bar Chart (Latency) | Stats Card (KPIs) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            <div className="lg:col-span-5">
              <ThroughputChart throughputHistory={throughputHistory} />
            </div>
            <div className="lg:col-span-4">
              <LatencyBarChart latencyHistory={latencyHistory} />
            </div>
            <div className="lg:col-span-3">
              <StatsSummaryCard
                stats={stats}
                isRunning={isRunning}
                onTriggerRun={handleTriggerRun}
                onStopRun={handleStopRun}
              />
            </div>
          </div>

          {/* Middle Row: Live Data Flow Table (Wide) | ETL Control Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            <div className="lg:col-span-8">
              <LiveTransformTable items={streamingItems} />
            </div>
            <div className="lg:col-span-4">
              <PipelineControlCard
                query={query}
                setQuery={setQuery}
                pages={pages}
                setPages={setPages}
                batchDelay={batchDelay}
                setBatchDelay={setBatchDelay}
                semaphoreLimit={semaphoreLimit}
                setSemaphoreLimit={setSemaphoreLimit}
                isRunning={isRunning}
                onTriggerRun={handleTriggerRun}
                onClearWarehouse={handleClearWarehouse}
              />
            </div>
          </div>

          {/* Bottom Row: Source Donut | Completion Gauge | Coroutine Log Stream */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
            <div className="lg:col-span-3">
              <DistributionDonut stats={stats} />
            </div>
            <div className="lg:col-span-3">
              <CompletionGauge
                stats={stats}
                usedSlots={usedSlots}
                totalSlots={semaphoreLimit}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-6">
              <LiveConsoleLog logs={logs} onClearLogs={() => setLogs([])} />
            </div>
          </div>
        </main>
      </div>

      {/* Warehouse Database Modal */}
      <WarehouseModal
        isOpen={isWarehouseOpen}
        onClose={() => setIsWarehouseOpen(false)}
      />

      {/* Architecture Explainer Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
