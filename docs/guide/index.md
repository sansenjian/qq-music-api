---
layout: doc
title: 使用指南
---

# 使用指南

本章节提供项目安装、启动、调用与架构说明，帮助你快速上手 [`QQ Music API`](../index.md)。

## 快速入口

- **[安装指南](/guide/installation)**：环境要求、依赖安装、启动方式
- **[快速开始](/guide/quickstart)**：常用接口调用示例
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
- [其他接口](/api/other) - 扫码登录、电台、图片、下载等接口说明

### 开发与维护

- [代码架构](/guide/architecture) - 当前目录结构、抽象方式与重构结果

## 项目特性概览

- 基于 `Koa 2` 与 `TypeScript`
- 默认端口 `3200`
- 支持音乐、歌手、歌单、排行、搜索、评论等能力
- 已提供 QQ 扫码登录二维码获取与登录状态轮询接口
- 提供 [`Jest`](../../jest.config.js) 测试与 [`VitePress`](../index.md) 文档站点

详细接口请查看 [API 文档](/api/)。
