# 排行榜 API

各种音乐排行榜接口。

## 获取排行榜列表

获取所有排行榜列表或具体榜单详情。

**接口：** `GET /getRanks`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topId | number | 否 | 榜单 ID（不传返回所有榜单） |
| limit | number | 否 | 返回数量限制 |
| page | number | 否 | 页码 |

**示例：**

```bash
# 获取所有榜单
curl "http://localhost:3200/getRanks"

# 获取具体榜单
curl "http://localhost:3200/getRanks?topId=4&limit=20"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "topList": {
      "id": 4,
      "name": "飙升榜",
      "period": "2026_10"
    },
    "songList": [
      {
        "songName": "歌曲名",
        "singerName": "歌手名",
        "rank": 1
      }
    ]
  }
}
```

## 常见榜单 ID

| ID | 榜单名称 |
|----|---------|
| 4 | 飙升榜 |
| 62 | 热歌榜 |
| 208 | 新歌榜 |
| 6 | 原创榜 |
| 104 | MV 榜 |

## 相关接口

- [音乐相关 API](/api/music)
- [歌单相关 API](/api/playlist)
