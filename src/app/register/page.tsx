'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpUser } from '@/utils/authHelpers'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller' | 'admin',
    businessName: '',
    adminCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // 表单验证
    if (formData.password !== formData.confirmPassword) {
      setError('密码确认不匹配')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      setLoading(false)
      return
    }

    if (!formData.businessName.trim()) {
      setError('请填写企业名称')
      setLoading(false)
      return
    }

    // Admin registration validation
    if (formData.role === 'admin') {
      if (!formData.adminCode.trim()) {
        setError('管理员注册需要提供注册码')
        setLoading(false)
        return
      }
      if (formData.email !== 'admin@platform.com') {
        setError('管理员账号只能使用指定邮箱: admin@platform.com')
        setLoading(false)
        return
      }
    }

    try {
      await signUpUser(
        formData.email,
        formData.password,
        formData.role,
        formData.businessName,
        formData.adminCode || undefined
      )

      // Check if we're in demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co'

      if (isDemoMode) {
        setSuccess('注册成功！您现在可以使用相同的邮箱和密码登录。')
      } else {
        setSuccess('注册成功！请检查邮箱验证链接。')
      }

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              立即登录
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessName" className="form-label">
                企业名称
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="input-field"
                placeholder="请输入企业名称"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                用户类型
              </label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="buyer">买家</option>
                <option value="seller">卖家</option>
                <option value="admin">管理员</option>
              </select>
            </div>

            {formData.role === 'admin' && (
              <div className="form-group">
                <label htmlFor="adminCode" className="form-label">
                  管理员注册码
                </label>
                <input
                  id="adminCode"
                  name="adminCode"
                  type="password"
                  required
                  className="input-field"
                  placeholder="请输入管理员注册码"
                  value={formData.adminCode}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-600">
                  管理员注册需要特殊注册码，请联系系统管理员获取
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
