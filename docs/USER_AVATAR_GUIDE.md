# 获取 QQ 头像接口使用指南

## 接口说明

**接口地址**: `GET /user/getUserAvatar`

**功能**: 获取 QQ 用户头像 URL

**参数**:
- `uin` (可选): QQ 号码
- `k` (可选): QQ 头像标识 key（从某些 QQ 音乐接口获取）
- `size` (可选): 头像尺寸，默认 140，支持 40/100/140/640 等

## 使用方式

### 方式 1: 使用 QQ 号获取头像

```
http://localhost:3200/user/getUserAvatar?uin=123456789&size=140
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "avatarUrl": "https://q.qlogo.cn/headimg_dl?dst_uin=123456789&spec=140",
    "message": "获取头像成功"
  }
}
```

### 方式 2: 使用 k 参数获取头像

```
http://localhost:3200/user/getUserAvatar?k=wc834J3KJbQjOgFONleqAg&size=140
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "avatarUrl": "https://thirdqq.qlogo.cn/g?b=sdk&k=wc834J3KJbQjOgFONleqAg&s=140",
    "message": "获取头像成功"
  }
}
```

## 头像尺寸说明

- `40`: 40x40 像素（小头像）
- `100`: 100x100 像素
- `140`: 140x140 像素（默认）
- `640`: 640x640 像素（高清头像）

## 使用场景

### 1. 直接在网页中使用

获取到 `avatarUrl` 后，可以直接在 `<img>` 标签中使用：

```html
<img src="https://q.qlogo.cn/headimg_dl?dst_uin=123456789&spec=140" alt="用户头像" />
```

### 2. 结合用户歌单接口使用

先获取用户歌单信息，然后使用返回的 uin 获取头像：

```javascript
// 获取用户歌单
const playlists = await fetch('/user/getUserPlaylists?uin=123456789');

// 获取用户头像
const avatar = await fetch('/user/getUserAvatar?uin=123456789&size=140');
```

### 3. 从 QQ 音乐页面获取 k 参数

1. 访问 https://y.qq.com
2. 打开开发者工具 (F12)
3. 查看网络请求中的头像请求
4. 复制 URL 中的 `k` 参数值

## 注意事项

1. **头像来源**: 
   - 使用 `uin` 参数会从 `q.qlogo.cn` 获取头像
   - 使用 `k` 参数会从 `thirdqq.qlogo.cn` 获取头像

2. **缓存**: 头像 URL 带有时间戳参数，浏览器会缓存较长时间

3. **跨域**: 头像接口支持跨域访问，可以直接在前端使用

4. **参数优先级**: 如果同时提供 `k` 和 `uin`，优先使用 `k` 参数

## 常见问题

### Q: 返回的头像无法显示？
**A**: 检查以下几点：
1. 确认 uin 或 k 参数正确
2. 确认网络连接正常
3. 尝试更换尺寸参数

### Q: 如何获取高清头像？
**A**: 将 `size` 参数设置为 `640` 即可获取高清头像

### Q: k 参数从哪里获取？
**A**: 
- 从 QQ 音乐页面的头像请求 URL 中获取
- 从某些 QQ 音乐用户信息接口返回的数据中获取

## 示例代码

### JavaScript/Node.js

```javascript
// 获取头像 URL
async function getUserAvatar(uin, size = 140) {
  const response = await fetch(`http://localhost:3200/user/getUserAvatar?uin=${uin}&size=${size}`);
  const data = await response.json();
  
  if (data.code === 200) {
    return data.data.avatarUrl;
  } else {
    throw new Error(data.message);
  }
}

// 使用示例
const avatarUrl = await getUserAvatar('123456789', 140);
console.log('头像 URL:', avatarUrl);
```

### Python

```python
import requests

def get_user_avatar(uin, size=140):
    url = f'http://localhost:3200/user/getUserAvatar?uin={uin}&size={size}'
    response = requests.get(url)
    data = response.json()
    
    if data['code'] == 200:
        return data['data']['avatarUrl']
    else:
        raise Exception(data['message'])

# 使用示例
avatar_url = get_user_avatar('123456789', 140)
print(f'头像 URL: {avatar_url}')
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>QQ 头像展示</title>
</head>
<body>
  <h1>我的 QQ 头像</h1>
  <img id="avatar" src="" alt="加载中..." width="140" height="140" />
  
  <script>
    const uin = '123456789';
    const avatarImg = document.getElementById('avatar');
    
    fetch(`http://localhost:3200/user/getUserAvatar?uin=${uin}&size=140`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          avatarImg.src = data.data.avatarUrl;
          avatarImg.alt = '头像加载成功';
        } else {
          avatarImg.alt = '头像加载失败';
        }
      })
      .catch(err => {
        console.error('加载头像失败:', err);
        avatarImg.alt = '头像加载失败';
      });
  </script>
</body>
</html>
```

## 相关接口

- `/user/getUserPlaylists` - 获取用户歌单
- `/user/getCookie` - 获取 Cookie 信息
- `/getQQLoginQr` - 获取 QQ 登录二维码
