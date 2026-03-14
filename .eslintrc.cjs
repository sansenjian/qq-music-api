module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
    // 不启用 recommended-requiring-type-checking，避免过多的类型安全错误
  ],
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  rules: {
    // 允许 console.log（项目中有使用）
    'no-console': 'off',

    // 允许 any 类型（项目中有使用）
    '@typescript-eslint/no-explicit-any': 'off',

    // 允许非空断言
    '@typescript-eslint/no-non-null-assertion': 'off',

    // 允许未使用的变量（开发阶段常见）
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // 允许 require 导入（项目混合使用 import/require）
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off',

    // 允许隐式 any（项目中常见）
    '@typescript-eslint/no-inferrable-types': 'off',

    // 关闭类型安全检查（项目原有代码不符合严格类型安全）
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',

    // 允许全局变量声明使用 var（TypeScript 语法）
    'no-var': 'off'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js', // 忽略 JS 文件，只检查 TS
    '*.cjs', // 忽略 CJS 配置文件
    '.eslintrc.*', // 忽略 ESLint 配置文件
    'tests/' // 忽略测试文件，测试文件有自己的配置
  ]
}
