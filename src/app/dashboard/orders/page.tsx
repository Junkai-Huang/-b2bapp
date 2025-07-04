'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
  buyer?: {
    business_name: string;
  };
  order_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    product: {
      name_cn: string;
    };
  }[];
}

export default function OrdersPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoadingOrders(true);

      if (user.role === 'buyer') {
        // 买家查看自己的订单
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            buyer_id,
            order_items(
              id,
              quantity,
              unit_price,
              product:products(
                name_cn,
                seller:users!products_seller_id_fkey(business_name)
              )
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);

      } else {
        // 卖家查看包含自己产品的订单
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            order:orders(
              id,
              total_amount,
              status,
              created_at,
              buyer_id,
              buyer:users!orders_buyer_id_fkey(business_name)
            ),
            id,
            quantity,
            unit_price,
            product:products(name_cn)
          `)
          .eq('product.seller_id', user.id)
          .order('order.created_at', { ascending: false });

        if (error) throw error;

        // 转换数据格式以匹配订单结构
        const orderMap = new Map();
        data?.forEach((item: any) => {
          const orderId = item.order.id;
          if (!orderMap.has(orderId)) {
            orderMap.set(orderId, {
              ...item.order,
              order_items: []
            });
          }
          orderMap.get(orderId).order_items.push({
            id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            product: item.product
          });
        });

        setOrders(Array.from(orderMap.values()));
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('获取订单失败');
    } finally {
      setLoadingOrders(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                中药材B2B平台
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                返回仪表盘
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role === 'buyer' ? '我的订单' : '收到的订单'}
            </h1>
            <p className="mt-2 text-gray-600">
              {user.role === 'buyer' ? '查看您的购买记录' : '管理客户订单'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loadingOrders ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载订单中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无订单</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user.role === 'buyer' ? '您还没有下过订单' : '还没有收到订单'}
              </p>
              {user.role === 'buyer' && (
                <div className="mt-6">
                  <Link href="/" className="btn-primary">
                    去购买产品
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          订单 #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ¥{order.total_amount.toFixed(2)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' ? '待处理' : 
                           order.status === 'completed' ? '已完成' : order.status}
                        </span>
                      </div>
                    </div>

                    {user.role === 'seller' && order.buyer && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          买家：{order.buyer.business_name}
                        </p>
                      </div>
                    )}

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">订单详情</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.product.name_cn} × {item.quantity}kg
                              </span>
                              <span className="text-gray-900">
                                ¥{(item.unit_price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
