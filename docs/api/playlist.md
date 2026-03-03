# 歌单相关 API

歌单分类、歌单详情、新歌专辑等接口。

## 获取歌单列表

获取歌单列表，支持分类筛选。

**接口：** `GET /getSongLists`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | number | 否 | 分类 ID |
| sortId | number | 否 | 排序方式 |
| limit | number | 否 | 每页数量 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getSongLists?limit=20"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "playlists": [
      {
        "dissname": "歌单名",
        "creator": "创建者",
        "listen_num": 1234567
      }
    ]
  }
}
```

## 获取歌单分类

获取所有歌单分类信息。

**接口：** `GET /getSongListCategories`

**示例：**

```bash
curl "http://localhost:3200/getSongListCategories"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "华语"
      }
    ]
  }
}
```

## 获取歌单详情

获取指定歌单的详细信息和歌曲列表。

**接口：** `GET /getSongListDetail`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| disstid | string | 是 | 歌单 ID |

**示例：**

```bash
curl "http://localhost:3200/getSongListDetail?disstid=123456789"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "dissname": "歌单名",
    "desc": "歌单描述",
    "songlist": [
      {
        "songname": "歌曲名",
        "singer": "歌手名"
      }
    ]
  }
}
```

## 批量获取歌单

批量获取多个歌单信息。

**接口：** `POST /batchGetSongLists`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| disstid | string | 是 | 歌单 ID 列表（逗号分隔） |

**示例：**

```bash
curl -X POST http://localhost:3200/batchGetSongLists \
  -H "Content-Type: application/json" \
  -d '{"disstid": "123456,789012"}'
```

## 获取新碟上架

获取最新上架的专辑。

**接口：** `GET /getNewDisks`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getNewDisks?limit=20"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "albums": [
      {
        "albumName": "专辑名",
        "singerName": "歌手名",
        "publicTime": "2026-03-01"
      }
    ]
  }
}
```

## 相关接口

- [音乐相关 API](/api/music)
- [排行榜 API](/api/rank)
