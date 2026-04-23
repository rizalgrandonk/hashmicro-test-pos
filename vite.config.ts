import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: "src/public/css",
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(process.cwd(), "src/assets/main.css"),
      output: {
        assetFileNames: "style.css",
      },
    },
    watch: {
      exclude: ["src/public/**"],
    },
  },
});
