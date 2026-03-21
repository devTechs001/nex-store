// src/pages/Auth/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Github, Chrome } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { Button, Input } from '../../components/common'
import { Logo } from '../../components/common/Logo'

const Login = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { login, loading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await login(formData, {
      onSuccess: () => {
        toast.success('Welcome back!')
        navigate('/')
      },
      onError: (err) => {
        toast.error(err || 'Login failed')
      },
    })

    if (!result.success) {
      setErrors({ submit: result.error })
    }
  }

  const handleSocialLogin = async (provider) => {
    toast.info(`${provider} login coming soon!`)
    // TODO: Implement OAuth flow
    // const result = await authService.loginWithProvider(provider)
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <Logo size="md" />
          </Link>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-text-muted mb-8">
            Sign in to continue to your account
          </p>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              icon={Chrome}
              onClick={() => handleSocialLogin('Google')}
              fullWidth
            >
              Google
            </Button>
            <Button
              variant="outline"
              icon={Github}
              onClick={() => handleSocialLogin('GitHub')}
              fullWidth
            >
              GitHub
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bg-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg text-text-muted">or continue with email</span>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-text-muted hover:text-text"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-bg-secondary bg-bg checked:bg-main"
                />
                <span className="text-sm text-text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-main hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-text-muted mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-main hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-main/20 via-purple-500/10 to-pink-500/10 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-9xl mb-8">🚀</div>
          <h2 className="text-4xl font-bold mb-4">
            Discover Amazing Apps
          </h2>
          <p className="text-xl text-text-muted">
            Access thousands of apps for every platform. From web to desktop, mobile to CLI tools.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div>
              <p className="text-3xl font-bold text-main">10K+</p>
              <p className="text-text-muted">Apps</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-main">50K+</p>
              <p className="text-text-muted">Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-main">1M+</p>
              <p className="text-text-muted">Downloads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
