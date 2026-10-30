import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // Only used by `npm run dev:proxy` (VITE_API_BASE=/api): the browser asks
    // localhost:5173/api/... (same origin) and Vite forwards it to :3000.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
