---
title: Git 提交规范
slug: git-commit-convention
date: 2026-10-15
tags: [技术, 前端, Git]
readTime: 18
---

# Git 提交规范

## 一、规范概念

`Conventional Commits`(约定式提交) —— 开放式规范，其让提交信息变成`机器可读`的，从而拥有一些自动化能力

| 自动化能力          | 说明                                            |
|----------------|-----------------------------------------------|
| 生成 CHANGELOG   | feat -> 新功能章节, fix -> Bug 修复章节                |
| 自动升版本号(SemVer) | 见下方规则                                         |
| 自动发布           | semantic-realease：提交推上去，自动打 tag、发 npm/maven 包 |
| PR 审查过滤        | docs：提交可跳过 CI 跑测试                             |

`SemVer 自动推导规则`

```rich
有 BREAKING CHANGE    -> major + 1   (x.0.0)
有 feat               -> minor + 1   (0.x.0)
只有 fix              -> patch + 1   (0.0.x)
其余（chore/docs/...） -> 不升版本
```
## 二、格式解剖

```rich
type(scope): subject
                    ↑
              空行（有body时）
body（可选，说明"为什么"而不是"做了什么"）
footer（可选，说明  BREAKING CHANGE / 关联的 issue）    
```

**完整示例**

```rich
feat(llm): /api/chat/completions 支持 OPENAI 兼容 SSE 流式

之前 stream：true 时返回的是自定义 StreamEvent 格式，与 OpenAI 客户端不兼容，导致 LangChain / openai-python SDK 无法直连。

改为标准 chat.completion.chunk 帧：
- content/tool_calls 均在 delta 中透传
- 末尾补 usage 帧 + data: [DONE]
- 客户端断开时关闭上游 HTTP 连接，避免浪费 token

BREAKING CHANGE: SSE 事件格式变更，旧的 StreamEvent 消费端需适配
```

**注意 subject（第一行）的写法约束：**
- **不加句号**（末尾不写 。 或 .）
- 用祈使语气（"支持..."、"修复..."、"移除..."），不是"被支持了"
- **不超过 50 字符**（超过说明你塞了太多东西，应该拆提交）
- **不以大写开头**（除非是专有名词如 Agent、LLM）

## 三、类型全表 + 判断标准

1. 核心三类（最常用，占 90%）

    | 类型       | 何时用            | 判断标准           |
    |----------|----------------|----------------|
    | feat     | 新增**用户可感知**的功能 | 代码能干以前干不了的事    |
    | fix      | 修复 Bug         | 现有功能的行为被修正     |
    | refactor | 重构，**行为不变**    | 代码更好了，但用户看不出区别 |

2. 辅助类

    | 类型     | 何时用          | 典型场景                         |
    |--------|--------------|------------------------------|
    | docs   | 更新文档         | README、注释、docs/ 目录           |
    | style  | 代码风格调整       | 空格、缩进、分号（主要JS、Python）        |
    | perf   | 性能优化         | 优化 SQL、加缓存、减少 token 调用       |
    | test   | 只改测试         | 加测试用例、修断言                    |
    | build  | 构建系统/外部依赖变更  | pom.xml、Dockfile、Gradle 脚本   |
    | ci     | CI/CD 配置     | .github/workflow、Jenkinsfile |
    | chore  | 杂物、不改源码、不改构建 | 清理文件、更新 .gitignore、格式化配置     |
    | revert | 回滚某次提交       | git revert 自动加的              |

**scope(括号里的部分)：可选，但强烈建议加**

**作用**：标明改动**影响哪个模块**。可以按照模块筛选提交。

项目中适合的 scope ：

```rich
feat(agent)      → agent/ 包（ReActAgent、SimpleAgent、ToolRegistry）
feat(eval)       → eval/ 包（EvalRunner、Scorer）
feat(sse)        → SSE 相关（BaseLLMAdapter.stream、ChatController）
feat(rate-limit) → observability/ 限流
fix(session)     → agent/session/
chore(build)     → pom.xml、mvnw
docs(readme)     → README.md
```