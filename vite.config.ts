// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { tempo } from "tempo-devtools/dist/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react(), tempo()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ✅ Use root for GitHub Pages with custom domain
  base: "/",
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
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
