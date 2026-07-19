/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Fabric, FashionWork, ClothingStyle, Order, Measurements, ContactInfo } from "../types";

const API_BASE = ""; // Relative paths since we proxy via Vite

export function getAuthToken(): string | null {
  return localStorage.getItem("oluwashola_auth_token");
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("oluwashola_auth_token", token);
  } else {
    localStorage.removeItem("oluwashola_auth_token");
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}

export async function fetchCatalog(): Promise<{
  fabrics: Fabric[];
  gallery: FashionWork[];
  styles: ClothingStyle[];
}> {
  const res = await fetch(`${API_BASE}/api/catalog`);
  if (!res.ok) throw new Error("Failed to load digital showroom catalog");
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  
  setAuthToken(data.token);
  return data;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");

  setAuthToken(data.token);
  return data;
}

export async function getProfile(): Promise<{ user: User }> {
  const res = await fetchWithAuth(`${API_BASE}/api/auth/me`);
  const data = await res.json();
  if (!res.ok) {
    setAuthToken(null); // Clear invalid token
    throw new Error(data.error || "Session expired");
  }
  return data;
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
  address?: string;
}): Promise<{ success: boolean; user: User }> {
  const res = await fetchWithAuth(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile info");
  return data;
}

export async function saveMeasurements(measurements: Measurements): Promise<{ success: boolean; measurements: Measurements }> {
  const res = await fetchWithAuth(`${API_BASE}/api/auth/measurements`, {
    method: "PUT",
    body: JSON.stringify({ measurements }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save measurements");
  return data;
}

export async function submitOrder(orderData: {
  orderType: 'fabric_only' | 'custom_tailoring' | 'both';
  fabricId?: string;
  yardsOrdered?: number;
  customStyleId?: string;
  selectedServices?: string[];
  measurementsType: 'manual' | 'file_upload' | 'profile_saved';
  measurements?: Measurements;
  measurementFile?: string; // base64
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  totalPrice: number;
  selectedFabrics?: { fabricId: string; yards: number }[];
}): Promise<{ success: boolean; order: Order }> {
  const res = await fetchWithAuth(`${API_BASE}/api/orders`, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit order");
  return data;
}

export async function fetchMyOrders(): Promise<{ orders: Order[] }> {
  const res = await fetchWithAuth(`${API_BASE}/api/orders/my-orders`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load order history");
  return data;
}

// ADMIN SESSION MANAGEMENT & API HANDLERS

export function getAdminToken(): string | null {
  return localStorage.getItem("oluwashola_admin_token");
}

export function setAdminToken(token: string | null) {
  if (token) {
    localStorage.setItem("oluwashola_admin_token", token);
  } else {
    localStorage.removeItem("oluwashola_admin_token");
  }
}

async function fetchWithAdminAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}

export async function requestAdminOtp(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/admin/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to dispatch admin OTP code");
  return data;
}

export async function verifyAdminOtp(email: string, otp: string): Promise<{ success: boolean; token: string; admin: { email: string; role: string } }> {
  const res = await fetch(`${API_BASE}/api/admin/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Verification failed");
  setAdminToken(data.token);
  return data;
}

export async function fetchAllOrdersAdmin(): Promise<{ orders: any[] }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/orders`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to retrieve order logs");
  return data;
}

export async function updateOrderStatusAdmin(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update order status");
  return data;
}

export async function addFabricAdmin(fabric: any): Promise<{ success: boolean; fabric: Fabric }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/fabrics`, {
    method: "POST",
    body: JSON.stringify(fabric),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add fabric");
  return data;
}

export async function deleteFabricAdmin(id: string): Promise<{ success: boolean }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/fabrics/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete fabric");
  return data;
}

export async function updateFabricAdmin(id: string, updates: any): Promise<{ success: boolean }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/fabrics/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update boutique product details");
  return data;
}

export async function addGalleryAdmin(galleryItem: any): Promise<{ success: boolean; item: FashionWork }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/gallery`, {
    method: "POST",
    body: JSON.stringify(galleryItem),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add showcase item");
  return data;
}

export async function deleteGalleryAdmin(id: string): Promise<{ success: boolean }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/gallery/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete showcase item");
  return data;
}

export async function addStyleAdmin(style: any): Promise<{ success: boolean; style: ClothingStyle }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/styles`, {
    method: "POST",
    body: JSON.stringify(style),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add style inspiration");
  return data;
}

export async function deleteStyleAdmin(id: string): Promise<{ success: boolean }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/styles/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete style inspiration");
  return data;
}

export async function fetchContactInfo(): Promise<ContactInfo> {
  const local = localStorage.getItem("oluwashola_testing_contact");
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/api/contact`);
  if (!res.ok) throw new Error("Failed to load contact information");
  return res.json();
}

export async function updateContactInfoAdmin(info: ContactInfo): Promise<{ success: boolean; message: string }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/contact`, {
    method: "POST",
    body: JSON.stringify(info),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update contact information");
  localStorage.setItem("oluwashola_testing_contact", JSON.stringify(info));
  return data;
}

export async function seedDefaultCatalogAdmin(): Promise<{ success: boolean; message: string }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/seed-default-catalog`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to seed default catalog");
  return data;
}

export async function clearCatalogAdmin(): Promise<{ success: boolean; message: string }> {
  const res = await fetchWithAdminAuth(`${API_BASE}/api/admin/clear-catalog`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to clear catalog");
  return data;
}
