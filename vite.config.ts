import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/instagram": {
        target: "https://instagram-looter2.p.rapidapi.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/instagram/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader(
              "x-rapidapi-key",
              "4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc",
            );
            proxyReq.setHeader(
              "x-rapidapi-host",
              "instagram-looter2.p.rapidapi.com",
            );
          });
        },
      },
      "/proxy/instagram-image": {
        target: "https://instagram.fbcn2-1.fna.fbcdn.net",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/instagram-image/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Set headers to mimic a real browser request from Instagram
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            );
            proxyReq.setHeader("Referer", "https://www.instagram.com/");
            proxyReq.setHeader("Origin", "https://www.instagram.com");
            proxyReq.setHeader(
              "Accept",
              "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            );
            proxyReq.setHeader("Accept-Language", "en-US,en;q=0.9");
            proxyReq.setHeader("Cache-Control", "no-cache");
            proxyReq.setHeader("Pragma", "no-cache");
            proxyReq.setHeader("Sec-Fetch-Dest", "image");
            proxyReq.setHeader("Sec-Fetch-Mode", "no-cors");
            proxyReq.setHeader("Sec-Fetch-Site", "same-site");
          });

          proxy.on("proxyRes", (proxyRes, req, res) => {
            // Add CORS headers to allow browser access
            proxyRes.headers["Access-Control-Allow-Origin"] = "*";
            proxyRes.headers["Access-Control-Allow-Methods"] =
              "GET, POST, PUT, DELETE, OPTIONS";
            proxyRes.headers["Access-Control-Allow-Headers"] =
              "Content-Type, Authorization";
          });
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
