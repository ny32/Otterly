import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure output directory is cleaned before build
    emptyOutDir: true,
    // Configure the output directory (default is 'dist')
    outDir: "dist",
  },
});
