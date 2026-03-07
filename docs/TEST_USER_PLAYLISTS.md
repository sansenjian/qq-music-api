# 用户歌单接口测试指南

## 接口说明

**接口地址**: `GET /user/getUserPlaylists`

**功能**: 获取 QQ 音乐用户创建的歌单列表

**参数**:

- `uin`（必填）：QQ 号码
- `offset`（可选）：偏移量，默认 `0`
- `limit`（可选）：返回数量，默认 `30`

## 当前状态

**当前状态**: ⚠️ 持续验证中

截至当前代码版本，用户歌单接口仍在持续排查与验证中。文档与测试说明会跟随实现更新，但不建议将该接口视为已经完全稳定。

## 现状说明

### 1. 接口依赖 Cookie

该接口仍依赖有效的 QQ 音乐 Cookie。若 Cookie 失效，通常会直接导致上游请求失败。

### 2. 上游结构可能变化

项目当前会尽量从上游响应中提取并标准化出 `playlists` 字段，但上游字段结构仍可能发生变化。

### 3. 分页语义仍需持续验证

当前接口对外暴露 `offset` 与 `limit` 参数，但由于上游分页能力和字段结构并不稳定，分页结果仍建议按实际返回数据做校验。

## 已尝试与观察到的上游接口

### 1. 用户主页/歌单相关接口

当前排查过程中，曾观察到以下可用路径或相近能力：

```text
https://c6.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg
https://u.y.qq.com/cgi-bin/musicu.fcg
```

### 2. 公开能力接口

以下接口更适合作为公开能力的替代方案或辅助排查手段：

#### 获取热门歌单

```text
GET https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg
```

#### 获取歌单详情

```text
GET https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg
```

#### 搜索歌曲

```text
GET https://c.y.qq.com/soso/fcgi-bin/client_search_cp
```

#### 获取歌曲播放链接

```text
GET https://u.y.qq.com/cgi-bin/musicu.fcg
```

## 测试前准备

### 1. 登录 QQ 音乐

- 访问 `https://y.qq.com`
- 使用 QQ 扫码或账号密码登录

### 2. 获取 Cookie

- 打开浏览器开发者工具（F12）
- 进入 `Network` 标签
- 刷新页面
- 找到任意请求，查看 `Request Headers` 中的 `Cookie`

### 3. 配置项目 Cookie

将 Cookie 配置到项目全局登录态中，并重启服务。

## 测试方法

### 方法 1：浏览器直接访问

```text
http://localhost:3200/user/getUserPlaylists?uin=你的QQ号
```

示例：

```text
http://localhost:3200/user/getUserPlaylists?uin=123456789&offset=0&limit=30
```

### 方法 2：使用 curl

```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=123456789&offset=0&limit=30"
```

### 方法 3：使用 Postman 或其他 API 工具

- URL：`http://localhost:3200/user/getUserPlaylists`
- Method：`GET`
- Query Parameters：
  - `uin`: `123456789`
  - `offset`: `0`
  - `limit`: `30`

## 响应示例

### 成功响应

```json
{
	"code": 0,
	"data": {
		"playlists": [
			{
				"dissid": "123456",
				"dissname": "我喜欢的音乐"
			}
		]
	}
}
```

### 错误响应

**缺少 uin 参数**:

```json
{
	"error": "缺少 uin 参数"
}
```

**Cookie 无效或上游失败**:

```json
{
	"error": "Request failed with status code 404"
}
```

## 注意事项

1. 此接口需要有效的 QQ 音乐 Cookie 才能正常工作
2. 如果返回 `404` 或 `502`，优先检查 Cookie 是否过期，以及上游接口是否变化
3. 当前接口对外只保证 `playlists` 标准化字段，不保证透出完整上游原始结构
4. 若你需要稳定能力，优先考虑公开歌单类接口，例如歌单详情或歌单分类接口

## 常见问题

### Q：返回 404 错误

**A**：这通常是因为：

1. 没有配置有效的 Cookie
2. QQ 音乐上游接口已调整
3. 请求参数不正确

### Q：如何获取自己的 QQ 号？

**A**：

- 登录 QQ 音乐后访问个人主页
- URL 中 `uin=` 后面的数字就是你的 QQ 号
- 也可以在浏览器开发者工具 Console 中查看当前用户信息

### Q：Cookie 有效期多久？

**A**：Cookie 通常可持续一段时间，但登录态失效后需要重新获取并配置。

## 替代方案

如果此接口当前不可用，可以考虑：

1. 使用公开歌单接口
2. 通过歌单 ID 直接获取歌单详情：`/getSongListDetail?disstid=xxx`
3. 查看 [`docs/api/user.md`](api/user.md) 与 [`docs/api/playlist.md`](api/playlist.md) 获取其他能力说明
