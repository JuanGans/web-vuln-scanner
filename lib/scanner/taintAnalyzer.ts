/**
 * LAYER 3: Taint Analysis Engine
 * Core detection logic yang melacak data flow dari source ke sink
 * Sesuai Bab 2.6.3 Skripsi: Rule-Based Static Taint Analysis Engine
 */

import fs from "fs";
import path from "path";
import { TAINT_RULES, findRuleForSink, hasSanitizer } from "./rules";
import { analyzePHPSourceCode, analyzeJavaScriptSourceCode } from "./astParser";

export interface Vulnerability {
  id: string;
  type: "SQLInjection" | "XSS";
  severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah";
  file: string;
  line: number;
  column?: number;
  code: string;
  description: string;
  remediation: string;
  taintPath: string[];
  codeExample: {
    vulnerable: string;
    safe: string;
  };
  // NEW: Enhanced fields
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
}

/**
 * Calculate risk score based on vulnerability type and context
 */
const calculateRiskScore = (type: "SQLInjection" | "XSS", code: string): number => {
  let score = 0;
  
  if (type === "SQLInjection") {
    score = 8; // Base score untuk SQLi
    if (code.includes("DROP") || code.includes("DELETE")) score = 10;
    if (code.includes("prepared") || code.includes("parameterized")) score = 2;
  }
  
  if (type === "XSS") {
    score = 8; // Base score tinggi untuk XSS
    if (code.includes("innerHTML")) score = 10;
    if (code.includes("htmlspecialchars") || code.includes("htmlentities")) score = 1;
    if (code.includes("echo") || code.includes("print")) score = 9;
  }
  
  return Math.min(10, Math.max(1, score));
};

/**
 * Get appropriate CWE based on vulnerability type
 */
const getCWEId = (type: "SQLInjection" | "XSS"): string => {
  if (type === "SQLInjection") return "CWE-89";
  if (type === "XSS") return "CWE-79";
  return "CWE-1035";
};

/**
 * Helper: Extract code context (before, target, after)
 */
const getCodeContext = (lines: string[], targetLine: number, contextLines: number = 2) => {
  const startIdx = Math.max(0, targetLine - contextLines - 1);
  const endIdx = Math.min(lines.length, targetLine + contextLines);
  
  return {
    before: lines.slice(startIdx, targetLine - 1),
    target: lines[targetLine - 1] || "",
    after: lines.slice(targetLine, endIdx),
  };
};

/**
 * Main Taint Analysis Function untuk PHP
 */
export const analyzePHPTaint = (filePath: string): Vulnerability[] => {
  const vulnerabilities: Vulnerability[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    // Regex untuk deteksi vulnerabilities
    lines.forEach((line, lineIdx) => {
      // XSS Pattern: HTML var interpolation {$var} atau . $var
      if (line.match(/["']\s*\.\s*\$|\{\s*\$[a-zA-Z_]\w*\s*\}/gi)) {
        if (!line.includes("htmlspecialchars") && !line.includes("htmlentities")) {
          const rule = TAINT_RULES.find((r) => r.id === "xss-php-001");
          if (rule) {
            const riskScore = calculateRiskScore("XSS", line);
            vulnerabilities.push({
              id: rule.id,
              type: "XSS",
              severity: riskScore >= 8 ? "Kritis" : "Tinggi",
              file: filePath,
              line: lineIdx + 1,
              code: line.trim(),
              description: rule.description,
              remediation: rule.remediation,
              taintPath: ["HTML String", "→", "Variable"],
              codeExample: rule.codeExample,
              riskScore,
              confidence: 80,
              exploitability: 8,
              codeContext: getCodeContext(lines, lineIdx + 1),
              owasp: "A03:2021 – Injection",
              cwe: getCWEId("XSS"),
            });
          }
        }
      }

      // SQLi via query concatenation dengan $_GET, $_POST
      const queryPattern = /["'](SELECT|INSERT|UPDATE|DELETE|DROP)[^"']*["']\s*\.\s*\$_(GET|POST|REQUEST)/gi;
      if (line.match(queryPattern)) {
        const rule = TAINT_RULES.find((r) => r.id === "sqli-php-001");
        if (rule && !line.includes("prepared")) {
          const riskScore = calculateRiskScore("SQLInjection", line);
          vulnerabilities.push({
            id: rule.id,
            type: "SQLInjection",
            severity: riskScore >= 8 ? "Kritis" : "Tinggi",
            file: filePath,
            line: lineIdx + 1,
            code: line.trim(),
            description: rule.description,
            remediation: rule.remediation,
            taintPath: ["$_GET/$_POST", "→", "SQL Query"],
            codeExample: rule.codeExample,
            riskScore,
            confidence: 85,
            exploitability: 9,
            codeContext: getCodeContext(lines, lineIdx + 1),
            owasp: "A03:2021 – Injection",
            cwe: "CWE-89",
          });
        }
      }

      // XSS via echo/print
      if (line.match(/(echo|print)\s+\$_(GET|POST|REQUEST)/gi)) {
        if (!line.includes("htmlspecialchars") && !line.includes("htmlentities")) {
          const rule = TAINT_RULES.find((r) => r.id === "xss-php-001");
          if (rule) {
            const riskScore = calculateRiskScore("XSS", line);
            vulnerabilities.push({
              id: rule.id,
              type: "XSS",
              severity: riskScore >= 8 ? "Kritis" : "Tinggi",
              file: filePath,
              line: lineIdx + 1,
              code: line.trim(),
              description: rule.description,
              remediation: rule.remediation,
              taintPath: ["$_GET/$_POST", "→", "echo/print"],
              codeExample: rule.codeExample,
              riskScore,
              confidence: 90,
              exploitability: 8,
              codeContext: getCodeContext(lines, lineIdx + 1),
              owasp: "A03:2021 – Injection",
              cwe: getCWEId("XSS"),
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error analyzing PHP taint in ${filePath}:`, error);
  }

  return vulnerabilities;
};

/**
 * Main Taint Analysis Function untuk JavaScript
 */
export const analyzeJavaScriptTaint = (filePath: string): Vulnerability[] => {
  const vulnerabilities: Vulnerability[] = [];

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const { variables, assignments } = analyzeJavaScriptSourceCode(filePath);

    // Step 1: Mark tainted variables
    const taintedVars = new Set<string>();
    variables.forEach((variable) => {
      if (variable.isTainted) {
        taintedVars.add(variable.name);
      }
    });

    // Step 2: Check unsafe DOM operations
    assignments.forEach((assignment) => {
      if (
        taintedVars.has(assignment.target) &&
        (assignment.source === "innerHTML" || assignment.source === "insertAdjacentHTML")
      ) {
        const rule = findRuleForSink("innerHTML", "XSS");
        if (rule) {
          vulnerabilities.push({
            id: rule.id,
            type: "XSS",
            severity: rule.severity,
            file: filePath,
            line: assignment.line,
            code: lines[assignment.line - 1],
            description: rule.description,
            remediation: rule.remediation,
            taintPath: [assignment.target, "→", assignment.source],
            codeExample: rule.codeExample,
          });
        }
      }
    });

    // Check for echo/print of tainted variables
    lines.forEach((line, lineIdx) => {
      const echoMatch = /(echo|print)\s+([^;]+)/g;
      let match;
      while ((match = echoMatch.exec(line)) !== null) {
        const args = match[2].match(/\$\w+/g) || [];
        args.forEach((arg) => {
          if (taintedVars.has(arg)) {
            const rule = findRuleForSink("echo", "XSS");
            if (rule) {
              vulnerabilities.push({
                id: rule.id,
                type: "XSS",
                severity: rule.severity,
                file: filePath,
                line: lineIdx + 1,
                code: line,
                description: rule.description,
                remediation: rule.remediation,
                taintPath: [arg, "→", "echo"],
                codeExample: rule.codeExample,
              });
            }
          }
        });
      }
    });
  } catch (error) {
    console.error(`Error analyzing JavaScript taint in ${filePath}:`, error);
  }

  return vulnerabilities;
};

/**
 * Analyze file dengan taint analysis
 */
export const analyzeTaintPath = (filePath: string): Vulnerability[] => {
  if (filePath.endsWith(".php")) {
    return analyzePHPTaint(filePath);
  } else if (filePath.endsWith(".js")) {
    return analyzeJavaScriptTaint(filePath);
  }
  return [];
};

/**
 * Recursive directory analysis dengan taint detection
 */
export const analyzeDirectoryTaint = (dirPath: string): Vulnerability[] => {
  const allVulnerabilities: Vulnerability[] = [];
  const visited = new Set<string>();

  const walkDir = (dir: string) => {
    if (visited.has(dir)) return;
    visited.add(dir);

    try {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        
        // Skip if path is too long or invalid
        if (fullPath.length > 260) return;
        
        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip large directories
            if (!["node_modules", "vendor", "dist", "build", ".git", ".next"].includes(file)) {
              walkDir(fullPath);
            }
          } else if (file.endsWith(".php") || file.endsWith(".js")) {
            const vulns = analyzeTaintPath(fullPath);
            allVulnerabilities.push(...vulns);
          }
        } catch (err) {
          // Skip files that can't be accessed
        }
      });
    } catch (error) {
      console.error(`Error walking directory ${dir}:`, error);
    }
  };

  walkDir(dirPath);
  return allVulnerabilities;
};
