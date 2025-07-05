'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Product } from '@/utils/supabaseClient';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';

interface ProductWithSeller extends Product {
  seller: {
    business_name: string;
    id: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductWithSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

      if (isDemoMode) {
        // Demo products data - same as homepage
        const demoProducts = [
          {
            id: 1,
            name_cn: '当归',
            name_en: 'Angelica Sinensis',
            price: 45.00,
            stock: 100,
            description: '优质当归，产地甘肃，品质上乘。当归是常用的中药材，具有补血活血、调经止痛的功效。本产品选用甘肃岷县优质当归，经过严格筛选和加工，确保品质纯正。适用于血虚萎黄、眩晕心悸、月经不调、经闭痛经等症状的治疗。',
            image_url: null,
            seller_id: 'demo-seller-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '甘肃中药材有限公司',
              id: 'demo-seller-1'
            }
          },
          {
            id: 2,
            name_cn: '人参',
            name_en: 'Ginseng',
            price: 280.00,
            stock: 50,
            description: '长白山野生人参，滋补佳品。人参被誉为"百草之王"，具有大补元气、复脉固脱、补脾益肺、生津止渴、安神益智的功效。本产品采用长白山地区优质人参，生长年限长，有效成分含量高。适用于体虚欲脱、肢冷脉微、脾虚食少、肺虚喘咳等症状。',
            image_url: null,
            seller_id: 'demo-seller-2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '长白山参业集团',
              id: 'demo-seller-2'
            }
          },
          {
            id: 3,
            name_cn: '枸杞',
            name_en: 'Goji Berry',
            price: 32.00,
            stock: 200,
            description: '宁夏枸杞，颗粒饱满，营养丰富。枸杞具有滋补肝肾、益精明目的功效，是药食同源的珍贵中药材。本产品选用宁夏中宁县优质枸杞，颗粒大、肉质厚、色泽鲜红、味甜微酸。富含枸杞多糖、胡萝卜素、维生素等多种营养成分。适用于肝肾阴虚、腰膝酸软、头晕目眩、目昏多泪等症状。',
            image_url: null,
            seller_id: 'demo-seller-3',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '宁夏枸杞专业合作社',
              id: 'demo-seller-3'
            }
          },
          {
            id: 4,
            name_cn: '黄芪',
            name_en: 'Astragalus',
            price: 38.00,
            stock: 150,
            description: '内蒙古黄芪，补气固表，利尿托毒，排脓生肌。黄芪是重要的补气中药，具有增强免疫力、抗疲劳的功效。本产品选用内蒙古优质黄芪，根条粗壮，质地坚实，有效成分含量高。',
            image_url: null,
            seller_id: 'demo-seller-4',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '内蒙古草原药材',
              id: 'demo-seller-4'
            }
          },
          {
            id: 5,
            name_cn: '白术',
            name_en: 'Atractylodes',
            price: 42.00,
            stock: 120,
            description: '浙江白术，健脾益气，燥湿利水，止汗安胎。白术是健脾的要药，具有调理脾胃、增进食欲的功效。本产品选用浙江于潜优质白术，质地坚实，断面白色，香气浓郁。',
            image_url: null,
            seller_id: 'demo-seller-5',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '浙江道地药材',
              id: 'demo-seller-5'
            }
          },
          {
            id: 6,
            name_cn: '茯苓',
            name_en: 'Poria',
            price: 28.00,
            stock: 180,
            description: '云南茯苓，利水渗湿，健脾宁心。茯苓性平和，具有利水而不伤正气的特点。本产品选用云南优质茯苓，色白质坚，粉性足，是理想的健脾利湿药材。',
            image_url: null,
            seller_id: 'demo-seller-6',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '云南山珍药材',
              id: 'demo-seller-6'
            }
          },
          {
            id: 7,
            name_cn: '甘草',
            name_en: 'Licorice',
            price: 25.00,
            stock: 300,
            description: '新疆甘草，补脾益气，清热解毒，祛痰止咳。甘草被称为"国老"，具有调和诸药的功效。本产品选用新疆优质甘草，根条粗壮，甜味浓郁，是方剂中的重要调和药。',
            image_url: null,
            seller_id: 'demo-seller-7',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '新疆天山药业',
              id: 'demo-seller-7'
            }
          },
          {
            id: 8,
            name_cn: '川芎',
            name_en: 'Chuanxiong',
            price: 55.00,
            stock: 80,
            description: '四川川芎，活血行气，祛风止痛。川芎是活血化瘀的重要药材，具有"血中之气药"的美称。本产品选用四川都江堰优质川芎，香气浓郁，质地坚实。',
            image_url: null,
            seller_id: 'demo-seller-8',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '四川川药集团',
              id: 'demo-seller-8'
            }
          },
          {
            id: 9,
            name_cn: '白芍',
            name_en: 'White Peony',
            price: 48.00,
            stock: 90,
            description: '安徽白芍，养血柔肝，缓中止痛，敛阴收汗。白芍是养血的重要药材，具有柔肝止痛的功效。本产品选用安徽亳州优质白芍，根条粗壮，质地坚实，断面洁白。',
            image_url: null,
            seller_id: 'demo-seller-9',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '安徽亳州药材',
              id: 'demo-seller-9'
            }
          },
          {
            id: 10,
            name_cn: '熟地黄',
            name_en: 'Rehmannia',
            price: 52.00,
            stock: 110,
            description: '河南熟地黄，滋阴补血，益精填髓。熟地黄是补血的要药，具有滋阴补肾的功效。本产品选用河南焦作优质地黄，经过九蒸九晒工艺制成，质地柔润，味甘微苦。',
            image_url: null,
            seller_id: 'demo-seller-10',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '河南怀药堂',
              id: 'demo-seller-10'
            }
          },
          {
            id: 11,
            name_cn: '党参',
            name_en: 'Codonopsis',
            price: 65.00,
            stock: 75,
            description: '甘肃党参，补中益气，健脾益肺。党参是人参的良好替代品，具有补气而不燥的特点。本产品选用甘肃文县优质党参，根条肥大，质地柔润，甜味浓郁。',
            image_url: null,
            seller_id: 'demo-seller-11',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '甘肃陇原药材',
              id: 'demo-seller-11'
            }
          },
          {
            id: 12,
            name_cn: '麦冬',
            name_en: 'Ophiopogon',
            price: 35.00,
            stock: 160,
            description: '浙江麦冬，养阴生津，润肺清心。麦冬是养阴的重要药材，具有滋阴润燥的功效。本产品选用浙江杭州优质麦冬，颗粒饱满，质地柔韧，味甘微苦。',
            image_url: null,
            seller_id: 'demo-seller-12',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '浙江杭白药材',
              id: 'demo-seller-12'
            }
          },
          {
            id: 13,
            name_cn: '五味子',
            name_en: 'Schisandra',
            price: 78.00,
            stock: 60,
            description: '东北五味子，收敛固涩，益气生津，补肾宁心。五味子具有五味俱全的特点，是珍贵的滋补药材。本产品选用东北长白山优质五味子，颗粒饱满，色泽紫红。',
            image_url: null,
            seller_id: 'demo-seller-13',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '东北林下药材',
              id: 'demo-seller-13'
            }
          },
          {
            id: 14,
            name_cn: '山药',
            name_en: 'Chinese Yam',
            price: 30.00,
            stock: 220,
            description: '河南山药，补脾养胃，生津益肺，补肾涩精。山药是药食同源的珍贵药材，具有平补三焦的功效。本产品选用河南焦作优质山药，质地坚实，粉性足。',
            image_url: null,
            seller_id: 'demo-seller-14',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '河南焦作药材',
              id: 'demo-seller-14'
            }
          },
          {
            id: 15,
            name_cn: '丹参',
            name_en: 'Salvia',
            price: 40.00,
            stock: 130,
            description: '山东丹参，活血祛瘀，通经止痛，清心除烦。丹参是活血化瘀的重要药材，具有"一味丹参，功同四物"的美誉。本产品选用山东优质丹参，根条粗壮，色泽紫红。',
            image_url: null,
            seller_id: 'demo-seller-15',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '山东齐鲁药材',
              id: 'demo-seller-15'
            }
          },
          {
            id: 16,
            name_cn: '桔梗',
            name_en: 'Platycodon',
            price: 33.00,
            stock: 140,
            description: '安徽桔梗，宣肺，利咽，祛痰，排脓。桔梗是宣肺化痰的重要药材，具有开宣肺气的功效。本产品选用安徽优质桔梗，根条粗壮，质地坚实，味苦微辛。',
            image_url: null,
            seller_id: 'demo-seller-16',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '安徽皖南药材',
              id: 'demo-seller-16'
            }
          },
          {
            id: 17,
            name_cn: '金银花',
            name_en: 'Honeysuckle',
            price: 85.00,
            stock: 95,
            description: '山东金银花，清热解毒，疏散风热。金银花是清热解毒的重要药材，具有广谱抗菌的功效。本产品选用山东平邑优质金银花，花蕾饱满，色泽金黄，香气清香。',
            image_url: null,
            seller_id: 'demo-seller-17',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '山东平邑药材',
              id: 'demo-seller-17'
            }
          },
          {
            id: 18,
            name_cn: '连翘',
            name_en: 'Forsythia',
            price: 58.00,
            stock: 105,
            description: '山西连翘，清热解毒，消肿散结，疏散风热。连翘是清热解毒的重要药材，常与金银花配伍使用。本产品选用山西优质连翘，果实饱满，色泽黄褐。',
            image_url: null,
            seller_id: 'demo-seller-18',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '山西太行药材',
              id: 'demo-seller-18'
            }
          },
          {
            id: 19,
            name_cn: '板蓝根',
            name_en: 'Isatis Root',
            price: 22.00,
            stock: 250,
            description: '河北板蓝根，清热解毒，凉血利咽。板蓝根是清热解毒的常用药材，具有抗病毒的功效。本产品选用河北安国优质板蓝根，根条粗壮，质地坚实，味苦性寒。',
            image_url: null,
            seller_id: 'demo-seller-19',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '河北安国药材',
              id: 'demo-seller-19'
            }
          },
          {
            id: 20,
            name_cn: '黄连',
            name_en: 'Coptis',
            price: 120.00,
            stock: 35,
            description: '四川黄连，清热燥湿，泻火解毒。黄连是清热燥湿的重要药材，具有强烈的抗菌消炎功效。本产品选用四川石柱优质黄连，根茎粗壮，断面金黄，味极苦。',
            image_url: null,
            seller_id: 'demo-seller-20',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            seller: {
              business_name: '四川石柱药材',
              id: 'demo-seller-20'
            }
          }
        ];

        // Get user-created products from localStorage
        const userCreatedProducts = JSON.parse(localStorage.getItem('demo_seller_products') || '[]');

        // Combine demo products with user-created products
        const allProducts = [...demoProducts, ...userCreatedProducts];

        // Find the product by ID
        const foundProduct = allProducts.find(p => p.id.toString() === productId);

        if (!foundProduct) {
          throw new Error('产品未找到');
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setProduct(foundProduct);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(business_name, id)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        throw error;
      }

      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError('获取产品详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'buyer') {
      alert('只有买家可以购买产品');
      return;
    }

    setAddingToCart(true);

    try {
      addItem({
        productId: product!.id,
        productName: product!.name_cn,
        price: product!.price,
        quantity: quantity,
        sellerName: product!.seller.business_name
      });

      alert(`已添加 ${quantity}kg ${product!.name_cn} 到购物车`);
    } catch (error) {
      alert('添加到购物车失败，请重试');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'buyer') {
      alert('只有买家可以购买产品');
      return;
    }

    setBuyingNow(true);

    try {
      // Create a temporary cart item for immediate purchase
      const tempCartItem = {
        productId: product!.id,
        productName: product!.name_cn,
        price: product!.price,
        quantity: quantity,
        sellerName: product!.seller.business_name
      };

      // Store the temp item in sessionStorage for checkout
      sessionStorage.setItem('buyNowItem', JSON.stringify(tempCartItem));

      // Redirect to a special checkout page for buy now
      router.push('/checkout?buyNow=true');
    } catch (error) {
      alert('立即购买失败，请重试');
    } finally {
      setBuyingNow(false);
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">产品未找到</h1>
          <p className="text-gray-600 mb-8">{error || '请检查产品链接是否正确'}</p>
          <Link href="/" className="btn-primary">
            返回首页
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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                返回首页
              </Link>
              {user && user.role === 'buyer' && (
                <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                  </svg>
                </Link>
              )}
              {user ? (
                <Link href="/dashboard" className="btn-primary">
                  仪表盘
                </Link>
              ) : (
                <Link href="/login" className="btn-primary">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 产品详情 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
            {/* 产品图片 */}
            <div className="flex flex-col-reverse">
              <div className="aspect-w-1 aspect-h-1 w-full">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name_cn}
                    className="w-full h-96 object-cover object-center sm:rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center sm:rounded-lg">
                    <span className="text-green-600 font-medium text-4xl">
                      {product.name_cn.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 产品信息 */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {product.name_cn}
              </h1>

              <div className="mt-3">
                <h2 className="sr-only">产品信息</h2>
                <p className="text-3xl text-red-600 font-bold">
                  ¥{product.price.toFixed(2)} / kg
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">供应商</h3>
                <p className="mt-1 text-sm text-gray-600">{product.seller.business_name}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">库存</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {product.stock > 0 ? `${product.stock} kg` : '缺货'}
                </p>
              </div>

              {product.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">产品描述</h3>
                  <div className="mt-1 text-sm text-gray-600 space-y-2">
                    <p>{product.description}</p>
                  </div>
                </div>
              )}

              {product.stock > 0 && (
                <div className="mt-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                      数量 (kg)
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || buyingNow}
                      className="btn-secondary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart ? '添加中...' : '加入购物车'}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={buyingNow || addingToCart}
                      className="btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buyingNow ? '处理中...' : '立即购买'}
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      小计: ¥{(product.price * quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {product.stock === 0 && (
                <div className="mt-8">
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-md text-lg cursor-not-allowed"
                  >
                    暂时缺货
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
