# 用户歌单接口测试指南

## 接口说明

**接口地址**: `GET /user/getUserPlaylists`

**功能**: 获取 QQ 音乐用户创建的歌单列表

**参数**:
- `uin` (必填): QQ 号码
- `offset` (可选): 偏移量，默认 0
- `limit` (可选): 返回数量，默认 30

## 测试方法

### 方法 1: 浏览器直接访问

```
http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号
```

例如：
```
http://localhost:3200/user/getUserPlaylists?uin=123456789&offset=0&limit=30
```

### 方法 2: 使用 curl 命令

```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=123456789&offset=0&limit=30"
```

### 方法 3: 使用 Postman 或其他 API 工具

- **URL**: `http://localhost:3200/user/getUserPlaylists`
- **Method**: GET
- **Query Parameters**:
  - `uin`: 123456789
  - `offset`: 0
  - `limit`: 30

## 注意事项

⚠️ **重要**: 此接口需要有效的 QQ 音乐 Cookie 才能正常工作。

### 如何配置 Cookie

1. **登录 QQ 音乐**
   - 访问 https://y.qq.com
   - 使用 QQ 扫码或账号密码登录

2. **获取 Cookie**
   - 打开浏览器开发者工具 (F12)
   - 进入 Network 标签
   - 刷新页面
   - 找到任意请求，查看 Request Headers 中的 Cookie

3. **配置到项目中**
   - 打开 `config/user-info.json` 文件
   - 将 Cookie 填入 `cookie` 字段
   - 保存并重启服务

示例配置：
```json
{
  "uin": "你的 QQ 号",
  "cookie": "你的 Cookie 字符串",
  "loginUin": "你的 QQ 号"
}
```

## 响应示例

### 成功响应

```json
{
  "code": 200,
  "data": {
    "data": {
      "mymusic": [
        {
          "dissname": "我喜欢的音乐",
          "playnum": 100,
          ...
        }
      ]
    }
  }
}
```

### 错误响应

**缺少 uin 参数**:
```json
{
  "code": 400,
  "message": "缺少 uin 参数"
}
```

**Cookie 无效或未配置**:
```json
{
  "code": 500,
  "message": "获取用户歌单失败",
  "error": "Request failed with status code 404"
}
```

## 常见问题

### Q: 返回 404 错误
**A**: 这通常是因为：
1. 没有配置有效的 Cookie
2. QQ 音乐 API 接口已更新
3. 请求参数不正确

### Q: 如何获取自己的 QQ 号？
**A**: 
- 登录 QQ 音乐后，访问个人主页
- URL 中的 `uin=` 后面的数字就是你的 QQ 号
- 或者在开发者工具的 Console 中输入 `window.user` 查看

### Q: Cookie 有效期多久？
**A**: Cookie 通常有较长的有效期，但如果登录状态失效，需要重新获取并配置。

## 替代方案

如果此接口无法使用，可以考虑：
1. 使用其他公开的歌单 API
2. 通过歌单 ID 直接获取歌单详情：`/getSongListDetail?disstid=xxx`
3. 查看项目文档获取更多接口信息
