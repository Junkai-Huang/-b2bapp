import { supabase, User } from './supabaseClient'

// Check if we're in demo mode (when Supabase is not properly configured)
const isDemoMode = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co'
}

// Demo mode storage helpers
const getDemoUsers = (): User[] => {
  if (typeof window === 'undefined') return []
  const users = localStorage.getItem('demo_users')
  return users ? JSON.parse(users) : []
}

const setDemoUsers = (users: User[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('demo_users', JSON.stringify(users))
}

const getCurrentDemoUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const currentUser = localStorage.getItem('demo_current_user')
  return currentUser ? JSON.parse(currentUser) : null
}

const setCurrentDemoUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('demo_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('demo_current_user')
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
  role: 'buyer' | 'seller',
  businessName: string
) => {
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
      created_at: new Date().toISOString()
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
    // Demo mode login
    const users = getDemoUsers()
    const user = users.find(u => u.id === email)

    if (!user) {
      throw new Error('用户不存在')
    }

    // In demo mode, any password works
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
