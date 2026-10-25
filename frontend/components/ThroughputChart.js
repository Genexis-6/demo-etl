"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ThroughputChart({ throughputHistory }) {
  const chartData = useMemo(() => {
    const points =
      throughputHistory && throughputHistory.length > 0
        ? throughputHistory.slice(-18)
        : [];

    const labels = points.length > 0 ? points.map((p) => (typeof p.time === "number" ? `${p.time}s` : p.time)) : ["Ready"];
    const extractData = points.length > 0 ? points.map((p) => p.extract || p.extract_rate || 0) : [0];
    const loadData = points.length > 0 ? points.map((p) => p.load || p.load_rate || 0) : [0];

    return {
      labels,
      datasets: [
        {
          label: "Extracted / sec",
          data: extractData,
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          tension: 0.45,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: "#38bdf8",
          borderWidth: 2.5,
        },
        {
          label: "Loaded / sec",
          data: loadData,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.18)",
          tension: 0.45,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: "#6366f1",
          borderWidth: 2.5,
        },
      ],
    };
  }, [throughputHistory]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 11, family: "inherit" },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.6)" },
        ticks: { font: { size: 10 }, color: "#94a3b8", precision: 0 },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[230px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Ingestion Throughput</h3>
          <p className="text-[11px] text-slate-400 font-medium">Extract vs Transform & Load rates (rec/sec)</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Real-time</span>
        </div>
      </div>
      <div className="flex-1 w-full relative">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
