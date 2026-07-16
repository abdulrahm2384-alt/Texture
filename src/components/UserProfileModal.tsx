/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Ruler, ClipboardList, Settings, User as UserIcon, Loader2, Save, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Order, Measurements } from "../types";
import { saveMeasurements, updateProfile, fetchMyOrders } from "../utils/api";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  fabrics: any[];
  styles: any[];
}

type TabType = "orders" | "measurements" | "profile";

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  fabrics,
  styles,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Profile Form States
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");

  // Measurement Form States
  const [measurements, setMeasurements] = useState<Measurements>({
    neck: user.measurements?.neck || undefined,
    chest: user.measurements?.chest || undefined,
    shoulder: user.measurements?.shoulder || undefined,
    sleeveLength: user.measurements?.sleeveLength || undefined,
    chestWidth: user.measurements?.chestWidth || undefined,
    waist: user.measurements?.waist || undefined,
    hip: user.measurements?.hip || undefined,
    gownLength: user.measurements?.gownLength || undefined,
    skirtLength: user.measurements?.skirtLength || undefined,
    trouserLength: user.measurements?.trouserLength || undefined,
    thigh: user.measurements?.thigh || undefined,
    ankle: user.measurements?.ankle || undefined,
    additionalNotes: user.measurements?.additionalNotes || "",
    measurementUnit: user.measurements?.measurementUnit || "inches",
  });

  useEffect(() => {
    if (isOpen) {
      loadOrders();
      // Reset state variables to current user values
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setMeasurements({
        neck: user.measurements?.neck || undefined,
        chest: user.measurements?.chest || undefined,
        shoulder: user.measurements?.shoulder || undefined,
        sleeveLength: user.measurements?.sleeveLength || undefined,
        chestWidth: user.measurements?.chestWidth || undefined,
        waist: user.measurements?.waist || undefined,
        hip: user.measurements?.hip || undefined,
        gownLength: user.measurements?.gownLength || undefined,
        skirtLength: user.measurements?.skirtLength || undefined,
        trouserLength: user.measurements?.trouserLength || undefined,
        thigh: user.measurements?.thigh || undefined,
        ankle: user.measurements?.ankle || undefined,
        additionalNotes: user.measurements?.additionalNotes || "",
        measurementUnit: user.measurements?.measurementUnit || "inches",
      });
      setMessage(null);
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await updateProfile({ name, phone, address });
      if (res.success) {
        onUserUpdate(res.user);
        setMessage({ text: "Profile details updated successfully", type: "success" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await saveMeasurements(measurements);
      if (res.success) {
        onUserUpdate({
          ...user,
          measurements: res.measurements,
        });
        setMessage({ text: "Tailoring measurements saved successfully", type: "success" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save measurements", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const getFabricName = (id?: string) => {
    if (!id) return "N/A";
    const f = fabrics.find((x) => x.id === id);
    return f ? f.name : "Custom Selected Fabric";
  };

  const getStyleName = (id?: string) => {
    if (!id) return "N/A";
    const s = styles.find((x) => x.id === id);
    return s ? s.name : "Bespoke Style";
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled":
        return "bg-stone-500/10 text-stone-400 border-stone-500/20";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/75 backdrop-blur-sm"
          id="user-profile-backdrop"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-[#FAF9F6] text-stone-900 shadow-2xl"
          id="user-profile-content"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Customer Salon
                </h3>
                <p className="text-xs text-stone-600">
                  {user.name} ({user.email})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-850 transition-colors cursor-pointer"
              id="user-profile-close-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50 px-4">
            <button
              onClick={() => {
                setActiveTab("orders");
                setMessage(null);
              }}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                activeTab === "orders"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-stone-500 hover:text-stone-850"
              }`}
              id="tab-orders-btn"
            >
              <ClipboardList size={16} />
              My Showroom Orders
            </button>
            <button
              onClick={() => {
                setActiveTab("measurements");
                setMessage(null);
              }}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                activeTab === "measurements"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-stone-500 hover:text-stone-850"
              }`}
              id="tab-measurements-btn"
            >
              <Ruler size={16} />
              Tailoring Measurements
            </button>
            <button
              onClick={() => {
                setActiveTab("profile");
                setMessage(null);
              }}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                activeTab === "profile"
                  ? "border-amber-600 text-amber-800"
                  : "border-transparent text-stone-500 hover:text-stone-850"
              }`}
              id="tab-profile-btn"
            >
              <Settings size={16} />
              Delivery Settings
            </button>
          </div>

          {/* Modal Body / Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F6]">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 rounded-xl border p-3.5 text-xs text-center font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
                id="profile-message-box"
              >
                {message.text}
              </motion.div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-4" id="orders-tab-content">
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-amber-600 mb-2" size={32} />
                    <p className="text-sm text-stone-600 font-mono">Loading order records...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-stone-250 rounded-2xl bg-white">
                    <ShoppingBag className="mx-auto text-stone-400 mb-3" size={40} />
                    <h4 className="font-serif text-base font-bold text-stone-800">No Orders Placed Yet</h4>
                    <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                      Explore available fabrics or choose a bespoke design style to submit your first showroom request.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-stone-200 bg-white p-4 relative overflow-hidden shadow-sm"
                      id={`order-card-${order.id}`}
                    >
                      <div className="flex items-start justify-between mb-3.5 pb-3 border-b border-stone-100">
                        <div>
                          <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                            Order Reference
                          </p>
                          <h5 className="text-sm font-bold font-mono text-amber-800">
                            {order.id}
                          </h5>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-stone-700">
                        <div>
                          <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Order Type</p>
                          <p className="font-semibold capitalize text-stone-850">
                            {order.orderType === "fabric_only"
                              ? "Fabric Only"
                              : order.orderType === "custom_tailoring"
                              ? "Custom Tailoring Only"
                              : "Fabric & Custom Tailoring"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Value</p>
                          <p className="font-serif font-bold text-amber-700 text-sm">
                            ₦{order.totalPrice.toLocaleString()}
                          </p>
                        </div>

                        {order.fabricId && (
                          <div className="md:col-span-2">
                            <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Selected Textile</p>
                            <p className="font-medium text-stone-850">
                              {getFabricName(order.fabricId)} {order.yardsOrdered && `(${order.yardsOrdered} Yards)`}
                            </p>
                          </div>
                        )}

                        {order.customStyleId && (
                          <div className="md:col-span-2">
                            <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Bespoke Design Style</p>
                            <p className="font-medium text-stone-850">{getStyleName(order.customStyleId)}</p>
                          </div>
                        )}

                        {order.selectedServices && order.selectedServices.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Embellishments & Crafts</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {order.selectedServices.map((serviceId) => {
                                const names: Record<string, string> = {
                                  monogramming: "Monogramming",
                                  beading: "Beading",
                                  stoning: "Stoning",
                                  sewing: "Sewing",
                                  laser_cut: "Laser Cut Design",
                                  cnc_router: "CNC Router Design",
                                  weaving: "Weaving",
                                  i_let: "I LET Stitching",
                                  button_holes: "Button Holes",
                                };
                                return (
                                  <span key={serviceId} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 text-[10px] border border-amber-500/20 font-medium">
                                    {names[serviceId] || serviceId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Delivery Service</p>
                          <p className="capitalize text-stone-850">
                            {order.deliveryType} {order.deliveryType === "delivery" && `to ${order.deliveryAddress}`}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-0.5">Placed On</p>
                          <p className="text-stone-600 font-mono">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {order.specialInstructions && (
                        <div className="mt-3.5 bg-stone-50 rounded-xl p-2.5 text-[11px] text-stone-600 border border-stone-150">
                          <span className="font-semibold text-stone-800">Special Instructions:</span> {order.specialInstructions}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: MEASUREMENTS */}
            {activeTab === "measurements" && (
              <form onSubmit={handleSaveMeasurements} className="space-y-6" id="measurements-tab-content">
                <div className="bg-amber-500/5 rounded-2xl border border-amber-500/10 p-4">
                  <h4 className="font-serif text-sm font-bold text-amber-850 mb-1 flex items-center gap-2">
                    <Ruler size={16} /> Body Specifications Setup
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Entering your body measurements guarantees the absolute perfect custom fit. These values will be saved to your secure profile room, allowing you to instantly order custom tailoring in the future without re-typing.
                  </p>
                </div>

                {/* Unit selector */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <span className="text-xs text-stone-850 font-medium">Measurement Standard</span>
                  <div className="flex rounded-lg bg-white p-0.5 border border-stone-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setMeasurements({ ...measurements, measurementUnit: "inches" })}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-md transition cursor-pointer ${
                        measurements.measurementUnit === "inches"
                          ? "bg-amber-500 text-stone-950"
                          : "text-stone-500 hover:text-stone-850"
                      }`}
                    >
                      Inches (in)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasurements({ ...measurements, measurementUnit: "cm" })}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-md transition cursor-pointer ${
                        measurements.measurementUnit === "cm"
                          ? "bg-amber-500 text-stone-950"
                          : "text-stone-500 hover:text-stone-850"
                      }`}
                    >
                      Centimeters (cm)
                    </button>
                  </div>
                </div>

                {/* Measurements Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Neck */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Neck Circumference
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={measurements.neck || ""}
                        onChange={(e) => setMeasurements({ ...measurements, neck: parseFloat(e.target.value) || undefined })}
                        placeholder="e.g. 15.5"
                        className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                      />
                    </div>
                  </div>

                  {/* Chest */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Chest Circumference
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.chest || ""}
                      onChange={(e) => setMeasurements({ ...measurements, chest: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 42"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Shoulder */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Shoulder Width
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.shoulder || ""}
                      onChange={(e) => setMeasurements({ ...measurements, shoulder: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 18.5"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Sleeve Length */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Sleeve Length
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.sleeveLength || ""}
                      onChange={(e) => setMeasurements({ ...measurements, sleeveLength: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 24"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Waist */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Waist Line
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.waist || ""}
                      onChange={(e) => setMeasurements({ ...measurements, waist: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 34"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Hip */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Hips Circumference
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.hip || ""}
                      onChange={(e) => setMeasurements({ ...measurements, hip: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 38"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Gown Length */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Gown/Kaftan Length
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.gownLength || ""}
                      onChange={(e) => setMeasurements({ ...measurements, gownLength: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 58"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Trouser Length */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Trouser/Pants Length
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements.trouserLength || ""}
                      onChange={(e) => setMeasurements({ ...measurements, trouserLength: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g. 41"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-3.5 py-2.5 text-sm outline-none text-stone-800"
                    />
                  </div>

                  {/* Additional notes */}
                  <div className="col-span-2 sm:col-span-3">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Anatomical Fit / Special Measurement Notes
                    </label>
                    <textarea
                      rows={3}
                      value={measurements.additionalNotes || ""}
                      onChange={(e) => setMeasurements({ ...measurements, additionalNotes: e.target.value })}
                      placeholder="e.g. Broader shoulders, request generous fit around biceps, preferred cuff style..."
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 p-3 text-xs outline-none text-stone-800 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-stone-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 text-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Measurements
                  </button>
                </div>
              </form>
            )}

            {/* TAB: PROFILE / SETTINGS */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4" id="profile-tab-content">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 px-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Default Shipping/Delivery Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Provide your main physical address for shipping custom fabrics or finished tailoring garments."
                    className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 p-4 text-sm text-stone-800 placeholder-stone-400 outline-none transition resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-stone-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 text-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Details
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
