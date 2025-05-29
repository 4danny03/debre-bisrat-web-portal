import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { tempo } from "tempo-devtools/dist/vite";

// Get the repository name for GitHub Pages deployment
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const base =
  process.env.NODE_ENV === "production" && repoName ? `/${repoName}/` : "/";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  // Base path for GitHub Pages deployment
  base,
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
