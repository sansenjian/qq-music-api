# 歌手相关 API

歌手列表、歌手详情、热门歌曲、MV 等接口。

## 获取歌手列表

获取歌手列表，支持筛选。

**接口：** `GET /getSingerList`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| area | number | 否 | 地区（-1=全部，2=华语，3=欧美等） |
| sex | number | 否 | 性别（-1=全部，1=男，2=女） |
| genre | number | 否 | 流派（-1=全部，1=流行，2=摇滚等） |
| page | number | 否 | 页码 |
| limit | number | 否 | 每页数量 |

**示例：**

```bash
curl "http://localhost:3200/getSingerList?area=-1&sex=-1&limit=20"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "singers": [
      {
        "singerName": "歌手名",
        "singerMID": "0025NhlN2yWrP4",
        "singerPic": "http://..."
      }
    ]
  }
}
```

## 获取歌手详情

获取歌手详细描述信息。

**接口：** `GET /getSingerDesc`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| singermid | string | 是 | 歌手 MID |

**示例：**

```bash
curl "http://localhost:3200/getSingerDesc?singermid=0025NhlN2yWrP4"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "desc": "歌手详细介绍...",
    "birth": "出生日期",
    "birthPlace": "出生地"
  }
}
```

## 获取歌手热门歌曲

获取歌手的热门歌曲列表。

**接口：** `GET /getSingerHotsong`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| singermid | string | 是 | 歌手 MID |
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getSingerHotsong?singermid=0025NhlN2yWrP4&limit=20"
```

## 获取歌手专辑

获取歌手的专辑列表。

**接口：** `GET /getSingerAlbum`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| singermid | string | 是 | 歌手 MID |
| limit | number | 否 | 数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
curl "http://localhost:3200/getSingerAlbum?singermid=0025NhlN2yWrP4&limit=20"
```

## 获取歌手 MV

获取歌手的 MV 列表。

**接口：** `GET /getSingerMv`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| singermid | string | 是 | 歌手 MID |
| limit | number | 否 | 数量限制 |
| order | string | 否 | 排序（time=时间，listen=播放量） |

**示例：**

```bash
curl "http://localhost:3200/getSingerMv?singermid=0025NhlN2yWrP4&limit=20&order=listen"
```

## 获取相似歌手

获取与指定歌手相似的歌手列表。

**接口：** `GET /getSimilarSinger`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| singermid | string | 是 | 歌手 MID |

**示例：**

```bash
curl "http://localhost:3200/getSimilarSinger?singermid=0025NhlN2yWrP4"
```

## 获取歌手热度

获取歌手的热度值（粉丝数等）。

**接口：** `GET /getSingerStarNum`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| singermid | string | 是 | 歌手 MID |

**示例：**

```bash
curl "http://localhost:3200/getSingerStarNum?singermid=0025NhlN2yWrP4"
```

## 相关接口

- [音乐相关 API](/api/music)
- [MV 相关 API](/api/other)
