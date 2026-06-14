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
| resolveMid | boolean | 否 | 是否自动查询歌曲 `mid`，默认 `false`。详见下方说明 |

**示例：**

```bash
# 获取所有榜单
curl "http://localhost:3200/getRanks"

# 获取具体榜单
curl "http://localhost:3200/getRanks?topId=4&limit=20"

# 开启自动解析 mid（每首歌额外发起一次详情查询）
curl "http://localhost:3200/getRanks?topId=4&limit=20&resolveMid=true"
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
    "songInfoList": [
      {
        "songId": 123456,
        "song_id": 123456,
        "song_mid": "0039MnYb0qxYhV",
        "mid": "0039MnYb0qxYhV",
        "songName": "歌曲名",
        "singerName": "歌手名",
        "rank": 1
      }
    ]
  }
}
```

**返回字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| songId / song_id | number | 歌曲 ID，规范化后两者同时存在 |
| song_mid / mid | string | 歌曲 MID，用于获取播放链接。响应本身已含该字段时返回；响应不含时，默认不会自动查询，需要手动通过 `/getSongInfo?songid=xxx` 查询 |
| songName | string | 歌曲名称 |
| singerName | string | 歌手名称 |
| rank | number | 排名 |

---

## 如何获取播放链接

QQ 音乐的播放链接 (`/getMusicPlay`) 需要 `songmid` 参数，而榜单接口通常只返回 `songid`。有两种方式：

### 方式一：推荐 — 手动两步调用（默认、零额外请求）

```bash
# Step 1: 先拿榜单
curl "http://localhost:3200/getRanks?topId=4&limit=20"
# 从响应里取出你关心的歌曲 songId (或 song_id)

# Step 2: 逐个调用详情接口查询 mid（只查你需要的歌曲）
curl "http://localhost:3200/getSongInfo?songid=123456"
# 响应里 songinfo.data.track_info.mid 就是 songmid

# Step 3: 拿 mid 调播放接口
curl "http://localhost:3200/getMusicPlay?songmid=0039MnYb0qxYhV"
```

**优点：** 按需查询，不多发一次请求；客户端可以控制并发和缓存策略。

### 方式二：一步到位 — `resolveMid=true`（N+1 请求）

```bash
curl "http://localhost:3200/getRanks?topId=4&limit=20&resolveMid=true"
```

服务端会对列表里每首缺少 `mid` 的歌曲额外调用一次详情接口，把 `song_mid` / `mid` 字段补上。

**优点：** 调用方便，一步到位  
**缺点：** N 首歌多 N 次请求，榜单较大时会明显变慢。请谨慎使用。

---

> **注意：** 响应中会同时提供 `song_id` / `songId` 和 `song_mid` / `mid` 两套命名，调用方按习惯取用即可。

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
