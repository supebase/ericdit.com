import buildTime from './build-time.json'; // 导入构建时间
import { VersionManager } from './scripts/versionManager'; // 导入版本管理器

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

  hooks: {
    'build:before': () => {
      const vm = new VersionManager()
      
      // 通过环境变量控制版本升级类型
      const bumpType = process.env.VERSION_BUMP_TYPE as 'major' | 'minor' | 'patch' | undefined
      if (bumpType) {
        vm.bumpVersion(bumpType)
      } else {
        // 默认每次构建自动升级 patch 版本
        vm.bumpVersion('patch')
      }
      
      vm.generateVersionFile()
    }
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