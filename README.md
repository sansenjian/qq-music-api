<h1 align="center">QQ Music API</h1>

<div align="center">

<img src='music.png' />

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

## 项目概览

- 运行时：Node.js 20+
- 服务框架：Koa 2
- 开发语言：TypeScript
- 路由系统：[@koa/router](package.json:53)
- 文档系统：[`VitePress`](package.json:100)
- 测试框架：[`Jest`](package.json:89)
- 默认端口：`3200`

## API 结构图

> 当前版本已包含扫码登录相关接口，并已完成 TypeScript 迁移。

![qq-music](./screenshot/qq-music.png)

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

在项目中使用：

```javascript
const { spawn } = require('child_process');
const path = require('path');

const qqMusicPath = path.join(__dirname, 'node_modules', '@sansenjian/qq-music-api', 'app.js');

spawn('node', [qqMusicPath], {
	env: { ...process.env, PORT: '3200' },
	stdio: 'inherit',
});
```

## 项目启动

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 生产运行
npm run start

# 运行测试
npm run test

# 启动文档站点
npm run docs:dev
```

项目默认监听端口为 `3200`。

## 依赖版本说明（同步 [`package.json`](package.json:1)）

### 生产依赖

| 依赖                    | 当前版本  |
| ----------------------- | --------- |
| `@koa/router`           | `^15.3.1` |
| `axios`                 | `^1.13.6` |
| `date-fns`              | `^4.1.0`  |
| `is-generator-function` | `1.0.10`  |
| `koa`                   | `^2.16.1` |
| `koa-bodyparser`        | `^4.4.1`  |
| `koa-static`            | `^5.0.0`  |
| `reflect-metadata`      | `^0.2.2`  |

### 开发依赖

| 依赖                                         | 当前版本  |
| -------------------------------------------- | --------- |
| `@babel/core`                                | `^7.23.0` |
| `@babel/plugin-transform-async-to-generator` | `^7.23.0` |
| `@babel/preset-env`                          | `^7.29.0` |
| `@babel/preset-typescript`                   | `^7.28.5` |
| `@babel/register`                            | `^7.23.0` |
| `@commitlint/cli`                            | `^18.0.0` |
| `@commitlint/config-conventional`            | `^18.0.0` |
| `@types/jest`                                | `^30.0.0` |
| `@types/koa`                                 | `^3.0.1`  |
| `@types/koa__router`                         | `^12.0.5` |
| `@types/koa-bodyparser`                      | `^4.3.13` |
| `@types/node`                                | `^25.3.3` |
| `@types/supertest`                           | `^7.2.0`  |
| `chalk`                                      | `^4.1.0`  |
| `conventional-changelog-cli`                 | `^4.0.0`  |
| `eslint`                                     | `^8.57.0` |
| `eslint-config-standard`                     | `^17.0.0` |
| `eslint-plugin-import`                       | `^2.29.0` |
| `eslint-plugin-n`                            | `^16.0.0` |
| `eslint-plugin-promise`                      | `^6.0.0`  |
| `husky`                                      | `^9.0.0`  |
| `jest`                                       | `^30.2.0` |
| `lint-staged`                                | `^15.0.0` |
| `nodemon`                                    | `^3.1.14` |
| `prettier`                                   | `^3.8.1`  |
| `rimraf`                                     | `^6.1.3`  |
| `sinon`                                      | `^21.0.1` |
| `supertest`                                  | `^7.2.2`  |
| `ts-jest`                                    | `^29.4.6` |
| `ts-node`                                    | `^10.9.2` |
| `tsx`                                        | `^4.21.0` |
| `typescript`                                 | `5.7.3`   |
| `vitepress`                                  | `^1.6.4`  |
| `vue`                                        | `^3.5.29` |

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

## 文档入口

- 用户接口说明：[`docs/api/user.md`](docs/api/user.md)
- 其他接口说明：[`docs/api/other.md`](docs/api/other.md)
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
