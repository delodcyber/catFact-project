import { resolve, dirname } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plugin to copy partials into dist
function copyPartials() {
  return {
    name: "copy-partials",
    generateBundle() {
      const files = ["head.html", "header.html", "footer.html"];

      for (const file of files) {
        const filePath = resolve(__dirname, "src/public/partials", file);
        const content = fs.readFileSync(filePath, "utf-8");

        this.emitFile({
          type: "asset",
          fileName: `partials/${file}`,
          source: content,
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [copyPartials()],

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
        favorites: resolve(__dirname, "src/favorite/favorite.html")
      },
    },
  },
});