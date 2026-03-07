# 代码架构说明

本文档介绍项目的代码架构和抽象设计。

## 代码抽象

为了提高代码的可维护性和开发效率，项目进行了以下代码抽象：

### 1. 统一的 API 类型定义

**文件位置**: [`types/api.ts`](../../types/api.ts)

定义了项目中所有 API 函数使用的通用类型：

```typescript
// API 响应结构
export interface ApiResponse {
  status: number;
  body: {
    response?: any;
    error?: any;
    message?: string;
    isOk?: boolean;
    refresh?: boolean;
    data?: any;
    [key: string]: any;
  };
}

// API 函数参数选项
export interface ApiOptions {
  method?: string;
  params?: Record<string, any>;
  option?: any;
  isFormat?: boolean | string;
  [key: string]: any;
}

// API 函数类型定义
export type ApiFunction<T extends ApiOptions = ApiOptions> = (
  options: T
) => Promise<ApiResponse>;
```

**优势**：
- ✅ 单一事实来源，避免重复定义
- ✅ 类型安全，减少类型错误
- ✅ 易于维护和修改

### 2. API 响应工具函数

**文件位置**: [`util/apiResponse.ts`](../../util/apiResponse.ts)

提供了统一的 API 响应处理工具：

#### `successResponse(data, status?)`
创建成功的 API 响应

```typescript
import { successResponse } from './util/apiResponse';

// 使用示例
const response = successResponse({ id: 1, name: 'test' });
// 返回：{ status: 200, body: { response: { id: 1, name: 'test' } } }
```

#### `errorResponse(error, status?)`
创建错误的 API 响应

```typescript
import { errorResponse } from './util/apiResponse';

// 使用示例
const response = errorResponse('Not found', 404);
// 返回：{ status: 404, body: { error: 'Not found' } }
```

#### `handleApi(promise, options?)`
处理 API Promise，自动包装成功和错误响应

```typescript
import { handleApi } from './util/apiResponse';
import request from './request';

// 基本使用
export default async (options: ApiOptions) => {
  return handleApi(
    request({
      url: '/api/endpoint',
      method: options.method,
      options: options.params
    })
  );
};

// 带数据转换
export default async (options: ApiOptions) => {
  return handleApi(
    request({ url: '/api/endpoint', method: options.method }),
    {
      transformData: (data) => {
        // 处理数据
        return data.result;
      }
    }
  );
};
```

**优势**：
- ✅ 消除重复的 try-catch 代码
- ✅ 统一的错误处理
- ✅ 代码更简洁，每个 API 文件减少约 15-20 行代码

### 3. Controller 工厂函数

**文件位置**: [`routers/util.ts`](../../routers/util.ts)

提供了创建 Controller 的工厂函数：

#### `createController(apiFunction, options?)`
创建 GET 请求的 Controller

```typescript
import { createController, validateRequired } from './util';
import { getSingerDesc } from '../../module';

// 基本使用
export default createController(getSingerDesc);

// 带参数验证
export default createController(
  getSingerDesc,
  {
    validator: validateRequired(['singermid']),
    errorMessage: '缺少 singermid 参数'
  }
);
```

#### `createPostController(apiFunction, options?)`
创建 POST 请求的 Controller

```typescript
import { createPostController } from './util';
import { batchGetSongLists } from '../../module';

export default createPostController(batchGetSongLists);
```

#### `validateRequired(fields)`
参数验证工具

```typescript
import { createController, validateRequired } from './util';

export default createController(
  someApiFunction,
  {
    validator: validateRequired(['singermid', 'songmid'])
  }
);
```

**优势**：
- ✅ 减少 Controller 代码重复
- ✅ 统一的错误处理
- ✅ 参数验证标准化

### 4. 统一的全局类型

**文件位置**: [`types/global.d.ts`](../../types/global.d.ts)

定义了全局 `userInfo` 对象的类型：

```typescript
export interface UserInfo {
  loginUin: string;
  uin?: string;
  cookie: string;
  cookieList: string[];
  cookieObject: Record<string, string>;
  refreshData: (cookie: string) => any;
  [key: string]: any;
}

declare global {
  var userInfo: UserInfo;
}
```

**优势**：
- ✅ 类型定义集中管理
- ✅ 避免类型冲突
- ✅ 全局类型安全

## 重构前后对比

### 重构前（旧代码）

```typescript
import request from '../../../util/request';

export interface ApiOptions {
  method?: string;
  params?: Record<string, any>;
  option?: any;
}

export interface ApiResponse {
  status: number;
  body: {
    response?: any;
    error?: any;
  };
}

export default ({ method = 'get', params = {}, option = {} }: ApiOptions): Promise<ApiResponse> => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8'
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return request({
    url: '/api/endpoint',
    method,
    options
  })
    .then(res => {
      const response = res.data;
      return {
        status: 200,
        body: {
          response
        }
      };
    })
    .catch(error => {
      console.log('error', error);
      return {
        status: 500,
        body: {
          error
        }
      };
    });
};
```

**代码行数**: 约 35 行

### 重构后（新代码）

```typescript
import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8'
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/api/endpoint',
      method,
      options
    })
  );
};
```

**代码行数**: 约 18 行

**改进**：
- ✅ 减少 17 行代码（减少约 48%）
- ✅ 移除重复的类型定义
- ✅ 移除重复的 try-catch 逻辑
- ✅ 使用 async/await 语法更清晰

## Controller 重构示例

### 重构前

```typescript
import { Context, Next } from 'koa';
import { getSingerDesc } from '../../module';

export default async (ctx: Context, next: Next) => {
  const { singermid } = ctx.query;
  const props = {
    method: 'get',
    params: {
      singermid
    },
    option: {}
  };
  
  if (singermid) {
    const { status, body } = await getSingerDesc(props);
    Object.assign(ctx, { status, body });
  } else {
    ctx.status = 400;
    ctx.body = {
      response: 'no singermid'
    };
  }
};
```

### 重构后

```typescript
import { createController, validateRequired } from './util';
import { getSingerDesc } from '../../module';

export default createController(
  getSingerDesc,
  {
    validator: validateRequired(['singermid']),
    errorMessage: 'no singermid'
  }
);
```

**改进**：
- ✅ 从 25 行减少到 8 行
- ✅ 参数验证逻辑抽象
- ✅ 错误处理统一

## 已重构的文件

### Module/APIs 目录（16 个文件）

- `module/apis/singers/getSimilarSinger.ts`
- `module/apis/singers/getSingerDesc.ts`
- `module/apis/singers/getSingerMv.ts`
- `module/apis/singers/getSingerStarNum.ts`
- `module/apis/radio/getRadioLists.ts`
- `module/apis/rank/getTopLists.ts`
- `module/apis/music/getLyric.ts`
- `module/apis/mv/getMvByTag.ts`
- `module/apis/digitalAlbum/getDigitalAlbumLists.ts`
- `module/apis/search/getHotKey.ts`
- `module/apis/search/getSearchByKey.ts`
- `module/apis/songLists/songLists.ts`
- `module/apis/songLists/songListCategories.ts`
- `module/apis/songLists/songListDetail.ts`
- `module/apis/album/getAlbumInfo.ts`
- `module/apis/comments/getComments.ts`

### Routers/Context 目录（部分文件）

- `routers/context/getDownloadQQMusic.ts`
- `routers/context/getSmartbox.ts`
- `routers/context/cookies.ts`

### 其他文件

- `routers/types.ts` - 移除重复类型定义
- `config/user-info.ts` - 统一类型定义
- `app.ts` - 类型修复
- `module/config.ts` - 类型修复

## 统计

- **代码量减少**: 约 30-40% 的重复代码被移除
- **类型安全**: 统一的类型定义减少类型错误
- **可维护性**: 类型定义集中，易于修改
- **开发效率**: 新增 API 时代码更简洁

## 最佳实践

### 1. 创建新的 API 函数

```typescript
import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
  const data = Object.assign(params, {
    // 添加默认参数
    format: 'json',
    outCharset: 'utf-8'
  });
  
  const options = Object.assign(option, {
    params: data
  });
  
  return handleApi(
    request({
      url: '/api/endpoint',
      method,
      options
    }),
    {
      // 可选：数据转换
      transformData: (data) => {
        return data.result;
      }
    }
  );
};
```

### 2. 创建新的 Controller

```typescript
import { createController, validateRequired } from './util';
import { someApiFunction } from '../../module';

// 简单情况
export default createController(someApiFunction);

// 需要参数验证
export default createController(
  someApiFunction,
  {
    validator: validateRequired(['requiredParam1', 'requiredParam2']),
    errorMessage: '缺少必需参数'
  }
);
```

### 3. 处理特殊响应

```typescript
import { handleApi, customResponse } from '../../../util/apiResponse';

export default async (options: ApiOptions) => {
  try {
    const result = await request({ url: '/api/endpoint' });
    return handleApi(Promise.resolve(result));
  } catch (error) {
    // 自定义错误响应
    return customResponse({
      message: 'Custom error message',
      code: 'CUSTOM_ERROR'
    }, 500);
  }
};
```

## 迁移指南

如果你需要将旧的 API 文件迁移到新的架构：

1. **移除重复的类型定义**
   ```typescript
   // 删除这些定义
   export interface ApiOptions { ... }
   export interface ApiResponse { ... }
   ```

2. **导入统一的类型和工具**
   ```typescript
   import { handleApi } from '../../../util/apiResponse';
   import type { ApiOptions } from '../../../types/api';
   ```

3. **重构为 async/await 语法**
   ```typescript
   // 旧代码
   return request(...).then(...).catch(...);
   
   // 新代码
   return handleApi(request(...));
   ```

4. **测试验证**
   ```bash
   npx tsc --noEmit
   npm run dev
   ```

## 总结

通过代码抽象，我们实现了：

- ✅ **统一的类型系统** - 所有 API 使用相同的类型定义
- ✅ **一致的错误处理** - 统一的 try-catch 模式
- ✅ **简洁的代码结构** - 减少 30-40% 的重复代码
- ✅ **更好的可维护性** - 类型定义集中管理
- ✅ **更高的开发效率** - 新增 API 时代码更简洁

这些改进使得项目更易于维护和扩展，同时也提高了开发效率。
