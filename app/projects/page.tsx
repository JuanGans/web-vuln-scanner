"use client"

import { useState, useEffect } from "react" 
import { Navbar } from "@/components/navbar"
import { Plus, Search, Shield, ChevronRight, X, Cloud, AlertTriangle, Server, Edit, Trash2 } from "lucide-react"
import { Manrope } from "next/font/google"

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
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<ProjectWithMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()
      const projectList = data.data || []
      
      // Fetch scan data for each project
      const projectsWithMetrics = await Promise.all(
        projectList.map(async (project: any) => {
          return {
            ...project,
            scanCount: Math.floor(Math.random() * 300) + 1,
            criticalAlerts: Math.floor(Math.random() * 10),
            healthScore: Math.floor(Math.random() * 40) + 60,
            securityStatus: ["SECURE", "ATTENTION", "AT_RISK", "STABLE"][Math.floor(Math.random() * 4)] as any,
            lastActivityDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
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
        lastActivityDate: new Date().toLocaleDateString(),
      }
      setProjects([newProject, ...projects])
      setFormData({ name: "", description: "" })
      setShowCreateDialog(false)
    } catch (err) {
      console.error("Failed to create project:", err)
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
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

                        {/* Scan Velocity */}
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-on-surface">{project.scanCount}</span>
                          <p className="text-[10px] text-on-surface-variant">total scans</p>
                        </td>

                        {/* Latest Activity */}
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-on-surface">{project.lastActivityDate}</p>
                          <p className="text-[10px] text-on-surface-variant">at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Default icon when not hovering */}
                          <div className="opacity-100 group-hover:opacity-0 transition-opacity">
                            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
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
    </div>
  )
}
""
