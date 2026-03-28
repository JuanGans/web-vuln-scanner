"use client"

import { useState } from "react"
import { Shield, Plus, Search, Filter, Zap, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const projects = [
    {
      id: 1,
      name: "E-Commerce Platform",
      url: "https://shop.example.com",
      status: "Secure",
      lastScan: "2 hours ago",
      threats: 2,
      severity: "Low",
      scanDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Admin Dashboard",
      url: "https://admin.example.com",
      status: "Warning",
      lastScan: "1 day ago",
      threats: 8,
      severity: "Critical",
      scanDate: "2024-01-14",
    },
    {
      id: 3,
      name: "API Gateway",
      url: "https://api.example.com",
      status: "Scanning",
      lastScan: "In progress",
      threats: 0,
      severity: "Pending",
      scanDate: "2024-01-15",
    },
    {
      id: 4,
      name: "User Portal",
      url: "https://portal.example.com",
      status: "Secure",
      lastScan: "5 hours ago",
      threats: 1,
      severity: "Medium",
      scanDate: "2024-01-15",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Secure":
        return "bg-green-500/20 text-green-300"
      case "Warning":
        return "bg-orange-500/20 text-orange-300"
      case "Scanning":
        return "bg-blue-500/20 text-blue-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-400"
      case "High":
        return "text-orange-400"
      case "Medium":
        return "text-yellow-400"
      case "Low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

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
          <Button className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Projects</h2>
          <p className="text-gray-400">Monitor and manage your web application scans</p>
        </div>

        {/* Search & Filter Bar */}
        <Card className="bg-card border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-primary/50" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder-gray-500 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-primary/10 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full -mr-16 -mt-16" />
              <div className="p-6 relative z-10">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-400">{project.url}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Threat Info */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getSeverityColor(project.severity)}`}>{project.threats}</p>
                    <p className="text-xs text-gray-400">Threats</p>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-orange-400" />
                    <p className="text-xs text-gray-400">{project.severity}</p>
                  </div>
                  <div className="text-center">
                    <Zap className="w-6 h-6 mx-auto mb-1 text-cyan-400" />
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-gray-400">Last scan: {project.lastScan}</p>
                  <button className="text-primary hover:text-cyan-300 transition-colors font-medium text-sm">
                    View Details →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
