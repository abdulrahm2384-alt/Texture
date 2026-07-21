/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { User, Fabric, FashionWork, ClothingStyle, ContactInfo } from "./types";
import { getProfile, fetchCatalog, setAuthToken, fetchContactInfo } from "./utils/api";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Gallery from "./components/Gallery";
import Fabrics from "./components/Fabrics";
import Styles from "./components/Styles";
import OrderSection from "./components/OrderSection";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

import AuthModal from "./components/AuthModal";
import UserProfileModal from "./components/UserProfileModal";
import AdminPortalModal from "./components/AdminPortalModal";

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Digital Showroom State
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [gallery, setGallery] = useState<FashionWork[]>([]);
  const [styles, setStyles] = useState<ClothingStyle[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Modal Controls (Auth & Profile)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);

  // Subsection Modal Controls
  const [aboutOpen, setAboutOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [fabricsOpen, setFabricsOpen] = useState(false);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Site Custom Branding & Coordinates State
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  // Notifications State
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Trigger temporary toast notifications
  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const refreshCatalog = async () => {
    try {
      const catalogRes = await fetchCatalog();
      setFabrics(catalogRes.fabrics);
      setGallery(catalogRes.gallery);
      setStyles(catalogRes.styles);
    } catch (err) {
      console.error("Showroom catalog could not be refreshed from server:", err);
    }
  };

  const refreshContactInfo = async () => {
    try {
      const info = await fetchContactInfo();
      setContactInfo(info);
    } catch (err) {
      console.error("Site contact info/branding could not be refreshed:", err);
    }
  };

  // 1. Initial Page Mount Setup
  useEffect(() => {
    async function loadAppSession() {
      setCheckingAuth(false);
 
      // Load products catalog and branding from backend
      setLoadingCatalog(true);
      await Promise.all([refreshCatalog(), refreshContactInfo()]);
      setLoadingCatalog(false);
    }

    loadAppSession();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    triggerToast("Signed out of Styling Room successfully.", "info");
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    triggerToast(`Greetings ${authenticatedUser.name}, you are logged in to OLUWASHOLA.`);
  };

  const handleOrderCompleted = () => {
    setOrderOpen(false);
    triggerToast("Your atelier custom order has been submitted successfully!");
  };

  if (loadingCatalog || checkingAuth) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <Loader2 className="animate-spin text-amber-500 h-12 w-12" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-[10px] font-bold text-amber-400">O</span>
          </div>
        </div>
        <p className="font-serif text-sm text-stone-300 tracking-[0.15em] uppercase">
          OLUWASHOLA ATELIER
        </p>
        <span className="text-[10px] font-mono text-stone-500">Loading digital showrooms...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-100 selection:text-stone-950">
      
      {/* 1. Header Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setAuthInitialMode("login");
          setAuthModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        onOpenFabrics={() => setFabricsOpen(true)}
        onOpenStyles={() => setStylesOpen(true)}
        onOpenOrder={() => setOrderOpen(true)}
        onOpenContact={() => setContactOpen(true)}
        logoUrl={contactInfo?.logoUrl}
      />

      {/* 2. Showroom Landing Section & Grand Showroom Deck */}
      <Hero
        onOpenAbout={() => setAboutOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        onOpenFabrics={() => setFabricsOpen(true)}
        onOpenStyles={() => setStylesOpen(true)}
        onOpenOrder={() => setOrderOpen(true)}
        onOpenContact={() => setContactOpen(true)}
        logoUrl={contactInfo?.logoUrl}
        heroBgUrl={contactInfo?.heroBgUrl}
        wingAboutBgUrl={contactInfo?.wingAboutBgUrl}
        wingGalleryBgUrl={contactInfo?.wingGalleryBgUrl}
        wingFabricsBgUrl={contactInfo?.wingFabricsBgUrl}
        wingStylesBgUrl={contactInfo?.wingStylesBgUrl}
        wingOrderBgUrl={contactInfo?.wingOrderBgUrl}
        wingContactBgUrl={contactInfo?.wingContactBgUrl}
      />

      {/* 3. Subsections Modals */}
      <About
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        onOpenGallery={() => setGalleryOpen(true)}
        onOpenOrder={() => setOrderOpen(true)}
        monogramMachineImg={contactInfo?.monogramMachineImg}
        laserCutMachineImg={contactInfo?.laserCutMachineImg}
        clotheBeadingMachineImg={contactInfo?.clotheBeadingMachineImg}
        stoningMachineImg={contactInfo?.stoningMachineImg}
        cncDesktopRouterImg={contactInfo?.cncDesktopRouterImg}
      />

      <Gallery
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        works={gallery}
        onOpenOrder={(detail) => {
          setOrderOpen(true);
          if (detail) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("prefillStyle", { detail }));
            }, 100);
          }
        }}
      />

      <Fabrics
        isOpen={fabricsOpen}
        onClose={() => setFabricsOpen(false)}
        fabrics={fabrics}
        onOpenOrder={(detail) => {
          setOrderOpen(true);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("prefillFabric", { detail }));
          }, 100);
        }}
      />

      <Styles
        isOpen={stylesOpen}
        onClose={() => setStylesOpen(false)}
        styles={styles}
        onOpenOrder={(detail) => {
          setOrderOpen(true);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("prefillStyle", { detail }));
          }, 100);
        }}
      />

      <OrderSection
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        user={user}
        fabrics={fabrics}
        styles={styles}
        onOpenAuth={() => {
          setAuthInitialMode("register");
          setAuthModalOpen(true);
        }}
        onOrderCompleted={handleOrderCompleted}
      />

      <Contact
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />

      {/* 4. Showroom Footer */}
      <Footer onOpenAdmin={() => setAdminPortalOpen(true)} />

      {/* MODAL: CUSTOMER AUTHENTICATION GATE */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      {/* MODAL: DIGITAL STYLING ROOM */}
      {user && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
          fabrics={fabrics}
          styles={styles}
        />
      )}

      {/* MODAL: ADMINISTRATIVE PORTAL */}
      <AdminPortalModal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        triggerToast={triggerToast}
        onCatalogChanged={async () => {
          await refreshCatalog();
          await refreshContactInfo();
        }}
      />

      {/* LUXURY TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-stone-900 text-stone-100 border border-amber-500/30 px-5 py-3.5 rounded-2xl shadow-2xl max-w-sm w-[90%]"
            id="toast-notification-panel"
          >
            <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-medium leading-normal">
                {notification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
