import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Load the environment variables
const DB_HOST = process.env.DB_HOST?.trim();
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT.trim(), 10) : 3306;
const DB_NAME = process.env.DB_NAME?.trim();
const DB_USER = process.env.DB_USER?.trim();
const DB_PASSWORD = process.env.DB_PASSWORD?.trim();

const isMySqlConfigured = !!(DB_HOST && DB_NAME && DB_USER);

// File-based fallback configuration
const DB_FILE = path.join(process.cwd(), "db.json");

// Catalog initial data
export const initialCatalogData = {
  fabrics: [
    {
      id: "fab-1",
      name: "Designer Cashmere Senator Set",
      category: "Ready-to-Wear",
      gender: "Male",
      ageGroup: "Adult",
      pricePerYard: 45000,
      pricingUnit: "Set",
      minOrderQty: 1,
      maxOrderQty: 10,
      availableColors: ["Royal Navy", "Charcoal Grey", "Emerald Green", "Wine Burgundy"],
      colorsHex: ["#1e3a8a", "#4b5563", "#047857", "#7f1d1d"],
      description: "Impeccably tailored Cashmere wool Senator top and trousers. Features a clean, minimalist design with a smart breast pocket and matching trousers.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-2",
      name: "Professional Tailoring Shears (10-inch)",
      category: "Tailoring Tools",
      gender: "All",
      ageGroup: "All",
      pricePerYard: 18500,
      pricingUnit: "Unit",
      minOrderQty: 1,
      maxOrderQty: 5,
      availableColors: ["Classic Gold", "Mirror Silver", "Midnight Black"],
      colorsHex: ["#ffd700", "#c0c0c0", "#09090b"],
      description: "Ultra-sharp heavy-duty carbon steel scissors with ergonomic handles. Designed for clean cuts through denim, leather, and multiple layers of fabric.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-3",
      name: "Luxury Intricate Organza Lace",
      category: "Bespoke Fabric",
      gender: "Female",
      ageGroup: "All",
      pricePerYard: 25000,
      pricingUnit: "Yard",
      minOrderQty: 1,
      maxOrderQty: 15,
      availableColors: ["Ivory Cream", "Rose Gold", "Royal Blue", "Onyx Black"],
      colorsHex: ["#fefcbf", "#fda4af", "#1d4ed8", "#000000"],
      description: "Exquisite organza fabric adorned with delicate floral threadwork, sequins, and scalloped borders. Perfect for bridal and luxury Owambe garments.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-4",
      name: "Hand-Beaded Silk Kaftan Dress",
      category: "Ready-to-Wear",
      gender: "Female",
      ageGroup: "Adult",
      pricePerYard: 65000,
      pricingUnit: "Unit",
      minOrderQty: 1,
      maxOrderQty: 10,
      availableColors: ["Saffron Orange", "Teal Turquoise", "Magenta Pink"],
      colorsHex: ["#ea580c", "#0d9488", "#db2777"],
      description: "Luminous pure silk kaftan detailed with intricate hand-beading crystal stoning along the neckline and sleeves. Effortlessly elegant.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-5",
      name: "Aso Oke Traditional Cap & Capes Set",
      category: "Fashion Accessories",
      gender: "All",
      ageGroup: "Adult",
      pricePerYard: 15000,
      pricingUnit: "Set",
      minOrderQty: 1,
      maxOrderQty: 10,
      availableColors: ["Vintage Gold/Burgundy", "Silver/Navy", "Magenta/Gold"],
      colorsHex: ["#b45309", "#3b82f6", "#be185d"],
      description: "Authentic hand-woven Yoruba Aso Oke accessories. Includes a pre-folded statement cap (Fila) and matching shoulder sash (Apele).",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1593030142662-01566a7b3a82?auto=format&fit=crop&q=80&w=600"
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

// Global pool variable
let pool: mysql.Pool | null = null;

// Initialize MySQL pool and create tables if they do not exist
export async function initializeDatabase(): Promise<boolean> {
  if (!isMySqlConfigured) {
    console.log("MySQL connection variables not fully set. Falling back to JSON file storage.");
    // Ensure db.json has the base structure
    ensureJsonDbExists();
    return false;
  }

  try {
    console.log(`Attempting to connect to MySQL database '${DB_NAME}' at ${DB_HOST}:${DB_PORT}...`);
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log("Successfully connected to MySQL database pool!");

    // Automatic Migration: Create Tables If Not Exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`phone\` VARCHAR(30) NULL,
        \`address\` TEXT NULL,
        \`salt\` VARCHAR(64) NOT NULL,
        \`hash\` VARCHAR(128) NOT NULL,
        \`measurements\` TEXT NULL,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`userId\` VARCHAR(50) NOT NULL,
        \`orderType\` VARCHAR(50) NOT NULL,
        \`fabricId\` VARCHAR(50) NULL,
        \`yardsOrdered\` INT NULL,
        \`customStyleId\` VARCHAR(50) NULL,
        \`selectedFabrics\` TEXT NULL,
        \`selectedServices\` TEXT NULL,
        \`measurementsType\` VARCHAR(50) NOT NULL,
        \`measurements\` TEXT NULL,
        \`measurementFileUrl\` VARCHAR(255) NULL,
        \`deliveryType\` VARCHAR(50) NOT NULL,
        \`deliveryAddress\` TEXT NULL,
        \`specialInstructions\` TEXT NULL,
        \`totalPrice\` INT NOT NULL,
        \`status\` VARCHAR(30) NOT NULL DEFAULT 'pending',
        \`createdAt\` VARCHAR(50) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_orders_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`custom_fabrics\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(255) NOT NULL,
        \`pricePerYard\` INT NOT NULL,
        \`availableColors\` TEXT NULL,
        \`colorsHex\` TEXT NULL,
        \`description\` TEXT NULL,
        \`stockAvailability\` VARCHAR(30) NOT NULL DEFAULT 'In Stock',
        \`imageUrl\` TEXT NOT NULL,
        \`gender\` VARCHAR(50) NULL DEFAULT 'All',
        \`ageGroup\` VARCHAR(50) NULL DEFAULT 'All',
        \`pricingUnit\` VARCHAR(50) NULL DEFAULT 'Yard',
        \`minOrderQty\` INT NULL DEFAULT 1,
        \`maxOrderQty\` INT NULL DEFAULT 10,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`custom_gallery\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`title\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`imageUrl\` TEXT NOT NULL,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`custom_styles\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`imageUrl\` TEXT NOT NULL,
        \`estimatedYardage\` VARCHAR(100) NOT NULL,
        \`createdAt\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Alter existing tables just in case they were created with VARCHAR(50) earlier
    try {
      await connection.query("ALTER TABLE `custom_fabrics` MODIFY COLUMN `category` VARCHAR(255) NOT NULL");
      await connection.query("ALTER TABLE `custom_gallery` MODIFY COLUMN `category` VARCHAR(255) NOT NULL");
      await connection.query("ALTER TABLE `custom_styles` MODIFY COLUMN `category` VARCHAR(255) NOT NULL");
    } catch (alterErr) {
      console.log("Database table modifications (ALTER) already applied or not needed:", alterErr);
    }

    try {
      await connection.query("ALTER TABLE `custom_fabrics` ADD COLUMN `gender` VARCHAR(50) NULL DEFAULT 'All'");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE `custom_fabrics` ADD COLUMN `ageGroup` VARCHAR(50) NULL DEFAULT 'All'");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE `custom_fabrics` ADD COLUMN `pricingUnit` VARCHAR(50) NULL DEFAULT 'Yard'");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE `custom_fabrics` ADD COLUMN `minOrderQty` INT NULL DEFAULT 1");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE `custom_fabrics` ADD COLUMN `maxOrderQty` INT NULL DEFAULT 10");
    } catch (e) {}

    // Create system_config table to track database seeding status
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`system_config\` (
        \`key\` VARCHAR(50) NOT NULL,
        \`value\` LONGTEXT NOT NULL,
        PRIMARY KEY (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure system_config column is modified to LONGTEXT for existing databases
    try {
      await connection.query("ALTER TABLE `system_config` MODIFY COLUMN `value` LONGTEXT NOT NULL");
    } catch (sysErr) {
      console.log("Database system_config column modification already applied or not needed:", sysErr);
    }

    // Seed default catalog if not already done
    const [seedRows]: any = await connection.query("SELECT * FROM system_config WHERE \`key\` = 'seeded'");
    if (!seedRows || seedRows.length === 0) {
      console.log("Database not seeded. Initializing empty catalog into MySQL tables for production...");
      await connection.query("INSERT INTO system_config (\`key\`, \`value\`) VALUES ('seeded', 'true')");
      console.log("MySQL database seeding complete successfully (started empty)!");
    }

    connection.release();
    console.log("MySQL database tables verified and created successfully.");
    return true;
  } catch (error) {
    console.error("Failed to connect/initialize MySQL database. Falling back to local JSON file storage.", error);
    pool = null;
    ensureJsonDbExists();
    return false;
  }
}

// Ensure JSON database exists with correct shape
function ensureJsonDbExists() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      users: [] as any[],
      orders: [] as any[],
      added_fabrics: [] as any[],
      added_gallery: [] as any[],
      added_styles: [] as any[]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Read from JSON db (fallback helper)
function readJsonDb() {
  ensureJsonDbExists();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    let changed = false;

    // Migrate existing old database schemas if they have separate fabrics/gallery/styles fields
    if (parsed.fabrics) {
      parsed.added_fabrics = parsed.fabrics;
      delete parsed.fabrics;
      changed = true;
    }
    if (parsed.gallery) {
      parsed.added_gallery = parsed.gallery;
      delete parsed.gallery;
      changed = true;
    }
    if (parsed.styles) {
      parsed.added_styles = parsed.styles;
      delete parsed.styles;
      changed = true;
    }

    if (!parsed.added_fabrics || parsed.added_fabrics.length === 0) {
      parsed.added_fabrics = JSON.parse(JSON.stringify(initialCatalogData.fabrics));
      changed = true;
    }
    if (!parsed.added_gallery || parsed.added_gallery.length === 0) {
      parsed.added_gallery = JSON.parse(JSON.stringify(initialCatalogData.gallery));
      changed = true;
    }
    if (!parsed.added_styles || parsed.added_styles.length === 0) {
      parsed.added_styles = JSON.parse(JSON.stringify(initialCatalogData.styles));
      changed = true;
    }

    // Smart migration for existing old data (Agbada / Kaftan / Lace fashion items)
    const hasOldData = 
      (parsed.added_fabrics && parsed.added_fabrics.some((f: any) => f.category === "Lace" || f.category === "Ankara" || f.name?.includes("Swiss Voile"))) ||
      (parsed.added_gallery && parsed.added_gallery.some((g: any) => g.title?.includes("Agbada") || g.title?.includes("Kaftan") || g.title?.includes("Gown") || g.title?.includes("Suit"))) ||
      (parsed.added_styles && parsed.added_styles.some((s: any) => s.name?.includes("Agbada") || s.name?.includes("Senator") || s.name?.includes("Kaftan")));

    if (hasOldData) {
      console.log("Old fashion design catalog detected on disk. Migrating database to professional industrial finishing and raw accessories schema...");
      parsed.added_fabrics = JSON.parse(JSON.stringify(initialCatalogData.fabrics));
      parsed.added_gallery = JSON.parse(JSON.stringify(initialCatalogData.gallery));
      parsed.added_styles = JSON.parse(JSON.stringify(initialCatalogData.styles));
      changed = true;
    }

    // Force migration of contact_info layout images to professional non-industrial, non-dog variants
    if (parsed.contact_info) {
      if (
        !parsed.contact_info.wingAboutBgUrl || 
        parsed.contact_info.wingAboutBgUrl.includes("1520038410233") || // old dog image
        parsed.contact_info.wingAboutBgUrl.includes("monogram_machine") || // old machine
        parsed.contact_info.wingContactBgUrl?.includes("cnc_desktop_router") || // old machine
        parsed.contact_info.wingOrderBgUrl?.includes("clothe_beading_machine") || // old machine
        parsed.contact_info.wingGalleryBgUrl?.includes("1558486012-817176f84c6d") || // old monogram/school crest image
        parsed.contact_info.wingFabricsBgUrl?.includes("1598257006458-087169a1f08d") // force upgrade shears back to fabric
      ) {
        console.log("Upgrading saved contact_info styling imagery to point directly to beautiful, customer-facing matching photos...");
        parsed.contact_info.logoUrl = DEFAULT_CONTACT_INFO.logoUrl;
        parsed.contact_info.heroBgUrl = DEFAULT_CONTACT_INFO.heroBgUrl;
        parsed.contact_info.wingAboutBgUrl = DEFAULT_CONTACT_INFO.wingAboutBgUrl;
        parsed.contact_info.wingGalleryBgUrl = DEFAULT_CONTACT_INFO.wingGalleryBgUrl;
        parsed.contact_info.wingFabricsBgUrl = DEFAULT_CONTACT_INFO.wingFabricsBgUrl;
        parsed.contact_info.wingStylesBgUrl = DEFAULT_CONTACT_INFO.wingStylesBgUrl;
        parsed.contact_info.wingOrderBgUrl = DEFAULT_CONTACT_INFO.wingOrderBgUrl;
        parsed.contact_info.wingContactBgUrl = DEFAULT_CONTACT_INFO.wingContactBgUrl;
        changed = true;
      }
    }

    if (changed) {
      writeJsonDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error("Failed reading JSON fallback database:", err);
    return { 
      users: [], 
      orders: [], 
      added_fabrics: [], 
      added_gallery: [], 
      added_styles: [] 
    };
  }
}

// Write to JSON db (fallback helper)
function writeJsonDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed writing JSON fallback database:", err);
  }
}

// ==========================================
// DATABASE ACCESS API FUNCTIONS
// ==========================================

// 1. Get User by Email
export async function getUserByEmail(email: string): Promise<any | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (pool) {
    try {
      const [rows]: any = await pool.query(
        "SELECT * FROM users WHERE LOWER(email) = ?",
        [normalizedEmail]
      );
      if (rows && rows.length > 0) {
        const user = rows[0];
        // Parse stringified JSON fields
        if (user.measurements && typeof user.measurements === "string") {
          try {
            user.measurements = JSON.parse(user.measurements);
          } catch (e) {
            user.measurements = {};
          }
        }
        return user;
      }
      return null;
    } catch (err) {
      console.error("MySQL getUserByEmail error:", err);
      // Fallback to JSON db on runtime MySQL query failure
    }
  }

  // Fallback
  const db = readJsonDb();
  const found = db.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
  return found || null;
}

// 2. Get User by ID
export async function getUserById(id: string): Promise<any | null> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      if (rows && rows.length > 0) {
        const user = rows[0];
        if (user.measurements && typeof user.measurements === "string") {
          try {
            user.measurements = JSON.parse(user.measurements);
          } catch (e) {
            user.measurements = {};
          }
        }
        return user;
      }
      return null;
    } catch (err) {
      console.error("MySQL getUserById error:", err);
    }
  }

  const db = readJsonDb();
  const found = db.users.find((u: any) => u.id === id);
  return found || null;
}

// 3. Add New User
export async function addUser(user: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  salt: string;
  hash: string;
  measurements?: any;
}): Promise<boolean> {
  const measurementsStr = JSON.stringify(user.measurements || { measurementUnit: "inches" });

  if (pool) {
    try {
      await pool.query(
        "INSERT INTO users (id, email, name, phone, address, salt, hash, measurements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          user.id,
          user.email.toLowerCase().trim(),
          user.name,
          user.phone || null,
          user.address || null,
          user.salt,
          user.hash,
          measurementsStr
        ]
      );
      return true;
    } catch (err) {
      console.error("MySQL addUser error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  const newUser = {
    ...user,
    measurements: user.measurements || { measurementUnit: "inches" }
  };
  db.users.push(newUser);
  writeJsonDb(db);
  return true;
}

// 4. Update User Measurements
export async function updateUserMeasurements(id: string, measurements: any): Promise<boolean> {
  if (pool) {
    try {
      const user = await getUserById(id);
      if (!user) return false;

      const merged = { ...user.measurements, ...measurements };
      const mergedStr = JSON.stringify(merged);

      await pool.query("UPDATE users SET measurements = ? WHERE id = ?", [mergedStr, id]);
      return true;
    } catch (err) {
      console.error("MySQL updateUserMeasurements error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  const userIdx = db.users.findIndex((u: any) => u.id === id);
  if (userIdx !== -1) {
    db.users[userIdx].measurements = {
      ...db.users[userIdx].measurements,
      ...measurements
    };
    writeJsonDb(db);
    return true;
  }
  return false;
}

// 5. Update User Profile Info
export async function updateUserProfile(
  id: string,
  name?: string,
  phone?: string,
  address?: string
): Promise<any | null> {
  if (pool) {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
      }
      if (phone !== undefined) {
        updates.push("phone = ?");
        values.push(phone);
      }
      if (address !== undefined) {
        updates.push("address = ?");
        values.push(address);
      }

      if (updates.length > 0) {
        values.push(id);
        await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
      }

      return await getUserById(id);
    } catch (err) {
      console.error("MySQL updateUserProfile error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  const userIdx = db.users.findIndex((u: any) => u.id === id);
  if (userIdx !== -1) {
    if (name !== undefined) db.users[userIdx].name = name;
    if (phone !== undefined) db.users[userIdx].phone = phone;
    if (address !== undefined) db.users[userIdx].address = address;
    writeJsonDb(db);
    return db.users[userIdx];
  }
  return null;
}

// 6. Add Order
export async function addOrder(order: {
  id: string;
  userId: string;
  orderType: string;
  fabricId?: string;
  yardsOrdered?: number;
  customStyleId?: string;
  selectedFabrics?: any;
  selectedServices: string[];
  measurementsType: string;
  measurements?: any;
  measurementFileUrl?: string;
  deliveryType: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}): Promise<boolean> {
  const selectedFabricsStr = order.selectedFabrics ? JSON.stringify(order.selectedFabrics) : null;
  const selectedServicesStr = JSON.stringify(order.selectedServices || []);
  const measurementsStr = order.measurements ? JSON.stringify(order.measurements) : null;

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO orders (
          id, userId, orderType, fabricId, yardsOrdered, customStyleId, 
          selectedFabrics, selectedServices, measurementsType, measurements, 
          measurementFileUrl, deliveryType, deliveryAddress, specialInstructions, 
          totalPrice, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.userId,
          order.orderType,
          order.fabricId || null,
          order.yardsOrdered || null,
          order.customStyleId || null,
          selectedFabricsStr,
          selectedServicesStr,
          order.measurementsType,
          measurementsStr,
          order.measurementFileUrl || null,
          order.deliveryType,
          order.deliveryAddress || null,
          order.specialInstructions || null,
          order.totalPrice,
          order.status,
          order.createdAt
        ]
      );
      return true;
    } catch (err) {
      console.error("MySQL addOrder error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  db.orders.push(order);
  writeJsonDb(db);
  return true;
}

// 7. Get Orders by User ID
export async function getOrdersByUserId(userId: string): Promise<any[]> {
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        "SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC",
        [userId]
      );
      if (rows) {
        return rows.map((order: any) => {
          // Parse JSON fields
          if (order.selectedFabrics && typeof order.selectedFabrics === "string") {
            try { order.selectedFabrics = JSON.parse(order.selectedFabrics); } catch (e) { order.selectedFabrics = []; }
          }
          if (order.selectedServices && typeof order.selectedServices === "string") {
            try { order.selectedServices = JSON.parse(order.selectedServices); } catch (e) { order.selectedServices = []; }
          }
          if (order.measurements && typeof order.measurements === "string") {
            try { order.measurements = JSON.parse(order.measurements); } catch (e) { order.measurements = {}; }
          }
          return order;
        });
      }
      return [];
    } catch (err) {
      console.error("MySQL getOrdersByUserId error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  return db.orders.filter((o: any) => o.userId === userId).reverse();
}

// 8. Get All Orders (Admin)
export async function getAllOrders(): Promise<any[]> {
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        `SELECT o.*, u.name as clientName, u.email as clientEmail, u.phone as clientPhone, u.address as clientAddress
         FROM orders o
         JOIN users u ON o.userId = u.id
         ORDER BY o.createdAt DESC`
      );
      if (rows) {
        return rows.map((order: any) => {
          if (order.selectedFabrics && typeof order.selectedFabrics === "string") {
            try { order.selectedFabrics = JSON.parse(order.selectedFabrics); } catch (e) { order.selectedFabrics = []; }
          }
          if (order.selectedServices && typeof order.selectedServices === "string") {
            try { order.selectedServices = JSON.parse(order.selectedServices); } catch (e) { order.selectedServices = []; }
          }
          if (order.measurements && typeof order.measurements === "string") {
            try { order.measurements = JSON.parse(order.measurements); } catch (e) { order.measurements = {}; }
          }
          return order;
        });
      }
      return [];
    } catch (err) {
      console.error("MySQL getAllOrders error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  return db.orders.map((o: any) => {
    const user = db.users.find((u: any) => u.id === o.userId);
    return {
      ...o,
      clientName: user ? user.name : "Unknown Customer",
      clientEmail: user ? user.email : "Unknown Email",
      clientPhone: user ? user.phone : "",
      clientAddress: user ? user.address : "",
    };
  }).reverse();
}

// 9. Update Order Status (Admin)
export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  if (pool) {
    try {
      await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
      return true;
    } catch (err) {
      console.error("MySQL updateOrderStatus error:", err);
    }
  }

  // Fallback
  const db = readJsonDb();
  const idx = db.orders.findIndex((o: any) => o.id === id);
  if (idx !== -1) {
    db.orders[idx].status = status;
    writeJsonDb(db);
    return true;
  }
  return false;
}

// 10. Get Added Fabrics
export async function getAddedFabrics(): Promise<any[]> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM custom_fabrics ORDER BY createdAt DESC");
      if (rows) {
        return rows.map((f: any) => {
          if (f.availableColors && typeof f.availableColors === "string") {
            try { f.availableColors = JSON.parse(f.availableColors); } catch (e) { f.availableColors = []; }
          }
          if (f.colorsHex && typeof f.colorsHex === "string") {
            try { f.colorsHex = JSON.parse(f.colorsHex); } catch (e) { f.colorsHex = []; }
          }
          return f;
        });
      }
      return [];
    } catch (err) {
      console.error("MySQL getAddedFabrics error:", err);
    }
  }
  const db = readJsonDb();
  return db.added_fabrics || [];
}

// 11. Add Custom Fabric
export async function addCustomFabric(f: any): Promise<boolean> {
  const colorsStr = JSON.stringify(f.availableColors || []);
  const colorsHexStr = JSON.stringify(f.colorsHex || []);
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO custom_fabrics (id, name, category, pricePerYard, availableColors, colorsHex, description, stockAvailability, imageUrl, gender, ageGroup, pricingUnit, minOrderQty, maxOrderQty) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.name, f.category, f.pricePerYard, colorsStr, colorsHexStr, f.description, f.stockAvailability, f.imageUrl, f.gender || 'All', f.ageGroup || 'All', f.pricingUnit || 'Yard', f.minOrderQty || 1, f.maxOrderQty || 10]
      );
      return true;
    } catch (err) {
      console.error("MySQL addCustomFabric error:", err);
    }
  }
  const db = readJsonDb();
  db.added_fabrics = db.added_fabrics || [];
  db.added_fabrics.push(f);
  writeJsonDb(db);
  return true;
}

// 12. Delete Custom Fabric
export async function deleteCustomFabric(id: string): Promise<boolean> {
  if (pool) {
    try {
      await pool.query("DELETE FROM custom_fabrics WHERE id = ?", [id]);
      return true;
    } catch (err) {
      console.error("MySQL deleteCustomFabric error:", err);
    }
  }
  const db = readJsonDb();
  db.added_fabrics = (db.added_fabrics || []).filter((f: any) => f.id !== id);
  writeJsonDb(db);
  return true;
}

// 12b. Update Custom Fabric Price / Details
export async function updateCustomFabric(id: string, updates: any): Promise<boolean> {
  if (pool) {
    try {
      const fields = [];
      const values = [];
      for (const [key, val] of Object.entries(updates)) {
        fields.push(`\`${key}\` = ?`);
        if (typeof val === 'object' && val !== null) {
          values.push(JSON.stringify(val));
        } else {
          values.push(val);
        }
      }
      if (fields.length > 0) {
        values.push(id);
        await pool.query(
          `UPDATE custom_fabrics SET ${fields.join(", ")} WHERE id = ?`,
          values
        );
        return true;
      }
    } catch (err) {
      console.error("MySQL updateCustomFabric error:", err);
    }
  }
  const db = readJsonDb();
  db.added_fabrics = (db.added_fabrics || []).map((f: any) => {
    if (f.id === id) {
      return { ...f, ...updates };
    }
    return f;
  });
  writeJsonDb(db);
  return true;
}

// 13. Get Added Gallery Items (Showcase)
export async function getAddedGallery(): Promise<any[]> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM custom_gallery ORDER BY createdAt DESC");
      return rows || [];
    } catch (err) {
      console.error("MySQL getAddedGallery error:", err);
    }
  }
  const db = readJsonDb();
  return db.added_gallery || [];
}

// 14. Add Custom Gallery Item (Showcase)
export async function addCustomGalleryItem(item: any): Promise<boolean> {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO custom_gallery (id, title, category, description, imageUrl) 
         VALUES (?, ?, ?, ?, ?)`,
        [item.id, item.title, item.category, item.description, item.imageUrl]
      );
      return true;
    } catch (err) {
      console.error("MySQL addCustomGalleryItem error:", err);
    }
  }
  const db = readJsonDb();
  db.added_gallery = db.added_gallery || [];
  db.added_gallery.push(item);
  writeJsonDb(db);
  return true;
}

// 15. Delete Custom Gallery Item (Showcase)
export async function deleteCustomGalleryItem(id: string): Promise<boolean> {
  if (pool) {
    try {
      await pool.query("DELETE FROM custom_gallery WHERE id = ?", [id]);
      return true;
    } catch (err) {
      console.error("MySQL deleteCustomGalleryItem error:", err);
    }
  }
  const db = readJsonDb();
  db.added_gallery = (db.added_gallery || []).filter((item: any) => item.id !== id);
  writeJsonDb(db);
  return true;
}

// 16. Get Added Styles
export async function getAddedStyles(): Promise<any[]> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT * FROM custom_styles ORDER BY createdAt DESC");
      return rows || [];
    } catch (err) {
      console.error("MySQL getAddedStyles error:", err);
    }
  }
  const db = readJsonDb();
  return db.added_styles || [];
}

// 17. Add Custom Style Inspiration
export async function addCustomStyle(style: any): Promise<boolean> {
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO custom_styles (id, name, category, description, imageUrl, estimatedYardage) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [style.id, style.name, style.category, style.description, style.imageUrl, style.estimatedYardage]
      );
      return true;
    } catch (err) {
      console.error("MySQL addCustomStyle error:", err);
    }
  }
  const db = readJsonDb();
  db.added_styles = db.added_styles || [];
  db.added_styles.push(style);
  writeJsonDb(db);
  return true;
}

// 18. Delete Custom Style
export async function deleteCustomStyle(id: string): Promise<boolean> {
  if (pool) {
    try {
      await pool.query("DELETE FROM custom_styles WHERE id = ?", [id]);
      return true;
    } catch (err) {
      console.error("MySQL deleteCustomStyle error:", err);
    }
  }
  const db = readJsonDb();
  db.added_styles = (db.added_styles || []).filter((s: any) => s.id !== id);
  writeJsonDb(db);
  return true;
}

// 19. Contact Info Types & Helpers
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
  logoUrl?: string;
  heroBgUrl?: string;
  wingAboutBgUrl?: string;
  wingGalleryBgUrl?: string;
  wingFabricsBgUrl?: string;
  wingStylesBgUrl?: string;
  wingOrderBgUrl?: string;
  wingContactBgUrl?: string;
  servicePrices?: {
    monogramming?: number;
    beading?: number;
    stoning?: number;
    sewing?: number;
    laser_cut?: number;
    cnc_router?: number;
    weaving?: number;
    i_let?: number;
    button_holes?: number;
  };
}

export const DEFAULT_CONTACT_INFO: ContactInfo = {
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
  heroBgUrl: "/src/assets/images/textile_hero_1784138693639.jpg",
  wingAboutBgUrl: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600",
  wingGalleryBgUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600",
  wingFabricsBgUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
  wingStylesBgUrl: "https://images.unsplash.com/photo-1618090584126-129cd1f3fbaa?auto=format&fit=crop&q=80&w=600",
  wingOrderBgUrl: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600",
  wingContactBgUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=600",
  servicePrices: {
    monogramming: 15000,
    beading: 45000,
    stoning: 30000,
    sewing: 40000,
    laser_cut: 25000,
    cnc_router: 35000,
    weaving: 50000,
    i_let: 10000,
    button_holes: 5000,
  }
};

export async function getContactInfo(): Promise<ContactInfo> {
  if (pool) {
    try {
      const [rows]: any = await pool.query("SELECT `value` FROM system_config WHERE `key` = 'contact_info'");
      if (rows && rows.length > 0) {
        const data = JSON.parse(rows[0].value);
        return {
          ...DEFAULT_CONTACT_INFO,
          ...data
        };
      }
    } catch (err) {
      console.error("MySQL getContactInfo error, returning default:", err);
    }
  }
  const db = readJsonDb();
  return {
    ...DEFAULT_CONTACT_INFO,
    ...(db.contact_info || {})
  };
}

export async function updateContactInfo(info: ContactInfo): Promise<boolean> {
  const serialized = JSON.stringify(info);
  if (pool) {
    try {
      await pool.query(
        "INSERT INTO system_config (`key`, `value`) VALUES ('contact_info', ?) ON DUPLICATE KEY UPDATE `value` = ?",
        [serialized, serialized]
      );
      return true;
    } catch (err) {
      console.error("MySQL updateContactInfo error:", err);
    }
  }
  const db = readJsonDb();
  db.contact_info = info;
  writeJsonDb(db);
  return true;
}

export async function seedDefaultCatalog(): Promise<boolean> {
  if (pool) {
    try {
      await pool.query("DELETE FROM custom_fabrics");
      await pool.query("DELETE FROM custom_gallery");
      await pool.query("DELETE FROM custom_styles");

      for (const f of initialCatalogData.fabrics) {
        const colorsStr = JSON.stringify(f.availableColors || []);
        const colorsHexStr = JSON.stringify(f.colorsHex || []);
        await pool.query(
          `INSERT INTO custom_fabrics (id, name, category, pricePerYard, availableColors, colorsHex, description, stockAvailability, imageUrl, gender, ageGroup, pricingUnit, minOrderQty, maxOrderQty) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [f.id, f.name, f.category, f.pricePerYard, colorsStr, colorsHexStr, f.description, f.stockAvailability, f.imageUrl, f.gender || 'All', f.ageGroup || 'All', f.pricingUnit || 'Yard', f.minOrderQty || 1, f.maxOrderQty || 10]
        );
      }

      for (const item of initialCatalogData.gallery) {
        await pool.query(
          `INSERT INTO custom_gallery (id, title, category, description, imageUrl) 
           VALUES (?, ?, ?, ?, ?)`,
          [item.id, item.title, item.category, item.description, item.imageUrl]
        );
      }

      for (const style of initialCatalogData.styles) {
        await pool.query(
          `INSERT INTO custom_styles (id, name, category, description, imageUrl, estimatedYardage) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [style.id, style.name, style.category, style.description, style.imageUrl, style.estimatedYardage]
        );
      }
      return true;
    } catch (err) {
      console.error("MySQL seedDefaultCatalog error:", err);
      return false;
    }
  }

  const db = readJsonDb();
  db.added_fabrics = JSON.parse(JSON.stringify(initialCatalogData.fabrics));
  db.added_gallery = JSON.parse(JSON.stringify(initialCatalogData.gallery));
  db.added_styles = JSON.parse(JSON.stringify(initialCatalogData.styles));
  writeJsonDb(db);
  return true;
}

export async function clearCatalogData(): Promise<boolean> {
  if (pool) {
    try {
      await pool.query("DELETE FROM custom_fabrics");
      await pool.query("DELETE FROM custom_gallery");
      await pool.query("DELETE FROM custom_styles");
      return true;
    } catch (err) {
      console.error("MySQL clearCatalogData error:", err);
      return false;
    }
  }

  const db = readJsonDb();
  db.added_fabrics = [];
  db.added_gallery = [];
  db.added_styles = [];
  writeJsonDb(db);
  return true;
}
