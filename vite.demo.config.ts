import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    base: "/tracer/",
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
