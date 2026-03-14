# 🎵 QQ Music API - 快速使用指南

## ✅ 服务已启动

**服务地址**: http://localhost:3200

**当前配置**:
- ✅ 降级模式：已启用
- ✅ 全局 Cookie：已配置
- ⚠️ Cookie 状态：可能已过期（需要更新）

---

## 📖 接口测试

### 1. 公开接口（无需 Cookie）✅

这些接口可以直接使用，不需要任何配置：

```bash
# 获取排行榜
curl "http://localhost:3200/getRanks"

# 获取热门搜索关键词
curl "http://localhost:3200/getHotkey"

# 搜索歌曲
curl "http://localhost:3200/getSearchByKey/周杰伦"

# 获取歌单列表
curl "http://localhost:3200/getSongLists"

# 获取歌词
curl "http://localhost:3200/getLyric?songmid=0039MnYb0qxYhV"
```

### 2. 需要 Cookie 的接口 ⚠️

**当前状态**: 全局 Cookie 已配置，但可能已过期

如果接口返回错误，请更新 Cookie。

#### 方式 1: 手动传递 Cookie（推荐）

```bash
# 从浏览器获取最新 Cookie 后：
curl "http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号&cookie=你的 Cookie"

# 或通过 Header 传递
curl -H "X-Custom-Cookie: 你的 Cookie" \
  "http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号"
```

#### 方式 2: 使用全局 Cookie

当前已启用，但如果 Cookie 过期需要更新。

---

## 🔄 如何获取最新 Cookie

### 方法 1: 从浏览器获取（推荐）

1. 访问 [https://y.qq.com](https://y.qq.com) 并登录
2. 按 `F12` 打开开发者工具
3. 点击 **Network（网络）** 标签
4. 刷新页面（`F5`）
5. 在左侧选择第一个请求（通常是 `y.qq.com`）
6. 在右侧找到 **Request Headers（请求标头）**
7. 滚动找到 **Cookie** 字段
8. 复制整个 Cookie 值（从 `uin=` 开始）

### 方法 2: 使用扫码登录

```bash
# 1. 获取二维码
curl "http://localhost:3200/getQQLoginQr"

# 2. 用手机 QQ 扫码后，检查登录状态
curl -X POST "http://localhost:3200/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"xxx","ptqrtoken":"xxx"}'
```

### 更新全局 Cookie

1. 编辑 `config/user-info.json`
2. 填入新的 Cookie：
```json
{
  "loginUin": "你的 QQ 号",
  "cookie": "完整的 Cookie 字符串"
}
```
3. 重启服务

---

## 🎯 常用接口示例

### 获取用户歌单
```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=1979432414"
```

### 获取歌曲播放链接
```bash
curl "http://localhost:3200/getMusicPlay?songmid=0039MnYb0qxYhV"
```

### 获取每日推荐（需要 Cookie）
```bash
curl "http://localhost:3200/getDailyRecommend"
```

### 获取相似歌曲
```bash
curl "http://localhost:3200/getSimilarSongs?songmid=0039MnYb0qxYhV"
```

---

## 🔧 配置说明

### 降级模式配置

编辑 `config/service-config.json`：

```json
{
  "fallbackMode": true,          // 是否启用降级模式
  "useGlobalCookie": true,       // 是否使用全局 Cookie
  "cookieParamName": "cookie"    // Query 参数名
}
```

### 环境变量

```bash
# 启用降级模式
export FALLBACK_MODE=true

# 启用全局 Cookie
export USE_GLOBAL_COOKIE=true
```

---

## 📊 接口状态

| 接口 | 状态 | 说明 |
|------|------|------|
| `/getRanks` | ✅ | 排行榜 - 无需 Cookie |
| `/getHotkey` | ✅ | 热门搜索 - 无需 Cookie |
| `/getSearchByKey` | ✅ | 搜索 - 无需 Cookie |
| `/getMusicPlay` | ⚠️ | 播放 - 需要有效 Cookie |
| `/user/getUserPlaylists` | ⚠️ | 用户歌单 - 需要有效 Cookie |
| `/getDailyRecommend` | ⚠️ | 每日推荐 - 需要有效 Cookie |

---

## 🐛 常见问题

### Q: 为什么返回 "获取用户歌单失败"？
**A**: Cookie 可能已过期，请重新获取最新 Cookie。

### Q: 播放接口返回空对象？
**A**: 
1. Cookie 可能过期
2. 歌曲可能需要 VIP 权限
3. 尝试更换其他歌曲测试

### Q: 如何切换回全局 Cookie 模式？
**A**: 修改 `config/service-config.json`，设置 `useGlobalCookie: true`

---

## 📚 更多文档

- [降级模式使用指南](./docs/FALLBACK_MODE_GUIDE.md)
- [认证与登录](./docs/guide/authentication.md)
- [测试报告](./tests/DEGRADE_TEST.md)
- [使用示例](./examples/DEGRADE_EXAMPLES.md)

---

## 🎉 总结

✅ **服务已正常运行**
- 公开接口可直接使用
- 支持手动传递 Cookie
- 支持全局 Cookie 配置
- 降级模式已启用

⚠️ **注意事项**
- 部分接口需要最新有效的 Cookie
- Cookie 会过期，需定期更新
- 某些歌曲可能需要 VIP 权限

**服务地址**: http://localhost:3200
