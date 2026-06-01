---
layout: doc
title: MCP 与 CLI 拓展思考
---

# MCP 与 CLI 拓展思考

本文记录 QQ Music API 在 MCP 和 CLI 方向上的拓展思路。它不是当前功能承诺，而是后续设计和评审时的边界参考。

## 背景

项目当前主要能力是 Koa HTTP API 服务，同时 npm 包中存在 `bin` 入口，可用于启动服务。这个入口更接近“服务启动器”，还不是完整 CLI。

如果继续扩展，应避免把 HTTP 服务、命令行工具和 MCP Server 混在一个入口里。三者可以共享底层模块，但运行边界要清晰。

## 当前 CLI 状态

当前 `qq-music-api` 已经提供最小 CLI：

```bash
qq-music-api
qq-music-api serve
qq-music-api config path
qq-music-api config doctor
qq-music-api doctor
qq-music-api auth status
qq-music-api auth clear
```

说明：

- `qq-music-api` 无参数时仍保持旧行为，默认启动 HTTP 服务。
- `serve` 支持 `--port <port>` 和 `--json`。
- `config path`、`config doctor`、`doctor`、`auth status`、`auth clear` 支持 `--json`。
- `auth status` 不输出完整 Cookie，只输出登录态是否存在和 Cookie key 列表。
- MCP Server 尚未实现，仍属于后续扩展方向。

## 目标

后续拓展可以围绕三个方向推进：

- CLI：提供本地开发、配置检查、登录态管理、服务启动等命令。
- MCP Server：让支持 MCP 的客户端以工具方式调用音乐搜索、歌单、排行等能力。
- SDK/包入口：继续保持 `import` 使用时的低副作用和可组合性。

## 非目标

短期不建议做这些事：

- 不把 CLI 做成另一个 HTTP 框架。
- 不在 MCP 工具中直接暴露 Cookie 或登录态原文。
- 不让 MCP Server 默认写入用户配置。
- 不把所有 API 一次性搬成工具，优先选择稳定、低风险、高频能力。
- 不改变现有 HTTP 路由语义来适配 CLI/MCP。

## CLI 方向

### 建议命令结构

未来 CLI 可以采用如下结构：

```bash
qq-music-api serve
qq-music-api config doctor
qq-music-api config path
qq-music-api auth status
qq-music-api auth clear
qq-music-api mcp start
```

### 命令职责

| 命令 | 职责 |
| --- | --- |
| `serve` | 启动 Koa API 服务，默认监听 `PORT` 或 `3200`。 |
| `config path` | 输出当前实际配置目录，便于排查路径问题。 |
| `config doctor` | 检查配置目录是否可写、JSON 是否可解析、敏感文件是否存在。 |
| `auth status` | 显示是否存在登录态，不输出 Cookie。 |
| `auth clear` | 清除本地登录态。 |
| `mcp start` | 启动 MCP Server，供客户端连接。 |

### CLI 输出规范

CLI 应面向人类终端输出，但也需要可脚本化：

- 默认输出简短状态和下一步提示。
- 支持 `--json` 输出机器可读结果。
- 错误信息要说明原因和修复方式。
- 不输出完整 Cookie、二维码 token 或上游认证细节。

示例：

```bash
qq-music-api config doctor --json
```

```json
{
  "configDir": "/path/to/config",
  "writable": true,
  "serviceConfig": "ok",
  "userInfo": "missing"
}
```

## MCP 方向

### 工具边界

MCP 工具应优先覆盖无需敏感凭据或可安全降级的能力：

- 搜索歌曲。
- 获取排行榜。
- 获取歌单信息。
- 获取歌曲基础信息。
- 获取公开歌手信息。

依赖登录态的能力应明确标注，并避免把凭据传给模型上下文。

### 工具设计原则

- 每个工具只完成一个明确任务。
- 输入参数使用结构化 schema，不复用 HTTP query 字符串。
- 输出结果要比原始上游响应更稳定，避免暴露无关字段。
- 错误返回使用通用错误码和可读消息，不泄露内部异常。
- 工具实现复用 `src/services/` 层能力，不直接调用 Koa `ctx`。

示例工具草案：

```ts
{
  name: 'search_songs',
  description: 'Search QQ Music songs by keyword.',
  inputSchema: {
    keyword: 'string',
    page: 'number',
    limit: 'number'
  }
}
```

### MCP 运行模式

MCP Server 可以作为独立入口运行：

```bash
qq-music-api mcp start
```

也可以未来暴露独立 bin：

```bash
qq-music-api-mcp
```

是否拆分 bin 取决于安装体验和维护成本。早期可以先放在主 CLI 下，稳定后再考虑独立入口。

## 配置关系

CLI 和 MCP 都应遵守 [配置规范](/guide/configuration-policy)：

- 显式 `QQ_MUSIC_API_CONFIG_DIR` 优先。
- 不在普通 import 阶段写配置。
- 登录态文件不进入模型上下文。
- MCP 工具不返回 Cookie。

MCP Server 如果需要读取登录态，只能读取运行进程可访问的配置目录。客户端侧不应通过 prompt 或工具参数传入完整 Cookie，除非该能力被明确设计为一次性请求级覆盖。

## 推荐实现顺序

1. 先抽出配置解析和写入模块，消除 import 阶段写盘副作用。
2. 增加 `serve`、`config path`、`config doctor` 三个最小 CLI 命令。
3. 将当前 bin 从“直接启动服务”过渡到 `serve` 默认命令，保持兼容。
4. 为公开 API 能力设计第一批 MCP 工具。
5. 增加 MCP 工具测试，覆盖 schema、成功响应和错误响应。
6. 再评估是否支持登录态相关 MCP 工具。

## 风险与约束

| 风险 | 说明 | 缓解 |
| --- | --- | --- |
| 凭据泄露 | Cookie 被日志、工具输出或模型上下文暴露。 | 输出脱敏，禁止 MCP 返回凭据。 |
| 入口混乱 | HTTP、CLI、MCP 共用入口导致行为难预测。 | 入口分离，底层能力复用。 |
| 配置漂移 | 不同 cwd 产生不同配置目录。 | 使用配置规范中的目录解析规则。 |
| API 不稳定 | 直接把上游响应暴露给工具使用者。 | 为工具设计稳定输出结构。 |
| 维护成本过高 | 一次性覆盖所有 HTTP 路由。 | 从高频公开能力开始。 |

## 开放问题

- CLI 是否引入命令解析库，还是先用轻量原生命令解析。
- MCP Server 是否作为主包能力发布，还是拆成独立包。
- 登录态相关 MCP 工具是否默认禁用。
- 是否需要为配置目录提供跨平台默认路径。
- 是否为所有工具提供 HTTP 路由到 MCP 工具的映射表。

这些问题应在实现前通过 issue 或设计 PR 明确。
