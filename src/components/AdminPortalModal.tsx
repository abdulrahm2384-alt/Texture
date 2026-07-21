import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Mail, 
  Key, 
  Loader2, 
  Lock, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Sliders,
  LogOut,
  Sparkles,
  RefreshCw,
  Trash2,
  Upload,
  Plus,
  Scissors,
  Award,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContactInfo } from "../types";
import { 
  requestAdminOtp, 
  verifyAdminOtp, 
  getAdminToken, 
  setAdminToken,
  fetchCatalog,
  addFabricAdmin,
  deleteFabricAdmin,
  updateFabricAdmin,
  addGalleryAdmin,
  deleteGalleryAdmin,
  addStyleAdmin,
  deleteStyleAdmin,
  fetchContactInfo,
  updateContactInfoAdmin,
  seedDefaultCatalogAdmin,
  clearCatalogAdmin
} from "../utils/api";
import { getCategoryDisplayLabel } from "../utils/categoryParser";

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerToast: (message: string, type?: "success" | "info") => void;
  onCatalogChanged?: () => void;
}

export default function AdminPortalModal({ isOpen, onClose, triggerToast, onCatalogChanged }: AdminPortalModalProps) {
  // Authentication status
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProduction = (import.meta as any).env?.PROD || false;

  // Bypass / Testing Key auth states
  const [authMode, setAuthMode] = useState<"key" | "email">(isProduction ? "email" : "key");
  const [bypassKey, setBypassKey] = useState("");
  const DEFAULT_BYPASS_KEY = "86a75ad47d95dc819401842e3883824ad95c8e49ade9cec151b064a5144111b3";

  // OTP Timer countdown (5 minutes)
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerActive, setTimerActive] = useState(false);

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<"gallery" | "fabrics" | "styles" | "contact">("gallery");

  // Admin Control Dropdown & Seeding States
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Contact Form State
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phoneNumber: "+234705378152",
    displayPhone: "0705378152",
    emailAddress: "info@oluwasholatextiles.com.ng",
    websiteAddress: "www.oluwasholatextiles.com.ng",
    physicalAddress: "39, Bamgbose Street, Lagos Island, Lagos State",
    mapUrl: "https://maps.google.com/maps?q=39%20Bamgbose%20Street,%20Lagos%20Island,%20Lagos,%20Nigeria&t=&z=16&ie=UTF8&iwloc=&output=embed",
    tiktokUrl: "https://www.tiktok.com/@oluwashola.textiles",
    instagramUrl: "https://www.instagram.com/OluwasholaTextiles",
    youtubeUrl: "https://www.youtube.com/@oluwasholatextiles",
    logoUrl: "/src/assets/images/oluwashola_logo_1784138680903.jpg",
    heroBgUrl: "/src/assets/images/textile_hero_1784138693639.jpg"
  });
  const [loadingContact, setLoadingContact] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Collapsible settings state for different image categories
  const [imageSectionBrandingOpen, setImageSectionBrandingOpen] = useState(false);
  const [imageSectionWingsOpen, setImageSectionWingsOpen] = useState(false);
  const [imageSectionMachineryOpen, setImageSectionMachineryOpen] = useState(false);

  // Helper to check if testing/bypass mode is active
  const isTestingMode = () => {
    if (isProduction) return false;
    const token = getAdminToken();
    return token === DEFAULT_BYPASS_KEY || authMode === "key";
  };

  // Showroom Catalog State
  const [catalog, setCatalog] = useState<{ fabrics: any[]; gallery: any[]; styles: any[] }>({
    fabrics: [],
    gallery: [],
    styles: []
  });
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // Fabric Inline Edit State
  const [editingFabricId, setEditingFabricId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editPricingUnit, setEditPricingUnit] = useState<string>("Yard");
  const [editMinQty, setEditMinQty] = useState<string>("1");
  const [editMaxQty, setEditMaxQty] = useState<string>("10");
  const [editStock, setEditStock] = useState<string>("In Stock");
  const [updatingFabric, setUpdatingFabric] = useState<boolean>(false);

  // Fabric Form State
  const [fabName, setFabName] = useState("");
  const [fabCategory, setFabCategory] = useState("Lace");
  const [customFabCategory, setCustomFabCategory] = useState("");
  const [fabPrice, setFabPrice] = useState("");
  const [fabColors, setFabColors] = useState("");
  const [fabStock, setFabStock] = useState("In Stock");
  const [fabDesc, setFabDesc] = useState("");
  const [fabImageType, setFabImageType] = useState<"default" | "upload">("default");
  const [fabImageFile, setFabImageFile] = useState<string | null>(null);
  const [fabGender, setFabGender] = useState("All");
  const [fabAgeGroup, setFabAgeGroup] = useState("All");
  const [fabPricingUnit, setFabPricingUnit] = useState("Yard");
  const [fabMinOrderQty, setFabMinOrderQty] = useState("1");
  const [fabMaxOrderQty, setFabMaxOrderQty] = useState("10");

  // Gallery (Showcase) Form State
  const [galTitle, setGalTitle] = useState("");
  const [galGender, setGalGender] = useState("Female");
  const [galAgeGroup, setGalAgeGroup] = useState("Adult");
  const [galStyleType, setGalStyleType] = useState("Traditional");
  const [galCustom, setGalCustom] = useState("");
  const [galDesc, setGalDesc] = useState("");
  const [galImageType, setGalImageType] = useState<"default" | "upload">("default");
  const [galImageFile, setGalImageFile] = useState<string | null>(null);

  // Style Form State
  const [styName, setStyName] = useState("");
  const [styGender, setStyGender] = useState("Female");
  const [styAgeGroup, setStyAgeGroup] = useState("Adult");
  const [styStyleType, setStyStyleType] = useState("Traditional");
  const [styCustom, setStyCustom] = useState("");
  const [styYardage, setStyYardage] = useState("");
  const [styDesc, setStyDesc] = useState("");
  const [styImageType, setStyImageType] = useState<"default" | "upload">("default");
  const [styImageFile, setStyImageFile] = useState<string | null>(null);

  const [addingItem, setAddingItem] = useState(false);

  // Helper helper to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const getDefaultStudioCutImage = (category: string, type: 'fabric' | 'gallery' | 'style'): string => {
    if (type === 'fabric') {
      switch (category.toLowerCase()) {
        case 'lace':
          return "https://images.unsplash.com/photo-1594224140980-6e9dd0223e38?auto=format&fit=crop&q=80&w=600";
        case 'ankara':
          return "https://images.unsplash.com/photo-1584184924103-e310d9dc82fc?auto=format&fit=crop&q=80&w=600";
        case 'aso oke':
          return "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
        case 'brocade':
          return "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=600";
        case 'silk':
          return "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600";
        case 'velvet':
          return "https://images.unsplash.com/photo-1571242337471-70529d89196b?auto=format&fit=crop&q=80&w=600";
        case 'cashmere':
          return "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=600";
        default:
          return "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
      }
    } else {
      switch (category.toLowerCase()) {
        case 'traditional':
          return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600";
        case 'male':
          return "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600";
        case 'female':
          return "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";
        case 'children':
          return "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=600";
        case 'casual':
          return "https://images.unsplash.com/photo-1561932690-f98b9cd64221?auto=format&fit=crop&q=80&w=600";
        case 'corporate':
          return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600";
        case 'wedding':
          return "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600";
        default:
          return "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600";
      }
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  // Check if already authenticated on open
  useEffect(() => {
    if (isOpen) {
      const token = getAdminToken();
      if (token) {
        setIsAdmin(true);
        loadCatalog();
      } else {
        setIsAdmin(false);
        setStep("email");
        setOtpCode("");
        setBypassKey("");
        setError(null);
        setAuthMode(isProduction ? "email" : "key");
      }
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Load administrative catalog
  const loadCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const data = await fetchCatalog();
      setCatalog(data);
    } catch (err: any) {
      console.error("Failed to load catalog inside admin portal", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;

    setLoading(true);
    setError(null);

    try {
      const res = await requestAdminOtp(adminEmail);
      if (res.success) {
        setStep("otp");
        setTimeLeft(300); // 5 minutes
        setTimerActive(true);
        triggerToast("A secure 6-digit verification code has been dispatched.");
      }
    } catch (err: any) {
      setError(err.message || "Email validation failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyAdminOtp(adminEmail, otpCode);
      if (res.success) {
        setIsAdmin(true);
        setTimerActive(false);
        triggerToast("Access authorized. Welcome back, Administrator.");
        loadCatalog();
      }
    } catch (err: any) {
      setError(err.message || "Incorrect or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Bypass / Testing Key
  const handleVerifyBypassKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassKey.trim()) {
      setError("Please enter the development bypass key.");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (bypassKey.trim() === DEFAULT_BYPASS_KEY) {
        setAdminToken(DEFAULT_BYPASS_KEY);
        setIsAdmin(true);
        triggerToast("Access authorized via Development Bypass Key.");
        loadCatalog();
      } else {
        setError("Invalid Development Bypass Key. Please enter the correct testing key.");
      }
      setLoading(false);
    }, 450);
  };

  // Add/Delete Handlers
  const handleAddFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabName || !fabPrice) {
      triggerToast("Please provide fabric name and price", "info");
      return;
    }
    setAddingItem(true);
    const finalCategory = fabCategory === "Custom" ? (customFabCategory.trim() || "Custom Fabric") : fabCategory;

    const finalImageUrl = fabImageType === "default" 
      ? getDefaultStudioCutImage(finalCategory, 'fabric')
      : (fabImageFile || getDefaultStudioCutImage(finalCategory, 'fabric'));

    const colorsArr = fabColors.split(",").map(c => c.trim()).filter(Boolean);
    const colorsHexArr = colorsArr.map(() => "#" + Math.floor(Math.random()*16777215).toString(16));

    const fabricData = {
      name: fabName,
      category: finalCategory,
      gender: fabGender,
      ageGroup: fabAgeGroup,
      pricePerYard: Number(fabPrice),
      pricingUnit: fabPricingUnit,
      minOrderQty: Number(fabMinOrderQty) || 1,
      maxOrderQty: Number(fabMaxOrderQty) || 10,
      availableColors: colorsArr,
      colorsHex: colorsHexArr,
      description: fabDesc || `${fabName} premium visual styling.`,
      stockAvailability: fabStock,
      imageUrl: finalImageUrl
    };

    try {

      await addFabricAdmin(fabricData);
      triggerToast("Custom fabric added successfully to showroom!");
      await loadCatalog();

      setFabName("");
      setFabCategory("Lace");
      setCustomFabCategory("");
      setFabPrice("");
      setFabColors("");
      setFabDesc("");
      setFabImageFile(null);
      setFabGender("All");
      setFabAgeGroup("All");
      setFabPricingUnit("Yard");
      setFabMinOrderQty("1");
      setFabMaxOrderQty("10");
      if (onCatalogChanged) onCatalogChanged();
    } catch (err: any) {
      if (isTestingMode()) {
        const newFab = {
          ...fabricData,
          id: "fab-" + Math.random().toString(36).substring(2, 9),
        };
        const updatedFabrics = [...(catalog.fabrics || []), newFab];
        const updatedCatalog = { ...catalog, fabrics: updatedFabrics };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Fabric added locally to current session.");
        
        setFabName("");
        setFabCategory("Lace");
        setCustomFabCategory("");
        setFabPrice("");
        setFabColors("");
        setFabDesc("");
        setFabImageFile(null);
        setFabGender("All");
        setFabAgeGroup("All");
        setFabPricingUnit("Yard");
        setFabMinOrderQty("1");
        setFabMaxOrderQty("10");
        if (onCatalogChanged) onCatalogChanged();
      } else {
        triggerToast(err.message || "Failed to add fabric.", "info");
      }
    } finally {
      setAddingItem(false);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle) {
      triggerToast("Please provide showcase title", "info");
      return;
    }
    setAddingItem(true);
    try {
      const isCustomStyleType = galStyleType === "Custom";
      const serializedCategory = JSON.stringify({
        gender: galGender,
        ageGroup: galAgeGroup,
        styleType: galStyleType,
        custom: isCustomStyleType ? galCustom.trim() : ""
      });

      const finalImageUrl = galImageType === "default"
        ? getDefaultStudioCutImage(galStyleType, 'gallery')
        : (galImageFile || getDefaultStudioCutImage(galStyleType, 'gallery'));

      const galleryData = {
        title: galTitle,
        category: serializedCategory,
        description: galDesc || `${galTitle} designer piece showcase.`,
        imageUrl: finalImageUrl
      };

      await addGalleryAdmin(galleryData);
      triggerToast("Showcase item added perfectly!");
      await loadCatalog();

      setGalTitle("");
      setGalGender("Female");
      setGalAgeGroup("Adult");
      setGalStyleType("Traditional");
      setGalCustom("");
      setGalDesc("");
      setGalImageFile(null);
      if (onCatalogChanged) onCatalogChanged();
    } catch (err: any) {
      if (isTestingMode()) {
        const isCustomStyleType = galStyleType === "Custom";
        const serializedCategory = JSON.stringify({
          gender: galGender,
          ageGroup: galAgeGroup,
          styleType: galStyleType,
          custom: isCustomStyleType ? galCustom.trim() : ""
        });
        const galleryData = {
          title: galTitle,
          category: serializedCategory,
          description: galDesc || `${galTitle} designer piece showcase.`,
          imageUrl: galImageType === "default"
            ? getDefaultStudioCutImage(galStyleType, 'gallery')
            : (galImageFile || getDefaultStudioCutImage(galStyleType, 'gallery'))
        };
        const newGal = {
          ...galleryData,
          id: "gal-" + Math.random().toString(36).substring(2, 9),
        };
        const updatedGallery = [...(catalog.gallery || []), newGal];
        const updatedCatalog = { ...catalog, gallery: updatedGallery };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Showcase item added locally to current session.");

        setGalTitle("");
        setGalGender("Female");
        setGalAgeGroup("Adult");
        setGalStyleType("Traditional");
        setGalCustom("");
        setGalDesc("");
        setGalImageFile(null);
        if (onCatalogChanged) onCatalogChanged();
      } else {
        triggerToast(err.message || "Failed to add showcase item.", "info");
      }
    } finally {
      setAddingItem(false);
    }
  };

  const handleAddStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!styName || !styYardage) {
      triggerToast("Please provide style name and yardage", "info");
      return;
    }
    setAddingItem(true);
    try {
      const isCustomStyleType = styStyleType === "Custom";
      const serializedCategory = JSON.stringify({
        gender: styGender,
        ageGroup: styAgeGroup,
        styleType: styStyleType,
        custom: isCustomStyleType ? styCustom.trim() : ""
      });

      const finalImageUrl = styImageType === "default"
        ? getDefaultStudioCutImage(styStyleType, 'style')
        : (styImageFile || getDefaultStudioCutImage(styStyleType, 'style'));

      const styleData = {
        name: styName,
        category: serializedCategory,
        estimatedYardage: styYardage,
        description: styDesc || `${styName} aesthetic cut guidance.`,
        imageUrl: finalImageUrl
      };

      await addStyleAdmin(styleData);
      triggerToast("Style inspiration added perfectly!");
      await loadCatalog();

      setStyName("");
      setStyGender("Female");
      setStyAgeGroup("Adult");
      setStyStyleType("Traditional");
      setStyCustom("");
      setStyYardage("");
      setStyDesc("");
      setStyImageFile(null);
      if (onCatalogChanged) onCatalogChanged();
    } catch (err: any) {
      if (isTestingMode()) {
        const isCustomStyleType = styStyleType === "Custom";
        const serializedCategory = JSON.stringify({
          gender: styGender,
          ageGroup: styAgeGroup,
          styleType: styStyleType,
          custom: isCustomStyleType ? styCustom.trim() : ""
        });
        const styleData = {
          name: styName,
          category: serializedCategory,
          estimatedYardage: styYardage,
          description: styDesc || `${styName} aesthetic cut guidance.`,
          imageUrl: styImageType === "default"
            ? getDefaultStudioCutImage(styStyleType, 'style')
            : (styImageFile || getDefaultStudioCutImage(styStyleType, 'style'))
        };
        const newStyle = {
          ...styleData,
          id: "sty-" + Math.random().toString(36).substring(2, 9),
        };
        const updatedStyles = [...(catalog.styles || []), newStyle];
        const updatedCatalog = { ...catalog, styles: updatedStyles };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Style inspiration added locally to current session.");

        setStyName("");
        setStyGender("Female");
        setStyAgeGroup("Adult");
        setStyStyleType("Traditional");
        setStyCustom("");
        setStyYardage("");
        setStyDesc("");
        setStyImageFile(null);
        if (onCatalogChanged) onCatalogChanged();
      } else {
        triggerToast(err.message || "Failed to add style.", "info");
      }
    } finally {
      setAddingItem(false);
    }
  };

  const handleStartFabricEdit = (fab: any) => {
    setEditingFabricId(fab.id);
    setEditPrice(String(fab.pricePerYard || ""));
    setEditPricingUnit(fab.pricingUnit || "Yard");
    setEditMinQty(String(fab.minOrderQty || "1"));
    setEditMaxQty(String(fab.maxOrderQty || "10"));
    setEditStock(fab.stockAvailability || "In Stock");
  };

  const handleSaveFabricEdit = async (id: string) => {
    if (!editPrice || isNaN(Number(editPrice))) {
      triggerToast("Please enter a valid numeric price", "info");
      return;
    }
    setUpdatingFabric(true);
    const updates = {
      pricePerYard: Number(editPrice),
      pricingUnit: editPricingUnit,
      minOrderQty: Number(editMinQty),
      maxOrderQty: Number(editMaxQty),
      stockAvailability: editStock
    };
    try {
      if (isTestingMode()) {
        const updatedFabrics = (catalog.fabrics || []).map(f => {
          if (f.id === id) {
            return { ...f, ...updates };
          }
          return f;
        });
        setCatalog({ ...catalog, fabrics: updatedFabrics });
        triggerToast("Testing Mode: Fabric updated locally in current session.");
        if (onCatalogChanged) onCatalogChanged();
      } else {
        await updateFabricAdmin(id, updates);
        triggerToast("Boutique item updated successfully!");
        await loadCatalog();
        if (onCatalogChanged) onCatalogChanged();
      }
      setEditingFabricId(null);
    } catch (err: any) {
      triggerToast(err.message || "Failed to update boutique item details.", "info");
    } finally {
      setUpdatingFabric(false);
    }
  };

  const handleDeleteFabric = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom fabric?")) return;
    try {
      await deleteFabricAdmin(id);
      triggerToast("Fabric deleted from showroom.");
      await loadCatalog();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err: any) {
      if (isTestingMode()) {
        const updatedFabrics = (catalog.fabrics || []).filter(f => f.id !== id);
        const updatedCatalog = { ...catalog, fabrics: updatedFabrics };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Fabric deleted from current session view.");
        if (onCatalogChanged) onCatalogChanged();
      } else {
        triggerToast(err.message || "Failed to delete fabric.", "info");
      }
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this showcase item?")) return;
    try {
      await deleteGalleryAdmin(id);
      triggerToast("Showcase item deleted.");
      await loadCatalog();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err: any) {
      if (isTestingMode()) {
        const updatedGallery = (catalog.gallery || []).filter(g => g.id !== id);
        const updatedCatalog = { ...catalog, gallery: updatedGallery };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Showcase item deleted from current session view.");
        if (onCatalogChanged) onCatalogChanged();
      } else {
        triggerToast(err.message || "Failed to delete showcase item.", "info");
      }
    }
  };

  const handleDeleteStyle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this style inspiration?")) return;
    try {
      await deleteStyleAdmin(id);
      triggerToast("Style inspiration deleted.");
      await loadCatalog();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err: any) {
      if (isTestingMode()) {
        const updatedStyles = (catalog.styles || []).filter(s => s.id !== id);
        const updatedCatalog = { ...catalog, styles: updatedStyles };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Style inspiration deleted from current session view.");
        if (onCatalogChanged) onCatalogChanged();
      } else {
        triggerToast(err.message || "Failed to delete style.", "info");
      }
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setLoadingContact(true);
      fetchContactInfo()
        .then((data) => {
          if (data) {
            setContactInfo({
              logoUrl: "/src/assets/images/oluwashola_logo_1784138680903.jpg",
              heroBgUrl: "/src/assets/images/textile_hero_1784138693639.jpg",
              ...data
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load contact info:", err);
        })
        .finally(() => {
          setLoadingContact(false);
        });
    }
  }, [isAdmin]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      if (isTestingMode()) {
        localStorage.setItem("oluwashola_testing_contact", JSON.stringify(contactInfo));
        triggerToast("Testing Mode: Contact info updated locally!");
      } else {
        await updateContactInfoAdmin(contactInfo);
        triggerToast("Contact info successfully updated on server!");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to update contact info", "info");
    } finally {
      setSavingContact(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setIsAdmin(false);
    setAdminEmail("");
    setStep("email");
    setOtpCode("");
    triggerToast("Administrative session closed safely.", "info");
  };

  const [performingAction, setPerformingAction] = useState(false);

  const handleSeedCatalog = async () => {
    if (!confirm("Are you sure you want to seed the default showroom catalog into the database? This will clear any existing items to prevent duplicates.")) return;
    setPerformingAction(true);
    try {
      if (isTestingMode()) {
        triggerToast("Testing Mode: Seeding only works when connected to real database fallback.");
      } else {
        const res = await seedDefaultCatalogAdmin();
        triggerToast(res.message);
        await loadCatalog();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to seed default catalog.", "info");
    } finally {
      setPerformingAction(false);
    }
  };

  const handleClearCatalog = async () => {
    if (!confirm("Are you sure you want to clear ALL showroom items (fabrics, showcase, and styles)? This is excellent for verifying empty/welcoming states.")) return;
    setPerformingAction(true);
    try {
      if (isTestingMode()) {
        const updatedCatalog = { fabrics: [], gallery: [], styles: [] };
        setCatalog(updatedCatalog);
        triggerToast("Testing Mode: Local catalog cleared.");
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const res = await clearCatalogAdmin();
        triggerToast(res.message);
        await loadCatalog();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to clear catalog.", "info");
    } finally {
      setPerformingAction(false);
    }
  };

  const handleSeedSection = async (section: string) => {
    setIsSeeding(true);
    try {
      if (isTestingMode()) {
        if (section === "fabrics") {
          const mockFabrics = [
            {
              id: "fab-gen-" + Math.random().toString(36).substring(2, 9),
              name: "Royal Emerald Beaded Voile Lace",
              category: "Lace",
              pricePerYard: 55000,
              availableColors: ["Emerald Green", "Champagne Gold"],
              colorsHex: ["#064e3b", "#f1e9d2"],
              description: "Luxury Swiss voile lace intricately beaded with royal emerald green sequins and high-quality gold lurex thread details. Exquisite weight and drape, ideal for bridal owambe and high society events.",
              stockAvailability: "In Stock",
              imageUrl: "https://images.unsplash.com/photo-1594224140980-6e9dd0223e38?auto=format&fit=crop&q=80&w=600"
            },
            {
              id: "fab-gen-" + Math.random().toString(36).substring(2, 9),
              name: "Sunset Imperial Ankara Wax",
              category: "Ankara",
              pricePerYard: 18000,
              availableColors: ["Saffron Orange", "Teal Waves", "Indigo Blue"],
              colorsHex: ["#ea580c", "#0d9488", "#1e3a8a"],
              description: "Exclusive high-grade Vlisco Ankara cotton wax print with a stunning vintage sunburst sunset pattern. Features rich, colorfast dyes and structured handfeel perfect for traditional Senator, Kaftan, or custom gowns.",
              stockAvailability: "In Stock",
              imageUrl: "https://images.unsplash.com/photo-1584184924103-e310d9dc82fc?auto=format&fit=crop&q=80&w=600"
            },
            {
              id: "fab-gen-" + Math.random().toString(36).substring(2, 9),
              name: "Crimson Gold Handloomed Aso Oke",
              category: "Aso Oke",
              pricePerYard: 70000,
              availableColors: ["Crimson Wine", "Bronze Gold"],
              colorsHex: ["#7f1d1d", "#b45309"],
              description: "Masterfully hand-loomed traditional Yoruba fabric interwoven with premium metallic bronze and crimson gold threads for an unmatched royal reflection. Ideal for majestic caps, geles, sashes, and luxury custom Agbada sets.",
              stockAvailability: "Low Stock",
              imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
            }
          ];
          const updatedCatalog = { ...catalog, fabrics: [...(catalog.fabrics || []), ...mockFabrics] };
          setCatalog(updatedCatalog);
        } else if (section === "gallery") {
          const mockGallery = [
            {
              id: "work-gen-" + Math.random().toString(36).substring(2, 9),
              title: "The Sovereign Sapphire Agbada Masterpiece",
              category: "Traditional",
              description: "A majestic 4-piece flowing traditional Nigerian Agbada tailored to absolute perfection in luxury royal blue Aso Oke. Features complex golden hand embroidery on the breastplate and sleeves, designed for standard-set traditional events.",
              imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
            },
            {
              id: "work-gen-" + Math.random().toString(36).substring(2, 9),
              title: "Gilded Emerald Mermaid Lace Corset",
              category: "Female",
              description: "A breathtaking bespoke floor-length mermaid bridal reception dress tailored in fine Swiss beaded lace. Finished with a sturdy hand-boned corset structure and elegant emerald satin underlays.",
              imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
            },
            {
              id: "work-gen-" + Math.random().toString(36).substring(2, 9),
              title: "Imperial Ivory Senator Kaftan",
              category: "Male",
              description: "Premium tailored ivory-white senator suit with minimalist asymmetric navy piping and a custom monogrammed chest seal. Crafted in superfine breathable Italian wool-cashmere blend.",
              imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600"
            }
          ];
          const updatedCatalog = { ...catalog, gallery: [...(catalog.gallery || []), ...mockGallery] };
          setCatalog(updatedCatalog);
        } else if (section === "styles") {
          const mockStyles = [
            {
              id: "style-gen-" + Math.random().toString(36).substring(2, 9),
              name: "Regal Sovereign Agbada Style",
              category: "Traditional",
              description: "A majestic flowing traditional Nigerian 4-piece Agbada ensemble including the grand outer gown, matching long-sleeve Kaftan undergarment, slim straight-leg trousers, and custom matching cap. Exudes leadership and absolute status.",
              estimatedYardage: "7-8 Yards of Fabric (e.g. Cashmere, Brocade) + 2 Yards of Accent Aso Oke",
              imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
            },
            {
              id: "style-gen-" + Math.random().toString(36).substring(2, 9),
              name: "Corset Mermaid Lace Silhouette",
              category: "Female",
              description: "A tailored-to-fit evening and wedding design. Built on a sturdy boned corset foundation, cascading into a sweeping flare that highlights the fabrics' lace pattern beautifully.",
              estimatedYardage: "5-6 Yards of Luxury Swiss Lace/Satin",
              imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
            },
            {
              id: "style-gen-" + Math.random().toString(36).substring(2, 9),
              name: "Crisp Senator Kaftan Style",
              category: "Male",
              description: "Modern formal African elegance. High band collar, slim tapered sleeves, straight straight-cut trousers, highlighted by structured geometric embroidery or high-contrast side piping.",
              estimatedYardage: "4 Yards of Superfine Cashmere or Wool",
              imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600"
            }
          ];
          const updatedCatalog = { ...catalog, styles: [...(catalog.styles || []), ...mockStyles] };
          setCatalog(updatedCatalog);
        }
        triggerToast(`Testing Mode: Section seeded successfully locally.`);
        setShowSeedDialog(false);
        if (onCatalogChanged) onCatalogChanged();
      } else {
        const token = getAdminToken() || "";
        const res = await fetch("/api/admin/seed-section", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ section })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to seed section");
        }

        triggerToast(`Showroom section seeded successfully with realistic items!`, "success");
        setShowSeedDialog(false);
        await loadCatalog();
        if (onCatalogChanged) onCatalogChanged();
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to seed section.", "info");
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto bg-stone-950/40 backdrop-blur-sm">
        
        {/* Backdrop for desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-950/60 hidden md:block"
          id="admin-modal-backdrop"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="relative w-full h-full md:max-w-6xl md:h-[88vh] flex flex-col overflow-hidden rounded-none md:rounded-3xl border-0 md:border border-amber-500/20 bg-[#FAF9F6] text-stone-900 shadow-2xl z-10"
        >
          {/* Top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-amber-500 z-20" />

          {/* Header section */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between shrink-0 bg-stone-100/60 pt-7">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-amber-700 h-5 w-5" />
              <h2 className="font-serif text-xs sm:text-sm tracking-[0.2em] text-amber-800 uppercase font-bold">
                {isAdmin ? "ADMIN CONTROL CENTER" : "ADMINISTRATION ACCESS"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 p-1.5 rounded-full hover:bg-stone-200 transition"
              id="admin-close-modal-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Core Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col">
            
            {/* NO AUTHENTICATION: SHOW LOG IN FLOW */}
            {!isAdmin && (
              <div className="py-6 sm:py-12 flex flex-col items-center justify-center flex-1">
                <div className="w-full max-w-md bg-white border border-stone-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col items-center">
                  <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-700 mb-6">
                    <Lock size={28} className="animate-pulse" />
                  </div>

                  <p className="text-center text-xs text-stone-600 max-w-sm mb-6 leading-relaxed font-sans">
                    {isProduction 
                      ? "Unauthorized access is strictly monitored. Please authenticate using your secure administrative email and OTP code."
                      : "Unauthorized access is strictly monitored. To verify credentials, enter your development bypass key or choose standard email OTP verification."
                    }
                  </p>

                {/* Auth Mode Toggle */}
                {!isProduction && (
                  <div className="flex border border-stone-200 rounded-xl p-1 mb-6 w-full max-w-xs shrink-0 bg-stone-100/50">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("key");
                        setError(null);
                      }}
                      className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all duration-300 ${
                        authMode === "key"
                          ? "bg-amber-700/10 text-amber-800 border border-amber-700/15 shadow-sm font-semibold"
                          : "text-stone-500 hover:text-stone-800 border border-transparent"
                      }`}
                    >
                      Bypass Key
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("email");
                        setError(null);
                      }}
                      className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all duration-300 ${
                        authMode === "email"
                          ? "bg-amber-700/10 text-amber-800 border border-amber-700/15 shadow-sm font-semibold"
                          : "text-stone-500 hover:text-stone-800 border border-transparent"
                      }`}
                    >
                      Email OTP
                    </button>
                  </div>
                )}

                {error && (
                  <div className="w-full flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl mb-6">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="font-sans leading-normal">{error}</p>
                  </div>
                )}

                {/* BYPASS KEY AUTH MODE */}
                {!isProduction && authMode === "key" && (
                  <form onSubmit={handleVerifyBypassKey} className="w-full space-y-4">
                    <div className="space-y-1.5 text-left w-full">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                          Bypass / Testing Key
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setBypassKey(DEFAULT_BYPASS_KEY);
                            triggerToast("Default testing key filled.");
                          }}
                          className="text-[9px] font-mono text-amber-700 hover:text-amber-800 hover:underline"
                          title="Pre-fill testing key"
                        >
                          Auto-fill key
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                          <Key size={16} />
                        </span>
                        <input
                          type="password"
                          required
                          value={bypassKey}
                          onChange={(e) => setBypassKey(e.target.value)}
                          placeholder="Enter 64-character hex key..."
                          className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-600/50 rounded-xl py-3 pl-11 pr-4 text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition font-sans font-mono"
                        />
                      </div>
                      <p className="text-[9px] font-mono text-stone-400 leading-normal text-left w-full">
                        Default key: <code className="text-amber-700 select-all">86a75ad4...11b3</code>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold text-xs py-3.5 rounded-xl uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          Verify Bypass Key
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* EMAIL OTP AUTH MODE */}
                {authMode === "email" && (
                  <div className="w-full">
                    {/* STEP 1: ENTER ADMINISTRATIVE EMAIL */}
                    {step === "email" && (
                      <form onSubmit={handleRequestOtp} className="w-full space-y-4">
                        <div className="space-y-1.5 text-left w-full">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                            Admin Account Email
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                              <Mail size={16} />
                            </span>
                            <input
                              type="email"
                              required
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              placeholder="e.g. admin@yourdomain.com"
                              className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-600/50 rounded-xl py-3 pl-11 pr-4 text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition font-sans"
                            />
                          </div>
                          <div className="px-1">
                            <p className="text-[9px] font-mono text-stone-400">
                              Please enter the exact configured admin email to receive the secure OTP code.
                            </p>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold text-xs py-3.5 rounded-xl uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <Key size={14} />
                              Request Verification Key
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* STEP 2: ENTER OTP CODE */}
                    {step === "otp" && (
                      <form onSubmit={handleVerifyOtp} className="w-full space-y-5">
                        <div className="space-y-1.5 text-left w-full">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                              6-Digit OTP Code
                            </label>
                            <span className="text-[10px] font-mono text-amber-700 font-bold">
                              Expires in: {formatTime(timeLeft)}
                            </span>
                          </div>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                              <ShieldCheck size={16} />
                            </span>
                            <input
                              type="text"
                              maxLength={6}
                              required
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                              placeholder="000000"
                              className="w-full bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-amber-600/50 rounded-xl py-3 pl-11 pr-4 text-center text-lg font-mono tracking-[0.5em] text-stone-850 placeholder-stone-300 focus:outline-none transition"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || timeLeft === 0}
                          className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold text-xs py-3.5 rounded-xl uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            "Verify & Authorize"
                          )}
                        </button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setStep("email");
                              setOtpCode("");
                              setError(null);
                            }}
                            className="text-[10px] font-mono uppercase tracking-widest text-stone-500 hover:text-stone-800 transition"
                          >
                            ← Back to Email
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}

            {/* AUTHENTICATED: SHOW ADMIN DASHBOARD */}
            {isAdmin && (
              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Tab Navigation Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 shrink-0 gap-4 mb-2 pb-1">
                  <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setActiveTab("gallery")}
                      className={`pb-3 px-4 font-serif text-xs tracking-wider uppercase border-b-2 transition shrink-0 ${
                        activeTab === "gallery" ? "border-amber-600 text-amber-800 font-bold" : "border-transparent text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Showcase Gallery
                    </button>
                    <button
                      onClick={() => setActiveTab("fabrics")}
                      className={`pb-3 px-4 font-serif text-xs tracking-wider uppercase border-b-2 transition shrink-0 ${
                        activeTab === "fabrics" ? "border-amber-600 text-amber-800 font-bold" : "border-transparent text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Boutique & Shop Inventory
                    </button>
                    <button
                      onClick={() => setActiveTab("contact")}
                      className={`pb-3 px-4 font-serif text-xs tracking-wider uppercase border-b-2 transition shrink-0 ${
                        activeTab === "contact" ? "border-amber-600 text-amber-800 font-bold" : "border-transparent text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      Contact and Pages Settings
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pb-2 self-stretch sm:self-auto justify-end flex-wrap relative">
                    {(() => {
                      const isGalleryEmpty = !catalog.gallery || catalog.gallery.length === 0;
                      const isFabricsEmpty = !catalog.fabrics || catalog.fabrics.length === 0;
                      const isStylesEmpty = !catalog.styles || catalog.styles.length === 0;
                      const canSeed = isGalleryEmpty || isFabricsEmpty || isStylesEmpty;

                      return (
                        <div className="relative">
                          <button
                            onClick={() => setShowAdminMenu(!showAdminMenu)}
                            className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl px-4 py-2 text-[10px] uppercase font-mono tracking-wider transition font-medium cursor-pointer"
                            id="admin-controls-dropdown-btn"
                          >
                            <Sliders size={12} className="text-stone-600" />
                            Admin Control ▾
                          </button>

                          {showAdminMenu && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowAdminMenu(false)}
                              />
                              <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden font-mono text-[9px] uppercase tracking-wider divide-y divide-stone-100">
                                {canSeed && (
                                  <button
                                    onClick={() => {
                                      setShowAdminMenu(false);
                                      setShowSeedDialog(true);
                                    }}
                                    className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-emerald-50/50 text-emerald-800 hover:text-emerald-900 transition font-semibold"
                                  >
                                    <Sparkles size={11} className="text-emerald-600" />
                                    Seed Catalog
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setShowAdminMenu(false);
                                    handleLogout();
                                  }}
                                  className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-rose-50/50 text-rose-700 hover:text-rose-800 transition font-semibold"
                                >
                                  <LogOut size={11} className="text-rose-600" />
                                  Log Out
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

            {/* Showroom Tab Content Sections */}
            {activeTab === "fabrics" && (
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 min-h-0 text-left pb-10 scrollbar-thin">
                {/* 1. Existing Fabrics Section (Scrollable List) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm shrink-0">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-xs text-stone-800 font-bold uppercase tracking-wider">Existing Boutique & Shop Inventory</h3>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">Total: {catalog.fabrics?.length || 0} items listed</p>
                    </div>
                    {loadingCatalog && <Loader2 size={12} className="animate-spin text-amber-700" />}
                  </div>
                  
                  {/* Scrollable grid of items inside the card */}
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    {catalog.fabrics?.length === 0 ? (
                      <div className="text-center py-12 text-stone-400 text-xs">
                        No items found in boutique inventory.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2 pt-1">
                        {catalog.fabrics?.map((fab: any) => {
                          const isEditing = editingFabricId === fab.id;
                          return (
                            <div key={fab.id} className="bg-stone-50/50 border border-stone-200 rounded-xl p-3 flex gap-3 items-center relative group shadow-sm hover:border-amber-600/30 hover:bg-stone-50 transition duration-300 animate-fadeIn">
                              <img src={fab.imageUrl} alt={fab.name} className="h-14 w-14 rounded-lg object-cover bg-white border border-stone-200 shrink-0" />
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-[9px] font-mono text-amber-800 uppercase tracking-wide font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">{fab.category}</span>
                                  {fab.gender && fab.gender !== "All" && (
                                    <span className="text-[8px] font-mono bg-stone-100 text-stone-600 px-1 rounded uppercase font-semibold">{fab.gender}</span>
                                  )}
                                  {fab.ageGroup && fab.ageGroup !== "All" && (
                                    <span className="text-[8px] font-mono bg-stone-100 text-stone-600 px-1 rounded uppercase font-semibold">{fab.ageGroup}</span>
                                  )}
                                </div>
                                <h4 className="font-sans text-stone-900 font-semibold text-xs truncate">{fab.name}</h4>
                                
                                {isEditing ? (
                                  <div className="space-y-1.5 mt-1.5 bg-stone-100 p-1.5 rounded-lg border border-stone-200">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] text-stone-500 font-mono">₦</span>
                                      <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="w-full bg-white border border-stone-200 rounded px-1.5 py-0.5 font-mono text-[10px]"
                                        placeholder="Price"
                                      />
                                      <select
                                        value={editPricingUnit}
                                        onChange={(e) => setEditPricingUnit(e.target.value)}
                                        className="bg-white border border-stone-200 rounded px-1 py-0.5 text-[9px] font-mono"
                                      >
                                        <option value="Yard">Yard</option>
                                        <option value="Dozen">Dozen</option>
                                        <option value="Unit">Unit</option>
                                        <option value="3 Yard">3 Yard</option>
                                        <option value="4 Yard">4 Yard</option>
                                        <option value="Pack">Pack</option>
                                        <option value="Fixed">Fixed Price</option>
                                      </select>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={editStock}
                                        onChange={(e) => setEditStock(e.target.value)}
                                        className="w-full bg-white border border-stone-200 rounded px-1 py-0.5 text-[9px] font-mono"
                                      >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveFabricEdit(fab.id)}
                                        disabled={updatingFabric}
                                        className="p-1 bg-amber-700 text-white rounded hover:bg-amber-800 transition"
                                        title="Save Edits"
                                      >
                                        <Check size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingFabricId(null)}
                                        className="p-1 bg-stone-300 text-stone-700 rounded hover:bg-stone-400 transition"
                                        title="Cancel"
                                      >
                                        <X size={10} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-[10px] text-stone-500 font-mono mt-0.5 flex items-center gap-1.5">
                                      <span>₦{fab.pricePerYard?.toLocaleString()} / {fab.pricingUnit || "Yard"}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleStartFabricEdit(fab)}
                                        className="p-0.5 text-stone-400 hover:text-amber-800 rounded transition"
                                        title="Edit Price/Unit"
                                      >
                                        <Edit2 size={10} />
                                      </button>
                                    </p>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono inline-block mt-1 ${fab.stockAvailability === "In Stock" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                                      {fab.stockAvailability}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {!isEditing && (
                                <button
                                  onClick={() => handleDeleteFabric(fab.id)}
                                  className="absolute top-2 right-2 p-1.5 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-700 rounded-lg border border-stone-100 hover:border-rose-200 transition"
                                  title="Delete item"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Add New Section (Below, fully visible/accessible) */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 shrink-0">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Plus size={14} className="text-amber-800" />
                    <h3 className="font-serif text-xs uppercase tracking-wider text-amber-850 font-bold">Add Boutique Product / Supplies to Store</h3>
                  </div>
                  <form onSubmit={handleAddFabric} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Product / Item Name</label>
                        <input
                          type="text"
                          required
                          value={fabName}
                          onChange={(e) => setFabName(e.target.value)}
                          placeholder="e.g. Royal Silk Velvet or Premium Tailoring Shears"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 placeholder-stone-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Category</label>
                          <select
                            value={fabCategory}
                            onChange={(e) => setFabCategory(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-semibold"
                          >
                            <option value="Ready-to-Wear">Ready-to-Wear</option>
                            <option value="Tailoring Tools">Tailoring Tools</option>
                            <option value="Fashion Accessories">Fashion Accessories</option>
                            <option value="Bespoke Fabric">Bespoke Fabric</option>
                            <option value="Luxury Lace">Luxury Lace</option>
                            <option value="Ankara Bulk">Ankara Bulk</option>
                            <option value="Other Supplies">Other Supplies</option>
                            <option value="Custom">Custom (Specify below)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Price per Unit / Pack (₦)</label>
                          <input
                            type="number"
                            required
                            value={fabPrice}
                            onChange={(e) => setFabPrice(e.target.value)}
                            placeholder="e.g. 15000"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800"
                          />
                        </div>
                      </div>
                    </div>

                    {fabCategory === "Custom" && (
                      <div className="space-y-1 bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-xl animate-fadeIn">
                        <label className="text-amber-800 font-mono text-[9px] uppercase tracking-wider block font-semibold">Custom Product Category Name</label>
                        <input
                          type="text"
                          required
                          value={customFabCategory}
                          onChange={(e) => setCustomFabCategory(e.target.value)}
                          placeholder="e.g. Designer Pins, Sewing Machines, Thread Set"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 placeholder-stone-400"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Target Gender / Category</label>
                        <select
                          value={fabGender}
                          onChange={(e) => setFabGender(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-semibold text-xs"
                        >
                          <option value="All">All / Works for Both</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Target Age Group</label>
                        <select
                          value={fabAgeGroup}
                          onChange={(e) => setFabAgeGroup(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-semibold text-xs"
                        >
                          <option value="All">All / Works for All Ages</option>
                          <option value="Young">Young</option>
                          <option value="Teenagers">Teenagers</option>
                          <option value="Adult">Adult</option>
                          <option value="Elder">Elder</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Available Colors/Styles (Comma Separated)</label>
                        <input
                          type="text"
                          value={fabColors}
                          onChange={(e) => setFabColors(e.target.value)}
                          placeholder="e.g. Red, Blue, Gold, Classic Silver"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 placeholder-stone-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Stock Status</label>
                        <select
                          value={fabStock}
                          onChange={(e) => setFabStock(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-stone-100/50 p-3.5 border border-stone-200 rounded-xl">
                      <div className="space-y-1 col-span-1">
                        <label className="text-stone-600 font-mono text-[9px] uppercase tracking-wider block font-bold">Pricing Unit</label>
                        <select
                          value={fabPricingUnit}
                          onChange={(e) => setFabPricingUnit(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-800 font-semibold text-xs"
                        >
                          <option value="Yard">Yard</option>
                          <option value="Unit">Unit (Piece)</option>
                          <option value="Dozen">Dozen</option>
                          <option value="3 Yards">3 Yards</option>
                          <option value="Pack">Pack</option>
                          <option value="Set">Set</option>
                        </select>
                      </div>
                      <div className="space-y-1 col-span-1">
                        <label className="text-stone-600 font-mono text-[9px] uppercase tracking-wider block font-bold">Min Order Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={fabMinOrderQty}
                          onChange={(e) => setFabMinOrderQty(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-800 text-xs"
                        />
                      </div>
                      <div className="space-y-1 col-span-1">
                        <label className="text-stone-600 font-mono text-[9px] uppercase tracking-wider block font-bold">Max Order Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={fabMaxOrderQty}
                          onChange={(e) => setFabMaxOrderQty(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-800 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Description</label>
                      <textarea
                        value={fabDesc}
                        onChange={(e) => setFabDesc(e.target.value)}
                        rows={2}
                        placeholder="A premium description..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 resize-none placeholder-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Image Source</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 font-sans">
                          <input
                            type="radio"
                            checked={fabImageType === "default"}
                            onChange={() => setFabImageType("default")}
                            className="accent-amber-700"
                          />
                          Unsplash Preset
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 font-sans">
                          <input
                            type="radio"
                            checked={fabImageType === "upload"}
                            onChange={() => setFabImageType("upload")}
                            className="accent-amber-700"
                          />
                          Custom Upload
                        </label>
                      </div>

                      {fabImageType === "upload" ? (
                        <div className="border border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-amber-600/40 transition bg-stone-50/50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const base = await convertFileToBase64(file);
                                  setFabImageFile(base);
                                  triggerToast("Fabric image loaded successfully!");
                                } catch (err) {
                                  triggerToast("Error loading file", "info");
                                }
                              }
                            }}
                            className="hidden"
                            id="fabric-img-upload"
                          />
                          <label htmlFor="fabric-img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={18} className="text-stone-400" />
                            <span className="text-[10px] text-stone-500">
                              {fabImageFile ? "Image Loaded (Click to Change)" : "Upload Custom Fabric Image"}
                            </span>
                          </label>
                          {fabImageFile && (
                            <img src={fabImageFile} className="mt-2 h-14 mx-auto rounded-lg object-cover" alt="Preview" />
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400 italic">
                          Category default image will be assigned automatically.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={addingItem}
                      className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold py-2.5 rounded-xl uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {addingItem ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <><Plus size={12} /> Add Fabric</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 min-h-0 text-left pb-10 scrollbar-thin">
                {/* 1. Existing Gallery Section (Scrollable List) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm shrink-0">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-xs text-stone-800 font-bold uppercase tracking-wider">Existing Showcase Designs</h3>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">Total: {catalog.gallery?.length || 0} items published</p>
                    </div>
                    {loadingCatalog && <Loader2 size={12} className="animate-spin text-amber-700" />}
                  </div>
                  
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    {catalog.gallery?.length === 0 ? (
                      <div className="text-center py-12 text-stone-400 text-xs">
                        No showcase items found in catalog.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2 pt-1">
                        {catalog.gallery?.map((gal: any) => (
                          <div key={gal.id} className="bg-stone-50/50 border border-stone-200 rounded-xl p-3 flex gap-3 items-center relative group shadow-sm hover:border-amber-600/30 hover:bg-stone-50 transition duration-300 animate-fadeIn">
                            <img src={gal.imageUrl} alt={gal.title} className="h-14 w-14 rounded-lg object-cover bg-white border border-stone-200 shrink-0" />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-[9px] font-mono text-amber-800 uppercase tracking-wide block font-semibold">{getCategoryDisplayLabel(gal.category)}</span>
                              <h4 className="font-sans text-stone-900 font-semibold text-xs truncate">{gal.title}</h4>
                              <p className="text-[10px] text-stone-500 truncate mt-0.5">{gal.description}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteGallery(gal.id)}
                              className="absolute top-2 right-2 p-1.5 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-700 rounded-lg border border-stone-100 hover:border-rose-200 transition"
                              title="Delete showcase item"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Add New Section (Below, fully visible/accessible) */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 shrink-0">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Plus size={14} className="text-amber-800" />
                    <h3 className="font-serif text-xs uppercase tracking-wider text-amber-850 font-bold">Add Showcase Item to Gallery</h3>
                  </div>
                  <form onSubmit={handleAddGallery} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Showcase Title</label>
                      <input
                        type="text"
                        required
                        value={galTitle}
                        onChange={(e) => setGalTitle(e.target.value)}
                        placeholder="e.g. Crystal Embellished Lace Dress"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 placeholder-stone-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-50 p-3.5 border border-stone-200 rounded-xl">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Gender</label>
                        <select
                          value={galGender}
                          onChange={(e) => setGalGender(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-medium"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Age Group</label>
                        <select
                          value={galAgeGroup}
                          onChange={(e) => setGalAgeGroup(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-medium"
                        >
                          <option value="Adult">Adult</option>
                          <option value="Kids">Kids</option>
                          <option value="Middle Age">Middle Age</option>
                          <option value="Elder">Elder</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Style Type</label>
                        <select
                          value={galStyleType}
                          onChange={(e) => setGalStyleType(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-medium"
                        >
                          <option value="Traditional">Traditional</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Casual">Casual</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Children">Children</option>
                          <option value="Custom">Custom (Specific Type)</option>
                        </select>
                      </div>

                      {galStyleType === "Custom" && (
                        <div className="space-y-1">
                          <label className="text-amber-700 font-mono text-[9px] uppercase tracking-wider block font-semibold">Specific Style Type</label>
                          <input
                            type="text"
                            required
                            value={galCustom}
                            onChange={(e) => setGalCustom(e.target.value)}
                            placeholder="e.g. Agbada, Embroidery"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-650/50 text-stone-800 placeholder-stone-400 font-medium"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Description</label>
                      <textarea
                        value={galDesc}
                        onChange={(e) => setGalDesc(e.target.value)}
                        rows={2}
                        placeholder="Designer bespoke specifications..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 resize-none placeholder-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Image Source</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 font-sans">
                          <input
                            type="radio"
                            checked={galImageType === "default"}
                            onChange={() => setGalImageType("default")}
                            className="accent-amber-700"
                          />
                          Unsplash Preset
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 font-sans">
                          <input
                            type="radio"
                            checked={galImageType === "upload"}
                            onChange={() => setGalImageType("upload")}
                            className="accent-amber-700"
                          />
                          Custom Upload
                        </label>
                      </div>

                      {galImageType === "upload" ? (
                        <div className="border border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-amber-600/40 transition bg-stone-50/50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const base = await convertFileToBase64(file);
                                  setGalImageFile(base);
                                  triggerToast("Showcase image loaded successfully!");
                                } catch (err) {
                                  triggerToast("Error loading file", "info");
                                }
                              }
                            }}
                            className="hidden"
                            id="gallery-img-upload"
                          />
                          <label htmlFor="gallery-img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={18} className="text-stone-400" />
                            <span className="text-[10px] text-stone-500">
                              {galImageFile ? "Image Loaded (Click to Change)" : "Upload Custom Showcase Image"}
                            </span>
                          </label>
                          {galImageFile && (
                            <img src={galImageFile} className="mt-2 h-14 mx-auto rounded-lg object-cover" alt="Preview" />
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400 italic">
                          Category default image will be assigned automatically.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={addingItem}
                      className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold py-2.5 rounded-xl uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {addingItem ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <><Plus size={12} /> Add Showcase Item</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "styles" && (
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 min-h-0 text-left pb-10 scrollbar-thin">
                {/* 1. Existing Styles Section (Scrollable List) */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm shrink-0">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                    <div>
                      <h3 className="font-serif text-xs text-stone-800 font-bold uppercase tracking-wider">Existing Style Inspirations</h3>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">Total: {catalog.styles?.length || 0} styles available</p>
                    </div>
                    {loadingCatalog && <Loader2 size={12} className="animate-spin text-amber-700" />}
                  </div>
                  
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    {catalog.styles?.length === 0 ? (
                      <div className="text-center py-12 text-stone-400 text-xs">
                        No styles found in catalog.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2 pt-1">
                        {catalog.styles?.map((sty: any) => (
                          <div key={sty.id} className="bg-stone-50/50 border border-stone-200 rounded-xl p-3 flex gap-3 items-center relative group shadow-sm hover:border-amber-600/30 hover:bg-stone-50 transition duration-300 animate-fadeIn">
                            <img src={sty.imageUrl} alt={sty.name} className="h-14 w-14 rounded-lg object-cover bg-white border border-stone-200 shrink-0" />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-[9px] font-mono text-amber-800 uppercase tracking-wide block font-semibold">{getCategoryDisplayLabel(sty.category)}</span>
                              <h4 className="font-sans text-stone-900 font-semibold text-xs truncate">{sty.name}</h4>
                              <p className="text-[10px] text-stone-500 font-mono mt-0.5">{sty.estimatedYardage} Needed</p>
                            </div>
                            <button
                              onClick={() => handleDeleteStyle(sty.id)}
                              className="absolute top-2 right-2 p-1.5 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-700 rounded-lg border border-stone-100 hover:border-rose-200 transition"
                              title="Delete style"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Add New Section (Below, fully visible/accessible) */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 shrink-0">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Plus size={14} className="text-amber-800" />
                    <h3 className="font-serif text-xs uppercase tracking-wider text-amber-850 font-bold">Add Style Inspiration</h3>
                  </div>
                  <form onSubmit={handleAddStyle} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Style Name</label>
                        <input
                          type="text"
                          required
                          value={styName}
                          onChange={(e) => setStyName(e.target.value)}
                          placeholder="e.g. Agbada Traditional 4-Piece"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 placeholder-stone-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Est. Yardage Needed</label>
                        <input
                          type="text"
                          required
                          value={styYardage}
                          onChange={(e) => setStyYardage(e.target.value)}
                          placeholder="e.g. 4-5 Yards"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 placeholder-stone-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-50 p-3.5 border border-stone-200 rounded-xl">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Gender</label>
                        <select
                          value={styGender}
                          onChange={(e) => setStyGender(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-medium"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Age Group</label>
                        <select
                          value={styAgeGroup}
                          onChange={(e) => setStyAgeGroup(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-medium"
                        >
                          <option value="Adult">Adult</option>
                          <option value="Kids">Kids</option>
                          <option value="Middle Age">Middle Age</option>
                          <option value="Elder">Elder</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Style Type</label>
                        <select
                          value={styStyleType}
                          onChange={(e) => setStyStyleType(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-medium"
                        >
                          <option value="Traditional">Traditional</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Casual">Casual</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Children">Children</option>
                          <option value="Custom">Custom (Specific Type)</option>
                        </select>
                      </div>

                      {styStyleType === "Custom" && (
                        <div className="space-y-1">
                          <label className="text-amber-700 font-mono text-[9px] uppercase tracking-wider block font-semibold">Specific Style Type</label>
                          <input
                            type="text"
                            required
                            value={styCustom}
                            onChange={(e) => setStyCustom(e.target.value)}
                            placeholder="e.g. Agbada, Embroidery"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-650/50 text-stone-800 placeholder-stone-400 font-medium"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Description</label>
                      <textarea
                        value={styDesc}
                        onChange={(e) => setStyDesc(e.target.value)}
                        rows={2}
                        placeholder="Atelier cut & stitching inspiration details..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 resize-none placeholder-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Image Source</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 font-sans">
                          <input
                            type="radio"
                            checked={styImageType === "default"}
                            onChange={() => setStyImageType("default")}
                            className="accent-amber-700"
                          />
                          Unsplash Preset
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 font-sans">
                          <input
                            type="radio"
                            checked={styImageType === "upload"}
                            onChange={() => setStyImageType("upload")}
                            className="accent-amber-700"
                          />
                          Custom Upload
                        </label>
                      </div>

                      {styImageType === "upload" ? (
                        <div className="border border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-amber-600/40 transition bg-stone-50/50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const base = await convertFileToBase64(file);
                                  setStyImageFile(base);
                                  triggerToast("Style image loaded successfully!");
                                } catch (err) {
                                  triggerToast("Error loading file", "info");
                                }
                              }
                            }}
                            className="hidden"
                            id="style-img-upload"
                          />
                          <label htmlFor="style-img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={18} className="text-stone-400" />
                            <span className="text-[10px] text-stone-500">
                              {styImageFile ? "Image Loaded (Click to Change)" : "Upload Custom Style Image"}
                            </span>
                          </label>
                          {styImageFile && (
                            <img src={styImageFile} className="mt-2 h-14 mx-auto rounded-lg object-cover" alt="Preview" />
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400 italic">
                          Category default image will be assigned automatically.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={addingItem}
                      className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold py-2.5 rounded-xl uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      {addingItem ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <><Plus size={12} /> Add Style</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 min-h-0 text-left pb-10 scrollbar-thin">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-amber-800" />
                      <h3 className="font-serif text-xs uppercase tracking-wider text-amber-850 font-bold">Update Atelier Contact and Pages Settings</h3>
                    </div>
                    {loadingContact && <Loader2 size={12} className="animate-spin text-amber-700" />}
                  </div>

                  <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                    Modify contact information, website addresses, active social profiles, custom brand logos, and page backgrounds shown across the digital showroom.
                  </p>

                  <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">WhatsApp Number (with +)</label>
                        <input
                          type="text"
                          required
                          value={contactInfo.phoneNumber}
                          onChange={(e) => setContactInfo({ ...contactInfo, phoneNumber: e.target.value })}
                          placeholder="e.g. +234705378152"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Display Phone Number</label>
                        <input
                          type="text"
                          required
                          value={contactInfo.displayPhone}
                          onChange={(e) => setContactInfo({ ...contactInfo, displayPhone: e.target.value })}
                          placeholder="e.g. 0705378152"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Electronic Mailbox Address</label>
                        <input
                          type="email"
                          required
                          value={contactInfo.emailAddress}
                          onChange={(e) => setContactInfo({ ...contactInfo, emailAddress: e.target.value })}
                          placeholder="info@oluwasholatextiles.com.ng"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Official Website</label>
                        <input
                          type="text"
                          value={contactInfo.websiteAddress || ""}
                          onChange={(e) => setContactInfo({ ...contactInfo, websiteAddress: e.target.value })}
                          placeholder="www.oluwasholatextiles.com.ng"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Atelier Physical Location</label>
                      <input
                        type="text"
                        required
                        value={contactInfo.physicalAddress}
                        onChange={(e) => setContactInfo({ ...contactInfo, physicalAddress: e.target.value })}
                        placeholder="39, Bamgbose Street, Lagos Island, Lagos State"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Google Map Embed Source URL</label>
                      <textarea
                        rows={2}
                        required
                        value={contactInfo.mapUrl}
                        onChange={(e) => setContactInfo({ ...contactInfo, mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/maps?q=..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 font-mono text-[10px]"
                      />
                    </div>

                    {/* Collapsible Atelier Branding Assets Section */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden transition duration-350 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setImageSectionBrandingOpen(!imageSectionBrandingOpen)}
                        className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/70 transition text-left focus:outline-none select-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-stone-700">1. Atelier Branding Assets</h4>
                            <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              2 Assets
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                            Configure custom brand logo and homepage background/backdrop banner.
                          </p>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-stone-200/50 hover:bg-stone-200 flex items-center justify-center transition shrink-0">
                          {imageSectionBrandingOpen ? (
                            <ChevronUp size={14} className="text-stone-650" />
                          ) : (
                            <ChevronDown size={14} className="text-stone-650" />
                          )}
                        </div>
                      </button>

                      {imageSectionBrandingOpen && (
                        <div className="p-4 pt-0 border-t border-stone-200/50 bg-stone-50/30 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Logo URL / Base64 upload */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Custom Logo Asset</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.logoUrl || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, logoUrl: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[11px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      logoUrl: "/src/assets/images/oluwashola_logo_1784138680903.jpg"
                                    });
                                    triggerToast("Logo reset to default value!");
                                  }}
                                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[10px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              
                              <div className="border border-dashed border-stone-200 rounded-xl p-3 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, logoUrl: base });
                                        triggerToast("New logo loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="branding-logo-upload"
                                />
                                <label htmlFor="branding-logo-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={14} className="text-stone-400" />
                                  <span className="text-[9px] text-stone-500 font-medium">Upload Custom Logo File</span>
                                </label>
                                {contactInfo.logoUrl && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1.5 rounded-lg border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.logoUrl} className="h-8 w-8 rounded-full object-cover" alt="Logo preview" />
                                    <span className="text-[8px] font-mono text-stone-400 truncate max-w-[120px]">
                                      {contactInfo.logoUrl.startsWith("data:") ? "Base64 Image" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Hero Bg URL / Base64 upload */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Custom Homepage Backdrop</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.heroBgUrl || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, heroBgUrl: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[11px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      heroBgUrl: "/src/assets/images/textile_hero_1784138693639.jpg"
                                    });
                                    triggerToast("Backdrop reset to default value!");
                                  }}
                                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[10px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              
                              <div className="border border-dashed border-stone-200 rounded-xl p-3 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, heroBgUrl: base });
                                        triggerToast("New backdrop loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="branding-bg-upload"
                                />
                                <label htmlFor="branding-bg-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={14} className="text-stone-400" />
                                  <span className="text-[9px] text-stone-500 font-medium">Upload Custom Backdrop File</span>
                                </label>
                                {contactInfo.heroBgUrl && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1.5 rounded-lg border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.heroBgUrl} className="h-8 w-14 rounded object-cover" alt="Backdrop preview" />
                                    <span className="text-[8px] font-mono text-stone-400 truncate max-w-[120px]">
                                      {contactInfo.heroBgUrl.startsWith("data:") ? "Base64 Image" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Showroom Wing Cover Images Section */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden transition duration-350 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setImageSectionWingsOpen(!imageSectionWingsOpen)}
                        className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/70 transition text-left focus:outline-none select-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-stone-700">2. Showroom Wing Cover Images</h4>
                            <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              4 Assets
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                            Configure custom header cover images for each of the showroom landing wings.
                          </p>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-stone-200/50 hover:bg-stone-200 flex items-center justify-center transition shrink-0">
                          {imageSectionWingsOpen ? (
                            <ChevronUp size={14} className="text-stone-650" />
                          ) : (
                            <ChevronDown size={14} className="text-stone-650" />
                          )}
                        </div>
                      </button>

                      {imageSectionWingsOpen && (
                        <div className="p-4 pt-0 border-t border-stone-200/50 bg-stone-50/30 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
                            
                            {/* 1. Our Legacy Cover */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">1. Our Legacy Cover</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.wingAboutBgUrl || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, wingAboutBgUrl: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      wingAboutBgUrl: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600"
                                    });
                                    triggerToast("Our Legacy image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, wingAboutBgUrl: base });
                                        triggerToast("Our Legacy image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="wing-about-upload"
                                />
                                <label htmlFor="wing-about-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.wingAboutBgUrl && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.wingAboutBgUrl} className="h-6 w-10 rounded object-cover" alt="Legacy Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.wingAboutBgUrl.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 2. Completed Jobs Showcase Cover */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">2. Completed Jobs Showcase Cover</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.wingGalleryBgUrl || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, wingGalleryBgUrl: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      wingGalleryBgUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600"
                                    });
                                    triggerToast("Completed Jobs Showcase image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, wingGalleryBgUrl: base });
                                        triggerToast("Showcase image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="wing-gallery-upload"
                                />
                                <label htmlFor="wing-gallery-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.wingGalleryBgUrl && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.wingGalleryBgUrl} className="h-6 w-10 rounded object-cover" alt="Gallery Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.wingGalleryBgUrl.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 3. Bespoke Boutique & Supplies Cover */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">3. Bespoke Boutique & Supplies Cover</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.wingFabricsBgUrl || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, wingFabricsBgUrl: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      wingFabricsBgUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
                                    });
                                    triggerToast("Bespoke Boutique image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, wingFabricsBgUrl: base });
                                        triggerToast("Boutique cover loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="wing-fabrics-upload"
                                />
                                <label htmlFor="wing-fabrics-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.wingFabricsBgUrl && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.wingFabricsBgUrl} className="h-6 w-10 rounded object-cover" alt="Fabrics Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.wingFabricsBgUrl.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 4. Contact Lagos Desk Cover */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">4. Contact Lagos Desk Cover</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.wingContactBgUrl || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, wingContactBgUrl: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      wingContactBgUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=600"
                                    });
                                    triggerToast("Contact Lagos Desk image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, wingContactBgUrl: base });
                                        triggerToast("Contact Lagos Desk cover loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="wing-contact-upload"
                                />
                                <label htmlFor="wing-contact-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.wingContactBgUrl && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.wingContactBgUrl} className="h-6 w-10 rounded object-cover" alt="Contact Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.wingContactBgUrl.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Advanced Industrial Machinery Images Section */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden transition duration-350 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setImageSectionMachineryOpen(!imageSectionMachineryOpen)}
                        className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/70 transition text-left focus:outline-none select-none"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-[11px] font-bold uppercase tracking-wider text-stone-700">3. Advanced Industrial Machinery Images</h4>
                            <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              5 Assets
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
                            Configure custom images for active machines shown in the "Our Legacy" (About) modal.
                          </p>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-stone-200/50 hover:bg-stone-200 flex items-center justify-center transition shrink-0">
                          {imageSectionMachineryOpen ? (
                            <ChevronUp size={14} className="text-stone-650" />
                          ) : (
                            <ChevronDown size={14} className="text-stone-650" />
                          )}
                        </div>
                      </button>

                      {imageSectionMachineryOpen && (
                        <div className="p-4 pt-0 border-t border-stone-200/50 bg-stone-50/30 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            
                            {/* 1. Monogram Machine */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">1. Monogram Machine Image</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.monogramMachineImg || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, monogramMachineImg: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      monogramMachineImg: "/src/assets/images/monogram_machine_1784385472639.jpg"
                                    });
                                    triggerToast("Monogram Machine image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, monogramMachineImg: base });
                                        triggerToast("Monogram Machine image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="monogram-machine-upload"
                                />
                                <label htmlFor="monogram-machine-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.monogramMachineImg && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.monogramMachineImg} className="h-6 w-10 rounded object-cover" alt="Monogram Machine Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.monogramMachineImg.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 2. Laser Cut Machine */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">2. Laser Cut Machine Image</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.laserCutMachineImg || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, laserCutMachineImg: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      laserCutMachineImg: "/src/assets/images/laser_cut_machine_1784385486693.jpg"
                                    });
                                    triggerToast("Laser Cut Machine image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, laserCutMachineImg: base });
                                        triggerToast("Laser Cut Machine image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="laser-machine-upload"
                                />
                                <label htmlFor="laser-machine-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.laserCutMachineImg && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.laserCutMachineImg} className="h-6 w-10 rounded object-cover" alt="Laser Machine Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.laserCutMachineImg.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 3. Clothe Beading Machine */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">3. Clothe Beading Machine Image</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.clotheBeadingMachineImg || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, clotheBeadingMachineImg: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      clotheBeadingMachineImg: "/src/assets/images/clothe_beading_machine_1784385501880.jpg"
                                    });
                                    triggerToast("Beading Machine image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, clotheBeadingMachineImg: base });
                                        triggerToast("Beading Machine image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="beading-machine-upload"
                                />
                                <label htmlFor="beading-machine-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.clotheBeadingMachineImg && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.clotheBeadingMachineImg} className="h-6 w-10 rounded object-cover" alt="Beading Machine Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.clotheBeadingMachineImg.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 4. Stoning Machine */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">4. Crystal Stoning Machine Image</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.stoningMachineImg || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, stoningMachineImg: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      stoningMachineImg: "/src/assets/images/stoning_machine_1784385517517.jpg"
                                    });
                                    triggerToast("Stoning Machine image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, stoningMachineImg: base });
                                        triggerToast("Stoning Machine image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="stoning-machine-upload"
                                />
                                <label htmlFor="stoning-machine-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.stoningMachineImg && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.stoningMachineImg} className="h-6 w-10 rounded object-cover" alt="Stoning Machine Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.stoningMachineImg.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 5. CNC Desktop Router Machine */}
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-150">
                              <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">5. CNC Desktop Router Image</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={contactInfo.cncDesktopRouterImg || ""}
                                  onChange={(e) => setContactInfo({ ...contactInfo, cncDesktopRouterImg: e.target.value })}
                                  placeholder="Image URL or Base64 data..."
                                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-amber-600/50 text-stone-850 text-[10px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContactInfo({
                                      ...contactInfo,
                                      cncDesktopRouterImg: "/src/assets/images/cnc_desktop_router_1784385532391.jpg"
                                    });
                                    triggerToast("CNC Desktop Router image reset!");
                                  }}
                                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-xl text-[9px] font-semibold text-stone-700 transition shrink-0"
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="border border-dashed border-stone-200 rounded-xl p-2.5 text-center bg-stone-50/50 hover:bg-stone-50 transition">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base = await convertFileToBase64(file);
                                        setContactInfo({ ...contactInfo, cncDesktopRouterImg: base });
                                        triggerToast("CNC Desktop Router image loaded!");
                                      } catch (err) {
                                        triggerToast("Error uploading image", "info");
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id="cnc-machine-upload"
                                />
                                <label htmlFor="cnc-machine-upload" className="cursor-pointer flex flex-col items-center gap-1">
                                  <Upload size={12} className="text-stone-400" />
                                  <span className="text-[8px] text-stone-500 font-medium">Upload File</span>
                                </label>
                                {contactInfo.cncDesktopRouterImg && (
                                  <div className="mt-2 flex items-center justify-center gap-2 bg-white p-1 rounded border border-stone-100 max-w-max mx-auto">
                                    <img src={contactInfo.cncDesktopRouterImg} className="h-6 w-10 rounded object-cover" alt="CNC Machine Preview" />
                                    <span className="text-[7px] font-mono text-stone-400 truncate max-w-[80px]">
                                      {contactInfo.cncDesktopRouterImg.startsWith("data:") ? "Base64" : "Custom URL"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 bg-stone-50 p-4 border border-stone-200 rounded-2xl">
                      <h4 className="font-serif text-[10px] font-bold uppercase tracking-wider text-stone-700">Social Media Links</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">TikTok URL</label>
                          <input
                            type="text"
                            value={contactInfo.tiktokUrl || ""}
                            onChange={(e) => setContactInfo({ ...contactInfo, tiktokUrl: e.target.value })}
                            placeholder="https://www.tiktok.com/@..."
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">Instagram URL</label>
                          <input
                            type="text"
                            value={contactInfo.instagramUrl || ""}
                            onChange={(e) => setContactInfo({ ...contactInfo, instagramUrl: e.target.value })}
                            placeholder="https://www.instagram.com/..."
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-stone-500 font-mono text-[9px] uppercase tracking-wider block font-semibold">YouTube URL</label>
                          <input
                            type="text"
                            value={contactInfo.youtubeUrl || ""}
                            onChange={(e) => setContactInfo({ ...contactInfo, youtubeUrl: e.target.value })}
                            placeholder="https://www.youtube.com/@..."
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600/50 text-stone-800 text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingContact}
                      className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/30 text-white font-serif font-bold py-2.5 rounded-xl uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      {savingContact ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Save Contact and Pages Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

        </motion.div>
      </div>

      {showSeedDialog && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 font-sans relative">
            <button 
              onClick={() => setShowSeedDialog(false)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition"
            >
              <X size={16} />
            </button>

            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-800">
              <Sparkles size={18} />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="font-serif text-sm font-bold text-stone-900 uppercase tracking-wider">Seed Catalog Section</h3>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Select an empty showroom category below. Gemini will design 3 highly realistic, premium traditional and corporate fashion items with curated visual descriptions to populate your catalog.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-left">
              {(() => {
                const isGalleryEmpty = !catalog.gallery || catalog.gallery.length === 0;
                const isFabricsEmpty = !catalog.fabrics || catalog.fabrics.length === 0;
                const isStylesEmpty = !catalog.styles || catalog.styles.length === 0;

                return (
                  <>
                    <button
                      disabled={!isGalleryEmpty || isSeeding}
                      onClick={() => handleSeedSection("gallery")}
                      className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition ${
                        isGalleryEmpty 
                          ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950 cursor-pointer font-medium" 
                          : "border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-xs font-semibold">Showcase Gallery</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-white border border-stone-200">
                        {isGalleryEmpty ? "Empty (Seedable)" : "Has Data"}
                      </span>
                    </button>

                    <button
                      disabled={!isFabricsEmpty || isSeeding}
                      onClick={() => handleSeedSection("fabrics")}
                      className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition ${
                        isFabricsEmpty 
                          ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950 cursor-pointer font-medium" 
                          : "border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-xs font-semibold">Fabrics Catalog</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-white border border-stone-200">
                        {isFabricsEmpty ? "Empty (Seedable)" : "Has Data"}
                      </span>
                    </button>

                    <button
                      disabled={!isStylesEmpty || isSeeding}
                      onClick={() => handleSeedSection("styles")}
                      className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition ${
                        isStylesEmpty 
                          ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950 cursor-pointer font-medium" 
                          : "border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-xs font-semibold">Style Inspiration</span>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-white border border-stone-200">
                        {isStylesEmpty ? "Empty (Seedable)" : "Has Data"}
                      </span>
                    </button>
                  </>
                );
              })()}
            </div>

            {isSeeding && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-amber-800 animate-pulse bg-amber-50 py-2 rounded-lg">
                <Loader2 className="animate-spin" size={12} />
                <span>Generating premium fashion details...</span>
              </div>
            )}

            <div className="pt-2">
              <button
                disabled={isSeeding}
                onClick={() => setShowSeedDialog(false)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] py-2.5 rounded-xl font-mono uppercase tracking-wider transition cursor-pointer"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
