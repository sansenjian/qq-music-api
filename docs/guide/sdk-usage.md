# SDK 函数式调用

除了启动 Koa HTTP 服务，`@sansenjian/qq-music-api` 也提供 Node.js 函数式调用入口，适合在已有后端项目中直接复用 QQ 音乐能力。

## 安装

```bash
npm install @sansenjian/qq-music-api
```

## 推荐入口

```ts
import { search, getMusicPlay, getLyric } from '@sansenjian/qq-music-api/sdk'

const searchResult = await search({
  key: '周杰伦',
  limit: 20,
  page: 1
})

const playResult = await getMusicPlay({
  songmid: '003rJSwm3TechU',
  quality: '320',
  cookie: 'uin=o123456; qqmusic_key=your-key'
})

const lyricResult = await getLyric({
  songmid: '003rJSwm3TechU',
  isFormat: true,
  cookie: 'uin=o123456; qqmusic_key=your-key'
})

console.log(searchResult, playResult, lyricResult)
```

## 登录二维码

```ts
import { getQQLoginQr, checkQQLoginQr } from '@sansenjian/qq-music-api/sdk'

const qr = await getQQLoginQr()
const result = await checkQQLoginQr({
  ptqrtoken: 123456,
  qrsig: 'qrsig-from-qr-response'
})
```

`checkQQLoginQr` 登录成功后会返回 session 信息，调用方可以自行保存 `session.cookie`，并在播放、歌词等依赖登录态的接口中通过 `cookie` 参数传入。

## 底层服务入口

如果需要完全复用原始 service 参数结构，可以直接导入 `services`：

```ts
import { getSearchByKey, getMusicPlay } from '@sansenjian/qq-music-api/services'

await getSearchByKey({
  method: 'get',
  params: {
    w: '周杰伦',
    n: 20,
    p: 1
  }
})

await getMusicPlay({
  method: 'get',
  params: {
    songmid: '003rJSwm3TechU',
    quality: '320'
  },
  option: {
    headers: {
      Cookie: 'uin=o123456; qqmusic_key=your-key'
    }
  }
})
```

## 与 HTTP 服务的关系

- `@sansenjian/qq-music-api` 默认入口仍然导出 Koa app，现有部署方式不变。
- `@sansenjian/qq-music-api/sdk` 不启动 HTTP 服务。
- `@sansenjian/qq-music-api/services` 面向需要底层参数控制的调用方，返回结构与现有 service 层保持一致。
