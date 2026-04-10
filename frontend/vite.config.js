import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // proxy API calls during dev so you don't hit CORS issues from the browser
    proxy: {
      "/analyse": "http://localhost:8000",
    },
  },
});
