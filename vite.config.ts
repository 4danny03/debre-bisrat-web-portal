
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
  // Exclude supabase functions from being processed by esbuild and TypeScript
  esbuild: {
    exclude: [
      "**/supabase/functions/**",
      "supabase/functions/**"
    ],
    // Ignore TypeScript errors in supabase functions
    ignoreAnnotations: true,
  },
}));
