/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageSquare, Instagram, Facebook, Globe } from "lucide-react";
import Modal from "./Modal";
import { fetchContactInfo } from "../utils/api";
import { ContactInfo } from "../types";

interface ContactProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CONTACT: ContactInfo = {
  phoneNumber: "+234705378152",
  displayPhone: "0705378152",
  emailAddress: "info@oluwasholatextiles.com.ng",
  websiteAddress: "www.oluwasholatextiles.com.ng",
  physicalAddress: "39, Bamgbose Street, Lagos Island, Lagos State",
  mapUrl: "https://maps.google.com/maps?q=39%20Bamgbose%20Street,%20Lagos%20Island,%20Lagos,%20Nigeria&t=&z=16&ie=UTF8&iwloc=&output=embed",
  tiktokUrl: "https://www.tiktok.com/@oluwashola.textiles",
  instagramUrl: "https://www.instagram.com/OluwasholaTextiles",
  youtubeUrl: "https://www.youtube.com/@oluwasholatextiles"
};

export default function Contact({ isOpen, onClose }: ContactProps) {
  const [subject, setSubject] = useState("Fabric Sourcing");
  const [customMsg, setCustomMsg] = useState("");
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);

  useEffect(() => {
    if (isOpen) {
      fetchContactInfo()
        .then((data) => {
          if (data) setContact(data);
        })
        .catch((err) => {
          console.error("Error fetching contact details:", err);
        });
    }
  }, [isOpen]);

  const triggerWhatsApp = () => {
    const greeting = `Hello OLUWASHOLA TEXTILE ACCESSORIES, I am writing to inquire about [${subject}].`;
    const body = customMsg ? `${greeting} ${customMsg}` : `${greeting} I would love to schedule a showroom consultation.`;
    const encoded = encodeURIComponent(body);
    window.open(`https://wa.me/${contact.phoneNumber.replace("+", "")}?text=${encoded}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visit Our Digital & Physical Showroom" subtitle="Atelier Coordinates">
      <div className="space-y-8">
        {/* Content Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="contact-panel-grid">
          
          {/* Column 1: Info and WhatsApp composer */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h4 className="font-serif text-lg font-bold text-stone-900">Atelier Coordinates</h4>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Drop by our physical headquarters to feel our high-quality fabrics, review pattern catalogues, or schedule bespoke measurements directly with our specialists.
              </p>
            </div>

            {/* List */}
            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <MapPin className="text-amber-600 mt-0.5 shrink-0" size={16} />
                <div>
                  <h5 className="font-serif font-bold text-stone-900 mb-0.5">Physical Atelier Address</h5>
                  <p className="leading-relaxed">{contact.physicalAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <Phone className="text-amber-600 mt-0.5 shrink-0" size={16} />
                <div>
                  <h5 className="font-serif font-bold text-stone-900 mb-0.5">WhatsApp / Telegram Hotline</h5>
                  <p className="font-semibold text-amber-700 text-sm">{contact.displayPhone}</p>
                  <p className="text-[9px] text-stone-500 font-mono mt-0.5">Available Mon - Sat (9:00 AM - 6:00 PM WAT)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                <Mail className="text-amber-600 mt-0.5 shrink-0" size={16} />
                <div>
                  <h5 className="font-serif font-bold text-stone-900 mb-0.5">Electronic Mailbox</h5>
                  <p className="font-semibold text-amber-700">{contact.emailAddress}</p>
                </div>
              </div>

              {contact.websiteAddress && (
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <Globe className="text-amber-600 mt-0.5 shrink-0" size={16} />
                  <div>
                    <h5 className="font-serif font-bold text-stone-900 mb-0.5">Official Website</h5>
                    <p className="font-semibold text-amber-700">{contact.websiteAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Pre-composer */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-850">
                <MessageSquare size={18} className="text-emerald-700 shrink-0" />
                <h5 className="font-serif font-bold text-emerald-900 text-sm">Interactive WhatsApp Desk</h5>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Pre-compose your inquiry details below to initialize a high-priority direct chat with OLUWASHOLA staff.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Subject of Interest:
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl bg-white border border-stone-250 text-xs p-2.5 text-stone-800 outline-none focus:border-emerald-500"
                  >
                    <option value="Fabric Sourcing">Luxury Fabric Sourcing</option>
                    <option value="Monogramming & Beading">Monogramming & Beading</option>
                    <option value="Laser Cut / CNC Design">Laser Cut & CNC Router Design</option>
                    <option value="Button Holes / Eyelet Stitching">Button Holes & I LET Stitching</option>
                    <option value="Bespoke Tailoring">Bespoke Tailoring Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Message Body (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Provide details of fabrics, services needed, or urgency deadlines..."
                    className="w-full rounded-xl bg-white border border-stone-250 text-xs p-2.5 text-stone-800 outline-none focus:border-emerald-500 resize-none placeholder-stone-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={triggerWhatsApp}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 cursor-pointer"
                  id="whatsapp-composer-btn"
                >
                  <MessageSquare size={13} />
                  Open WhatsApp Chat
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Embedded Interactive Google Map */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6 h-full min-h-[350px]">
            {contact.mapUrl && (
              <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-md bg-white flex-1 min-h-[250px] aspect-video">
                <iframe
                  title="Atelier Google Map"
                  src={contact.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="opacity-95"
                />
              </div>
            )}

            {/* Social linkages */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-200 text-xs">
              <span className="font-mono text-[9px] uppercase font-bold text-stone-500 tracking-wider">
                Follow Us on Socials
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {contact.tiktokUrl && (
                  <a
                    href={contact.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full border border-stone-200 hover:border-amber-600 bg-white text-stone-600 hover:text-amber-700 shadow-sm transition cursor-pointer flex items-center gap-1.5 text-[10px] font-mono"
                  >
                    <span>TikTok</span>
                  </a>
                )}
                {contact.instagramUrl && (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full border border-stone-200 hover:border-amber-600 bg-white text-stone-600 hover:text-amber-700 shadow-sm transition cursor-pointer flex items-center gap-1.5 text-[10px] font-mono"
                  >
                    <Instagram size={12} />
                    <span>Instagram</span>
                  </a>
                )}
                {contact.youtubeUrl && (
                  <a
                    href={contact.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full border border-stone-200 hover:border-amber-600 bg-white text-stone-600 hover:text-amber-700 shadow-sm transition cursor-pointer flex items-center gap-1.5 text-[10px] font-mono"
                  >
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
}
