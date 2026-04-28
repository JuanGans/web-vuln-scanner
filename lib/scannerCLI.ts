/**
 * Scanner CLI Wrapper
 * Memanggil /scanner/securecli/bin/securecli.js dan parse hasilnya
 * Ini adalah bridge antara web API dan production-grade scanner engine
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Map CWE berdasarkan vulnerability type
 */
function getCWEForVulnerabilityType(type: "SQLInjection" | "XSS"): string {
  const cweMap = {
    "SQLInjection": "CWE-89",  // Improper Neutralization of Special Elements used in an SQL Command
    "XSS": "CWE-79",           // Improper Neutralization of Input During Web Page Generation
  };
  return cweMap[type] || "CWE-1035";
}

/**
 * Extract variables dari code untuk build taintPath yang detail
 */
function generateDetailedTaintPath(code: string, type: "SQLInjection" | "XSS"): string[] {
  const path: string[] = [];
  
  if (type === "SQLInjection") {
    // Extract user input sources: $_GET, $_POST, $_SESSION, $_SERVER, $_COOKIE, $_REQUEST
    if (code.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER)\[/)) {
      const match = code.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER)\['?([^'"\]\[]*)['"]?\]/);
      if (match) {
        path.push(`$_${match[1]}['${match[2]}']`);
      }
    }
    
    // Extract variable assignments
    const varMatches = code.match(/\$[a-zA-Z_][a-zA-Z0-9_]*/g);
    if (varMatches) {
      const uniqueVars = [...new Set(varMatches)];
      path.push("→", ...uniqueVars.slice(0, 3)); // Limit to first 3 unique vars
    }
    
    // Extract sink functions
    if (code.match(/mysqli_query|mysql_query|->query|prepare|exec/i)) {
      const sinkMatch = code.match(/(mysqli_query|mysql_query|->query|prepare|exec)/i);
      if (sinkMatch) {
        path.push("→", `${sinkMatch[1]}()`);
      }
    }
  } else if (type === "XSS") {
    // Extract user input sources
    if (code.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER)\[/)) {
      const match = code.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER)\['?([^'"\]\[]*)['"]?\]/);
      if (match) {
        path.push(`$_${match[1]}['${match[2]}']`);
      }
    }
    
    // Extract variables
    const varMatches = code.match(/\$[a-zA-Z_][a-zA-Z0-9_]*/g);
    if (varMatches) {
      const uniqueVars = [...new Set(varMatches)];
      path.push("→", ...uniqueVars.slice(0, 2));
    }
    
    // Extract output sinks: echo, print, innerHTML, etc
    if (code.match(/echo|print|innerHTML|appendChild|textContent|innerHTML/i)) {
      const sinkMatch = code.match(/(echo|print|innerHTML|appendChild|textContent)/i);
      if (sinkMatch) {
        path.push("→", sinkMatch[1]);
      }
    }
  }
  
  // If path is empty or only has one item, return default
  if (path.length <= 1) {
    return ["Source", "→", "Sink"];
  }
  
  return path;
}

/**
 * Generate detailed description untuk vulnerability
 */
function generateDetailedDescription(type: "SQLInjection" | "XSS", code: string, severity: string): string {
  if (type === "SQLInjection") {
    const hasDirectInput = /\$_(GET|POST|REQUEST|COOKIE|SERVER)\[/.test(code);
    const hasQueryConcat = /=\s*"[^"]*"\s*\+|=\s*'[^']*'\s*\+|\.\s*\$/.test(code);
    
    if (hasDirectInput || hasQueryConcat) {
      if (severity === "Kritis") {
        return "Aplikasi membangun SQL query langsung dari input pengguna tanpa parameterisasi. Ini memungkinkan SQL Injection attack untuk memodifikasi query, mencuri data, atau merusak database.";
      }
      return "Aplikasi menggunakan string concatenation untuk membangun SQL query dengan data dinamis. Beberapa input mungkin tidak tersanitasi dengan baik, meningkatkan risiko SQL Injection.";
    }
    
    return "Database query menggunakan variabel yang mungkin berasal dari input pengguna tanpa proper prepared statement atau parameterized query.";
  } else if (type === "XSS") {
    const hasDbVariable = /\$row\[|->|fetch|result\[/.test(code);
    const hasDirectOutput = /echo|print|innerHTML/.test(code);
    
    if (hasDirectOutput) {
      if (hasDbVariable) {
        return "Data dari database ditampilkan langsung ke HTML tanpa encoding/escaping. Jika data tersebut pernah disimpan dari user input, ini adalah Stored XSS vulnerability.";
      }
      return "Input pengguna ditampilkan langsung ke HTML tanpa encoding/escaping, memungkinkan attacker untuk inject script berbahaya (Reflected XSS).";
    }
    
    return "Konten yang mungkin mengandung user input ditampilkan tanpa proper encoding/sanitasi, menciptakan potensi XSS attack.";
  }
  
  return "Kerentanan keamanan terdeteksi dalam aplikasi.";
}

/**
 * Generate remediation text yang berbeda dari description
 */
function generateRemediationText(type: "SQLInjection" | "XSS", code: string, severity: string): string {
  if (type === "SQLInjection") {
    return `PERBAIKAN SEGERA DIPERLUKAN - Gunakan Prepared Statements atau Parameterized Queries:
    
1. Ganti string concatenation dengan placeholder (?)
2. Gunakan prepared statement: $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?")
3. Bind parameter: $stmt->bind_param("i", $id)
4. Validasi input di sisi server: cek tipe data (integer, string, email)
5. Test dengan payload berbahaya seperti ' OR 1=1-- untuk memastikan protection

Contoh aman: Gunakan ORM seperti Eloquent, Doctrine, atau SQLAlchemy yang handle escaping otomatis.`;
  } else if (type === "XSS") {
    return `PERBAIKAN SEGERA DIPERLUKAN - Encode/Escape semua output ke HTML context:
    
1. Untuk PHP echo: gunakan htmlspecialchars($var, ENT_QUOTES, 'UTF-8')
2. Untuk JavaScript: gunakan DOMPurify library atau textContent bukan innerHTML
3. Implementasi Content Security Policy (CSP) header
4. Validasi input format di sisi server sebelum menyimpan
5. Test dengan payload XSS seperti <img src=x onerror=alert('xss')> untuk memastikan encoding bekerja

Konteks encoding penting: HTML context ≠ JavaScript context ≠ URL context`;
  }
  
  return "Gunakan teknik mitigasi yang sesuai untuk vulnerability type ini.";
}

/**
 * Detect apakah XSS adalah Stored atau Reflected
 */
function detectXSSType(code: string): "Stored XSS" | "Reflected XSS" {
  // Stored XSS: data dari database/storage
  const hasDbFetch = /\$row\[|->|fetch|result\[|mysqli_fetch|pg_fetch|pdo->query|->get|->all/.test(code);
  const hasOutput = /echo|print|innerHTML|appendChild/.test(code);
  
  if (hasDbFetch && hasOutput) {
    return "Stored XSS";
  }
  
  // Reflected XSS: data dari request query/form
  const hasRequestInput = /\$_(GET|POST|REQUEST|COOKIE)\[/.test(code);
  if (hasRequestInput && hasOutput) {
    return "Reflected XSS";
  }
  
  // Default ke Reflected jika tidak bisa detect
  return "Reflected XSS";
}

/**
 * Determine primary line untuk SQLi (source line jika ada assignment, else sink line)
 */
function determinePrimaryLineForSQLi(code: string, contextBefore: string[], line: number): { primaryLine: number; sourceLine: number | null; sinkLine: number } {
  const isAssignment = /^\s*\$[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(code) && /select|insert|update|delete/i.test(code);
  const isSink = /mysqli_query|mysql_query|->query|prepare|exec/i.test(code);
  
  if (isAssignment) {
    // This is query assignment - report as primary line
    return { primaryLine: line, sourceLine: line, sinkLine: null as any };
  } else if (isSink) {
    // This is sink execution - check if query assignment is nearby (in context)
    const contextCode = contextBefore.map(l => l.trim()).join(" ");
    const hasNearbyAssignment = /\$[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*"[^"]*select/i.test(contextCode);
    
    if (hasNearbyAssignment) {
      // Query assignment is before this sink - sourceLine is contextBefore line
      const assignmentLine = line - contextBefore.length;
      return { primaryLine: line, sourceLine: assignmentLine, sinkLine: line };
    }
  }
  
  return { primaryLine: line, sourceLine: null, sinkLine: line };
}

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
 * Generate safe code example based on vulnerability type
 */
function generateSafeCodeExample(type: "SQLInjection" | "XSS", vulnerableCode: string): string {
  if (type === "XSS") {
    // XSS safe examples
    if (vulnerableCode.includes("echo")) {
      return `// ✅ Safe code - Use htmlspecialchars or escape output
echo htmlspecialchars($user_input, ENT_QUOTES, 'UTF-8');`;
    }
    if (vulnerableCode.includes("innerHTML")) {
      return `// ✅ Safe code - Use textContent instead
element.textContent = userInput;`;
    }
    if (vulnerableCode.includes("dangerouslySetInnerHTML")) {
      return `// ✅ Safe code - Use DOMPurify to sanitize
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />`;
    }
    return `// ✅ Safe code - Encode/escape all user input
const safe = escapeHtml(userInput);
element.innerHTML = safe;`;
  }
  
  if (type === "SQLInjection") {
    // SQL Injection safe examples
    if (vulnerableCode.includes("$") && vulnerableCode.includes("query")) {
      return `// ✅ Safe code - Use prepared statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);`;
    }
    if (vulnerableCode.includes("concat") || vulnerableCode.includes("+")) {
      return `// ✅ Safe code - Use parameterized queries
const query = "SELECT * FROM users WHERE email = ?";
const result = await db.execute(query, [userEmail]);`;
    }
    return `// ✅ Safe code - Use parameterized query
SELECT * FROM users WHERE id = :id AND status = :status
Parameters: [':id' => $id, ':status' => 'active']`;
  }
  
  return `// ✅ Safe code example
// Implement proper input validation and sanitization`;
}

function extractPhpVariableName(code: string): string | null {
  if (!code) return null;
  const match = code.match(/\$[a-zA-Z_][a-zA-Z0-9_]*/);
  return match ? match[0] : null;
}

function extractAssignedPhpVariable(code: string): string | null {
  if (!code) return null;
  const match = code.match(/^\s*(\$[a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
  return match ? match[1] : null;
}

function extractSqlSinkArgumentVariable(code: string): string | null {
  if (!code) return null;

  const mysqliMatch = code.match(/mysqli_query\s*\([^,]+,\s*(\$[a-zA-Z_][a-zA-Z0-9_]*)/i);
  if (mysqliMatch) return mysqliMatch[1];

  const mysqlMatch = code.match(/mysql_query\s*\(\s*(\$[a-zA-Z_][a-zA-Z0-9_]*)/i);
  if (mysqlMatch) return mysqlMatch[1];

  const queryMethodMatch = code.match(/->query\s*\(\s*(\$[a-zA-Z_][a-zA-Z0-9_]*)/i);
  if (queryMethodMatch) return queryMethodMatch[1];

  const execMatch = code.match(/exec\s*\(\s*(\$[a-zA-Z_][a-zA-Z0-9_]*)/i);
  if (execMatch) return execMatch[1];

  return null;
}

function isSqlQueryAssignment(code: string): boolean {
  if (!code) return false;
  const normalized = code.replace(/\s+/g, " ").toLowerCase();
  return normalized.includes("=") && /select|insert|update|delete/.test(normalized);
}

function isSqlExecutionSink(code: string): boolean {
  if (!code) return false;
  const normalized = code.replace(/\s+/g, " ").toLowerCase();
  return /mysqli_query|mysql_query|->query\(|prepare\(|exec\(/.test(normalized);
}

function deduplicateNormalizedVulnerabilities(vulnerabilities: ScanResult["vulnerabilities"]): ScanResult["vulnerabilities"] {
  if (!vulnerabilities.length) return vulnerabilities;

  const deduped: ScanResult["vulnerabilities"] = [];

  for (const vuln of vulnerabilities) {
    if (vuln.type !== "SQLInjection") {
      deduped.push(vuln);
      continue;
    }

    const currentVar = extractPhpVariableName(vuln.code || "");
    const currentAssignedVar = extractAssignedPhpVariable(vuln.code || "");
    const currentSinkQueryVar = extractSqlSinkArgumentVariable(vuln.code || "");
    const currentLooksLikeAssignment = isSqlQueryAssignment(vuln.code || "");
    const currentLooksLikeSink = isSqlExecutionSink(vuln.code || "");

    const duplicateIndex = deduped.findIndex((existing) => {
      if (existing.type !== "SQLInjection") return false;
      if (existing.file !== vuln.file) return false;

      const lineDistance = Math.abs((existing.line || 0) - (vuln.line || 0));
      if (lineDistance > 2) return false;

      const existingVar = extractPhpVariableName(existing.code || "");
      const existingLooksLikeAssignment = isSqlQueryAssignment(existing.code || "");
      const existingLooksLikeSink = isSqlExecutionSink(existing.code || "");
      const existingAssignedVar = extractAssignedPhpVariable(existing.code || "");
      const existingSinkQueryVar = extractSqlSinkArgumentVariable(existing.code || "");

      // Same exact SQLi line + type is always duplicate.
      if (existing.line === vuln.line && existing.type === vuln.type) return true;

      // Core rule: assignment + sink near each other for same query variable.
      if (existingLooksLikeAssignment && currentLooksLikeSink) {
        if (existingAssignedVar && currentSinkQueryVar && existingAssignedVar === currentSinkQueryVar) {
          return true;
        }
      }

      if (currentLooksLikeAssignment && existingLooksLikeSink) {
        if (currentAssignedVar && existingSinkQueryVar && currentAssignedVar === existingSinkQueryVar) {
          return true;
        }
      }

      // Fallback for older engines where sink/query var extraction may fail.
      if (existingLooksLikeAssignment && currentLooksLikeSink) {
        if (existingVar && currentVar && existingVar === currentVar) {
          return true;
        }
      }

      if (currentLooksLikeAssignment && existingLooksLikeSink) {
        if (existingVar && currentVar && existingVar === currentVar) {
          return true;
        }
      }

      return false;
    });

    if (duplicateIndex === -1) {
      deduped.push(vuln);
      continue;
    }

    const existing = deduped[duplicateIndex];
    const keepCurrent = isSqlExecutionSink(vuln.code || "") && !isSqlExecutionSink(existing.code || "");

    if (keepCurrent) {
      deduped[duplicateIndex] = vuln;
    }

    console.log(
      `[SCANNER-CLI][DEDUP] Merged duplicate SQLi near line ${existing.line}/${vuln.line} in ${vuln.file}`
    );
  }

  if (deduped.length < vulnerabilities.length) {
    console.log(
      `[SCANNER-CLI][DEDUP] Removed ${vulnerabilities.length - deduped.length} SQLi duplicate(s) after normalization`
    );
  }

  return deduped;
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
    
    console.log(`[SCANNER-CLI] Parsed ${vulnerabilitiesArray.length} vulnerabilities from SecureCLI output`);
    if (vulnerabilitiesArray.length > 0) {
      console.log(`[SCANNER-CLI] First vulnerability structure:`, JSON.stringify(vulnerabilitiesArray[0], null, 2));
    }

    // Helper: Extract actual code from file
    const extractCodeFromFile = (filePath: string, lineNumber: number, contextLines: number = 3): { code: string; codeContext?: { before: string[]; target: string; after: string[] }; extractionLog?: string } => {
      try {
        // Normalize file path - remove leading slashes and backslashes
        const normalizedFilePath = filePath.replace(/^[\/\\]+/, "");
        
        // Try multiple path combinations
        const pathCombinations = [
          path.join(targetPath, normalizedFilePath),
          path.join(targetPath, filePath),
          filePath, // Try absolute path from scanner
          path.join(process.cwd(), "uploads", "extracted", normalizedFilePath),
        ];

        let foundPath = null;
        for (const tryPath of pathCombinations) {
          console.log(`[SCANNER-CLI] Trying path: ${tryPath}`);
          if (fs.existsSync(tryPath)) {
            foundPath = tryPath;
            console.log(`[SCANNER-CLI] ✓ File found at: ${foundPath}`);
            break;
          }
        }

        if (!foundPath) {
          const errorMsg = `File not found. Tried: ${pathCombinations.join(" | ")}`;
          console.warn(`[SCANNER-CLI] ${errorMsg}`);
          return { code: "", extractionLog: errorMsg };
        }

        const content = fs.readFileSync(foundPath, "utf-8");
        const lines = content.split("\n");
        const targetIdx = Math.max(0, (lineNumber || 1) - 1);

        if (targetIdx >= lines.length) {
          return { 
            code: lines[targetIdx] || "",
            extractionLog: `Line ${lineNumber} is beyond file length (${lines.length} lines)`
          };
        }

        const startIdx = Math.max(0, targetIdx - contextLines);
        const endIdx = Math.min(lines.length, targetIdx + contextLines + 1);

        console.log(`[SCANNER-CLI] Successfully extracted code at line ${lineNumber} from ${foundPath}`);

        return {
          code: lines[targetIdx] || "",
          codeContext: {
            before: lines.slice(startIdx, targetIdx).map(l => l || ""),
            target: lines[targetIdx] || "",
            after: lines.slice(targetIdx + 1, endIdx).map(l => l || ""),
          },
          extractionLog: `Extracted from: ${foundPath}`
        };
      } catch (error) {
        const errorMsg = `Error extracting code: ${error instanceof Error ? error.message : String(error)}`;
        console.warn(`[SCANNER-CLI] ${errorMsg}`);
        return { code: "", extractionLog: errorMsg };
      }
    };

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

      // Try to extract actual code from file
      const extractedCodeData = extractCodeFromFile(vuln.file || "", vuln.line || 0);
      
      // Log extraction result
      if (extractedCodeData.extractionLog) {
        console.log(`[SCANNER-CLI] Extraction log for ${vuln.file}:${vuln.line} - ${extractedCodeData.extractionLog}`);
      }
      
      const actualCode = 
        vuln.originalCode?.trim() || 
        vuln.code?.trim() || 
        vuln.snippet?.trim() || 
        vuln.sourceCode?.trim() || 
        extractedCodeData.code ||
        "";

      console.log(`[SCANNER-CLI] Final code for ${vuln.file}:${vuln.line}: ${actualCode ? `✓ ${actualCode.substring(0, 50)}...` : "✗ EMPTY"}`);

      // Generate quality-enhanced vulnerability data
      const detailedDescription = generateDetailedDescription(type, actualCode, severity);
      const remediationText = generateRemediationText(type, actualCode, severity);
      const detailedTaintPath = generateDetailedTaintPath(actualCode, type);
      const cwe = getCWEForVulnerabilityType(type);
      
      // XSS-specific: detect Stored vs Reflected
      let xssType = "";
      if (type === "XSS") {
        xssType = `- ${detectXSSType(actualCode)}`;
      }
      
      // SQLi-specific: determine primary line (source vs sink)
      let primaryLine = vuln.line || 0;
      if (type === "SQLInjection") {
        const contextBefore = extractedCodeData.codeContext?.before || [];
        const lineInfo = determinePrimaryLineForSQLi(actualCode, contextBefore, vuln.line || 0);
        primaryLine = lineInfo.primaryLine;
        console.log(`[SCANNER-CLI] SQLi line mapping - Primary: ${lineInfo.primaryLine}, Source: ${lineInfo.sourceLine}, Sink: ${lineInfo.sinkLine}`);
      }

      return {
        id: vuln.type.toLowerCase(),
        type,
        severity,
        file: vuln.file || "unknown",
        line: primaryLine,  // Use computed primary line instead of raw vuln.line
        code: actualCode,
        description: detailedDescription,  // Now detailed and specific
        remediation: remediationText,      // Now different from description
        riskScore: vuln.riskScore || 8,
        confidence: Math.round((vuln.confidence || 0.8) * 100),
        exploitability: vuln.exploitability || 8,
        codeContext: vuln.codeContext || extractedCodeData.codeContext,
        owasp: vuln.owasp?.category || "A03:2021 – Injection",  // Better default OWASP
        cwe: cwe,  // Auto-mapped CWE
        taintPath: detailedTaintPath,  // Detailed taint path with variables
        codeExample: {
          vulnerable: `// ❌ Vulnerable code - From file: ${vuln.file || "unknown"}:${primaryLine || "?"}\n${actualCode || "(Code could not be extracted)"}`,
          safe: generateSafeCodeExample(type, actualCode || ""),
        },
      };
    });

    const deduplicatedVulnerabilities = deduplicateNormalizedVulnerabilities(vulnerabilities);

    // Count by type dan severity
    const summary = {
      totalVulnerabilities: deduplicatedVulnerabilities.length,
      vulnerabilitiesByType: {
        SQLInjection: deduplicatedVulnerabilities.filter((v) => v.type === "SQLInjection").length,
        XSS: deduplicatedVulnerabilities.filter((v) => v.type === "XSS").length,
      },
      vulnerabilitiesBySeverity: {
        Kritis: deduplicatedVulnerabilities.filter((v) => v.severity === "Kritis").length,
        Tinggi: deduplicatedVulnerabilities.filter((v) => v.severity === "Tinggi").length,
        Sedang: deduplicatedVulnerabilities.filter((v) => v.severity === "Sedang").length,
        Rendah: deduplicatedVulnerabilities.filter((v) => v.severity === "Rendah").length,
      },
    };

    console.log(
      `[SCANNER-CLI] Scan complete: ${summary.totalVulnerabilities} vulnerabilities found`
    );

    // Normalize output format
    const normalizedResult: ScanResult = {
      success: true,
      summary,
      vulnerabilities: deduplicatedVulnerabilities,
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
