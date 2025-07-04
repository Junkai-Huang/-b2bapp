# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "Start your project" 或 "New Project"
3. 选择组织（或创建新组织）
4. 填写项目信息：
   - **Project Name**: `chinese-medicine-b2b`
   - **Database Password**: 设置一个强密码（请记住这个密码）
   - **Region**: 选择离你最近的区域（建议选择 Singapore 或 Tokyo）
5. 点击 "Create new project"

## 2. 执行数据库初始化脚本

1. 等待项目创建完成（通常需要1-2分钟）
2. 在项目仪表盘中，点击左侧菜单的 "SQL Editor"
3. 点击 "New query"
4. 将 `supabase-init.sql` 文件的内容复制粘贴到编辑器中
5. 点击 "Run" 按钮执行脚本
6. 确认所有表和策略都创建成功

## 3. 获取项目配置信息

在项目仪表盘中：

1. 点击左侧菜单的 "Settings" → "API"
2. 记录以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (很长的字符串)

## 4. 验证数据库结构

在 "Table Editor" 中应该能看到以下表：
- ✅ `users` - 用户扩展信息表
- ✅ `products` - 产品表
- ✅ `orders` - 订单表  
- ✅ `order_items` - 订单项表

## 5. 测试 RLS 策略

在 "Authentication" → "Policies" 中应该能看到：
- Users 表的访问策略
- Products 表的访问策略
- Orders 表的访问策略
- Order Items 表的访问策略

## 6. 下一步

完成 Supabase 设置后，请：
1. 将 Project URL 和 anon public key 保存到 `.env.local` 文件中
2. 继续下一个任务：配置 Supabase 客户端

## 常见问题

**Q: 执行 SQL 脚本时出现权限错误？**
A: 确保你是项目的所有者，并且在正确的项目中执行脚本。

**Q: 表创建成功但看不到数据？**
A: 这是正常的，我们还没有插入测试数据。测试数据将在后续任务中添加。

**Q: RLS 策略是什么？**
A: Row Level Security（行级安全）确保用户只能访问他们有权限的数据，比如用户只能看到自己的订单。
