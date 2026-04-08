/**
 * HYBRID SAST SCANNER ORCHESTRATOR
 * Sesuai dengan Bab 2.6 Skripsi: Mesin Inti Sistem Deteksi
 * 3-Layer Approach: Regex Lexical → AST Parsing → Taint Analysis
 */

import path from "path";
import { scanDirectoryLexical } from "./scanner/lexical";
import { analyzeDirectoryTaint } from "./scanner/taintAnalyzer";
import { TAINT_RULES } from "./scanner/rules";

export interface ScanSummary {
  totalVulnerabilities: number;
  vulnerabilitiesBySeverity: {
    Kritis: number;
    Tinggi: number;
    Sedang: number;
    Rendah: number;
  };
  vulnerabilitiesByType: {
    SQLInjection: number;
    XSS: number;
  };
}

export interface ScanResult {
  success: boolean;
  summary: ScanSummary;
  vulnerabilities: Array<{
    id: string;
    type: "SQLInjection" | "XSS";
    severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah";
    file: string;
    line: number;
    code: string;
    description: string;
    remediation: string;
    taintPath: string[];
    codeExample: {
      vulnerable: string;
      safe: string;
    };
    riskScore?: number;
    confidence?: number;
    exploitability?: number;
    codeContext?: {
      before: string[];
      target: string;
      after: string[];
    };
    owasp?: string;
    cwe?: string;
  }>;
  layerResults: {
    layer1_lexical: number;
    layer2_ast: number;
    layer3_taint: number;
  };
}

/**
 * HYBRID SAST Scanner - 3 Layer Architecture
 * Layer 1: Regex-based Lexical Analysis (Quick pre-screening)
 * Layer 2: AST Parser (Structure analysis)
 * Layer 3: Taint Analysis (Deep data flow tracking)
 */
export const runHybridSAST = async (targetPath: string): Promise<ScanResult> => {
  try {
    console.log(`[SAST] Starting Hybrid SAST scan on: ${targetPath}`);
    
    // LAYER 1: Lexical Analysis (Regex preprocessing)
    console.log("[LAYER-1] Running Regex Lexical Scanner...");
    const lexicalMatches = scanDirectoryLexical(targetPath);
    const layer1Count = Array.from(lexicalMatches.values()).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`[LAYER-1] Found ${layer1Count} potential vulnerabilities via regex`);

    // LAYER 2 & 3: AST Parsing + Taint Analysis (Deep analysis pada files yang flagged di layer 1)
    console.log("[LAYER-3] Running Taint Analysis Engine...");
    const taintVulnerabilities = analyzeDirectoryTaint(targetPath);
    console.log(`[LAYER-3] Found ${taintVulnerabilities.length} confirmed vulnerabilities via taint analysis`);

    // Aggregate results dari taint analysis
    const summary: ScanSummary = {
      totalVulnerabilities: taintVulnerabilities.length,
      vulnerabilitiesBySeverity: {
        Kritis: 0,
        Tinggi: 0,
        Sedang: 0,
        Rendah: 0,
      },
      vulnerabilitiesByType: {
        SQLInjection: 0,
        XSS: 0,
      },
    };

    // Count by severity dan type
    taintVulnerabilities.forEach((vuln) => {
      summary.vulnerabilitiesBySeverity[vuln.severity]++;
      summary.vulnerabilitiesByType[vuln.type]++;
    });

    const result: ScanResult = {
      success: true,
      summary,
      vulnerabilities: taintVulnerabilities.map((v) => ({
        id: v.id,
        type: v.type,
        severity: v.severity,
        file: v.file,
        line: v.line,
        code: v.code,
        description: v.description,
        remediation: v.remediation,
        taintPath: v.taintPath,
        codeExample: v.codeExample,
        riskScore: v.riskScore,
        confidence: v.confidence,
        exploitability: v.exploitability,
        codeContext: v.codeContext,
        owasp: v.owasp,
        cwe: v.cwe,
      })),
      layerResults: {
        layer1_lexical: layer1Count,
        layer2_ast: 0, // Combined dengan layer 3
        layer3_taint: taintVulnerabilities.length,
      },
    };

    return result;
  } catch (error) {
    console.error("[SAST] Error during hybrid SAST scan:", error);
    throw error;
  }
};

/**
 * Wrapper dengan fallback - returns structured result even if error occurs
 */
export const runScannerWithFallback = async (
  targetPath: string
): Promise<Record<string, unknown>> => {
  try {
    const result = await runHybridSAST(targetPath);
    return result as unknown as Record<string, unknown>;
  } catch (error) {
    console.error("[SCANNER] Hybrid SAST failed, returning error result:", error);
    return {
      success: false,
      error: String(error),
      summary: {
        totalVulnerabilities: 0,
        vulnerabilitiesBySeverity: {
          Kritis: 0,
          Tinggi: 0,
          Sedang: 0,
          Rendah: 0,
        },
        vulnerabilitiesByType: {
          SQLInjection: 0,
          XSS: 0,
        },
      },
      vulnerabilities: [],
      layerResults: {
        layer1_lexical: 0,
        layer2_ast: 0,
        layer3_taint: 0,
      },
    };
  }
};
