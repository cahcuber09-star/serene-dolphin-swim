import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 32100, // Samakan dengan port yang Anda gunakan di tunnel
    allowedHosts: [
      "kemecer.dpdns.org" // Tambahkan ini agar tidak diblokir
    ],
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));