import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://vobels.com.ng",
  output: "server",
  adapter: node({
    mode: "development",
  }),
  integrations: [mdx(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["astro-icon", "astro-navbar"],
    },
  },
});
