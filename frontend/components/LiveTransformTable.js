"use client";

import React, { useState } from "react";
import { Check, X, ArrowRight, Database, Image as ImageIcon, Eye, Smartphone } from "lucide-react";

export default function LiveTransformTable({ items }) {
  const [previewImage, setPreviewImage] = useState(null);

  const getPlatformBadge = (platform) => {
    switch (platform?.toLowerCase()) {
      case "jumia":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Jumia</span>;
      case "konga":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">Konga</span>;
      case "jiji":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Jiji</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Platform</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[380px] sm:h-[360px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            <span>Data Flow · Raw → Clean → Warehouse</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold uppercase">Images Included</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Live query-aware regex noise filtering & SQLite persistence</p>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Showing last <span className="font-semibold text-slate-700">{items?.length || 0}</span> items
        </div>
      </div>

      {/* Table Container with touch scrolling */}
      <div className="flex-1 overflow-x-auto overflow-y-auto border border-slate-100 rounded-xl -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse min-w-[620px] sm:min-w-[680px]">
          <thead className="bg-slate-50/90 sticky top-0 z-10 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Item</th>
              <th className="py-2.5 px-3">Platform</th>
              <th className="py-2.5 px-3">Normalized Title</th>
              <th className="py-2.5 px-3">Price Cleaned</th>
              <th className="py-2.5 px-3">Filter Status</th>
              <th className="py-2.5 px-3 text-right">Storage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(!items || items.length === 0) ? (
              <tr>
                <td colSpan="6" className="py-14 text-center text-slate-400">
                  <p className="font-medium text-xs">No records streaming yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click &quot;Trigger ETL Run&quot; to watch real-time extraction &amp; transformation</p>
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Product Image Thumbnail */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div
                      onClick={() => item.image_url && setPreviewImage({ url: item.image_url, name: item.clean_name, price: item.clean_price })}
                      className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 relative flex items-center justify-center cursor-pointer hover:border-indigo-400 group-hover:shadow-sm transition shrink-0"
                      title="Click to view product image"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.clean_name || "Product"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: item.image_url ? "none" : "flex" }}
                        className="w-full h-full items-center justify-center text-slate-400 bg-slate-100"
                      >
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5 drop-shadow" />
                      </div>
                    </div>
                  </td>

                  {/* Platform Badge */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    {getPlatformBadge(item.platform)}
                  </td>

                  {/* Normalized Name */}
                  <td className="py-2 px-3 max-w-[240px] sm:max-w-[280px]">
                    <div className="font-medium text-slate-800 truncate" title={item.clean_name}>
                      {item.clean_name}
                    </div>
                  </td>

                  {/* Price Cleaned */}
                  <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-600">
                    <span className="text-[10px] text-slate-400 line-through mr-1">{item.raw_price}</span>
                    <ArrowRight className="w-2.5 h-2.5 inline text-slate-400 mr-1" />
                    <span className="font-semibold text-slate-800">
                      ₦{Number(item.clean_price).toLocaleString()}
                    </span>
                  </td>

                  {/* Filter Status */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    {item.is_kept ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Kept</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200" title={`Filtered keyword: ${item.filter_reason}`}>
                        <X className="w-3 h-3 text-rose-600" />
                        <span>Noise: {item.filter_reason || "Accessory"}</span>
                      </span>
                    )}
                  </td>

                  {/* Storage Status */}
                  <td className="py-2 px-3 whitespace-nowrap text-right">
                    {item.is_kept ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-600 font-medium">
                        <Database className="w-3 h-3" />
                        <span>Loaded</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Discarded
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center"
          >
            <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 relative flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full text-left">
              <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{previewImage.name}</h4>
              <p className="font-mono font-bold text-indigo-600 text-sm mt-1">
                ₦{Number(previewImage.price).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
