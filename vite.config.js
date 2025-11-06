import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  base: "./",
  build: {
    outDir: "dist",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        index: "index.html",
      },
      output: {
        entryFileNames: "assets/js/script-[hash].js",
        chunkFileNames: "assets/js/chunk-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? "";
          if (name.endsWith(".css")) {
            return "assets/css/style-[hash][extname]";
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
            return "assets/img/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
