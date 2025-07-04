'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '../../../../../context/UserContext';
import { supabase } from '../../../../../utils/supabaseClient';

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

export default function EditProductPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name_cn: '',
    name_en: '',
    price: '',
    stock: '',
    description: '',
    image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'seller')) {
      router.push('/login');
    } else if (user && user.role === 'seller' && productId) {
      fetchProduct();
    }
  }, [user, loading, router, productId]);

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      setError('');

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - get from localStorage
        const demoProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');
        const foundProduct = demoProducts.find((p: Product) => 
          p.id.toString() === productId && p.seller_id === user!.id
        );

        if (!foundProduct) {
          setError('产品未找到');
          return;
        }

        setProduct(foundProduct);
        setFormData({
          name_cn: foundProduct.name_cn,
          name_en: foundProduct.name_en || '',
          price: foundProduct.price.toString(),
          stock: foundProduct.stock.toString(),
          description: foundProduct.description || '',
          image_url: foundProduct.image_url || ''
        });
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('seller_id', user!.id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('产品未找到');
        return;
      }

      setProduct(data);
      setFormData({
        name_cn: data.name_cn,
        name_en: data.name_en || '',
        price: data.price.toString(),
        stock: data.stock.toString(),
        description: data.description || '',
        image_url: data.image_url || ''
      });
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError('获取产品信息失败');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // 验证表单数据
      if (!formData.name_cn || !formData.price || !formData.stock) {
        setError('请填写所有必填字段');
        return;
      }

      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);

      if (isNaN(price) || price <= 0) {
        setError('请输入有效的价格');
        return;
      }

      if (isNaN(stock) || stock < 0) {
        setError('请输入有效的库存数量');
        return;
      }

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo mode - update in localStorage
        const demoProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');
        const productIndex = demoProducts.findIndex((p: Product) => 
          p.id.toString() === productId && p.seller_id === user!.id
        );

        if (productIndex === -1) {
          setError('产品未找到');
          return;
        }

        // Update the product
        demoProducts[productIndex] = {
          ...demoProducts[productIndex],
          name_cn: formData.name_cn,
          name_en: formData.name_en || null,
          price: price,
          stock: stock,
          description: formData.description || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString()
        };

        localStorage.setItem('demo_seller_products', JSON.stringify(demoProducts));
        setSuccess(true);

        // 3秒后跳转到产品管理页
        setTimeout(() => {
          router.push('/dashboard/products');
        }, 2000);

        return;
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name_cn: formData.name_cn,
          name_en: formData.name_en || null,
          price: price,
          stock: stock,
          description: formData.description || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('seller_id', user!.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // 3秒后跳转到产品管理页
      setTimeout(() => {
        router.push('/dashboard/products');
      }, 2000);

    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || '更新产品失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingProduct) {
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

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">产品未找到</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard/products" className="btn-primary">
            返回产品管理
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
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                仪表盘
              </Link>
              <Link href="/dashboard/products" className="text-gray-600 hover:text-gray-900">
                我的产品
              </Link>
              <span className="text-gray-700">
                欢迎，{user.business_name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">编辑产品</h1>
            <p className="mt-2 text-gray-600">修改产品信息</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    产品更新成功！正在跳转到产品管理页面...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="form-group">
                <label htmlFor="name_cn" className="form-label">
                  中药材名称 *
                </label>
                <input
                  type="text"
                  id="name_cn"
                  name="name_cn"
                  required
                  className="input-field"
                  placeholder="例如：当归、人参、枸杞"
                  value={formData.name_cn}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name_en" className="form-label">
                  英文名称
                </label>
                <input
                  type="text"
                  id="name_en"
                  name="name_en"
                  className="input-field"
                  placeholder="例如：Angelica Sinensis"
                  value={formData.name_en}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    价格 (元/公斤) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock" className="form-label">
                    库存数量 (公斤) *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    className="input-field"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  产品描述
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="input-field"
                  placeholder="请描述产品的产地、品质、规格等信息..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="image_url" className="form-label">
                  产品图片链接
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  请提供产品图片的网络链接地址
                </p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '更新中...' : '更新产品'}
                </button>
                <Link
                  href="/dashboard/products"
                  className="flex-1 btn-secondary text-center"
                >
                  取消
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
