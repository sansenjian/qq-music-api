# 降级服务使用示例

## 快速开始

### 1. 启动服务

```bash
npm run dev
```

你会看到：
```
🎵 QQ Music API Service Starting...

Current Version: 2.2.7
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

### 2. 测试公开接口（无需 Cookie）

```bash
# 获取排行榜
curl "http://localhost:3200/getRanks"

# 获取热门搜索
curl "http://localhost:3200/getHotkey"

# 搜索歌曲
curl "http://localhost:3200/getSearchByKey/周杰伦"
```

### 3. 获取你的 Cookie

访问 http://localhost:3200/user/getCookie 查看当前配置的 Cookie

```bash
curl "http://localhost:3200/user/getCookie"
```

返回示例：
```json
{
  "data": {
    "code": 200,
    "cookie": "uin=o1979432414; qqmusic_key=xxxxx; ...",
    "cookieList": ["uin=o1979432414", "qqmusic_key=xxxxx", ...],
    "cookieObject": {"uin": "o1979432414", "qqmusic_key": "xxxxx", ...}
  }
}
```

### 4. 使用需要登录的接口

#### 方式 1: Query 参数（最简单）

```bash
# 获取用户歌单
curl "http://localhost:3200/user/getUserPlaylists?uin=1979432414&cookie=你的 Cookie"

# 获取用户喜欢的歌曲
curl "http://localhost:3200/user/getUserLikedSongs?cookie=你的 Cookie"
```

#### 方式 2: 自定义 Header

```bash
curl -H "X-Custom-Cookie: 你的 Cookie" \
  "http://localhost:3200/user/getUserPlaylists?uin=1979432414"
```

#### 方式 3: 标准 Cookie Header

```bash
curl -H "Cookie: 你的 Cookie" \
  "http://localhost:3200/user/getUserPlaylists?uin=1979432414"
```

## 实际使用示例

### 示例 1: 获取自己的歌单

```bash
# 假设你的 QQ 号是 123456789，Cookie 是 "uin=o123456789; qqmusic_key=abc123"
curl "http://localhost:3200/user/getUserPlaylists?uin=123456789&cookie=uin=o123456789; qqmusic_key=abc123"
```

### 示例 2: 使用 PowerShell 变量

```powershell
$cookie = "uin=o123456789; qqmusic_key=abc123"
$uin = "123456789"
curl "http://localhost:3200/user/getUserPlaylists?uin=$uin&cookie=$cookie"
```

### 示例 3: 使用 Node.js

```javascript
const axios = require('axios');

const cookie = 'uin=o123456789; qqmusic_key=abc123';
const uin = '123456789';

// 方式 1: Query 参数
axios.get('http://localhost:3200/user/getUserPlaylists', {
  params: { uin, cookie }
}).then(response => {
  console.log(response.data);
});

// 方式 2: Header
axios.get(`http://localhost:3200/user/getUserPlaylists?uin=${uin}`, {
  headers: {
    'X-Custom-Cookie': cookie
  }
}).then(response => {
  console.log(response.data);
});
```

### 示例 4: 使用 Python

```python
import requests

cookie = 'uin=o123456789; qqmusic_key=abc123'
uin = '123456789'

# 方式 1: Query 参数
response = requests.get(
    'http://localhost:3200/user/getUserPlaylists',
    params={'uin': uin, 'cookie': cookie}
)
print(response.json())

# 方式 2: Header
response = requests.get(
    f'http://localhost:3200/user/getUserPlaylists?uin={uin}',
    headers={'X-Custom-Cookie': cookie}
)
print(response.json())
```

## 常用接口列表

### 需要 Cookie 的接口

| 接口 | 说明 | 参数 |
|------|------|------|
| `/user/getUserPlaylists` | 获取用户歌单 | `uin`, `cookie` |
| `/user/getUserLikedSongs` | 获取用户喜欢的歌曲 | `cookie` |
| `/user/getUserAvatar` | 获取用户头像 | `uin`, `cookie` |
| `/getDailyRecommend` | 获取每日推荐 | `cookie` |
| `/getPersonalRecommend` | 获取个性化推荐 | `cookie` |
| `/getSimilarSongs` | 获取相似歌曲 | `songmid`, `cookie` |

### 不需要 Cookie 的接口

| 接口 | 说明 |
|------|------|
| `/getRanks` | 获取排行榜 |
| `/getHotkey` | 获取热门搜索关键词 |
| `/getSearchByKey/:key` | 搜索歌曲 |
| `/getSongLists` | 获取歌单列表 |
| `/getSongListDetail/:disstid` | 获取歌单详情 |
| `/getLyric/:songmid` | 获取歌词 |
| `/getMusicPlay/:songmid` | 获取歌曲播放链接 |

## 获取 Cookie 的方法

### 方法 1: 从浏览器获取

1. 访问 https://y.qq.com 并登录
2. 按 F12 打开开发者工具
3. 点击 Network 标签
4. 刷新页面
5. 选择第一个请求
6. 在 Request Headers 中找到 Cookie
7. 复制整个 Cookie 值

### 方法 2: 使用扫码登录接口

```bash
# 1. 获取二维码
curl "http://localhost:3200/getQQLoginQr"

# 2. 用手机 QQ 扫码登录

# 3. 检查登录状态
curl -X POST "http://localhost:3200/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"你的 qrsig","ptqrtoken":"你的 ptqrtoken"}'
```

登录成功后会返回完整的 Cookie 信息。

## 常见问题

### Q: 为什么返回 "获取用户歌单失败"？
**A**: 可能原因：
1. 没有传递 Cookie
2. Cookie 已过期
3. Cookie 格式不正确
4. uin 参数与 Cookie 不匹配

### Q: Cookie 有效期多久？
**A**: 通常几天到几周不等，过期后需要重新获取

### Q: 如何切换回全局 Cookie 模式？
**A**: 修改 `config/service-config.json`，设置 `useGlobalCookie: true`，然后重启服务

## 注意事项

1. **Cookie 安全**: 不要将 Cookie 提交到版本控制系统
2. **HTTPS**: 生产环境建议使用 HTTPS 传输
3. **权限**: Cookie 包含登录凭证，请妥善保管
4. **过期处理**: Cookie 过期后需要重新获取
