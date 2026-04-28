"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import {
  Filter,
  Plus,
  Shield,
  TrendingUp,
  Server,
  ShoppingCart,
  Database,
  Code,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react"
import { Manrope } from "next/font/google"
import { useEffect, useState } from "react"
import { useNotification } from "@/lib/notificationContext"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

interface Project {
  id: string
  name: string
  description?: string
}

interface DBScanResult {
  id: string
  fileName?: string
  projectId?: string
  project?: Project | null
  result: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export default function ScanResultPage() {
  const [scans, setScans] = useState<DBScanResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [scanToDelete, setScanToDelete] = useState<DBScanResult | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch("/api/history")
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        setScans(data.data || [])
      } catch (error) {
        console.error("Failed to fetch scans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScans()
  }, [])

  const getIcon = (index: number) => {
    const icons = ["hub", "cart", "dns", "terminal"]
    return icons[index % icons.length]
  }

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "hub":
        return <Server className="h-5 w-5" />
      case "cart":
        return <ShoppingCart className="h-5 w-5" />
      case "dns":
        return <Database className="h-5 w-5" />
      case "terminal":
        return <Code className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  const getVulnerabilityBadgeColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-orange-50 text-orange-700 border-orange-100"
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-100"
      case "secure":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  // Format date dengan locale Indonesia
  const formatScanDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const ampm = date.getHours() >= 12 ? "PM" : "AM"

    return {
      date: `${month} ${day}, ${year}`,
      time: `${hours}:${minutes} ${ampm}`,
    }
  }

  // Get project name or default text
  const getProjectName = (scan: DBScanResult) => {
    if (scan.project?.name) {
      return scan.project.name
    }
    return "Unassigned Scan"
  }

  // Get scan number within project (based on creation order)
  const getScanNumber = (scanId: string): number => {
    const projectScans = scans.filter((s) => s.projectId === scans.find((x) => x.id === scanId)?.projectId)
    const scansCount = projectScans.length
    const scanIndex = projectScans.findIndex((s) => s.id === scanId)
    return scansCount - scanIndex // Reverse order for descending display
  }

  // Get scan description or default
  const getScanDescription = (scan: DBScanResult): string => {
    if (scan.project?.description) {
      return scan.project.description
    }
    if (scan.fileName) {
      return `File: ${scan.fileName}`
    }
    return "No description"
  }

  // Count vulnerabilities by severity
  const getVulnerabilityStats = (scan: DBScanResult) => {
    const vulnerabilities = (scan.result as any)?.vulnerabilities || []
    const stats = {
      high: 0,
      medium: 0,
      low: 0,
      secure: vulnerabilities.length === 0,
    }

    vulnerabilities.forEach((vuln: any) => {
      const severity = vuln.severity?.toLowerCase() || ""
      if (severity === "kritis" || severity === "tinggi") {
        stats.high++
      } else if (severity === "sedang") {
        stats.medium++
      } else if (severity === "rendah") {
        stats.low++
      }
    })

    return stats
  }

  // Generate vulnerability badge JSX
  const renderVulnerabilityBadges = (stats: any) => {
    const badges = []

    if (stats.high > 0) {
      badges.push(
        <span key="high" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVulnerabilityBadgeColor("high")}`}>
          {stats.high} High
        </span>
      )
    }

    if (stats.medium > 0) {
      badges.push(
        <span key="medium" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVulnerabilityBadgeColor("medium")}`}>
          {stats.medium} Medium
        </span>
      )
    }

    if (stats.low > 0) {
      badges.push(
        <span key="low" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVulnerabilityBadgeColor("low")}`}>
          {stats.low} Low
        </span>
      )
    }

    if (stats.secure) {
      badges.push(
        <span key="secure" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVulnerabilityBadgeColor("secure")}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Secure
        </span>
      )
    }

    return badges.length > 0 ? badges : <span className="text-on-surface-variant text-xs">No data</span>
  }

  const getIconBgColor = () => {
    return "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
  }

  const handleDeleteScan = async () => {
    if (!scanToDelete || isDeleting) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/history?id=${scanToDelete.id}`, {
        method: "DELETE",
      })

      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal menghapus scan")
      }

      setScans((prev) => {
        const next = prev.filter((scan) => scan.id !== scanToDelete.id)
        const nextTotalPages = Math.max(1, Math.ceil(next.length / itemsPerPage))
        setCurrentPage((page) => Math.min(page, nextTotalPages))
        return next
      })

      addNotification({
        type: "success",
        title: "Scan Deleted",
        message: `Riwayat scan ${scanToDelete.fileName || "tanpa nama"} berhasil dihapus.`,
      })
      setScanToDelete(null)
    } catch (error) {
      addNotification({
        type: "error",
        title: "Delete Failed",
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus scan.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(scans.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedScans = scans.slice(startIdx, startIdx + itemsPerPage)

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar activePage="scan-result" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className={`${manrope.className} mb-3 text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface`}>
              Scan History
            </h1>
            <p className="text-on-surface-variant max-w-lg leading-relaxed text-sm md:text-base">
              Review your automated security audits. All scans are stored in the database with detailed vulnerability analysis.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-outline-variant/30 text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all flex items-center gap-2 text-sm shadow-sm">
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <Link
              href="/upload"
              className="px-5 py-2.5 bg-primary text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              New Scan
            </Link>
          </div>
        </header>

        {/* Stats Overview Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* System Health Card - 2 cols */}
          <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-on-surface mb-2">
                {isLoading ? "Loading..." : scans.length === 0 ? "No Scans Yet" : "Scans Available"}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
                {isLoading
                  ? "Fetching your scan data..."
                  : scans.length === 0
                    ? "Start by uploading a file for security analysis."
                    : `You have ${scans.length} scan${scans.length !== 1 ? "s" : ""} in your database.`}
              </p>
            </div>
            <Shield className="absolute -right-6 -bottom-6 text-primary/5 w-[180px] h-[180px] group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
          </div>

          {/* Total Scans Card - Primary */}
          <div className="bg-primary text-white p-8 rounded-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium opacity-70 uppercase tracking-widest mb-1">Total Scans</p>
              <p className={`${manrope.className} text-5xl font-black`}>{scans.length}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
              <TrendingUp className="w-4 h-4" />
              <span>Database</span>
            </div>
          </div>

          {/* Vulnerabilities Card */}
          <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] border border-outline-variant/10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Last Scan</p>
              <p className={`${manrope.className} text-2xl font-black text-error`}>
                {scans.length > 0 ? new Date(scans[0]?.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
              {scans.length > 0 ? "Most recent security scan" : "No scans performed yet"}
            </p>
          </div>
        </div>

        {/* Scan Results Table Card */}
        <section className="bg-white rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] overflow-hidden border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/30">
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Project &amp; File
                  </th>
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Scan Date
                  </th>
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Vulnerability Count
                  </th>
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-right`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/30">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-8 text-center text-on-surface-variant">
                      Loading scan results...
                    </td>
                  </tr>
                ) : displayedScans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-8 text-center text-on-surface-variant">
                      No scans found.{" "}
                      <Link href="/upload" className="text-primary hover:underline">
                        Upload a file
                      </Link>{" "}
                      to get started.
                    </td>
                  </tr>
                ) : (
                  displayedScans.map((scan, idx) => {
                    const vulnStats = getVulnerabilityStats(scan)
                    const { date: scanDate, time: scanTime } = formatScanDate(scan.createdAt)
                    const projectName = getProjectName(scan)
                    const scanDescription = getScanDescription(scan)

                    return (
                      <tr key={scan.id} className="hover:bg-surface-container-low/20 transition-colors group border-b border-outline-variant/10">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${getIconBgColor()} flex items-center justify-center transition-all`}>
                              {getIconComponent(getIcon(idx))}
                            </div>
                            <div>
                              <div className="font-bold text-on-surface text-sm mb-0.5">{projectName}</div>
                              <div className="text-xs text-on-surface-variant opacity-70 line-clamp-2">{scanDescription}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-medium text-sm">{scanDate}</span>
                            <span className="text-[10px] text-on-surface-variant opacity-60">{scanTime}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-2">{renderVulnerabilityBadges(vulnStats)}</div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/scan-result/${scan.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-primary font-bold text-xs hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10"
                            >
                              View Detail
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/upload?scanId=${scan.id}`}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-white border border-outline-variant/20 hover:bg-surface-container-low transition-all text-on-surface"
                              title={`Rescan ${scan.fileName || scan.id}`}
                            >
                              Rescan
                            </Link>
                            <button
                              type="button"
                              onClick={() => setScanToDelete(scan)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-red-600 font-bold text-xs hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                              aria-label={`Delete scan ${scan.fileName || scan.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
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
          {scans.length > 0 && (
            <div className="px-8 py-5 bg-surface-container-low/10 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant">
                Showing <span className="text-on-surface">{startIdx + 1}</span> to{" "}
                <span className="text-on-surface">{Math.min(startIdx + itemsPerPage, scans.length)}</span> of{" "}
                <span className="text-on-surface font-bold">{scans.length}</span> scans
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-white text-on-surface-variant transition-all hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-primary text-white shadow-sm"
                        : "border border-outline-variant/20 text-on-surface-variant hover:bg-white hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-white text-on-surface-variant transition-all hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {scanToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-outline-variant/20 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className={`${manrope.className} text-xl font-extrabold text-on-surface`}>Delete Scan?</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Data riwayat scan ini akan dihapus permanen dari database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setScanToDelete(null)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 rounded-md border border-outline-variant/20 bg-surface-container-low p-3 text-sm">
              <p className="font-semibold text-on-surface">{scanToDelete.project?.name || "Unassigned Scan"}</p>
              <p className="mt-1 text-on-surface-variant">{scanToDelete.fileName || "No file name"}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setScanToDelete(null)}
                disabled={isDeleting}
                className="rounded-full border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteScan}
                disabled={isDeleting}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
