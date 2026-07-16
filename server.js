import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = path.join(__dirname, "dist", "server.cjs");

if (!fs.existsSync(target)) {
  console.log("=== DirectAdmin Deployment Helper ===");
  console.log("Production bundle (dist/server.cjs) not found.");
  console.log("Automatically triggering build process ('npm run build')...");
  
  try {
    // Run npm run build synchronously to ensure the app compiles before booting
    execSync("npm run build", {
      stdio: "inherit",
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: "production"
      }
    });
    console.log("Production build finished successfully!");
    console.log("=====================================");
  } catch (error) {
    console.error("=====================================");
    console.error("CRITICAL ERROR: Failed to compile the application!");
    console.error(error);
    console.error("=====================================");
    process.exit(1);
  }
}

// Dynamically import the compiled server file
console.log("Booting compiled production server from dist/server.cjs...");
await import("./dist/server.cjs");
