# 🏗️ Architecture.md - 中药材B2B平台 (Prototype)

This document outlines the file structure, component responsibilities, and service interactions for the B2B Chinese medicine trading platform prototype built with **Next.js** and **Supabase**.

---

## 1. 📁 文件与文件夹架构
/chinese-medicine-b2b
├── public/ # 静态资源：图标、图片等
├── styles/ # 全局样式（Tailwind 或 CSS modules）
│ └── globals.css
├── components/ # 通用 UI 组件
│ ├── Navbar.tsx
│ ├── ProductCard.tsx
│ ├── ProductForm.tsx
│ └── OrderTable.tsx
├── pages/ # Next.js 路由
│ ├── index.tsx # 首页（产品浏览页）
│ ├── login.tsx # 登录页
│ ├── register.tsx # 注册页
│ ├── dashboard/ # 用户仪表盘（根据角色不同）
│ │ ├── index.tsx # 仪表盘首页（订单/产品管理）
│ │ ├── orders.tsx # 查看订单（买家/卖家视角）
│ │ └── create.tsx # 创建产品（仅供卖家）
│ ├── product/ # 产品详情页
│ │ └── [id].tsx
│ └── api/ # API 路由（如需自定义服务）
├── utils/ # 工具函数或 Supabase 实例
│ ├── supabaseClient.ts # Supabase 初始化实例
│ └── authHelpers.ts # 登录状态检查等
├── context/ # 全局状态管理（React Context）
│ └── UserContext.tsx # 储存当前用户信息及角色
├── .env.local # Supabase Key 和 URL 环境变量
├── tailwind.config.js # Tailwind CSS 配置
├── tsconfig.json # TypeScript 配置
└── package.json # 项目依赖列表


---

## 2. 🧩 各部分功能说明

| 文件夹 | 功能描述 |
|--------|----------|
| `/components/` | 页面可复用组件，如产品卡片、导航栏、订单表格 |
| `/pages/` | 所有页面路由入口，符合 Next.js 的文件即页面规则 |
| `/pages/dashboard/` | 用户登录后仪表盘，包括订单和产品管理页面 |
| `/pages/api/` | 可选：自定义 API 接口，如复杂订单处理逻辑 |
| `/product/[id].tsx` | 产品详情页，通过动态路由展示单一产品 |
| `/utils/supabaseClient.ts` | 初始化 Supabase 实例，全项目共享调用 |
| `/context/UserContext.tsx` | 登录后保存用户信息（包括角色 buyer/seller） |
| `/styles/` | 全局 CSS 或 Tailwind 配置 |
| `.env.local` | 保存 Supabase 的匿名公钥与 URL，不应提交到 Git |

---

## 3. 🔗 状态存储与服务连接

### 🟢 身份验证（Authentication）
- 使用 **Supabase Auth** 完成邮箱+密码登录注册
- 登录成功后，从 Supabase 用户表中查询角色（buyer/seller）并储存于 `UserContext`
- 角色信息通过中间件保护路由访问权限（如 `/dashboard/create` 仅限 seller）

### 🟢 数据存储（Database）
使用 Supabase 的 Postgres 数据库，表结构示意如下：

#### `users` 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | UUID | Supabase 用户 ID |
| role | ENUM ('buyer', 'seller') | 用户身份 |
| business_name | TEXT | 企业名 |
| created_at | TIMESTAMP | 注册时间 |

#### `products` 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL | 产品 ID |
| seller_id | UUID | 对应卖家的用户 ID |
| name_cn | TEXT | 中文名 |
| name_en | TEXT | 英文名 |
| price | NUMERIC | 单价（元/kg） |
| image_url | TEXT | 产品图片 |
| description | TEXT | 简介 |
| stock | INT | 库存数量 |

#### `orders` 表
| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL | 订单 ID |
| buyer_id | UUID | 买家 ID |
| seller_id | UUID | 卖家 ID |
| total_amount | NUMERIC | 总金额 |
| status | ENUM('submitted', 'shipped') | 订单状态 |
| created_at | TIMESTAMP | 下单时间 |

#### `order_items` 表
| 字段 | 类型 | 描述 |
|------|------|------|
| order_id | INT | 对应订单 |
| product_id | INT | 产品 ID |
| quantity | INT | 数量 |
| unit_price | NUMERIC | 下单时单价 |

### 🟡 全局状态管理
- 使用 `UserContext` 提供用户信息、登录状态、身份（buyer/seller）
- 组件通过 `useContext` 获取当前用户信息用于展示/权限控制

---

## 4. 🔌 服务连接示意图

```text
 [Frontend (Next.js)]
       |
       |  🔐 Login/Register (Supabase Auth)
       v
 [Supabase Auth] <———> [UserContext.tsx]
       |
       |  📦 Product CRUD / Order Flow
       v
 [Supabase Database]
   ├── users
   ├── products
   ├── orders
   └── order_items

