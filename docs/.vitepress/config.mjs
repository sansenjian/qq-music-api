import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'QQ Music API',
  description: 'QQ 音乐 API 接口文档',
  lastUpdated: true,
  
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: 'API 文档', link: '/api/' },
      { text: '使用指南', link: '/guide/' },
    ],

    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '介绍', link: '/' },
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quickstart' },
        ],
      },
      {
        text: 'API 接口',
        items: [
          { text: '音乐相关', link: '/api/music' },
          { text: '歌手相关', link: '/api/singer' },
          { text: '歌单相关', link: '/api/playlist' },
          { text: '排行榜', link: '/api/rank' },
          { text: '搜索', link: '/api/search' },
          { text: '评论', link: '/api/comments' },
          { text: '其他接口', link: '/api/other' },
        ],
      },
    ],

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
