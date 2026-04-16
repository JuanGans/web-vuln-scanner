/**
 * Scanner CLI Wrapper
 * Memanggil /scanner/securecli/bin/securecli.js dan parse hasilnya
 * Ini adalah bridge antara web API dan production-grade scanner engine
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export interface ScanResult {
  success: boolean;
  summary: {
    totalVulnerabilities: number;
    vulnerabilitiesByType: {
      SQLInjection: number;
      XSS: number;
    };
    vulnerabilitiesBySeverity: {
      Kritis: number;
      Tinggi: number;
      Sedang: number;
      Rendah: number;
    };
  };
  vulnerabilities: Array<{
    id: string;
    type: "SQLInjection" | "XSS";
    severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah";
    file: string;
    line: number;
    code: string;
    description: string;
    remediation: string;
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
    taintPath?: string[];
    codeExample?: {
      vulnerable: string;
      safe: string;
    };
  }>;
  layerResults: {
    layer1_lexical: number;
    layer2_ast: number;
    layer3_taint: number;
  };
}

/**
 * Panggil SecureCLI scanner dan parse JSON output
 * @param targetPath - Direktori atau file yang akan discan
 * @returns Scan result dalam format JSON
 */
export const runSecureCLIScan = async (targetPath: string): Promise<ScanResult> => {
  try {
    // Validasi path
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Path tidak ditemukan: ${targetPath}`);
    }

    // Resolve path ke SecureCLI
    const projectRoot = process.cwd();
    const cliPath = path.join(projectRoot, "scanner", "securecli", "bin", "securecli.js");

    if (!fs.existsSync(cliPath)) {
      throw new Error(`SecureCLI tidak ditemukan di: ${cliPath}`);
    }

    console.log(`[SCANNER-CLI] Running scan on: ${targetPath}`);
    console.log(`[SCANNER-CLI] Using CLI: ${cliPath}`);

    // Execute CLI dengan --format json untuk output JSON
    // SecureCLI akan output hasil scan dalam format JSON
    const command = `node "${cliPath}" "${targetPath}" --format json`;
    
    console.log(`[SCANNER-CLI] Command: ${command}`);

    let jsonOutput = "";
    try {
      const output = execSync(command, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 60000, // 60 second timeout
      });

      // SecureCLI output format:
      // [LOG MESSAGES...]
      // [
      //   { vulnerability1 },
      //   { vulnerability2 },
      //   ...
      // ]
      // Extract JSON array yang dimulai dengan [
      const jsonMatch = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        jsonOutput = jsonMatch[0];
      } else {
        jsonOutput = output;
      }
    } catch (error: any) {
      // execSync throws jika exit code !== 0, tapi output masih bisa ter-capture  
      const output = error.stdout?.toString() || error.message;
      const jsonMatch = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        jsonOutput = jsonMatch[0];
      } else {
        // Jika tidak ada JSON output, construct default error response
        return {
          success: false,
          summary: {
            totalVulnerabilities: 0,
            vulnerabilitiesByType: { SQLInjection: 0, XSS: 0 },
            vulnerabilitiesBySeverity: { Kritis: 0, Tinggi: 0, Sedang: 0, Rendah: 0 },
          },
          vulnerabilities: [],
          layerResults: { layer1_lexical: 0, layer2_ast: 0, layer3_taint: 0 },
        };
      }
    }

    // Parse JSON array
    const vulnerabilitiesArray = JSON.parse(jsonOutput) as any[];

    // Convert SecureCLI format → web interface format
    const vulnerabilities = vulnerabilitiesArray.map((vuln: any) => {
      // Map type: SQLI_* → SQLInjection, XSS_* → XSS
      let type: "SQLInjection" | "XSS" = "XSS";
      if (vuln.type.startsWith("SQLI")) {
        type = "SQLInjection";
      }

      // Map severity: CRITICAL → Kritis, HIGH → Tinggi, etc
      let severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah" = "Tinggi";
      if (vuln.severity === "CRITICAL") severity = "Kritis";
      else if (vuln.severity === "HIGH") severity = "Tinggi";
      else if (vuln.severity === "MEDIUM") severity = "Sedang";
      else if (vuln.severity === "LOW") severity = "Rendah";

      return {
        id: vuln.type.toLowerCase(),
        type,
        severity,
        file: vuln.file || "unknown",
        line: vuln.line || 0,
        code: vuln.originalCode?.trim() || "",
        description: vuln.explanation || vuln.vulnerability || "",
        remediation:
          vuln.remediation?.description || vuln.remediation?.recommendations?.[0] || "",
        riskScore: vuln.riskScore || 8,
        confidence: Math.round((vuln.confidence || 0.8) * 100),
        exploitability: vuln.exploitability || 8,
        codeContext: vuln.codeContext
          ? {
              before: vuln.codeContext.before || [],
              target: vuln.codeContext.code || "",
              after: vuln.codeContext.after || [],
            }
          : undefined,
        owasp: vuln.owasp?.category || "",
        cwe: vuln.owasp?.cwe || "CWE-1035",
        taintPath: ["Source", "→", "Sink"],
        codeExample: {
          vulnerable: vuln.remediation?.fixSnippet
            ? `// ❌ Vulnerable code\n${vuln.originalCode}`
            : "",
          safe: vuln.remediation?.fixSnippet || "",
        },
      };
    });

    // Count by type dan severity
    const summary = {
      totalVulnerabilities: vulnerabilities.length,
      vulnerabilitiesByType: {
        SQLInjection: vulnerabilities.filter((v) => v.type === "SQLInjection").length,
        XSS: vulnerabilities.filter((v) => v.type === "XSS").length,
      },
      vulnerabilitiesBySeverity: {
        Kritis: vulnerabilities.filter((v) => v.severity === "Kritis").length,
        Tinggi: vulnerabilities.filter((v) => v.severity === "Tinggi").length,
        Sedang: vulnerabilities.filter((v) => v.severity === "Sedang").length,
        Rendah: vulnerabilities.filter((v) => v.severity === "Rendah").length,
      },
    };

    console.log(
      `[SCANNER-CLI] Scan complete: ${summary.totalVulnerabilities} vulnerabilities found`
    );

    // Normalize output format
    const normalizedResult: ScanResult = {
      success: true,
      summary,
      vulnerabilities,
      layerResults: {
        layer1_lexical: vulnerabilitiesArray.length,
        layer2_ast: 0,
        layer3_taint: vulnerabilitiesArray.length,
      },
    };

    return normalizedResult;
  } catch (error) {
    console.error("[SCANNER-CLI] Error:", error);
    return {
      success: false,
      summary: {
        totalVulnerabilities: 0,
        vulnerabilitiesByType: { SQLInjection: 0, XSS: 0 },
        vulnerabilitiesBySeverity: { Kritis: 0, Tinggi: 0, Sedang: 0, Rendah: 0 },
      },
      vulnerabilities: [],
      layerResults: { layer1_lexical: 0, layer2_ast: 0, layer3_taint: 0 },
    };
  }
};
