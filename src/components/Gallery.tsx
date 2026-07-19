/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Filter, Maximize2, X, ChevronRight, Search, Sparkles } from "lucide-react";
import { FashionWork } from "../types";
import { parseCategory, getCategoryDisplayLabel } from "../utils/categoryParser";
import Modal from "./Modal";

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
  works: FashionWork[];
  onOpenOrder: (detail?: { styleName: string; styleCategory: string }) => void;
}

export default function Gallery({ isOpen, onClose, works, onOpenOrder }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customSearch, setCustomSearch] = useState<string>("");
  
  const [lightboxItem, setLightboxItem] = useState<FashionWork | null>(null);

  // Extract unique categories dynamically from works
  const dynamicCategories = Array.from(new Set(
    works.map((w) => {
      if (!w.category) return null;
      const trimmed = w.category.trim();
      if (!trimmed.startsWith("{")) return trimmed;
      const parsed = parseCategory(trimmed);
      return parsed.custom || parsed.styleType || "General";
    }).filter(Boolean)
  )) as string[];

  const filteredWorks = works.filter((w) => {
    // Filter by Category
    if (selectedCategory !== "All") {
      const trimmed = (w.category || "").trim();
      const itemCat = trimmed.startsWith("{")
        ? (parseCategory(trimmed).custom || parseCategory(trimmed).styleType || "General")
        : trimmed;
      if (itemCat !== selectedCategory) return false;
    }

    // Filter by custom keywords (checks title, description, and category)
    if (customSearch.trim() !== "") {
      const search = customSearch.toLowerCase();
      const title = w.title.toLowerCase();
      const desc = w.description.toLowerCase();
      const cat = (w.category || "").toLowerCase();
      
      if (
        !title.includes(search) &&
        !desc.includes(search) &&
        !cat.includes(search)
      ) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setSelectedCategory("All");
    setCustomSearch("");
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Our Completed Works Showcase" subtitle="Digital Gallery">
      <div className="space-y-8">
        <p className="text-xs text-stone-600 leading-relaxed -mt-4">
          Browse through high-definition photos of real finished monogram embroidery, precise laser cut designs, metal eyelet fittings, and custom hot-fix stoning completed for our clients.
        </p>

        {works.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-5 my-6 shadow-sm">
            <div className="h-16 w-16 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                Bespoke Showroom Coming Soon
              </h3>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-widest">
                Digital Catalog Status: Curating
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Welcome to the digital showroom! This space is dedicated to displaying real completed commissions—featuring computerized embroidery, heavy brass eyelet settings, and luxury hot-fix crystal layouts.
            </p>
            <div className="border-t border-stone-200/60 pt-4 text-xs text-stone-550 leading-relaxed">
              We are currently curating and uploading photos of our latest completed client orders. In the meantime, you can place a customization order or get in touch with our Lagos desk!
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrder();
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md shadow-amber-500/10"
              >
                Inquire & Book Service
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Multi-Dimensional Filter Toolbar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4 shadow-sm" id="gallery-filter-panel">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter size={13} className="text-amber-600" /> Filter Completed Works
                </span>
                {(selectedCategory !== "All" || customSearch !== "") && (
                  <button
                    onClick={resetFilters}
                    className="text-[10px] font-mono font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Category Filter */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Finishing Type</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 outline-none focus:border-amber-500 font-medium transition"
                    id="filter-category-select"
                  >
                    <option value="All">All Categories</option>
                    {dynamicCategories.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search/Custom Keyword input */}
                <div className="relative md:col-span-2">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block mb-1.5">Search Keywords</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 pointer-events-none">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search completed jobs, techniques, or descriptors..."
                      value={customSearch}
                      onChange={(e) => setCustomSearch(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-stone-800 outline-none focus:border-amber-500 placeholder-stone-400 font-medium transition shadow-inner"
                      id="filter-custom-search"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span>Found {filteredWorks.length} completed work{filteredWorks.length === 1 ? "" : "s"}</span>
            </div>

            {/* Grid Layout */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              id="gallery-grid"
            >
              <AnimatePresence mode="popLayout">
                {filteredWorks.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-stone-500 font-mono text-xs">
                    No completed works found matching your selected criteria.
                  </div>
                ) : (
                  filteredWorks.map((work) => {
                    const parsed = parseCategory(work.category);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        key={work.id}
                        className="group relative rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-white cursor-pointer"
                        onClick={() => setLightboxItem(work)}
                        id={`gallery-item-${work.id}`}
                      >
                        {/* Visual Ratio */}
                        <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
                          <img
                            src={work.imageUrl}
                            alt={work.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105 opacity-90"
                          />
                          {/* Glass Accent Hover Overlays */}
                          <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 scale-90 group-hover:scale-100 transition-transform duration-300">
                              <Maximize2 size={16} />
                            </div>
                            <span className="text-[8px] uppercase font-mono tracking-widest text-amber-400 font-bold mt-4 line-clamp-1 max-w-[90%]">
                              {parsed.styleType} Fit
                            </span>
                            <h5 className="font-serif text-sm font-bold text-stone-100 mt-1">
                              {work.title}
                            </h5>
                          </div>
                        </div>

                        {/* Sub-card label details */}
                        <div className="p-3.5 flex items-center justify-between border-t border-stone-200 bg-stone-50">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-[8px] uppercase font-mono text-amber-700 tracking-wider font-semibold block truncate">
                              {getCategoryDisplayLabel(work.category)}
                            </span>
                            <h4 className="font-serif text-xs font-bold text-stone-850 mt-0.5 truncate">
                              {work.title}
                            </h4>
                          </div>
                          <ChevronRight size={14} className="text-stone-400 group-hover:text-amber-600 transition shrink-0" />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* Lightbox Preview Modal */}
        <AnimatePresence>
          {lightboxItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxItem(null)}
                className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
                id="gallery-lightbox-backdrop"
              />

              {/* Box container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-4xl w-full bg-[#FAF9F6] border border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 h-[85vh] md:h-auto"
                id="gallery-lightbox-modal"
              >
                {/* Close Button */}
                <button
                  onClick={() => setLightboxItem(null)}
                  className="absolute top-3 right-3 z-20 rounded-full p-2 bg-white/80 text-stone-700 hover:bg-white hover:text-stone-950 transition shadow-sm cursor-pointer"
                  id="gallery-lightbox-close"
                >
                  <X size={16} />
                </button>

                {/* Visual */}
                <div className="md:w-1/2 h-1/2 md:h-[65vh] bg-stone-100 relative">
                  <img
                    src={lightboxItem.imageUrl}
                    alt={lightboxItem.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-95"
                  />
                  <span className="absolute bottom-3 left-3 bg-amber-600 text-stone-100 font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm max-w-[90%] truncate">
                    {getCategoryDisplayLabel(lightboxItem.category)}
                  </span>
                </div>

                {/* Info and CTA */}
                <div className="md:w-1/2 p-5 md:p-8 flex flex-col justify-between h-1/2 md:h-auto text-stone-900 bg-white">
                  <div className="space-y-3.5">
                    <div>
                      <p className="text-[9px] font-mono text-amber-700 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={10} /> Oluwashola Atelier Showcase
                      </p>
                      <h4 className="font-serif text-xl font-bold text-stone-900 mt-1">
                        {lightboxItem.title}
                      </h4>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-semibold text-stone-400 block">Classifications</span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(parseCategory(lightboxItem.category)).map(([key, val]) => {
                          if (!val) return null;
                          return (
                            <span key={key} className="px-2 py-0.5 bg-stone-100 text-stone-650 rounded-md font-mono text-[9px] border border-stone-200">
                              <span className="capitalize text-stone-400 mr-0.5">{key}:</span> {val}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      {lightboxItem.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setLightboxItem(null);
                        onClose();
                        onOpenOrder({ styleName: lightboxItem.title, styleCategory: getCategoryDisplayLabel(lightboxItem.category) });
                      }}
                      className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-center py-3 text-xs uppercase tracking-widest transition cursor-pointer shadow-md shadow-amber-500/10"
                      id="lightbox-order-btn"
                    >
                      Order Custom Recreation
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
