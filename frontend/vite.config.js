import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import prerenderer from "@prerenderer/rollup-plugin";

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  let prerenderRoutes = ["/", "/about", "/projects", "/blogs", "/certificates", "/artworks", "/photos", "/contacts"];

  // Fetch dynamic routes from backend ONLY during build time
  if (command === "build") {
    try {
      // Mengambil rute dari API Sitemap yang baru kita buat
      const res = await fetch("https://qbdian-api.onrender.com/api/prerender-routes");
      if (res.ok) {
        const dynamicRoutes = await res.json();
        // Gabungkan tanpa duplikat
        prerenderRoutes = [...new Set([...prerenderRoutes, ...dynamicRoutes])];
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic routes for prerendering. Falling back to static routes.", e.message);
    }
  }

  return {
    plugins: [
      vue(),
      tailwindcss(),
      // Prerenderer dijalankan untuk mengubah SPA menjadi HTML statis saat di-build (SSG)
      prerenderer({
        routes: prerenderRoutes,
        renderer: "@prerenderer/renderer-puppeteer",
        server: {
          port: 5173,
          host: "127.0.0.1"
        },
      }),
    ],
  };
});
