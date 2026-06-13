// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                exploreCats: 'src/explore-cat/explore-cat.html',
                // add any other pages here
            }
        }
    }
});