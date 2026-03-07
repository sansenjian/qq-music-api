# 响应格式说明

本页用于说明当前 [`QQ Music API`](../index.md) 文档中可能出现的 2 类响应结构，帮助调用方理解历史接口与迁移后接口的差异。

## 为什么会有多种响应结构

项目当前处于 TypeScript 迁移与接口收敛阶段，因此文档中可能同时出现：

- 历史接口直接返回业务响应对象
- 新接口通过统一封装返回 `response` 或 `error` 字段

这属于当前版本的兼容性设计。

## 结构一：直接业务响应

部分接口直接返回上游业务对象，例如：

```json
{
	"code": 0,
	"msg": "success",
	"data": {}
}
```

这种结构常见于文档中的接口示例页，例如 [`docs/api/music.md`](../api/music.md) 中的示例。

## 结构二：统一封装响应

迁移后的部分接口会采用统一响应包装，例如：

```json
{
	"response": {
		"code": 0,
		"data": {}
	}
}
```

如果出现错误，也可能是：

```json
{
	"error": "error message"
}
```

## 如何理解当前行为

根据场景判断：

- 如果文档示例直接展示业务字段，一般代表接口主体返回的是上游业务对象
- 如果接口实现接入了统一响应封装，通常会返回 `response` 或 `error`

## 对调用方的建议

1. 调用接口时优先查看对应页面中的响应示例
2. 对新增或迁移中的接口，优先兼容 `response` 包裹结构
3. 调试异常时，同时关注 HTTP 状态码与 JSON 主体

## 与代码实现的关系

统一封装能力主要围绕以下代码组织：

- [`util/apiResponse.ts`](../../util/apiResponse.ts)
- [`routers/util.ts`](../../routers/util.ts)
- [`types/api.ts`](../../types/api.ts)

## 相关文档

- [快速开始](/guide/quickstart)
- [用户接口](/api/user)
- [代码架构](/guide/architecture)
