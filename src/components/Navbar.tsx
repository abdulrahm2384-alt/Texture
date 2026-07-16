/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAbout: () => void;
  onOpenGallery: () => void;
  onOpenFabrics: () => void;
  onOpenStyles: () => void;
  onOpenOrder: () => void;
  onOpenContact: () => void;
}

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  onOpenProfile,
  onOpenAbout,
  onOpenGallery,
  onOpenFabrics,
  onOpenStyles,
  onOpenOrder,
  onOpenContact,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { name: "About", action: onOpenAbout },
    { name: "Showcase", action: onOpenGallery },
    { name: "Fabrics", action: onOpenFabrics },
    { name: "Styles", action: onOpenStyles },
    { name: "Place Order", action: onOpenOrder },
    { name: "Contact", action: onOpenContact },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? "bg-stone-950/90 backdrop-blur-md border-b border-stone-900 shadow-lg py-3"
          : "bg-stone-950/40 backdrop-blur-sm py-5"
      }`}
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Branding Brand Name */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none text-left p-0 outline-none"
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-full border border-amber-500 bg-stone-900 overflow-hidden text-amber-500 font-serif font-bold text-lg shadow-md transition group-hover:border-amber-400">
            <img
              src="/src/assets/images/oluwashola_logo_1784138680903.jpg"
              alt="OLUWASHOLA LOGO"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-serif">O</span>
          </div>
          <div className="leading-tight">
            <h1 className="font-serif text-[11px] md:text-xs font-bold tracking-[0.2em] text-amber-400 uppercase leading-none">
              OLUWASHOLA
            </h1>
            <p className="text-[8px] md:text-[9px] font-mono font-medium tracking-[0.15em] text-stone-400 uppercase mt-0.5">
              Textile Accessories & Tailoring
            </p>
          </div>
        </button>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={link.action}
              className="text-xs font-semibold uppercase tracking-widest transition-all duration-300 relative py-1 hover:text-amber-400 text-stone-300 cursor-pointer bg-transparent border-none outline-none"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onOpenOrder}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-full px-5 py-2.5 transition active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
            id="navbar-order-btn"
          >
            Book Atelier
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-stone-300 hover:text-amber-400 transition cursor-pointer"
            id="mobile-menu-trigger"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-stone-950 border-b border-stone-900 overflow-hidden shadow-2xl"
            id="mobile-navigation-drawer"
          >
            <div className="px-6 py-6 flex flex-col gap-5 bg-stone-950/95 backdrop-blur-lg">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    setIsOpen(false);
                    link.action();
                  }}
                  className="text-xs font-semibold uppercase tracking-widest py-2 text-left block text-stone-300 hover:text-amber-400 cursor-pointer bg-transparent border-none outline-none w-full"
                >
                  {link.name}
                </button>
              ))}

              <div className="pt-4 border-t border-stone-900 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenOrder();
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl py-3 cursor-pointer"
                >
                  Book Atelier Order
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
