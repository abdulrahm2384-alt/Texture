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

// Industrial machinery showcase image paths
const defaultMonogramMachineImg = "/src/assets/images/monogram_machine_1784385472639.jpg";
const defaultLaserCutMachineImg = "/src/assets/images/laser_cut_machine_1784385486693.jpg";
const defaultClotheBeadingMachineImg = "/src/assets/images/clothe_beading_machine_1784385501880.jpg";
const defaultStoningMachineImg = "/src/assets/images/stoning_machine_1784385517517.jpg";
const defaultCncDesktopRouterImg = "/src/assets/images/cnc_desktop_router_1784385532391.jpg";

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGallery: () => void;
  onOpenOrder: () => void;
  monogramMachineImg?: string;
  laserCutMachineImg?: string;
  clotheBeadingMachineImg?: string;
  stoningMachineImg?: string;
  cncDesktopRouterImg?: string;
}

export default function About({ 
  isOpen, 
  onClose, 
  onOpenGallery, 
  onOpenOrder,
  monogramMachineImg,
  laserCutMachineImg,
  clotheBeadingMachineImg,
  stoningMachineImg,
  cncDesktopRouterImg
}: AboutProps) {
  const flyerServices = [
    {
      icon: <Award className="text-amber-500" size={20} />,
      title: "Eyelet & Button Holes",
      description: "Neat and durable industrial eyelet installation & button holes stitched to perfection."
    },
    {
      icon: <Award className="text-amber-500" size={20} />,
      title: "Monogram Embroidery",
      description: "Computerized monogram embroidery for uniforms, apparel, towels, and branding."
    },
    {
      icon: <Flame className="text-amber-500" size={20} />,
      title: "Laser Cutting",
      description: "Precision laser fabric cutting and engraving for intricate and creative shapes."
    },
    {
      icon: <Cpu className="text-amber-500" size={20} />,
      title: "CNC Router Cutting",
      description: "High-precision CNC routing and garment panel templates designed with absolute accuracy."
    },
    {
      icon: <Sparkles className="text-amber-500" size={20} />,
      title: "Garment Beading & Stoning",
      description: "Premium crystal stoning, beadwork, and embellishments for custom luxury designs."
    },
    {
      icon: <Scissors className="text-amber-500" size={20} />,
      title: "Industrial Sewing",
      description: "Professional high-volume apparel sewing and garment assembly with clean finishing."
    },
    {
      icon: <Gem className="text-amber-500" size={20} />,
      title: "Custom Patches & Embroidery",
      description: "High-density custom patches and complex detailed embroidery for groups or brands."
    },
    {
      icon: <Grid className="text-amber-500" size={20} />,
      title: "Garment Accessories Supply",
      description: "Direct supply of premium eyelets, custom buttons, zippers, rhinestones, and trims."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Award className="text-amber-400" size={24} />,
      title: "Exceptional Reliability",
      description: "We work carefully on every order to deliver consistent, flawless finishing on time."
    },
    {
      icon: <TechIcon className="text-amber-400" size={24} />,
      title: "Advanced Machinery",
      description: "Computerized monogramming, laser cutting, and CNC router machinery for perfect precision."
    },
    {
      icon: <Grid className="text-amber-400" size={24} />,
      title: "Premium Accessories",
      description: "We supply only the finest raw accessories, ensuring long-lasting garment durability."
    },
    {
      icon: <ThumbsUp className="text-amber-400" size={24} />,
      title: "Lagos Industry Choice",
      description: "Trusted by top fashion designers, tailoring shops, schools, and corporate groups."
    }
  ];

  const machineryItems = [
    {
      name: "Monogram Machine",
      description: "Multi-needle computerized industrial monogram system for high-density embroidery, custom branding, and logo patches.",
      image: monogramMachineImg || defaultMonogramMachineImg,
      spec: "12-Needle Auto-Color Change"
    },
    {
      name: "Laser Cut Machine",
      description: "High-power CO2 laser cutters that slice through fabrics with incredible detail for intricate shapes and custom lace borders.",
      image: laserCutMachineImg || defaultLaserCutMachineImg,
      spec: "0.1mm Tolerances"
    },
    {
      name: "Clothe Beading Machine",
      description: "Automated touch-screen bead and pearl setting machinery that rivets premium embellishments onto garments with secure metal backings.",
      image: clotheBeadingMachineImg || defaultClotheBeadingMachineImg,
      spec: "Dual-Feeder Bead Riveter"
    },
    {
      name: "Stoning Machine",
      description: "Professional hot-fix rhinestone setter utilizing automatic templates and heat presses to apply sparkling crystal patterns onto luxury apparel.",
      image: stoningMachineImg || defaultStoningMachineImg,
      spec: "Ultrasonic Bonding System"
    },
    {
      name: "CNC Desktop Router Machine",
      description: "Heavy-duty computerized rotary carving router used to shape custom rigid garment templates, design stencils, and boutique accessory molds.",
      image: cncDesktopRouterImg || defaultCncDesktopRouterImg,
      spec: "3D Engraving Precision"
    }
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lagos Leading Textile Finishing & Accessories Studio" subtitle="Our Legacy">
      <div className="space-y-12">
        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h4 className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-snug">
              Professional Finishing & Garment Accessories
            </h4>
            <p className="text-stone-700 text-sm md:text-base leading-relaxed">
              Based in Lagos, Nigeria, <strong className="text-amber-700 font-semibold">Oluwashola Textiles</strong> is a professional textile finishing and garment accessories company. We support fashion designers, tailoring shops, garment manufacturers, schools, corporate organizations, and individuals with state-of-the-art decorative and structural apparel solutions.
            </p>
            <p className="text-stone-700 text-sm md:text-base leading-relaxed">
              We leverage advanced machinery and expert hands to perform meticulous, high-density monogram embroidery, laser cutting, CNC router fabric templating, custom embroidery patches, button holing, and heavy metal eyelet installations. We also serve as a key bulk supplier of premium garment accessories and accessories components across Nigeria.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  onClose();
                  onOpenOrder();
                }}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-stone-950 px-6 py-3 rounded-full transition-all duration-300 cursor-pointer shadow-md shadow-amber-500/10"
              >
                Inquire & Book Service
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onOpenGallery();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest border border-stone-300 hover:border-amber-600 px-6 py-3 rounded-full text-stone-700 hover:text-amber-700 transition-all duration-300 cursor-pointer bg-white shadow-sm"
              >
                <Eye size={13} />
                View Finishing Showcase
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative pt-4 lg:pt-0">
            {/* Visual Frame */}
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl relative border border-stone-200 bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800"
                alt="Professional industrial embroidery machine"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition duration-700 hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-stone-950/10 to-transparent" />
            </div>

            {/* Float badge */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-stone-200/80 text-stone-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <span className="font-serif text-2xl font-bold text-amber-600">100%</span>
              <div className="leading-tight">
                <p className="text-[9px] uppercase font-mono tracking-widest text-stone-500">Quality</p>
                <p className="text-[11px] font-bold text-amber-700">Guaranteed Finishing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Services Section (From Flyer) */}
        <div className="space-y-6 pt-6 border-t border-stone-200/80">
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-amber-700 font-bold">
              Our Core Services
            </span>
            <h5 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
              Textile Finishing & Garment Accessories
            </h5>
            <p className="text-xs text-stone-500 mt-1">
              We leverage expert hands and cutting-edge computerized machines to deliver absolute reliability.
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

        {/* Our Industrial Machinery Section */}
        <div className="space-y-6 pt-8 border-t border-stone-200/80">
          <div className="text-center md:text-left">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-amber-700 font-bold">
              Production Powerhouse
            </span>
            <h5 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
              Our Advanced Industrial Machinery
            </h5>
            <p className="text-xs text-stone-500 mt-1">
              We own and operate state-of-the-art machinery to guarantee absolute accuracy, speed, and consistency for every production batch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="machinery-showcase-grid">
            {machineryItems.map((mach, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, borderColor: "rgba(245, 158, 11, 0.3)" }}
                className="overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col group transition duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-stone-100 border-b border-stone-100">
                  <img
                    src={mach.image}
                    alt={mach.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition duration-750 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-400 text-[9px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full border border-amber-500/20">
                    Active Unit
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-gradient-to-b from-white to-stone-50/20">
                  <div>
                    <h6 className="font-serif text-xs font-bold text-stone-850 uppercase tracking-wide">
                      {mach.name}
                    </h6>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-sans font-light">
                      {mach.description}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-stone-150 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-stone-400">PRECISION:</span>
                    <span className="font-sans font-semibold text-amber-700 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 uppercase">
                      {mach.spec}
                    </span>
                  </div>
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
              Building Trust & Enhancing Creative Garments
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

