// src/pages/Auth/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Github, Chrome, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { Button, Input, Progress } from '../../components/common'
import { Logo } from '../../components/common/Logo'

const Register = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { register, loading, error } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabel = passwordStrength <= 25 ? 'Weak' :
                        passwordStrength <= 50 ? 'Fair' :
                        passwordStrength <= 75 ? 'Good' : 'Strong'
  const strengthColor = passwordStrength <= 25 ? 'danger' :
                        passwordStrength <= 50 ? 'warning' :
                        passwordStrength <= 75 ? 'default' : 'success'

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(formData.password) },
  ]

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (passwordStrength < 50) {
      newErrors.password = 'Password is too weak'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await register(formData, {
      onSuccess: () => {
        toast.success('Account created successfully!')
        navigate('/')
      },
      onError: (err) => {
        toast.error(err || 'Registration failed')
      },
    })

    if (!result.success) {
      setErrors({ submit: result.error })
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-500/20 via-main/10 to-pink-500/10 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-9xl mb-8">✨</div>
          <h2 className="text-4xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-text-muted">
            Create an account to upload apps, leave reviews, and connect with developers worldwide.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 text-left">
            {[
              'Access thousands of apps',
              'Upload and share your creations',
              'Join a community of developers',
              'Get personalized recommendations',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-main/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-main" />
                </div>
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <Logo size="md" />
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-text-muted mb-8">
            Start your journey with us today
          </p>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              icon={Chrome}
              onClick={() => toast.info('Coming soon!')}
              fullWidth
            >
              Google
            </Button>
            <Button
              variant="outline"
              icon={Github}
              onClick={() => toast.info('Coming soon!')}
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
              <span className="px-4 bg-bg text-text-muted">or register with email</span>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Create a strong password"
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

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Password strength</span>
                    <span className={`text-xs font-medium ${
                      strengthColor === 'danger' ? 'text-red-500' :
                      strengthColor === 'warning' ? 'text-yellow-500' :
                      strengthColor === 'success' ? 'text-green-500' : 'text-main'
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <Progress value={passwordStrength} size="sm" variant={strengthColor} />

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-xs ${
                        req.met ? 'text-green-500' : 'text-text-muted'
                      }`}>
                        <Check className={`w-3 h-3 ${req.met ? '' : 'opacity-30'}`} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-bg-secondary bg-bg checked:bg-main"
                />
                <span className="text-sm text-text-muted">
                  I agree to the{' '}
                  <Link to="/terms" className="text-main hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-main hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-sm text-red-500 mt-1">{errors.agreeTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-text-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-main hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
