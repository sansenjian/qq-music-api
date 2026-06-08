<h1 align="center">QQ Music API</h1>

<div align="center">

![GitHub watchers](https://img.shields.io/github/watchers/sansenjian/qq-music-api?style=social) ![GitHub stars](https://img.shields.io/github/stars/sansenjian/qq-music-api?style=social) ![GitHub forks](https://img.shields.io/github/forks/sansenjian/qq-music-api?style=social)
<br />
![node](https://img.shields.io/badge/node-%3E%3D20.0.0-green?style=flat-square)
<br />
![GitHub repo size](https://img.shields.io/github/repo-size/sansenjian/qq-music-api?style=flat-square) ![GitHub package.json version](https://img.shields.io/github/package-json/v/sansenjian/qq-music-api?style=flat-square) ![GitHub](https://img.shields.io/github/license/sansenjian/qq-music-api?style=flat-square) ![GitHub open issues](https://img.shields.io/github/issues/sansenjian/qq-music-api?style=flat-square) ![GitHub closed issues](https://img.shields.io/github/issues-closed/sansenjian/qq-music-api) ![GitHub last commit](https://img.shields.io/github/last-commit/sansenjian/qq-music-api?style=flat-square) ![GitHub top language](https://img.shields.io/github/languages/top/sansenjian/qq-music-api?style=flat-square)
<br />
[![Codecov](https://img.shields.io/codecov/c/github/sansenjian/qq-music-api?style=flat-square&logo=codecov)](https://codecov.io/gh/sansenjian/qq-music-api)

</div>

> 🍴 本项目 Fork 自 [Rain120/qq-music-api](https://github.com/Rain120/qq-music-api)，原项目已停止维护，此版本持续更新中  
> 基于 Koa 2 与 TypeScript 的 QQ 音乐 API 服务，包含扫码登录、用户头像、MV 播放地址、批量接口等能力。  
> 当前代码仅供学习与研究使用，不可做商业用途。

> 从 `2.3.0` 开始，新版本会持续减少 npm 包安装时的依赖体积，推荐新项目和升级用户优先使用 `2.3` 及之后版本。

## 项目概览

- 运行时：Node.js 20+
- 服务框架：Koa 2
- 开发语言：TypeScript
- 路由系统：[@koa/router](package.json:53)
- 文档系统：[VitePress 2](https://vitepress.dev/)
- 测试框架：[`Vitest`](package.json:58)
- 默认端口：`3200`

## API 结构图

> 当前版本已包含扫码登录相关接口，并已完成 TypeScript 迁移。

📖 **详细 API 文档**： [查看完整 API 文档](https://sansenjian.github.io/qq-music-api/)

## 环境要求

本项目基于 `Koa 2 + TypeScript`，需要 Node.js 20.0.0+。

```bash
node -v
```

## 安装

### 方式一：克隆仓库

```bash
git clone git@github.com:sansenjian/qq-music-api.git
cd qq-music-api
npm install
```

### 方式二：NPM 安装

```bash
npm install @sansenjian/qq-music-api
```

NPM 包默认包含运行所需的 `dist/`、本地交互测试页 `public/`，以及已构建的文档站点 `docs-dist/`。如果你只想在自己的发布产物中保留 API 运行时，可以在你的项目打包配置中自行排除 `node_modules/@sansenjian/qq-music-api/docs-dist/` 或 `node_modules/@sansenjian/qq-music-api/public/`。

在项目中使用：

```javascript
const { spawn } = require('child_process');
const path = require('path');

const qqMusicPath = path.join(__dirname, 'node_modules', '@sansenjian/qq-music-api', 'dist', 'app.js');

spawn('node', [qqMusicPath], {
	env: { ...process.env, PORT: '3200' },
	stdio: 'inherit',
});
```

也可以直接在 Node.js 项目中函数式调用，不需要单独启动 HTTP 服务：

```javascript
import { search, getMusicPlay, getLyric } from '@sansenjian/qq-music-api/sdk';

const searchResult = await search({ key: '周杰伦', limit: 20 });
const playResult = await getMusicPlay({
	songmid: '003rJSwm3TechU',
	quality: '320',
	cookie: 'uin=o123456; qqmusic_key=your-key',
});
const lyricResult = await getLyric({
	songmid: '003rJSwm3TechU',
	isFormat: true,
});

console.log(searchResult, playResult, lyricResult);
```

## 项目启动

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 生产运行
npm run start

# 启动 MCP Server（仓库开发模式，独立 workspace 包）
npm run mcp

# 运行测试
npm run test

# 启动文档站点
npm run docs:dev
```

项目默认监听端口为 `3200`。

## 依赖版本说明（同步 [`package.json`](package.json:1)）

### 生产依赖

| 依赖          | 说明        |
| ------------- | ----------- |
| `@koa/router` | 路由        |
| `axios`       | HTTP 客户端 |
| `koa`         | Web 框架    |

MCP 能力单独发布在 `@sansenjian/qq-music-api-mcp`，普通 API 用户安装主包时不会安装 MCP SDK 相关依赖。

### 开发依赖

| 依赖                    | 说明                    |
| ----------------------- | ----------------------- |
| `oxlint`                | 代码检查（替换 ESLint） |
| `oxc-transform`         | Rust TypeScript 转译    |
| `typescript`            | 类型检查 + 声明生成     |
| `vite`                  | 打包工具（Rolldown）    |
| `vitest`                | 测试框架                |
| `tsx`                   | 开发热重载              |
| `prettier`              | 代码格式化              |
| `@commitlint/*`         | 提交规范                |
| `husky` + `lint-staged` | Git hooks               |
| `vitepress` + `vue`     | 文档站点                |
| `sinon`                 | 测试 mock               |
| `supertest`             | HTTP 测试               |

## 当前主要能力

### 音乐与播放

- 歌曲播放链接
- 歌曲与专辑图片
- 歌词与翻译歌词
- MV 播放信息

### 歌手与歌单

- 歌手热门歌曲、资料、相似歌手、关注数
- 歌手 MV 与歌手专辑
- 歌单分类、歌单列表、歌单详情
- 排行榜列表与详情

### 用户与登录

- 用户头像
- 用户歌单
- QQ 扫码登录
- Cookie / 登录态相关接口

### 其他能力

- 评论信息
- 数字专辑
- 电台列表
- 首页推荐
- 下载地址
- 票务信息

### MCP 与 CLI

- `@sansenjian/qq-music-api-mcp` 单独发布 MCP Server，避免普通 API 用户安装 MCP 依赖
- `qq-music-api-mcp` 可通过 stdio 启动 MCP Server
- `qq_music_search_songs`、`qq_music_get_top_lists`、`qq_music_get_playlist_detail` 等工具复用现有 service 层
- `qq_music_auth_status` 只返回登录态摘要和 Cookie key，不返回完整 Cookie 值

```bash
npm install @sansenjian/qq-music-api-mcp
qq-music-api-mcp
```

## 文档入口

- 用户接口说明：[`docs/api/user.md`](docs/api/user.md)
- 其他接口说明：[`docs/api/other.md`](docs/api/other.md)
- API 调试台：[`docs/api/playground.md`](docs/api/playground.md)
- 用户歌单测试说明：[`docs/TEST_USER_PLAYLISTS.md`](docs/TEST_USER_PLAYLISTS.md)
- 在线文档主页： [https://sansenjian.github.io/qq-music-api/](https://sansenjian.github.io/qq-music-api/)

## 关于项目

**灵感来源**

- [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [Vue2.0 开发企业级移动端音乐 Web App](https://coding.imooc.com/class/107.html)

**参考内容**

- [Koa 2](https://koa.bootcss.com/)
- [Axios](https://github.com/axios/axios)
- [阮一峰老师 - HTTP Referer 教程](http://www.ruanyifeng.com/blog/2019/06/http-referer.html)

## 当前限制

1. 部分用户能力仍依赖有效 Cookie。
2. 上游 QQ 音乐接口字段可能变更，个别接口需要持续跟踪。
3. 用户歌单接口仍在持续验证与调整中，详见 [`docs/TEST_USER_PLAYLISTS.md`](docs/TEST_USER_PLAYLISTS.md)。

## 贡献

We welcome all contributions. You can submit any ideas as [pull requests](https://github.com/sansenjian/qq-music-api/pulls) or as GitHub [issues](https://github.com/sansenjian/qq-music-api/issues).

## 维护者

- [GitHub](https://github.com/sansenjian)

## 原作者

本项目基于 [Rain120](https://github.com/Rain120) 的开源项目，感谢原作者的贡献。

- [GitHub](https://github.com/Rain120)
- [知乎](https://www.zhihu.com/people/yan-yang-nian-hua-120/activities)
- [掘金](https://juejin.im/user/57c616496be3ff00584f54db)

## License

[MIT](https://github.com/sansenjian/qq-music-api/blob/master/LICENSE)

Copyright © 2019-present [Rain120](https://github.com/Rain120).  
Fork maintained by [sansenjian](https://github.com/sansenjian).
