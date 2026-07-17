/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Scissors, Sparkles, BookOpen, Eye, Palette, Shirt, ShoppingBag, MapPin, ChevronRight } from "lucide-react";

interface HeroProps {
  onOpenAbout: () => void;
  onOpenGallery: () => void;
  onOpenFabrics: () => void;
  onOpenStyles: () => void;
  onOpenOrder: () => void;
  onOpenContact: () => void;
  logoUrl?: string;
  heroBgUrl?: string;
  wingAboutBgUrl?: string;
  wingGalleryBgUrl?: string;
  wingFabricsBgUrl?: string;
  wingStylesBgUrl?: string;
  wingOrderBgUrl?: string;
  wingContactBgUrl?: string;
}

export default function Hero({
  onOpenAbout,
  onOpenGallery,
  onOpenFabrics,
  onOpenStyles,
  onOpenOrder,
  onOpenContact,
  logoUrl,
  heroBgUrl,
  wingAboutBgUrl,
  wingGalleryBgUrl,
  wingFabricsBgUrl,
  wingStylesBgUrl,
  wingOrderBgUrl,
  wingContactBgUrl,
}: HeroProps) {

  const showroomWings = [
    {
      title: "Our Legacy",
      description: "Read our journey of tailoring luxury and sourcing authentic premium Swiss lace, Ankara and cashmere.",
      icon: <BookOpen className="text-amber-500" size={18} />,
      badge: "Heritage",
      image: wingAboutBgUrl || "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600",
      action: onOpenAbout,
    },
    {
      title: "Bespoke Showcase",
      description: "Browse completed wedding, custom senator wears, and ceremonial agbadas on real clients.",
      icon: <Eye className="text-amber-500" size={18} />,
      badge: "Completed fits",
      image: wingGalleryBgUrl || "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600",
      action: onOpenGallery,
    },
    {
      title: "Luxury Fabrics",
      description: "Enter yardages and inspect genuine premium imported lace, damask, and cashmere textile rolls.",
      icon: <Palette className="text-amber-500" size={18} />,
      badge: "100+ Catalogues",
      image: wingFabricsBgUrl || "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=600",
      action: onOpenFabrics,
    },
    {
      title: "Style Inspirations",
      description: "Review premium cuts, neck silhouette trends, and customized patterns curated for Nigerian occasions.",
      icon: <Shirt className="text-amber-500" size={18} />,
      badge: "Bespoke cuts",
      image: wingStylesBgUrl || "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600",
      action: onOpenStyles,
    },
    {
      title: "Book Tailoring Fit",
      description: "Initiate custom measurements, choose sizes, and book tailoring orders for your upcoming Owambe.",
      icon: <ShoppingBag className="text-amber-500" size={18} />,
      badge: "Submit intake",
      image: wingOrderBgUrl || "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600",
      action: onOpenOrder,
    },
    {
      title: "Contact Marina Studio",
      description: "Get physical studio coordinates, digital maps, and launch our live interactive WhatsApp desk.",
      icon: <MapPin className="text-amber-500" size={18} />,
      badge: "Open desk",
      image: wingContactBgUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
      action: onOpenContact,
    }
  ];

  return (
    <div className="bg-stone-950 text-stone-100">
      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background Graphic Asset */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={heroBgUrl || "/src/assets/images/textile_hero_1784138693639.jpg"}
            alt="Luxury fabrics draping backdrop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/80" />
        </div>

        {/* Decorative luxury sparkles */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
          <div className="absolute top-[25%] left-[15%] w-1.5 h-1.5 rounded-full bg-amber-400 blur-[1px] animate-pulse" />
          <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber-300 blur-[1px] animate-pulse" />
          <div className="absolute bottom-[30%] left-[30%] w-1 h-1 rounded-full bg-amber-200 blur-[1px] animate-pulse" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-[10px] uppercase tracking-widest font-mono text-amber-400 mb-6"
          >
            <Sparkles size={11} className="text-amber-500 animate-spin" />
            Bespoke Couture & Textiles
          </motion.div>

          {/* Brand Crest */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-amber-500/40 bg-stone-900 p-1 shadow-2xl relative flex items-center justify-center">
              <img
                src={logoUrl || "/src/assets/images/oluwashola_logo_1784138680903.jpg"}
                alt="OLUWASHOLA LOGO"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover rounded-full"
              />
              <div className="absolute -top-1 px-1.5 bg-stone-950 border border-amber-500/30 rounded text-[8px] text-amber-500 uppercase tracking-widest">
                Luxe
              </div>
            </div>
          </motion.div>

          {/* Business Title */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider leading-tight text-white"
            id="hero-business-name"
          >
            OLUWASHOLA
            <span className="block font-sans text-xs md:text-sm lg:text-base font-light tracking-[0.35em] text-amber-400 uppercase mt-3">
              Textile Accessories & Tailoring Studio
            </span>
          </motion.h2>

          {/* Intro */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-stone-300 text-xs md:text-sm max-w-2xl mx-auto mt-6 leading-relaxed font-light"
            id="hero-intro-text"
          >
            Importers of royal textiles, high-density Swiss laces, master-loomed Yoruba Aso Oke, and custom ceremonial agbada & senator tailoring. Welcome to the elite Lagos atelier.
          </motion.p>

          {/* Quick Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            id="hero-cta-buttons"
          >
            <button
              onClick={onOpenFabrics}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs uppercase tracking-widest font-bold rounded-full transition-all duration-300 shadow-xl shadow-amber-500/10 active:scale-95 cursor-pointer"
            >
              Browse Fabrics
            </button>
            <button
              onClick={onOpenOrder}
              className="w-full sm:w-auto px-8 py-3 border border-stone-700 bg-stone-950/40 hover:bg-stone-900 hover:border-amber-500/40 text-stone-200 text-xs uppercase tracking-widest font-bold rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scissors size={13} className="text-amber-500" />
              Order Tailoring
            </button>
          </motion.div>
        </div>
      </section>

      {/* Showroom Interactive Bento Deck Grid */}
      <section className="py-16 md:py-24 bg-stone-950 border-t border-stone-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.25em] font-mono text-amber-500 font-bold mb-2">
              Explore Our Atelier
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
              The Grand Showroom Wings
            </h3>
            <p className="text-xs text-stone-400 mt-2">
              Select any of the dedicated interactive suites below to inspect fabric details, view finished client works, or begin tailoring drafts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="showroom-deck-grid">
            {showroomWings.map((wing, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8)" }}
                onClick={wing.action}
                className="rounded-3xl bg-stone-900/60 border border-stone-850 hover:border-amber-500/25 cursor-pointer flex flex-col overflow-hidden transition-all duration-300 group shadow-lg"
              >
                {/* Top Image Part */}
                <div className="relative h-44 w-full overflow-hidden border-b border-stone-850/40 select-none">
                  <img
                    src={wing.image}
                    alt={wing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Luxury Ambient Shading Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
                  
                  {/* Floating Wing Badge */}
                  <span className="absolute top-4 right-4 text-[8px] font-mono tracking-wider text-amber-400 bg-stone-950/85 backdrop-blur-md px-2.5 py-1 rounded-full uppercase border border-amber-500/15 shadow-sm">
                    {wing.badge}
                  </span>
                </div>

                {/* Bottom Content Part */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-gradient-to-b from-transparent to-stone-900/30">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-amber-500/5 text-amber-500 border border-amber-500/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all duration-300 shrink-0">
                        {wing.icon}
                      </div>
                      <h4 className="font-serif text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors tracking-wide">
                        {wing.title}
                      </h4>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed font-light">
                      {wing.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-500 group-hover:translate-x-1.5 transition-transform duration-300 self-start">
                    <span>Enter wing</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
