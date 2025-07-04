'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../../context/UserContext';
import { supabase } from '../../../utils/supabaseClient';

interface Product {
  id: number;
  name_cn: string;
  name_en?: string;
  price: number;
  stock: number;
  description?: string;
  image_url?: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export default function ProductsManagePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'seller')) {
      router.push('/login');
    } else if (user && user.role === 'seller') {
      fetchProducts();
    }
  }, [user, loading, router]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError('');

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - get from localStorage
        const demoProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');
        const userProducts = demoProducts.filter((p: Product) => p.seller_id === user!.id);
        setProducts(userProducts);
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('获取产品列表失败');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('确定要删除这个产品吗？')) {
      return;
    }

    try {
      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - remove from localStorage
        const demoProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');
        const updatedProducts = demoProducts.filter((p: Product) => p.id !== productId);
        localStorage.setItem('demo_seller_products', JSON.stringify(updatedProducts));
        
        // Update local state
        setProducts(prev => prev.filter(p => p.id !== productId));
        return;
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user!.id);

      if (error) {
        throw error;
      }

      // Update local state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert('删除产品失败，请重试');
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

  if (!user || user.role !== 'seller') {
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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                仪表盘
              </Link>
              <span className="text-gray-700">
                欢迎，{user.business_name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">我的产品</h1>
              <p className="mt-2 text-gray-600">管理您上传的中药材产品</p>
            </div>
            <Link href="/dashboard/create" className="btn-primary">
              添加新产品
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loadingProducts ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">加载产品中...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无产品</h3>
              <p className="mt-1 text-sm text-gray-500">开始上传您的第一个中药材产品</p>
              <div className="mt-6">
                <Link href="/dashboard/create" className="btn-primary">
                  添加产品
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name_cn}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name_cn}
                    </h3>
                    {product.name_en && (
                      <p className="text-sm text-gray-500 mb-2">{product.name_en}</p>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        ¥{product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        库存: {product.stock}kg
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/products/edit/${product.id}`}
                        className="flex-1 btn-secondary text-center"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        删除
                      </button>
                    </div>
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
