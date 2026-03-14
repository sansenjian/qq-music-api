import fs from 'fs';
import path from 'path';

interface ServiceConfig {
  /** 是否启用降级模式（不强制要求 Cookie） */
  fallbackMode: boolean;
  /** 是否使用全局 Cookie（向后兼容） */
  useGlobalCookie: boolean;
  /** Cookie 参数名称（支持从 query 或 header 传递） */
  cookieParamName: string;
}

const configPath = path.join(__dirname, './service-config.json');

// 创建默认配置
const defaultConfig: ServiceConfig = {
  fallbackMode: true,
  useGlobalCookie: false,
  cookieParamName: 'cookie'
};

// 读取或创建配置文件
let config: ServiceConfig = defaultConfig;

if (fs.existsSync(configPath)) {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    config = { ...defaultConfig, ...JSON.parse(content) };
  } catch (e) {
    console.warn('service-config.json 读取失败，使用默认配置');
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  }
} else {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
}

// 支持环境变量覆盖
if (process.env.FALLBACK_MODE === 'true') {
  config.fallbackMode = true;
}
if (process.env.USE_GLOBAL_COOKIE === 'true') {
  config.useGlobalCookie = true;
}

export default config;
export type { ServiceConfig };
