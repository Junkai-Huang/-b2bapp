'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { user, loading } = useUser();
  const { items, updateQuantity, removeItem, getTotalAmount, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'buyer')) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (!user || user.role !== 'buyer') {
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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                继续购物
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                仪表盘
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 购物车内容 */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">购物车</h1>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">购物车为空</h3>
              <p className="mt-1 text-sm text-gray-500">
                还没有添加任何商品到购物车
              </p>
              <div className="mt-6">
                <Link href="/" className="btn-primary">
                  去购物
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 购物车项目 */}
              <div className="card">
                <div className="p-6">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            供应商: {item.sellerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            单价: ¥{item.price.toFixed(2)}/kg
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="w-12 text-center">{item.quantity}kg</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ¥{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 订单总计 */}
              <div className="card">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-900">订单总计</span>
                    <span className="text-2xl font-bold text-red-600">
                      ¥{getTotalAmount().toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>商品总数</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)} kg</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex space-x-4">
                        <button
                          onClick={clearCart}
                          className="flex-1 btn-secondary"
                        >
                          清空购物车
                        </button>
                        <Link
                          href="/checkout"
                          className="flex-1 btn-primary text-center"
                        >
                          去结算
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
