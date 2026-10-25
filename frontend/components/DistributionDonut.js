"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DistributionDonut({ stats }) {
  const chartData = useMemo(() => {
    const jumiaCount = stats.platforms?.jumia?.extracted || 0;
    const kongaCount = stats.platforms?.konga?.extracted || 0;
    const jijiCount = stats.platforms?.jiji?.extracted || 0;
    const hasData = (jumiaCount + kongaCount + jijiCount) > 0;

    if (!hasData) {
      return {
        labels: ["Awaiting Live Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      };
    }

    return {
      labels: ["Jumia", "Konga", "Jiji"],
      datasets: [
        {
          data: [jumiaCount, kongaCount, jijiCount],
          backgroundColor: ["#f68b1e", "#ee1c7a", "#10b981"],
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 4,
        },
      ],
    };
  }, [stats]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          font: { size: 10, family: "inherit" },
          color: "#64748b",
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 8,
        cornerRadius: 6,
        bodyFont: { size: 11 },
      },
    },
  };

  const total = (stats.total_extracted || 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[230px]">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Source Distribution</h3>
          <p className="text-[11px] text-slate-400 font-medium">Multi-platform extracted items</p>
        </div>
      </div>

      <div className="flex-1 w-full relative flex items-center justify-center my-1">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
          <span className="text-xl font-bold text-slate-800 font-mono leading-none">
            {total}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Items
          </span>
        </div>
      </div>
    </div>
  );
}
