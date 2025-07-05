'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { demoDataManager, BuyingRequest, AdminProductReview } from '@/utils/demoDataManager'

export default function AdminDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [buyingRequests, setBuyingRequests] = useState<BuyingRequest[]>([])
  const [productReviews, setProductReviews] = useState<AdminProductReview[]>([])
  const [activeTab, setActiveTab] = useState<'requests' | 'products' | 'overview'>('overview')

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/login')
        return
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData()
    }
  }, [user])

  const loadData = () => {
    setBuyingRequests(demoDataManager.getBuyingRequests())
    setProductReviews(demoDataManager.getAdminProductReviews())
  }

  const handleApproveBuyingRequest = (requestId: string) => {
    const success = demoDataManager.approveBuyingRequest(requestId, '管理员已审核通过')
    if (success) {
      loadData()
      alert('采购请求已批准并发送给卖家')
    }
  }

  const handleApproveProduct = (reviewId: string, adjustedPrice?: number) => {
    const success = demoDataManager.approveProductWithPriceAdjustment(
      reviewId, 
      adjustedPrice, 
      '管理员已审核通过'
    )
    if (success) {
      loadData()
      alert('产品已批准上架')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const pendingRequests = buyingRequests.filter(r => r.status === 'pending')
  const pendingProducts = productReviews.filter(r => r.status === 'pending_review')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">管理员控制台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">欢迎，{user.business_name}</span>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-700"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              采购请求 {pendingRequests.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              产品审核 {pendingProducts.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingProducts.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        待审核采购请求
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pendingRequests.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🛍️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        待审核产品
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {pendingProducts.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        总订单数
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {demoDataManager.getDemoOrders().length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                采购请求管理
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                审核买家的采购请求，批准后将发送给相关卖家
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {buyingRequests.map((request) => (
                <li key={request.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {request.product_name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'admin_approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status === 'pending' ? '待审核' : 
                             request.status === 'admin_approved' ? '已批准' : request.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              买家: {request.buyer.business_name}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              数量: {request.quantity} kg
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              目标价格: ¥{request.target_price}/kg
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {request.description}
                        </p>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleApproveBuyingRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          批准请求
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
              {buyingRequests.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  暂无采购请求
                </li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductReviewTab 
            productReviews={productReviews}
            onApproveProduct={handleApproveProduct}
          />
        )}
      </div>
    </div>
  )
}

// Product Review Tab Component
function ProductReviewTab({ 
  productReviews, 
  onApproveProduct 
}: { 
  productReviews: AdminProductReview[]
  onApproveProduct: (reviewId: string, adjustedPrice?: number) => void 
}) {
  const [priceAdjustments, setPriceAdjustments] = useState<{[key: string]: string}>({})

  const handlePriceChange = (reviewId: string, price: string) => {
    setPriceAdjustments(prev => ({
      ...prev,
      [reviewId]: price
    }))
  }

  const handleApprove = (reviewId: string, originalPrice: number) => {
    const adjustedPriceStr = priceAdjustments[reviewId]
    const adjustedPrice = adjustedPriceStr ? parseFloat(adjustedPriceStr) : undefined
    
    if (adjustedPrice && adjustedPrice <= 0) {
      alert('价格必须大于0')
      return
    }
    
    onApproveProduct(reviewId, adjustedPrice)
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          产品审核管理
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          审核卖家上传的产品，可以调整价格后批准上架
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {productReviews.map((review) => (
          <li key={review.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {review.product.name_cn}
                  </p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    review.status === 'pending_review' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : review.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {review.status === 'pending_review' ? '待审核' : 
                     review.status === 'approved' ? '已批准' : '已拒绝'}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    卖家: {review.product.seller.business_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    原价格: ¥{review.original_price}/kg
                  </p>
                  {review.admin_adjusted_price && (
                    <p className="text-sm text-green-600">
                      调整后价格: ¥{review.admin_adjusted_price}/kg
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {review.product.description}
                  </p>
                </div>
              </div>
              {review.status === 'pending_review' && (
                <div className="ml-4 flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">调整价格:</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={review.original_price.toString()}
                      value={priceAdjustments[review.id] || ''}
                      onChange={(e) => handlePriceChange(review.id, e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">元/kg</span>
                  </div>
                  <button
                    onClick={() => handleApprove(review.id, review.original_price)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    批准上架
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
        {productReviews.length === 0 && (
          <li className="px-4 py-8 text-center text-gray-500">
            暂无待审核产品
          </li>
        )}
      </ul>
    </div>
  )
}
