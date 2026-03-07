# Cookie 配置指南

## 为什么需要配置 Cookie？

QQ 音乐的许多接口（如获取用户信息、用户歌单、播放历史等）需要用户登录状态才能访问。Cookie 包含了你的登录凭证，配置后 API 才能代表你请求这些数据。

## 配置步骤

### 1. 登录 QQ 音乐

访问 [https://y.qq.com](https://y.qq.com) 并登录你的 QQ 账号。

### 2. 获取 Cookie

#### Chrome/Edge 浏览器：

1. 按 `F12` 打开开发者工具
2. 点击 **Network（网络）** 标签
3. 刷新页面（`F5` 或 `Ctrl+R`）
4. 在左侧请求列表中选择第一个请求（通常是 `y.qq.com`）
5. 在右侧找到 **Request Headers（请求标头）**
6. 滚动找到 **Cookie** 字段
7. 复制整个 Cookie 值（从 `uin=` 开始到最后一个字段）

#### Firefox 浏览器：

1. 按 `F12` 打开开发者工具
2. 点击 **Network（网络）** 标签
3. 刷新页面
4. 选择第一个请求
5. 在 **Request Headers** 中找到 **Cookie**
6. 复制整个值

### 3. 获取你的 QQ 号

有几种方法可以获取：

**方法 1**: 从 Cookie 中提取
- Cookie 中的 `uin=` 后面的数字就是你的 QQ 号（去掉开头的 0）
- 例如：`uin=o0123456789` → QQ 号是 `123456789`

**方法 2**: 从个人主页 URL 获取
- 点击头像进入个人主页
- URL 格式：`https://y.qq.com/portal/profile.html?uin=123456789`
- `uin=` 后面的数字就是

**方法 3**: 在控制台查看
- 按 `F12` 打开开发者工具
- 进入 **Console（控制台）** 标签
- 输入 `window.user` 并回车
- 查看返回的对象中的 `uin` 字段

### 4. 编辑配置文件

打开项目中的 `config/user-info.json` 文件，填入你的信息：

```json
{
  "loginUin": "123456789",
  "cookie": "uin=o0123456789; qqmusic_key=abcdef123456; qqmusic_uin=123456789; ...",
  "uin": "123456789"
}
```

**字段说明**：
- `loginUin`: 你的 QQ 号
- `cookie`: 完整的 Cookie 字符串（从浏览器复制的）
- `uin`: 你的 QQ 号（可以和 loginUin 相同）

### 5. 重启服务

配置完成后，需要重启 Node.js 服务使配置生效：

1. 停止当前运行的服务（`Ctrl+C`）
2. 重新启动：`npm run dev`

## 验证配置

配置完成后，可以通过以下方式验证：

### 方法 1: 访问首页
```
http://localhost:3200
```
如果配置成功，页面应该正常显示，不会提示 Cookie 未配置。

### 方法 2: 测试用户接口
```
http://localhost:3200/user/getCookie
```
如果配置成功，会返回你配置的 Cookie 信息。

### 方法 3: 测试用户歌单
```
http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号
```
如果配置成功，会返回你的歌单列表。

## 常见问题

### Q: Cookie 有效期多久？
**A**: Cookie 通常有较长的有效期（几天到几周不等），但如果发现接口返回 404 或权限错误，可能是 Cookie 过期了，需要重新获取。

### Q: 配置后还是返回 404？
**A**: 可能的原因：
1. Cookie 已过期，需要重新获取
2. Cookie 格式不正确，确保完整复制
3. QQ 音乐 API 接口已更新
4. 服务未重启，配置未生效

### Q: 安全吗？会泄露我的账号吗？
**A**: 
- Cookie 只存储在本地 `config/user-info.json` 文件中
- 这个文件已经在 `.gitignore` 中，不会被提交到 Git
- 不要将 `config/user-info.json` 分享给他人
- 如果担心，可以定期更换 Cookie

### Q: 可以配置多个账号吗？
**A**: 当前版本只支持单个账号配置。如需切换账号，修改 `config/user-info.json` 中的值并重启服务即可。

## 示例配置

```json
{
  "loginUin": "123456789",
  "cookie": "uin=o0123456789; qqmusic_key=xxxxxxxxxx; qqmusic_uin=123456789; qqmusic_fromstatus=1; _qpsvr_localtk=xxxxxx",
  "uin": "123456789"
}
```

## 注意事项

1. **不要提交到 Git**: `config/user-info.json` 已添加到 `.gitignore`，请勿手动移除
2. **定期更新**: 如果发现接口异常，尝试更新 Cookie
3. **备份**: 建议备份你的 Cookie，方便下次使用
4. **隐私**: 不要公开分享你的 Cookie

## 快速测试

配置完成后，运行以下命令测试：

```bash
# 测试 Cookie 是否配置成功
curl "http://localhost:3200/user/getCookie"

# 测试获取用户歌单
curl "http://localhost:3200/user/getUserPlaylists?uin=你的 QQ 号"
```

如果返回 JSON 数据而不是错误信息，说明配置成功！
