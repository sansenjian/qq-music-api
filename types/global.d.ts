/**
 * 全局 UserInfo 类型定义
 * 用于 global.userInfo 的类型声明
 * 注意：实际运行时 userInfo 还包含 uin, cookieList, cookieObject 等属性
 */
export interface UserInfo {
  loginUin: string;
  uin?: string;
  cookie: string;
  cookieList: string[];
  cookieObject: Record<string, string>;
  refreshData: (cookie: string) => any;
  [key: string]: any; // 允许索引签名以支持其他动态属性
}

/**
 * 全局变量声明
 */
declare global {
  var userInfo: UserInfo;
}

/**
 * 导出类型供其他模块使用
 */
export type { UserInfo };
