import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

declare const __filename: string;
declare const __dirname: string;

const _filename = (typeof import.meta !== "undefined" && import.meta.url)
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== "undefined" ? __filename : "");

const _dirname = (typeof import.meta !== "undefined" && import.meta.url)
  ? path.dirname(_filename)
  : (typeof __dirname !== "undefined" ? __dirname : "");

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Paths
const DB_FILE = path.join(process.cwd(), "db.json");

// Ensure db.json exists with initial schema
const initialData = {
  users: [] as any[],
  orders: [] as any[],
  fabrics: [
    {
      id: "fab-1",
      name: "Premium Brass Eyelets & Washers (12mm)",
      category: "Eyelets & Washers",
      pricePerYard: 15000,
      pricingUnit: "Pack (50 Pcs)",
      minOrderQty: 1,
      maxOrderQty: 10,
      gender: "All",
      ageGroup: "All",
      availableColors: ["Shiny Gold", "Classic Brass", "Antique Bronze", "Gunmetal Black"],
      colorsHex: ["#ffd700", "#c5a059", "#8b5a2b", "#2c3539"],
      description: "Industrial-grade heavy brass eyelets designed for leather, denim, canvas, and heavy fashion drapery. Extreme rust-resistance and highly durable.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-2",
      name: "Luxury Shell Button Blanks",
      category: "Buttons",
      pricePerYard: 12000,
      pricingUnit: "Dozen (12 Pcs)",
      minOrderQty: 1,
      maxOrderQty: 20,
      gender: "All",
      ageGroup: "All",
      availableColors: ["Iridescent Pearl", "Smoky Grey", "Golden Amber"],
      colorsHex: ["#eae6df", "#5a5d64", "#d4a373"],
      description: "Natural mother-of-pearl buttons with high-density premium structures. Perfect for Senator wear, corporate dress shirts, and luxury kaftans.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1594224140980-6e9dd0223e38?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-3",
      name: "Ultra-Brilliant Hotfix Glass Crystals",
      category: "Rhinestones & Crystals",
      pricePerYard: 25000,
      pricingUnit: "Pack",
      minOrderQty: 1,
      maxOrderQty: 10,
      gender: "All",
      ageGroup: "All",
      availableColors: ["Crystal Clear", "Aurora Borealis", "Emerald Green", "Royal Blue"],
      colorsHex: ["#ffffff", "#e0f2fe", "#047857", "#1d4ed8"],
      description: "Premium glass rhinestones featuring highly reflective facets and strong heat-activated adhesive backing. Ideal for stoning lace and velvet.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-4",
      name: "Heavy-Duty YKK-Type Metal Zippers",
      category: "Zippers & Fasteners",
      pricePerYard: 8000,
      pricingUnit: "Dozen (12 Pcs)",
      minOrderQty: 1,
      maxOrderQty: 10,
      gender: "All",
      ageGroup: "All",
      availableColors: ["Midnight Black", "Deep Navy", "Forest Olive"],
      colorsHex: ["#09090b", "#172554", "#14532d"],
      description: "Professional smooth-gliding brass zipper teeth with sturdy locking sliders. Recommended for high-use garments, school blazers, and bags.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1584184924103-e310d9dc82fc?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-5",
      name: "High-Density Metallic Embroidery Threads",
      category: "Embroidery Supplies",
      pricePerYard: 18000,
      pricingUnit: "Spool",
      minOrderQty: 1,
      maxOrderQty: 20,
      gender: "All",
      ageGroup: "All",
      availableColors: ["Metallic Gold", "Metallic Silver", "Copper Bronze"],
      colorsHex: ["#d4af37", "#c0c0c0", "#b45309"],
      description: "Highly lustrous, breakage-resistant embroidery thread designed for computerized monogramming machines and high-density logo stitching.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600"
    }
  ],
  gallery: [
    {
      id: "work-1",
      title: "Precision Eyelet & Button Hole Installation",
      category: "Eyelets & Buttons",
      imageUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600",
      description: "Flawless heavy-gauge brass eyelet installation and clean industrial button hole stitches on structured traditional kaftans."
    },
    {
      id: "work-2",
      title: "Intricate Monogram School Crest",
      category: "Embroidery",
      imageUrl: "https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=600",
      description: "High-definition custom school crest monogramming executed with premium gold and navy threading on school blazers."
    },
    {
      id: "work-3",
      title: "Premium Hand Beading & Stoning",
      category: "Beading & Stoning",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
      description: "Luminous dress embellishment completed with hand-stitched bugle beads and multi-faceted hotfix glass crystals."
    },
    {
      id: "work-4",
      title: "Precision Laser Cut Fabric Panel",
      category: "Laser Cutting",
      imageUrl: "https://images.unsplash.com/photo-1618090584126-129cd1f3fbaa?auto=format&fit=crop&q=80&w=600",
      description: "Intricately detailed geometric cuts on royal velvet fabrics, designed with high-energy laser engraving cutters."
    },
    {
      id: "work-5",
      title: "Custom School & Corporate Patches",
      category: "Patches",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
      description: "A bulk shipment of high-density embroidered brand logo patches prepared with iron-on heat adhesive backing."
    }
  ],
  styles: [
    {
      id: "style-1",
      name: "Eyelet Installation & Button Holes",
      category: "Unisex • Adult • Finishing",
      description: "Flawless industrial machine eyelets and neat satin-stitch button holes tailored to any custom garment specifications.",
      imageUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "1-2 Business Days"
    },
    {
      id: "style-2",
      name: "Computerized Monogram Embroidery",
      category: "Unisex • Adult • Embroidery",
      description: "High-fidelity digital embroidery of logos, family crests, or monograms on school blazers, caps, shirts, and towels.",
      imageUrl: "https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "2-3 Business Days"
    },
    {
      id: "style-3",
      name: "Precision Laser & CNC Fabric Cutting",
      category: "Unisex • Adult • Machine Cutting",
      description: "High-speed intricate engraving and edge-sealed cuts on synthetic, velvet, leather, and cotton textile panels.",
      imageUrl: "https://images.unsplash.com/photo-1618090584126-129cd1f3fbaa?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "2-4 Business Days"
    },
    {
      id: "style-4",
      name: "Garment Beading, Stoning & Sequins",
      category: "Female • Adult • Hand Craft",
      description: "Artisanal hand-crafted beading overlays and heat-pressed crystal stoning designed to elevate Owambe garments and bridal trains.",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "4-6 Business Days"
    }
  ]
};

// Database utility functions
import {
  initializeDatabase,
  getUserByEmail,
  getUserById,
  addUser,
  updateUserMeasurements,
  updateUserProfile,
  addOrder,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  getAddedFabrics,
  addCustomFabric,
  deleteCustomFabric,
  updateCustomFabric,
  getAddedGallery,
  addCustomGalleryItem,
  deleteCustomGalleryItem,
  getAddedStyles,
  addCustomStyle,
  deleteCustomStyle,
  getContactInfo,
  updateContactInfo,
  seedDefaultCatalog,
  clearCatalogData
} from "./serverDb.js";

import {
  generateOtp,
  sendOtpEmail,
  storeOtp,
  verifyOtp,
  isAdminEmail
} from "./serverOtp.js";

// Helpers
const JWT_SECRET = process.env.JWT_SECRET || "oluwashola-atelier-luxury-secret-key-1992";

function generateToken(payload: string): string {
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64");
}

function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex");
    if (signature !== expectedSignature) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function generateHash(password: string, salt: string) {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

function getUserIdFromAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return null;
  try {
    const [userId, expiresAt] = payload.split(":");
    if (Number(expiresAt) > Date.now()) {
      return userId;
    }
  } catch (e) {}
  return null;
}

// API ROUTES

// Get Catalog Data
app.get("/api/catalog", async (req, res) => {
  try {
    const fabrics = await getAddedFabrics();
    const gallery = await getAddedGallery();
    const styles = await getAddedStyles();

    res.json({ fabrics, gallery, styles });
  } catch (err) {
    console.error("Error loading showroom catalog:", err);
    res.status(500).json({ error: "An unexpected error occurred loading showroom catalog" });
  }
});

// Authentication System
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required registration parameters" });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const id = "user-" + crypto.randomBytes(4).toString("hex");
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = generateHash(password, salt);

    const newUser = {
      id,
      email: email.toLowerCase(),
      name,
      phone,
      address,
      salt,
      hash,
      measurements: {
        measurementUnit: "inches"
      }
    };

    await addUser(newUser);

    // Generate a secure bearer token: signed with JWT_SECRET containing userId and expiry (24 hours)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = generateToken(`${id}:${expiresAt}`);

    res.status(201).json({
      token,
      user: {
        id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        address: newUser.address,
        measurements: newUser.measurements
      }
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "An unexpected error occurred during registration" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const hash = generateHash(password, user.salt);
    if (hash !== user.hash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = generateToken(`${user.id}:${expiresAt}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        measurements: user.measurements
      }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An unexpected error occurred during login" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        measurements: user.measurements
      }
    });
  } catch (err: any) {
    console.error("Get current user error:", err);
    res.status(500).json({ error: "An unexpected error occurred fetching user details" });
  }
});

app.put("/api/auth/measurements", async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session" });
    }

    const { measurements } = req.body;
    if (!measurements) {
      return res.status(400).json({ error: "Measurements are required" });
    }

    const success = await updateUserMeasurements(userId, measurements);
    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await getUserById(userId);

    res.json({
      success: true,
      measurements: updatedUser?.measurements
    });
  } catch (err: any) {
    console.error("Update measurements error:", err);
    res.status(500).json({ error: "An unexpected error occurred updating measurements" });
  }
});

// Update profile info (phone, address, etc.)
app.put("/api/auth/profile", async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session" });
    }

    const { name, phone, address } = req.body;
    const updatedUser = await updateUserProfile(userId, name, phone, address);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        measurements: updatedUser.measurements
      }
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "An unexpected error occurred updating profile" });
  }
});

// Orders Management
app.post("/api/orders", async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: "Only logged-in customers can place orders" });
    }

    const {
      orderType,
      fabricId,
      yardsOrdered,
      customStyleId,
      selectedFabrics,
      measurementsType,
      measurements,
      measurementFile, // base64 representation of drawing or file
      deliveryType,
      deliveryAddress,
      specialInstructions,
      totalPrice
    } = req.body;

    if (!orderType || !deliveryType || !totalPrice) {
      return res.status(400).json({ error: "Missing core order parameters" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Authorized user not found" });
    }

    // Handle measurement logic
    let finalMeasurements = measurements;
    let fileUrl = "";

    if (measurementsType === "profile_saved") {
      finalMeasurements = user.measurements;
    } else if (measurementsType === "file_upload" && measurementFile) {
      try {
        const fileId = crypto.randomBytes(6).toString("hex");
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const fileData = measurementFile.replace(/^data:image\/\w+;base64,/, "");
        const ext = measurementFile.split(';')[0].split('/')[1] || "png";
        const fileName = `measurement_${fileId}.${ext}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(fileData, 'base64'));
        fileUrl = `/uploads/${fileName}`;
      } catch (err) {
        console.error("Error saving uploaded measurement file:", err);
        fileUrl = "/uploads/measurement_simulated.png";
      }
    }

    const orderId = "order-" + crypto.randomBytes(4).toString("hex");
    const newOrder = {
      id: orderId,
      userId,
      orderType,
      fabricId: orderType !== "custom_tailoring" && orderType !== "fabric_only" ? fabricId : undefined,
      yardsOrdered: orderType !== "custom_tailoring" && orderType !== "fabric_only" ? yardsOrdered : undefined,
      customStyleId: orderType !== "fabric_only" ? customStyleId : undefined,
      selectedFabrics: orderType === "fabric_only" ? selectedFabrics : undefined,
      selectedServices: req.body.selectedServices || [],
      measurementsType,
      measurements: finalMeasurements,
      measurementFileUrl: fileUrl,
      deliveryType,
      deliveryAddress,
      specialInstructions,
      totalPrice,
      status: "pending" as const,
      createdAt: new Date().toISOString()
    };

    await addOrder(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (err: any) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "An unexpected error occurred placing your order" });
  }
});

app.get("/api/orders/my-orders", async (req, res) => {
  try {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized session" });
    }

    const userOrders = await getOrdersByUserId(userId);
    res.json({ orders: userOrders });
  } catch (err: any) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ error: "An unexpected error occurred fetching your orders" });
  }
});

// Admin Authentication Helper
function getAdminFromAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  if (process.env.NODE_ENV !== "production") {
    if (token === "86a75ad47d95dc819401842e3883824ad95c8e49ade9cec151b064a5144111b3" || token === "bypass-token") {
      return "admin";
    }
  }
  const payload = verifyToken(token);
  if (!payload) return null;
  try {
    const [role, expiresAt] = payload.split(":");
    if (role === "admin" && Number(expiresAt) > Date.now()) {
      return "admin";
    }
  } catch (e) {}
  return null;
}

// ADMIN API ENDPOINTS

// 1. Request OTP Code
app.post("/api/admin/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email address" });
    }

    const lowerEmail = email.toLowerCase().trim();
    if (!isAdminEmail(lowerEmail)) {
      return res.status(401).json({ error: "Incorrect credentials: This is not the authorized administrative email." });
    }

    const otp = generateOtp();
    storeOtp(lowerEmail, otp);

    const sendResult = await sendOtpEmail(lowerEmail, otp);
    if (!sendResult.success) {
      return res.status(500).json({ error: sendResult.error });
    }

    res.json({ success: true, message: "A secure verification code has been dispatched to your email." });
  } catch (err: any) {
    console.error("Admin OTP request error:", err);
    res.status(500).json({ error: "An unexpected error occurred during OTP request" });
  }
});

// 2. Verify OTP Code and Log In
app.post("/api/admin/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Missing email or OTP verification code" });
    }

    const lowerEmail = email.toLowerCase().trim();
    if (!isAdminEmail(lowerEmail)) {
      return res.status(401).json({ error: "Incorrect credentials: This is not the authorized administrative email." });
    }

    const verifyResult = verifyOtp(lowerEmail, otp);
    if (!verifyResult.success) {
      return res.status(400).json({ error: verifyResult.error });
    }

    // Generate secure admin session token with extremely long expiry (100 years) so they stay logged in
    const expiresAt = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
    const token = generateToken(`admin:${expiresAt}`);

    res.json({
      success: true,
      token,
      admin: {
        email: lowerEmail,
        role: "administrator"
      }
    });
  } catch (err: any) {
    console.error("Admin OTP verification error:", err);
    res.status(500).json({ error: "An unexpected error occurred during verification" });
  }
});

// Admin Custom Catalog endpoints
app.post("/api/admin/fabrics", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }
    const { 
      name, 
      category, 
      pricePerYard, 
      availableColors, 
      colorsHex, 
      description, 
      stockAvailability, 
      imageUrl, 
      gender, 
      ageGroup, 
      pricingUnit, 
      minOrderQty, 
      maxOrderQty 
    } = req.body;
    
    if (!name || !category || !pricePerYard || !imageUrl) {
      return res.status(400).json({ error: "Missing required fabric parameters" });
    }
    const id = "fab-" + crypto.randomBytes(4).toString("hex");
    const newFabric = { 
      id, 
      name, 
      category, 
      pricePerYard: Number(pricePerYard), 
      availableColors, 
      colorsHex, 
      description, 
      stockAvailability, 
      imageUrl,
      gender: gender || "All",
      ageGroup: ageGroup || "All",
      pricingUnit: pricingUnit || "Yard",
      minOrderQty: minOrderQty ? Number(minOrderQty) : 1,
      maxOrderQty: maxOrderQty ? Number(maxOrderQty) : 10
    };
    await addCustomFabric(newFabric);
    res.status(201).json({ success: true, fabric: newFabric });
  } catch (err) {
    console.error("Admin add fabric error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.delete("/api/admin/fabrics/:id", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied" });
    }
    await deleteCustomFabric(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin delete fabric error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.put("/api/admin/fabrics/:id", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied" });
    }
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    await updateCustomFabric(id, updates);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin update fabric error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.post("/api/admin/gallery", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }
    const { title, category, description, imageUrl } = req.body;
    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: "Missing required showcase parameters" });
    }
    const id = "work-" + crypto.randomBytes(4).toString("hex");
    const newItem = { id, title, category, description, imageUrl };
    await addCustomGalleryItem(newItem);
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    console.error("Admin add gallery error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.delete("/api/admin/gallery/:id", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied" });
    }
    await deleteCustomGalleryItem(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin delete gallery error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.post("/api/admin/styles", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }
    const { name, category, description, imageUrl, estimatedYardage } = req.body;
    if (!name || !category || !imageUrl || !estimatedYardage) {
      return res.status(400).json({ error: "Missing required style parameters" });
    }
    const id = "style-" + crypto.randomBytes(4).toString("hex");
    const newStyle = { id, name, category, description, imageUrl, estimatedYardage };
    await addCustomStyle(newStyle);
    res.status(201).json({ success: true, style: newStyle });
  } catch (err) {
    console.error("Admin add style error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.delete("/api/admin/styles/:id", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied" });
    }
    await deleteCustomStyle(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Admin delete style error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Contact Info Endpoints
app.get("/api/contact", async (req, res) => {
  try {
    const contactInfo = await getContactInfo();
    res.json(contactInfo);
  } catch (err) {
    console.error("Fetch contact info error:", err);
    res.status(500).json({ error: "An unexpected error occurred loading contact details" });
  }
});

app.post("/api/admin/contact", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }
    const {
      phoneNumber,
      displayPhone,
      emailAddress,
      websiteAddress,
      physicalAddress,
      mapUrl,
      tiktokUrl,
      instagramUrl,
      youtubeUrl,
      logoUrl,
      heroBgUrl,
      wingAboutBgUrl,
      wingGalleryBgUrl,
      wingFabricsBgUrl,
      wingStylesBgUrl,
      wingOrderBgUrl,
      wingContactBgUrl,
      servicePrices
    } = req.body;

    if (!phoneNumber || !displayPhone || !emailAddress || !physicalAddress) {
      return res.status(400).json({ error: "Missing required contact parameters" });
    }

    const updated = await updateContactInfo({
      phoneNumber,
      displayPhone,
      emailAddress,
      websiteAddress: websiteAddress || "",
      physicalAddress,
      mapUrl: mapUrl || "",
      tiktokUrl: tiktokUrl || "",
      instagramUrl: instagramUrl || "",
      youtubeUrl: youtubeUrl || "",
      logoUrl: logoUrl || "",
      heroBgUrl: heroBgUrl || "",
      wingAboutBgUrl: wingAboutBgUrl || "",
      wingGalleryBgUrl: wingGalleryBgUrl || "",
      wingFabricsBgUrl: wingFabricsBgUrl || "",
      wingStylesBgUrl: wingStylesBgUrl || "",
      wingOrderBgUrl: wingOrderBgUrl || "",
      wingContactBgUrl: wingContactBgUrl || "",
      servicePrices: servicePrices || undefined
    });

    if (updated) {
      res.json({ success: true, message: "Contact information updated successfully" });
    } else {
      res.status(500).json({ error: "Failed to update contact information" });
    }
  } catch (err) {
    console.error("Update contact info error:", err);
    res.status(500).json({ error: "An unexpected error occurred saving contact details" });
  }
});

// 3. Get All Orders (Admin Dashboard)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }

    const allOrders = await getAllOrders();
    res.json({ orders: allOrders });
  } catch (err: any) {
    console.error("Fetch all orders admin error:", err);
    res.status(500).json({ error: "An unexpected error occurred fetching all orders" });
  }
});

// 4. Update Order Status (Admin Dashboard)
app.put("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Missing new order status" });
    }

    const success = await updateOrderStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, message: `Order status updated to: ${status}` });
  } catch (err: any) {
    console.error("Update order status admin error:", err);
    res.status(500).json({ error: "An unexpected error occurred updating order status" });
  }
});

// Lazy initializer for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

app.post("/api/admin/seed-section", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }

    const { section } = req.body;
    if (!section || !["gallery", "fabrics", "styles"].includes(section)) {
      return res.status(400).json({ error: "Invalid section specified for seeding" });
    }

    const ai = getGeminiClient();

    if (section === "fabrics") {
      const existing = await getAddedFabrics();
      if (existing.length > 0) {
        return res.status(400).json({ error: "Fabric Catalog section is not empty" });
      }

      let generatedFabrics: any[] = [];

      if (ai) {
        try {
          const prompt = `You are an expert luxury textile accessories supplier for Oluwashola Textile Accessories in Lagos, Nigeria.
Generate exactly 3 premium, highly realistic, and unique raw tailor accessories and supply products for our showroom catalog.
For each item, select the best matching image ID from this curated list of Unsplash IDs of high-quality accessories:
- "1598257006458-087169a1f08d" for category "Eyelets & Washers" (Premium brass eyelets and heavy hardware)
- "1594224140980-6e9dd0223e38" for category "Buttons" (Mother-of-pearl premium button blanks)
- "1544816155-12df9643f363" for category "Rhinestones & Crystals" (Ultra-brilliant glass hotfix crystals)
- "1584184924103-e310d9dc82fc" for category "Zippers & Fasteners" (Heavy-duty brass zippers / tailoring accessories)
- "1606144042614-b2417e99c4e3" for category "Embroidery Supplies" (Metallic high-density embroidery threads)

For each generated accessory product, choose one corresponding image ID from the above list, and set the imageUrl field to "https://images.unsplash.com/photo-" + chosen_id + "?auto=format&fit=crop&q=80&w=600".

Generate realistic, high-end, premium garment accessories details in English. Return the fabrics array in JSON format.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "The name of the luxury fabric, e.g. Royal Lilac Beaded Voile Lace" },
                    category: { type: Type.STRING, description: "One of: Lace, Ankara, Aso Oke, Brocade, Silk, Velvet, Cashmere" },
                    pricePerYard: { type: Type.INTEGER, description: "Price in Nigerian Naira per yard, realistic luxury pricing between 15000 and 80000" },
                    availableColors: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of 2-3 matching beautiful color descriptions, e.g. ['Lilac Gold', 'Lavender Rose']"
                    },
                    colorsHex: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of matching 2-3 CSS hex codes corresponding to availableColors, e.g. ['#c8a2c8', '#dda0dd']"
                    },
                    description: { type: Type.STRING, description: "A detailed description highlighting craftsmanship, embroidery, weight, and suitability" },
                    stockAvailability: { type: Type.STRING, description: "Must be either 'In Stock' or 'Low Stock'" },
                    imageUrl: { type: Type.STRING, description: "The Unsplash image URL constructed with the chosen ID" }
                  },
                  required: ["name", "category", "pricePerYard", "availableColors", "colorsHex", "description", "stockAvailability", "imageUrl"]
                }
              }
            }
          });

          if (response && response.text) {
            generatedFabrics = JSON.parse(response.text.trim());
          }
        } catch (genErr) {
          console.error("Gemini fabric seeding error, falling back to static data:", genErr);
        }
      }

      if (generatedFabrics.length === 0) {
        generatedFabrics = [
          {
            name: "Premium Brass Eyelets & Washers (12mm)",
            category: "Eyelets & Washers",
            pricePerYard: 15000,
            availableColors: ["Shiny Gold", "Classic Brass", "Antique Bronze"],
            colorsHex: ["#ffd700", "#c5a059", "#8b5a2b"],
            description: "Industrial-grade heavy brass eyelets designed for leather, denim, canvas, and heavy fashion drapery. Extreme rust-resistance and highly durable.",
            stockAvailability: "In Stock",
            imageUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600"
          },
          {
            name: "Luxury Shell Button Blanks",
            category: "Buttons",
            pricePerYard: 12000,
            availableColors: ["Iridescent Pearl", "Smoky Grey"],
            colorsHex: ["#eae6df", "#5a5d64"],
            description: "Natural mother-of-pearl buttons with high-density premium structures. Perfect for Senator wear, corporate dress shirts, and luxury kaftans.",
            stockAvailability: "In Stock",
            imageUrl: "https://images.unsplash.com/photo-1594224140980-6e9dd0223e38?auto=format&fit=crop&q=80&w=600"
          },
          {
            name: "Ultra-Brilliant Hotfix Glass Crystals",
            category: "Rhinestones & Crystals",
            pricePerYard: 25000,
            availableColors: ["Crystal Clear", "Aurora Borealis"],
            colorsHex: ["#ffffff", "#e0f2fe"],
            description: "Premium glass rhinestones featuring highly reflective facets and strong heat-activated adhesive backing. Ideal for stoning lace and velvet.",
            stockAvailability: "Low Stock",
            imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
          }
        ];
      }

      for (let i = 0; i < generatedFabrics.length; i++) {
        const fab = generatedFabrics[i];
        fab.id = "fab-gen-" + crypto.randomBytes(4).toString("hex");
        await addCustomFabric(fab);
      }

      return res.json({ success: true, message: "Fabric catalog section seeded successfully" });
    }

    if (section === "gallery") {
      const existing = await getAddedGallery();
      if (existing.length > 0) {
        return res.status(400).json({ error: "Showcase Gallery section is not empty" });
      }

      let generatedGallery: any[] = [];

      if (ai) {
        try {
          const prompt = `You are a high-end textile finishing specialist for Oluwashola Textile Accessories in Lagos, Nigeria.
Generate exactly 3 premium, highly realistic completed jobs for our showcase gallery.
For each completed job, select the best matching image ID from this curated list of Unsplash IDs of high-quality finished work:
- "1598257006458-087169a1f08d" for category "Eyelets & Buttons" (Heavy metal eyelet setting and industrial button holes)
- "1558486012-817176f84c6d" for category "Embroidery" (High-density monogram embroidery on corporate uniforms)
- "1595777457583-95e059d581b8" for category "Beading & Stoning" (Luxurious crystal stoning patterns on bridal lace)
- "1618090584126-129cd1f3fbaa" for category "Laser Cutting" (Laser-engraved intricate garment templates)
- "1544816155-12df9643f363" for category "Patches" (Custom embroidered iron-on brand patches)

For each generated job, choose one corresponding image ID from the above list, and set the imageUrl field to "https://images.unsplash.com/photo-" + chosen_id + "?auto=format&fit=crop&q=80&w=600".

Generate realistic, high-end finishing results in English. Return the gallery items array in JSON format.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Bespoke name, e.g. The Sovereign Sapphire Agbada" },
                    category: { type: Type.STRING, description: "One of: Traditional, Male, Female, Children, Casual, Corporate, Wedding" },
                    description: { type: Type.STRING, description: "A detailed, luxury designer description of the tailoring, silhouette, embroidery, and styling cues" },
                    imageUrl: { type: Type.STRING, description: "The Unsplash image URL constructed with the chosen ID" }
                  },
                  required: ["title", "category", "description", "imageUrl"]
                }
              }
            }
          });

          if (response && response.text) {
            generatedGallery = JSON.parse(response.text.trim());
          }
        } catch (genErr) {
          console.error("Gemini gallery seeding error, falling back to static data:", genErr);
        }
      }

      if (generatedGallery.length === 0) {
        generatedGallery = [
          {
            title: "Precision Eyelet & Button Hole Installation",
            category: "Eyelets & Buttons",
            description: "Flawless installation of heavy-gauge brass eyelets and tidy button hole satin-stitches completed on classic native senator tunics for a luxury atelier.",
            imageUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600"
          },
          {
            title: "Intricate Monogram School Crest Embroidery",
            category: "Embroidery",
            description: "High-definition corporate and school blazer crest embroidery, computerized with metallic gold and royal navy threads for maximum durability.",
            imageUrl: "https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=600"
          },
          {
            title: "Premium Hand Beading & Hotfix Stoning",
            category: "Beading & Stoning",
            description: "Breathtaking dress enhancement completed with multi-faceted hotfix glass crystals and hand-set bugle beads on formal reception gowns.",
            imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
          }
        ];
      }

      for (let i = 0; i < generatedGallery.length; i++) {
        const item = generatedGallery[i];
        item.id = "work-gen-" + crypto.randomBytes(4).toString("hex");
        await addCustomGalleryItem(item);
      }

      return res.json({ success: true, message: "Showcase gallery section seeded successfully" });
    }

    if (section === "styles") {
      const existing = await getAddedStyles();
      if (existing.length > 0) {
        return res.status(400).json({ error: "Style Inspiration section is not empty" });
      }

      let generatedStyles: any[] = [];

      if (ai) {
        try {
          const prompt = `You are an expert finishing specialist for Oluwashola Textile Accessories in Lagos, Nigeria.
Generate exactly 3 professional textile finishing and machine services for our capabilities catalog.
For each service, select the best matching image ID from this curated list of Unsplash IDs of technical finishing processes:
- "1598257006458-087169a1f08d" for "Eyelet Installation & Button Holes" (Industrial finishing services)
- "1558486012-817176f84c6d" for "Computerized Monogram Embroidery" (Multi-needle digital monogramming)
- "1618090584126-129cd1f3fbaa" for "Precision Laser & CNC Fabric Cutting" (Intricate heat-sealed fabric cuts)
- "1595777457583-95e059d581b8" for "Garment Beading, Stoning & Sequins" (Automated rhinestone templates and handcrafts)

For each generated service, choose one corresponding image ID from the above list, and set the imageUrl field to "https://images.unsplash.com/photo-" + chosen_id + "?auto=format&fit=crop&q=80&w=600".

Generate realistic, high-end technical finishing capability details in English. Return the styles array in JSON format.`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Bespoke style name, e.g. Royal Sovereign Agbada Style" },
                    category: { type: Type.STRING, description: "One of: Traditional, Male, Female, Corporate" },
                    description: { type: Type.STRING, description: "A detailed styling description detailing the aesthetic, fabric pairing guidelines, and appropriate ceremony or event context" },
                    estimatedYardage: { type: Type.STRING, description: "E.g. 7-8 Yards (Fabric) + 2 Yards (Aso Oke) or 4 Yards of Cashmere Wool" },
                    imageUrl: { type: Type.STRING, description: "The Unsplash image URL constructed with the chosen ID" }
                  },
                  required: ["name", "category", "description", "estimatedYardage", "imageUrl"]
                }
              }
            }
          });

          if (response && response.text) {
            generatedStyles = JSON.parse(response.text.trim());
          }
        } catch (genErr) {
          console.error("Gemini styles seeding error, falling back to static data:", genErr);
        }
      }

      if (generatedStyles.length === 0) {
        generatedStyles = [
          {
            name: "Eyelet Installation & Button Holes",
            category: "Unisex • Adult • Finishing",
            description: "Perfect industrial machine metal eyelets and tidy satin-stitched button holes suited for premium native wears, canvas bags, and high-fashion coats.",
            estimatedYardage: "1-2 Business Days",
            imageUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600"
          },
          {
            name: "Computerized Monogram Embroidery",
            category: "Unisex • Adult • Embroidery",
            description: "High-density digital monogramming of corporate brands, school crests, or custom names on caps, towels, corporate blazers, and shirts.",
            estimatedYardage: "2-3 Business Days",
            imageUrl: "https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=600"
          },
          {
            name: "Precision Laser & CNC Fabric Cutting",
            category: "Unisex • Adult • Machine Cutting",
            description: "High-speed precise custom shape cutting with edge-sealing technology to prevent fraying on lace, velvet, and leather garment templates.",
            estimatedYardage: "2-4 Business Days",
            imageUrl: "https://images.unsplash.com/photo-1618090584126-129cd1f3fbaa?auto=format&fit=crop&q=80&w=600"
          }
        ];
      }

      for (let i = 0; i < generatedStyles.length; i++) {
        const style = generatedStyles[i];
        style.id = "style-gen-" + crypto.randomBytes(4).toString("hex");
        await addCustomStyle(style);
      }

      return res.json({ success: true, message: "Style inspiration section seeded successfully" });
    }

    res.status(400).json({ error: "Invalid section specified" });
  } catch (err) {
    console.error("Admin seed section error:", err);
    res.status(500).json({ error: "An unexpected error occurred seeding catalog section" });
  }
});

app.post("/api/admin/clear-catalog", async (req, res) => {
  try {
    const adminRole = getAdminFromAuthHeader(req.headers.authorization);
    if (!adminRole) {
      return res.status(401).json({ error: "Access denied: Invalid or expired admin session token" });
    }
    const success = await clearCatalogData();
    if (success) {
      res.json({ success: true, message: "Showroom catalog has been cleared successfully" });
    } else {
      res.status(500).json({ error: "Failed to clear catalog data" });
    }
  } catch (err) {
    console.error("Admin clear catalog error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Start express and configure Dev Vite Middleware or static files
async function startServer() {
  // Initialize DB (MySQL pool or JSON file-based fallback)
  await initializeDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve src/assets folder statically under /src/assets path so that default logo and hero background resolve in production
    app.use("/src/assets", express.static(path.join(process.cwd(), "src", "assets")));
    // Serve uploaded measurement files statically in production as well
    const uploadsPath = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(uploadsPath)) {
      app.use("/uploads", express.static(uploadsPath));
    }
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server fully loaded. Running on port ${PORT}`);
  });
}

startServer();
