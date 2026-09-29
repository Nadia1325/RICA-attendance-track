import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: {
      // In development /api/* is forwarded to the Flask backend, so no CORS setup is needed.
      proxy: { "/api": { target: env.VITE_DEV_API_TARGET || "http://localhost:5000", changeOrigin: true } },
    },
  };
});
