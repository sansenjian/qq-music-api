# 评论相关 API

获取歌曲、专辑等评论数据。

## 获取评论

获取歌曲、专辑等的评论列表。

**接口：** `GET /getComments`

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 资源 ID（歌曲 ID/专辑 ID 等） |
| rootcommentid | string | 否 | 根评论 ID（回复评论时使用） |
| pagesize | number | 否 | 每页评论数 |
| pagenum | number | 否 | 页码 |
| cmd | number | 否 | 命令类型 |
| reqtype | number | 否 | 请求类型 |
| biztype | number | 否 | 业务类型（1=歌曲，2=专辑等） |

**示例：**

```bash
# 获取歌曲评论
curl "http://localhost:3200/getComments?id=123456&biztype=1&pagesize=20"

# 获取专辑评论
curl "http://localhost:3200/getComments?id=789012&biztype=2&pagesize=20"
```

**响应：**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "comment": {
      "list": [
        {
          "rootcommentid": "123",
          "content": "评论内容",
          "nick": "用户名",
          "praisenum": 100,
          "time": 1234567890
        }
      ],
      "total": 1000
    }
  }
}
```

## 评论类型

- **biztype=1**: 歌曲评论
- **biztype=2**: 专辑评论
- **biztype=3**: 歌单评论
- **biztype=4**: MV 评论

## 排序方式

- **reqtype=1**: 推荐排序
- **reqtype=2**: 时间排序（最新）
- **reqtype=3**: 热度排序（点赞最多）

## 相关接口

- [音乐相关 API](/api/music)
- [专辑相关 API](/api/music)
