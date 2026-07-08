import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev server on :5173; the Spring Boot API runs on :8080 (see src/api.js).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
