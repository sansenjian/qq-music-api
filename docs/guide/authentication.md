# 认证与登录

本页集中说明 [`QQ Music API`](../index.md) 中与登录态、Cookie 配置、扫码登录、用户相关接口调用有关的内容。

## 适用场景

以下场景建议先阅读本页：

- 需要调用依赖登录态的接口
- 需要配置本地 Cookie
- 需要使用扫码登录接口获取登录态
- 需要调试 [`/user/getUserPlaylists`](../api/user.md) 等用户相关能力

## Cookie 配置

如果你需要调用依赖登录态的接口，可以优先配置 [`config/user-info.ts`](../../config/user-info.ts) 中的用户信息。

### 推荐方式

直接在 [`config/user-info.ts`](../../config/user-info.ts) 中维护登录态信息，并在本地启动服务后进行验证。

### 配置后验证

启动服务：

```bash
npm install
npm run dev
```

调用一个公开接口确认服务正常：

```bash
curl "http://localhost:3200/getRanks"
```

再调用一个依赖用户信息的接口进行验证：

```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=你的QQ号"
```

## 扫码登录

项目提供扫码登录相关接口，适合本地调试或临时获取登录态。

### 获取登录二维码

**接口：** `GET /getQQLoginQr`

**兼容接口：** `GET /user/getQQLoginQr`

```bash
curl "http://localhost:3200/getQQLoginQr"
```

### 轮询扫码状态

**接口：** `POST /checkQQLoginQr`

**兼容接口：** `POST /user/checkQQLoginQr`

```bash
curl -X POST "http://localhost:3200/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"你的 qrsig","ptqrtoken":"你的 ptqrtoken"}'
```

## 用户接口调试建议

如果你要调试用户相关能力，建议按下面顺序排查：

1. 先确认服务是否正常启动
2. 再确认 [`config/user-info.ts`](../../config/user-info.ts) 中登录态是否有效
3. 再调用 [`/user/getUserPlaylists`](../api/user.md) 或 [`/user/getUserAvatar`](../api/user.md)
4. 如果接口依赖登录态但返回异常，优先检查 Cookie 是否过期

## 常见问题

### 为什么公开接口可用，但用户接口失败？

通常说明服务本身正常，但本地 Cookie 已失效，或当前请求需要登录态。

### 扫码登录和 Cookie 配置怎么选？

根据场景选择：

- 本地长期调试：优先使用 [`config/user-info.ts`](../../config/user-info.ts)
- 临时获取登录态：优先使用扫码登录接口

### 用户歌单接口怎么验证？

直接调用：

```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=你的QQ号"
```

如果返回异常，优先检查：

- Cookie 是否过期
- `uin` 是否正确
- 当前账号是否有可见歌单

## 相关文档

- [安装指南](/guide/installation)
- [快速开始](/guide/quickstart)
- [用户接口](/api/user)
- [其他接口](/api/other)
