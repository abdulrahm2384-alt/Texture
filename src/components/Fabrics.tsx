/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShoppingBag, Check, Sparkles } from "lucide-react";
import { Fabric } from "../types";
import Modal from "./Modal";

interface FabricsProps {
  isOpen: boolean;
  onClose: () => void;
  fabrics: Fabric[];
  onOpenOrder: (detail: { fabricId: string; yards: number; color: string }) => void;
}

export default function Fabrics({ isOpen, onClose, fabrics, onOpenOrder }: FabricsProps) {
  // Store yard selections for each fabric
  const [selections, setSelections] = useState<Record<string, { yards: number; color: string }>>({});
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const handleYardChange = (fabricId: string, yards: number) => {
    const selectedColor = selections[fabricId]?.color || fabrics.find((f) => f.id === fabricId)?.availableColors[0] || "";
    setSelections({
      ...selections,
      [fabricId]: { yards, color: selectedColor },
    });
  };

  const handleColorChange = (fabricId: string, color: string) => {
    const currentYards = selections[fabricId]?.yards || 4; // default yards
    setSelections({
      ...selections,
      [fabricId]: { yards: currentYards, color },
    });
  };

  const getSelection = (fabricId: string, fabric: Fabric) => {
    return selections[fabricId] || { yards: 4, color: fabric.availableColors[0] || "" };
  };

  const triggerOrder = (fabric: Fabric) => {
    const spec = getSelection(fabric.id, fabric);
    onClose();
    onOpenOrder({
      fabricId: fabric.id,
      yards: spec.yards,
      color: spec.color,
    });
  };

  if (!isOpen) return null;

  // Extract unique categories dynamically to handle any custom fabric categories added by admin
  const uniqueCategories = ["All", ...Array.from(new Set(fabrics.map((f) => f.category).filter(Boolean)))];

  const filteredFabrics = fabrics.filter((fabric) => {
    if (filterCategory !== "All" && fabric.category !== filterCategory) return false;
    if (searchKeyword.trim() !== "") {
      const keyword = searchKeyword.toLowerCase();
      const nameMatch = fabric.name.toLowerCase().includes(keyword);
      const descMatch = fabric.description.toLowerCase().includes(keyword);
      const catMatch = fabric.category.toLowerCase().includes(keyword);
      if (!nameMatch && !descMatch && !catMatch) return false;
    }
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Available Premium Fabrics" subtitle="Textile Catalog">
      <div className="space-y-8">
        <p className="text-xs text-stone-600 leading-relaxed -mt-4">
          We source our luxury textiles from elite international mills, specially selected for the perfect Nigerian celebratory or corporate fit. Customize your yardage requirements below to view estimated material values.
        </p>

        {fabrics.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-5 my-6 shadow-sm">
            <div className="h-16 w-16 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                Luxury Textile Showroom Opening Soon
              </h3>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-widest">
                Fabric Catalog Status: Restocking
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Welcome to our luxury textile catalog! This gallery is designed to showcase elite materials sourced from international mills, including heavy Swiss Voile lace, handwoven Aso Oke with metallic accents, organic Mulberry silks, and rich imperial brocades.
            </p>
            <div className="border-t border-stone-200/60 pt-4 text-xs text-stone-550 leading-relaxed">
              We are currently restocking our digital textiles catalog for the upcoming fashion season. While this catalog is being updated, our master tailors can still source any custom fabric you desire! You can request specific fabrics during your custom fitting appointment or order submission.
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrder({ fabricId: "custom", yards: 4, color: "As requested" });
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md shadow-amber-500/10"
              >
                Place Custom Order
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Fabric Filter Toolbar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4 shadow-sm" id="fabrics-filter-panel">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-amber-600" /> Filter & Search Showroom
                </span>
                {(filterCategory !== "All" || searchKeyword !== "") && (
                  <button
                    onClick={() => {
                      setFilterCategory("All");
                      setSearchKeyword("");
                    }}
                    className="text-[10px] font-mono font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Fabric Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:border-amber-500/50"
                  >
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Keyword Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Search Keywords</label>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="e.g. Silk, Velvet, Gold, Red..."
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Fabrics Grid */}
            {filteredFabrics.length === 0 ? (
              <div className="text-center py-16 text-stone-500 font-mono text-xs">
                No premium fabrics found matching your selected criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="fabrics-grid">
            {filteredFabrics.map((fabric) => {
              const spec = getSelection(fabric.id, fabric);
              const totalPrice = spec.yards * fabric.pricePerYard;
              const isOutOfStock = fabric.stockAvailability === "Out of Stock";

              return (
              <div
                key={fabric.id}
                className="rounded-3xl overflow-hidden border border-stone-250 bg-white flex flex-col transition-all duration-300 hover:border-amber-500/40 hover:shadow-md"
                id={`fabric-card-${fabric.id}`}
              >
                {/* Thumbnail */}
                <div className="h-48 overflow-hidden bg-stone-100 relative">
                  <img
                    src={fabric.imageUrl}
                    alt={fabric.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 opacity-95"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/80 backdrop-blur-sm text-amber-800 font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-stone-200">
                      {fabric.category}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        fabric.stockAvailability === "In Stock"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : fabric.stockAvailability === "Low Stock"
                          ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          : "bg-stone-500/10 text-stone-600 border-stone-250"
                      }`}
                    >
                      {fabric.stockAvailability}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-serif text-sm font-bold text-stone-900 tracking-wide line-clamp-1">
                      {fabric.name}
                    </h4>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-light line-clamp-2">
                      {fabric.description}
                    </p>
                  </div>

                  {/* Interactive Spec selectors */}
                  <div className="space-y-3 pt-3 border-t border-stone-100 mt-3">
                    {/* Color Swatches */}
                    <div>
                      <span className="block text-[9px] uppercase font-mono tracking-widest text-stone-500 mb-1.5">
                        Selected Palette Color: <strong className="text-stone-850 font-semibold">{spec.color}</strong>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {fabric.availableColors.map((color, idx) => {
                          const hex = fabric.colorsHex?.[idx] || "#78716c";
                          const isSelected = spec.color === color;
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleColorChange(fabric.id, color)}
                              className={`h-5 w-5 rounded-full border relative flex items-center justify-center transition cursor-pointer ${
                                isSelected ? "border-amber-500 scale-110 shadow-sm" : "border-stone-300 hover:scale-105"
                              }`}
                              style={{ backgroundColor: hex }}
                              title={color}
                            >
                              {isSelected && <Check size={10} className="text-stone-100 drop-shadow" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Yards required */}
                    <div>
                      <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-widest text-stone-500 mb-1">
                        <span>Showroom Yards Required</span>
                        <span className="font-semibold text-amber-700">{spec.yards} Yards</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="15"
                        step="1"
                        disabled={isOutOfStock}
                        value={spec.yards}
                        onChange={(e) => handleYardChange(fabric.id, parseInt(e.target.value) || 4)}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg outline-none disabled:opacity-30"
                      />
                    </div>

                    <div className="border-t border-stone-100 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Unit Price</span>
                      <span className="font-serif font-bold text-stone-850">
                        ₦{fabric.pricePerYard.toLocaleString()}/Yard
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-mono text-stone-500">Total Value</p>
                      <p className="font-serif text-base font-bold text-amber-700 leading-none">
                        ₦{totalPrice.toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerOrder(fabric)}
                      disabled={isOutOfStock}
                      className="px-4 py-2 bg-stone-50 hover:bg-amber-500 text-amber-700 hover:text-stone-950 text-[11px] font-bold uppercase tracking-widest rounded-xl border border-stone-200 hover:border-amber-500 transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm hover:shadow"
                    >
                      <ShoppingBag size={12} />
                      Order Fabric
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
          </>
        )}
      </div>
    </Modal>
  );
}
