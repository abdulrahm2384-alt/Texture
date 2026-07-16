/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
        id="luxury-modal-backdrop"
      />

      {/* Modal content */}
      <motion.div
        initial={{ opacity: 0, scale: 1, y: "100%" }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full h-full md:max-w-5xl md:h-[85vh] flex flex-col overflow-hidden rounded-none md:rounded-3xl border-0 md:border border-amber-500/20 bg-[#FAF9F6] text-stone-900 shadow-2xl z-10"
        id="luxury-modal-content"
      >
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 shrink-0 bg-stone-100/60">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-[0.2em] text-amber-700 font-bold leading-none">
              {subtitle || "Oluwashola Textile Accessories"}
            </p>
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-stone-900 mt-2 leading-none">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            id="luxury-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 bg-stone-50/50">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
