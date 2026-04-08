"use client"

import { Inter, Manrope } from "next/font/google"
import { Navbar } from "@/components/navbar"
import {
  AlertTriangle,
  Cloud,
  Database,
  Download,
  Globe,
  Plus,
  Server,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] })
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

const bars = [35, 55, 40, 85, 60, 30, 75, 50, 65, 45]

interface ScanHistoryItem {
  id: string
  fileName?: string
  result: Record<string, unknown>
  createdAt: string
}

export default function DashboardPage() {
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAssets: 0,
    vulnerabilities: 0,
    highRisk: 0,
    avgResolution: "4.2",
  })

  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        const res = await fetch("/api/history")
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        setScanHistory(data.data || [])

        // Calculate stats
        if (data.data && data.data.length > 0) {
          setStats((prev) => ({
            ...prev,
            totalAssets: data.data.length,
          }))
        }
      } catch (error) {
        console.error("Failed to fetch scan history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScanHistory()
  }, [])

  return (
    <div className={`${inter.className} min-h-screen bg-[#fcfdfe] text-[#0f172a] antialiased selection:bg-[#0052cc]/10`}>
      <Navbar activePage="dashboard" />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className={`${manrope.className} mb-1 text-3xl font-bold tracking-tight text-[#0f172a]`}>Security Posture</h1>
              <p className="flex items-center gap-2 text-sm text-[#64748b]">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Perimeter is <span className="font-semibold text-[#0f172a]">94.2% secure</span>. Monitoring 428 active endpoints.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-[#cbd5e1] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#f1f5f9]">
                <Download className="h-[18px] w-[18px]" />
                Export Report
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-[#0052cc] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0747a6]">
                <Plus className="h-[18px] w-[18px]" />
                New Security Scan
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-[#f1f5f9] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#0052cc]/10 p-2.5">
                <Server className="h-5 w-5 text-[#0052cc]" />
              </div>
              <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">+{stats.totalAssets}</span>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Total Scans</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight`}>{stats.totalAssets}</p>
          </div>

          <div className="rounded-xl border border-[#f1f5f9] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#f1f5f9] p-2.5">
                <ShieldCheck className="h-5 w-5 text-[#475569]" />
              </div>
              <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[10px] font-bold text-[#64748b]">Data Real-time</span>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Vulnerabilities</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight`}>{stats.vulnerabilities}</p>
          </div>

          <div className="rounded-xl border border-[#f1f5f9] border-l-4 border-l-[#e11d48] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#fff1f2] p-2.5">
                <ShieldAlert className="h-5 w-5 text-[#e11d48]" />
              </div>
              <span className="rounded-md bg-[#fff1f2] px-2 py-0.5 text-[10px] font-bold text-[#e11d48]">Monitor</span>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">High Risk</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight text-[#e11d48]`}>{stats.highRisk.toString().padStart(2, "0")}</p>
          </div>

          <div className="rounded-xl border border-[#f1f5f9] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#0052cc]/10 p-2.5">
                <Shield className="h-5 w-5 text-[#0052cc]" />
              </div>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Avg Resolution</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight`}>
              4.2 <span className="text-sm font-normal text-[#64748b]">hrs</span>
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <section className="rounded-xl border border-[#e2e8f0]/50 bg-white p-8 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)]">
              <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className={`${manrope.className} text-xl font-bold tracking-tight`}>Detection Velocity</h2>
                  <p className="mt-1 text-sm text-[#64748b]">Daily trend of identified security events</p>
                </div>
                <div className="flex rounded-lg bg-[#e2e8f0] p-1">
                  <button className="rounded-md bg-white px-3 py-1.5 text-xs font-bold shadow-sm">30D</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a]">6M</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a]">1Y</button>
                </div>
              </div>
              <div className="flex h-64 items-end gap-2.5 px-1">
                {bars.map((height, idx) => (
                  <div
                    key={`bar-${idx}`}
                    className={`flex-1 cursor-pointer rounded-t-lg transition-colors ${
                      idx === 3
                        ? "bg-[#0052cc] shadow-lg shadow-[#0052cc]/10"
                        : "bg-[#f1f5f9] hover:bg-[#0052cc]/20"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-between px-1 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                <span>Oct 1</span>
                <span>Oct 5</span>
                <span>Oct 10</span>
                <span>Oct 15</span>
                <span>Oct 20</span>
                <span>Oct 25</span>
                <span>Oct 30</span>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#e2e8f0]/50 bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)]">
              <div className="flex items-center justify-between border-b border-[#e2e8f0]/30 px-8 py-6">
                <h2 className={`${manrope.className} text-lg font-bold tracking-tight`}>Recent Scans</h2>
                <Link 
                  href="/scan-result"
                  className="rounded-md px-3 py-1.5 text-xs font-bold text-[#0052cc] transition-colors hover:bg-[#0052cc]/5"
                >
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc]/50 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                    <tr>
                      <th className="px-8 py-4">Environment</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Last Verified</th>
                      <th className="px-8 py-4">Risk Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]/30">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-8 text-center text-[#64748b]">
                          Loading scan data...
                        </td>
                      </tr>
                    ) : scanHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-8 text-center text-[#64748b]">
                          No scans yet
                        </td>
                      </tr>
                    ) : (
                      scanHistory.slice(0, 5).map((scan, idx) => (
                        <tr key={scan.id} className="transition-colors hover:bg-[#f8fafc]/50">
                          <td className="px-8 py-4">
                            <Link href={`/scan-result/${scan.id}`} className="font-medium text-[#0052cc] hover:underline">
                              {scan.fileName || `Scan ${idx + 1}`}
                            </Link>
                          </td>
                          <td className="px-8 py-4">
                            <span className="inline-block rounded-md bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
                              Complete
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm text-[#64748b]">
                            {new Date(scan.createdAt).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-8 py-4 text-sm font-medium text-[#e11d48]">High</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <section className="overflow-hidden rounded-xl border border-[#e2e8f0]/50 bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)]">
              <div className="border-b border-[#e2e8f0]/30 px-8 py-6">
                <h2 className={`${manrope.className} font-bold tracking-tight`}>Vulnerability Breakdown</h2>
              </div>
              <div className="px-8 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                    <span className="inline-block h-3 w-3 rounded-full bg-[#e11d48]" />
                    Critical
                  </span>
                  <span className="font-bold">8</span>
                </div>
                <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#e11d48] h-full" style={{ width: "45%" }} />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-[#e2e8f0]/50 bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)]">
              <div className="border-b border-[#e2e8f0]/30 px-8 py-6">
                <h2 className={`${manrope.className} font-bold tracking-tight`}>Quick Actions</h2>
              </div>
              <div className="px-8 py-6 space-y-3">
                <Link 
                  href="/upload"
                  className="block w-full rounded-lg border border-[#0052cc] bg-[#0052cc] text-white py-2 px-4 text-center font-bold transition-all hover:bg-[#0747a6]"
                >
                  New Scan
                </Link>
                <button className="w-full rounded-lg border border-[#cbd5e1] bg-white py-2 px-4 text-center font-bold text-[#0f172a] transition-colors hover:bg-[#f1f5f9]">
                  Export Report
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
