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
        target: "https://scontent.cdninstagram.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/instagram-image/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            proxyReq.setHeader(
              "User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            );
            proxyReq.setHeader("Referer", "https://www.instagram.com/");
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
