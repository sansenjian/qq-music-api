# 其他接口

本页整理了 MV、图片、数字专辑、下载、扫码登录、电台、推荐等接口。

## MV 相关

### 获取 MV 列表

**接口：** `GET /getMv`

**参数：**

| 参数       | 类型   | 必填 | 说明              |
| ---------- | ------ | ---- | ----------------- |
| area_id    | number | 否   | 地区 ID，默认 15  |
| version_id | number | 否   | 版本 ID，默认 7   |
| limit      | number | 否   | 返回数量，默认 20 |
| page       | number | 否   | 页码，默认 0      |

**示例：**

```bash
curl "http://localhost:3200/getMv?area_id=1&limit=20"
```

### 获取 MV 播放地址

**接口：** `GET /getMvPlay`

**参数：**

| 参数 | 类型   | 必填 | 说明       |
| ---- | ------ | ---- | ---------- |
| vid  | string | 是   | MV 视频 ID |

**示例：**

```bash
curl "http://localhost:3200/getMvPlay?vid=001J5QJL1pRQYB"
```

**返回说明：**

成功时会在响应中的 `playLists` 字段下按清晰度聚合播放地址，通常包含 `f10`、`f20`、`f30`、`f40` 等分组。

**注意事项：**

- `vid` 缺失时会返回 `400`
- 当上游 MV URL 数据为空时，当前实现会返回 `502`
- 当前实现会同时聚合 `mp4` 与 `hls` 的 `freeflow_url` 数据

### 按标签获取 MV

**接口：** `GET /getMvByTag`

**参数：**

| 参数  | 类型   | 必填 | 说明     |
| ----- | ------ | ---- | -------- |
| tag   | string | 是   | MV 标签  |
| limit | number | 否   | 数量限制 |
| page  | number | 否   | 页码     |

**示例：**

```bash
curl "http://localhost:3200/getMvByTag?tag=流行&limit=20"
```

## 图片相关

### 获取图片 URL

**接口：** `GET /getImageUrl`

**参数：**

| 参数   | 类型   | 必填 | 说明                     |
| ------ | ------ | ---- | ------------------------ |
| id     | string | 是   | 图片资源 ID              |
| size   | string | 否   | 图片尺寸，默认 `300x300` |
| maxAge | number | 否   | 缓存时间，默认 `2592000` |

**示例：**

```bash
curl "http://localhost:3200/getImageUrl?id=004AlfUb0cVkN1&size=500x500"
```

## 数字专辑

### 获取数字专辑列表

**接口：** `GET /getDigitalAlbumLists`

**参数：**

| 参数  | 类型   | 必填 | 说明     |
| ----- | ------ | ---- | -------- |
| limit | number | 否   | 数量限制 |
| page  | number | 否   | 页码     |

**示例：**

```bash
curl "http://localhost:3200/getDigitalAlbumLists?limit=20"
```

## 下载相关

### 下载 QQ 音乐资源地址

**接口：** `GET /downloadQQMusic`

**参数：**

| 参数    | 类型   | 必填 | 说明                          |
| ------- | ------ | ---- | ----------------------------- |
| songmid | string | 是   | 歌曲 MID                      |
| quality | string | 否   | 音质，如 `128`、`m4a`、`flac` |

**示例：**

```bash
curl "http://localhost:3200/downloadQQMusic?songmid=003rJSwm3TechU&quality=128"
```

## 用户与扫码登录

### 获取 QQ 登录二维码

**接口：** `GET /getQQLoginQr`

**兼容接口：** `GET /user/getQQLoginQr`

**示例：**

```bash
curl "http://localhost:3200/getQQLoginQr"
```

### 检查扫码登录状态

**接口：** `POST /checkQQLoginQr`

**兼容接口：** `POST /user/checkQQLoginQr`

**请求体参数：**

| 参数      | 类型   | 必填 | 说明                   |
| --------- | ------ | ---- | ---------------------- |
| qrsig     | string | 是   | 二维码签名             |
| ptqrtoken | string | 否   | 轮询状态时使用的 token |

**示例：**

```bash
curl -X POST "http://localhost:3200/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"你的 qrsig","ptqrtoken":"你的 ptqrtoken"}'
```

::: tip 提示
如果你通过前一个接口获取二维码，通常需要保留响应中的关键字段，再传给登录状态检查接口。
:::

::: warning 已知失败分支
当前实现会对超时、二维码失效、提取不到 `checkSigUrl`、提取不到 `p_skey`、授权跳转缺少 `code` 等场景返回明确错误。
:::

## 批量接口

### 批量获取歌曲信息

**接口：** `POST /batchGetSongInfo`

**请求体参数：**

| 参数  | 类型  | 必填 | 说明                                       |
| ----- | ----- | ---- | ------------------------------------------ |
| songs | array | 否   | 歌曲列表，元素格式为 `[song_mid, song_id]` |

**示例：**

```bash
curl -X POST "http://localhost:3200/batchGetSongInfo" \
  -H "Content-Type: application/json" \
  -d '{"songs":[["0039MnYb0qxYhV","12345"],["001Qu4I30eVFYb"]]}'
```

**注意事项：**

- `songs` 缺失时，当前实现返回空数组
- 单个元素缺少 `song_id` 时，服务端会使用空字符串作为默认值

### 批量获取歌单列表

**接口：** `POST /batchGetSongLists`

**请求体参数：**

| 参数        | 类型     | 必填 | 默认值       | 说明         |
| ----------- | -------- | ---- | ------------ | ------------ |
| categoryIds | number[] | 否   | `[10000000]` | 分类 ID 数组 |
| page        | number   | 否   | 0            | 页码         |
| limit       | number   | 否   | 19           | 数量         |
| sortId      | number   | 否   | 5            | 排序方式     |

**示例：**

```bash
curl -X POST "http://localhost:3200/batchGetSongLists" \
  -H "Content-Type: application/json" \
  -d '{"categoryIds":[10000000,10000002],"page":0,"limit":19,"sortId":5}'
```

**注意事项：**

- 未传 `categoryIds` 时，当前实现会使用默认分类 ID `10000000`
- 返回结构当前为 `{ status, data }`
- 当下游返回业务错误时，接口会保留该错误对象并放入结果数组

## 电台相关

### 获取电台列表

**接口：** `GET /getRadioLists`

**示例：**

```bash
curl "http://localhost:3200/getRadioLists"
```

## 推荐相关

### 获取首页推荐内容

**接口：** `GET /getRecommend`

**示例：**

```bash
curl "http://localhost:3200/getRecommend"
```

## 票务相关

### 获取票务信息

**接口：** `GET /getTicketInfo`

**示例：**

```bash
curl "http://localhost:3200/getTicketInfo"
```

## 相关文档

- [音乐相关 API](/api/music)
- [歌手相关 API](/api/singer)
- [歌单相关 API](/api/playlist)
- [快速开始](/guide/quickstart)
