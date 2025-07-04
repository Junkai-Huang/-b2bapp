-- 初始化测试数据
-- 注意：这些数据仅用于演示，实际使用时需要通过应用界面创建

-- 插入测试用户（需要先通过Supabase Auth创建对应的认证用户）
-- 这里假设已经通过应用注册了以下用户：
-- buyer@test.com (买家)
-- seller@test.com (卖家)

-- 插入测试产品（由卖家创建）
INSERT INTO products (name_cn, price, stock, description, image_url, seller_id) VALUES
('优质人参', 280.00, 50, '长白山野生人参，品质上乘，适合滋补养生', 'https://images.unsplash.com/photo-1609501676725-7186f734b2e8?w=400', 
 (SELECT id FROM users WHERE role = 'seller' LIMIT 1)),
('当归片', 45.50, 100, '甘肃岷县当归，片状加工，便于使用', 'https://images.unsplash.com/photo-1609501676725-7186f734b2e8?w=400',
 (SELECT id FROM users WHERE role = 'seller' LIMIT 1)),
('宁夏枸杞', 68.00, 200, '宁夏中宁枸杞，颗粒饱满，营养丰富', 'https://images.unsplash.com/photo-1609501676725-7186f734b2e8?w=400',
 (SELECT id FROM users WHERE role = 'seller' LIMIT 1)),
('黄芪段', 32.80, 80, '内蒙古黄芪，切段处理，质量优良', 'https://images.unsplash.com/photo-1609501676725-7186f734b2e8?w=400',
 (SELECT id FROM users WHERE role = 'seller' LIMIT 1));

-- 插入测试订单（由买家创建）
INSERT INTO orders (buyer_id, total_amount, status) VALUES
((SELECT id FROM users WHERE role = 'buyer' LIMIT 1), 373.50, 'pending'),
((SELECT id FROM users WHERE role = 'buyer' LIMIT 1), 136.00, 'completed');

-- 插入订单项目
-- 第一个订单：人参1kg + 当归2kg
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE total_amount = 373.50), 
 (SELECT id FROM products WHERE name_cn = '优质人参'), 1, 280.00),
((SELECT id FROM orders WHERE total_amount = 373.50), 
 (SELECT id FROM products WHERE name_cn = '当归片'), 2, 45.50);

-- 第二个订单：枸杞2kg
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
((SELECT id FROM orders WHERE total_amount = 136.00), 
 (SELECT id FROM products WHERE name_cn = '宁夏枸杞'), 2, 68.00);

-- 更新产品库存（减去已售出的数量）
UPDATE products SET stock = stock - 1 WHERE name_cn = '优质人参';
UPDATE products SET stock = stock - 2 WHERE name_cn = '当归片';
UPDATE products SET stock = stock - 2 WHERE name_cn = '宁夏枸杞';
