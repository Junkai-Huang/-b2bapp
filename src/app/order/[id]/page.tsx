'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabaseClient';

interface OrderDetails {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
  buyer: {
    business_name: string;
    email: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    product: {
      name_cn: string;
      seller: {
        business_name: string;
      };
    };
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (params.id && user) {
      fetchOrder(params.id as string);
    }
  }, [params.id, user]);

  const fetchOrder = async (orderId: string) => {
    try {
      setOrderLoading(true);

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - get from localStorage
        const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const orderData = demoOrders.find((order: any) => order.id.toString() === orderId);

        if (!orderData) {
          setError('订单不存在');
          return;
        }

        // 检查用户权限
        if (user!.role === 'buyer' && orderData.buyer_id !== user!.id) {
          setError('您没有权限查看此订单');
          return;
        }

        if (user!.role === 'seller') {
          // 检查卖家是否有此订单的商品
          const hasSellerProducts = orderData.order_items.some((item: any) =>
            item.product.seller.business_name === user!.business_name
          );
          if (!hasSellerProducts) {
            setError('您没有权限查看此订单');
            return;
          }
        }

        setOrder(orderData);
        return;
      }

      // Real Supabase mode (original code)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:users!orders_buyer_id_fkey(business_name, email),
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
        .eq('id', orderId)
        .single();

      if (error) {
        throw error;
      }

      // 检查用户权限
      if (user!.role === 'buyer' && data.buyer_id !== user!.id) {
        setError('您没有权限查看此订单');
        return;
      }

      if (user!.role === 'seller') {
        // 检查卖家是否有此订单的商品
        const hasSellerProducts = data.order_items.some((item: any) =>
          item.product.seller.id === user!.id
        );
        if (!hasSellerProducts) {
          setError('您没有权限查看此订单');
          return;
        }
      }

      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError('获取订单详情失败');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading || orderLoading) {
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

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">订单未找到</h1>
          <p className="text-gray-600 mb-8">{error || '请检查订单链接是否正确'}</p>
          <Link href="/dashboard/orders" className="btn-primary">
            返回订单列表
          </Link>
        </div>
      </div>
    );
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
              <Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-900">
                返回订单列表
              </Link>
              <Link href="/dashboard" className="btn-primary">
                仪表盘
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 订单详情 */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 成功提示 */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  订单创建成功！
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  您的订单已提交，我们会尽快处理。
                </p>
              </div>
            </div>
          </div>

          {/* 订单信息 */}
          <div className="card mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    订单 #{order.id.slice(0, 8)}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    下单时间: {new Date(order.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    ¥{order.total_amount.toFixed(2)}
                  </p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
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

              {/* 买家信息 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">买家信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">企业名称</p>
                    <p className="font-medium">{order.buyer.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">联系邮箱</p>
                    <p className="font-medium">{order.buyer.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 订单商品 */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">订单商品</h3>
              
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product.name_cn}</h4>
                      <p className="text-sm text-gray-500">
                        供应商: {item.product.seller.business_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        ¥{item.unit_price.toFixed(2)}/kg × {item.quantity}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ¥{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">订单总计</span>
                  <span className="text-xl font-bold text-red-600">
                    ¥{order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/" className="btn-secondary">
              继续购物
            </Link>
            <Link href="/dashboard/orders" className="btn-primary">
              查看所有订单
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
