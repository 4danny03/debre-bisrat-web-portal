import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { tempo } from "tempo-devtools/dist/vite";

// Polyfill __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tempo()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configure base path for GitHub Pages deployment
  base: "/",
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    // allowedHosts: process.env.TEMPO === "true" ? true : undefined, // removed for static hosting
  },
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "@supabase/supabase-js",
          ],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-toast",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
}));
