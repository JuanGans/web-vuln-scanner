"use client"

import { Navbar } from "@/components/navbar"
import { RemediationCard } from "@/components/RemediationCard"
import { TrendChart } from "@/components/TrendChart"
import { ChevronRight, ChevronDown, Copy, ArrowLeft, RefreshCw, Check, AlertCircle, Plus } from "lucide-react"
import { Manrope } from "next/font/google"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getRemediationGuide } from "@/lib/remediationGuide"

const manrope = Manrope({ subsets: ["latin"], weight: ["200", "400", "600", "800"] })

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Kritis":
      return { bg: "bg-error/10", text: "text-error", badge: "bg-error-container text-on-error-container" }
    case "Tinggi":
      return { bg: "bg-yellow-500/10", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-800" }
    case "Sedang":
      return { bg: "bg-blue-500/10", text: "text-blue-600", badge: "bg-blue-100 text-blue-800" }
    default:
      return { bg: "bg-green-500/10", text: "text-green-600", badge: "bg-green-100 text-green-800" }
  }
}

interface ScanDetail {
  id: string
  fileName?: string
  projectId?: string
  project?: {
    id: string
    name: string
    description?: string
  } | null
  result: {
    success?: boolean
    summary?: {
      totalVulnerabilities?: number
      vulnerabilitiesByType?: {
        XSS?: number
        SQLInjection?: number
      }
      vulnerabilitiesBySeverity?: {
        Kritis?: number
        Tinggi?: number
        Sedang?: number
        Rendah?: number
      }
    }
    isRescan?: boolean
    originalScanId?: string
    comparison?: {
      fixed: Array<unknown>
      remaining: Array<unknown>
      newFound: Array<unknown>
    }
    scoreImprovement?: {
      before: number
      after: number
      fixed: number
      newFound: number
      percentageFixed: number
    }
    vulnerabilities?: Array<{
      id: string
      type: "SQLInjection" | "XSS"
      severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah"
      file: string
      line: number
      code: string
      description: string
      remediation: string
      taintPath: string[]
      codeExample: {
        vulnerable: string
        safe: string
      }
      riskScore?: number
      confidence?: number
      exploitability?: number
      codeContext?: {
        before: string[]
        target: string
        after: string[]
      }
      owasp?: string
      cwe?: string
    }>
    layerResults?: Record<string, unknown>
  }
  createdAt: string
  updatedAt: string
}

interface VulnerabilityItem {
  id: string
  type: "SQLInjection" | "XSS"
  severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah"
  file: string
  line: number
  code: string
  description: string
  remediation: string
  taintPath: string[]
  codeExample: {
    vulnerable: string
    safe: string
  }
  riskScore?: number
  confidence?: number
  exploitability?: number
  codeContext?: {
    before: string[]
    target: string
    after: string[]
  }
  owasp?: string
  cwe?: string
}

interface GroupedVulnerabilities {
  fileKey: string
  fileName: string
  vulnerabilities: Array<VulnerabilityItem & { originalIndex: number }>
}

export default function ScanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [data, setData] = useState<ScanDetail | null>(null)
  const [allScans, setAllScans] = useState<ScanDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [openFileGroups, setOpenFileGroups] = useState<Record<string, boolean>>({})
  const [originalScan, setOriginalScan] = useState<ScanDetail | null>(null)
  const [relatedRescans, setRelatedRescans] = useState<ScanDetail[]>([])

  useEffect(() => {
    const fetchScanDetail = async () => {
      if (!id) return

      try {
        const res = await fetch(`/api/history`)
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
        }
        const allData = await res.json()

        // Store all scans for calculating position
        setAllScans(allData.data || [])

        // Find the specific scan by ID
        const scanDetail = (allData.data as ScanDetail[])?.find((scan: ScanDetail) => scan.id === id)

        if (scanDetail) {
          setData(scanDetail)
          
          // If this is a rescan, fetch the original scan
          if (scanDetail.result?.isRescan && scanDetail.result?.originalScanId) {
            const original = (allData.data as ScanDetail[])?.find((scan: ScanDetail) => scan.id === scanDetail.result?.originalScanId)
            if (original) {
              setOriginalScan(original)
            }
          } else {
            // If this is an original scan (not a rescan), find all related rescans
            const rescans = (allData.data as ScanDetail[])?.filter((scan: ScanDetail) => 
              scan.result?.isRescan && scan.result?.originalScanId === id
            ) || []
            if (rescans.length > 0) {
              setRelatedRescans(rescans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            }
          }
        } else {
          setError("Scan not found")
        }
      } catch (err) {
        console.error("Failed to fetch scan detail:", err)
        setError(err instanceof Error ? err.message : "Failed to load scan details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScanDetail()
  }, [id])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format date consistently across app
  const formatScanDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  // Get project name or default
  const getProjectName = (scan: ScanDetail | null) => {
    if (!scan) return "Scan"
    if ((scan as any).project?.name) {
      return (scan as any).project.name
    }
    return "Unassigned Scan"
  }

  // Calculate scan number within project
  const getScanNumber = (scan: ScanDetail | null): number => {
    if (!scan || !allScans.length) return 1
    const projectScans = allScans.filter((s) => s.projectId === scan.projectId)
    const scansCount = projectScans.length
    const scanIndex = projectScans.findIndex((s) => s.id === scan.id)
    return scansCount - scanIndex // Reverse order for descending display
  }

  const getFileName = (filePath: string) => {
    return filePath.split("\\").pop() || filePath.split("/").pop() || filePath
  }

  const groupVulnerabilitiesByFile = (vulnerabilities: VulnerabilityItem[]): GroupedVulnerabilities[] => {
    const groups = new Map<string, GroupedVulnerabilities>()
    const uploadedFileName = data?.fileName ? getFileName(data.fileName) : ""
    const isSingleCodeFileUpload = /\.(php|js)$/i.test(uploadedFileName)

    vulnerabilities.forEach((vuln, index) => {
      const vulnFileName = getFileName(vuln.file || "")
      const fileKey = isSingleCodeFileUpload
        ? uploadedFileName || "unknown-file"
        : vulnFileName || uploadedFileName || "unknown-file"
      const fileName = isSingleCodeFileUpload
        ? uploadedFileName || vulnFileName || "unknown"
        : vulnFileName || uploadedFileName || "unknown"

      if (!groups.has(fileKey)) {
        groups.set(fileKey, {
          fileKey,
          fileName,
          vulnerabilities: [],
        })
      }

      groups.get(fileKey)!.vulnerabilities.push({
        ...vuln,
        originalIndex: index,
      })
    })

    return Array.from(groups.values())
  }

  const toggleFileGroup = (fileKey: string) => {
    setOpenFileGroups((prev) => ({
      ...prev,
      [fileKey]: !prev[fileKey],
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <Navbar activePage="scan-result" />
        <main className="flex-grow max-w-7xl mx-auto w-full px-8 pt-12 pb-24 flex items-center justify-center">
          <p className="text-on-surface-variant">Loading scan details...</p>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col">
        <Navbar activePage="scan-result" />
        <main className="flex-grow max-w-7xl mx-auto w-full px-8 pt-12 pb-24 flex flex-col items-center justify-center gap-6">
          <p className="text-on-surface-variant text-lg">Scan Result Not Found</p>
          <button
            onClick={() => router.push("/scan-result")}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-white font-bold hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar activePage="scan-result" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-8 pt-12 pb-24">
        {/* Back Button */}
        <button
          onClick={() => router.push("/scan-result")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Results
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-on-surface-variant mb-6 text-sm font-medium tracking-wide">
          <button
            onClick={() => router.push("/scan-result")}
            className="cursor-pointer hover:text-primary transition-colors duration-200 underline-offset-2 hover:underline"
          >
            SCANS
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary font-bold">{getProjectName(data)}</span>
        </div>

        {/* Title and Info */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className={`${manrope.className} text-5xl font-extrabold tracking-tight text-on-surface mb-4`}>
                Scan Result: {getProjectName(data)}
              </h1>
              {data.result?.isRescan && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                  Rescan
                </span>
              )}
            </div>
            <button
              onClick={() => router.push(`/upload?scanId=${id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:shadow-lg transition-all shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Rescan File
            </button>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Description</p>
              <p className="text-on-surface font-bold max-w-sm leading-relaxed">
                {data?.project?.description || (data?.fileName ? `Security scan analysis of ${data.fileName}` : "Security vulnerability scan")}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Scan Date</p>
              <p className="text-on-surface font-bold">
                {formatScanDate(data.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Last Updated</p>
              <p className="text-on-surface font-bold">
                {formatScanDate(data.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Status</p>
              <p className="text-2xl font-bold text-green-600">✓ Analyzed</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Total Vulnerabilities</p>
              <p className="text-2xl font-bold text-on-surface">{data.result?.summary?.totalVulnerabilities || 0}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">XSS Found</p>
              <p className="text-2xl font-bold text-on-surface">{data.result?.summary?.vulnerabilitiesByType?.XSS || 0}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">SQL Injection Found</p>
              <p className="text-2xl font-bold text-on-surface">{data.result?.summary?.vulnerabilitiesByType?.SQLInjection || 0}</p>
            </div>
          </div>

          {/* Rescan Comparison Section */}
          {data.result?.isRescan && data.result?.scoreImprovement && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200 shadow-[0_4px_20px_rgba(34,197,94,0.1)]">
              <h2 className={`${manrope.className} text-2xl font-bold text-on-surface mb-6 flex items-center gap-2`}>
                <Check className="w-6 h-6 text-green-600" />
                Rescan Comparison
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Fixed Vulnerabilities */}
                <div className="bg-white rounded-lg p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-xs text-on-surface-variant font-bold uppercase">Fixed</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{data.result.scoreImprovement.fixed}</p>
                  <p className="text-sm text-on-surface-variant mt-2">
                    {data.result.scoreImprovement.percentageFixed}% of vulnerabilities fixed
                  </p>
                </div>

                {/* Remaining Vulnerabilities */}
                <div className="bg-white rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-xs text-on-surface-variant font-bold uppercase">Remaining</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{data.result.scoreImprovement.before - data.result.scoreImprovement.fixed}</p>
                  <p className="text-sm text-on-surface-variant mt-2">Vulnerabilities still present</p>
                </div>

                {/* New Found Vulnerabilities */}
                <div className="bg-white rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <p className="text-xs text-on-surface-variant font-bold uppercase">New Found</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{data.result.scoreImprovement.newFound}</p>
                  <p className="text-sm text-on-surface-variant mt-2">New vulnerabilities discovered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-green-200">
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Before Rescan</p>
                  <p className="text-2xl font-bold text-on-surface">{data.result.scoreImprovement.before}</p>
                  <p className="text-sm text-on-surface-variant">Total vulnerabilities</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">After Rescan</p>
                  <p className="text-2xl font-bold text-green-600">{data.result.scoreImprovement.after}</p>
                  <p className="text-sm text-on-surface-variant">Total vulnerabilities</p>
                </div>
              </div>

              {originalScan && (
                <div className="mt-6 pt-6 border-t border-green-200">
                  <button
                    onClick={() => router.push(`/scan-result/${originalScan.id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-green-600 font-semibold hover:bg-green-50 transition-all border border-green-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    View Original Scan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Related Rescans Section */}
          {!data.result?.isRescan && relatedRescans.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
              <h2 className={`${manrope.className} text-2xl font-bold text-on-surface mb-6 flex items-center gap-2`}>
                <RefreshCw className="w-6 h-6 text-blue-600" />
                Related Rescans ({relatedRescans.length})
              </h2>
              
              <div className="space-y-3">
                {relatedRescans.map((rescan) => {
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString)
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    const month = months[date.getMonth()]
                    const day = date.getDate()
                    const year = date.getFullYear()
                    return `${month} ${day}, ${year}`
                  }

                  return (
                    <button
                      key={rescan.id}
                      onClick={() => router.push(`/scan-result/${rescan.id}`)}
                      className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                            Rescan
                          </span>
                          <p className="text-sm text-on-surface font-semibold group-hover:text-blue-600 transition-colors">
                            {formatDate(rescan.createdAt)}
                          </p>
                        </div>
                        {rescan.result?.scoreImprovement && (
                          <p className="text-xs text-on-surface-variant">
                            {rescan.result.scoreImprovement.fixed} fixed • 
                            {rescan.result.scoreImprovement.before - rescan.result.scoreImprovement.fixed} remaining • 
                            {rescan.result.scoreImprovement.newFound} new
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vulnerabilities List */}
          <div className="bg-surface-container rounded-lg p-8 border border-outline-variant/10 shadow-[0_4px_20px_rgba(42,52,57,0.03)]">
            <h2 className={`${manrope.className} text-2xl font-bold text-on-surface mb-6`}>Vulnerabilities Found</h2>
            {data.result?.vulnerabilities && data.result.vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {groupVulnerabilitiesByFile(data.result.vulnerabilities as VulnerabilityItem[]).map((group) => {
                  const isOpen = !!openFileGroups[group.fileKey]
                  const highestRiskScore = group.vulnerabilities.reduce((max, vuln) => {
                    const score = vuln.riskScore || 0
                    return score > max ? score : max
                  }, 0)

                  return (
                    <div key={group.fileKey} className="rounded-lg border border-outline-variant/10 bg-surface-container-low">
                      <button
                        type="button"
                        onClick={() => toggleFileGroup(group.fileKey)}
                        className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-primary/5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="rounded bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              {group.vulnerabilities.length} Vulnerabilities
                            </span>
                            <span className="font-semibold text-on-surface">{group.fileName}</span>
                          </div>
                          <p className="text-sm text-on-surface-variant">
                            Klik untuk melihat daftar vulnerability di file ini.
                          </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-lg font-bold text-on-surface">{highestRiskScore || "N/A"}/10</p>
                            <p className="text-xs text-on-surface-variant">Highest Risk</p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-outline-variant/10 p-4 space-y-3">
                          {group.vulnerabilities.map((vuln) => {
                            const severityColor = getSeverityColor(vuln.severity)
                            const displayIndex = vuln.originalIndex

                            return (
                              <a
                                key={vuln.id}
                                href={`/scan-result/${id}/vulnerability/${displayIndex}`}
                                className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                              >
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className={`${severityColor.badge} px-3 py-1 rounded text-xs font-bold`}>
                                      {vuln.severity}
                                    </span>
                                    <span className="text-on-surface font-semibold group-hover:text-primary transition-colors">
                                      {vuln.type === "XSS" ? "Cross-Site Scripting (XSS)" : "SQL Injection"} #{displayIndex + 1}
                                    </span>
                                  </div>
                                  <p className="text-on-surface-variant text-sm truncate">
                                    <span className="font-mono">{group.fileName}</span>
                                    <span className="opacity-50"> at Line {vuln.line}</span>
                                  </p>
                                  <p className="text-on-surface-variant text-xs mt-1 truncate">
                                    {vuln.code.substring(0, 80)}...
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 ml-4 shrink-0">
                                  <div className="text-right">
                                    <p className="text-on-surface font-bold text-lg">{vuln.riskScore || "N/A"}/10</p>
                                    <p className="text-on-surface-variant text-xs">Risk Score</p>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-8">No vulnerabilities found</p>
            )}
          </div>

          {/* Remediation Guidance Section */}
          {data.result?.vulnerabilities && data.result.vulnerabilities.length > 0 && (
            <div className="bg-surface-container rounded-lg p-8 border border-outline-variant/10 shadow-[0_4px_20px_rgba(42,52,57,0.03)]">
              <h2 className={`${manrope.className} text-2xl font-bold text-on-surface mb-6`}>📚 Panduan Perbaikan</h2>
              <p className="text-on-surface-variant mb-6">
                Berikut adalah langkah-langkah detail untuk memperbaiki setiap kerentanan yang ditemukan. Klik pada setiap guide untuk melihat contoh kode dan best practices.
              </p>
              <div className="space-y-6">
                {data.result.vulnerabilities.map((vuln, idx: number) => {
                  // Map vulnerability type to rule ID
                  let ruleId = `${vuln.type === "XSS" ? "XSS" : "SQLI"}_001`
                  
                  // Try to get remediation guide
                  try {
                    const guide = getRemediationGuide(ruleId)
                    if (guide) {
                      // Map severity for RemediationCard
                      const severityMap = {
                        "Kritis": "CRITICAL",
                        "Tinggi": "HIGH",
                        "Sedang": "MEDIUM",
                        "Rendah": "LOW"
                      } as Record<string, "CRITICAL" | "HIGH" | "MEDIUM" | "LOW">
                      
                      return (
                        <RemediationCard
                          key={idx}
                          ruleName={guide.ruleName}
                          severity={severityMap[vuln.severity] || "MEDIUM"}
                          riskDescription={guide.riskDescription}
                          whyItsDangerous={guide.whyItsDangerous}
                          stepByStepFix={guide.stepByStepFix}
                          beforeCode={guide.beforeCode}
                          afterCode={guide.afterCode}
                          bestPractices={guide.bestPractices}
                          additionalResources={guide.additionalResources}
                        />
                      )
                    }
                  } catch (e) {
                    console.warn(`Could not load remediation for rule: ${ruleId}`)
                  }
                  return null
                })}
              </div>
            </div>
          )}

          {/* Raw Results Display */}
          <div className="bg-surface-container rounded-lg p-8 border border-outline-variant/10 shadow-[0_4px_20px_rgba(42,52,57,0.03)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${manrope.className} text-lg font-bold text-on-surface`}>Raw Results</h3>
              <button
                onClick={() => handleCopyCode(JSON.stringify(data.result, null, 2))}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-primary hover:bg-primary/5 transition-all font-bold text-sm"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-6 overflow-auto max-h-96">
              <pre className="text-xs text-on-surface font-mono leading-relaxed whitespace-pre-wrap break-words">
                {JSON.stringify(data.result, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-surface-container-low rounded-lg p-8 border border-outline-variant/10">
          <h3 className={`${manrope.className} text-lg font-bold text-on-surface mb-4`}>Scan Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Created At</p>
              <p className="text-on-surface font-mono">{new Date(data.createdAt).toISOString()}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Updated At</p>
              <p className="text-on-surface font-mono">{new Date(data.updatedAt).toISOString()}</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
