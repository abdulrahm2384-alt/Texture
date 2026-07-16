/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loginUser, registerUser } from "../utils/api";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const data = await loginUser(email, password);
        onSuccess(data.user);
        onClose();
      } else {
        const data = await registerUser({
          email,
          password,
          name,
          phone: phone || undefined,
          address: address || undefined,
        });
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm"
          id="auth-modal-backdrop"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-[#FAF9F6] text-stone-900 shadow-2xl p-6 md:p-8"
          id="auth-modal-content"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
            id="auth-modal-close"
          >
            <X size={20} />
          </button>

          {/* Luxury Monogram Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-amber-500 bg-[#FAF9F6] text-amber-700 font-serif text-xl font-bold tracking-widest mb-3">
              O
            </div>
            <h3 className="font-serif text-2xl font-bold tracking-wide text-amber-800">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              {mode === "login"
                ? "Sign in to view orders and place tailoring requests"
                : "Join OLUWASHOLA to explore luxury bespoke tailoring"}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center"
              id="auth-error-container"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Adewale Bakare"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 pl-11 pr-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                      id="register-input-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 80 1234 5678"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 pl-11 pr-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                      id="register-input-phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 15 Marina Street, Lagos"
                      className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 pl-11 pr-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                      id="register-input-address"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 pl-11 pr-4 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                  id="auth-input-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white border border-stone-250 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 pl-11 pr-11 py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition"
                  id="auth-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-850 transition"
                  id="auth-password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 text-sm transition-all duration-300 shadow-lg shadow-amber-600/15 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-55 cursor-pointer"
              id="auth-submit-btn"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-white" size={18} />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Toggle modes */}
          <div className="mt-6 text-center text-xs text-stone-600">
            {mode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setError(null);
                    setMode("register");
                  }}
                  className="text-amber-700 font-semibold hover:underline focus:outline-none cursor-pointer"
                  id="toggle-register-btn"
                >
                  Register Here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  className="text-amber-700 font-semibold hover:underline focus:outline-none cursor-pointer"
                  id="toggle-login-btn"
                >
                  Log In Here
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
