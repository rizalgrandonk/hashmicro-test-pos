import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts"],
  format: ["esm"],
  outDir: "dist",
  target: "es2020",
  clean: true,
  sourcemap: false,
  dts: false,
  async onSuccess() {
    const { cp } = await import("node:fs/promises");
    await Promise.all([
      cp("src/views", "dist/views", { recursive: true }),
      cp("src/public", "dist/public", { recursive: true }),
    ]);
  },
});
