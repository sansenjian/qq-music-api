# 快速开始

本指南将帮助你快速上手使用 `QQ Music API`。

## 启动服务

如果你还没有启动项目，请先执行：

```bash
npm install
npm run dev
```

服务默认运行在 `http://localhost:3200`。

## 请求方式

当前项目以 `GET` 接口为主，同时提供少量 `POST` 接口用于批量查询和扫码登录状态轮询。

### 常见 GET 请求示例

```bash
curl "http://localhost:3200/getRanks?limit=10"
```

### 常见 POST 请求示例

```bash
curl -X POST "http://localhost:3200/batchGetSongLists" \
  -H "Content-Type: application/json" \
  -d '{"categoryIds":[10000000],"page":0,"limit":19,"sortId":5}'
```

## 常用接口示例

### 1. 获取歌曲播放地址

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

### 5. 获取歌手详情

```bash
curl "http://localhost:3200/getSingerDesc?singermid=0025NhlN2yWrP4"
```

### 6. 获取登录二维码

```bash
curl "http://localhost:3200/getQQLoginQr"
```

### 7. 轮询扫码登录状态

```bash
curl -X POST "http://localhost:3200/checkQQLoginQr" \
  -H "Content-Type: application/json" \
  -d '{"qrsig":"你的 qrsig","ptqrtoken":"你的 ptqrtoken"}'
```

## 已提供的 POST 接口

- `POST /batchGetSongLists`
- `POST /batchGetSongInfo`
- `POST /checkQQLoginQr`
- `POST /user/checkQQLoginQr`

## 响应说明

大部分接口返回 JSON 数据，常见结构如下：

```json
{
  "status": 200,
  "body": {
    "response": {}
  }
}
```

部分接口会直接返回：

```json
{
  "response": {}
}
```

这是因为项目中同时存在历史接口实现与迁移后的统一响应封装，后续新增能力建议优先复用 [`util/apiResponse.ts`](../../util/apiResponse.ts) 与 [`routers/util.ts`](../../routers/util.ts) 中的统一处理方式。

## 调试建议

- 若接口依赖登录态，先配置 [`config/user-info.ts`](../../config/user-info.ts) 或使用扫码登录接口。
- 若请求参数中包含 URL，建议使用 `curl -G --data-urlencode` 避免编码问题。
- 如需查看全部接口，可直接阅读 [`routers/router.ts`](../../routers/router.ts)。

## 下一步

- [安装指南](/guide/installation)
- [代码架构](/guide/architecture)
- [音乐相关 API](/api/music)
- [其他接口](/api/other)
