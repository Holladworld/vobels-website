import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://vobels.com.ng",
  output: "server",
  adapter: cloudflare({
    mode: "advanced",
  }),
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["astro-icon", "astro-icon/components"]
    },
    ssr: {
      noExternal: ["astro-icon", "astro-navbar"],
    },
  },
  // ✅ Redirects for clean URLs
  redirects: {
    '/flipbook': '/flipbook/index.html',
    '/flipbook/upload': '/flipbook/upload.html',
    '/flipbook/view': '/flipbook/view.html',
    '/flipbook/pricing': '/flipbook/pricing.html',
  }
});