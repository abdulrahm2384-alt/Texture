/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Lock, Scissors, ShoppingBag, Ruler, FileText, Upload, MapPin, Sparkles, Loader2, CalendarCheck, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Fabric, ClothingStyle, Measurements } from "../types";
import { submitOrder, fetchContactInfo } from "../utils/api";
import Modal from "./Modal";

interface OrderSectionProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  fabrics: Fabric[];
  styles: ClothingStyle[];
  onOpenAuth: () => void;
  onOrderCompleted: () => void;
}

export default function OrderSection({
  isOpen,
  onClose,
  user,
  fabrics,
  styles,
  onOpenAuth,
  onOrderCompleted,
}: OrderSectionProps) {
  if (!isOpen) return null;

  // Form state
  const [clientName, setClientName] = useState("");
  const [orderType, setOrderType] = useState<'fabric_only' | 'custom_tailoring' | 'both'>('fabric_only');
  const [fabricId, setFabricId] = useState<string>("");
  const [yardsOrdered, setYardsOrdered] = useState<number>(4);
  const [selectedFabrics, setSelectedFabrics] = useState<{ fabricId: string; yards: number }[]>([]);
  const [customStyleId, setCustomStyleId] = useState<string>("");
  const [fittingCategory, setFittingCategory] = useState<'female' | 'male' | 'elder' | 'younger'>('female');
  
  const [measurementsType, setMeasurementsType] = useState<'manual' | 'file_upload'>('manual');
  const [manualSpecs, setManualSpecs] = useState<Measurements>({
    neck: undefined,
    chest: undefined,
    shoulder: undefined,
    sleeveLength: undefined,
    waist: undefined,
    hip: undefined,
    gownLength: undefined,
    trouserLength: undefined,
    additionalNotes: "",
    measurementUnit: "inches"
  });

  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedBase64, setUploadedBase64] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  
  // Custom flyer-based professional services add-ons
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("234705378152");

  useEffect(() => {
    if (isOpen) {
      fetchContactInfo()
        .then((data) => {
          if (data && data.phoneNumber) {
            const cleaned = data.phoneNumber.replace(/\D/g, "");
            if (cleaned) {
              setWhatsappNumber(cleaned);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching contact details in OrderSection:", err);
        });
    }
  }, [isOpen]);

  const flyerServicesConfig = [
    { id: "monogramming", name: "Monogramming", price: 15000, desc: "Custom monograms that make a statement." },
    { id: "beading", name: "Beading", price: 45000, desc: "Exquisite beading for a luxurious look." },
    { id: "stoning", name: "Stoning", price: 30000, desc: "Premium stoning that adds brilliance." },
    { id: "sewing", name: "Sewing", price: 40000, desc: "Professional sewing with quality finishing." },
    { id: "laser_cut", name: "Laser Cut Design", price: 25000, desc: "Precision laser cutting for unique designs." },
    { id: "cnc_router", name: "CNC Router Design", price: 35000, desc: "High-precision CNC routing for perfect detail." },
    { id: "weaving", name: "Weaving", price: 50000, desc: "Expert weaving for durable and beautiful fabrics." },
    { id: "i_let", name: "I LET Stitching", price: 10000, desc: "Neat and durable eyelet stitching for a perfect finish." },
    { id: "button_holes", name: "Button Holes", price: 5000, desc: "Precision button holes stitched to perfection." },
  ];

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const addFabricItem = () => {
    if (fabrics.length > 0) {
      const alreadySelected = selectedFabrics.map((item) => item.fabricId);
      const remaining = fabrics.find((f) => !alreadySelected.includes(f.id));
      const nextId = remaining ? remaining.id : fabrics[0].id;
      setSelectedFabrics([...selectedFabrics, { fabricId: nextId, yards: 4 }]);
    }
  };

  const removeFabricItem = (index: number) => {
    const updated = selectedFabrics.filter((_, i) => i !== index);
    setSelectedFabrics(updated);
  };

  const updateFabricItem = (index: number, field: 'fabricId' | 'yards', value: any) => {
    const updated = selectedFabrics.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setSelectedFabrics(updated);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showServices, setShowServices] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup listeners for prefill events
  useEffect(() => {
    const handlePrefillFabric = (e: Event) => {
      const { fabricId: fId, yards, color } = (e as CustomEvent).detail;
      setOrderType("fabric_only");
      setFabricId(fId);
      const computedYards = yards || 4;
      setYardsOrdered(computedYards);
      setSelectedFabrics([{ fabricId: fId, yards: computedYards }]);
      if (color) {
        setSpecialInstructions((prev) => 
          prev.includes(`Color choice:`) ? prev : `Requested Color choice: ${color}. ` + prev
        );
      }
    };

    const handlePrefillStyle = (e: Event) => {
      const { styleId, styleName } = (e as CustomEvent).detail;
      setOrderType("both");
      setCustomStyleId(styleId || "");
      // Auto-set a fabric if none is selected
      if (!fabricId && fabrics.length > 0) {
        setFabricId(fabrics[0].id);
      }
    };

    window.addEventListener("prefillFabric", handlePrefillFabric);
    window.addEventListener("prefillStyle", handlePrefillStyle);

    return () => {
      window.removeEventListener("prefillFabric", handlePrefillFabric);
      window.removeEventListener("prefillStyle", handlePrefillStyle);
    };
  }, [fabrics, fabricId]);

  // Sync delivery address with logged-in user profile
  useEffect(() => {
    if (user) {
      setDeliveryAddress(user.address || "");
    }
  }, [user]);

  // Sync selectedFabrics initial entry when fabrics loaded
  useEffect(() => {
    if (fabrics.length > 0 && selectedFabrics.length === 0) {
      setSelectedFabrics([{ fabricId: fabricId || fabrics[0].id, yards: yardsOrdered || 4 }]);
    }
  }, [fabrics, fabricId, yardsOrdered, selectedFabrics]);

  // Sync fittingCategory based on selected style's default category
  useEffect(() => {
    if (!customStyleId) return;
    const selectedStyle = styles.find((s) => s.id === customStyleId);
    if (selectedStyle) {
      if (selectedStyle.category === "Female") {
        setFittingCategory("female");
      } else if (selectedStyle.category === "Male") {
        setFittingCategory("male");
      } else if (selectedStyle.category === "Children") {
        setFittingCategory("younger");
      } else if (selectedStyle.category === "Traditional") {
        if (selectedStyle.id === "style-1") {
          setFittingCategory("male");
        } else if (selectedStyle.id === "style-4") {
          setFittingCategory("female");
        }
      }
    }
  }, [customStyleId, styles]);

  // Live total price calculation
  const getCalculatedPrice = () => {
    let price = 0;
    
    // 1. Fabric cost
    if (orderType === "fabric_only") {
      selectedFabrics.forEach((item) => {
        const selectedFabric = fabrics.find((f) => f.id === item.fabricId);
        if (selectedFabric) {
          price += selectedFabric.pricePerYard * item.yards;
        }
      });
    } else if (orderType === "both") {
      const selectedFabric = fabrics.find((f) => f.id === fabricId);
      if (selectedFabric) {
        price += selectedFabric.pricePerYard * yardsOrdered;
      }
    }

    // 2. Tailoring base cost
    if (orderType === "custom_tailoring" || orderType === "both") {
      // Find style, or default bespoke fee
      let baseSewingFee = 0;
      const selectedStyle = styles.find((s) => s.id === customStyleId);
      if (selectedStyle) {
        if (selectedStyle.id === "style-1") baseSewingFee = 120000; // Agbada sewing fee
        else if (selectedStyle.id === "style-2") baseSewingFee = 150000; // Corset wedding gown fee
        else if (selectedStyle.id === "style-3") baseSewingFee = 50000; // Senator suit sewing fee
        else baseSewingFee = 60000; // General style sewing fee
      } else {
        baseSewingFee = 80000; // General tailored garment base fee
      }

      // Apply fitting category price adjustments
      if (fittingCategory === "elder") {
        baseSewingFee += 15000; // Elder custom ease & traditional allowances
      } else if (fittingCategory === "younger") {
        baseSewingFee = Math.round(baseSewingFee * 0.65); // Kids/Teens discount (35% off labor)
      } else if (fittingCategory === "female") {
        // If it's a female fit for standard styles, add subtle complexity premium unless it's already Corset style-2
        if (selectedStyle?.id !== "style-2") {
          baseSewingFee += 10000; 
        }
      }

      price += baseSewingFee;
    }

    // 3. Add-on professional services costs from Flyer
    selectedServices.forEach((serviceId) => {
      const sConf = flyerServicesConfig.find((s) => s.id === serviceId);
      if (sConf) {
        price += sConf.price;
      }
    });

    // 4. Shipping fee
    if (deliveryType === "delivery") {
      price += 5000; // premium shipping fee
    }

    return price;
  };

  // Handle local file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    // Form validations
    if (!clientName.trim()) {
      setFormError("Please enter your name");
      setIsLoading(false);
      return;
    }
    if (orderType === "fabric_only") {
      if (selectedFabrics.length === 0) {
        setFormError("Please select at least one fabric");
        setIsLoading(false);
        return;
      }
      const hasEmptyFabric = selectedFabrics.some((item) => !item.fabricId);
      if (hasEmptyFabric) {
        setFormError("Please select a valid fabric for each entry");
        setIsLoading(false);
        return;
      }
    }
    if (orderType === "both" && (!fabricId || !customStyleId)) {
      setFormError("Please select both fabric and design style");
      setIsLoading(false);
      return;
    }
    if (orderType === "custom_tailoring" && !customStyleId) {
      setFormError("Please select a design style for tailoring");
      setIsLoading(false);
      return;
    }
    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      setFormError("Please provide shipping details");
      setIsLoading(false);
      return;
    }

    try {
      const phoneNumber = whatsappNumber;

      // Format a high-fidelity, structured WhatsApp inquiry specification
      let msg = `🇳🇬 *OLUWASHOLA ATELIER ORDER INTAKE* 🇳🇬\n`;
      msg += `========================================\n\n`;
      msg += `👤 *CUSTOMER DETAILS*\n`;
      msg += `• *Name:* ${clientName.trim()}\n\n`;

      let orderTypeLabel = "";
      if (orderType === "fabric_only") orderTypeLabel = "Buy Fabric Only (Multiple)";
      else if (orderType === "custom_tailoring") orderTypeLabel = "Request Tailoring Only";
      else orderTypeLabel = "Fabric + Custom Tailoring";
      msg += `🛍️ *ORDER TYPE:* ${orderTypeLabel}\n\n`;

      if (orderType !== "custom_tailoring") {
        if (orderType === "fabric_only") {
          msg += `📦 *LUXURY TEXTILES (MULTIPLE ITEMS)*\n`;
          selectedFabrics.forEach((item, idx) => {
            const fObj = fabrics.find((f) => f.id === item.fabricId);
            if (fObj) {
              msg += `*Fabric #${idx + 1}:* ${fObj.name}\n`;
              msg += `• *Yards:* ${item.yards} Yards\n`;
              msg += `• *Cost:* ₦${(fObj.pricePerYard * item.yards).toLocaleString()}\n\n`;
            }
          });
        } else {
          const selectedFabric = fabrics.find((f) => f.id === fabricId);
          msg += `📦 *LUXURY TEXTILE*\n`;
          msg += `• *Fabric Choice:* ${selectedFabric ? selectedFabric.name : "Custom Fabric"}\n`;
          msg += `• *Yards Ordered:* ${yardsOrdered} Yards\n`;
          if (selectedFabric) {
            msg += `• *Estimated Fabric Cost:* ₦${(selectedFabric.pricePerYard * yardsOrdered).toLocaleString()}\n`;
          }
          msg += `\n`;
        }
      }

      if (orderType !== "fabric_only") {
        const selectedStyle = styles.find((s) => s.id === customStyleId);
        msg += `✂️ *BESPOKE GARMENT STYLE*\n`;
        msg += `• *Design Style:* ${selectedStyle ? selectedStyle.name : (customStyleId === "bespoke-custom" ? "Bespoke Custom Sketch / Image" : "Custom Design")}\n`;
        
        let fitLabel = "";
        if (fittingCategory === "female") fitLabel = "Female (Adult)";
        else if (fittingCategory === "male") fitLabel = "Male (Adult)";
        else if (fittingCategory === "elder") fitLabel = "Elder (Senior Fitting)";
        else if (fittingCategory === "younger") fitLabel = "Younger / Kids (Under 15)";
        
        msg += `• *Fitting Category:* ${fitLabel}\n\n`;
      }

      if (selectedServices.length > 0) {
        msg += `✨ *PREMIUM EMBELLISHMENT ADD-ONS*\n`;
        selectedServices.forEach((serviceId) => {
          const sConf = flyerServicesConfig.find((s) => s.id === serviceId);
          if (sConf) {
            msg += `• ${sConf.name} (+₦${sConf.price.toLocaleString()})\n`;
          }
        });
        msg += `\n`;
      }

      if (orderType !== "fabric_only") {
        msg += `📐 *MEASUREMENTS SPECIFICATION*\n`;
        let mType = "";
        if (measurementsType === "manual") mType = "Manual Entry";
        else mType = "Uploaded Design Sketch / Photo";
        
        msg += `• *Method:* ${mType}\n`;
        if (measurementsType === "manual") {
          if (manualSpecs.neck) msg += `  - *Neck:* ${manualSpecs.neck} inches\n`;
          if (manualSpecs.chest) msg += `  - *Chest:* ${manualSpecs.chest} inches\n`;
          if (manualSpecs.shoulder) msg += `  - *Shoulder:* ${manualSpecs.shoulder} inches\n`;
          if (manualSpecs.sleeveLength) msg += `  - *Sleeve Length:* ${manualSpecs.sleeveLength} inches\n`;
          if (manualSpecs.waist) msg += `  - *Waist:* ${manualSpecs.waist} inches\n`;
          if (manualSpecs.hip) msg += `  - *Hip:* ${manualSpecs.hip} inches\n`;
          if (manualSpecs.gownLength) msg += `  - *Gown Length:* ${manualSpecs.gownLength} inches\n`;
          if (manualSpecs.trouserLength) msg += `  - *Trouser Length:* ${manualSpecs.trouserLength} inches\n`;
          if (manualSpecs.additionalNotes) msg += `  - *Body Fit Notes:* ${manualSpecs.additionalNotes}\n`;
        } else if (measurementsType === "file_upload") {
          msg += `  - *Sketch/Specs Image:* Attached (Filename: ${uploadedFileName || "Yes"})\n`;
        }
        msg += `\n`;
      }

      msg += `🚚 *DELIVERY LOGISTICS*\n`;
      msg += `• *Logistics Method:* ${deliveryType === "pickup" ? "Self Pickup (Marina, Lagos - Free)" : "Secure Courier Shipping (+₦5,000)"}\n`;
      if (deliveryType === "delivery" && deliveryAddress.trim()) {
        msg += `• *Destination Address:* ${deliveryAddress.trim()}\n`;
      }
      msg += `\n`;

      if (specialInstructions.trim()) {
        msg += `📝 *SPECIAL DESIGN INSTRUCTIONS*\n`;
        msg += `• ${specialInstructions.trim()}\n\n`;
      }

      msg += `========================================\n`;
      msg += `💰 *ESTIMATED COST SPECIFICATION:* ₦${getCalculatedPrice().toLocaleString()}\n`;
      msg += `========================================\n\n`;
      msg += `Please review these details and let me know the next steps for my customized tailoring order. Thank you!`;

      // Also save the order to db if user is logged in
      if (user) {
        try {
          await submitOrder({
            orderType,
            fabricId: orderType !== "custom_tailoring" && orderType !== "fabric_only" ? fabricId : undefined,
            yardsOrdered: orderType !== "custom_tailoring" && orderType !== "fabric_only" ? yardsOrdered : undefined,
            customStyleId: orderType !== "fabric_only" ? customStyleId : undefined,
            selectedServices,
            measurementsType,
            measurements: measurementsType === "manual" ? manualSpecs : undefined,
            measurementFile: measurementsType === "file_upload" ? uploadedBase64 : undefined,
            deliveryType,
            deliveryAddress: deliveryType === "delivery" ? deliveryAddress : undefined,
            specialInstructions,
            totalPrice: getCalculatedPrice(),
            selectedFabrics: orderType === "fabric_only" ? selectedFabrics : undefined,
          });
        } catch (apiErr) {
          console.error("Failed to save order to database:", apiErr);
          // Don't block WhatsApp redirect
        }
      }

      const encodedMsg = encodeURIComponent(msg);
      const url = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

      setWhatsappUrl(url);

      // Trigger redirect to WhatsApp
      window.open(url, "_blank");

      setOrderSuccess(true);
      onOrderCompleted();
    } catch (err: any) {
      setFormError(err.message || "Failed to process custom request link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Digital Order Intake" subtitle="Atelier Booking">
      <div className="max-w-4xl mx-auto pb-4">
        <AnimatePresence>
          {orderSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6 bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm animate-fade-in"
              id="order-success-screen"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check size={32} />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-bold text-stone-900">Redirecting to WhatsApp...</h4>
                <p className="text-stone-600 text-xs mt-2 max-w-sm mx-auto leading-relaxed font-light">
                  Your customized tailoring specification has been generated! We have attempted to open WhatsApp. If the window did not open, please tap the button below to continue chatting directly with us.
                </p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-widest font-bold rounded-full transition cursor-pointer shadow-md text-center"
                  >
                    Open WhatsApp Chat
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setOrderSuccess(false)}
                  className="px-6 py-2.5 border border-stone-200 hover:border-amber-600 text-stone-800 text-xs uppercase tracking-widest font-bold rounded-full transition cursor-pointer"
                  id="order-success-dismiss"
                >
                  Place Another Request
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-750 text-center font-semibold">
                  {formError}
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="space-y-3 bg-stone-50 p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-800">
                  Step 1: Contact Information
                </label>
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-stone-700">Full Name</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl bg-white border border-stone-200 text-sm p-3 text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 focus:bg-white transition shadow-xs"
                  />
                </div>
              </div>

              {/* Section 2: Order Categories */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-800">
                  Step 2: Choose Showroom Intakes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType("fabric_only")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer min-h-[48px] ${
                      orderType === "fabric_only"
                        ? "border-amber-600 bg-amber-500/5 text-amber-800 font-semibold"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-850"
                    }`}
                  >
                    <ShoppingBag size={20} className="shrink-0 mt-0.5 text-amber-700" />
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-wide text-stone-900">Buy Fabric Only</span>
                      <span className="text-[10px] text-stone-500 block leading-tight mt-1">Get authentic fabric bolts directly.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("custom_tailoring")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer min-h-[48px] ${
                      orderType === "custom_tailoring"
                        ? "border-amber-600 bg-amber-500/5 text-amber-800 font-semibold"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-850"
                    }`}
                  >
                    <Scissors size={20} className="shrink-0 mt-0.5 text-amber-700" />
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-wide text-stone-900">Request Tailoring</span>
                      <span className="text-[10px] text-stone-500 block leading-tight mt-1">Supply own fabrics, hire our sewing salon.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType("both")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer min-h-[48px] ${
                      orderType === "both"
                        ? "border-amber-600 bg-amber-500/5 text-amber-800 font-semibold"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-850"
                    }`}
                  >
                    <Sparkles size={20} className="shrink-0 mt-0.5 text-amber-700" />
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-wide text-stone-900">Fabric + Tailoring</span>
                      <span className="text-[10px] text-stone-500 block leading-tight mt-1">Acquire fabric from us & tailor bespoke style.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 2: Items Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fabric selection */}
                {orderType !== "custom_tailoring" && (
                  <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                    {orderType === "fabric_only" ? (
                      // Multi-Fabric Builder for buying fabric alone
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                              Selected Textiles ({selectedFabrics.length})
                            </label>
                            <span className="text-[10px] text-stone-400">Specify fabrics & length (yards)</span>
                          </div>
                          <button
                            type="button"
                            onClick={addFabricItem}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-lg transition active:scale-95 shadow-sm cursor-pointer"
                          >
                            + Add Fabric
                          </button>
                        </div>

                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                          {selectedFabrics.map((item, index) => (
                            <div key={index} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                  Fabric Choice #{index + 1}
                                </span>
                                {selectedFabrics.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeFabricItem(index)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition cursor-pointer"
                                    title="Remove this fabric"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <select
                                  required
                                  value={item.fabricId}
                                  onChange={(e) => updateFabricItem(index, 'fabricId', e.target.value)}
                                  className="w-full rounded-xl bg-white border border-stone-200 text-xs p-2.5 text-stone-800 outline-none focus:border-amber-600 transition"
                                >
                                  <option value="">-- Choose Fabric --</option>
                                  {fabrics.map((f) => (
                                    <option key={f.id} value={f.id}>
                                      {f.name} (₦{f.pricePerYard.toLocaleString()}/yard)
                                    </option>
                                  ))}
                                </select>

                                {/* Yards Selector */}
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500">
                                      Length Required
                                    </label>
                                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                                      {item.yards} Yards
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="1"
                                    value={item.yards}
                                    onChange={(e) => updateFabricItem(index, 'yards', parseInt(e.target.value) || 4)}
                                    className="w-full accent-amber-600 h-1 bg-stone-200 rounded-lg outline-none cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Single fabric choice for Fabric + Tailoring ("both")
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                          Select Luxury Textile
                        </label>
                        <select
                          required
                          value={fabricId}
                          onChange={(e) => setFabricId(e.target.value)}
                          className="w-full rounded-xl bg-stone-50 border border-stone-200 text-sm p-3 text-stone-800 outline-none focus:border-amber-600 focus:bg-white transition"
                        >
                          <option value="">-- Choose Fabric --</option>
                          {fabrics.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} (₦{f.pricePerYard.toLocaleString()}/yard)
                            </option>
                          ))}
                        </select>

                        {/* Yards Selector */}
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                              Length Required
                            </label>
                            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                              {yardsOrdered} Yards
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            step="1"
                            value={yardsOrdered}
                            onChange={(e) => setYardsOrdered(parseInt(e.target.value) || 4)}
                            className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Style Selection */}
                {orderType !== "fabric_only" && (
                  <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                        Select Bespoke Garment Style
                      </label>
                      <select
                        required
                        value={customStyleId}
                        onChange={(e) => setCustomStyleId(e.target.value)}
                        className="w-full rounded-xl bg-stone-50 border border-stone-200 text-sm p-3 text-stone-800 outline-none focus:border-amber-600 focus:bg-white transition"
                      >
                        <option value="">-- Choose Design Style --</option>
                        {styles.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                        <option value="bespoke-custom">Supply own design sketch</option>
                      </select>
                    </div>

                    {customStyleId && (
                      <div className="pt-3 border-t border-stone-100 space-y-2 animate-fade-in">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-800">
                            Fitting Category / Age Group
                          </label>
                          <span className="text-[9px] text-stone-400 font-mono">
                            Tailoring rates adjust accordingly
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "female", label: "Female (Adult)", desc: "Darts & intricate corsetry", priceTag: "Standard Fit" },
                            { id: "male", label: "Male (Adult)", desc: "Structured bespoke fitting", priceTag: "Standard Fit" },
                            { id: "elder", label: "Elder (Senior)", desc: "Comfort traditional ease", priceTag: "+₦15,000" },
                            { id: "younger", label: "Younger / Kids", desc: "Petite (Under 15)", priceTag: "-35% off" },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFittingCategory(cat.id as any)}
                              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer min-h-[64px] ${
                                fittingCategory === cat.id
                                  ? "border-amber-600 bg-amber-500/5 ring-1 ring-amber-500/20"
                                  : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                              }`}
                            >
                              <div className="flex justify-between items-start w-full gap-1">
                                <span className={`text-[11px] font-bold ${fittingCategory === cat.id ? "text-amber-900" : "text-stone-800"}`}>
                                  {cat.label}
                                </span>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  cat.id === "younger"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : cat.id === "elder"
                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                    : "bg-stone-100 text-stone-600"
                                }`}>
                                  {cat.priceTag}
                                </span>
                              </div>
                              <span className="text-[9px] text-stone-400 mt-1 leading-tight">
                                {cat.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-stone-500 leading-normal mt-2 md:mt-0">
                      Choosing a design style pre-configures basic pattern templates.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Custom Accessories & Embellishments (Flyer Services, Collapsible) */}
              <div className="space-y-1">
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowServices(!showServices)}
                    className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none min-h-[44px]"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-amber-700 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-serif text-sm font-bold text-stone-900 leading-tight">
                          Premium Embellishments & Craft Services <span className="text-xs font-normal text-stone-500">(Optional)</span>
                        </h4>
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          {selectedServices.length > 0
                            ? `${selectedServices.length} custom service(s) active (+₦${selectedServices.reduce((acc, sId) => acc + (flyerServicesConfig.find(f => f.id === sId)?.price || 0), 0).toLocaleString()})`
                            : "Add monogramming, fine stoning, precise beading, weaving, laser cuts, etc."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedServices.length > 0 && (
                        <span className="bg-amber-100 text-amber-800 font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                          {selectedServices.length} Active
                        </span>
                      )}
                      {showServices ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {showServices && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-stone-100 mt-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="flyer-services-checkbox-grid">
                          {flyerServicesConfig.map((service) => {
                            const isSelected = selectedServices.includes(service.id);
                            return (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleService(service.id)}
                                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer min-h-[44px] ${
                                  isSelected
                                    ? "border-amber-600 bg-amber-500/5 text-amber-800 font-semibold shadow-sm"
                                    : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-stone-100/50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="accent-amber-600 shrink-0 mt-0.5 rounded cursor-pointer h-4 w-4"
                                />
                                <div className="leading-tight">
                                  <span className="text-xs font-bold block text-stone-900">{service.name}</span>
                                  <span className="text-[9px] text-stone-500 block leading-tight mt-1">{service.desc}</span>
                                  <span className="text-[10px] text-amber-800 font-mono font-bold block mt-1">+₦{service.price.toLocaleString()}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Section 4: Measurements Gate (Only show if tailoring involved) */}
              {orderType !== "fabric_only" && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-800">
                    Step 2: Tailoring Measurements Specifications
                  </label>
                  <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setMeasurementsType("manual")}
                      className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition cursor-pointer min-h-[40px] ${
                        measurementsType === "manual"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-stone-500 hover:text-stone-850"
                      }`}
                    >
                      Manual Setup
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeasurementsType("file_upload")}
                      className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-lg transition cursor-pointer min-h-[40px] ${
                        measurementsType === "file_upload"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-stone-500 hover:text-stone-850"
                      }`}
                    >
                      Upload Sketch
                    </button>
                  </div>

                  {/* Manual specification fields */}
                  {measurementsType === "manual" && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                      <div>
                        <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1">Neck (in)</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 15"
                          value={manualSpecs.neck || ""}
                          onChange={(e) => setManualSpecs({...manualSpecs, neck: parseFloat(e.target.value) || undefined})}
                          className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs p-2 outline-none text-stone-800 focus:border-amber-600 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1">Chest (in)</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 40"
                          value={manualSpecs.chest || ""}
                          onChange={(e) => setManualSpecs({...manualSpecs, chest: parseFloat(e.target.value) || undefined})}
                          className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs p-2 outline-none text-stone-800 focus:border-amber-600 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1">Shoulder (in)</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 18"
                          value={manualSpecs.shoulder || ""}
                          onChange={(e) => setManualSpecs({...manualSpecs, shoulder: parseFloat(e.target.value) || undefined})}
                          className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs p-2 outline-none text-stone-800 focus:border-amber-600 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1">Length (in)</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 56"
                          value={manualSpecs.gownLength || ""}
                          onChange={(e) => setManualSpecs({...manualSpecs, gownLength: parseFloat(e.target.value) || undefined})}
                          className="w-full rounded-lg bg-stone-50 border border-stone-200 text-xs p-2 outline-none text-stone-800 focus:border-amber-600 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* File uploads */}
                  {measurementsType === "file_upload" && (
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 text-center shadow-sm">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-200 hover:border-amber-600 bg-stone-50 rounded-xl p-6 cursor-pointer transition flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="text-stone-400" size={24} />
                        <span className="text-xs font-semibold text-stone-800">
                          {uploadedFileName || "Click or Drag design sketch / specs photo"}
                        </span>
                        <span className="text-[10px] text-stone-500">Supports JPG, PNG, up to 5MB</span>
                      </div>
                    </div>
                  )}


                </div>
              )}

              {/* Section 5: Delivery / Logistics */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-800">
                  Step {orderType === "fabric_only" ? "2" : "3"}: Delivery Logistics
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer min-h-[44px] ${
                      deliveryType === "pickup"
                        ? "border-amber-600 bg-amber-500/5 text-amber-800 font-semibold"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <MapPin size={16} className="text-amber-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block uppercase text-stone-900 leading-tight">Self Pickup at Showroom</span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">Collect directly at Marina, Lagos (Free)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer min-h-[44px] ${
                      deliveryType === "delivery"
                        ? "border-amber-600 bg-amber-500/5 text-amber-800 font-semibold"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <ShoppingBag size={16} className="text-amber-700 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block uppercase text-stone-900 leading-tight">Secure Courier Shipping</span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">Delivered directly to your address (+₦5,000)</span>
                    </div>
                  </button>
                </div>

                {deliveryType === "delivery" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1 pt-1"
                  >
                    <textarea
                      required
                      rows={2}
                      placeholder="Provide the complete destination shipping address..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-xl bg-white border border-stone-200 text-sm p-3 outline-none text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 shadow-sm"
                    />
                  </motion.div>
                )}
              </div>

              {/* Section 6: Custom instructions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  Special Design Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Request specific pattern combinations, preferred buttons, collar stitch requirements, or urgency deadlines..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full rounded-xl bg-white border border-stone-200 text-xs p-3 outline-none text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 resize-none shadow-sm"
                />
              </div>

              {/* Checkout Cost Summary Block */}
              <div className="border-t border-stone-200 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-100/60 p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">Showroom Cost Specification</p>
                  <p className="font-serif text-2xl font-bold text-amber-800 mt-0.5">
                    ₦{getCalculatedPrice().toLocaleString()}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                    {orderType !== "fabric_only" && customStyleId ? (
                      <span>Includes chosen style (<strong>{fittingCategory === "female" ? "Female Adult" : fittingCategory === "male" ? "Male Adult" : fittingCategory === "elder" ? "Elderly Senior" : "Younger/Kids"} fit</strong>), premium textiles, pattern cuts & logistics</span>
                    ) : orderType === "fabric_only" && selectedFabrics.length > 1 ? (
                      <span>Includes <strong>{selectedFabrics.length} premium fabrics</strong> & showroom logistics</span>
                    ) : (
                      "Includes selected luxury textiles & premium showroom logistics"
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/10 disabled:opacity-50 cursor-pointer min-h-[44px]"
                  id="order-form-submit-btn"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin text-white" size={16} />
                  ) : (
                    <CalendarCheck size={16} />
                  )}
                  Submit Atelier Request
                </button>
              </div>
            </form>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
