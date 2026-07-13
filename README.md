# 蓝海书库管理系统

一套基于 `React + Ant Design + Express + Prisma + PostgreSQL` 的图书管理系统，提供图书维护、借阅归还、用户管理、JWT 认证和角色权限控制。

## 技术栈

- 前端：`React`、`TypeScript`、`Vite`、`Ant Design`、`React Router v6`、`Zustand`、`Axios`
- 后端：`Express`、`TypeScript`、`Prisma`、`PostgreSQL`、`JWT`、`Zod`
- 工程化：`nodemon`、`tsx`、`ESLint`、`Prettier`、`Vitest`

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
- 公告管理：管理员发布公告，首页展示最新公告
- 审计日志：记录登录、图书、用户、借阅等关键操作
- 智能助手：支持图书查询、借阅确认、归还确认等 AI 辅助操作
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
POSTGRES_PORT=5432
DEEPSEEK_API_KEY=
JWT_SECRET=please-change-this-secret-to-a-32-char-random-string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
BORROW_LIMIT=5
BORROW_DAYS=14
```

> `DEEPSEEK_API_KEY`：DeepSeek 大模型 API 密钥，用于后端 AI 相关功能调用。该变量可留空，系统会正常启动，只有 AI 助手接口会返回“暂未配置”的提示。
> `JWT_SECRET`：JWT 签名密钥，生产环境必须替换为不少于 32 字符的随机字符串。
> 如果本机 5432 端口已有 PostgreSQL，可将 `POSTGRES_PORT` 改为 `5433`，并同步把 `DATABASE_URL` 中的端口改为 `5433`。

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

## 毕设材料

论文和答辩材料可直接引用 `doc-images/` 下的设计图，当前图表与系统实现保持一致：

- 系统架构图：`doc-images/architecture-diagram.png`
- 功能结构图：`doc-images/structure-diagram.png`
- 用例图：`doc-images/usecase-diagram.png`
- ER 图：`doc-images/er-diagram.png`
- 借阅流程图：`doc-images/borrow-flowchart.png`

### 系统截图

完成 `npm run dev` 后，可使用演示账号登录系统并截取以下页面作为论文或答辩材料：

1. 登录页：展示系统名称、登录/注册入口与演示账号。
2. 仪表盘：展示图书、借阅、逾期、用户统计和图表。
3. 图书管理页：展示图书检索、分页、新增、编辑、删除和借阅入口。
4. 借阅管理页：展示借阅记录、状态标签和归还操作。
5. 用户管理页：展示管理员用户维护、角色管理、禁用和重置密码。
6. 审计日志页：展示关键操作记录，体现系统可追踪性。

## 可用脚本

```bash
npm run dev              # 同时启动前后端开发环境
npm run dev:client       # 启动前端
npm run dev:server       # 启动后端
npm run build            # 构建前后端
npm run typecheck        # TypeScript 类型检查
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化代码
npm test                 # 运行 Vitest 测试
npm run check            # 类型检查 + 测试
npm run precommit        # 提交前检查（lint + typecheck）
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
npm run lint
npm run typecheck
npm test
npm run build
```

当前测试覆盖基础工具函数与 API 路由，包括健康检查、登录、注册校验、图书查询、管理员权限、借阅创建、仪表盘权限和 AI Key 缺失降级。

## 部署说明

### 本地部署

1. 安装 Node.js 20+、Docker Desktop。
2. 复制 `.env.example` 为 `.env`，至少配置 `DATABASE_URL` 和 `JWT_SECRET`。
3. 执行 `docker compose up -d` 启动 PostgreSQL。
4. 执行 `npm run prisma:generate && npm run prisma:migrate && npm run db:seed` 初始化数据库。
5. 执行 `npm run dev` 启动前后端开发环境。

### 生产部署

1. 准备 PostgreSQL 数据库，并将 `DATABASE_URL` 指向生产数据库。
2. 设置强随机 `JWT_SECRET`，推荐 32 字符以上。
3. 如需 AI 助手，配置 `DEEPSEEK_API_KEY`；不配置时系统其他模块仍可正常运行。
4. 执行 `npm ci && npm run prisma:generate && npm run build`。
5. 执行数据库迁移后，使用 Node 运行 `dist/api/server.js`，并将前端 `dist/` 作为静态资源部署到 Web 服务。

项目包含 `vercel.json`，可作为前端静态页面与 serverless API 的部署参考；正式部署时仍需准备可访问的 PostgreSQL 数据库和环境变量。

## Git Hooks（可选）

项目未内置 Git hooks，提交前可手动执行检查：

```bash
npm run precommit   # 等价于 npm run lint && npm run typecheck
```

如需在 `git commit` 时自动触发，可手动安装 [husky](https://typicode.github.io/husky/)：

```bash
npm install -D husky
npx husky init
echo "npm run precommit" > .husky/pre-commit
```
