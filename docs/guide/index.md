---
layout: doc
title: 使用指南
---

# 使用指南

本章节提供项目安装、启动、调用与架构说明，帮助你快速上手 [`QQ Music API`](../index.md)。

## 快速入口

- **[安装指南](/guide/installation)**：环境要求、依赖安装、启动方式
- **[快速开始](/guide/quickstart)**：常用接口调用示例
- **[快速使用指南](/QUICK_START)**：本地服务启动后的接口测试与 Cookie 获取说明
- **[降级服务示例](/DEGRADE_EXAMPLES)**：手动传递 Cookie、Header 调用和多语言示例
- **[配置规范](/guide/configuration-policy)**：配置目录、写入时机和环境变量边界
- **[依赖分析](/guide/dependency-inspection)**：使用依赖分析工具观察依赖体积与优化空间
- **[MCP 与 CLI 拓展思考](/guide/mcp-cli-extension)**：未来命令行与 MCP Server 的职责划分
- **[代码架构](/guide/architecture)**：项目分层与 TypeScript 抽象说明

## 推荐阅读顺序

1. [安装指南](/guide/installation)
2. [快速开始](/guide/quickstart)
3. [API 文档](/api/music)
4. [代码架构](/guide/architecture)

## 你可以在这里找到什么

### 安装与部署

- [安装指南](/guide/installation) - Node.js 20+ 环境要求、安装与运行方式
- [Docker 部署](/guide/installation#docker-部署) - 使用 Docker 运行服务

### 使用与调试

- [快速开始](/guide/quickstart) - 常见请求示例与调试建议
- [快速使用指南](/QUICK_START) - 本地服务状态、常用接口与 Cookie 更新说明
- [降级服务示例](/DEGRADE_EXAMPLES) - 降级模式下的 Query/Header Cookie 调用示例
- [其他接口](/api/other) - 扫码登录、电台、图片、下载等接口说明

### 开发与维护

- [配置规范](/guide/configuration-policy) - 配置文件、环境变量和写入副作用边界
- [依赖分析](/guide/dependency-inspection) - 依赖体积、依赖树和优化线索检查
- [MCP 与 CLI 拓展思考](/guide/mcp-cli-extension) - 后续工具化方向与风险边界
- [代码架构](/guide/architecture) - 当前目录结构、抽象方式与重构结果

## 项目特性概览

- 基于 `Koa 2` 与 `TypeScript`
- 默认端口 `3200`
- 支持音乐、歌手、歌单、排行、搜索、评论等能力
- 已提供 QQ 扫码登录二维码获取与登录状态轮询接口
- 提供 [Vitest 测试配置](https://github.com/sansenjian/qq-music-api/blob/main/vitest.config.ts) 与 [`VitePress 2`](../index.md) 文档站点

详细接口请查看 [API 文档](/api/)。
