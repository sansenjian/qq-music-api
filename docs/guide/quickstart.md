# 快速开始

本指南将帮助你快速上手使用 QQ Music API。

## 基础使用

### 请求格式

本项目提供 **38** 个 API 接口，其中 **34** 个支持 GET 请求，**3** 个支持 POST 请求。

**GET 请求示例：**

```bash
curl http://localhost:3200/getRanks?limit=10
```

**POST 请求示例：**

```bash
curl -X POST http://localhost:3200/batchGetSongLists \
  -H "Content-Type: application/json" \
  -d '{"disstid": "123456,789012"}'
```

**支持 POST 的接口：**
- `/batchGetSongLists` - 批量获取歌单
- `/batchGetSongInfo` - 批量获取歌曲信息
- `/checkQQLoginQr` - 检查 QQ 登录二维码

### 响应格式

所有接口返回 JSON 格式数据：

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

## 常用接口示例

### 1. 获取音乐播放 URL

```bash
curl "http://localhost:3200/getMusicPlay?songmid=003rJSwm3TechU"
```

### 2. 获取歌词

```bash
curl "http://localhost:3200/getLyric?songmid=003rJSwm3TechU&isFormat=1"
```

### 3. 获取排行榜

```bash
curl "http://localhost:3200/getRanks?limit=20"
```

### 4. 搜索歌曲

```bash
curl "http://localhost:3200/getSearchByKey?key=周杰伦&limit=20"
```

### 5. 获取歌手信息

```bash
curl "http://localhost:3200/getSingerDesc?singermid=0025NhlN2yWrP4"
```

## 参数说明

大部分接口支持以下通用参数：

- `limit` - 返回数量限制
- `page` - 页码
- `format` - 返回格式（json/xml）

## 错误处理

当请求失败时，返回格式：

```json
{
  "code": -1,
  "msg": "错误信息",
  "data": null
}
```

常见错误码：

- `0` - 成功
- `-1` - 通用错误
- `400` - 请求参数错误
- `500` - 服务器错误

## 跨域访问

API 默认支持 CORS，可以直接在浏览器中使用。

## 下一步

- [音乐相关 API](/api/music)
- [歌手相关 API](/api/singer)
- [排行榜 API](/api/rank)
