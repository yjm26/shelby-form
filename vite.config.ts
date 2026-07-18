import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        buat: resolve(__dirname, "pages/buat.html"),
        form: resolve(__dirname, "pages/form.html"),
        dasbor: resolve(__dirname, "pages/dasbor.html"),
      },
    },
  },
});
