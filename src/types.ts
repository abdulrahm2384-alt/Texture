/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  measurements?: Measurements;
}

export interface Measurements {
  neck?: number;
  chest?: number;
  shoulder?: number;
  sleeveLength?: number;
  chestWidth?: number;
  waist?: number;
  hip?: number;
  gownLength?: number;
  skirtLength?: number;
  trouserLength?: number;
  thigh?: number;
  ankle?: number;
  additionalNotes?: string;
  measurementUnit: 'inches' | 'cm';
}

export interface Fabric {
  id: string;
  name: string;
  category: string;
  pricePerYard: number;
  availableColors: string[];
  colorsHex?: string[]; // hex codes for elegant UI preview
  description: string;
  stockAvailability: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageUrl: string;
}

export interface FashionWork {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
}

export interface ClothingStyle {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  estimatedYardage: string;
}

export interface Order {
  id: string;
  userId: string;
  orderType: 'fabric_only' | 'custom_tailoring' | 'both';
  fabricId?: string;
  yardsOrdered?: number;
  customStyleId?: string;
  selectedServices?: string[];
  measurementsType: 'manual' | 'file_upload' | 'profile_saved';
  measurements?: Measurements;
  measurementFileUrl?: string; // in case they upload
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  totalPrice: number;
  selectedFabrics?: { fabricId: string; yards: number }[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ContactInfo {
  phoneNumber: string;
  displayPhone: string;
  emailAddress: string;
  websiteAddress: string;
  physicalAddress: string;
  mapUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}
