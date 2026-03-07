# 音乐相关 API

音乐播放、歌词、专辑等相关接口。

## 获取音乐播放 URL

获取歌曲播放地址。

**接口：** `GET /getMusicPlay`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songmid | string | 是 | 歌曲 MID |
| songid | number | 否 | 歌曲 ID |

**示例：**

```bash
curl "http://localhost:3200/getMusicPlay?songmid=003rJSwm3TechU"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "url": "http://ws.stream.qqmusic.qq.com/...",
    "size": 12345678,
    "quality": "128kbps"
  }
}
```

## 获取歌词

获取歌曲歌词，支持解析格式。

**接口：** `GET /getLyric`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songmid | string | 是 | 歌曲 MID |
| isFormat | number | 否 | 是否解析格式（1=解析） |

**示例：**

```bash
curl "http://localhost:3200/getLyric?songmid=003rJSwm3TechU&isFormat=1"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "lyric": "[00:00.00] 歌曲名\n[00:10.00] 歌词内容...",
    "trans": "翻译内容..."
  }
}
```

## 获取专辑信息

获取专辑详细信息。

**接口：** `GET /getAlbumInfo`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| albummid | string | 是 | 专辑 MID |

**示例：**

```bash
curl "http://localhost:3200/getAlbumInfo?albummid=0016l2F430zMux"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "albumName": "专辑名",
    "singerName": "歌手名",
    "publicTime": "2020-01-01",
    "songs": []
  }
}
```

## 批量获取歌曲信息

批量获取多首歌曲的详细信息。

**接口：** `GET /batchGetSongInfo`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songmid | string | 是 | 歌曲 MID 列表（逗号分隔） |

**示例：**

```bash
curl "http://localhost:3200/batchGetSongInfo?songmid=003rJSwm3TechU,0042c8L50x6Z9z"
```

## 相关接口

- [歌手相关 API](/api/singer)
- [歌单相关 API](/api/playlist)
- [排行榜 API](/api/rank)
