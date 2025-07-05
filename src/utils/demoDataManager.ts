// Demo Data Manager - Centralized localStorage management
// This ensures data persistence across app restarts

export interface DemoProduct {
  id: number | string;
  name_cn: string;
  name_en?: string;
  price: number;
  stock: number;
  description?: string;
  image_url?: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  seller: {
    business_name: string;
    id: string;
  };
  stock_status?: 'in_stock' | 'out_of_stock';
  quality_report?: {
    file_name: string;
    file_url: string;
    uploaded_at: string;
  };
  audit_status?: 'pending' | 'approved' | 'rejected';
}

export interface DemoOrder {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  buyer: {
    business_name: string;
    email: string;
  };
  order_items: {
    id: string | number;
    order_id: string;
    product_id: string | number;
    quantity: number;
    unit_price: number;
    product: {
      name_cn: string;
      seller: {
        business_name: string;
      };
    };
  }[];
  processing?: {
    options: {
      slicing: boolean;
      grinding: boolean;
      packaging: boolean;
    };
    cost: number;
    requested_at: string;
    status: string;
  };
}

export interface DemoUser {
  id: string;
  email: string;
  business_name: string;
  role: 'buyer' | 'seller' | 'admin';
  created_at: string;
}

export interface GroupBuyActivity {
  id: string;
  product_name: string;
  target_quantity: number;
  current_quantity: number;
  unit_price: number;
  group_price: number;
  end_date: string;
  participants: number;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
}

// Admin-related interfaces
export interface BuyingRequest {
  id: string;
  buyer_id: string;
  product_name: string;
  quantity: number;
  target_price: number;
  description: string;
  status: 'pending' | 'admin_approved' | 'sent_to_seller' | 'seller_responded' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  admin_approved_at?: string;
  admin_notes?: string;
  buyer: {
    business_name: string;
    email: string;
  };
  seller_responses?: SellerResponse[];
}

export interface SellerResponse {
  id: string;
  request_id: string;
  seller_id: string;
  offered_price: number;
  available_quantity: number;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  seller: {
    business_name: string;
    email: string;
  };
}

export interface AdminProductReview {
  id: string;
  product_id: string;
  seller_id: string;
  original_price: number;
  admin_adjusted_price?: number;
  admin_notes?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'needs_revision';
  reviewed_at?: string;
  created_at: string;
  product: DemoProduct;
}

// Storage keys
const STORAGE_KEYS = {
  DEMO_PRODUCTS: 'demo_products',
  DEMO_SELLER_PRODUCTS: 'demo_seller_products',
  DEMO_ORDERS: 'demo_orders',
  DEMO_USERS: 'demo_users',
  DEMO_CURRENT_USER: 'demo_current_user',
  GROUP_BUY_ACTIVITIES: 'demo_group_buy_activities',
  BUYING_REQUESTS: 'demo_buying_requests',
  SELLER_RESPONSES: 'demo_seller_responses',
  ADMIN_PRODUCT_REVIEWS: 'demo_admin_product_reviews',
  CART: 'cart',
  DATA_VERSION: 'demo_data_version'
} as const;

// Current data version - increment when structure changes
const CURRENT_DATA_VERSION = '1.0.0';

class DemoDataManager {
  private isClient = typeof window !== 'undefined';

  // Check if we're in demo mode
  isDemoMode(): boolean {
    return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
           process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';
  }

  // Safe localStorage operations
  private getItem(key: string): string | null {
    if (!this.isClient) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return null;
    }
  }

  private setItem(key: string, value: string): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
    }
  }

  private removeItem(key: string): void {
    if (!this.isClient) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key ${key}:`, error);
    }
  }

  // Initialize demo data if not exists
  initializeDemoData(): void {
    if (!this.isDemoMode() || !this.isClient) return;

    const currentVersion = this.getItem(STORAGE_KEYS.DATA_VERSION);
    
    // If version doesn't match or no data exists, initialize
    if (currentVersion !== CURRENT_DATA_VERSION) {
      this.initializeDefaultData();
      this.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
    }
  }

  private initializeDefaultData(): void {
    // Initialize demo products if empty
    const existingProducts = this.getDemoProducts();
    if (existingProducts.length === 0) {
      this.setDemoProducts(this.getDefaultProducts());
    }

    // Initialize group buy activities if empty
    const existingGroupBuy = this.getGroupBuyActivities();
    if (existingGroupBuy.length === 0) {
      this.setGroupBuyActivities(this.getDefaultGroupBuyActivities());
    }

    // Initialize demo users if empty, or migrate existing users
    this.migrateUsers();
  }

  // Demo Products Management
  getDemoProducts(): DemoProduct[] {
    const data = this.getItem(STORAGE_KEYS.DEMO_PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  setDemoProducts(products: DemoProduct[]): void {
    this.setItem(STORAGE_KEYS.DEMO_PRODUCTS, JSON.stringify(products));
  }

  // Seller Products Management
  getDemoSellerProducts(): DemoProduct[] {
    const data = this.getItem(STORAGE_KEYS.DEMO_SELLER_PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  setDemoSellerProducts(products: DemoProduct[]): void {
    this.setItem(STORAGE_KEYS.DEMO_SELLER_PRODUCTS, JSON.stringify(products));
  }

  // Orders Management
  getDemoOrders(): DemoOrder[] {
    const data = this.getItem(STORAGE_KEYS.DEMO_ORDERS);
    return data ? JSON.parse(data) : [];
  }

  setDemoOrders(orders: DemoOrder[]): void {
    this.setItem(STORAGE_KEYS.DEMO_ORDERS, JSON.stringify(orders));
  }

  // Users Management
  getDemoUsers(): DemoUser[] {
    const data = this.getItem(STORAGE_KEYS.DEMO_USERS);
    return data ? JSON.parse(data) : [];
  }

  setDemoUsers(users: DemoUser[]): void {
    this.setItem(STORAGE_KEYS.DEMO_USERS, JSON.stringify(users));
  }

  getCurrentDemoUser(): DemoUser | null {
    const data = this.getItem(STORAGE_KEYS.DEMO_CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  setCurrentDemoUser(user: DemoUser | null): void {
    if (user) {
      this.setItem(STORAGE_KEYS.DEMO_CURRENT_USER, JSON.stringify(user));
    } else {
      this.removeItem(STORAGE_KEYS.DEMO_CURRENT_USER);
    }
  }

  // Group Buy Activities Management
  getGroupBuyActivities(): GroupBuyActivity[] {
    const data = this.getItem(STORAGE_KEYS.GROUP_BUY_ACTIVITIES);
    return data ? JSON.parse(data) : [];
  }

  setGroupBuyActivities(activities: GroupBuyActivity[]): void {
    this.setItem(STORAGE_KEYS.GROUP_BUY_ACTIVITIES, JSON.stringify(activities));
  }

  // Get all products (demo + seller created) - only admin-approved products visible in market
  getAllProducts(): DemoProduct[] {
    const demoProducts = this.getDemoProducts();
    const sellerProducts = this.getDemoSellerProducts();
    const allProducts = [...demoProducts, ...sellerProducts];

    // Auto-approve existing seller products that don't have review records (migration)
    this.migrateExistingProducts();

    // Filter to only show admin-approved products
    const approvedReviews = this.getAdminProductReviews().filter(r => r.status === 'approved');
    const approvedProductIds = new Set(approvedReviews.map(r => r.product_id));

    return allProducts.filter(product => {
      // Demo products (hardcoded) are always approved
      const isDemoProduct = demoProducts.some(p => p.id === product.id);
      if (isDemoProduct) return true;

      // Seller products need admin approval
      return approvedProductIds.has(product.id.toString());
    });
  }

  // Get all products including pending ones (for admin use)
  getAllProductsIncludingPending(): DemoProduct[] {
    const demoProducts = this.getDemoProducts();
    const sellerProducts = this.getDemoSellerProducts();
    return [...demoProducts, ...sellerProducts];
  }

  // Migration function to auto-approve existing seller products
  private migrateExistingProducts(): void {
    const sellerProducts = this.getDemoSellerProducts();
    const existingReviews = this.getAdminProductReviews();
    const reviewedProductIds = new Set(existingReviews.map(r => r.product_id));

    // Find seller products that don't have review records
    const unreviewed = sellerProducts.filter(p => !reviewedProductIds.has(p.id.toString()));

    if (unreviewed.length > 0) {
      console.log(`Auto-approving ${unreviewed.length} existing products for backward compatibility`);

      // Create approved review records for existing products
      unreviewed.forEach(product => {
        const review: AdminProductReview = {
          id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          product_id: product.id.toString(),
          seller_id: product.seller_id,
          original_price: product.price,
          adjusted_price: product.price, // Keep original price
          status: 'approved',
          admin_notes: 'Auto-approved existing product',
          created_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString(),
          product: {
            name_cn: product.name_cn,
            description: product.description || ''
          },
          seller: {
            business_name: product.seller?.business_name || 'Unknown Seller'
          }
        };

        existingReviews.push(review);
      });

      this.setAdminProductReviews(existingReviews);
    }
  }

  // Migration function to preserve existing users and add admin if missing
  private migrateUsers(): void {
    // First, check for users in old localStorage key and migrate them
    this.migrateOldUserData();

    const existingUsers = this.getDemoUsers();

    if (existingUsers.length === 0) {
      // No existing users, initialize with defaults
      this.setDemoUsers(this.getDefaultUsers());
      return;
    }

    // Check if admin user exists
    const hasAdmin = existingUsers.some(user => user.role === 'admin');

    if (!hasAdmin) {
      // Add admin user to existing users
      const adminUser: DemoUser = {
        id: 'demo-admin-1',
        email: 'admin@platform.com',
        business_name: '中药材B2B平台管理中心',
        role: 'admin',
        created_at: new Date().toISOString()
      };

      existingUsers.push(adminUser);
      this.setDemoUsers(existingUsers);
      console.log('Added admin user to existing user list');
    }
  }

  // Migrate users from old localStorage key to centralized system
  private migrateOldUserData(): void {
    if (typeof window === 'undefined') return;

    const oldUsers = localStorage.getItem('demo_users');
    const oldCurrentUser = localStorage.getItem('demo_current_user');

    if (oldUsers) {
      try {
        const parsedUsers = JSON.parse(oldUsers);
        const existingUsers = this.getDemoUsers();

        // Convert old users to DemoUser format and merge with existing
        const migratedUsers: DemoUser[] = parsedUsers.map((user: any) => ({
          id: user.id,
          email: user.email || user.id,
          business_name: user.business_name,
          role: user.role,
          created_at: user.created_at
        }));

        // Merge with existing users (avoid duplicates)
        const allUsers = [...existingUsers];
        migratedUsers.forEach(migratedUser => {
          if (!allUsers.some(u => u.id === migratedUser.id)) {
            allUsers.push(migratedUser);
          }
        });

        this.setDemoUsers(allUsers);
        console.log(`Migrated ${migratedUsers.length} users from old storage`);

        // Remove old data
        localStorage.removeItem('demo_users');
      } catch (error) {
        console.error('Error migrating old user data:', error);
      }
    }

    if (oldCurrentUser) {
      try {
        const parsedCurrentUser = JSON.parse(oldCurrentUser);
        const currentUser = this.getCurrentDemoUser();

        if (!currentUser) {
          // Migrate current user
          const migratedCurrentUser: DemoUser = {
            id: parsedCurrentUser.id,
            email: parsedCurrentUser.email || parsedCurrentUser.id,
            business_name: parsedCurrentUser.business_name,
            role: parsedCurrentUser.role,
            created_at: parsedCurrentUser.created_at
          };

          this.setCurrentDemoUser(migratedCurrentUser);
          console.log('Migrated current user from old storage');
        }

        // Remove old data
        localStorage.removeItem('demo_current_user');
      } catch (error) {
        console.error('Error migrating old current user data:', error);
      }
    }
  }

  // Clear all demo data (for testing/reset)
  clearAllDemoData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // Export data for backup
  exportDemoData(): string {
    const data = {
      version: CURRENT_DATA_VERSION,
      timestamp: new Date().toISOString(),
      products: this.getDemoProducts(),
      sellerProducts: this.getDemoSellerProducts(),
      orders: this.getDemoOrders(),
      users: this.getDemoUsers(),
      currentUser: this.getCurrentDemoUser(),
      groupBuyActivities: this.getGroupBuyActivities()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data from backup
  importDemoData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.products) this.setDemoProducts(data.products);
      if (data.sellerProducts) this.setDemoSellerProducts(data.sellerProducts);
      if (data.orders) this.setDemoOrders(data.orders);
      if (data.users) this.setDemoUsers(data.users);
      if (data.currentUser) this.setCurrentDemoUser(data.currentUser);
      if (data.groupBuyActivities) this.setGroupBuyActivities(data.groupBuyActivities);
      
      this.setItem(STORAGE_KEYS.DATA_VERSION, data.version || CURRENT_DATA_VERSION);
      return true;
    } catch (error) {
      console.error('Error importing demo data:', error);
      return false;
    }
  }

  // Default data generators
  private getDefaultProducts(): DemoProduct[] {
    return [
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
        seller: {
          business_name: '甘肃中药材有限公司',
          id: 'demo-seller-1'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
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
        seller: {
          business_name: '长白山参业集团',
          id: 'demo-seller-2'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
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
        seller: {
          business_name: '宁夏枸杞专业合作社',
          id: 'demo-seller-3'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
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
        seller: {
          business_name: '内蒙古草原药材',
          id: 'demo-seller-4'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 5,
        name_cn: '川芎',
        name_en: 'Ligusticum',
        price: 42.00,
        stock: 120,
        description: '四川川芎，活血行气，祛风止痛',
        image_url: null,
        seller_id: 'demo-seller-5',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '四川道地药材',
          id: 'demo-seller-5'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 6,
        name_cn: '白芍',
        name_en: 'White Peony Root',
        price: 35.00,
        stock: 180,
        description: '安徽白芍，养血柔肝，缓中止痛',
        image_url: null,
        seller_id: 'demo-seller-6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '安徽亳州药材',
          id: 'demo-seller-6'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 7,
        name_cn: '熟地黄',
        name_en: 'Prepared Rehmannia',
        price: 48.00,
        stock: 90,
        description: '河南熟地黄，滋阴补血，益精填髓',
        image_url: null,
        seller_id: 'demo-seller-7',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '河南怀药集团',
          id: 'demo-seller-7'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 8,
        name_cn: '茯苓',
        name_en: 'Poria',
        price: 28.00,
        stock: 220,
        description: '云南茯苓，利水渗湿，健脾宁心',
        image_url: null,
        seller_id: 'demo-seller-8',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '云南天然药材',
          id: 'demo-seller-8'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 9,
        name_cn: '白术',
        name_en: 'Atractylodes',
        price: 52.00,
        stock: 110,
        description: '浙江白术，健脾益气，燥湿利水',
        image_url: null,
        seller_id: 'demo-seller-9',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '浙江磐安药材',
          id: 'demo-seller-9'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 10,
        name_cn: '甘草',
        name_en: 'Licorice Root',
        price: 25.00,
        stock: 300,
        description: '新疆甘草，补脾益气，清热解毒',
        image_url: null,
        seller_id: 'demo-seller-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '新疆甘草专业社',
          id: 'demo-seller-10'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 11,
        name_cn: '党参',
        name_en: 'Codonopsis',
        price: 38.00,
        stock: 140,
        description: '山西党参，补中益气，健脾益肺',
        image_url: null,
        seller_id: 'demo-seller-11',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '山西上党参业',
          id: 'demo-seller-11'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 12,
        name_cn: '麦冬',
        name_en: 'Ophiopogon',
        price: 45.00,
        stock: 160,
        description: '浙江麦冬，养阴生津，润肺清心',
        image_url: null,
        seller_id: 'demo-seller-12',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '浙江杭白菊合作社',
          id: 'demo-seller-12'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 13,
        name_cn: '五味子',
        name_en: 'Schisandra',
        price: 68.00,
        stock: 80,
        description: '东北五味子，收敛固涩，益气生津',
        image_url: null,
        seller_id: 'demo-seller-13',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '东北林下资源',
          id: 'demo-seller-13'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 14,
        name_cn: '山药',
        name_en: 'Chinese Yam',
        price: 32.00,
        stock: 200,
        description: '河南怀山药，补脾养胃，生津益肺',
        image_url: null,
        seller_id: 'demo-seller-14',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '河南怀药基地',
          id: 'demo-seller-14'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 15,
        name_cn: '丹参',
        name_en: 'Salvia',
        price: 55.00,
        stock: 95,
        description: '山东丹参，活血祛瘀，通经止痛',
        image_url: null,
        seller_id: 'demo-seller-15',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '山东丹参种植园',
          id: 'demo-seller-15'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 16,
        name_cn: '桔梗',
        name_en: 'Platycodon',
        price: 42.00,
        stock: 130,
        description: '安徽桔梗，宣肺，利咽，祛痰',
        image_url: null,
        seller_id: 'demo-seller-16',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '安徽桔梗专业社',
          id: 'demo-seller-16'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 17,
        name_cn: '陈皮',
        name_en: 'Tangerine Peel',
        price: 38.00,
        stock: 170,
        description: '广东新会陈皮，理气健脾，燥湿化痰',
        image_url: null,
        seller_id: 'demo-seller-17',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '广东新会陈皮厂',
          id: 'demo-seller-17'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 18,
        name_cn: '半夏',
        name_en: 'Pinellia',
        price: 48.00,
        stock: 85,
        description: '贵州半夏，燥湿化痰，降逆止呕',
        image_url: null,
        seller_id: 'demo-seller-18',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '贵州山地药材',
          id: 'demo-seller-18'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 19,
        name_cn: '柴胡',
        name_en: 'Bupleurum',
        price: 65.00,
        stock: 75,
        description: '山西柴胡，疏肝解郁，升阳举陷',
        image_url: null,
        seller_id: 'demo-seller-19',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '山西柴胡种植基地',
          id: 'demo-seller-19'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      },
      {
        id: 20,
        name_cn: '黄连',
        name_en: 'Coptis',
        price: 120.00,
        stock: 45,
        description: '四川黄连，清热燥湿，泻火解毒',
        image_url: null,
        seller_id: 'demo-seller-20',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seller: {
          business_name: '四川黄连专业合作社',
          id: 'demo-seller-20'
        },
        stock_status: 'in_stock',
        audit_status: 'approved'
      }
    ];
  }

  private getDefaultUsers(): DemoUser[] {
    return [
      {
        id: 'demo-buyer-1',
        email: 'buyer@demo.com',
        business_name: '北京中医药贸易公司',
        role: 'buyer',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-seller-1',
        email: 'seller@demo.com',
        business_name: '甘肃中药材有限公司',
        role: 'seller',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-admin-1',
        email: 'admin@platform.com',
        business_name: '中药材B2B平台管理中心',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ];
  }

  private getDefaultGroupBuyActivities(): GroupBuyActivity[] {
    return [
      {
        id: '1',
        product_name: '当归',
        target_quantity: 1000,
        current_quantity: 750,
        unit_price: 45.00,
        group_price: 38.00,
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participants: 15,
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
  }

  // Admin-related methods
  getBuyingRequests(): BuyingRequest[] {
    if (!this.isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUYING_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting buying requests:', error);
      return [];
    }
  }

  setBuyingRequests(requests: BuyingRequest[]): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BUYING_REQUESTS, JSON.stringify(requests));
    } catch (error) {
      console.error('Error setting buying requests:', error);
    }
  }

  getSellerResponses(): SellerResponse[] {
    if (!this.isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SELLER_RESPONSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting seller responses:', error);
      return [];
    }
  }

  setSellerResponses(responses: SellerResponse[]): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SELLER_RESPONSES, JSON.stringify(responses));
    } catch (error) {
      console.error('Error setting seller responses:', error);
    }
  }

  getAdminProductReviews(): AdminProductReview[] {
    if (!this.isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_PRODUCT_REVIEWS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting admin product reviews:', error);
      return [];
    }
  }

  setAdminProductReviews(reviews: AdminProductReview[]): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PRODUCT_REVIEWS, JSON.stringify(reviews));
    } catch (error) {
      console.error('Error setting admin product reviews:', error);
    }
  }

  // Admin workflow methods
  createBuyingRequest(request: Omit<BuyingRequest, 'id' | 'created_at' | 'updated_at'>): string {
    const newRequest: BuyingRequest = {
      ...request,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const requests = this.getBuyingRequests();
    requests.push(newRequest);
    this.setBuyingRequests(requests);

    return newRequest.id;
  }

  approveBuyingRequest(requestId: string, adminNotes?: string): boolean {
    const requests = this.getBuyingRequests();
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) return false;

    requests[requestIndex] = {
      ...requests[requestIndex],
      status: 'admin_approved',
      admin_approved_at: new Date().toISOString(),
      admin_notes,
      updated_at: new Date().toISOString()
    };

    this.setBuyingRequests(requests);
    return true;
  }

  createProductReview(productId: string, sellerId: string, originalPrice: number): string {
    const products = this.getAllProductsIncludingPending();
    const product = products.find(p => p.id.toString() === productId);

    if (!product) throw new Error('Product not found');

    const review: AdminProductReview = {
      id: Date.now().toString(),
      product_id: productId,
      seller_id: sellerId,
      original_price: originalPrice,
      status: 'pending_review',
      created_at: new Date().toISOString(),
      product: product
    };

    const reviews = this.getAdminProductReviews();
    reviews.push(review);
    this.setAdminProductReviews(reviews);

    return review.id;
  }

  approveProductWithPriceAdjustment(reviewId: string, adjustedPrice?: number, adminNotes?: string): boolean {
    const reviews = this.getAdminProductReviews();
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) return false;

    const review = reviews[reviewIndex];

    // Update the review
    reviews[reviewIndex] = {
      ...review,
      status: 'approved',
      admin_adjusted_price: adjustedPrice,
      admin_notes,
      reviewed_at: new Date().toISOString()
    };

    this.setAdminProductReviews(reviews);

    // Update the actual product with admin-adjusted price if provided
    if (adjustedPrice !== undefined) {
      const allProducts = this.getAllProductsIncludingPending();
      const productIndex = allProducts.findIndex(p => p.id.toString() === review.product_id);

      if (productIndex !== -1) {
        allProducts[productIndex].price = adjustedPrice;

        // Update in the appropriate storage
        const demoProducts = this.getDemoProducts();
        const sellerProducts = this.getDemoSellerProducts();

        const demoIndex = demoProducts.findIndex(p => p.id.toString() === review.product_id);
        const sellerIndex = sellerProducts.findIndex(p => p.id.toString() === review.product_id);

        if (demoIndex !== -1) {
          demoProducts[demoIndex].price = adjustedPrice;
          this.setDemoProducts(demoProducts);
        } else if (sellerIndex !== -1) {
          sellerProducts[sellerIndex].price = adjustedPrice;
          this.setDemoSellerProducts(sellerProducts);
        }
      }
    }

    return true;
  }
}

// Export singleton instance
export const demoDataManager = new DemoDataManager();

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  demoDataManager.initializeDemoData();
}
