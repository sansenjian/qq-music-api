# 其他接口

MV、图片、数字专辑等其他接口。

## MV 相关

### 获取 MV 列表

**接口：** `GET /getMv`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| area_id | number | 否 | 地区 ID |
| version_id | number | 否 | 版本 ID |
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getMv?area_id=1&limit=20"
```

### 获取 MV 播放地址

**接口：** `GET /getMvPlay`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| vid | string | 是 | MV 视频 ID |

**示例：**

```bash
curl "http://localhost:3200/getMvPlay?vid=abc123"
```

### 按标签获取 MV

**接口：** `GET /getMvByTag`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tag | string | 是 | MV 标签 |
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getMvByTag?tag=流行&limit=20"
```

## 图片相关

### 获取图片 URL

**接口：** `GET /getImageUrl`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | string | 是 | 图片 URL |

**示例：**

```bash
# 当 URL 包含特殊字符时，使用 -G 和 --data-urlencode 进行 URL 编码
curl -G --data-urlencode "url=http://example.com/image.jpg?key=value&foo=bar" \
  "http://localhost:3200/getImageUrl"
```

::: tip 提示
使用 `-G --data-urlencode` 可以自动对 URL 参数进行编码，避免参数中包含特殊字符（如 `&`, `=`, `?` 等）导致请求被截断。
:::

## 数字专辑

### 获取数字专辑列表

**接口：** `GET /getDigitalAlbumLists`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getDigitalAlbumLists?limit=20"
```

## 下载

### 下载 QQ 音乐

**接口：** `GET /getDownloadQQMusic`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songmid | string | 是 | 歌曲 MID |
| quality | string | 否 | 音质（128/m4a/flac） |

**示例：**

```bash
curl "http://localhost:3200/getDownloadQQMusic?songmid=003rJSwm3TechU&quality=128"
```

## 用户相关

### 获取 QQ 登录二维码

**接口：** `GET /getQQLoginQr`

**示例：**

```bash
curl "http://localhost:3200/getQQLoginQr"
```

### 检查 QQ 登录状态

**接口：** `GET /checkQQLoginQr`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| qrsig | string | 是 | 二维码签名 |

**示例：**

```bash
curl "http://localhost:3200/checkQQLoginQr?qrsig=xxx"
```

## 电台相关

### 获取电台列表

**接口：** `GET /getRadioLists`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getRadioLists?limit=20"
```

## 推荐

### 获取推荐歌单

**接口：** `GET /getRecommend`

**示例：**

```bash
curl "http://localhost:3200/getRecommend"
```

## 相关接口

- [音乐相关 API](/api/music)
- [歌手相关 API](/api/singer)
