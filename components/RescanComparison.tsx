"use client"

import { CheckCircle, AlertCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Manrope } from "next/font/google"

const manrope = Manrope({ subsets: ["latin"], weight: ["200", "400", "600", "800"] })

interface VulnerabilityItem {
  id: string
  type: string
  severity: string
  line: number
  code: string
  description: string
  cwe?: string
}

interface ComparisonResult {
  fixed: VulnerabilityItem[]
  remaining: VulnerabilityItem[]
  newFound: VulnerabilityItem[]
}

interface ScoreImprovement {
  before: number
  after: number
  fixed: number
  newFound: number
  percentageFixed: number
}

interface RescanComparisonProps {
  comparison: ComparisonResult
  scoreImprovement: ScoreImprovement
  rescanId: string
  onViewFullResult: () => void
}

export function RescanComparison({
  comparison,
  scoreImprovement,
  rescanId,
  onViewFullResult,
}: RescanComparisonProps) {
  const { fixed, remaining, newFound } = comparison
  const { before, after, percentageFixed } = scoreImprovement

  const getImprovementColor = () => {
    if (percentageFixed >= 80) return "text-green-600"
    if (percentageFixed >= 50) return "text-yellow-600"
    return "text-error"
  }

  const getStatusLabel = () => {
    if (after === 0) return { label: "Fully Secured", color: "text-green-600", bg: "bg-green-500/10" }
    if (percentageFixed > 0 && newFound.length === 0) return { label: "Partially Fixed", color: "text-yellow-600", bg: "bg-yellow-500/10" }
    if (newFound.length > 0) return { label: "New Issues Found", color: "text-error", bg: "bg-error/10" }
    return { label: "No Change", color: "text-on-surface-variant", bg: "bg-surface-container" }
  }

  const status = getStatusLabel()

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant/10 shadow-[0_4px_20px_rgba(42,52,57,0.05)] overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`${manrope.className} text-xl font-bold text-on-surface`}>
              Hasil Rescan
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Perbandingan dengan scan sebelumnya
            </p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-outline-variant/10 border-b border-outline-variant/10">
        <div className="p-5 text-center">
          <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Sebelum</p>
          <p className="text-3xl font-extrabold text-on-surface">{before}</p>
          <p className="text-xs text-on-surface-variant mt-1">vulnerabilities</p>
        </div>

        <div className="p-5 text-center flex flex-col items-center justify-center">
          <div className={`text-2xl font-extrabold ${getImprovementColor()}`}>
            {percentageFixed}%
          </div>
          <p className="text-xs text-on-surface-variant mt-1">diperbaiki</p>
          {before > after ? (
            <TrendingDown className="w-4 h-4 text-green-500 mt-2" />
          ) : before < after ? (
            <TrendingUp className="w-4 h-4 text-error mt-2" />
          ) : (
            <Minus className="w-4 h-4 text-on-surface-variant mt-2" />
          )}
        </div>

        <div className="p-5 text-center">
          <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Setelah</p>
          <p className={`text-3xl font-extrabold ${after < before ? "text-green-600" : after > before ? "text-error" : "text-on-surface"}`}>
            {after}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">vulnerabilities</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {fixed.length > 0 && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-green-500/10">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span className="font-bold text-green-700 text-sm">
                {fixed.length} Bug Berhasil Diperbaiki
              </span>
            </div>
            <div className="divide-y divide-green-500/10">
              {fixed.map((v, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded mt-0.5 shrink-0">
                    {v.type === "XSS" ? "XSS" : "SQLi"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface font-medium line-clamp-1">
                      {v.description?.substring(0, 80) || "Vulnerability fixed"}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Line {v.line} · {v.severity} · {v.cwe || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {remaining.length > 0 && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-yellow-500/10">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="font-bold text-yellow-700 text-sm">
                {remaining.length} Bug Belum Diperbaiki
              </span>
            </div>
            <div className="divide-y divide-yellow-500/10">
              {remaining.map((v, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xs font-bold text-yellow-700 bg-yellow-500/10 px-2 py-0.5 rounded mt-0.5 shrink-0">
                    {v.type === "XSS" ? "XSS" : "SQLi"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface font-medium line-clamp-1">
                      {v.description?.substring(0, 80) || "Still vulnerable"}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Line {v.line} · {v.severity} · {v.cwe || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {newFound.length > 0 && (
          <div className="rounded-lg border border-error/20 bg-error/5 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-error/10">
              <AlertCircle className="w-4 h-4 text-error shrink-0" />
              <span className="font-bold text-error text-sm">
                {newFound.length} Bug Baru Ditemukan
              </span>
            </div>
            <div className="divide-y divide-error/10">
              {newFound.map((v, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded mt-0.5 shrink-0">
                    {v.type === "XSS" ? "XSS" : "SQLi"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface font-medium line-clamp-1">
                      {v.description?.substring(0, 80) || "New vulnerability found"}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Line {v.line} · {v.severity} · {v.cwe || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fixed.length === 0 && remaining.length === 0 && newFound.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-bold text-on-surface">Tidak ada perubahan terdeteksi</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Kedua scan menghasilkan temuan yang sama
            </p>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={onViewFullResult}
          className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm hover:shadow-lg transition-all"
        >
          Lihat Hasil Rescan Lengkap
        </button>
      </div>
    </div>
  )
}