/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Scissors, 
  Eye, 
  Sparkles, 
  Award, 
  Gem, 
  Flame, 
  Cpu, 
  Grid, 
  CircleDot, 
  Circle,
  ThumbsUp,
  Cpu as TechIcon,
  ShieldAlert,
  HeartHandshake
} from "lucide-react";
import Modal from "./Modal";

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGallery: () => void;
  onOpenOrder: () => void;
}

export default function About({ isOpen, onClose, onOpenGallery, onOpenOrder }: AboutProps) {
  const flyerServices = [
    {
      icon: <Award className="text-amber-500" size={20} />,
      title: "Monogramming",
      description: "Custom monograms that make a statement."
    },
    {
      icon: <Sparkles className="text-amber-500" size={20} />,
      title: "Beading",
      description: "Exquisite beading for a luxurious look."
    },
    {
      icon: <Gem className="text-amber-500" size={20} />,
      title: "Stoning",
      description: "Premium stoning that adds brilliance."
    },
    {
      icon: <Scissors className="text-amber-500" size={20} />,
      title: "Sewing",
      description: "Professional sewing with quality finishing."
    },
    {
      icon: <Flame className="text-amber-500" size={20} />,
      title: "Laser Cut Design",
      description: "Precision laser cutting for unique designs."
    },
    {
      icon: <Cpu className="text-amber-500" size={20} />,
      title: "CNC Router Design",
      description: "High-precision CNC routing for perfect detail."
    },
    {
      icon: <Grid className="text-amber-500" size={20} />,
      title: "Weaving",
      description: "Expert weaving for durable and beautiful fabrics."
    },
    {
      icon: <CircleDot className="text-amber-500" size={20} />,
      title: "I LET Stitching",
      description: "Neat and durable I let stitching for a perfect finish."
    },
    {
      icon: <Circle className="text-amber-500" size={20} />,
      title: "Button Holes",
      description: "Precision button holes stitched to perfection."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Award className="text-amber-400" size={24} />,
      title: "Exceptional Craftsmanship",
      description: "We pay attention to every detail to deliver the best."
    },
    {
      icon: <TechIcon className="text-amber-400" size={24} />,
      title: "Modern Technology",
      description: "Advanced machines for precision and perfection."
    },
    {
      icon: <Grid className="text-amber-400" size={24} />,
      title: "Quality Materials",
      description: "We use only the finest materials for lasting beauty."
    },
    {
      icon: <ThumbsUp className="text-amber-400" size={24} />,
      title: "Customer Satisfaction",
      description: "Your satisfaction is our highest priority."
    }
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tailoring Luxury & Preserving Heritage" subtitle="Our Legacy">
      <div className="space-y-12">
        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h4 className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-snug">
              Where Elegant Fabric Meets Exquisite Craftsmanship
            </h4>
            <p className="text-stone-700 text-sm md:text-base leading-relaxed">
              At <strong className="text-amber-700 font-semibold">Oluwashola Textile Accessories</strong>, we believe that fashion is not merely about clothing; it is a profound declaration of identity, status, and cultural pride. For years, we have stood at the intersection of premium raw textiles and high-fashion couture.
            </p>
            <p className="text-stone-700 text-sm md:text-base leading-relaxed">
              Our showroom houses the finest collection of Swiss laces, vibrant Ankara wax blocks, structured Damask brocades, and genuine cashmere. Our master tailors translate these premium fabrics into custom senator suits, majestic four-piece agbadas, and custom-boned corsets suited for weddings, corporate galas, and casual luxury.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  onClose();
                  onOpenOrder();
                }}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-stone-950 px-6 py-3 rounded-full transition-all duration-300 cursor-pointer shadow-md shadow-amber-500/10"
              >
                Request Consultation
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onOpenGallery();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest border border-stone-300 hover:border-amber-600 px-6 py-3 rounded-full text-stone-700 hover:text-amber-700 transition-all duration-300 cursor-pointer bg-white shadow-sm"
              >
                <Eye size={13} />
                View Finished Works
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative pt-4 lg:pt-0">
            {/* Visual Frame */}
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl relative border border-stone-200 bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1558603668-6570496b66f8?auto=format&fit=crop&q=80&w=800"
                alt="Master tailor measuring premium fabrics"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition duration-700 hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-stone-950/10 to-transparent" />
            </div>

            {/* Float badge */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-stone-200/80 text-stone-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <span className="font-serif text-2xl font-bold text-amber-600">100%</span>
              <div className="leading-tight">
                <p className="text-[9px] uppercase font-mono tracking-widest text-stone-500">Bespoke Fit</p>
                <p className="text-[11px] font-bold text-amber-700">Guaranteed Studio Cut</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Services Section (From Flyer) */}
        <div className="space-y-6 pt-6 border-t border-stone-200/80">
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-amber-700 font-bold">
              Our Professional Services
            </span>
            <h5 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
              Premium Textile & Tailoring Capabilities
            </h5>
            <p className="text-xs text-stone-500 mt-1">
              We leverage expert hands and cutting-edge machines to deliver absolute perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="flyer-services-grid">
            {flyerServices.map((service, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2, borderColor: "rgba(245, 158, 11, 0.4)" }}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex items-start gap-3.5 transition duration-300"
              >
                <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-600">
                  {service.icon}
                </div>
                <div>
                  <h6 className="font-serif text-xs font-bold text-stone-850 uppercase tracking-wide">
                    {service.title}
                  </h6>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed font-light font-sans">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section (From Flyer) */}
        <div className="space-y-6 pt-8 border-t border-stone-200/80">
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-amber-700 font-bold">
              Why Choose Us?
            </span>
            <h5 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
              Turning Ideas Into Timeless Creations
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="why-choose-us-grid">
            {whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-b from-white to-stone-50/50 border border-stone-250 shadow-md text-center flex flex-col items-center gap-3"
              >
                <div className="h-11 w-11 flex items-center justify-center rounded-full bg-amber-500/5 border border-amber-500/10 mb-1 text-amber-600">
                  {item.icon}
                </div>
                <h6 className="font-serif text-xs font-bold text-stone-850 uppercase tracking-wide">
                  {item.title}
                </h6>
                <p className="text-[11px] text-stone-500 leading-relaxed font-light font-sans">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

