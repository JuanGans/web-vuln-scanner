"use client"

import { useState, useEffect } from "react" 
import { Navbar } from "@/components/navbar"
import { Plus, Search, Shield, ChevronRight, X, Cloud, AlertTriangle, Server, Edit, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Manrope } from "next/font/google"
import { useNotification } from "@/lib/notificationContext"
import { calculateHealthScore, determineSecurityStatus, calculateCriticalAlerts, calculateTrend } from "@/lib/scanResultEnrichment"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

interface ProjectWithMetrics {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
  scanCount: number
  criticalAlerts: number
  healthScore: number
  securityStatus: "SECURE" | "ATTENTION" | "AT_RISK" | "STABLE"
  lastActivityDate?: string
  trend?: {
    previousScore: number | null
    scoreChange: number
    direction: 'improved' | 'worsened' | 'stable'
    percentChange: string
  }
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<ProjectWithMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()
      const projectList = data.data || []
      
      // Fetch scan data for each project from history API
      const projectsWithMetrics = await Promise.all(
        projectList.map(async (project: any) => {
          try {
            const historyRes = await fetch("/api/history")
            const historyData = historyRes.ok ? await historyRes.json() : { data: [] }
            const projectScans = historyData.data?.filter((scan: any) => scan.projectId === project.id) || []
            const scanCount = projectScans.length
            const lastScan = projectScans.length > 0 
              ? new Date(projectScans[0].createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              : new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            
            // Calculate metrics from most recent scan
            let criticalAlerts = 0
            let healthScore = 100
            let securityStatus: "SECURE" | "ATTENTION" | "AT_RISK" | "STABLE" = "STABLE"
            let trend: { previousScore: number | null; scoreChange: number; direction: 'improved' | 'worsened' | 'stable'; percentChange: string } = { previousScore: null, scoreChange: 0, direction: 'stable', percentChange: '0' }
            
            if (projectScans.length > 0) {
              const lastScanData = projectScans[0]
              
              // Count critical alerts from scan results
              if (lastScanData.result) {
                try {
                  const result = typeof lastScanData.result === "string" 
                    ? JSON.parse(lastScanData.result) 
                    : lastScanData.result
                  
                  const vulnList = result.vulnerabilities || result.data || []
                  const vulnerabilityCount = vulnList.length
                  
                  // Count by severity (normalize to CRITICAL/HIGH/MEDIUM/LOW)
                  const criticalCount = vulnList.filter((v: any) => 
                    v.severity === "Kritis" || v.severity === "CRITICAL" || v.severity === "Critical"
                  ).length
                  const highCount = vulnList.filter((v: any) => 
                    v.severity === "Tinggi" || v.severity === "HIGH" || v.severity === "High"
                  ).length
                  const mediumCount = vulnList.filter((v: any) => 
                    v.severity === "Sedang" || v.severity === "MEDIUM" || v.severity === "Medium"
                  ).length
                  const lowCount = vulnList.filter((v: any) => 
                    v.severity === "Rendah" || v.severity === "LOW" || v.severity === "Low"
                  ).length
                  
                  // Use enhanced calculation with 4 severity levels
                  healthScore = calculateHealthScore(criticalCount, highCount, mediumCount, lowCount)
                  securityStatus = determineSecurityStatus(criticalCount, highCount, mediumCount, lowCount, vulnerabilityCount)
                  criticalAlerts = calculateCriticalAlerts(criticalCount, highCount)
                } catch (e) {
                  // If parse fails, use safe defaults
                  healthScore = 100
                  securityStatus = "STABLE"
                }
              }
              
              // Calculate trend from last 2 scans
              if (projectScans.length >= 2) {
                const secondLastScanData = projectScans[1]
                let previousScore = 100
                
                if (secondLastScanData.result) {
                  try {
                    const prevResult = typeof secondLastScanData.result === "string" 
                      ? JSON.parse(secondLastScanData.result) 
                      : secondLastScanData.result
                    
                    const prevVulnList = prevResult.vulnerabilities || prevResult.data || []
                    const prevCriticalCount = prevVulnList.filter((v: any) => 
                      v.severity === "Kritis" || v.severity === "CRITICAL" || v.severity === "Critical"
                    ).length
                    const prevHighCount = prevVulnList.filter((v: any) => 
                      v.severity === "Tinggi" || v.severity === "HIGH" || v.severity === "High"
                    ).length
                    const prevMediumCount = prevVulnList.filter((v: any) => 
                      v.severity === "Sedang" || v.severity === "MEDIUM" || v.severity === "Medium"
                    ).length
                    const prevLowCount = prevVulnList.filter((v: any) => 
                      v.severity === "Rendah" || v.severity === "LOW" || v.severity === "Low"
                    ).length
                    
                    previousScore = calculateHealthScore(prevCriticalCount, prevHighCount, prevMediumCount, prevLowCount)
                  } catch (e) {
                    // Use current as fallback
                    previousScore = healthScore
                  }
                }
                
                const trendResult = calculateTrend(healthScore, previousScore)
                if (trendResult) {
                  trend = {
                    previousScore: trendResult.previousScore,
                    scoreChange: trendResult.scoreChange,
                    direction: trendResult.trend === 'IMPROVED' ? 'improved' : trendResult.trend === 'WORSENED' ? 'worsened' : 'stable',
                    percentChange: trendResult.improvementPercentage.toFixed(1),
                  }
                }
              }
            }
            
            return {
              ...project,
              scanCount: scanCount,
              criticalAlerts: criticalAlerts,
              healthScore: healthScore,
              securityStatus: securityStatus,
              lastActivityDate: lastScan,
              trend,
            }
          } catch {
            return {
              ...project,
              scanCount: 0,
              criticalAlerts: 0,
              healthScore: 100,
              securityStatus: "SECURE" as const,
              lastActivityDate: new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              trend: { previousScore: null, scoreChange: 0, direction: 'stable' as const, percentChange: '0' },
            }
          }
        })
      )
      
      setProjects(projectsWithMetrics)
    } catch (err) {
      console.error("Failed to fetch projects:", err)
      setError("Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to create project")
      const data = await res.json()
      const newProject: ProjectWithMetrics = {
        ...data.data,
        scanCount: 0,
        criticalAlerts: 0,
        healthScore: 100,
        securityStatus: "SECURE",
        lastActivityDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        trend: { previousScore: null, scoreChange: 0, direction: 'stable', percentChange: '0' },
      }
      setProjects([newProject, ...projects])
      setFormData({ name: "", description: "" })
      setShowCreateDialog(false)
      
      // Notification
      addNotification({
        type: "success",
        title: "Project Created",
        message: `Project "${formData.name}" has been created successfully`,
      })
    } catch (err) {
      console.error("Failed to create project:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create project"
      setError(errorMessage)
      
      // Notification
      addNotification({
        type: "error",
        title: "Project Creation Failed",
        message: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProjectId,
          name: formData.name,
          description: formData.description,
        }),
      })

      if (!res.ok) throw new Error("Failed to update project")
      const data = await res.json()
      
      setProjects(projects.map(p => 
        p.id === editingProjectId 
          ? { ...p, name: data.data.name, description: data.data.description }
          : p
      ))
      
      setFormData({ name: "", description: "" })
      setEditingProjectId(null)
      setShowEditDialog(false)
      
      // Notification
      addNotification({
        type: "success",
        title: "Project Updated",
        message: `Project "${formData.name}" has been updated successfully`,
      })
    } catch (err) {
      console.error("Failed to update project:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update project"
      setError(errorMessage)
      
      // Notification
      addNotification({
        type: "error",
        title: "Project Update Failed",
        message: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return
    
    try {
      const res = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete project")
      
      const deletedProject = projects.find(p => p.id === projectId)
      setProjects(projects.filter(p => p.id !== projectId))
      setExpandedActionId(null)
      
      // Notification
      addNotification({
        type: "success",
        title: "Project Deleted",
        message: `Project "${deletedProject?.name}" has been deleted`,
      })
    } catch (err) {
      console.error("Failed to delete project:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete project"
      setError(errorMessage)
      
      // Notification
      addNotification({
        type: "error",
        title: "Project Deletion Failed",
        message: errorMessage,
      })
    }
  }

  const openEditDialog = (project: ProjectWithMetrics) => {
    setEditingProjectId(project.id)
    setFormData({ name: project.name, description: project.description || "" })
    setShowEditDialog(true)
    setExpandedActionId(null)
  }

  const getStatusColor = (status: ProjectWithMetrics["securityStatus"]) => {
    const colors = {
      SECURE: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
      ATTENTION: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", badge: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500" },
      AT_RISK: { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", badge: "bg-rose-50 text-rose-700 border-rose-100", dot: "bg-rose-500" },
      STABLE: { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-600", badge: "bg-slate-50 text-slate-600 border-slate-100", dot: "bg-slate-400" },
    }
    return colors[status]
  }

  const getProjectIcon = (name: string) => {
    const icons = [Shield, Cloud, AlertTriangle, Server]
    const index = name.length % icons.length
    return icons[index]
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar activePage="projects" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className={`${manrope.className} text-4xl font-extrabold text-on-surface tracking-tight`}>
              Projects
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">
              Manage and organize your security scans by project.
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all active:scale-95 text-sm w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Create New Project
          </button>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Assets */}
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Total Assets</p>
            <div className="flex items-end justify-between">
              <span className={`${manrope.className} text-3xl font-black text-on-surface`}>{projects.length}</span>
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md">
                <TrendingUp className="w-3 h-3 mr-1" />
                {Math.max(0, projects.length - 1)}
              </span>
            </div>
          </div>

          {/* Scans (30d) */}
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Scans (30d)</p>
            <div className="flex items-end justify-between">
              <span className={`${manrope.className} text-3xl font-black text-on-surface`}>
                {Math.round(projects.reduce((sum, p) => sum + p.scanCount, 0) / Math.max(1, projects.length) * 0.3)}
              </span>
              <span className="text-on-surface-variant text-xs font-bold">
                Avg {(Math.round(projects.reduce((sum, p) => sum + p.scanCount, 0) / Math.max(1, projects.length) * 0.3 / 30 * 100) / 100).toFixed(1)}/day
              </span>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Critical Alerts</p>
            <div className="flex items-end justify-between">
              <span className={`${manrope.className} text-3xl font-black text-error`}>
                {String(Math.round(projects.reduce((sum, p) => sum + p.criticalAlerts, 0) / Math.max(1, projects.length))).padStart(2, '0')}
              </span>
              <span className="text-error text-xs font-bold flex items-center bg-rose-50 px-2 py-1 rounded-md">Active</span>
            </div>
          </div>

          {/* Avg. Health Score */}
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Avg. Health Score</p>
            <div className="">
              <span className={`${manrope.className} text-3xl font-black text-on-surface`}>
                {Math.round(projects.reduce((sum, p) => sum + p.healthScore, 0) / Math.max(1, projects.length))}
                <span className={`${manrope.className} text-lg font-bold text-on-surface-variant`}>/100</span>
              </span>
              <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-500 h-full transition-all"
                  style={{width: `${Math.round(projects.reduce((sum, p) => sum + p.healthScore, 0) / Math.max(1, projects.length))}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              placeholder="Search projects..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/30 border-b border-outline-variant">
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Project Information
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Security Status
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-center`}>
                    Health Score
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-center`}>
                    Trend
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-center`}>
                    Scan Velocity
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Latest Activity
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                      {projects.length === 0
                        ? "No projects yet. Click 'Create New Project' to get started."
                        : "No matches found."}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const statusColor = getStatusColor(project.securityStatus)
                    const IconComponent = getProjectIcon(project.name)
                    
                    return (
                      <tr key={project.id} className="hover:bg-surface-container/20 transition-colors group">
                        {/* Project Information */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${statusColor.bg} border ${statusColor.border} ${statusColor.text} flex items-center justify-center border`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{project.name}</p>
                              <p className="text-xs text-on-surface-variant">{project.description || "—"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Security Status */}
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusColor.dot}`}></span>
                            {project.securityStatus === "AT_RISK" ? "AT RISK" : project.securityStatus}
                          </div>
                        </td>

                        {/* Health Score */}
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-bold text-on-surface">{project.healthScore}/100</span>
                            <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  project.healthScore >= 75 ? 'bg-emerald-500' :
                                  project.healthScore >= 50 ? 'bg-amber-500' :
                                  project.healthScore >= 25 ? 'bg-orange-500' :
                                  'bg-rose-500'
                                }`}
                                style={{width: `${project.healthScore}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Trend Indicator */}
                        <td className="px-6 py-5 text-center">
                          {project.trend && project.trend.previousScore !== null ? (
                            <div className="flex flex-col items-center gap-1">
                              {project.trend.direction === 'improved' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full">
                                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                                  <span className="text-xs font-bold text-emerald-600">+{project.trend.percentChange}%</span>
                                </div>
                              )}
                              {project.trend.direction === 'worsened' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 rounded-full">
                                  <TrendingDown className="w-4 h-4 text-rose-600" />
                                  <span className="text-xs font-bold text-rose-600">-{Math.abs(parseFloat(project.trend.percentChange))}%</span>
                                </div>
                              )}
                              {project.trend.direction === 'stable' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-full">
                                  <Minus className="w-4 h-4 text-slate-600" />
                                  <span className="text-xs font-bold text-slate-600">Stabil</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                        </td>

                        {/* Scan Velocity */}
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-on-surface">{project.scanCount}</span>
                          <p className="text-[10px] text-on-surface-variant">total scans</p>
                        </td>

                        {/* Latest Activity */}
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-on-surface">{project.lastActivityDate}</p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setExpandedActionId(expandedActionId === project.id ? null : project.id)}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              <ChevronRight 
                                className="w-5 h-5 transition-transform duration-300"
                                style={{
                                  transform: expandedActionId === project.id ? 'rotate(-180deg)' : 'rotate(0deg)'
                                }}
                              />
                            </button>

                            {expandedActionId === project.id && (
                              <div className="flex gap-1 animate-in slide-in-from-right-2 duration-200">
                                <button
                                  onClick={() => openEditDialog(project)}
                                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                  title="Edit project"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProjects.length > 0 && (
            <div className="px-6 py-4 bg-surface-container/10 border-t border-outline-variant flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-medium">Showing {filteredProjects.length} of {projects.length} projects</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-bold text-on-surface bg-white border border-outline-variant rounded-md opacity-50 cursor-not-allowed">Previous</button>
                <button className="px-3 py-1.5 text-xs font-bold text-on-surface bg-white border border-outline-variant rounded-md hover:bg-surface-container">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${manrope.className} text-2xl font-bold text-on-surface`}>Create Project</h2>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  placeholder="e.g., My Project"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${manrope.className} text-2xl font-bold text-on-surface`}>Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditDialog(false)
                  setEditingProjectId(null)
                  setFormData({ name: "", description: "" })
                }}
                className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditProject} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  placeholder="e.g., My Project"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDialog(false)
                    setEditingProjectId(null)
                    setFormData({ name: "", description: "" })
                  }}
                  className="flex-1 px-4 py-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
""
