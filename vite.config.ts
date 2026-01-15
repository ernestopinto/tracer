import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "Tracer",
      fileName: (format) => `tracer.${format}.js`,
    },
    rollupOptions: {
      // don't bundle vue into your library
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
