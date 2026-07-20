/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Lock, Scissors, ShoppingBag, Ruler, FileText, Upload, MapPin, Sparkles, Loader2, CalendarCheck, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Fabric, ClothingStyle, Measurements, ContactInfo } from "../types";
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
  const [recreationItemName, setRecreationItemName] = useState("");
  const [fabricId, setFabricId] = useState<string>("");
  const [yardsOrdered, setYardsOrdered] = useState<number>(1);
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
  const [contact, setContact] = useState<ContactInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchContactInfo()
        .then((data) => {
          if (data) {
            setContact(data);
            if (data.phoneNumber) {
              const cleaned = data.phoneNumber.replace(/\D/g, "");
              if (cleaned) {
                setWhatsappNumber(cleaned);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching contact details in OrderSection:", err);
        });
    }
  }, [isOpen]);

  const flyerServicesConfig = [
    { id: "monogramming", name: "Monogramming", price: contact?.servicePrices?.monogramming ?? 15000, desc: "Custom monograms that make a statement." },
    { id: "beading", name: "Beading", price: contact?.servicePrices?.beading ?? 45000, desc: "Exquisite beading for a luxurious look." },
    { id: "stoning", name: "Stoning", price: contact?.servicePrices?.stoning ?? 30000, desc: "Premium stoning that adds brilliance." },
    { id: "sewing", name: "Sewing", price: contact?.servicePrices?.sewing ?? 40000, desc: "Professional sewing with quality finishing." },
    { id: "laser_cut", name: "Laser Cut Design", price: contact?.servicePrices?.laser_cut ?? 25000, desc: "Precision laser cutting for unique designs." },
    { id: "cnc_router", name: "CNC Router Design", price: contact?.servicePrices?.cnc_router ?? 35000, desc: "High-precision CNC routing for perfect detail." },
    { id: "weaving", name: "Weaving", price: contact?.servicePrices?.weaving ?? 50000, desc: "Expert weaving for durable and beautiful fabrics." },
    { id: "i_let", name: "I LET Stitching", price: contact?.servicePrices?.i_let ?? 10000, desc: "Neat and durable eyelet stitching for a perfect finish." },
    { id: "button_holes", name: "Button Holes", price: contact?.servicePrices?.button_holes ?? 5000, desc: "Precision button holes stitched to perfection." },
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
      setSelectedFabrics([...selectedFabrics, { fabricId: nextId, yards: 1 }]);
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
      const { fabricId: fId, yards, color, gender, ageGroup } = (e as CustomEvent).detail;
      setOrderType("fabric_only");
      setFabricId(fId);
      const computedYards = yards || 1;
      setYardsOrdered(computedYards);
      setSelectedFabrics([{ fabricId: fId, yards: computedYards }]);
      
      let prefillNotes = "";
      if (color) {
        prefillNotes += `Requested Style/Color: ${color}. `;
      }
      if (gender && gender !== "All") {
        prefillNotes += `Target Gender: ${gender}. `;
      }
      if (ageGroup && ageGroup !== "All") {
        prefillNotes += `Target Age Group: ${ageGroup}. `;
      }

      if (prefillNotes) {
        setSpecialInstructions((prev) => {
          if (prev.includes(prefillNotes)) return prev;
          return prefillNotes + prev;
        });
      }
    };

    const handlePrefillStyle = (e: Event) => {
      const { styleId, styleName } = (e as CustomEvent).detail;
      setOrderType("custom_tailoring");
      if (styleId) {
        setCustomStyleId(styleId);
        setRecreationItemName("");
      } else {
        setCustomStyleId("gallery-recreation");
        setRecreationItemName(styleName || "");
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
      setSelectedFabrics([{ fabricId: fabricId || fabrics[0].id, yards: yardsOrdered || 1 }]);
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
        setFormError("Please select at least one accessory/supply item");
        setIsLoading(false);
        return;
      }
      const hasEmptyFabric = selectedFabrics.some((item) => !item.fabricId);
      if (hasEmptyFabric) {
        setFormError("Please select a valid item for each entry");
        setIsLoading(false);
        return;
      }
    }
    if (orderType === "custom_tailoring" && !customStyleId) {
      setFormError("Please select a design style to recreate");
      setIsLoading(false);
      return;
    }
    if (deliveryType === "delivery" && !deliveryAddress.trim() && orderType === "fabric_only") {
      setFormError("Please provide shipping details");
      setIsLoading(false);
      return;
    }

    try {
      const phoneNumber = whatsappNumber;
      let msg = "";

      if (orderType === "custom_tailoring") {
        msg = `🇳🇬 *OLUWASHOLA TEXTILES SHOWCASE INQUIRY* 🇳🇬\n`;
        msg += `========================================\n\n`;
        msg += `👤 *CUSTOMER DETAILS*\n`;
        msg += `• *Name:* ${clientName.trim()}\n\n`;

        const selectedStyle = styles.find((s) => s.id === customStyleId);
        const styleName = customStyleId === "gallery-recreation" 
          ? recreationItemName 
          : (selectedStyle ? selectedStyle.name : "Custom Design");

        msg += `🎨 *REQUESTED DESIGN RECREATION*\n`;
        msg += `• *Design Style:* ${styleName}\n\n`;

        msg += `💬 *INQUIRY MESSAGE*\n`;
        msg += `Hello! I saw this completed work in your showcase and I would love to create a similar design on my own fabric or clothing.\n`;
        msg += `• How much will you charge me to create a similar stuff on my fabric/clothing?\n`;
        msg += `• How long will it take to complete?\n\n`;

        if (specialInstructions.trim()) {
          msg += `📝 *SPECIAL DESIGN INSTRUCTIONS*\n`;
          msg += `• ${specialInstructions.trim()}\n\n`;
        }

        msg += `========================================\n`;
        msg += `Please let me know how to proceed. Thank you!`;
      } else {
        // "fabric_only" / Boutique supplies flow
        msg = `🇳🇬 *OLUWASHOLA TEXTILES INQUIRY INTAKE* 🇳🇬\n`;
        msg += `========================================\n\n`;
        msg += `👤 *CUSTOMER DETAILS*\n`;
        msg += `• *Name:* ${clientName.trim()}\n\n`;
        msg += `🛍️ *INQUIRY TYPE:* Boutique Supplies & Accessories\n\n`;

        msg += `📦 *GARMENT ACCESSORIES & SUPPLIES*\n`;
        selectedFabrics.forEach((item, idx) => {
          const fObj = fabrics.find((f) => f.id === item.fabricId);
          if (fObj) {
            msg += `*Accessory #${idx + 1}:* ${fObj.name}\n`;
            msg += `• *Quantity:* ${item.yards} ${fObj.pricingUnit || "Unit"}${item.yards > 1 ? "s" : ""}\n`;
            msg += `• *Cost:* ₦${(fObj.pricePerYard * item.yards).toLocaleString()}\n\n`;
          }
        });

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
        msg += `💰 *TOTAL ESTIMATED COST:* ₦${getCalculatedPrice().toLocaleString()}\n`;
        msg += `========================================\n\n`;
        msg += `Please review these details and let me know the next steps for my order. Thank you!`;
      }

      // Also save the order to db if user is logged in
      if (user) {
        try {
          await submitOrder({
            orderType,
            fabricId: undefined,
            yardsOrdered: undefined,
            customStyleId: orderType === "custom_tailoring" ? customStyleId : undefined,
            selectedServices: [],
            measurementsType: "manual",
            measurements: undefined,
            measurementFile: undefined,
            deliveryType,
            deliveryAddress: deliveryType === "delivery" ? deliveryAddress : undefined,
            specialInstructions,
            totalPrice: orderType === "custom_tailoring" ? 0 : getCalculatedPrice(),
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

              {/* Customer Direct WhatsApp Chat Banner */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Prefer to chat directly?</h4>
                  <p className="text-[10px] text-amber-800 mt-0.5">Skip the form entirely and discuss your design, pricing, and fabric directly with our tailors on WhatsApp.</p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Oluwashola Textiles, I'd like to chat with you directly about a custom design or tailoring request!")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm text-center min-h-[36px] hover:scale-[1.02] active:scale-95 shrink-0"
                >
                  Chat Direct
                </a>
              </div>

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
                  Step 2: Choose Inquiry Categories
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <span className="text-xs font-bold block uppercase tracking-wide text-stone-900">Boutique Supplies</span>
                      <span className="text-[10px] text-stone-500 block leading-tight mt-1">Order accessories and tools per listed prices.</span>
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
                      <span className="text-xs font-bold block uppercase tracking-wide text-stone-900">Showcase Designs</span>
                      <span className="text-[10px] text-stone-500 block leading-tight mt-1">Inquire about recreating any showcase style.</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 2: Items Configuration */}
              <div className="grid grid-cols-1 gap-4">
                {/* Fabric selection */}
                {orderType === "fabric_only" && (
                  <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                    {/* Multi-Fabric Builder for buying fabric alone */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                            Selected Supplies/Accessories ({selectedFabrics.length})
                          </label>
                          <span className="text-[10px] text-stone-400">Specify boutique items & quantity</span>
                        </div>
                        <button
                          type="button"
                          onClick={addFabricItem}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-lg transition active:scale-95 shadow-sm cursor-pointer font-semibold"
                        >
                          + Add Item
                        </button>
                      </div>

                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {selectedFabrics.map((item, index) => (
                          <div key={index} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                Item Selection #{index + 1}
                              </span>
                              {selectedFabrics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeFabricItem(index)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition cursor-pointer"
                                  title="Remove this item"
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
                                className="w-full rounded-xl bg-white border border-stone-200 text-xs p-2.5 text-stone-800 outline-none focus:border-amber-600 transition font-medium"
                              >
                                <option value="">-- Choose Boutique Item --</option>
                                {fabrics.map((f) => (
                                  <option key={f.id} value={f.id}>
                                    {f.name} (₦{f.pricePerYard.toLocaleString()}/{f.pricingUnit || "unit"})
                                  </option>
                                ))}
                              </select>

                              {/* Yards Selector */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-[9px] font-bold uppercase tracking-wider text-stone-500">
                                    Quantity
                                  </label>
                                  <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                                    {item.yards} {item.fabricId && fabrics.find(f => f.id === item.fabricId)?.pricingUnit ? fabrics.find(f => f.id === item.fabricId)?.pricingUnit : "Unit"}{item.yards > 1 ? "s" : ""}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="50"
                                  step="1"
                                  value={item.yards}
                                  onChange={(e) => updateFabricItem(index, 'yards', parseInt(e.target.value) || 1)}
                                  className="w-full accent-amber-600 h-1 bg-stone-200 rounded-lg outline-none cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Style Selection */}
                {orderType === "custom_tailoring" && (
                  <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                        Select Design / Finishing Style
                      </label>
                      <select
                        required
                        value={customStyleId}
                        onChange={(e) => setCustomStyleId(e.target.value)}
                        className="w-full rounded-xl bg-stone-50 border border-stone-200 text-sm p-3 text-stone-800 outline-none focus:border-amber-600 focus:bg-white transition font-medium"
                      >
                        <option value="">-- Choose Finishing Style --</option>
                        {recreationItemName && (
                          <option value="gallery-recreation">
                            Recreate Showcase Design: {recreationItemName}
                          </option>
                        )}
                        {styles.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                        <option value="bespoke-custom">Custom Finishing Design Sketch</option>
                      </select>
                    </div>

                    <p className="text-[10px] text-stone-500 leading-normal mt-2">
                      Our tailors specialize in computerized embroidery, monograms, neat stone setting, and laser cut craft. No measurements or uploads are collected here since we will coordinate the perfect fit and fabric specifications with you directly on WhatsApp.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 5: Delivery / Logistics */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-amber-800">
                  Step 3: Delivery Logistics
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
                      className="w-full rounded-xl bg-white border border-stone-200 text-sm p-3 outline-none text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 shadow-sm font-medium"
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
                  className="w-full rounded-xl bg-white border border-stone-200 text-xs p-3 outline-none text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 resize-none shadow-sm font-medium"
                />
              </div>

              {/* Checkout Cost Summary Block */}
              {orderType !== "custom_tailoring" ? (
                <div className="border-t border-stone-200 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-100/60 p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                  <div>
                    <p className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">Inquiry Cost Estimate</p>
                    <p className="font-serif text-2xl font-bold text-amber-800 mt-0.5">
                      ₦{getCalculatedPrice().toLocaleString()}
                    </p>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                      {selectedFabrics.length > 1 ? (
                        <span>Includes <strong>{selectedFabrics.length} selected accessory supplies</strong> & logistics</span>
                      ) : (
                        "Includes selected accessories supplies & premium logistics"
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
                    Submit Inquiry Specs
                  </button>
                </div>
              ) : (
                <div className="border-t border-stone-200 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-100/60 p-4.5 rounded-2xl border border-stone-200 shadow-sm">
                  <div>
                    <p className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">Custom Design Recreation</p>
                    <p className="font-serif text-base font-bold text-amber-800 mt-1">
                      Discuss Price & Timeline on WhatsApp
                    </p>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                      No upfront charges. Share your fabric preferences on WhatsApp and get a quote.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10 disabled:opacity-50 cursor-pointer min-h-[44px]"
                    id="order-form-submit-btn"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin text-white" size={16} />
                    ) : (
                      <CalendarCheck size={16} />
                    )}
                    Discuss on WhatsApp
                  </button>
                </div>
              )}
            </form>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
