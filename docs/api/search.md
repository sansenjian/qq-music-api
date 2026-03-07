# 搜索 API

歌曲、歌手、专辑、歌单搜索接口。

## 搜索

支持关键词搜索，返回歌曲、歌手、专辑等信息。

**接口：** `GET /getSearchByKey`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 搜索关键词 |
| limit | number | 否 | 每页数量 |
| page | number | 否 | 页码 |
| catZhida | number | 否 | 是否开启智能搜索 |

**示例：**

```bash
curl "http://localhost:3200/getSearchByKey?key=周杰伦&limit=20"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "song": {
      "list": [...]
    },
    "singer": {
      "list": [...]
    },
    "album": {
      "list": [...]
    }
  }
}
```

## 智能搜索（Smartbox）

智能搜索，返回综合结果。

**接口：** `GET /getSmartbox`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | 是 | 搜索关键词 |

**示例：**

```bash
curl "http://localhost:3200/getSmartbox?key=周杰伦"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "result": {
      "songList": [...],
      "singerList": [...],
      "albumList": [...]
    }
  }
}
```

## 获取搜索热词

获取当前热门搜索关键词。

**接口：** `GET /getHotkey`

**示例：**

```bash
curl "http://localhost:3200/getHotkey"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "hotkey": [
      {
        "k": "关键词",
        "n": 12345678
      }
    ]
  }
}
```

## 搜索技巧

1. **精确搜索**：使用引号包裹关键词
2. **组合搜索**：使用空格分隔多个关键词
3. **排除搜索**：使用减号排除特定词

## 相关接口

- [音乐相关 API](/api/music)
- [歌手相关 API](/api/singer)
