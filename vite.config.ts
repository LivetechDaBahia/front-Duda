import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      https: true,
      allowedHosts: ["localhost", "127.0.0.1", "dudadev.intranet.wdcnet"],
      proxy: {
        // Proxy API requests to the backend in development to ensure first-party cookies
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          // Ensure cookies set by the backend are usable on the front-end origin
          // http-proxy options: rewrite cookie Domain/Path to current origin
          cookieDomainRewrite: { "*": "" },
          cookiePathRewrite: { "*": "/" },
          // Remove the /api prefix when forwarding to the backend
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [
      react(),
      // Enable self-signed HTTPS in development so Secure cookies work
      mode === "development" && basicSsl(),
      mode === "development" && componentTagger(),
    ].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
