import { supabase, User } from './supabaseClient'
import { demoDataManager, DemoUser } from './demoDataManager'

// Check if we're in demo mode (when Supabase is not properly configured)
const isDemoMode = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co'
}

// Demo mode storage helpers using centralized demoDataManager
const getDemoUsers = (): User[] => {
  if (typeof window === 'undefined') return []
  const demoUsers = demoDataManager.getDemoUsers()
  // Convert DemoUser to User format
  return demoUsers.map(user => ({
    id: user.id,
    role: user.role,
    business_name: user.business_name,
    created_at: user.created_at,
    email: user.email
  }))
}

const setDemoUsers = (users: User[]) => {
  if (typeof window === 'undefined') return
  // Convert User to DemoUser format
  const demoUsers: DemoUser[] = users.map(user => ({
    id: user.id,
    email: user.email || user.id,
    business_name: user.business_name,
    role: user.role,
    created_at: user.created_at
  }))
  demoDataManager.setDemoUsers(demoUsers)
}

const getCurrentDemoUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const demoUser = demoDataManager.getCurrentDemoUser()
  if (!demoUser) return null

  return {
    id: demoUser.id,
    role: demoUser.role,
    business_name: demoUser.business_name,
    created_at: demoUser.created_at,
    email: demoUser.email
  }
}

const setCurrentDemoUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    const demoUser: DemoUser = {
      id: user.id,
      email: user.email || user.id,
      business_name: user.business_name,
      role: user.role,
      created_at: user.created_at
    }
    demoDataManager.setCurrentDemoUser(demoUser)
  } else {
    demoDataManager.setCurrentDemoUser(null)
  }
}

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User | null> => {
  if (isDemoMode()) {
    return getCurrentDemoUser()
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// 检查用户是否已登录
export const checkAuthStatus = async () => {
  if (isDemoMode()) {
    return getCurrentDemoUser()
  }

  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

// 登出
export const signOut = async () => {
  if (isDemoMode()) {
    setCurrentDemoUser(null)
    return
  }

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// 注册新用户
export const signUpUser = async (
  email: string,
  password: string,
  role: 'buyer' | 'seller' | 'admin',
  businessName: string,
  adminCode?: string
) => {
  // Check admin registration
  if (role === 'admin') {
    if (adminCode !== '234567') {
      throw new Error('管理员注册码错误')
    }
    // Only allow specific admin email
    if (email !== 'admin@platform.com') {
      throw new Error('管理员账号只能使用指定邮箱: admin@platform.com')
    }
  }
  if (isDemoMode()) {
    // Demo mode registration
    const users = getDemoUsers()

    // Check if user already exists
    if (users.find(u => u.id === email)) {
      throw new Error('该邮箱已被注册')
    }

    // Create new demo user
    const newUser: User = {
      id: email, // Use email as ID in demo mode
      role,
      business_name: businessName,
      created_at: new Date().toISOString(),
      email: email
    }

    // Add to demo users
    users.push(newUser)
    setDemoUsers(users)

    // Set as current user
    setCurrentDemoUser(newUser)

    return { user: { id: email, email }, session: null }
  }

  try {
    // 1. 注册用户到 Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('注册失败：未能创建用户')
    }

    // 2. 将用户信息插入到 users 表
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          role,
          business_name: businessName,
        }
      ])

    if (userError) {
      console.error('Error inserting user data:', userError)
      throw userError
    }

    return { user: authData.user, session: authData.session }
  } catch (error) {
    console.error('Error in signUpUser:', error)
    throw error
  }
}

// 登录用户
export const signInUser = async (email: string, password: string) => {
  if (isDemoMode()) {
    // Special hardcoded admin account
    if (email === 'admin@platform.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'demo-admin-1',
        email: 'admin@platform.com',
        role: 'admin',
        business_name: '中药材B2B平台管理中心',
        created_at: new Date().toISOString()
      }
      setCurrentDemoUser(adminUser)
      return { user: { id: adminUser.id, email }, session: null }
    }

    // Demo mode login for regular users
    const users = getDemoUsers()
    const user = users.find(u => u.id === email)

    if (!user) {
      throw new Error('用户不存在')
    }

    // In demo mode, any password works for non-admin users
    setCurrentDemoUser(user)
    return { user: { id: email, email }, session: null }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}
