'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useCart, CartItem } from '@/context/CartContext';
import { supabase } from '@/utils/supabaseClient';

export default function CheckoutPage() {
  const { user, loading } = useUser();
  const { items, getTotalAmount, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const isBuyNow = searchParams.get('buyNow') === 'true';

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isBuyNow) {
      // Handle Buy Now - get item from sessionStorage
      const buyNowItemStr = sessionStorage.getItem('buyNowItem');
      if (buyNowItemStr) {
        const buyNowItem = JSON.parse(buyNowItemStr);
        setCheckoutItems([buyNowItem]);
        setTotalAmount(buyNowItem.price * buyNowItem.quantity);
      } else {
        router.push('/');
      }
    } else {
      // Handle regular cart checkout
      if (items.length === 0) {
        router.push('/cart');
      } else {
        setCheckoutItems(items);
        setTotalAmount(getTotalAmount());
      }
    }
  }, [items, router, isBuyNow, getTotalAmount]);

  const handleSubmitOrder = async () => {
    if (!user || checkoutItems.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - save to localStorage
        const orderId = Date.now().toString(); // Use timestamp as order ID (convert to string)
        const newOrder = {
          id: orderId,
          buyer_id: user.id,
          total_amount: totalAmount,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          buyer: {
            business_name: user.business_name,
            email: user.email
          },
          order_items: checkoutItems.map(item => ({
            id: Date.now() + Math.random(), // Unique ID for each item
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            product: {
              name_cn: item.productName,
              seller: {
                business_name: item.sellerName
              }
            }
          }))
        };

        // Save order to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('demo_orders', JSON.stringify(existingOrders));

        // Update product stock in demo mode
        const demoProducts = JSON.parse(localStorage.getItem('demo_products') || '[]');
        const sellerProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');

        // Update both demo product lists
        const updateProductStock = (productList: any[]) => {
          return productList.map(product => {
            const cartItem = checkoutItems.find(item => item.productId.toString() === product.id.toString());
            if (cartItem) {
              return {
                ...product,
                stock: Math.max(0, product.stock - cartItem.quantity),
                updated_at: new Date().toISOString()
              };
            }
            return product;
          });
        };

        localStorage.setItem('demo_products', JSON.stringify(updateProductStock(demoProducts)));
        localStorage.setItem('demo_seller_products', JSON.stringify(updateProductStock(sellerProducts)));

        // Clear cart or sessionStorage based on purchase type
        if (isBuyNow) {
          sessionStorage.removeItem('buyNowItem');
        } else {
          clearCart();
        }

        router.push(`/order/${orderId}`);
        return;
      }

      // Real Supabase mode (original code)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: user.id,
            total_amount: totalAmount,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // 创建订单项目
      const orderItems = checkoutItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // 更新产品库存
      for (const item of checkoutItems) {
        // 先获取当前库存
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);

          if (stockError) {
            console.error('Error updating stock:', stockError);
            // 不抛出错误，因为订单已经创建成功
          }
        }
      }

      // Clear cart or sessionStorage based on purchase type
      if (isBuyNow) {
        sessionStorage.removeItem('buyNowItem');
      } else {
        clearCart();
      }

      // 跳转到订单详情页
      router.push(`/order/${order.id}`);

    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || '创建订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'buyer' || checkoutItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                中药材B2B平台
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="text-gray-600 hover:text-gray-900">
                返回购物车
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 结算内容 */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">订单结算</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 订单详情 */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">订单详情</h2>
                  
                  <div className="space-y-4">
                    {checkoutItems.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.productName}</h3>
                          <p className="text-sm text-gray-500">供应商: {item.sellerName}</p>
                          <p className="text-sm text-gray-600">
                            ¥{item.price.toFixed(2)}/kg × {item.quantity}kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ¥{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 买家信息 */}
              <div className="card mt-6">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">买家信息</h2>
                  <div className="space-y-2">
                    <p><span className="font-medium">企业名称:</span> {user.business_name}</p>
                    <p><span className="font-medium">联系邮箱:</span> {user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 订单摘要 */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">订单摘要</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>商品总数</span>
                      <span>{checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} kg</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>商品总价</span>
                      <span>¥{totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>订单总计</span>
                        <span className="text-red-600">¥{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full mt-6 btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '提交中...' : '确认下单'}
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    点击"确认下单"即表示您同意我们的服务条款
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
