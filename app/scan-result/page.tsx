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
} from "lucide-react"
import { Manrope } from "next/font/google"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

interface ScanResult {
  id: number
  project: string
  file: string
  icon: "hub" | "cart" | "dns" | "terminal"
  date: string
  time: string
  vulnerabilities: {
    level: "high" | "medium" | "low" | "secure"
    count?: number
    label: string
  }[]
}

export default function ScanResultPage() {
  const scans: ScanResult[] = [
    {
      id: 1,
      project: "CloudScale API",
      file: "auth_module_v2.ts",
      icon: "hub",
      date: "Oct 24, 2024",
      time: "14:22 PM",
      vulnerabilities: [
        { level: "high", count: 3, label: "High" },
        { level: "low", count: 12, label: "Low" },
      ],
    },
    {
      id: 2,
      project: "E-Commerce Web",
      file: "checkout_flow.js",
      icon: "cart",
      date: "Oct 23, 2024",
      time: "09:15 AM",
      vulnerabilities: [{ level: "secure", label: "Secure" }],
    },
    {
      id: 3,
      project: "Internal CRM",
      file: "database_config.yaml",
      icon: "dns",
      date: "Oct 21, 2024",
      time: "11:04 AM",
      vulnerabilities: [
        { level: "medium", count: 8, label: "Medium" },
        { level: "low", count: 4, label: "Low" },
      ],
    },
    {
      id: 4,
      project: "Legacy Portal",
      file: "index.php",
      icon: "terminal",
      date: "Oct 19, 2024",
      time: "16:45 PM",
      vulnerabilities: [{ level: "high", count: 12, label: "High" }],
    },
  ]

  const getIcon = (iconType: string) => {
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

  const getIconBgColor = () => {
    return "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
  }

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
              Review your automated security audits. Data is organized by project urgency and detection timeline to ensure
              your infrastructure remains fortified.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-outline-variant/30 text-on-surface font-semibold rounded-full hover:bg-surface-container-low transition-all flex items-center gap-2 text-sm shadow-sm">
              <Filter className="w-5 h-5" />
              Filter
            </button>
            <button className="px-5 py-2.5 bg-primary text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm">
              <Plus className="w-5 h-5" />
              New Scan
            </button>
          </div>
        </header>

        {/* Stats Overview Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* System Health Card - 2 cols */}
          <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">System Health</p>
              <h3 className={`${manrope.className} mb-4 text-3xl font-bold text-on-surface`}>
                No Critical Threats
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
                Your last 12 scans have remained within the safe thresholds. Keep maintaining high standards.
              </p>
            </div>
            <Shield className="absolute -right-6 -bottom-6 text-primary/5 w-[180px] h-[180px] group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
          </div>

          {/* Total Scans Card - Primary */}
          <div className="bg-primary text-white p-8 rounded-lg shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium opacity-70 uppercase tracking-widest mb-1">Total Scans</p>
              <p className={`${manrope.className} text-5xl font-black`}>1,284</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
              <TrendingUp className="w-4 h-4" />
              <span>12% increase</span>
            </div>
          </div>

          {/* Vulnerabilities Card */}
          <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(42,52,57,0.03)] border border-outline-variant/10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Vulnerabilities</p>
              <p className={`${manrope.className} text-5xl font-black text-error`}>42</p>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
              Mostly low-priority dependency updates required.
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
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-surface-container-low/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${getIconBgColor()} flex items-center justify-center transition-all`}>
                          {getIcon(scan.icon)}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-sm mb-0.5">{scan.project}</div>
                          <div className="text-xs font-mono text-on-surface-variant opacity-70">{scan.file}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium text-sm">{scan.date}</span>
                        <span className="text-[10px] text-on-surface-variant opacity-60">{scan.time}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {scan.vulnerabilities.map((vuln, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVulnerabilityBadgeColor(vuln.level)}`}
                          >
                            {vuln.level === "secure" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {vuln.count ? `${vuln.count} ${vuln.label}` : vuln.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        href={`/scan-result/${scan.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-primary font-bold text-xs hover:bg-primary/5 transition-all border border-transparent hover:border-primary/10"
                      >
                        View Detail
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-5 bg-surface-container-low/10 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <span className="text-xs font-medium text-on-surface-variant">
              Showing <span className="text-on-surface">1 to 4</span> of 128 scans
            </span>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-white text-on-surface-variant transition-all hover:text-primary">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white shadow-sm text-xs font-bold">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-white text-on-surface-variant transition-all hover:text-primary text-xs font-bold">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/20 hover:bg-white text-on-surface-variant transition-all hover:text-primary">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t border-outline-variant/10 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center w-full py-10 px-8">
          <div className="mb-6 md:mb-0">
            <span className={`${manrope.className} font-black text-primary text-xl`}>CyberGuard</span>
            <p className="text-on-surface-variant text-[11px] mt-1 font-medium">
              © 2024 CyberGuard Editorial. Protected Systems.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Documentation
            </a>
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Security Hub
            </a>
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
