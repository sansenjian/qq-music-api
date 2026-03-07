# 安装指南

本指南将帮助你快速安装、启动并验证 [`QQ Music API`](../index.md)。

## 环境要求

- Node.js >= 20.0.0
- npm >= 9
- 操作系统：Windows、macOS、Linux 均可

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/sansenjian/qq-music-api.git
cd qq-music-api
```

### 2. 安装依赖

```bash
npm install
```

## 启动项目

### 开发模式

```bash
npm run dev
```

开发模式默认使用 [`app.ts`](../../app.ts) 作为入口，服务启动后默认监听 `http://localhost:3200`。

### 生产模式

先构建，再启动：

```bash
npm run build
npm run start
```

## 可选配置

### 配置 Cookie

如果你需要依赖登录态的接口能力，可以编辑 [`config/user-info.ts`](../../config/user-info.ts) 中的用户信息与 Cookie 配置。

### 扫码登录接口

项目当前已提供扫码登录相关接口：

- `GET /getQQLoginQr`
- `GET /user/getQQLoginQr`
- `POST /checkQQLoginQr`
- `POST /user/checkQQLoginQr`

## Docker 部署

```bash
# 构建镜像
docker build -t qq-music-api .

# 运行容器
docker run -d -p 3200:3200 qq-music-api
```

## 验证安装

启动后访问 `http://localhost:3200`，确认服务是否正常运行。

也可以直接调用一个公开接口进行验证：

```bash
curl "http://localhost:3200/getRanks"
```

## 下一步

- [快速开始](/guide/quickstart) - 查看常用请求示例
- [API 文档](/api/music) - 浏览完整接口文档
- [代码架构](/guide/architecture) - 了解当前项目分层与 TypeScript 抽象
