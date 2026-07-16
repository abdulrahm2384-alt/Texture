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
      name: "Gilded Gold Swiss Voile Lace",
      category: "Lace",
      pricePerYard: 50000,
      availableColors: ["Gold & Emerald", "Ivory Gold", "Champagne Gold"],
      colorsHex: ["#155e3b", "#fffff0", "#f1e9d2"],
      description: "Intricately embroidered premium Swiss voile lace adorned with gold-threaded floral motifs and subtle sequin highlights. Ideal for Nigerian traditional weddings (Owambe) and luxury custom garments.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1594224140980-6e9dd0223e38?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-2",
      name: "Classic Vlisco Ankara (Vintage Sunburst)",
      category: "Ankara",
      pricePerYard: 15000,
      availableColors: ["Royal Indigo", "Saffron Sunburst", "Crimson Wave"],
      colorsHex: ["#1e3a8a", "#f59e0b", "#991b1b"],
      description: "Genuine luxury grade Vlisco wax print, 100% fine cotton. Features premium heritage African motifs with rich, lightfast saturation that holds its structural form perfectly for traditional Senator, Kaftan, or custom gowns.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1584184924103-e310d9dc82fc?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-3",
      name: "Handwoven Metallic Aso Oke (Luxe Thread)",
      category: "Aso Oke",
      pricePerYard: 65000,
      availableColors: ["Crimson Gold", "Silver Onyx", "Champagne Bronze"],
      colorsHex: ["#7f1d1d", "#374151", "#b45309"],
      description: "Masterfully hand-loomed traditional Yoruba fabric interwoven with premium metallic lurex threads for an unmatched royal reflection. Ideal for majestic caps, geles, sashes, and luxury custom Agbada sets.",
      stockAvailability: "Low Stock",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-4",
      name: "Royal Damask Brocade (Imperial Silk)",
      category: "Brocade",
      pricePerYard: 35000,
      availableColors: ["Midnight Blue", "Crimson Gold", "Imperial Teal"],
      colorsHex: ["#1e3a8a", "#b45309", "#0f766e"],
      description: "Heavyweight, luxurious jacquard-weave silk brocade featuring sophisticated regal damask patterns. Tailors beautifully into structured traditional men's Kaftans and corporate evening wears.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-5",
      name: "Elysian Mulberry Silk (Heavy Satin)",
      category: "Silk",
      pricePerYard: 40000,
      availableColors: ["Emerald Satin", "Rose Quartz", "Sapphire Silk"],
      colorsHex: ["#064e3b", "#fda4af", "#1d4ed8"],
      description: "Ultra-fluid 100% pure organic mulberry silk satin. Possesses a glossy, luminous outer finish and a liquid-soft touch that skims the silhouette elegantly, perfect for bridal reception gowns and luxury boubou styles.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-6",
      name: "Midnight Velvet Crush (Luxury Stretch)",
      category: "Velvet",
      pricePerYard: 25000,
      availableColors: ["Deep Burgundy", "Forest Green", "Obsidian Black"],
      colorsHex: ["#4c0519", "#064e3b", "#0f172a"],
      description: "Thick plush pile velvet with a rich multi-toned deep crush effect. Supple, comfortable stretch, excellent for opulent evening gowns, traditional wrappers, or custom embroidery accents.",
      stockAvailability: "In Stock",
      imageUrl: "https://images.unsplash.com/photo-1571242337471-70529d89196b?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fab-7",
      name: "Super 140s Italian Cashmere Wool",
      category: "Cashmere",
      pricePerYard: 60000,
      availableColors: ["Classic Charcoal", "Camel Luxe", "Deep Navy"],
      colorsHex: ["#4b5563", "#d97706", "#1e3a8a"],
      description: "Exquisite, lightweight superfine wool mixed with high-grade Italian cashmere fibers. Highly breathable, soft, and designed specifically for bespoke Senator wear, high-end Kaftans, and traditional executive styles.",
      stockAvailability: "Low Stock",
      imageUrl: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=600"
    }
  ],
  gallery: [
    {
      id: "work-1",
      title: "The Majestic Royal Agbada Set",
      category: "Traditional",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
      description: "A breathtaking 4-piece traditional Nigerian Agbada tailored in hand-loomed Royal Aso Oke. Features geometric hand-embroided patterns in metallic gold thread."
    },
    {
      id: "work-2",
      title: "Imperial Damask Kaftan with Crest",
      category: "Male",
      imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
      description: "An elegant, structurally tailored ivory and navy senator outfit. Designed using luxury Italian cashmere and features a minimalist modern embroidered breast seal."
    },
    {
      id: "work-3",
      title: "Gilded Ivory Mermaid Lace Gown",
      category: "Female",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
      description: "Stunning custom wedding gown designed in double-lined Swiss voile lace. Tailored to perfection with a hand-stitched beaded corset bodice and trailing train."
    },
    {
      id: "work-4",
      title: "Vibrant Ankara Ruffled Ballgown",
      category: "Children",
      imageUrl: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=600",
      description: "High-contrast tiered children's party gown designed with combined vintage sunburst Ankara and soft satin underlays."
    },
    {
      id: "work-5",
      title: "Contemporary Adire Resort Jumpsuit",
      category: "Casual",
      imageUrl: "https://images.unsplash.com/photo-1561932690-f98b9cd64221?auto=format&fit=crop&q=80&w=600",
      description: "Lightweight, fluid casual wear designed in premium indigo-dyed adire cotton. High-waisted belt design suited for everyday luxury."
    },
    {
      id: "work-6",
      title: "Classic Bespoke Corporate Suit",
      category: "Corporate",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
      description: "Sharp corporate menswear piece tailored with Italian superfine cashmere wool, featuring structured lapels and customized inner satin lining."
    },
    {
      id: "work-7",
      title: "Bridal Reception Lace Wrap Dress",
      category: "Wedding",
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600",
      description: "Luxurious reception dress for brides, combining fluid Elysian mulberry silk draping and premium French embroidered lace accents."
    }
  ],
  styles: [
    {
      id: "style-1",
      name: "The Majestic Agbada (4-Piece Outfit)",
      category: "Traditional",
      description: "A supreme traditional attire representing power and heritage, featuring the large flowing agbada gown, matching long sleeve kaftan, tapered trousers, and standard embroidered cap.",
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "7-8 Yards (Fabric) + 2 Yards (Aso Oke for Cap/Accents)"
    },
    {
      id: "style-2",
      name: "Corset Mermaid Lace Silhouette",
      category: "Female",
      description: "A tailored-to-fit evening and wedding design. Built on a sturdy boned corset foundation, cascading into a sweeping flare that highlights the fabrics' lace pattern beautifully.",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "5-6 Yards"
    },
    {
      id: "style-3",
      name: "Minimalist Senator Suit",
      category: "Male",
      description: "A sleek modern African formal alternative. Structured collar, dynamic custom embroidery or contrast piping, complete with tailored straight-cut trousers.",
      imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "4 Yards"
    },
    {
      id: "style-4",
      name: "Premium Buba & Iro Wrapper Set",
      category: "Traditional",
      description: "Classic Yoruba traditional elegance. Beautifully draped long sleeve top (Buba) paired with a wrapper skirt (Iro) and matching shoulder sash (Ipele). Highlighted by custom lace or Aso Oke border.",
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600",
      estimatedYardage: "5-6 Yards"
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

    // Create system_config table to track database seeding status
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`system_config\` (
        \`key\` VARCHAR(50) NOT NULL,
        \`value\` TEXT NOT NULL,
        PRIMARY KEY (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure system_config column is modified to TEXT for existing databases
    try {
      await connection.query("ALTER TABLE `system_config` MODIFY COLUMN `value` TEXT NOT NULL");
    } catch (sysErr) {
      console.log("Database system_config column modification already applied or not needed:", sysErr);
    }

    // Seed default catalog if not already done
    const [seedRows]: any = await connection.query("SELECT * FROM system_config WHERE `key` = 'seeded'");
    if (!seedRows || seedRows.length === 0) {
      console.log("Database not seeded. Initializing default catalog into MySQL tables...");

      // Seed default fabrics
      for (const f of initialCatalogData.fabrics) {
        const colorsStr = JSON.stringify(f.availableColors || []);
        const colorsHexStr = JSON.stringify(f.colorsHex || []);
        await connection.query(
          `INSERT INTO custom_fabrics (id, name, category, pricePerYard, availableColors, colorsHex, description, stockAvailability, imageUrl) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [f.id, f.name, f.category, f.pricePerYard, colorsStr, colorsHexStr, f.description, f.stockAvailability, f.imageUrl]
        );
      }

      // Seed default gallery items
      for (const item of initialCatalogData.gallery) {
        await connection.query(
          `INSERT INTO custom_gallery (id, title, category, description, imageUrl) 
           VALUES (?, ?, ?, ?, ?)`,
          [item.id, item.title, item.category, item.description, item.imageUrl]
        );
      }

      // Seed default style inspirations
      for (const style of initialCatalogData.styles) {
        await connection.query(
          `INSERT INTO custom_styles (id, name, category, description, imageUrl, estimatedYardage) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [style.id, style.name, style.category, style.description, style.imageUrl, style.estimatedYardage]
        );
      }

      await connection.query("INSERT INTO system_config (`key`, `value`) VALUES ('seeded', 'true')");
      console.log("MySQL database seeding complete successfully!");
    }

    connection.release();
    console.log("MySQL database tables verified, created, and seeded successfully.");
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
      added_fabrics: [...initialCatalogData.fabrics],
      added_gallery: [...initialCatalogData.gallery],
      added_styles: [...initialCatalogData.styles]
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

    if (!parsed.added_fabrics) {
      parsed.added_fabrics = [...initialCatalogData.fabrics];
      changed = true;
    }
    if (!parsed.added_gallery) {
      parsed.added_gallery = [...initialCatalogData.gallery];
      changed = true;
    }
    if (!parsed.added_styles) {
      parsed.added_styles = [...initialCatalogData.styles];
      changed = true;
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
      added_fabrics: [...initialCatalogData.fabrics], 
      added_gallery: [...initialCatalogData.gallery], 
      added_styles: [...initialCatalogData.styles] 
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
        `INSERT INTO custom_fabrics (id, name, category, pricePerYard, availableColors, colorsHex, description, stockAvailability, imageUrl) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.name, f.category, f.pricePerYard, colorsStr, colorsHexStr, f.description, f.stockAvailability, f.imageUrl]
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
  wingFabricsBgUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=600",
  wingStylesBgUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600",
  wingOrderBgUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600",
  wingContactBgUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600"
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
