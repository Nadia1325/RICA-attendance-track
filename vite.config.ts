import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { env } from "process";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: env.VITE_DEV_API_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
