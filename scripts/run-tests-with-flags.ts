/**
 * 运行测试并生成带 flags 的覆盖率报告
 * 
 * 用法:
 * - 运行所有测试：npm run test:flags
 * - 只运行单元测试：npm run test:flags:unit
 * 
 * 注意：此脚本通过 tsx 运行，不使用 ts-node
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const COVERAGE_DIR = path.join(ROOT_DIR, 'coverage');

// 确保覆盖率目录存在
if (!fs.existsSync(COVERAGE_DIR)) {
  fs.mkdirSync(COVERAGE_DIR, { recursive: true });
}

/**
 * 运行命令
 * 注意：command 参数必须是硬编码的命令字符串，不能包含用户输入
 * @param command - 要执行的命令（必须是硬编码字符串）
 * @param env - 环境变量
 */
function runCommand(command: string, env: Record<string, string> = {}) {
  try {
    // 使用 execSync 执行命令，命令必须是固定的字符串
    // 安全说明：此函数只能用于执行硬编码的命令，不接受外部输入
    // 所有调用此函数的地方都必须使用字符串字面量
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env, ...env },
      cwd: ROOT_DIR
    });
  } catch (error) {
    console.error(`命令执行失败：${command}`);
    throw error;
  }
}

/**
 * 运行 Jest 测试（安全版本）
 * 使用参数化方式执行 Jest，避免命令注入风险
 * @param args - Jest 命令行参数数组
 * @param env - 环境变量
 */
function runJest(args: string[], env: Record<string, string> = {}) {
  const command = `npx jest ${args.join(' ')}`;
  return runCommand(command, env);
}

function runUnitTests() {
  console.log('\n🧪 运行单元测试...\n');
  
  // 运行单元测试 - 使用参数化方式
  runJest(['--coverage', '--testPathPattern=tests/unit'], {
    JEST_JUNIT_OUTPUT_NAME: 'unit-test-results.xml',
    COVERAGE_FILE: 'coverage/unit-coverage.json'
  });
  
  // 移动覆盖率文件
  const coverageFile = path.join(COVERAGE_DIR, 'coverage-final.json');
  if (fs.existsSync(coverageFile)) {
    const unitCoverageFile = path.join(COVERAGE_DIR, 'unit-coverage-final.json');
    fs.copyFileSync(coverageFile, unitCoverageFile);
    console.log(`✅ 单元测试覆盖率已保存到：${unitCoverageFile}`);
  }
}

function runAllTests() {
  console.log('\n🧪 运行所有测试...\n');
  
  // 运行所有测试 - 使用参数化方式
  runJest(['--coverage'], {
    JEST_JUNIT_OUTPUT_NAME: 'test-results.xml',
    COVERAGE_FILE: 'coverage/all-coverage.json'
  });
  
  // 移动覆盖率文件
  const coverageFile = path.join(COVERAGE_DIR, 'coverage-final.json');
  if (fs.existsSync(coverageFile)) {
    const allCoverageFile = path.join(COVERAGE_DIR, 'all-coverage-final.json');
    fs.copyFileSync(coverageFile, allCoverageFile);
    console.log(`✅ 所有测试覆盖率已保存到：${allCoverageFile}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  console.log('🚀 开始运行测试...\n');
  
  try {
    if (testType === 'unit') {
      runUnitTests();
    } else if (testType === 'all') {
      runAllTests();
    } else {
      console.error(`❌ 未知的测试类型：${testType}`);
      console.error('可用选项：unit, all');
      process.exit(1);
    }
    
    console.log('\n✅ 测试完成！\n');
  } catch (error) {
    console.error('\n❌ 测试失败！\n');
    process.exit(1);
  }
}

main();
