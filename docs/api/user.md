# 用户接口

本页整理与用户信息、登录、头像、歌单获取相关的接口能力。

## 接口总览

- `GET /user/getUserPlaylists`
- `GET /user/getUserAvatar`
- `GET /user/getQQLoginQr`
- `POST /user/checkQQLoginQr`

## 获取用户歌单

### 接口

`GET /user/getUserPlaylists`

### 说明

获取指定用户的歌单列表。该接口通常与登录态配置配合使用。

### 参数

| 参数 | 类型   | 必填 | 默认值 | 说明        |
| ---- | ------ | ---- | ------ | ----------- |
| uin  | string | 是   | -      | QQ 用户号码 |

### 请求示例

```bash
curl "http://localhost:3200/user/getUserPlaylists?uin=123456789"
```

### 响应示例

```json
{
	"code": 0,
	"data": {
		"playlists": [
			{
				"dissid": "123456",
				"dissname": "我的歌单"
			}
		]
	}
}
```

### 注意事项

- 部分场景依赖有效登录态
- 如果返回异常，优先检查 Cookie 是否过期
- 建议结合 [`认证与登录`](/guide/authentication) 页面一起使用

## 获取用户头像

### 接口

`GET /user/getUserAvatar`

### 说明

获取 QQ 用户头像地址，支持通过 `uin` 或 `k` 参数生成头像 URL。

### 参数

| 参数 | 类型   | 必填 | 默认值 | 说明                                     |
| ---- | ------ | ---- | ------ | ---------------------------------------- |
| uin  | string | 否   | -      | QQ 号码                                  |
| k    | string | 否   | -      | QQ 头像 key                              |
| size | number | 否   | 140    | 头像尺寸，支持 `40`、`100`、`140`、`640` |

### 请求示例

```bash
curl "http://localhost:3200/user/getUserAvatar?uin=123456789&size=140"
```

### 响应示例

```json
{
	"code": 200,
	"data": {
		"avatarUrl": "https://q.qlogo.cn/headimg_dl?dst_uin=123456789&spec=140",
		"message": "获取头像成功"
	}
}
```

### 注意事项

- 如果同时提供 `k` 和 `uin`，优先使用 `k`
- `640` 通常可获取高清头像
- 头像接口适合直接用于前端展示

## 获取登录二维码

### 接口

`GET /user/getQQLoginQr`

### 说明

获取 QQ 登录二维码，用于扫码登录流程。

### 参数

无。

### 请求示例

```bash
curl "http://localhost:3200/user/getQQLoginQr"
```

### 注意事项

- 兼容公开入口 `GET /getQQLoginQr`
- 建议保存返回中的关键字段，用于后续轮询登录状态

## 检查扫码登录状态

### 接口

`POST /user/checkQQLoginQr`

### 说明

根据二维码登录流程中的关键字段，轮询扫码状态。

### 参数

| 参数      | 类型   | 必填 | 默认值 | 说明               |
| --------- | ------ | ---- | ------ | ------------------ |
| qrsig     | string | 是   | -      | 二维码签名         |
| ptqrtoken | string | 否   | -      | 登录状态轮询 token |

### 请求示例

```bash
curl -X POST "http://localhost:3200/user/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"你的 qrsig","ptqrtoken":"你的 ptqrtoken"}'
```

### 注意事项

- 兼容公开入口 `POST /checkQQLoginQr`
- 建议与 [`/user/getQQLoginQr`](#获取登录二维码) 配合使用

## 相关接口

- [认证与登录](/guide/authentication)
- [其他接口](/api/other)
- [快速开始](/guide/quickstart)
