"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Plus, Search, Shield, ChevronRight, X } from "lucide-react"
import { Manrope } from "next/font/google"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

interface Project {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
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
      setProjects(data.data || [])
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
      setProjects([data.data, ...projects])
      setFormData({ name: "", description: "" })
      setShowCreateDialog(false)
    } catch (err) {
      console.error("Failed to create project:", err)
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Projects</p>
            <span className={`${manrope.className} text-3xl font-black text-on-surface`}>{projects.length}</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
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
                    Name
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Description
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Created
                  </th>
                  <th className={`${manrope.className} px-6 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      {projects.length === 0
                        ? "No projects yet. Click 'Create New Project' to get started."
                        : "No matches found."}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-surface-container/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-primary" />
                          <p className="font-bold text-on-surface">{project.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface-variant">{project.description || "—"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-on-surface-variant">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
