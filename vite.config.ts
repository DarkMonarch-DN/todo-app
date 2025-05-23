// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // Корень проекта
  publicDir: "public", // Папка для статичных файлов (если есть)
  build: {
    outDir: "dist", // Куда складывать сборку
  },
  server: {
    port: 3000, // Порт разработки
    open: true, // Автооткрытие в браузере
  },
});
