/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShoppingBag, Check, Sparkles, X, User as UserIcon } from "lucide-react";
import { Fabric } from "../types";
import Modal from "./Modal";

interface FabricsProps {
  isOpen: boolean;
  onClose: () => void;
  fabrics: Fabric[];
  onOpenOrder: (detail: { fabricId: string; yards: number; color: string; gender?: string; ageGroup?: string }) => void;
}

export default function Fabrics({ isOpen, onClose, fabrics, onOpenOrder }: FabricsProps) {
  // Store yard selections for each fabric
  const [selections, setSelections] = useState<Record<string, { yards: number; color: string }>>({});
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterGender, setFilterGender] = useState<string>("All");
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>("All");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Order customization prompt modal overlay state
  const [activePromptFabric, setActivePromptFabric] = useState<Fabric | null>(null);
  const [promptGender, setPromptGender] = useState<string>("Male");
  const [promptAge, setPromptAge] = useState<string>("Adult");

  const formatQtyWithUnit = (qty: number, unit?: string) => {
    const u = unit || "Yard";
    if (qty === 1) return `1 ${u}`;
    const lower = u.toLowerCase();
    if (lower.endsWith("s") || lower.includes("dozen") || lower.includes("pack") || lower.includes("set") || lower.includes("unit") || lower.includes("piece")) {
      return `${qty} ${u}`;
    }
    return `${qty} ${u}s`;
  };

  const handleYardChange = (fabricId: string, yards: number) => {
    const selectedColor = selections[fabricId]?.color || fabrics.find((f) => f.id === fabricId)?.availableColors[0] || "";
    setSelections({
      ...selections,
      [fabricId]: { yards, color: selectedColor },
    });
  };

  const handleColorChange = (fabricId: string, color: string) => {
    const targetFabric = fabrics.find((f) => f.id === fabricId);
    const currentYards = selections[fabricId]?.yards || (targetFabric?.minOrderQty || 1);
    setSelections({
      ...selections,
      [fabricId]: { yards: currentYards, color },
    });
  };

  const getSelection = (fabricId: string, fabric: Fabric) => {
    const defaultQty = fabric.minOrderQty || 1;
    return selections[fabricId] || { yards: defaultQty, color: fabric.availableColors[0] || "" };
  };

  const triggerOrder = (fabric: Fabric) => {
    const spec = getSelection(fabric.id, fabric);
    
    // Check if fabric has multiple categories/demographics option (e.g. is 'All' or empty)
    const worksForBothGenders = !fabric.gender || fabric.gender === "All";
    const worksForAllAges = !fabric.ageGroup || fabric.ageGroup === "All";

    if (worksForBothGenders || worksForAllAges) {
      // Set active fabric to show demographics prompt
      setActivePromptFabric(fabric);
      
      // Determine what specific genders/ages exist in the catalog to use as options
      const catalogGenders = Array.from(new Set(fabrics.map((f) => f.gender).filter((g) => g && g !== "All" && g !== "")));
      const genderOptions = catalogGenders.length > 0 ? catalogGenders : ["Male", "Female"];
      
      const catalogAges = Array.from(new Set(fabrics.map((f) => f.ageGroup).filter((a) => a && a !== "All" && a !== "")));
      const ageOptions = catalogAges.length > 0 ? catalogAges : ["Young", "Teenagers", "Adult", "Elder"];

      // Setup sensible initial prompt selection defaults
      setPromptGender(worksForBothGenders ? genderOptions[0] : (fabric.gender || genderOptions[0]));
      setPromptAge(worksForAllAges ? ageOptions[0] : (fabric.ageGroup || ageOptions[0]));
    } else {
      // Exactly 1 specific category configuration, go directly!
      onClose();
      onOpenOrder({
        fabricId: fabric.id,
        yards: spec.yards,
        color: spec.color,
        gender: fabric.gender,
        ageGroup: fabric.ageGroup,
      });
    }
  };

  const handleConfirmPromptOrder = () => {
    if (!activePromptFabric) return;
    const spec = getSelection(activePromptFabric.id, activePromptFabric);
    
    onClose();
    onOpenOrder({
      fabricId: activePromptFabric.id,
      yards: spec.yards,
      color: spec.color,
      gender: activePromptFabric.gender === "All" || !activePromptFabric.gender ? promptGender : (activePromptFabric.gender || promptGender),
      ageGroup: activePromptFabric.ageGroup === "All" || !activePromptFabric.ageGroup ? promptAge : (activePromptFabric.ageGroup || promptAge),
    });
    
    // Reset states
    setActivePromptFabric(null);
  };

  if (!isOpen) return null;

  // Extract unique categories dynamically based on actual fabric listings
  const uniqueCategories = ["All", ...Array.from(new Set(fabrics.map((f) => f.category).filter(Boolean)))];
  const uniqueGenders = ["All", ...Array.from(new Set(fabrics.map((f) => f.gender).filter(Boolean)))];
  const uniqueAgeGroups = ["All", ...Array.from(new Set(fabrics.map((f) => f.ageGroup).filter(Boolean)))];

  const filteredFabrics = fabrics.filter((fabric) => {
    if (filterCategory !== "All" && fabric.category !== filterCategory) return false;
    if (filterGender !== "All" && fabric.gender !== "All" && fabric.gender !== filterGender) return false;
    if (filterAgeGroup !== "All" && fabric.ageGroup !== "All" && fabric.ageGroup !== filterAgeGroup) return false;
    
    if (searchKeyword.trim() !== "") {
      const keyword = searchKeyword.toLowerCase();
      const nameMatch = fabric.name.toLowerCase().includes(keyword);
      const descMatch = fabric.description.toLowerCase().includes(keyword);
      const catMatch = fabric.category.toLowerCase().includes(keyword);
      const genderMatch = fabric.gender?.toLowerCase().includes(keyword) || false;
      const ageMatch = fabric.ageGroup?.toLowerCase().includes(keyword) || false;
      if (!nameMatch && !descMatch && !catMatch && !genderMatch && !ageMatch) return false;
    }
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bespoke Boutique & Supplies" subtitle="Exclusive Catalog">
      <div className="space-y-8 relative">
        <p className="text-xs text-stone-600 leading-relaxed -mt-4">
          Explore our premium selection of tailored ready-to-wear garments, designer fashioning accessories, and professional tailoring supplies. Order directly online for hand-crafted delivery.
        </p>

        {fabrics.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-5 my-6 shadow-sm">
            <div className="h-16 w-16 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 tracking-wide">
                Boutique & supplies Opening Soon
              </h3>
              <p className="text-xs text-stone-500 font-mono uppercase tracking-widest">
                Store Catalog Status: Restocking
              </p>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
              Welcome to our boutique and tailoring supplies store! This portal showcases premium ready-to-wear apparel, designer accessories, tailoring tools, and exquisite luxury fabrics.
            </p>
            <div className="border-t border-stone-200/60 pt-4 text-xs text-stone-550 leading-relaxed">
              We are currently loading our exclusive designer pieces. You can still commission any custom wear, monogramming, or beading directly via the Booking panel.
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenOrder({ fabricId: "custom", yards: 1, color: "As requested" });
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md shadow-amber-500/10"
              >
                Place Custom Order
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Filter toolbar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4 shadow-sm" id="fabrics-filter-panel">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-mono font-bold text-stone-700 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-amber-600" /> Filter & Search Boutique Shop
                </span>
                {(filterCategory !== "All" || filterGender !== "All" || filterAgeGroup !== "All" || searchKeyword !== "") && (
                  <button
                    onClick={() => {
                      setFilterCategory("All");
                      setFilterGender("All");
                      setFilterAgeGroup("All");
                      setSearchKeyword("");
                    }}
                    className="text-[10px] font-mono font-bold text-amber-700 hover:text-amber-900 uppercase tracking-wider underline cursor-pointer bg-transparent border-none"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Product Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:border-amber-500/50 font-medium cursor-pointer"
                  >
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender Filter */}
                {uniqueGenders.length > 1 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Gender</label>
                    <select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:border-amber-500/50 font-medium cursor-pointer"
                    >
                      {uniqueGenders.map((g) => (
                        <option key={g} value={g}>
                          {g === "All" ? "All Genders" : g}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Age Group Filter */}
                {uniqueAgeGroups.length > 1 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Age Group</label>
                    <select
                      value={filterAgeGroup}
                      onChange={(e) => setFilterAgeGroup(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-850 focus:outline-none focus:border-amber-500/50 font-medium cursor-pointer"
                    >
                      {uniqueAgeGroups.map((a) => (
                        <option key={a} value={a}>
                          {a === "All" ? "All Ages" : a}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Keyword Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-semibold text-stone-550 block">Search Keywords</label>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="e.g. Senator, Shears, Lace, Velvet..."
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Fabrics Grid */}
            {filteredFabrics.length === 0 ? (
              <div className="text-center py-16 text-stone-500 font-mono text-xs">
                No boutique items found matching your selected criteria.
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
                        {/* Demographic & Category Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[70%] text-left">
                          <span className="bg-white/95 backdrop-blur-sm text-amber-800 font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-stone-200 font-bold shadow-sm">
                            {fabric.category}
                          </span>
                          {fabric.gender && fabric.gender !== "All" && (
                            <span className="bg-white/95 backdrop-blur-sm text-stone-700 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-stone-200 font-semibold shadow-sm">
                              {fabric.gender}
                            </span>
                          )}
                          {fabric.ageGroup && fabric.ageGroup !== "All" && (
                            <span className="bg-white/95 backdrop-blur-sm text-stone-700 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-stone-200 font-semibold shadow-sm">
                              {fabric.ageGroup}
                            </span>
                          )}
                        </div>

                        {/* Stock Badges */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-white/95 backdrop-blur-sm shadow-sm ${
                              fabric.stockAvailability === "In Stock"
                                ? "text-emerald-600 border-emerald-500/25"
                                : fabric.stockAvailability === "Low Stock"
                                ? "text-amber-700 border-amber-500/25"
                                : "text-stone-600 border-stone-250"
                            }`}
                          >
                            {fabric.stockAvailability}
                          </span>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-4.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 text-left">
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
                          <div className="text-left">
                            <span className="block text-[9px] uppercase font-mono tracking-widest text-stone-500 mb-1.5">
                              Selected Color / Style: <strong className="text-stone-850 font-semibold">{spec.color}</strong>
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

                          {/* Units required */}
                          <div className="text-left">
                            <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-widest text-stone-500 mb-1">
                              <span>Quantity Requested</span>
                              <span className="font-semibold text-amber-700">
                                {formatQtyWithUnit(spec.yards, fabric.pricingUnit)}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={fabric.minOrderQty || 1}
                              max={fabric.maxOrderQty || Math.max(10, fabric.minOrderQty || 10)}
                              step="1"
                              disabled={isOutOfStock}
                              value={spec.yards}
                              onChange={(e) => handleYardChange(fabric.id, parseInt(e.target.value) || 1)}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg outline-none disabled:opacity-30"
                            />
                            {fabric.minOrderQty && fabric.minOrderQty > 1 ? (
                              <p className="text-[9px] text-stone-400 font-mono mt-1">
                                Minimum Order: {fabric.minOrderQty} {fabric.pricingUnit || "Unit"}{fabric.minOrderQty > 1 ? "s" : ""}
                              </p>
                            ) : null}
                          </div>

                          <div className="border-t border-stone-100 py-2.5 flex items-center justify-between text-xs text-left">
                            <span className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Unit Price</span>
                            <span className="font-serif font-bold text-stone-850">
                              ₦{fabric.pricePerYard.toLocaleString()} / {fabric.pricingUnit || "Yard"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-[9px] uppercase font-mono text-stone-500">
                              {spec.yards > 1 ? "Calculated Price" : "Total Price"}
                            </p>
                            <p className="font-serif text-base font-bold text-amber-700 leading-none">
                              ₦{totalPrice.toLocaleString()}
                            </p>
                            {spec.yards > 1 && (
                              <p className="text-[9px] text-stone-500 font-mono mt-0.5 animate-fadeIn">
                                ₦{fabric.pricePerYard.toLocaleString()} × {spec.yards} ({fabric.pricingUnit || "Yard"}{spec.yards > 1 ? "s" : ""})
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => triggerOrder(fabric)}
                            disabled={isOutOfStock}
                            className="px-4 py-2 bg-stone-50 hover:bg-amber-500 text-amber-700 hover:text-stone-950 text-[11px] font-bold uppercase tracking-widest rounded-xl border border-stone-200 hover:border-amber-500 transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm hover:shadow"
                          >
                            <ShoppingBag size={12} />
                            Order Now
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

        {/* ---------------- DEMOGRAPHIC SPECIFICATION DIALOG OVERLAY ---------------- */}
        {activePromptFabric && (
          <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden text-stone-900 animate-scaleUp">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <span className="p-2 bg-amber-500/10 text-amber-700 rounded-xl">
                    <UserIcon size={18} />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">Configure Demographic</h3>
                    <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">Demographic Selection Required</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePromptFabric(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 transition rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 text-left">
                <p className="text-xs text-stone-600 leading-relaxed">
                  The item <strong className="text-stone-900">"{activePromptFabric.name}"</strong> supports multiple target configurations. Please specify who you are ordering this for so we can tailor the request perfectly:
                </p>

                {/* Gender Category Option */}
                {(!activePromptFabric.gender || activePromptFabric.gender === "All") && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-bold block">
                      Who is this for? (Gender Style)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Array.from(new Set(fabrics.map((f) => f.gender).filter((g) => g && g !== "All" && g !== ""))).length > 0
                        ? Array.from(new Set(fabrics.map((f) => f.gender).filter((g) => g && g !== "All" && g !== "")))
                        : ["Male", "Female"]
                      ).map((genderVal) => {
                        const isSelected = promptGender === genderVal;
                        return (
                          <button
                            key={genderVal}
                            type="button"
                            onClick={() => setPromptGender(genderVal)}
                            className={`py-2 px-4 rounded-xl border text-xs font-semibold tracking-wider uppercase transition cursor-pointer text-center ${
                              isSelected
                                ? "bg-amber-500/10 border-amber-500 text-amber-800 shadow-sm font-bold"
                                : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                            }`}
                          >
                            {genderVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Age group Category Option */}
                {(!activePromptFabric.ageGroup || activePromptFabric.ageGroup === "All") && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-bold block">
                      Target Age Group Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(Array.from(new Set(fabrics.map((f) => f.ageGroup).filter((a) => a && a !== "All" && a !== ""))).length > 0
                        ? Array.from(new Set(fabrics.map((f) => f.ageGroup).filter((a) => a && a !== "All" && a !== "")))
                        : ["Young", "Teenagers", "Adult", "Elder"]
                      ).map((ageVal) => {
                        const isSelected = promptAge === ageVal;
                        return (
                          <button
                            key={ageVal}
                            type="button"
                            onClick={() => setPromptAge(ageVal)}
                            className={`py-2 px-4 rounded-xl border text-xs font-semibold tracking-wider uppercase transition cursor-pointer text-center ${
                              isSelected
                                ? "bg-amber-500/10 border-amber-500 text-amber-800 shadow-sm font-bold"
                                : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                            }`}
                          >
                            {ageVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-stone-50 border-t border-stone-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActivePromptFabric(null)}
                  className="flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPromptOrder}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-mono font-bold uppercase tracking-widest rounded-xl shadow cursor-pointer text-center"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
