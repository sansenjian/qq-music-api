#!/usr/bin/env node

/**
 * 生成 version.json 文件（用于文档站点）
 * 从 package.json 读取版本号，生成文档站点的版本信息
 * 输出位置：docs/public/version.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 读取 package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// 获取 Git 信息（如果可用）
let commitSha = null;
let branchName = null;

try {
  commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
  // 非 Git 环境或 Git 不可用
}

try {
  branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
  // 非 Git 环境或 Git 不可用
}

// 生成 version.json 内容
const versionJson = {
  version: packageJson.version,
  name: packageJson.name,
  generatedAt: new Date().toISOString(),
  ...(commitSha && { commit: commitSha }),
  ...(branchName && { branch: branchName })
};

// 写入到 docs/public 目录
const docsPublicPath = path.join(__dirname, '..', 'docs', 'public');
const versionJsonPath = path.join(docsPublicPath, 'version.json');

// 确保目录存在
if (!fs.existsSync(docsPublicPath)) {
  fs.mkdirSync(docsPublicPath, { recursive: true });
}

// 写入文件
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2), 'utf-8');

console.log(`✅ version.json generated: ${versionJsonPath}`);
console.log(`   Version: ${versionJson.version}`);
console.log(`   Generated At: ${versionJson.generatedAt}`);
if (commitSha) {
  console.log(`   Commit: ${commitSha}`);
}
if (branchName) {
  console.log(`   Branch: ${branchName}`);
}
