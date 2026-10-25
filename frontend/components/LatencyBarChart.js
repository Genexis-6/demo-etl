"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LatencyBarChart({ latencyHistory }) {
  const chartData = useMemo(() => {
    const points =
      latencyHistory && latencyHistory.length > 0
        ? latencyHistory.slice(-14)
        : [];

    const labels = points.length > 0 ? points.map((p) => p.batch || "Batch") : ["Ready"];
    const data = points.length > 0 ? points.map((p) => p.duration_ms || 0) : [0];

    return {
      labels,
      datasets: [
        {
          label: "Latency (ms)",
          data,
          backgroundColor: points.map((p) => {
            if (p.platform === "jumia") return "rgba(246, 139, 30, 0.85)";
            if (p.platform === "konga") return "rgba(238, 28, 122, 0.85)";
            if (p.platform === "jiji") return "rgba(16, 185, 129, 0.85)";
            return "rgba(99, 102, 241, 0.85)";
          }),
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
        },
      ],
    };
  }, [latencyHistory]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 8,
        cornerRadius: 6,
        titleFont: { size: 11, weight: "bold" },
        bodyFont: { size: 10 },
        callbacks: {
          label: (context) => ` ${context.parsed.y} ms`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 9 }, color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.5)" },
        ticks: { font: { size: 9 }, color: "#94a3b8" },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[230px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Batch Latency (ms)</h3>
          <p className="text-[11px] text-slate-400 font-medium">Async coroutine roundtrip per batch</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f68b1e]" /> Jumia</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ee1c7a]" /> Konga</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Jiji</span>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
