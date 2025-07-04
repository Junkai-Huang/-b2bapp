'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import type { User } from '../utils/supabaseClient';
import { signInUser, signOut, getCurrentUser } from '../utils/authHelpers';

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取用户信息
  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
  };

  // 登录函数
  const login = async (email: string, password: string) => {
    try {
      const result = await signInUser(email, password);

      // Get user data using the helper function
      const userData = await getCurrentUser();
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || '登录失败，请重试' };
    }
  };

  // 登出函数
  const logout = async () => {
    await signOut();
    setUser(null);
  };

  // 监听认证状态变化
  useEffect(() => {
    const initializeAuth = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };

    initializeAuth();

    // Check if we're in demo mode
    const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co';

    if (!isDemoMode) {
      // Only set up Supabase auth listener if not in demo mode
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const userData = await fetchUser(session.user.id);
            setUser(userData);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 自定义 hook
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
