# Codecov Flags 配置说明

## 概述

本项目使用 Codecov Flags 来区分和管理不同类型的测试覆盖率报告。

## 可用的 Flags

| Flag 名称 | 描述 | 测试路径 | 覆盖率要求 |
|-----------|------|----------|------------|
| `unit` | 单元测试 | `tests/unit/` | 项目：50%，补丁：80% |

## 本地运行测试

### 运行所有测试

```bash
npm run test:coverage
```

### 只运行单元测试

```bash
npm run test:unit
```

### 运行带 flags 的测试

```bash
# 运行所有测试并生成 flags 报告
npm run test:flags

# 只运行单元测试并生成 flags 报告
npm run test:flags:unit
```

## CI/CD 集成

GitHub Actions 会自动：
1. 运行所有测试
2. 生成覆盖率报告
3. 上传到 Codecov 并标记为 `unit` flag

## Codecov 配置

配置文件位于 `codecov.yml`，主要配置项：

```yaml
codecov:
  require_ci_to_pass: true
  branch: main

coverage:
  status:
    project:
      default:
        flags:
          - unit
    patch:
      default:
        flags:
          - unit
  
  flags:
    unit:
      carryforward: false
      statuses:
        - type: project
          target: 50%
          threshold: 1%
        - type: patch
          target: 80%
          threshold: 5%
```

## 查看覆盖率报告

1. 访问 Codecov 项目页面
2. 选择具体的 PR 或提交
3. 在 "Flags" 标签页查看不同测试类型的覆盖率

## 添加新的 Flag

如果需要添加新的测试类型（如集成测试、E2E 测试）：

1. 在 `codecov.yml` 中添加新的 flag 配置
2. 创建对应的测试脚本
3. 更新 GitHub Actions workflow
4. 更新本文档

## 故障排除

### 覆盖率上传失败

- 检查 `CODECOV_TOKEN` 是否正确配置
- 确认覆盖率文件路径正确
- 查看 GitHub Actions 日志获取详细错误

### 覆盖率阈值不通过

- 运行 `npm run test:coverage` 查看详细的覆盖率报告
- 检查哪些文件未达到覆盖率要求
- 补充相应的测试用例
