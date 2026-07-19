/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Scissors, Clock, Sparkles, Filter, Search } from "lucide-react";
import { ClothingStyle } from "../types";
import Modal from "./Modal";

interface StylesProps {
  isOpen: boolean;
  onClose: () => void;
  styles: ClothingStyle[];
  onOpenOrder: (detail: { styleId: string; styleName: string }) => void;
}

export default function Styles({ isOpen, onClose, styles, onOpenOrder }: StylesProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [customSearch, setCustomSearch] = useState<string>("");

  const categoryOptions = [
    "All",
    "Finishing",
    "Embroidery",
    "Machine Cutting",
    "Hand Craft"
  ];

  const filteredStyles = styles.filter((s) => {
    // Filter by Category matching
    if (filterCategory !== "All") {
      const catLower = (s.category || "").toLowerCase();
      const optionLower = filterCategory.toLowerCase();
      if (!catLower.includes(optionLower)) return false;
    }

    // Filter by search keyword
    if (customSearch.trim() !== "") {
      const search = customSearch.toLowerCase();
      const name = s.name.toLowerCase();
      const desc = s.description.toLowerCase();
      const cat = (s.category || "").toLowerCase();

      if (
        !name.includes(search) &&
        !desc.includes(search) &&
        !cat.includes(search)
      ) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setFilterCategory("All");
    setCustomSearch("");
  };

  const triggerStyleRequest = (style: ClothingStyle) => {
    onClose();
    onOpenOrder({
      styleId: style.id,
      styleName: style.name,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Textile Finishing Services" subtitle="Capabilities Catalog">
      <div className="space-y-8">
        <p className="text-xs text-stone-600 leading-relaxed -mt-4">
          Oluwashola Textiles offers state-of-the-art decorative and template fabrication services. We support garment manufacturers, schools, designers, and corporations with quick turnarounds and high reliability.
        </p>

        {styles.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-5 my-6 shadow-sm">
            <div className="h-16 w-16 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                Services Directory Coming Soon
              </h3>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-widest">
                Service Catalog Status: Updating
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Welcome to our textile finishing services lookbook! This catalog features computerized embroidery, laser cutouts, custom patches, and crystal embellishments.
            </p>
            <div className="border-t border-stone-200/60 pt-4 text-xs text-stone-555 leading-relaxed">
              We are currently updating our services portfolio. You can still custom-request and book any of our services directly via our order intake panel.
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrder({ styleId: "custom", styleName: "Custom Finishing Request" });
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md shadow-amber-500/10"
              >
                Book Custom Service
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Multi-Dimensional Filter Toolbar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4 shadow-sm" id="styles-filter-panel">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter size={13} className="text-amber-600" /> Services Filter
                </span>
                {(filterCategory !== "All" || customSearch !== "") && (
                  <button
                    onClick={resetFilters}
                    className="text-[10px] font-mono font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Service Group</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 outline-none focus:border-amber-500 font-medium transition"
                    id="style-filter-category"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt === "All" ? "All Services" : opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Custom Keyword */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Search Keywords</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 pointer-events-none">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by embroidery, laser, stoning..."
                      value={customSearch}
                      onChange={(e) => setCustomSearch(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-stone-800 outline-none focus:border-amber-500 placeholder-stone-400 font-medium transition shadow-inner"
                      id="style-filter-custom-search"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span>Found {filteredStyles.length} core service{filteredStyles.length === 1 ? "" : "s"}</span>
            </div>

            {/* Styles Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="styles-grid">
              {filteredStyles.length === 0 ? (
                <div className="col-span-full text-center py-12 text-stone-500 font-mono text-xs">
                  No textile finishing services found matching your criteria.
                </div>
              ) : (
                filteredStyles.map((style) => {
                  return (
                    <div
                      key={style.id}
                      className="rounded-3xl border border-stone-200 bg-white p-4.5 flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:border-amber-500/30 hover:shadow-md group"
                      id={`style-card-${style.id}`}
                    >
                      {/* Image Frame */}
                      <div className="w-full sm:w-36 h-40 sm:h-full rounded-2xl overflow-hidden bg-stone-100 relative shrink-0">
                        <img
                          src={style.imageUrl}
                          alt={style.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-95"
                        />
                      </div>

                      {/* Description & Specs */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-mono text-amber-700 font-bold">
                            <Sparkles size={10} className="text-amber-600" /> Professional Service
                          </div>
                          <h4 className="font-serif text-base font-bold text-stone-900 leading-tight">
                            {style.name}
                          </h4>
                          <span className="text-[8px] uppercase font-mono text-stone-400 tracking-wider font-semibold block">
                            {style.category}
                          </span>
                          <p className="text-stone-650 text-xs leading-relaxed font-light line-clamp-3">
                            {style.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-550">
                            <Clock size={13} className="text-amber-600 animate-pulse" />
                            <span className="font-mono text-[9px] uppercase tracking-wide">
                              Turnaround: <strong className="text-stone-850">{style.estimatedYardage}</strong>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => triggerStyleRequest(style)}
                            className="self-start sm:self-center px-4.5 py-2 bg-stone-50 text-amber-700 hover:bg-amber-500 hover:text-stone-950 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-stone-200 hover:border-amber-500 transition duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0 shadow-sm hover:shadow"
                          >
                            <Scissors size={11} />
                            Choose Service
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
