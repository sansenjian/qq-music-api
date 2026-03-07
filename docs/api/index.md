---
layout: doc
title: API 文档
---

# API 文档

本章节提供完整的 API 接口文档，包含所有可用接口的说明、参数与调用示例。

## 推荐阅读路径

- 新用户入口：[使用指南](/guide/)
- 登录态相关：[认证与登录](/guide/authentication)
- 用户能力入口：[用户接口](/api/user)
- 响应结构说明：[响应格式](/reference/response-format)

## 接口列表

- **[音乐相关](/api/music)** - 获取歌曲播放链接、歌词、专辑信息等
- **[歌手相关](/api/singer)** - 歌手列表、歌手详情、热门歌曲、MV 等
- **[歌单相关](/api/playlist)** - 歌单分类、歌单详情、新歌专辑等
- **[排行榜](/api/rank)** - 各种音乐排行榜、榜单详情
- **[搜索](/api/search)** - 歌曲、歌手、专辑、歌单搜索
- **[评论](/api/comments)** - 获取歌曲、专辑等评论数据
- **[用户接口](/api/user)** - 用户歌单、用户头像、扫码登录等能力
- **[其他接口](/api/other)** - MV、图片、数字专辑、电台、推荐、票务等接口

## 使用说明

所有接口均支持 `GET` 请求，部分接口支持 `POST` 请求。具体请求方式请参考各接口文档。

### 基础 URL

```text
http://localhost:3200
```

### 请求示例

```bash
curl "http://localhost:3200/getRanks"
```
