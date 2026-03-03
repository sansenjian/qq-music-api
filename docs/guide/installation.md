# 安装指南

本指南将帮助你快速安装和部署 QQ Music API。

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐使用 pnpm)

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/sansenjian/qq-music-api.git
cd qq-music-api
```

### 2. 安装依赖

使用 pnpm（推荐）：

```bash
pnpm install
```

或使用 npm：

```bash
npm install
```

### 3. 配置用户信息（可选）

如果需要登录相关功能，可以配置用户信息：

```bash
cp config/user-info.js.example config/user-info.js
```

然后编辑 `config/user-info.js` 文件，填入你的 QQ 音乐 cookie。

## 启动项目

### 开发模式

```bash
npm run start
```

服务将在 `http://localhost:3200` 启动。

### 生产模式

```bash
npm start
```

## Docker 部署

```bash
# 构建镜像
docker build -t qq-music-api .

# 运行容器
docker run -d -p 3200:3200 qq-music-api
```

## 验证安装

启动后，访问 `http://localhost:3200` 查看 API 是否正常运行。

测试接口：

```bash
curl http://localhost:3200/getRanks
```

## 下一步

- [快速开始](/guide/quickstart) - 了解如何使用 API
- [API 文档](/api/music) - 查看完整的 API 接口
