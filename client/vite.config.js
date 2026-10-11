import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const t = "http://localhost:5000";
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": t, "/socket.io": { target: t, ws: true } } },
});
