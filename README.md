# 中药材B2B平台

基于 Next.js 和 Supabase 构建的中药材批发交易平台原型。

## 功能特性

- 🔐 用户注册与登录（买家/卖家角色）
- 📦 产品浏览与管理
- 🛒 购物车与订单系统
- 📊 订单管理仪表盘
- 🔒 基于角色的权限控制

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + RLS)
- **部署**: Vercel (推荐)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd chinese-medicine-b2b
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase-init.sql` 脚本
3. 复制项目的 URL 和 anon key
4. 更新 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                 # Next.js App Router 页面
│   ├── login/          # 登录页
│   ├── register/       # 注册页
│   └── dashboard/      # 用户仪表盘（待实现）
├── components/         # 可复用组件（待实现）
├── utils/             # 工具函数
│   ├── supabaseClient.ts  # Supabase 客户端
│   └── authHelpers.ts     # 认证辅助函数
└── context/           # React Context（待实现）
```

## 数据库结构

- `users` - 用户扩展信息
- `products` - 产品信息
- `orders` - 订单
- `order_items` - 订单项

详细结构请参考 `supabase-init.sql`。

## 开发进度

- [x] 项目初始化
- [x] Supabase 配置
- [x] 用户注册与登录
- [ ] 用户上下文管理
- [ ] 产品管理
- [ ] 购物车功能
- [ ] 订单系统
- [ ] 权限控制

## 测试账号

开发阶段可使用以下测试账号：

- 买家: `buyer@test.com` / `123456`
- 卖家: `seller@test.com` / `123456`

## 部署

推荐使用 Vercel 部署：

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License
