// Jest 测试环境设置文件
// 扩展 Jest 的 expect 断言

// 设置测试超时时间
jest.setTimeout(10000);

// 抑制测试中的 console.log 输出（可选）
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
