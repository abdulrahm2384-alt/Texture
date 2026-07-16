/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowUp } from "lucide-react";

interface FooterProps {
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const scrolltoTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Upper footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-full border border-amber-500 bg-stone-900 text-amber-500 font-serif font-bold text-sm shadow-md">
              O
            </div>
            <div className="leading-tight">
              <h2 className="font-serif text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">
                OLUWASHOLA
              </h2>
              <p className="text-[8px] font-mono tracking-[0.1em] text-stone-500 uppercase">
                Textile Accessories & Tailoring
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-mono uppercase tracking-widest text-stone-500">
            <a href="#about" className="hover:text-amber-400 transition">About Us</a>
            <a href="#gallery" className="hover:text-amber-400 transition">Bespoke Gallery</a>
            <a href="#fabrics" className="hover:text-amber-400 transition">Fabrics</a>
            <a href="#order" className="hover:text-amber-400 transition">Order Intake</a>
          </div>

          <button
            onClick={scrolltoTop}
            className="flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-widest text-stone-500 hover:text-amber-400 transition"
            id="footer-back-to-top"
          >
            Scroll to Top
            <ArrowUp size={11} className="text-amber-500" />
          </button>
        </div>

        {/* Lower footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-[11px] text-stone-600">
          <p>© {new Date().getFullYear()} OLUWASHOLA TEXTILE ACCESSORIES. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-stone-500 hover:text-amber-500 font-mono text-[10px] tracking-wider uppercase transition cursor-pointer"
              id="admin-portal-link-btn"
            >
              Admin Portal
            </button>
            <span>•</span>
            <span>Bespoke African Couture</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
