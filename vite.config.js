import { resolve, dirname } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: "src/",

  server: {
    proxy: {
      "/api": {
        target: "https://catfact-project.onrender.com/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        "explore-cats": resolve(__dirname, "src/explore-cats/explore-cat.html"),
        breeds: resolve(__dirname, "src/breeds/breeds.html"),
        favorites: resolve(__dirname,"src/favorite/favorite.html"),
      },
    },
  },
});
