'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';

export default function CreateProductPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name_cn: '',
    price: '',
    stock: '',
    description: '',
    image_url: '',
    quality_report_url: '',
    quality_report_name: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qualityReportFile, setQualityReportFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'seller')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX, JPG, PNG)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('质检报告只支持 PDF、DOC、DOCX、JPG、PNG 格式');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('文件大小不能超过 10MB');
        return;
      }

      setQualityReportFile(file);
      setFormData(prev => ({
        ...prev,
        quality_report_name: file.name,
        quality_report_url: `demo_file_${Date.now()}_${file.name}` // Demo URL
      }));
      setError(''); // Clear any previous errors
    }
  };

  const removeQualityReport = () => {
    setQualityReportFile(null);
    setFormData(prev => ({
      ...prev,
      quality_report_name: '',
      quality_report_url: ''
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
        // Demo mode - save to localStorage
        const existingProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');

        const newProduct = {
          id: Date.now(), // Use timestamp as ID
          name_cn: formData.name_cn,
          name_en: '', // Optional field
          price: price,
          stock: stock,
          description: formData.description || null,
          image_url: formData.image_url || null,
          quality_report_url: formData.quality_report_url || null,
          quality_report_name: formData.quality_report_name || null,
          quality_status: formData.quality_report_url ? 'pending' : 'none', // pending, approved, rejected, none
          stock_status: 'in_stock', // in_stock, out_of_stock, low_stock
          seller_id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller: {
            business_name: user!.business_name,
            id: user!.id
          }
        };

        existingProducts.push(newProduct);
        localStorage.setItem('demo_seller_products', JSON.stringify(existingProducts));

        setSuccess(true);
        // 重置表单
        setFormData({
          name_cn: '',
          price: '',
          stock: '',
          description: '',
          image_url: '',
          quality_report_url: '',
          quality_report_name: ''
        });
        setQualityReportFile(null);

        // 3秒后跳转到仪表盘
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);

        return;
      }

      // 插入产品数据到 Supabase
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            name_cn: formData.name_cn,
            price: price,
            stock: stock,
            description: formData.description || null,
            image_url: formData.image_url || null,
            seller_id: user!.id
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      // 重置表单
      setFormData({
        name_cn: '',
        price: '',
        stock: '',
        description: '',
        image_url: '',
        quality_report_url: '',
        quality_report_name: ''
      });
      setQualityReportFile(null);

      // 3秒后跳转到仪表盘
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.message || '创建产品失败，请重试');
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

  if (!user || user.role !== 'seller') {
    return null; // 重定向中
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
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">上传新产品</h1>
            <p className="mt-2 text-gray-600">
              添加您的中药材产品信息
            </p>
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
                    产品创建成功！3秒后将自动跳转到仪表盘...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  placeholder="例如：人参、当归、枸杞"
                  value={formData.name_cn}
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

              {/* Quality Report Upload */}
              <div className="form-group">
                <label className="form-label">
                  质检报告 <span className="text-sm text-gray-500">(可选)</span>
                </label>
                <div className="mt-1">
                  {!qualityReportFile ? (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="quality-report"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>上传质检报告</span>
                            <input
                              id="quality-report"
                              name="quality-report"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">或拖拽文件到此处</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          支持 PDF, DOC, DOCX, JPG, PNG 格式，最大 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {qualityReportFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(qualityReportFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeQualityReport}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        移除
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  上传质检报告有助于提高产品可信度，加快审核通过
                </p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard"
                  className="btn-secondary"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '创建中...' : '创建产品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
