import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import vercel from "@astrojs/vercel/serverless";

import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [react({
    experimentalReactChildren: true,
  }), tailwind()],

  output: "server",
  adapter: vercel(),
});