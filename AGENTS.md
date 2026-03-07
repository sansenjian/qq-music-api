# AGENTS.md

## 项目概览

这是一个基于 Koa 的 QQ 音乐 API 服务项目，当前代码库已完成从 JavaScript 到 TypeScript 的迁移。

- 运行时：Node.js 20+
- 开发语言：TypeScript
- Web 框架：Koa 2
- 路由系统：@koa/router
- 文档系统：VitePress
- 测试框架：Jest

## 启动与构建

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

默认启动入口为 `app.ts`，默认端口为 `3200`。

### 生产构建

```bash
npm run build
```

### 生产运行

```bash
npm run start
```

## 常用命令

```bash
npm run dev            # 本地开发
npm run build          # TypeScript 编译
npm run start          # 运行 dist/app.js
npm run test           # 运行测试
npm run test:watch     # 测试监听模式
npm run test:coverage  # 测试覆盖率
npm run docs:dev       # 启动文档站点
npm run docs:build     # 构建文档
npm run eslint         # 执行 ESLint 自动修复
npm run prettier       # 执行 Prettier 格式化
```

## 目录结构

```text
app.ts                 应用启动入口
index.ts               包导出入口
module/                API 请求封装层
routers/               HTTP 控制器与路由注册
middlewares/           Koa 中间件
util/                  通用工具函数
config/                运行时配置
types/                 全局类型与公共类型定义
docs/                  VitePress 文档站点
tests/                 单元测试与集成测试
public/                静态资源
scripts/               辅助脚本
```

## 分层说明

### module/

负责直接请求 QQ 音乐相关接口，通常只处理：

- 请求参数拼装
- 调用上游接口
- 基础数据格式转换
- 返回统一响应结构

### routers/context/

负责 HTTP 层控制器逻辑，通常只处理：

- 读取 `ctx.query` 或 `ctx.request.body`
- 参数校验
- 调用 `module/` 中对应能力
- 设置 `ctx.body` 与 `ctx.status`

### routers/router.ts

负责统一注册所有路由。

### util/

放置跨模块复用的通用逻辑，例如响应包装、颜色输出等。

## 编码约定

1. 新增功能时，优先保持现有目录分层，不要把路由逻辑和接口请求逻辑混写。
2. 新增接口时，通常需要同时补充：
   - `module/apis/...` 中的接口实现
   - `routers/context/...` 中的控制器
   - `routers/context/index.ts` 或相关导出
   - `routers/router.ts` 中的路由注册
   - 必要时补充文档与测试
3. 统一使用 TypeScript，避免继续引入新的 `.js` 业务文件。
4. 尽量复用已有类型定义，公共类型优先放到 `types/`。
5. 保持返回结构一致，优先复用已有响应工具。
6. 修改全局配置或 Cookie 相关逻辑时，注意兼容扫码登录相关接口。

## 测试与验证

提交前建议至少执行：

```bash
npm run build
npm run test
```

如果修改了文档，再执行：

```bash
npm run docs:build
```

如果修改了格式或风格敏感文件，再执行：

```bash
npm run eslint
npm run prettier
```

## 关键注意事项

1. 项目默认端口为 `3200`。
2. 生产启动依赖 `dist/` 目录，因此发布前必须先执行构建。
3. 当前仓库包含扫码登录相关接口实现，不要在未理解流程前随意调整登录状态字段。
4. 文档内容位于 `docs/`，接口能力变更时要同步更新文档。
5. 现有测试以 Jest 为主，新增行为建议补充对应测试。

## 建议的开发流程

1. 阅读相关模块现有实现。
2. 在 `module/` 增加或调整接口能力。
3. 在 `routers/context/` 接入 HTTP 控制器。
4. 在路由层完成注册。
5. 补充类型、测试与文档。
6. 执行构建和测试，确认无误后再提交。
