# NebulaHub 橙光

你的实用型编程伙伴 - 基于智能服务的个性化编程学习平台。

## 项目简介

NebulaHub 橙光 是一个帮助编程学习者快速成长的智能平台，提供：

- 🤖 **AI个性化学习路径**：根据你的水平和目标，AI生成定制化学习计划
- 💬 **智能编程问答**：随时向AI提问，获得即时解答
- 📊 **学习进度追踪**：记录学习时长、课程进度和成就解锁
- 🎯 **技能评估系统**：从入门到进阶，系统化提升编程技能

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI组件**: Radix UI + Tailwind CSS
- **后端服务**: Spring Boot 3.2.2 + Java 21
- **认证服务**: JWT (Spring Security)
- **数据库**: PostgreSQL
- **对象存储**: MinIO (S3-compatible)
- **AI服务**: MiniMax API (可替换为其他LLM)
- **开发语言**: TypeScript

## 项目结构

```
NebulaHub/
├── src/
│   ├── app/                    # Next.js App Router页面
│   │   ├── (auth)/            # 认证相关页面
│   │   │   ├── login/         # 登录页
│   │   │   ├── register/      # 注册页
│   │   │   └── ...
│   │   ├── (dashboard)/       # 仪表板页面
│   │   │   ├── dashboard/     # 主仪表板
│   │   │   ├── chat/          # AI对话
│   │   │   ├── learning/      # 学习路径
│   │   │   └── ...
│   │   ├── auth/              # 认证回调处理
│   │   └── api/               # API路由
│   ├── components/            # React组件
│   │   ├── ui/               # 基础UI组件
│   │   └── ...
│   ├── lib/                   # 工具函数和配置
│   │   ├── api/              # API客户端
│   │   └── ...
│   ├── hooks/                 # 自定义Hooks
│   └── types/                 # TypeScript类型定义
├── db/                        # 数据库配置
│   └── schema/                # 数据库Schema
│       └── schema_nebulahub.sql
├── public/                     # 静态资源
└── .env.local                  # 环境变量（本地）
```

## 快速开始

### 1. 环境要求

- Node.js 18.17+
- npm / yarn / pnpm
- PostgreSQL 数据库
- MinIO 对象存储服务

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

**必需的环境变量**：

```env
# 后端API地址
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# MinIO 存储配置
NEXT_PUBLIC_MINIO_ENDPOINT=your-minio-endpoint
NEXT_PUBLIC_MINIO_BUCKET=user-uploads

# AI服务配置（可选：使用MiniMax）
NEXT_PUBLIC_MINIMAX_API_KEY=你的MiniMax API Key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 主要功能

### 用户认证
- 邮箱/密码注册和登录
- JWT Token 认证
- 安全的 Cookie 存储

### 仪表板
- 欢迎信息和学习统计
- 最近课程进度
- AI个性化推荐

### AI对话
- 基于MiniMax的智能编程问答
- 代码解释和调试帮助

### 学习路径
- AI生成个性化学习计划
- 技能等级评估
- 成就系统

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | ✅ | Spring Boot 后端API地址 |
| `NEXT_PUBLIC_MINIO_ENDPOINT` | ✅ | MinIO 存储服务地址 |
| `NEXT_PUBLIC_MINIO_BUCKET` | ❌ | MinIO 存储桶名称 |
| `NEXT_PUBLIC_MINIMAX_API_KEY` | ❌ | MiniMax API Key |
| `NEXT_PUBLIC_AI_MODEL` | ❌ | 使用的AI模型（默认：MiniMax） |

## 部署

### Vercel（推荐）

1. 将项目推送到GitHub
2. 在Vercel中导入项目
3. 添加环境变量
4. 部署

### Docker

```bash
docker build -t NebulaHub .
docker run -p 3000:3000 NebulaHub
```

## 开发说明

### 代码规范

- 使用TypeScript进行类型检查
- 遵循React Hooks规范
- 使用ESLint和Prettier格式化代码

### 添加新功能

1. 创建对应的页面在 `src/app/` 下
2. 创建UI组件在 `src/components/` 下
3. 创建数据库表（如果需要）在 `db/schema/` 中
4. 添加环境变量到 `.env.local.example`

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
