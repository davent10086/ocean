# 蓝海书库管理系统

一套基于 `React + Ant Design + Express + Prisma + PostgreSQL` 的图书管理系统，提供图书维护、借阅归还、用户管理、JWT 认证和角色权限控制。

## 技术栈

- 前端：`React`、`TypeScript`、`Vite`、`Ant Design`、`React Router v6`、`Zustand`、`Axios`
- 后端：`Express`、`TypeScript`、`Prisma`、`PostgreSQL`、`JWT`、`Zod`
- 工程化：`nodemon`、`ts-node`、`ESLint`、`Prettier`、`Vitest`

## 功能概览

- 统一响应格式：`{ success: boolean, data?: any, message?: string }`
- 环境变量管理：`dotenv`
- 安全中间件：`Helmet`、`CORS`
- 认证授权：JWT 鉴权中间件 + 管理员/成员角色控制
- 参数校验：`Zod`
- 错误处理：统一错误处理中间件
- 图书管理：搜索、分页、新增、编辑、删除
- 借阅管理：借书、归还、借阅上限检查、重复借阅检查、库存不足提示
- 用户管理：管理员创建账号、查看角色与创建时间
- 蓝色海洋主题：Ant Design `ConfigProvider` 全局主题定制

## 项目结构

```text
.
├─ src/                  # React 前端
├─ api/                  # Express 后端
├─ prisma/               # Prisma schema、迁移、seed
├─ shared/               # 前后端共享类型
├─ .env.example          # 环境变量示例
└─ docker-compose.yml    # PostgreSQL 快速启动
```

## 环境变量

复制 `.env.example` 为 `.env`，并根据实际环境调整：

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blue_ocean_library
JWT_SECRET=please-change-this-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
BORROW_LIMIT=5
BORROW_DAYS=14
```

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 PostgreSQL

如果本地没有 PostgreSQL，可直接使用 Docker：

```bash
docker compose up -d
```

### 3. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 4. 执行迁移

```bash
npm run prisma:migrate
```

### 5. 初始化演示数据

```bash
npm run db:seed
```

### 6. 启动开发环境

```bash
npm run dev
```

- 前端地址：`http://localhost:5173`
- 后端地址：`http://localhost:3001`

## 演示账号

- 管理员：`admin@blueocean.local` / `Admin123!`
- 成员：`member@blueocean.local` / `Member123!`

## 可用脚本

```bash
npm run dev              # 同时启动前后端开发环境
npm run dev:client       # 启动前端
npm run dev:server       # 启动后端
npm run build            # 构建前后端
npm run typecheck        # TypeScript 类型检查
npm run lint             # ESLint 检查
npm test                 # 运行 Vitest 测试
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:migrate   # 执行开发迁移
npm run db:seed          # 初始化种子数据
```

## 构建产物

- 前端构建输出：`dist/`
- 后端构建输出：`dist/api/`

## 当前验证

以下命令已通过：

```bash
npm run typecheck
npm test
npm run build
```
