"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  Shield,
  Cloud,
  AlertTriangle,
  Server,
  ChevronRight,
  TrendingUp,
  ArrowRight,
} from "lucide-react"

interface Project {
  id: number
  name: string
  url: string
  status: "SECURE" | "ATTENTION" | "AT RISK" | "STABLE"
  statusColor: "emerald" | "amber" | "rose" | "slate"
  icon: "shield" | "cloud" | "alert" | "server"
  scans: number
  lastActivity: string
  lastActivityTime: string
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const projects: Project[] = [
    {
      id: 1,
      name: "Fintech-API-Production",
      url: "api.fintech-core.com",
      status: "SECURE",
      statusColor: "emerald",
      icon: "shield",
      scans: 242,
      lastActivity: "Oct 24, 2024",
      lastActivityTime: "at 14:20 PM",
    },
    {
      id: 2,
      name: "E-Commerce-Staging",
      url: "staging.shop-nexus.io",
      status: "ATTENTION",
      statusColor: "amber",
      icon: "cloud",
      scans: 86,
      lastActivity: "Oct 21, 2024",
      lastActivityTime: "at 09:15 AM",
    },
    {
      id: 3,
      name: "Internal-HR-Portal",
      url: "hr.internal.local",
      status: "AT RISK",
      statusColor: "rose",
      icon: "alert",
      scans: 12,
      lastActivity: "Oct 19, 2024",
      lastActivityTime: "at 11:45 AM",
    },
    {
      id: 4,
      name: "Legacy-System-Audit",
      url: "archive.enterprise.com",
      status: "STABLE",
      statusColor: "slate",
      icon: "server",
      scans: 5,
      lastActivity: "Oct 15, 2024",
      lastActivityTime: "at 16:30 PM",
    },
  ]

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "shield":
        return <Shield className="w-5 h-5" />
      case "cloud":
        return <Cloud className="w-5 h-5" />
      case "alert":
        return <AlertTriangle className="w-5 h-5" />
      case "server":
        return <Server className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  const getStatusBadgeColor = (status: string, color: string) => {
    const colorMap: Record<string, string> = {
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
      amber: "bg-amber-50 text-amber-700 border-amber-100",
      rose: "bg-rose-50 text-rose-700 border-rose-100",
      slate: "bg-slate-50 text-slate-600 border-slate-100",
    }
    return colorMap[color] || colorMap.slate
  }

  const getIconBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
      amber: "bg-amber-50 border-amber-100 text-amber-600",
      rose: "bg-rose-50 border-rose-100 text-rose-600",
      slate: "bg-slate-50 border-slate-100 text-slate-600",
    }
    return colorMap[color] || colorMap.slate
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar activePage="projects" />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Project Landscape</h1>
            <p className="text-on-surface-variant text-sm font-medium">
              Monitor and manage security posture across 12 active digital assets.
            </p>
          </div>
          <button className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all active:scale-95 text-sm">
            <Plus className="w-5 h-5" />
            Create New Project
          </button>
        </header>

        {/* Stats Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Assets</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-on-surface">12</span>
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2
              </span>
            </div>
          </div>
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Scans (30d)</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-on-surface">48</span>
              <span className="text-on-surface-variant text-xs font-bold">Avg 1.6/day</span>
            </div>
          </div>
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Critical Alerts</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-error">03</span>
              <span className="text-error text-xs font-bold flex items-center bg-rose-50 px-2 py-1 rounded-md">Active</span>
            </div>
          </div>
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Avg. Health Score</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-on-surface">
                92<span className="text-lg font-bold text-on-surface-variant">/100</span>
              </span>
              <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-surface-container/40 p-3 rounded-xl border border-outline-variant/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline"
              placeholder="Search projects by name or URL..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-white border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-white border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <SortAsc className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Project List - Table Layout */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/30 border-b border-outline-variant">
                  <th className="px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]">
                    Project Information
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]">
                    Security Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-center">
                    Scan Velocity
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]">
                    Latest Activity
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-container/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg ${getIconBgColor(project.statusColor)} flex items-center justify-center border`}
                        >
                          {getIconComponent(project.icon)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{project.name}</p>
                          <p className="text-xs text-on-surface-variant">{project.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeColor(project.status, project.statusColor)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            project.statusColor === "emerald"
                              ? "bg-emerald-500"
                              : project.statusColor === "amber"
                                ? "bg-amber-500"
                                : project.statusColor === "rose"
                                  ? "bg-rose-500"
                                  : "bg-slate-400"
                          }`}
                        ></span>
                        {project.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-bold text-on-surface">{project.scans}</span>
                      <p className="text-[10px] text-on-surface-variant">total scans</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-on-surface">{project.lastActivity}</p>
                      <p className="text-[10px] text-on-surface-variant">{project.lastActivityTime}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-surface-container/10 border-t border-outline-variant flex items-center justify-between">
            <p className="text-xs text-on-surface-variant font-medium">Showing 4 of 12 projects</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-bold text-on-surface bg-white border border-outline-variant rounded-md opacity-50 cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1.5 text-xs font-bold text-on-surface bg-white border border-outline-variant rounded-md hover:bg-surface-container">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Asymmetrical Stats Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-primary p-10 rounded-xl relative overflow-hidden group border border-primary-dim">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest">Active Security Insight</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Your vulnerability surface area has decreased by <span className="text-emerald-400">14%</span> this week.
              </h2>
              <p className="text-primary-fixed/70 text-sm max-w-md leading-relaxed">
                System-wide optimizations and patched staging vulnerabilities have improved your overall threat posture. Continue
                regular scans on production assets to maintain compliance.
              </p>
            </div>
            <Shield className="absolute -right-4 -bottom-4 text-white/5 w-[180px] h-[180px] rotate-12 group-hover:rotate-6 transition-transform select-none" />
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-on-surface-variant uppercase text-[10px] tracking-widest mb-6">
                Threat Distribution
              </h4>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Critical Vulnerabilities</span>
                    <span className="text-error">03</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5">
                    <div className="bg-error w-1/4 h-1.5 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Medium Exposure</span>
                    <span className="text-on-surface">18</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5">
                    <div className="bg-primary w-3/4 h-1.5 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-primary font-bold text-sm flex items-center gap-2 mt-8 group">
              Full Compliance Report
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant w-full py-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="font-black text-primary text-xl tracking-tighter">CyberGuard</span>
            <p className="text-xs text-on-surface-variant font-medium">
              © 2024 Sentinel Operations. Enterprise Grade Security Analysis.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <a className="text-on-surface-variant hover:text-primary font-bold text-xs transition-colors" href="#">
              Documentation
            </a>
            <a className="text-on-surface-variant hover:text-primary font-bold text-xs transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-on-surface-variant hover:text-primary font-bold text-xs transition-colors" href="#">
              System Status
            </a>
            <a className="text-on-surface-variant hover:text-primary font-bold text-xs transition-colors" href="#">
              Security Hub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
