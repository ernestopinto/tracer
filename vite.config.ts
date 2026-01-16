import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,

    cssCodeSplit: false, // one css file

    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "Tracer",
      formats: ["es"],
      fileName: () => "index.js",
    },

    rollupOptions: {
      external: ["vue"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "style.css"; // ✅ dist/style.css
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
