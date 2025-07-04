# tasks.md - MVP 构建分步任务清单 (B2B中药材平台)

目标：构建一个支持买家浏览、卖家上传、下单和订单查看的 B2B 平台 Demo，基于 Next.js + Supabase。

---

## ✅ Step 1: 初始化 Supabase 与数据库结构
- 创建 Supabase 项目
- 创建以下数据库表：
  - `users`（包含 id, role, business_name 等字段）
  - `products`（包含 id, name_cn, price, image_url, stock, seller_id 等）
  - `orders`（包含 id, buyer_id, total_amount, status）
  - `order_items`（包含 order_id, product_id, quantity, unit_price）
- 创建 RLS 规则，确保数据权限合理（只允许当前用户读取自己相关订单）

---

## ✅ Step 2: 配置 Supabase 客户端
- 在项目中创建 `utils/supabaseClient.ts`
- 使用 `@supabase/supabase-js` 初始化客户端
- 将 API Key 和 URL 放入 `.env.local` 中

---

## ✅ Step 3: 实现注册与登录页
- 创建 `pages/register.tsx` 和 `pages/login.tsx`
- 支持邮箱+密码注册登录
- 注册时要求选择角色（buyer/seller）并填写企业名，写入 `users` 表

---

## ✅ Step 4: 创建用户上下文
- 创建 `context/UserContext.tsx`
- 登录成功后拉取用户信息并存入 Context
- 提供 `useUser()` hook，供页面访问当前用户状态

---

## ✅ Step 5: 创建卖家上传产品功能
- 创建 `pages/dashboard/create.tsx`
- 表单字段：中药名、价格、库存、图片上传（可先 mock）
- 提交后将数据写入 `products` 表，并关联当前登录卖家

---

## ✅ Step 6: 创建产品浏览页
- 实现 `pages/index.tsx`
- 拉取所有产品（含卖家信息），展示产品卡片（`ProductCard.tsx`）
- 支持点击跳转产品详情页 `/product/[id]`

---

## ✅ Step 7: 实现购物车与下单功能
- 创建购物车状态（用 `useState` 或 `useContext` 实现）
- 商品详情页可添加商品到购物车
- 创建结算页，填写数量并点击提交订单
- 提交后创建一条订单及其多个 `order_items` 子项

---

## ✅ Step 8: 创建订单管理页
- 创建 `pages/dashboard/orders.tsx`
- 买家视角：展示我下的订单、状态
- 卖家视角：展示收到的订单和买家信息

---

## ✅ Step 9: 仪表盘路由权限控制
- 创建 `middleware.ts` 检查用户身份
- 卖家用户访问 `/dashboard/create`，买家访问 `/checkout`
- 未登录用户访问受限路由时重定向到 `/login`

---

## ✅ Step 10: 添加假数据与演示说明
- 在 Supabase 插入 1 个买家、1 个卖家和 2 个产品
- 准备演示账号信息（email + password）
- 撰写演示脚本：如何注册、上传、浏览、下单、查看订单

---

🎯 后续可选任务（时间充足时执行）：
- 上传产品图片至 Cloudinary 并保存链接
- 商品搜索/筛选功能
- 订单状态更新按钮（发货）
