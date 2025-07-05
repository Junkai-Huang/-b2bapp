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
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processingOptions, setProcessingOptions] = useState({
    slicing: false,
    grinding: false,
    packaging: false
  });
  const [processingCost, setProcessingCost] = useState(0);

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

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - get from localStorage
        const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');

        if (user.role === 'buyer') {
          // 买家查看自己的订单
          const buyerOrders = demoOrders.filter((order: any) => order.buyer_id === user.id)
            .map((order: any) => ({ ...order, id: order.id.toString() })); // Ensure ID is string
          setOrders(buyerOrders);
        } else {
          // 卖家查看包含自己产品的订单
          const sellerOrders = demoOrders.filter((order: any) =>
            order.order_items.some((item: any) =>
              item.product.seller.business_name === user.business_name
            )
          ).map((order: any) => ({ ...order, id: order.id.toString() })); // Ensure ID is string
          setOrders(sellerOrders);
        }
        return;
      }

      // Real Supabase mode (original code)
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

  // Calculate processing cost based on selected options
  const calculateProcessingCost = (options: typeof processingOptions, order: Order) => {
    let cost = 0;
    const totalWeight = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    if (options.slicing) cost += totalWeight * 5; // ¥5 per kg for slicing
    if (options.grinding) cost += totalWeight * 8; // ¥8 per kg for grinding
    if (options.packaging) cost += totalWeight * 3; // ¥3 per kg for special packaging

    return cost;
  };

  // Handle processing option changes
  const handleProcessingChange = (option: keyof typeof processingOptions) => {
    const newOptions = { ...processingOptions, [option]: !processingOptions[option] };
    setProcessingOptions(newOptions);
    if (selectedOrder) {
      setProcessingCost(calculateProcessingCost(newOptions, selectedOrder));
    }
  };

  // Open processing modal
  const openProcessingModal = (order: Order) => {
    setSelectedOrder(order);
    setProcessingOptions({ slicing: false, grinding: false, packaging: false });
    setProcessingCost(0);
    setShowProcessingModal(true);
  };

  // Submit processing request
  const submitProcessingRequest = () => {
    if (!selectedOrder) return;

    // In demo mode, update the order with processing info
    const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

    if (isDemoMode) {
      const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
      const updatedOrders = demoOrders.map((order: any) => {
        if (order.id.toString() === selectedOrder.id.toString()) {
          return {
            ...order,
            processing: {
              options: processingOptions,
              cost: processingCost,
              requested_at: new Date().toISOString(),
              status: 'requested'
            },
            total_amount: order.total_amount + processingCost
          };
        }
        return order;
      });
      localStorage.setItem('demo_orders', JSON.stringify(updatedOrders));

      // Refresh orders
      fetchOrders();
    }

    alert(`代工定制申请已提交！额外费用：¥${processingCost.toFixed(2)}`);
    setShowProcessingModal(false);
    setSelectedOrder(null);
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

                        {/* Processing info if exists */}
                        {(order as any).processing && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">代工定制服务</h5>
                            <div className="text-xs text-blue-800 space-y-1">
                              {(order as any).processing.options.slicing && <p>• 切片服务</p>}
                              {(order as any).processing.options.grinding && <p>• 磨粉服务</p>}
                              {(order as any).processing.options.packaging && <p>• 特殊包装</p>}
                              <p className="font-medium">额外费用: ¥{(order as any).processing.cost.toFixed(2)}</p>
                              <p className="text-blue-600">状态: {(order as any).processing.status === 'requested' ? '已申请' : '处理中'}</p>
                            </div>
                          </div>
                        )}

                        {/* Processing button for buyers */}
                        {user.role === 'buyer' && order.status === 'pending' && !(order as any).processing && (
                          <div className="mt-4">
                            <button
                              onClick={() => openProcessingModal(order)}
                              className="btn-secondary text-sm py-2 px-4"
                            >
                              申请代工定制
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Processing Modal */}
      {showProcessingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              代工定制服务 - 订单 #{selectedOrder.id.slice(0, 8)}
            </h3>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.slicing}
                    onChange={() => handleProcessingChange('slicing')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    切片服务 (¥5/kg)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.grinding}
                    onChange={() => handleProcessingChange('grinding')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    磨粉服务 (¥8/kg)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={processingOptions.packaging}
                    onChange={() => handleProcessingChange('packaging')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    特殊包装 (¥3/kg)
                  </span>
                </label>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>商品总重量:</span>
                  <span>{selectedOrder.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} kg</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>代工费用:</span>
                  <span className="font-medium text-blue-600">¥{processingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t">
                  <span>总计:</span>
                  <span className="text-red-600">¥{(selectedOrder.total_amount + processingCost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProcessingModal(false)}
                className="flex-1 btn-secondary py-2"
              >
                取消
              </button>
              <button
                onClick={submitProcessingRequest}
                disabled={processingCost === 0}
                className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
