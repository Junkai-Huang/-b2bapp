'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Product } from '@/utils/supabaseClient'
import ProductCard from '@/components/ProductCard'
import { useUser } from '@/context/UserContext'

export default function HomePage() {
  const { user, logout } = useUser()
  const router = useRouter()
  const [products, setProducts] = useState<(Product & { seller?: { business_name: string } })[]>([])
  const [allProducts, setAllProducts] = useState<(Product & { seller?: { business_name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === '') {
      setProducts(allProducts)
    } else {
      const filtered = allProducts.filter(product =>
        product.name_cn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setProducts(filtered)
    }
  }, [searchQuery, allProducts])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co'

      if (isDemoMode) {
        // Demo products - 20 different Chinese medicines
        const demoProducts = [
          {
            id: 1,
            name_cn: '当归',
            name_en: 'Angelica Sinensis',
            price: 45.00,
            stock: 100,
            description: '优质当归，产地甘肃，品质上乘。补血活血，调经止痛',
            image_url: null,
            seller_id: 'demo-seller-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '甘肃中药材有限公司' }
          },
          {
            id: 2,
            name_cn: '人参',
            name_en: 'Ginseng',
            price: 280.00,
            stock: 50,
            description: '长白山野生人参，滋补佳品。大补元气，复脉固脱',
            image_url: null,
            seller_id: 'demo-seller-2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '长白山参业集团' }
          },
          {
            id: 3,
            name_cn: '枸杞',
            name_en: 'Goji Berry',
            price: 32.00,
            stock: 200,
            description: '宁夏枸杞，颗粒饱满，营养丰富。滋补肝肾，益精明目',
            image_url: null,
            seller_id: 'demo-seller-3',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '宁夏枸杞专业合作社' }
          },
          {
            id: 4,
            name_cn: '黄芪',
            name_en: 'Astragalus',
            price: 38.00,
            stock: 150,
            description: '内蒙古黄芪，补气固表，利尿托毒，排脓生肌',
            image_url: null,
            seller_id: 'demo-seller-4',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '内蒙古草原药材' }
          },
          {
            id: 5,
            name_cn: '白术',
            name_en: 'Atractylodes',
            price: 42.00,
            stock: 120,
            description: '浙江白术，健脾益气，燥湿利水，止汗安胎',
            image_url: null,
            seller_id: 'demo-seller-5',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '浙江道地药材' }
          },
          {
            id: 6,
            name_cn: '茯苓',
            name_en: 'Poria',
            price: 28.00,
            stock: 180,
            description: '云南茯苓，利水渗湿，健脾宁心',
            image_url: null,
            seller_id: 'demo-seller-6',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '云南山珍药材' }
          },
          {
            id: 7,
            name_cn: '甘草',
            name_en: 'Licorice',
            price: 25.00,
            stock: 300,
            description: '新疆甘草，补脾益气，清热解毒，祛痰止咳',
            image_url: null,
            seller_id: 'demo-seller-7',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '新疆天山药业' }
          },
          {
            id: 8,
            name_cn: '川芎',
            name_en: 'Chuanxiong',
            price: 55.00,
            stock: 80,
            description: '四川川芎，活血行气，祛风止痛',
            image_url: null,
            seller_id: 'demo-seller-8',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '四川川药集团' }
          },
          {
            id: 9,
            name_cn: '白芍',
            name_en: 'White Peony',
            price: 48.00,
            stock: 90,
            description: '安徽白芍，养血柔肝，缓中止痛，敛阴收汗',
            image_url: null,
            seller_id: 'demo-seller-9',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '安徽亳州药材' }
          },
          {
            id: 10,
            name_cn: '熟地黄',
            name_en: 'Rehmannia',
            price: 52.00,
            stock: 110,
            description: '河南熟地黄，滋阴补血，益精填髓',
            image_url: null,
            seller_id: 'demo-seller-10',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '河南怀药堂' }
          },
          {
            id: 11,
            name_cn: '党参',
            name_en: 'Codonopsis',
            price: 65.00,
            stock: 75,
            description: '甘肃党参，补中益气，健脾益肺',
            image_url: null,
            seller_id: 'demo-seller-11',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '甘肃陇原药材' }
          },
          {
            id: 12,
            name_cn: '麦冬',
            name_en: 'Ophiopogon',
            price: 35.00,
            stock: 160,
            description: '浙江麦冬，养阴生津，润肺清心',
            image_url: null,
            seller_id: 'demo-seller-12',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '浙江杭白药材' }
          },
          {
            id: 13,
            name_cn: '五味子',
            name_en: 'Schisandra',
            price: 78.00,
            stock: 60,
            description: '东北五味子，收敛固涩，益气生津，补肾宁心',
            image_url: null,
            seller_id: 'demo-seller-13',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '东北林下药材' }
          },
          {
            id: 14,
            name_cn: '山药',
            name_en: 'Chinese Yam',
            price: 30.00,
            stock: 220,
            description: '河南山药，补脾养胃，生津益肺，补肾涩精',
            image_url: null,
            seller_id: 'demo-seller-14',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '河南焦作药材' }
          },
          {
            id: 15,
            name_cn: '丹参',
            name_en: 'Salvia',
            price: 40.00,
            stock: 130,
            description: '山东丹参，活血祛瘀，通经止痛，清心除烦',
            image_url: null,
            seller_id: 'demo-seller-15',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '山东齐鲁药材' }
          },
          {
            id: 16,
            name_cn: '桔梗',
            name_en: 'Platycodon',
            price: 33.00,
            stock: 140,
            description: '安徽桔梗，宣肺，利咽，祛痰，排脓',
            image_url: null,
            seller_id: 'demo-seller-16',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '安徽皖南药材' }
          },
          {
            id: 17,
            name_cn: '金银花',
            name_en: 'Honeysuckle',
            price: 85.00,
            stock: 95,
            description: '山东金银花，清热解毒，疏散风热',
            image_url: null,
            seller_id: 'demo-seller-17',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '山东平邑药材' }
          },
          {
            id: 18,
            name_cn: '连翘',
            name_en: 'Forsythia',
            price: 58.00,
            stock: 105,
            description: '山西连翘，清热解毒，消肿散结，疏散风热',
            image_url: null,
            seller_id: 'demo-seller-18',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '山西太行药材' }
          },
          {
            id: 19,
            name_cn: '板蓝根',
            name_en: 'Isatis Root',
            price: 22.00,
            stock: 250,
            description: '河北板蓝根，清热解毒，凉血利咽',
            image_url: null,
            seller_id: 'demo-seller-19',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '河北安国药材' }
          },
          {
            id: 20,
            name_cn: '黄连',
            name_en: 'Coptis',
            price: 120.00,
            stock: 35,
            description: '四川黄连，清热燥湿，泻火解毒',
            image_url: null,
            seller_id: 'demo-seller-20',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: { business_name: '四川石柱药材' }
          }
        ]

        // Get user-created products from localStorage
        const userCreatedProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]')

        // Combine demo products with user-created products
        const allProductsList = [...demoProducts, ...userCreatedProducts]

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setAllProducts(allProductsList)
        setProducts(allProductsList)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(business_name)
        `)
        .gt('stock', 0) // 只显示有库存的产品
        .order('created_at', { ascending: false })
        .limit(8) // 限制显示8个产品

      if (error) {
        throw error
      }

      setProducts(data || [])
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError('获取产品失败')
    } finally {
      setLoading(false)
    }
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
              {user ? (
                <>
                  {user.role === 'buyer' && (
                    <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                      </svg>
                    </Link>
                  )}
                  <span className="text-gray-600">
                    欢迎, {user.business_name}
                  </span>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    仪表盘
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    登出
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    登录
                  </Link>
                  <Link href="/register" className="btn-primary">
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              中药材B2B平台
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              专业的中药材批发交易平台，连接买家与卖家
            </p>
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL ||
              process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co') && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                <p className="text-sm">
                  <strong>演示模式</strong> - 当前运行在演示模式下，所有数据存储在本地浏览器中
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">买家服务</h3>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• 浏览优质中药材产品</li>
                <li>• 在线下单，便捷采购</li>
                <li>• 订单跟踪与管理</li>
                <li>• 多家供应商比价</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">卖家服务</h3>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• 上传产品信息</li>
                <li>• 管理库存与价格</li>
                <li>• 订单处理与发货</li>
                <li>• 销售数据分析</li>
              </ul>
            </div>
          </div>

          {user ? (
            <div className="space-x-4">
              {user.role === 'buyer' ? (
                <>
                  <Link href="#products" className="btn-primary text-lg px-8 py-3">
                    开始采购
                  </Link>
                  <Link href="/cart" className="btn-secondary text-lg px-8 py-3">
                    查看购物车
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                    管理产品
                  </Link>
                  <Link href="/dashboard/orders" className="btn-secondary text-lg px-8 py-3">
                    查看订单
                  </Link>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="space-x-4">
                <Link href="/login" className="btn-primary text-lg px-8 py-3">
                  立即登录
                </Link>
                <Link href="/register" className="btn-secondary text-lg px-8 py-3">
                  免费注册
                </Link>
              </div>

              <div className="mt-12 text-sm text-gray-500">
                <p>演示版本 - 仅供测试使用</p>
                <div className="mt-4 space-y-1">
                  <p>测试账号：</p>
                  <p>买家: buyer@test.com / 123456</p>
                  <p>卖家: seller@test.com / 123456</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索中药材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 产品展示区域 */}
      <div id="products" className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {searchQuery ? `搜索结果 "${searchQuery}"` : '精选中药材产品'}
          </h2>
          <p className="text-lg text-gray-600">
            {searchQuery ? `找到 ${products.length} 个相关产品` : '优质货源，品质保证'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
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
            <p className="mt-1 text-sm text-gray-500">
              还没有卖家上传产品，请稍后再来查看
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">想要查看更多产品或进行采购？</p>
          <Link href="/login" className="btn-primary text-lg px-8 py-3">
            立即登录开始采购
          </Link>
        </div>
      </div>
    </div>
  )
}
