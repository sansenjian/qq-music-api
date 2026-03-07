import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'QQ Music API',
  description: 'QQ 音乐 API 接口文档',
  base: '/qq-music-api/',
  outDir: '../docs-dist',
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#12b7f5' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide/' },
      { text: 'API 文档', link: '/api/' },
      { text: '用户能力', link: '/api/user' },
      { text: '架构说明', link: '/guide/architecture' },
    ],

    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '首页', link: '/' },
          { text: '使用指南', link: '/guide/' },
          { text: '安装指南', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quickstart' },
        ],
      },
      {
        text: '认证与用户',
        items: [
          { text: '认证与登录', link: '/guide/authentication' },
          { text: '用户接口', link: '/api/user' },
        ],
      },
      {
        text: 'API 文档',
        items: [
          { text: 'API 总览', link: '/api/' },
          { text: '音乐相关', link: '/api/music' },
          { text: '歌手相关', link: '/api/singer' },
          { text: '歌单相关', link: '/api/playlist' },
          { text: '排行榜', link: '/api/rank' },
          { text: '搜索', link: '/api/search' },
          { text: '评论', link: '/api/comments' },
          { text: '其他接口', link: '/api/other' },
        ],
      },
      {
        text: '开发与维护',
        items: [
          { text: '响应格式', link: '/reference/response-format' },
          { text: '代码架构', link: '/guide/architecture' },
        ],
      },
    ],

    aside: true,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sansenjian/qq-music-api' },
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2020-present Sansenjian',
    },

    editLink: {
      pattern: 'https://github.com/sansenjian/qq-music-api/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },
  },

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },
})

