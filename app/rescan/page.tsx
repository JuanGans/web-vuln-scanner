"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, RefreshCw, Shield, Trash2, TrendingUp, X } from "lucide-react"
import { Manrope } from "next/font/google"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotification } from "@/lib/notificationContext"

const manrope = Manrope({ subsets: ["latin"], weight: ["200", "400", "600", "800"] })

type RescanHistoryItem = {
  id: string
  fileName?: string
  projectId?: string
  project?: {
    id: string
    name: string
    description?: string
  } | null
  result?: {
    isRescan?: boolean
    originalScanId?: string
    newScan?: {
      vulnerabilities?: Array<{ severity?: string }>
    }
    scoreImprovement?: {
      before: number
      after: number
      fixed: number
      newFound: number
      percentageFixed: number
    }
  }
  createdAt: string
  updatedAt: string
}

type RescanStats = {
  high: number
  medium: number
  low: number
  secure: boolean
}

export default function RescanPage() {
  const router = useRouter()
  const [rescans, setRescans] = useState<RescanHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [scanToDelete, setScanToDelete] = useState<RescanHistoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchRescans = async () => {
      try {
        const res = await fetch("/api/history")
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        const items = (data.data || []).filter((scan: RescanHistoryItem) => scan.result?.isRescan)
        setRescans(items)
      } catch (error) {
        console.error("Failed to fetch rescan history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRescans()
  }, [])

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

  const getProjectName = (scan: RescanHistoryItem) => scan.project?.name || "Unassigned Scan"

  const getScanDescription = (scan: RescanHistoryItem) => {
    if (scan.project?.description) return scan.project.description
    if (scan.fileName) return `File: ${scan.fileName}`
    return "No description"
  }

  const getRescanStats = (scan: RescanHistoryItem): RescanStats => {
    const vulnerabilities = scan.result?.newScan?.vulnerabilities || []
    const stats: RescanStats = {
      high: 0,
      medium: 0,
      low: 0,
      secure: vulnerabilities.length === 0,
    }

    vulnerabilities.forEach((vuln) => {
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

  const handleDeleteRescan = async () => {
    if (!scanToDelete || isDeleting) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/history?id=${scanToDelete.id}`, {
        method: "DELETE",
      })

      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || "Gagal menghapus rescan")
      }

      setRescans((prev) => {
        const next = prev.filter((scan) => scan.id !== scanToDelete.id)
        const nextTotalPages = Math.max(1, Math.ceil(next.length / itemsPerPage))
        setCurrentPage((page) => Math.min(page, nextTotalPages))
        return next
      })

      addNotification({
        type: "success",
        title: "Rescan Deleted",
        message: `Riwayat rescan ${scanToDelete.fileName || "tanpa nama"} berhasil dihapus.`,
      })
      setScanToDelete(null)
    } catch (error) {
      addNotification({
        type: "error",
        title: "Delete Failed",
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus rescan.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(rescans.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedRescans = rescans.slice(startIdx, startIdx + itemsPerPage)
  const latestRescan = rescans[0] || null

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar activePage="rescan" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-8 pt-12 pb-24">
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className={`${manrope.className} text-5xl font-extrabold tracking-tight text-on-surface`}>Rescan History</h1>
              <p className="mt-4 max-w-2xl text-on-surface-variant leading-relaxed">
                Halaman ini hanya menampilkan hasil rescan yang sudah disimpan. Jika belum ada rescan, tabel akan tetap tampil kosong.
              </p>
            </div>
            <Link
              href="/upload"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:shadow-lg transition-all shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              New Rescan
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-on-surface mb-2">
                {isLoading ? "Loading..." : rescans.length === 0 ? "No Rescans Yet" : "Rescans Available"}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
                {isLoading
                  ? "Fetching your rescan data..."
                  : rescans.length === 0
                    ? "No rescan has been performed yet. The table below will remain empty until a rescan exists."
                    : `You have ${rescans.length} rescan${rescans.length !== 1 ? "s" : ""} in your database.`}
              </p>
            </div>
            <Shield className="absolute -right-6 -bottom-6 text-primary/5 w-[180px] h-[180px] group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
          </div>

          <div className="bg-primary text-white p-8 rounded-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium opacity-70 uppercase tracking-widest mb-1">Total Rescans</p>
              <p className={`${manrope.className} text-5xl font-black`}>{rescans.length}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
              <TrendingUp className="w-4 h-4" />
              <span>Database</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] border border-outline-variant/10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Latest Rescan</p>
              <p className={`${manrope.className} text-2xl font-black text-error`}>
                {latestRescan ? formatScanDate(latestRescan.createdAt).date : "—"}
              </p>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
              {latestRescan ? "Most recent rescan entry" : "No rescans performed yet"}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] overflow-hidden border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/30">
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Project &amp; File
                  </th>
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Rescan Date
                  </th>
                  <th className={`${manrope.className} px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.1em]`}>
                    Improvement
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
                      Loading rescan results...
                    </td>
                  </tr>
                ) : displayedRescans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-8 text-center text-on-surface-variant">
                      No rescan found. <Link href="/upload" className="text-primary hover:underline">Start a rescan</Link> to see data here.
                    </td>
                  </tr>
                ) : (
                  displayedRescans.map((scan) => {
                    const improvement = scan.result?.scoreImprovement
                    const stats = getRescanStats(scan)
                    const { date: scanDate, time: scanTime } = formatScanDate(scan.createdAt)
                    const projectName = getProjectName(scan)
                    const scanDescription = getScanDescription(scan)

                    return (
                      <tr key={scan.id} className="hover:bg-surface-container-low/20 transition-colors group border-b border-outline-variant/10">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center transition-all">
                              <RefreshCw className="h-5 w-5" />
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
                          <div className="flex flex-wrap gap-2 text-xs font-bold">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${stats.secure ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                              {stats.secure ? "Secure" : `${stats.high} High`}
                            </span>
                            {improvement ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border bg-blue-100 text-blue-700 border-blue-200">
                                {improvement.percentageFixed}% fixed
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/rescan/${scan.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-primary font-bold text-xs hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10"
                            >
                              View Detail
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setScanToDelete(scan)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-red-600 font-bold text-xs hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                              aria-label={`Delete rescan ${scan.fileName || scan.id}`}
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

          {rescans.length > 0 && (
            <div className="px-8 py-5 bg-surface-container-low/10 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant">
                Showing <span className="text-on-surface">{startIdx + 1}</span> to{" "}
                <span className="text-on-surface">{Math.min(startIdx + itemsPerPage, rescans.length)}</span> of{" "}
                <span className="text-on-surface font-bold">{rescans.length}</span> rescans
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
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
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-white text-on-surface-variant transition-all hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {scanToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg border border-outline-variant/20 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className={`${manrope.className} text-xl font-extrabold text-on-surface`}>Delete Rescan?</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Data riwayat rescan ini akan dihapus permanen dari database.
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
                  onClick={handleDeleteRescan}
                  disabled={isDeleting}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
