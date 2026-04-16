/**
 * Database Helper for Vulnerability Retrieval
 * Provide utilities untuk query dan format vulnerability data dari DB
 */

import prisma from "@/lib/db"

/**
 * Get enriched scan result dengan vulnerability details
 */
export async function getEnrichedScanResult(scanId: string) {
  try {
    const scanResult = await prisma.scanResult.findUnique({
      where: { id: scanId },
      include: {
        vulnerabilities: true,
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })

    if (!scanResult) {
      return null
    }

    // Parse remediationSteps dari JSON string
    const enrichedVulnerabilities = scanResult.vulnerabilities.map((vuln: any) => ({
      ...vuln,
      remediationSteps: vuln.remediationSteps ? JSON.parse(vuln.remediationSteps) : [],
    }))

    return {
      ...scanResult,
      vulnerabilities: enrichedVulnerabilities,
    }
  } catch (error) {
    console.error("Error fetching enriched scan result:", error)
    throw error
  }
}

/**
 * Get scan history with metrics
 */
export async function getScanHistory(projectId?: string, limit: number = 50) {
  try {
    const where = projectId ? { projectId } : {}

    const scans = await prisma.scanResult.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return scans
  } catch (error) {
    console.error("Error fetching scan history:", error)
    throw error
  }
}

/**
 * Get trend data for a project (last N scans)
 */
export async function getProjectTrendData(projectId: string, limit: number = 10) {
  try {
    const scans = await prisma.scanResult.findMany({
      where: { projectId },
      select: {
        id: true,
        createdAt: true,
        healthScore: true,
        securityStatus: true,
        totalVulnerabilities: true,
        criticalCount: true,
        highCount: true,
        mediumCount: true,
        lowCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Reverse untuk chronological order (oldest first)
    return scans.reverse().map((scan: any) => ({
      date: scan.createdAt.toISOString().split("T")[0],
      score: scan.healthScore,
      vulnerabilities: scan.totalVulnerabilities,
      status: scan.securityStatus as "SECURE" | "ATTENTION" | "AT_RISK" | "STABLE",
      severity: {
        critical: scan.criticalCount,
        high: scan.highCount,
        medium: scan.mediumCount,
        low: scan.lowCount,
      },
    }))
  } catch (error) {
    console.error("Error fetching trend data:", error)
    throw error
  }
}

/**
 * Get vulnerability statistics for project
 */
export async function getProjectVulnerabilityStats(projectId: string) {
  try {
    const scans = await prisma.scanResult.findMany({
      where: { projectId },
      select: {
        criticalCount: true,
        highCount: true,
        mediumCount: true,
        lowCount: true,
        healthScore: true,
        securityStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    })

    if (scans.length === 0) {
      return null
    }

    const latestScan = scans[0]

    return {
      severity: {
        critical: latestScan.criticalCount,
        high: latestScan.highCount,
        medium: latestScan.mediumCount,
        low: latestScan.lowCount,
        total: latestScan.criticalCount + latestScan.highCount + latestScan.mediumCount + latestScan.lowCount,
      },
      health: {
        score: latestScan.healthScore,
        status: latestScan.securityStatus,
      },
      lastScan: latestScan.createdAt,
    }
  } catch (error) {
    console.error("Error fetching vulnerability stats:", error)
    throw error
  }
}

/**
 * Get top vulnerabilities across all scans (recent)
 */
export async function getTopVulnerabilities(projectId: string, limit: number = 10) {
  try {
    const vulnerabilities = await prisma.vulnerability.findMany({
      where: {
        scanResult: {
          projectId,
        },
      },
      select: {
        ruleId: true,
        ruleName: true,
        vulnerabilityType: true,
        severity: true,
        filePath: true,
        description: true,
      },
      orderBy: {
        id: "desc", // Most recent first
      },
      take: limit,
    })

    return vulnerabilities
  } catch (error) {
    console.error("Error fetching top vulnerabilities:", error)
    throw error
  }
}

/**
 * Calculate trend improvement between two scans
 */
export async function calculateScanTrend(scanId1: string, scanId2: string) {
  try {
    const scan1 = await prisma.scanResult.findUnique({
      where: { id: scanId1 },
      select: { healthScore: true, createdAt: true },
    })

    const scan2 = await prisma.scanResult.findUnique({
      where: { id: scanId2 },
      select: { healthScore: true, createdAt: true },
    })

    if (!scan1 || !scan2) {
      return null
    }

    const scoreChange = scan1.healthScore - scan2.healthScore
    const percentChange = scan2.healthScore !== 0 ? ((scoreChange / scan2.healthScore) * 100).toFixed(2) : "0"
    const trend = scoreChange > 0 ? "improved" : scoreChange < 0 ? "worsened" : "stable"

    return {
      scan1Id: scanId1,
      scan2Id: scanId2,
      scan1Score: scan1.healthScore,
      scan2Score: scan2.healthScore,
      scoreChange,
      percentChange: parseFloat(percentChange),
      trend,
      timeDiff: Math.floor((scan1.createdAt.getTime() - scan2.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    }
  } catch (error) {
    console.error("Error calculating trend:", error)
    throw error
  }
}

/**
 * Query vulnerabilities by severity and type
 */
export async function getVulnerabilitiesBySeverity(
  projectId: string,
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
) {
  try {
    const vulnerabilities = await prisma.vulnerability.findMany({
      where: {
        severity,
        scanResult: {
          projectId,
        },
      },
      select: {
        id: true,
        ruleId: true,
        ruleName: true,
        vulnerabilityType: true,
        filePath: true,
        lineNumber: true,
        description: true,
        recommendation: true,
        codeSnippet: true,
        scanResult: {
          select: {
            createdAt: true,
          },
        },
      },
      orderBy: {
        scanResult: {
          createdAt: "desc",
        },
      },
    })

    return vulnerabilities
  } catch (error) {
    console.error("Error fetching vulnerabilities by severity:", error)
    throw error
  }
}
