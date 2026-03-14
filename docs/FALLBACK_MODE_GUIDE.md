# 降级服务使用指南

## 概述

为了提高服务的灵活性和可用性，本项目实现了**降级服务模式**。在降级模式下：

- ✅ **不需要登录的接口**：可以直接使用，无需配置 Cookie
- 🔧 **需要登录的接口**：支持手动传递 Cookie，不再强制依赖全局配置

## 配置说明

### 配置文件

配置文件位于 `config/service-config.json`，包含以下选项：

```json
{
  "fallbackMode": true,
  "useGlobalCookie": false,
  "cookieParamName": "cookie"
}
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `fallbackMode` | boolean | `true` | 是否启用降级模式 |
| `useGlobalCookie` | boolean | `false` | 是否使用全局 Cookie（向后兼容） |
| `cookieParamName` | string | `"cookie"` | 从 query 参数传递 Cookie 时的参数名 |

### 环境变量覆盖

支持通过环境变量覆盖配置：

```bash
# 启用降级模式
export FALLBACK_MODE=true

# 启用全局 Cookie（向后兼容模式）
export USE_GLOBAL_COOKIE=true
```

`cookieParamName` 当前不支持环境变量覆盖，仅可在 `config/service-config.json` 中配置。

## 使用方式

### 场景 1：不需要登录的接口

直接调用即可，无需任何配置：

```bash
# 获取排行榜
curl "http://localhost:3200/getRanks"

# 获取搜索关键词
curl "http://localhost:3200/getHotkey"

# 搜索歌曲
curl "http://localhost:3200/getSearchByKey/周杰伦"
```

### 场景 2：需要登录的接口（手动传递 Cookie）

#### 方式 1：通过 Query 参数传递

```bash
# 获取用户歌单
curl "http://localhost:3200/user/getUserPlaylists?uin=123456789&cookie=your_cookie_string"

# 获取用户信息
curl "http://localhost:3200/user/getCookie?cookie=your_cookie_string"
```

#### 方式 2：通过自定义 Header 传递

```bash
curl -H "X-Custom-Cookie: your_cookie_string" \
  "http://localhost:3200/user/getUserPlaylists?uin=123456789"
```

#### 方式 3：通过标准 Cookie Header 传递

```bash
curl -H "Cookie: uin=o123456789; qqmusic_key=xxx; ..." \
  "http://localhost:3200/user/getUserPlaylists?uin=123456789"
```

### 场景 3：使用全局 Cookie（向后兼容）

如果你希望继续使用全局 Cookie 配置，可以：

1. 修改 `config/service-config.json`：
   ```json
   {
     "fallbackMode": true,
     "useGlobalCookie": true
   }
   ```

2. 在 `config/user-info.json` 中配置 Cookie：
   ```json
   {
     "loginUin": "123456789",
     "cookie": "uin=o123456789; qqmusic_key=xxx; ..."
   }
   ```

3. 直接调用接口：
   ```bash
   curl "http://localhost:3200/user/getUserPlaylists?uin=123456789"
   ```

## Cookie 获取方法

### 从浏览器获取 Cookie

1. 访问 [https://y.qq.com](https://y.qq.com) 并登录
2. 按 `F12` 打开开发者工具
3. 点击 **Network** 标签
4. 刷新页面
5. 选择第一个请求
6. 在 **Request Headers** 中找到 **Cookie**
7. 复制整个 Cookie 值

### Cookie 格式示例

```
uin=o123456789; qqmusic_key=xxxxxxxxxx; qqmusic_uin=123456789; qqmusic_fromstatus=1; _qpsvr_localtk=xxxxxx
```

## 服务启动信息

启动服务后，你会看到类似的输出：

```
🎵 QQ Music API Service Starting...

Current Version: 1.x.x
Fallback Mode: Enabled
Use Global Cookie: No

✅ 降级模式已启用：支持手动传递 Cookie

使用方式:
  1. Query 参数：GET /api/endpoint?cookie=your_cookie
  2. Header: X-Custom-Cookie: your_cookie
  3. Header: Cookie: your_cookie

⚠️  全局 Cookie 未启用：需要登录的接口请手动传递 Cookie

server running @ http://localhost:3200
```

## 需要登录的接口

以下接口通常需要登录态（Cookie）才能正常工作：

- `/user/getUserPlaylists` - 获取用户歌单
- `/user/getUserLikedSongs` - 获取用户喜欢的歌曲
- `/user/getUserAvatar` - 获取用户头像
- `/getDailyRecommend` - 获取每日推荐
- `/getPersonalRecommend` - 获取个性化推荐
- `/getSimilarSongs` - 获取相似歌曲

## 常见问题

### Q: 降级模式和普通模式有什么区别？

**A:** 
- **降级模式**（推荐）：不需要配置全局 Cookie，按需手动传递
- **普通模式**：需要配置全局 Cookie，所有接口自动使用

### Q: 如何切换回普通模式？

**A:** 修改 `config/service-config.json`，设置 `useGlobalCookie: true`

### Q: 手动传递的 Cookie 优先级如何？

**A:** 优先级顺序：
1. 手动传递的 Cookie（最高优先级）
2. 全局 Cookie（如果启用）
3. 无 Cookie

### Q: 会影响现有接口调用吗？

**A:** 不会。降级模式是向后兼容的，现有调用方式仍然有效。

### Q: 安全性如何？

**A:** 
- Cookie 只在内存中使用，不会记录日志
- 建议使用 HTTPS 传输
- 不要将 Cookie 提交到版本控制系统

## 最佳实践

1. **开发环境**：使用降级模式，方便调试
2. **生产环境**：根据需求选择模式
   - 公开服务：降级模式 + 用户自行传递 Cookie
   - 内部服务：全局 Cookie 模式
3. **临时使用**：降级模式，扫码获取 Cookie 后手动传递
4. **长期使用**：全局 Cookie 模式，配置一次即可

## 示例代码

### Node.js 示例

```javascript
const axios = require('axios');

// 方式 1: Query 参数
axios.get('http://localhost:3200/user/getUserPlaylists', {
  params: {
    uin: '123456789',
    cookie: 'uin=o123456789; qqmusic_key=xxx;'
  }
});

// 方式 2: Header
axios.get('http://localhost:3200/user/getUserPlaylists?uin=123456789', {
  headers: {
    'X-Custom-Cookie': 'uin=o123456789; qqmusic_key=xxx;'
  }
});
```

### Python 示例

```python
import requests

# 方式 1: Query 参数
response = requests.get(
    'http://localhost:3200/user/getUserPlaylists',
    params={
        'uin': '123456789',
        'cookie': 'uin=o123456789; qqmusic_key=xxx;'
    }
)

# 方式 2: Header
response = requests.get(
    'http://localhost:3200/user/getUserPlaylists?uin=123456789',
    headers={
        'X-Custom-Cookie': 'uin=o123456789; qqmusic_key=xxx;'
    }
)
```

## 相关文档

- [安装指南](/guide/installation)
- [快速开始](/guide/quickstart)
- [认证与登录](/guide/authentication)
- [用户接口](/api/user)
