import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// Use node adapter for development, cloudflare for production
const adapter = process.env.NODE_ENV === 'production' 
  ? (await import("@astrojs/cloudflare")).default({ mode: "advanced" })
  : (await import("@astrojs/node")).default({ mode: "development" });

export default defineConfig({
  site: "https://vobels.com.ng",
  output: "server",
  adapter,
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["astro-icon", "astro-navbar"],
    },
  },
});
