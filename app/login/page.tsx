"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNotification } from "@/lib/notificationContext"

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const { addNotification } = useNotification()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validasi form
      if (!formData.email || !formData.password) {
        addNotification({
          type: "warning",
          title: "Validation Error",
          message: "Please fill in all fields",
        })
        setIsLoading(false)
        return
      }

      // Call login API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        addNotification({
          type: "error",
          title: "Login Failed",
          message: data.error || "Invalid email or password",
        })
        return
      }

      // Success
      addNotification({
        type: "success",
        title: "Welcome Back!",
        message: "You have successfully logged in",
      })

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "An error occurred during login",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          SecurityDefender
        </h1>
        <p className="text-center text-gray-400 mb-8">Web Vulnerability Scanner</p>

        {/* Login Card */}
        <Card className="bg-card border-border backdrop-blur-xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Sign In to Your Account</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder-gray-500 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder-gray-500 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-primary/50 hover:text-primary transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border" disabled={isLoading} />
                <span className="text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-cyan-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold mt-6 disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 px-4 border border-border rounded-lg hover:bg-primary/10 transition-colors font-medium text-sm">
              GitHub
            </button>
            <button className="py-2.5 px-4 border border-border rounded-lg hover:bg-primary/10 transition-colors font-medium text-sm">
              Google
            </button>
          </div>
        </Card>

        {/* Sign Up Link */}
        <p className="text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:text-cyan-300 transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
