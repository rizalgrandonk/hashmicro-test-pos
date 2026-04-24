import { defineConfig } from "vite";
import path from "node:path";

const isWatch = process.argv.includes("--watch");

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
    watch: isWatch ? { exclude: ["src/public/**"] } : null,
  },
});
