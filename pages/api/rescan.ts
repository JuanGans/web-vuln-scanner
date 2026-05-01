import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";
import path from "path";
import fs from "fs";
import { extractZip, cleanupFolder } from "@/lib/extract";
import { runSecureCLIScan } from "@/lib/scannerCLI";
import { enrichScanResult } from "@/lib/apiEnricher";

type VulnerabilityItem = {
  id: string;
  type: string;
  severity: string;
  file: string;
  line: number;
  code: string;
  description: string;
  ruleId?: string;
  cwe?: string;
};

type ComparisonResult = {
  fixed: VulnerabilityItem[];
  remaining: VulnerabilityItem[];
  newFound: VulnerabilityItem[];
};

function isSameVulnerability(a: VulnerabilityItem, b: VulnerabilityItem): boolean {
  const sameType = a.type === b.type;
  const nearbyLine = Math.abs(a.line - b.line) <= 2;
  const sameCWE = !!a.cwe && !!b.cwe && a.cwe === b.cwe;

  return sameType && (nearbyLine || sameCWE);
}

function compareScans(
  originalVulns: VulnerabilityItem[],
  newVulns: VulnerabilityItem[]
): ComparisonResult {
  const fixed: VulnerabilityItem[] = [];
  const remaining: VulnerabilityItem[] = [];
  const newFound: VulnerabilityItem[] = [];

  for (const orig of originalVulns) {
    const stillExists = newVulns.some((nv) => isSameVulnerability(orig, nv));
    if (stillExists) {
      remaining.push(orig);
    } else {
      fixed.push(orig);
    }
  }

  for (const nv of newVulns) {
    const existedBefore = originalVulns.some((orig) => isSameVulnerability(orig, nv));
    if (!existedBefore) {
      newFound.push(nv);
    }
  }

  return { fixed, remaining, newFound };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const extractPath = path.join(process.cwd(), "uploads", "extracted");

  try {
    const { originalScanId, filePath, fileName, fileType } = req.body;

    if (!originalScanId) {
      return res.status(400).json({ error: "originalScanId diperlukan" });
    }
    if (!filePath) {
      return res.status(400).json({ error: "filePath diperlukan" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    const originalScan = await prisma.scanResult.findUnique({
      where: { id: originalScanId },
    });

    if (!originalScan) {
      return res.status(404).json({ error: "Scan original tidak ditemukan" });
    }

    let scanDirPath = extractPath;

    if (fileType === "zip") {
      extractZip(filePath, extractPath);
      scanDirPath = extractPath;
    } else if (fileType === "php" || fileType === "js") {
      const tempScanDir = path.join(extractPath, `rescan_${Date.now()}`);
      if (!fs.existsSync(tempScanDir)) {
        fs.mkdirSync(tempScanDir, { recursive: true });
      }
      const destPath = path.join(tempScanDir, path.basename(filePath));
      fs.copyFileSync(filePath, destPath);
      scanDirPath = tempScanDir;
    } else {
      return res.status(400).json({ error: "Tipe file tidak didukung" });
    }

    console.log(`[RESCAN] Running new scan on: ${scanDirPath}`);
    const rawScanResult = await runSecureCLIScan(scanDirPath);
    const enrichedResult = enrichScanResult(rawScanResult);

    const originalResult = originalScan.result as any;
    const originalVulns: VulnerabilityItem[] = originalResult?.vulnerabilities || [];
    const newVulns: VulnerabilityItem[] = enrichedResult.vulnerabilities || [];

    const comparison = compareScans(originalVulns, newVulns);

    const originalTotal = originalVulns.length;
    const newTotal = newVulns.length;
    const fixedCount = comparison.fixed.length;
    const percentageFixed = originalTotal > 0 ? Math.round((fixedCount / originalTotal) * 100) : 0;

    const rescanDbResult = await prisma.scanResult.create({
      data: {
        fileName: fileName || path.basename(filePath),
        ...(originalScan.projectId && {
          project: { connect: { id: originalScan.projectId } },
        }),
        result: {
          ...enrichedResult,
          isRescan: true,
          originalScanId,
          comparison,
          scoreImprovement: {
            before: originalTotal,
            after: newTotal,
            fixed: fixedCount,
            newFound: comparison.newFound.length,
            percentageFixed,
          },
        } as any,
        totalVulnerabilities: enrichedResult.summary.totalVulnerabilities,
        criticalCount: enrichedResult.summary.vulnerabilitiesBySeverity.CRITICAL,
        highCount: enrichedResult.summary.vulnerabilitiesBySeverity.HIGH,
        mediumCount: enrichedResult.summary.vulnerabilitiesBySeverity.MEDIUM,
        lowCount: enrichedResult.summary.vulnerabilitiesBySeverity.LOW,
        healthScore: enrichedResult.summary.healthScore,
        securityStatus: enrichedResult.summary.securityStatus,
      },
    });

    console.log(
      `[RESCAN] Complete — Fixed: ${fixedCount}, Remaining: ${comparison.remaining.length}, New: ${comparison.newFound.length}`
    );

    setTimeout(() => {
      cleanupFolder(extractPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 1000);

    return res.status(200).json({
      success: true,
      data: {
        rescanId: rescanDbResult.id,
        originalScanId,
        newScan: enrichedResult,
        comparison,
        scoreImprovement: {
          before: originalTotal,
          after: newTotal,
          fixed: fixedCount,
          newFound: comparison.newFound.length,
          percentageFixed,
        },
      },
    });
  } catch (error) {
    console.error("[RESCAN] Error:", error);
    return res.status(500).json({
      error: "Rescan gagal: " + String(error),
    });
  }
}