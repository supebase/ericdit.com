import buildTime from './build-time.json'; // 导入构建时间

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@vueuse/nuxt", "@nuxt/ui", "@pinia/nuxt", "nuxt-emoji-picker"],

  experimental: {
    appManifest: false,
    payloadExtraction: false,
  },

  runtimeConfig: {
    public: {
      version: process.env.NUXT_PUBLIC_VERSION || '0.0.0',
      buildTime: buildTime.buildTime, // 注入构建时间
    },
    githubToken: process.env.GITHUB_TOKEN
  },

  app: {
    keepalive: true,
    head: {
      viewport: "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover",
      bodyAttrs: {
        class: "overflow-x-hidden",
      },
      link: [
        { rel: 'preload', href: '/fonts/Janelotus.woff', as: 'font', type: 'font/woff', crossorigin: 'anonymous' },
      ],
    },
    buildAssetsDir: "static",
  },

  routeRules: {
    "/": { prerender: true },
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  css: ["~/assets/css/app.css", "~/assets/css/main.css"],

  colorMode: {
    preference: "dark",
    classSuffix: "",
  },
});