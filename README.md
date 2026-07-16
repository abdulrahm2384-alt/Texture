# Oluwashola Atelier - DirectAdmin Production Deployment Guide

This application is built with a **React + Vite + TypeScript** frontend, a **Node.js + Express + TypeScript** backend, and is fully configured to run natively on standard Linux hosting environments such as **DirectAdmin** (using the Setup Node.js App utility) with **MySQL** or **MariaDB**.

---

## 🌟 Key Production Features
1. **DirectAdmin Optimization**: Configured to work seamlessly with the Passenger/Apache/Nginx reverse-proxy setup used in cPanel/DirectAdmin.
2. **Dual Database Adapter**: Runs on **MySQL/MariaDB** in production when environment variables are set, and falls back to a lightweight, zero-config local **`db.json`** for sandboxed preview/development.
3. **Self-Healing Schema**: Automatically checks and migrates the MySQL database schema (creates tables if they don't exist) upon initial boot, alongside providing an explicit `schema.sql` script.
4. **Single-Bundle High-Performance Compilation**: Bundles the entire backend TypeScript server into a streamlined `dist/server.cjs` via `esbuild`. This minimizes cold-start times and avoids Node's strict ES module relative path checks in custom hosting directories.

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Clone the Repository
Clone your GitHub repository into your DirectAdmin domain's private folder or a subdirectory (e.g., `/home/username/public_html` or `/home/username/nodeapp`):
```bash
git clone <repository_url> nodeapp
cd nodeapp
```

### Step 2: Install Node.js Dependencies
Run standard npm package installations to fetch frontend and backend modules:
```bash
npm install
```

### Step 3: Set Up MySQL Database in DirectAdmin
1. Log in to your **DirectAdmin Control Panel**.
2. Go to **MySQL Management** -> Click **Create New Database**.
3. Set your Database Name, Username, and secure Password. Keep these details handy.
4. (Optional) Select your new database, go to phpMyAdmin, and import the included **`schema.sql`** file. 
   *(Note: The application also automatically creates all required tables on its first startup, so manual SQL execution is fully optional!)*

### Step 4: Configure the Environment Variables (`.env`)
Create a file named `.env` in the root directory (copying `.env.example` as a template) and input your production parameters:
```env
# Gemini AI Configuration (if used)
GEMINI_API_KEY="your_api_key_here"
APP_URL="https://yourdomain.com"

# MySQL Database Details (provided by DirectAdmin)
DB_HOST="localhost"
DB_PORT=3306
DB_NAME="your_directadmin_database_name"
DB_USER="your_directadmin_database_user"
DB_PASSWORD="your_directadmin_database_password"

# DirectAdmin SMTP Email Account Details (used only for admin login OTPs)
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT=587
SMTP_USER="your-admin-mailbox@yourdomain.com"
SMTP_PASS="your_secure_mailbox_password"
SMTP_SECURE="false" # set to "true" if using Port 465 (SSL/TLS)

# Authorized Administrative Email Account
ADMIN_EMAIL="admin@yourdomain.com"
```

### Step 5: Compile & Build the Application
Compile the React frontend assets and package the Express backend into a production-optimized bundle:
```bash
npm run build
```
This script does two things:
1. Compiles your React frontend SPA code and drops static files in `dist/`.
2. Bundles the Express TypeScript backend into `dist/server.cjs`.

### Step 6: Configure DirectAdmin Node.js App Selector
DirectAdmin uses Phusion Passenger to serve Node.js apps. Configure your app in the DirectAdmin GUI:
1. Go to **Setup Node.js App** inside DirectAdmin.
2. Click **Create Application**.
3. Configure the following fields:
   - **Node.js version**: Select `18.x` or `20.x` or `22.x` (recommended).
   - **Application Mode**: Set to `production` (this tells the app to look inside the compiled `dist/` folder).
   - **Application Root**: `nodeapp` (or your chosen repository folder path).
   - **Application URL**: Select your domain and path (e.g., `https://yourdomain.com`).
   - **Application Startup File**: Set to **`dist/server.cjs`** (as compiled by the build command).
4. Under **Environment Variables**, you can also optionally configure `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `NODE_ENV=production` directly through the DirectAdmin UI instead of a `.env` file if desired.
5. Click **Save** and then **Start App**.

---

## 🏃 Production Scripts
Your `package.json` contains pre-configured scripts for all cycles of operations:
* `npm run build`: Compiles both frontend assets and packages the backend into `dist/server.cjs`.
* `npm start`: Runs the compiled backend using Node.js directly. Perfect for standalone VPS or traditional shell starts.

---

## 🛡️ Security & Optimization Best Practices
* **Database Security**: All queries utilize **parameterized statements** through `mysql2/promise` to prevent any possibility of SQL Injection.
* **Storage Optimization**: User measurement drawings are stored in `/public/uploads/` directory on the disk. Ensure this folder has write permissions in your DirectAdmin file manager (`chmod 755`).
* **Clean Fallbacks**: If MySQL ever loses connection, detailed logs are printed, and the server self-stabilizes to keep running.
