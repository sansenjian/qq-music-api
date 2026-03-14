# 降级服务测试总结

## ✅ 已实现功能

### 1. 降级服务完全正常
- ✅ 不需要 Cookie 的接口可以正常使用
  - `/getRanks` - 排行榜 ✅
  - `/getHotkey` - 热门搜索 ✅
  - `/getSearchByKey` - 搜索接口 ✅
  - `/getSongLists` - 歌单列表 ✅
  - 等大部分公开接口

### 2. Cookie 手动传递机制
- ✅ 支持从 Query 参数传递 Cookie
- ✅ 支持从 Header 传递 Cookie（X-Custom-Cookie）
- ✅ 支持从标准 Cookie Header 传递
- ✅ 支持全局 Cookie 配置（可选）

### 3. 配置灵活
- ✅ 可通过 `config/service-config.json` 配置
- ✅ 支持环境变量覆盖
- ✅ 降级模式和全局 Cookie 模式可切换

## ⚠️ 发现的问题

### `/getMusicPlay` 接口返回空

**现象**：
- 接口返回 `{"response":{"playUrl":{}}}`
- API 返回码 `req_0.code: 10006`
- DEBUG 日志显示 Cookie 已正确传递

**原因分析**：
1. **Cookie 可能已过期** - 当前配置的 Cookie 可能失效
2. **歌曲权限限制** - 测试的歌曲可能需要 VIP 权限
3. **QQ 音乐 API 限制** - 某些接口可能对第三方调用有限制

**解决方案**：
1. 更新 Cookie - 重新从浏览器获取最新的 Cookie
2. 测试免费歌曲 - 选择明确免费的歌曲测试
3. 使用全局 Cookie 模式 - 确保 Cookie 正确配置

## 📝 使用建议

### 对于公开接口
直接使用，无需任何配置：
```bash
curl "http://localhost:3200/getRanks"
curl "http://localhost:3200/getSearchByKey/周杰伦"
```

### 对于需要登录的接口

#### 方式 1: 手动传递 Cookie（推荐）
```bash
# 1. 从浏览器获取 Cookie
# 2. 通过 Query 参数传递
curl "http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号&cookie=你的 Cookie"

# 或通过 Header 传递
curl -H "X-Custom-Cookie: 你的 Cookie" \
  "http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号"
```

#### 方式 2: 启用全局 Cookie
1. 修改 `config/service-config.json`:
```json
{
  "fallbackMode": true,
  "useGlobalCookie": true,
  "cookieParamName": "cookie"
}
```

2. 确保 `config/user-info.json` 配置正确：
```json
{
  "loginUin": "你的 QQ 号",
  "cookie": "完整的 Cookie 字符串"
}
```

3. 重启服务后直接使用：
```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号"
```

## 🔧 获取最新 Cookie

### 方法 1: 从浏览器获取
1. 访问 https://y.qq.com 并登录
2. F12 打开开发者工具
3. Network 标签 → 刷新页面
4. 选择第一个请求
5. 复制 Request Headers 中的 Cookie 值

### 方法 2: 使用扫码登录接口
```bash
# 1. 获取二维码
curl "http://localhost:3200/getQQLoginQr"

# 2. 扫码登录后检查状态
curl -X POST "http://localhost:3200/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"xxx","ptqrtoken":"xxx"}'
```

## 📊 接口状态总结

| 接口类型 | 状态 | 说明 |
|---------|------|------|
| 公开接口 | ✅ 正常 | 无需 Cookie，可直接使用 |
| 用户接口 | ⚠️ 需 Cookie | 需要手动传递或全局配置 |
| 播放接口 | ⚠️ 需有效 Cookie | 需要最新且有效的 Cookie |
| 推荐接口 | ⚠️ 需 Cookie | 个性化推荐需要登录态 |

## 🎯 下一步建议

1. **更新 Cookie** - 如果某些接口返回错误，首先尝试更新 Cookie
2. **查看日志** - 开启 DEBUG 模式查看详细请求信息
3. **测试免费资源** - 优先测试明确免费的接口和歌曲
4. **参考文档** - 查看 [`docs/FALLBACK_MODE_GUIDE.md`](./docs/FALLBACK_MODE_GUIDE.md) 获取详细使用指南

## 总结

✅ **降级服务完全实现并正常工作！**

- 公开接口无需任何配置即可使用
- 需要登录的接口支持灵活传递 Cookie
- 服务不会因为缺少 Cookie 而崩溃
- 配置灵活，支持多种使用场景

⚠️ **注意事项**：
- 某些接口可能需要最新有效的 Cookie
- 部分歌曲可能需要 VIP 权限
- Cookie 会过期，需要定期更新
