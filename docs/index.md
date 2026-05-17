---
# https://vitepress.dev/reference/frontmatter
layout: home
hero:
  name: QQ Music API
  text: QQ 音乐 API 接口文档
  tagline: 基于 Koa 2 与 TypeScript 的 QQ 音乐 API 服务
  image:
    src: /logo.svg
    alt: QQ Music API
  actions:
    - theme: brand
      text: 安装与启动
      link: /guide/installation
    - theme: alt
      text: API 总览
      link: /api/
    - theme: alt
      text: 用户能力
      link: /api/user

features:
  - title: 音乐播放
    icon: 🎵
    details: 获取歌曲播放链接、歌词、专辑信息、图片与下载地址
    link: /api/music
    linkText: 查看音乐接口
  - title: 歌手信息
    icon: 🎤
    details: 提供歌手详情、热门歌曲、专辑、MV、相似歌手等接口
    link: /api/singer
    linkText: 查看歌手接口
  - title: 歌单与榜单
    icon: 📀
    details: 支持歌单分类、歌单详情、排行榜、推荐内容等能力
    link: /api/playlist
    linkText: 查看歌单与榜单
  - title: 搜索能力
    icon: 🔍
    details: 支持热词、联想搜索、关键词搜索等常用场景
    link: /api/search
    linkText: 查看搜索接口
  - title: 用户能力
    icon: 👤
    details: 提供用户歌单、用户头像、扫码登录与登录态相关能力
    link: /api/user
    linkText: 查看用户接口
  - title: 工程化
    icon: 🛠️
    details: 已完成 TypeScript 迁移，内置 Jest 测试与 VitePress 文档站点
    link: /guide/architecture
    linkText: 查看项目架构
---
