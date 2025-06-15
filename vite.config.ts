import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tempo(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configure base path for GitHub Pages deployment
  base: mode === "production" ? "/debre-bisrat-web-portal/" : "/",
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      external: [
        // Exclude all supabase functions from the build
        /^supabase\/functions/,
      ],
    },
  },
  // Define globals for compatibility
  define: {
    global: "globalThis",
  },
  // Exclude supabase functions from optimization
  optimizeDeps: {
    exclude: ["supabase/functions"],
  },
  // Exclude supabase functions from being processed
  esbuild: {
    exclude: ["supabase/functions/**/*"],
  },
}));
