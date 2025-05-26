import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite"; // Add this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tempo(), // Add the tempo plugin
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
