"use client"

import { Inter, Manrope } from "next/font/google"
import {
  AlertTriangle,
  Bell,
  Cloud,
  Database,
  Download,
  Globe,
  Plus,
  Search,
  Server,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] })
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

const bars = [35, 55, 40, 85, 60, 30, 75, 50, 65, 45]

export default function DashboardPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#fcfdfe] text-[#0f172a] antialiased selection:bg-[#0052cc]/10`}>
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0]/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <span className={`${manrope.className} text-xl font-extrabold tracking-tight text-[#0052cc]`}>CyberGuard</span>
            <nav className="hidden items-center gap-1 md:flex">
              <a className="rounded-full bg-[#0052cc]/5 px-4 py-2 text-sm font-semibold text-[#0052cc]" href="#">
                Dashboard
              </a>
              <a className="rounded-full px-4 py-2 text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a]" href="#">
                Projects
              </a>
              <a className="rounded-full px-4 py-2 text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a]" href="#">
                Infrastructure
              </a>
              <a className="rounded-full px-4 py-2 text-sm font-medium text-[#64748b] transition-colors hover:text-[#0f172a]" href="#">
                Activity Log
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9]">
              <Search className="h-[22px] w-[22px]" />
            </button>
            <button className="relative rounded-full p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9]">
              <Bell className="h-[22px] w-[22px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#e11d48]" />
            </button>
            <div className="mx-2 h-6 w-px bg-[#e2e8f0]" />
            <div className="group flex cursor-pointer items-center gap-3 pl-1">
              <div className="mr-1 hidden flex-col items-end sm:flex">
                <span className="text-xs font-bold leading-none">Alex Rivera</span>
                <span className="text-[10px] font-medium leading-tight text-[#64748b]">Security Architect</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] ring-2 ring-[#f1f5f9] transition-all group-hover:ring-[#0052cc]/20">
                <UserRound className="h-4 w-4 text-[#334155]" />
              </div>
            </div>
          </div>
        </div>
      </header>

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
              <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">+12.4%</span>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Total Assets</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight`}>1,284</p>
          </div>

          <div className="rounded-xl border border-[#f1f5f9] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#f1f5f9] p-2.5">
                <ShieldCheck className="h-5 w-5 text-[#475569]" />
              </div>
              <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[10px] font-bold text-[#64748b]">Stable</span>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Vulnerabilities</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight`}>42</p>
          </div>

          <div className="rounded-xl border border-[#f1f5f9] border-l-4 border-l-[#e11d48] bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.05),0_1px_2px_-1px_rgb(0_0_0/0.05),0_4px_6px_-1px_rgb(0_0_0/0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.08)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-[#fff1f2] p-2.5">
                <ShieldAlert className="h-5 w-5 text-[#e11d48]" />
              </div>
              <span className="rounded-md bg-[#fff1f2] px-2 py-0.5 text-[10px] font-bold text-[#e11d48]">Urgent</span>
            </div>
            <h3 className="mb-0.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">High Risk</h3>
            <p className={`${manrope.className} text-3xl font-bold tracking-tight text-[#e11d48]`}>07</p>
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
                <h2 className={`${manrope.className} text-lg font-bold tracking-tight`}>Active Scan Queue</h2>
                <button className="rounded-md px-3 py-1.5 text-xs font-bold text-[#0052cc] transition-colors hover:bg-[#0052cc]/5">
                  Manage All
                </button>
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
                  <tbody className="divide-y divide-[#e2e8f0]/20">
                    <tr className="group transition-colors hover:bg-[#f1f5f9]/30">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f5f9] transition-colors group-hover:bg-[#0052cc]/10">
                            <Cloud className="h-[18px] w-[18px] text-[#64748b] transition-colors group-hover:text-[#0052cc]" />
                          </div>
                          <div>
                            <span className="mb-1 block font-bold leading-none text-[#0f172a]">Alpha Cloud Edge</span>
                            <span className="text-[11px] text-[#64748b]">Production · AWS Oregon</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-extrabold uppercase text-green-700">
                          Passed
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-[#64748b]">Oct 12, 14:20</td>
                      <td className="px-8 py-5">
                        <div className="flex gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e11d48] shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e2e8f0]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e2e8f0]" />
                        </div>
                      </td>
                    </tr>

                    <tr className="group transition-colors hover:bg-[#f1f5f9]/30">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f5f9] transition-colors group-hover:bg-[#0052cc]/10">
                            <Database className="h-[18px] w-[18px] text-[#64748b] transition-colors group-hover:text-[#0052cc]" />
                          </div>
                          <div>
                            <span className="mb-1 block font-bold leading-none text-[#0f172a]">Main DB Pipeline</span>
                            <span className="text-[11px] text-[#64748b]">Critical · Azure East</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#0052cc]" />
                          <span className="text-[10px] font-extrabold uppercase text-[#0052cc]">Scanning...</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-[#64748b]">Oct 14, 09:12</td>
                      <td className="px-8 py-5 text-[10px] font-bold uppercase italic text-[#64748b]">Analyzing...</td>
                    </tr>

                    <tr className="group transition-colors hover:bg-[#f1f5f9]/30">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f5f9] transition-colors group-hover:bg-[#0052cc]/10">
                            <Globe className="h-[18px] w-[18px] text-[#64748b] transition-colors group-hover:text-[#0052cc]" />
                          </div>
                          <div>
                            <span className="mb-1 block font-bold leading-none text-[#0f172a]">Public API Gateway</span>
                            <span className="text-[11px] text-[#64748b]">Public · Global</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-extrabold uppercase text-green-700">
                          Passed
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-[#64748b]">Oct 10, 11:45</td>
                      <td className="px-8 py-5">
                        <div className="flex gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e2e8f0]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e2e8f0]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-[#e2e8f0]" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <aside className="rounded-xl border border-[#e2e8f0]/30 bg-[#f8fafc] p-7">
              <div className="mb-6 flex items-center justify-between">
                <h2 className={`${manrope.className} text-lg font-bold tracking-tight`}>Intelligence</h2>
                <span className="h-2 w-2 rounded-full bg-[#e11d48]" />
              </div>
              <div className="space-y-7">
                <div className="group flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#fff1f2] transition-transform group-hover:scale-110">
                    <AlertTriangle className="h-5 w-5 text-[#e11d48]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#0f172a]">Critical Zero-Day: CVE-2024-4210</h4>
                    <p className="text-xs leading-relaxed text-[#64748b]">
                      Affecting Node.js runtimes. 14 vulnerable assets found in your perimeter.
                    </p>
                    <span className="block pt-1 text-[10px] font-bold uppercase tracking-wider text-[#cbd5e1]">
                      2h ago · Threat Intel
                    </span>
                  </div>
                </div>
                <div className="group flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#0052cc]/10 transition-transform group-hover:scale-110">
                    <Shield className="h-5 w-5 text-[#0052cc]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#0f172a]">Infrastructure Patch 2.4.1</h4>
                    <p className="text-xs leading-relaxed text-[#64748b]">
                      Mandatory security update available for 8 staging environments.
                    </p>
                    <span className="block pt-1 text-[10px] font-bold uppercase tracking-wider text-[#cbd5e1]">1d ago · Ops</span>
                  </div>
                </div>
              </div>
              <button className="mt-8 w-full rounded-lg border border-[#e2e8f0] py-2.5 text-xs font-bold transition-colors hover:bg-[#f1f5f9]">
                View All Insights
              </button>
            </aside>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-[#e2e8f0]/30 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <span className={`${manrope.className} text-xl font-extrabold tracking-tight text-[#0052cc]`}>CyberGuard</span>
              <p className="mt-2 text-xs font-medium text-[#64748b]">Intelligence Driven Security Posture Management</p>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              <a className="text-xs font-bold uppercase tracking-widest text-[#64748b] transition-colors hover:text-[#0052cc]" href="#">
                Support
              </a>
              <a className="text-xs font-bold uppercase tracking-widest text-[#64748b] transition-colors hover:text-[#0052cc]" href="#">
                Security Docs
              </a>
              <a className="text-xs font-bold uppercase tracking-widest text-[#64748b] transition-colors hover:text-[#0052cc]" href="#">
                Compliance
              </a>
              <a className="text-xs font-bold uppercase tracking-widest text-[#64748b] transition-colors hover:text-[#0052cc]" href="#">
                Privacy
              </a>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e2e8f0]/20 pt-8 sm:flex-row">
            <p className="text-[11px] font-medium text-[#cbd5e1]">© 2024 CyberGuard Sentinel Editorial. All rights reserved.</p>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f1f5f9] transition-colors hover:bg-[#0052cc]/10 hover:text-[#0052cc]">
                <Globe className="h-[18px] w-[18px]" />
              </div>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f1f5f9] transition-colors hover:bg-[#0052cc]/10 hover:text-[#0052cc]">
                <Share2 className="h-[18px] w-[18px]" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
