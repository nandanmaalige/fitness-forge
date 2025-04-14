import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config(); // ✅ load .env

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Check your .env file.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
