title: Git 提交信息前缀规则
tags: [技术、规范]
readTime: 2
time: 2026/06/09

# Git 提交信息前缀规则

在 Git 中，为了让提交历史清晰、可读且易于维护，开发者通常在提交信息前加上前缀，常见前缀及其含义如下：

- **feat**：新增功能（Feature），例如 feat: 添加用户登录功能
- **fix**：修复 Bug，例如 fix: 修复首页加载异常
- **docs**：文档更新，例如 docs: 更新 README
- **style**：代码格式修改，不影响功能，例如 style: 调整缩进和空格
- **refactor**：代码重构，没有新增功能或修复 Bug，例如 refactor: 优化用户模块结构
- **perf**：性能优化，例如 perf: 提升数据查询效率
- **test**：增加或更新测试代码，例如 test: 添加登录模块单元测试
- **chore**：杂项改动，如更新依赖、配置文件或脚本，例如 chore: 更新打包配置
- **ci**：持续集成相关修改，例如 ci: 更新 GitHub Actions 配置
- **revert**：回滚某次提交，例如 revert: 回滚上次合并
- **wip**：工作进行中（Work In Progress），表示尚未完成的功能，例如 wip: 开发用户注册功能
- **merge**：合并分支，例如 merge: 合并 feature/login 分支
- **update**：更新内容或依赖，例如 update: 升级依赖包版本

> 使用这些前缀时，通常在前缀后加冒号和简要描述，第一行保持简洁明了，必要时在后续行添加详细说明。遵循这些规范可以提升团队协作效率、便于生成 CHANGELOG，并帮助追踪问题和版本管理。