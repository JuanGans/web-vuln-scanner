/**
 * API Result Enricher
 * Menambahkan remediation data, severity mapping, dan explanations
 * Fokus: Melengkapi scan results dengan detail edukatif
 */

import { getRemediationGuide } from "@/lib/remediationGuide"
import { calculateHealthScore, determineSecurityStatus, calculateCriticalAlerts } from "@/lib/scanResultEnrichment"

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

interface VulnerabilityEnriched {
  id: string
  type: "SQLInjection" | "XSS"
  severity: SeverityLevel
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
  
  // NEW: Enriched fields
  remediationGuide?: {
    ruleName: string
    whyItsDangerous: string
    stepByStepFix: string[]
    beforeCode: string
    afterCode: string
    bestPractices: string[]
    additionalResources?: string[]
  }
  severityExplanation?: string
  quickFix?: string
  ruleId?: string
}

interface EnrichedScanResponse {
  success: boolean
  summary: {
    totalVulnerabilities: number
    vulnerabilitiesByType: Record<string, number>
    vulnerabilitiesBySeverity: {
      CRITICAL: number
      HIGH: number
      MEDIUM: number
      LOW: number
    }
    healthScore: number
    securityStatus: "SECURE" | "ATTENTION" | "AT_RISK" | "STABLE"
    criticalAlerts: number
  }
  vulnerabilities: VulnerabilityEnriched[]
  metadata: {
    scanDate: string
    detectionAccuracy: number
    severityWeighting: {
      CRITICAL: number
      HIGH: number
      MEDIUM: number
      LOW: number
    }
  }
}

/**
 * Map Indonesian severity ke English standard
 */
function mapSeverity(indonesianSeverity: string): SeverityLevel {
  const severityMap: Record<string, SeverityLevel> = {
    "Kritis": "CRITICAL",
    "CRITICAL": "CRITICAL",
    "Critical": "CRITICAL",
    
    "Tinggi": "HIGH",
    "HIGH": "HIGH",
    "High": "HIGH",
    
    "Sedang": "MEDIUM",
    "MEDIUM": "MEDIUM",
    "Medium": "MEDIUM",
    
    "Rendah": "LOW",
    "LOW": "LOW",
    "Low": "LOW",
  }
  return severityMap[indonesianSeverity] || "MEDIUM"
}

/**
 * Improve OWASP mapping dengan sub-categories untuk XSS
 */
function getEnhancedOWASPMapping(vulnType: "SQLInjection" | "XSS", code: string, description: string): string {
  const baseOWASP = "A03:2021 – Injection"
  
  if (vulnType === "XSS") {
    if (description.includes("Stored")) {
      return "A03:2021 – Injection (Stored XSS)"
    } else if (description.includes("Reflected")) {
      return "A03:2021 – Injection (Reflected XSS)"
    }
    return "A03:2021 – Injection (Cross-site Scripting)"
  } else if (vulnType === "SQLInjection") {
    return "A03:2021 – Injection (SQL Injection)"
  }
  
  return baseOWASP
}

/**
 * Map vulnerability type ke rule ID untuk remediation lookup - dengan context awareness
 */
function getRemediationRuleId(vulnType: "SQLInjection" | "XSS", severity: SeverityLevel, code: string = "", description: string = ""): string {
  const prefix = vulnType === "XSS" ? "XSS" : "SQLI"
  
  // Map ke existing remediation guides
  const ruleMap: Record<string, string> = {
    "XSS_CRITICAL": "XSS_001",      // Direct Echo
    "XSS_HIGH": "XSS_002",          // Reflected XSS
    "XSS_MEDIUM": "XSS_003",        // Stored XSS
    "XSS_LOW": "XSS_004",           // CSS/SVG Injection
    
    "SQLI_CRITICAL": "SQLI_001",    // Direct Query
    "SQLI_HIGH": "SQLI_002",        // String Concat
    "SQLI_MEDIUM": "SQLI_003",      // Dynamic Building
    "SQLI_LOW": "SQLI_004",         // Potential injection
  }
  
  const key = `${prefix}_${severity}`
  let ruleId = ruleMap[key] || `${prefix}_001`
  
  // Fine-tune based on description/code patterns
  if (vulnType === "XSS" && description.includes("Stored")) {
    ruleId = "XSS_003"  // Stored XSS
  }
  
  return ruleId
}

/**
 * Map vulnerability type ke rule ID untuk remediation lookup
 */
function getRemediationRuleId_old(vulnType: "SQLInjection" | "XSS", severity: SeverityLevel): string {
  const prefix = vulnType === "XSS" ? "XSS" : "SQLI"
  
  // Map ke existing remediation guides
  const ruleMap: Record<string, string> = {
    "XSS_CRITICAL": "XSS_001",      // Direct Echo
    "XSS_HIGH": "XSS_002",          // Reflected XSS
    "XSS_MEDIUM": "XSS_004",        // SVG Injection
    "XSS_LOW": "XSS_LOW_001",       // CSS Injection
    
    "SQLI_CRITICAL": "SQLI_001",    // Direct Query
    "SQLI_HIGH": "SQLI_002",        // String Concat
    "SQLI_MEDIUM": "SQLI_003",      // Dynamic Building
    "SQLI_LOW": "SQLI_LOW_001",     // Parameter Safety
  }
  
  const key = `${prefix}_${severity}`
  return ruleMap[key] || `${prefix}_001`
}

/**
 * Enrich single vulnerability dengan remediation data
 */
function enrichVulnerability(vuln: any, index: number): VulnerabilityEnriched {
  const mappedSeverity = mapSeverity(vuln.severity)
  const ruleId = getRemediationRuleId(vuln.type, mappedSeverity, vuln.code, vuln.description)
  
  // Try to get remediation guide
  let remediationGuide = undefined
  try {
    const guide = getRemediationGuide(ruleId)
    if (guide) {
      remediationGuide = {
        ruleName: guide.ruleName,
        whyItsDangerous: guide.whyItsDangerous,
        stepByStepFix: guide.stepByStepFix,
        beforeCode: guide.beforeCode,
        afterCode: guide.afterCode,
        bestPractices: guide.bestPractices,
        additionalResources: guide.additionalResources,
      }
    }
  } catch (e) {
    console.warn(`Failed to load remediation for rule: ${ruleId}`)
  }
  
  // Generate severity explanation
  const severityExplanations: Record<SeverityLevel, string> = {
    "CRITICAL": "Vulnerability ini HARUS diperbaiki segera. Dapat menyebabkan akses tidak sah, data breach, atau RCE (Remote Code Execution).",
    "HIGH": "Vulnerability serius yang perlu diperbaiki dalam waktu dekat. Meningkatkan risiko keamanan aplikasi secara signifikan.",
    "MEDIUM": "Vulnerability yang perlu perhatian. Perbaiki dalam rencana pengembangan berikutnya untuk memperkuat postur keamanan.",
    "LOW": "Vulnerability dengan dampak minimal tapi tetap perlu ditangani untuk praktik best practice dan defense in depth."
  }
  
  // Generate quick fix suggestion
  const quickFixMap: Record<string, string> = {
    "XSS": "Gunakan output encoding/escaping untuk semua user input sebelum ditampilkan di HTML.",
    "SQLInjection": "Gunakan prepared statements dengan parameterized queries untuk semua database operations."
  }
  
  // Enhanced OWASP mapping with XSS sub-categories
  const enhancedOWASP = getEnhancedOWASPMapping(vuln.type, vuln.code, vuln.description)
  
  return {
    id: `${vuln.type}_${index}`,
    type: vuln.type,
    severity: mappedSeverity,
    file: vuln.file,
    line: vuln.line,
    code: vuln.code,
    description: vuln.description,  // Already detailed from scannerCLI
    remediation: vuln.remediation,  // Already detailed from scannerCLI
    taintPath: vuln.taintPath || [],
    codeExample: vuln.codeExample || { vulnerable: "", safe: "" },
    riskScore: vuln.riskScore,
    confidence: vuln.confidence,
    exploitability: vuln.exploitability,
    codeContext: vuln.codeContext,
    owasp: enhancedOWASP,  // Now with XSS sub-categories
    cwe: vuln.cwe,  // Already auto-mapped from scannerCLI
    
    // NEW enriched fields
    remediationGuide,
    severityExplanation: severityExplanations[mappedSeverity],
    quickFix: quickFixMap[vuln.type],
    ruleId,
  }
}

/**
 * Calculate detection accuracy berdasarkan severity distribution
 * CRITICAL/HIGH: 95% | MEDIUM: 80% | LOW: 70%
 * Weighted average
 */
function calculateDetectionAccuracy(
  criticalCount: number,
  highCount: number,
  mediumCount: number,
  lowCount: number
): number {
  if (criticalCount + highCount + mediumCount + lowCount === 0) {
    return 100 // No vulns = 100% accurate (nothing to detect)
  }
  
  const totalVulns = criticalCount + highCount + mediumCount + lowCount
  const accuracy = (
    (criticalCount * 95 + highCount * 95 + mediumCount * 85 + lowCount * 70) / 
    (totalVulns * 100)
  ) * 100
  
  return Math.round(accuracy * 100) / 100 // 2 decimal places
}

/**
 * Deduplicate vulnerabilities by (file + line + type)
 * Removes exact duplicates caused by multiple detection passes (regex, AST, taint)
 */
function deduplicateVulnerabilities(vulnerabilities: VulnerabilityEnriched[]): VulnerabilityEnriched[] {
  const seen = new Map<string, VulnerabilityEnriched>()
  const deduped: VulnerabilityEnriched[] = []
  
  vulnerabilities.forEach((vuln, index) => {
    // Create unique key based on file + line + type
    const key = `${vuln.file}:${vuln.line}:${vuln.type}`
    
    if (!seen.has(key)) {
      // First occurrence - keep it
      seen.set(key, vuln)
      deduped.push(vuln)
    } else {
      // Duplicate found - log it but skip
      console.log(
        `[DEDUP] Removed duplicate: ${vuln.type} at ${vuln.file}:${vuln.line} ` +
        `(kept index ${deduped.length - 1}, skipped index ${index})`
      )
    }
  })
  
  if (deduped.length < vulnerabilities.length) {
    const removedCount = vulnerabilities.length - deduped.length
    console.log(`[DEDUP] Removed ${removedCount} duplicate(s) from ${vulnerabilities.length} total vulnerabilities`)
  }
  
  return deduped
}

/**
 * Main enrichment function - Transform raw scan result
 */
export function enrichScanResult(rawScanResult: any): EnrichedScanResponse {
  const vulnerabilities = rawScanResult.vulnerabilities || rawScanResult.data || []
  
  // Enrich each vulnerability
  const enrichedVulnerabilities = vulnerabilities.map((vuln: any, index: number) =>
    enrichVulnerability(vuln, index)
  )
  
  // Remove duplicates based on file + line + type
  const deduplicatedVulnerabilities = deduplicateVulnerabilities(enrichedVulnerabilities)
  
  // Count by severity
  const criticalCount = deduplicatedVulnerabilities.filter((v: VulnerabilityEnriched) => v.severity === "CRITICAL").length
  const highCount = deduplicatedVulnerabilities.filter((v: VulnerabilityEnriched) => v.severity === "HIGH").length
  const mediumCount = deduplicatedVulnerabilities.filter((v: VulnerabilityEnriched) => v.severity === "MEDIUM").length
  const lowCount = deduplicatedVulnerabilities.filter((v: VulnerabilityEnriched) => v.severity === "LOW").length
  
  // Count by type
  const xssCount = deduplicatedVulnerabilities.filter((v: VulnerabilityEnriched) => v.type === "XSS").length
  const sqliCount = deduplicatedVulnerabilities.filter((v: VulnerabilityEnriched) => v.type === "SQLInjection").length
  
  // Calculate metrics
  const healthScore = calculateHealthScore(criticalCount, highCount, mediumCount, lowCount)
  const securityStatus = determineSecurityStatus(criticalCount, highCount, mediumCount, lowCount, deduplicatedVulnerabilities.length)
  const criticalAlerts = calculateCriticalAlerts(criticalCount, highCount)
  const detectionAccuracy = calculateDetectionAccuracy(criticalCount, highCount, mediumCount, lowCount)
  
  return {
    success: true,
    summary: {
      totalVulnerabilities: deduplicatedVulnerabilities.length,
      vulnerabilitiesByType: {
        XSS: xssCount,
        SQLInjection: sqliCount,
      },
      vulnerabilitiesBySeverity: {
        CRITICAL: criticalCount,
        HIGH: highCount,
        MEDIUM: mediumCount,
        LOW: lowCount,
      },
      healthScore,
      securityStatus,
      criticalAlerts,
    },
    vulnerabilities: deduplicatedVulnerabilities,
    metadata: {
      scanDate: new Date().toISOString(),
      detectionAccuracy,
      severityWeighting: {
        CRITICAL: 25,
        HIGH: 15,
        MEDIUM: 8,
        LOW: 2,
      },
    },
  }
}

/**
 * Format vulnerability untuk database storage
 */
export function formatVulnerabilityForDB(vuln: VulnerabilityEnriched, scanResultId: string) {
  return {
    scanResultId,
    ruleId: vuln.ruleId || "UNKNOWN",
    ruleName: vuln.remediationGuide?.ruleName || `${vuln.type} Vulnerability`,
    vulnerabilityType: vuln.type,
    severity: vuln.severity,
    confidence: vuln.confidence || 0.8,
    filePath: vuln.file,
    lineNumber: vuln.line,
    codeSnippet: vuln.code,
    description: vuln.description,
    cweid: vuln.cwe,
    owaspid: vuln.owasp,
    recommendation: vuln.remediationGuide?.stepByStepFix?.[0] || vuln.quickFix || "See remediation guide",
    vulnerableExample: vuln.remediationGuide?.beforeCode || vuln.codeExample?.vulnerable || "",
    secureExample: vuln.remediationGuide?.afterCode || vuln.codeExample?.safe || "",
    remediationSteps: vuln.remediationGuide?.stepByStepFix ? JSON.stringify(vuln.remediationGuide.stepByStepFix) : JSON.stringify([]),
  }
}
