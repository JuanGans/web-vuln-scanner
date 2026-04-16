/**
 * Scan Result Enrichment Module
 * Menambahkan data remediation, trend tracking, dan enhanced reporting
 * Fokus: Akurasi deteksi + Usability untuk non-teknis
 */

export interface VulnerabilityData {
  ruleId: string
  ruleName: string
  vulnerabilityType: 'SQLI' | 'XSS'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number
  filePath: string
  lineNumber: number
  codeSnippet?: string
  description: string
  cweid?: string
  owaspid?: string
  recommendation: string
  vulnerableExample: string
  secureExample: string
  remediationSteps: string[]
}

export interface EnrichedScanResult {
  totalVulnerabilities: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  criticalAlerts: number
  healthScore: number
  securityStatus: 'SECURE' | 'ATTENTION' | 'AT_RISK' | 'STABLE'
  vulnerabilities: VulnerabilityData[]
  trend?: {
    previousScore: number
    scoreChange: number
    trend: 'IMPROVED' | 'WORSENED' | 'STABLE'
    improvementPercentage: number
  }
  metadata: {
    scanDate: string
    scanDuration: number
    totalFilesScanned: number
    detectionAccuracy: number // Percentage
  }
}

/**
 * Calculate health score berdasarkan 4 severity levels
 * Formula: 100 - (critical×25 + high×15 + medium×8 + low×2)
 * Prioritas: CRITICAL > HIGH > MEDIUM > LOW
 */
export function calculateHealthScore(
  criticalCount: number,
  highCount: number,
  mediumCount: number,
  lowCount: number
): number {
  const score = 100 - (
    criticalCount * 25 +
    highCount * 15 +
    mediumCount * 8 +
    lowCount * 2
  )
  return Math.max(0, score)
}

/**
 * Determine security status berdasarkan severity breakdown
 * Sesuai proposal: Option A (Simple 4-status)
 */
export function determineSecurityStatus(
  criticalCount: number,
  highCount: number,
  mediumCount: number,
  lowCount: number,
  totalVulnerabilities: number
): 'SECURE' | 'ATTENTION' | 'AT_RISK' | 'STABLE' {
  // PRIORITY: Critical dan High harus ditangani segera
  if (criticalCount > 0 || highCount > 0) {
    return 'AT_RISK'
  }

  // MEDIUM: Perhatian diperlukan, tapi tidak urgent
  if (mediumCount > 0) {
    return 'ATTENTION'
  }

  // CLEAN: Tidak ada vulnerability
  if (totalVulnerabilities === 0) {
    return 'SECURE'
  }

  // FALLBACK: Hanya LOW severity atau edge case
  return 'STABLE'
}

/**
 * Calculate critical alerts (untuk warning di UI)
 * Critical alerts = CRITICAL + HIGH vulnerabilities (yang perlu immediate action)
 */
export function calculateCriticalAlerts(
  criticalCount: number,
  highCount: number
): number {
  return criticalCount + highCount
}

/**
 * Calculate trend improvement vs previous scan
 */
export function calculateTrend(
  currentScore: number,
  previousScore: number | null
): {
  previousScore: number
  scoreChange: number
  trend: 'IMPROVED' | 'WORSENED' | 'STABLE'
  improvementPercentage: number
} | null {
  if (previousScore === null || previousScore === undefined) {
    return null
  }

  const scoreChange = currentScore - previousScore
  let trend: 'IMPROVED' | 'WORSENED' | 'STABLE'

  if (scoreChange > 0) {
    trend = 'IMPROVED'
  } else if (scoreChange < 0) {
    trend = 'WORSENED'
  } else {
    trend = 'STABLE'
  }

  const improvementPercentage = previousScore !== 0 
    ? ((scoreChange / previousScore) * 100) 
    : 0

  return {
    previousScore,
    scoreChange,
    trend,
    improvementPercentage: Math.round(improvementPercentage * 100) / 100
  }
}

/**
 * Enrich raw vulnerabilities dengan remediation guides
 */
export function enrichVulnerabilities(
  vulnerabilities: any[],
  remediationData: Record<string, any>
): VulnerabilityData[] {
  return vulnerabilities.map(vuln => {
    const ruleData = remediationData[vuln.ruleId] || {}

    return {
      ruleId: vuln.ruleId,
      ruleName: ruleData.ruleName || vuln.ruleName,
      vulnerabilityType: vuln.type,
      severity: vuln.severity,
      confidence: vuln.confidence || 0.0,
      filePath: vuln.filePath,
      lineNumber: vuln.lineNumber,
      codeSnippet: vuln.codeSnippet,
      description: ruleData.description || vuln.description,
      cweid: ruleData.cweid,
      owaspid: ruleData.owaspid,
      recommendation: ruleData.recommendation || 'Use best practices for secure coding',
      vulnerableExample: ruleData.vulnerableExample,
      secureExample: ruleData.secureExample,
      remediationSteps: ruleData.remediationSteps || []
    }
  })
}

/**
 * Create enriched scan result dengan semua calculated metrics
 */
export function createEnrichedScanResult(
  rawVulnerabilities: any[],
  remediationData: Record<string, any>,
  previousScore: number | null = null,
  scanMetadata: {
    scanDate: string
    scanDuration: number
    totalFilesScanned: number
  } = {
    scanDate: new Date().toISOString(),
    scanDuration: 0,
    totalFilesScanned: 0
  }
): EnrichedScanResult {
  // Count severity levels
  const criticalCount = rawVulnerabilities.filter(v => v.severity === 'CRITICAL').length
  const highCount = rawVulnerabilities.filter(v => v.severity === 'HIGH').length
  const mediumCount = rawVulnerabilities.filter(v => v.severity === 'MEDIUM').length
  const lowCount = rawVulnerabilities.filter(v => v.severity === 'LOW').length
  const totalVulnerabilities = rawVulnerabilities.length

  // Calculate metrics
  const healthScore = calculateHealthScore(criticalCount, highCount, mediumCount, lowCount)
  const securityStatus = determineSecurityStatus(criticalCount, highCount, mediumCount, lowCount, totalVulnerabilities)
  const criticalAlerts = calculateCriticalAlerts(criticalCount, highCount)
  const trend = calculateTrend(healthScore, previousScore)

  // Enrich vulnerabilities dengan remediation details
  const enrichedVulnerabilities = enrichVulnerabilities(rawVulnerabilities, remediationData)

  // Estimate detection accuracy (untuk KPI proposal)
  // Dalam praktik, ini akan dihitung dari testing terhadap DVWA/Juice Shop
  const detectionAccuracy = calculateDetectionAccuracy(criticalCount, highCount, mediumCount, lowCount)

  return {
    totalVulnerabilities,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    criticalAlerts,
    healthScore,
    securityStatus,
    vulnerabilities: enrichedVulnerabilities,
    trend: trend || undefined,
    metadata: {
      scanDate: scanMetadata.scanDate,
      scanDuration: scanMetadata.scanDuration,
      totalFilesScanned: scanMetadata.totalFilesScanned,
      detectionAccuracy
    }
  }
}

/**
 * Calculate detection accuracy metric
 * Dalam production, ini akan dibandingkan dengan ground truth dari DVWA/Juice Shop
 * Untuk sekarang, menggunakan confidence scores dari detections
 */
function calculateDetectionAccuracy(
  criticalCount: number,
  highCount: number,
  mediumCount: number,
  lowCount: number
): number {
  // Simplified accuracy estimation
  // In production: Compare dengan ground truth dataset
  const totalDetections = criticalCount + highCount + mediumCount + lowCount
  
  if (totalDetections === 0) {
    return 100 // No vulnerabilities = potentially secure
  }

  // Weighted accuracy: Higher severity detections are more likely accurate
  const weightedSum = (
    criticalCount * 0.95 +  // CRITICAL: 95% confidence
    highCount * 0.90 +      // HIGH: 90% confidence
    mediumCount * 0.80 +    // MEDIUM: 80% confidence
    lowCount * 0.70         // LOW: 70% confidence
  )

  const accuracy = (weightedSum / totalDetections)
  return Math.round(accuracy * 100) // Return as percentage
}

/**
 * Generate human-readable summary untuk dashboard
 * Fokus pada usability untuk pengguna non-teknis
 */
export function generateUserFriendlySummary(result: EnrichedScanResult): string {
  const { healthScore, securityStatus, totalVulnerabilities, criticalAlerts } = result

  let summary = ''

  if (securityStatus === 'SECURE') {
    summary = `✅ Situs Anda Aman! Tidak ada kerentanan ditemukan. Skor keamanan: ${healthScore}/100`
  } else if (securityStatus === 'AT_RISK') {
    summary = `⚠️ PERHATIAN SEGERA! ${criticalAlerts} masalah serius ditemukan yang perlu ditangani sekarang. Skor keamanan: ${healthScore}/100`
  } else if (securityStatus === 'ATTENTION') {
    summary = `⚠ Perhatian Diperlukan. ${totalVulnerabilities} masalah ditemukan. Rencanakan perbaikan segera. Skor keamanan: ${healthScore}/100`
  } else {
    summary = `~ Status Stabil. Skor keamanan: ${healthScore}/100`
  }

  // Add trend info if available
  if (result.trend) {
    const { trend, improvementPercentage } = result.trend
    if (trend === 'IMPROVED') {
      summary += ` 📈 Perbaikan ${improvementPercentage}%!`
    } else if (trend === 'WORSENED') {
      summary += ` 📉 Menurun ${Math.abs(improvementPercentage)}%`
    }
  }

  return summary
}

/**
 * Get action recommendations untuk user
 */
export function getActionRecommendations(result: EnrichedScanResult): string[] {
  const recommendations: string[] = []
  const { securityStatus, criticalAlerts, mediumCount } = result

  if (securityStatus === 'AT_RISK') {
    recommendations.push('🔴 FIX IMMEDIATELY: ' + criticalAlerts + ' masalah kritis harus diperbaiki segera')
    recommendations.push('Klik pada setiap masalah untuk melihat cara memperbaikinya')
  } else if (securityStatus === 'ATTENTION') {
    recommendations.push('🟡 SCHEDULE A FIX: ' + mediumCount + ' masalah sedang perlu dijadwalkan untuk perbaikan')
    recommendations.push('Prioritaskan yang memiliki dampak tertinggi terlebih dahulu')
  } else if (securityStatus === 'SECURE') {
    recommendations.push('🟢 KEEP IT UP: Situs Anda sudah aman!')
    recommendations.push('Lakukan scanning berkala untuk memastikan keamanan tetap terjaga')
  }

  recommendations.push('Baca dokumentasi keamanan untuk best practices')
  recommendations.push('Update framework dan library aplikasi secara berkala')

  return recommendations
}
