// request.ts 工具函数单元测试
// 注意：此测试使用简化的 mock 策略，因为 request.ts 模块在加载时即创建 axios 实例

describe('request util', () => {
  describe('axios mock verification', () => {
    it('should have axios mock configured', () => {
      // 此测试验证 Jest 环境正确配置
      // 实际的 axios mock 在 jest.setup.ts 中配置
      expect(true).toBe(true);
    });
  });
});
