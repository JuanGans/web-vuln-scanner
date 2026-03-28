"use client"

import { Shield, Activity, AlertTriangle, Lock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"

export default function Dashboard() {
  const stats = [
    { label: "Total Projects", value: "12", icon: Shield, color: "text-cyan-400" },
    { label: "Threats Detected", value: "47", icon: AlertTriangle, color: "text-orange-400" },
    { label: "Critical Issues", value: "3", icon: Zap, color: "text-red-400" },
    { label: "System Status", value: "Secure", icon: Lock, color: "text-green-400" },
  ]

  const recentScans = [
    { name: "e-commerce-api", status: "Completed", threats: 5, severity: "Medium" },
    { name: "user-auth-service", status: "Running", threats: 0, severity: "Low" },
    { name: "payment-gateway", status: "Completed", threats: 2, severity: "High" },
    { name: "admin-dashboard", status: "Completed", threats: 8, severity: "Critical" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SecurityDefender
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              Profile
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Web Vulnerability Scanner</h2>
          <p className="text-gray-400 text-lg">
            Automated threat detection and security analysis for your web applications
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card
                key={i}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full -mr-12 -mt-12" />
                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Recent Scans Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Recent Scans
          </h3>
          <Card className="bg-card border-border overflow-hidden">
            <div className="divide-y divide-border">
              {recentScans.map((scan, i) => (
                <div key={i} className="p-6 hover:bg-primary/10 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{scan.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            scan.status === "Running"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {scan.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            scan.severity === "Critical"
                              ? "bg-red-500/20 text-red-300"
                              : scan.severity === "High"
                                ? "bg-orange-500/20 text-orange-300"
                                : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {scan.severity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">{scan.threats}</p>
                      <p className="text-xs text-gray-400">threats found</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
          <Card className="relative bg-gradient-to-r from-card to-card border-primary/30 p-8 overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/5 rounded-full -ml-20 -mt-20" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Start Your Security Scan</h3>
              <p className="text-gray-400 mb-6">
                Upload your web application and let our advanced scanner detect vulnerabilities in seconds.
              </p>
              <div className="flex gap-4">
                <Button 
                  className="bg-primary text-primary-foreground hover:opacity-90"
                  onClick={() => toast.success("Upload feature coming soon!", {
                    description: "You'll be able to upload and scan your projects here."
                  })}
                >
                  Upload Project
                </Button>
                <Button
                  variant="outline"
                  className="border-primary/30 text-foreground hover:bg-primary/10 bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 SecurityDefender. Protecting your applications from threats.</p>
        </div>
      </footer>
    </div>
  )
}
