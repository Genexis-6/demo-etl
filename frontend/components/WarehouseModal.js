"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Database, Download, RefreshCw, Filter } from "lucide-react";

export default function WarehouseModal({ isOpen, onClose }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [platform, setPlatform] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWarehouseData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (platform !== "all") params.append("platform", platform);
      if (searchTerm) params.append("query", searchTerm);
      params.append("limit", "100");

      const res = await fetch(`http://localhost:8000/api/warehouse/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch warehouse data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWarehouseData();
    }
  }, [isOpen, platform]);

  const exportCSV = () => {
    if (!products.length) return;
    const headers = ["ID", "Platform", "Product Name", "Price (NGN)", "Query", "Scraped At"];
    const rows = products.map((p) => [
      p.id,
      p.platform,
      `"${(p.product_name || "").replace(/"/g, '""')}"`,
      p.price,
      p.query,
      p.scraped_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `etl_warehouse_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Warehouse Explorer · SQLite Storage</h3>
              <p className="text-xs text-slate-400">Query and inspect persisted clean product rows</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={products.length === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products in database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWarehouseData()}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchWarehouseData}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Filter
            </button>
          </div>

          {/* Platform Pills */}
          <div className="flex items-center gap-1">
            {["all", "jumia", "konga", "jiji"].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                  platform === p
                    ? "bg-white text-indigo-700 border border-indigo-200 shadow-sm font-semibold"
                    : "text-slate-500 hover:bg-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="text-slate-400 font-mono text-xs">
            Total Rows: <span className="font-bold text-slate-800">{total}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              <span>Querying SQLite warehouse...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="font-semibold text-sm">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Run an ETL pipeline to populate the warehouse database.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Platform</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Clean Price</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Scraped At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 relative flex items-center justify-center shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-400">#{p.id}</td>
                    <td className="py-2 px-3 capitalize font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          p.platform === "jumia"
                            ? "bg-amber-50 text-amber-700"
                            : p.platform === "konga"
                            ? "bg-pink-50 text-pink-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {p.platform}
                      </span>
                    </td>
                    <td className="py-2 px-3 max-w-sm truncate font-medium text-slate-800" title={p.product_name}>
                      {p.product_name}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-600">
                      ₦{Number(p.price).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-slate-500 capitalize">{p.category || "general"}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400 text-[10px]">
                      {p.scraped_at ? new Date(p.scraped_at).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
