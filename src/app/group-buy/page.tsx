'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'

interface GroupBuyItem {
  id: string
  productName: string
  productImage: string
  originalPrice: number
  groupPrice: number
  minQuantity: number
  currentQuantity: number
  maxQuantity: number
  endTime: Date
  status: 'active' | 'success' | 'failed'
  participants: number
  description: string
  seller: string
  category: string
}

export default function GroupBuyPage() {
  const { user } = useUser()
  const router = useRouter()
  const [groupBuyItems, setGroupBuyItems] = useState<GroupBuyItem[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'success' | 'failed'>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'buyer') {
      router.push('/dashboard')
      return
    }

    // Generate synthetic data for group buy items
    generateSyntheticData()
  }, [user, router])

  const generateSyntheticData = () => {
    const products = [
      { name: '优质当归片', image: '/api/placeholder/200/200', category: '补血药' },
      { name: '精选黄芪', image: '/api/placeholder/200/200', category: '补气药' },
      { name: '野生灵芝', image: '/api/placeholder/200/200', category: '安神药' },
      { name: '陈皮丝', image: '/api/placeholder/200/200', category: '理气药' },
      { name: '枸杞子', image: '/api/placeholder/200/200', category: '补阴药' },
      { name: '三七粉', image: '/api/placeholder/200/200', category: '活血药' },
      { name: '茯苓块', image: '/api/placeholder/200/200', category: '利水药' },
      { name: '川贝母', image: '/api/placeholder/200/200', category: '化痰药' }
    ]

    const sellers = ['康源药材', '同仁堂', '九芝堂', '云南白药', '太极集团', '华润三九']
    const statuses: ('active' | 'success' | 'failed')[] = ['active', 'success', 'failed']

    const items: GroupBuyItem[] = []

    for (let i = 0; i < 12; i++) {
      const product = products[i % products.length]
      const originalPrice = Math.floor(Math.random() * 500) + 100
      const groupPrice = Math.floor(originalPrice * (0.6 + Math.random() * 0.2))
      const minQuantity = Math.floor(Math.random() * 50) + 10
      const maxQuantity = minQuantity * (Math.floor(Math.random() * 5) + 2)
      const currentQuantity = Math.floor(Math.random() * maxQuantity)
      const status = i < 6 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)]
      
      // Generate end time (within the last week or next few days)
      const now = new Date()
      const endTime = new Date()
      if (status === 'active') {
        endTime.setTime(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Next 7 days
      } else {
        endTime.setTime(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }

      items.push({
        id: `gb-${i + 1}`,
        productName: product.name,
        productImage: product.image,
        originalPrice,
        groupPrice,
        minQuantity,
        currentQuantity: status === 'active' ? currentQuantity : (status === 'success' ? maxQuantity : Math.floor(minQuantity * 0.8)),
        maxQuantity,
        endTime,
        status,
        participants: Math.floor(Math.random() * 50) + 5,
        description: `优质${product.name}，产地直供，品质保证。适合批量采购，价格优惠。`,
        seller: sellers[Math.floor(Math.random() * sellers.length)],
        category: product.category
      })
    }

    setGroupBuyItems(items)
  }

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    
    if (diff <= 0) return '已结束'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'success': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '拼单中'
      case 'success': return '拼单成功'
      case 'failed': return '拼单失败'
      default: return '未知'
    }
  }

  const filteredItems = groupBuyItems.filter(item => 
    filter === 'all' || item.status === filter
  )

  const handleJoinGroupBuy = (itemId: string) => {
    // In a real app, this would make an API call
    alert('拼单功能演示：您已成功参与拼单！')
  }

  if (!user || user.role !== 'buyer') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
              <span className="text-gray-600">欢迎, {user.business_name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">拼单中心</h1>
          <p className="text-lg text-gray-600">
            参与拼单，享受批量采购优惠价格
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: '全部拼单', count: groupBuyItems.length },
                { key: 'active', label: '进行中', count: groupBuyItems.filter(i => i.status === 'active').length },
                { key: 'success', label: '拼单成功', count: groupBuyItems.filter(i => i.status === 'success').length },
                { key: 'failed', label: '拼单失败', count: groupBuyItems.filter(i => i.status === 'failed').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Group Buy Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.productName}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{item.seller}</span>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">原价:</span>
                    <span className="line-through text-gray-400">¥{item.originalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">拼单价:</span>
                    <span className="text-red-600 font-semibold">¥{item.groupPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">进度:</span>
                    <span className="text-blue-600">
                      {item.currentQuantity}/{item.minQuantity} (最少)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>拼单进度</span>
                    <span>{Math.round((item.currentQuantity / item.minQuantity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((item.currentQuantity / item.minQuantity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>{item.participants} 人参与</span>
                  <span>
                    {item.status === 'active' ? `剩余: ${getTimeRemaining(item.endTime)}` : 
                     item.status === 'success' ? '拼单成功' : '拼单失败'}
                  </span>
                </div>

                {item.status === 'active' && (
                  <button
                    onClick={() => handleJoinGroupBuy(item.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    立即参与拼单
                  </button>
                )}

                {item.status === 'success' && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed">
                    拼单已成功
                  </button>
                )}

                {item.status === 'failed' && (
                  <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed">
                    拼单已结束
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无拼单活动</h3>
            <p className="text-gray-500">当前没有符合条件的拼单活动</p>
          </div>
        )}
      </div>
    </div>
  )
}
