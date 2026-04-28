import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/progress-knight-entropy/pk-reality-break/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
