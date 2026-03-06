// 测试工具函数

import Koa from 'koa';

/**
 * 创建测试用的 Koa 应用实例
 */
export function createTestApp(): Koa {
  return new Koa();
}

/**
 * 等待指定毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Mock 响应数据生成器
 */
export function createMockResponse<T>(data: T, code: number = 0) {
  return {
    code,
    data,
    message: code === 0 ? 'success' : 'error',
  };
}
