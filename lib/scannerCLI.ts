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
 * Format: Source → Intermediate Variables → Sink (properly ordered)
 */
function generateDetailedTaintPath(code: string, type: "SQLInjection" | "XSS", contextBefore: string[] = [], contextAfter: string[] = []): string[] {
  const path: string[] = [];
  
  // Step 1: Extract SOURCE (user input) - from code or contextBefore
  let source: string | null = null;
  
  // First try: direct source in current code line
  const sourceMatch = code.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER|SESSION)\['?([^'"\]\[]*)['"]?\]/);
  if (sourceMatch) {
    source = `$_${sourceMatch[1]}['${sourceMatch[2]}']`;
  }
  
  // Second try: look for source in contextBefore (for better tracing)
  if (!source && contextBefore && contextBefore.length > 0) {
    const contextStr = contextBefore.join(" ");
    const contextSourceMatch = contextStr.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER|SESSION)\['?([^'"\]\[]*)['"]?\]/);
    if (contextSourceMatch) {
      source = `$_${contextSourceMatch[1]}['${contextSourceMatch[2]}']`;
    }
  }
  
  // If source found, add to path
  if (source) {
    path.push(source);
  }
  
  if (type === "SQLInjection") {
    // Step 2: Extract INTERMEDIATE VARIABLES (but exclude system variables like $GLOBALS)
    const keyQueryVar = extractSqlSinkArgumentVariable(code);
    const assignedVar = extractAssignedPhpVariable(code);
    
    // Build flow: source → intermediate variables → sink
    const intermediateVars: string[] = [];
    // Determine if current line is a sink (so assignedVar is likely an output/result variable)
    const isSinkInLine = /(mysqli_query|mysql_query|->query|prepare|exec)\s*\(/i.test(code);
    
    // Check if query contains embedded variables like '$id'
    const embeddedVarMatch = code.match(/'\$([a-zA-Z_][a-zA-Z0-9_]*)/g) || 
                             code.match(/"\$([a-zA-Z_][a-zA-Z0-9_]*)/g);
    if (embeddedVarMatch) {
      for (const match of embeddedVarMatch) {
        const varName = `$${match.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)/)?.[1]}`;
        if (!intermediateVars.includes(varName) && varName !== source) {
          intermediateVars.push(varName);
        }
      }
    }
    
    // Add query variable first (direct input to sink)
    if (keyQueryVar && !intermediateVars.includes(keyQueryVar)) {
      intermediateVars.push(keyQueryVar);
    }
    // Add assigned var only if this line is not the sink (to avoid reporting result variable as source)
    if (assignedVar && !intermediateVars.includes(assignedVar) && !isSinkInLine) {
      intermediateVars.push(assignedVar);
    }
    
    // Add intermediate vars to path (but not $GLOBALS or PHP internals)
    if (intermediateVars.length > 0) {
      if (source) path.push("→");
      for (const variable of intermediateVars) {
        if (!variable.includes("GLOBALS") && !variable.startsWith("___")) {
          path.push(variable);
          path.push("→");
        }
      }
    }
    
    // Step 3: Extract SINK (destination function)
    // Check current line first, then contextAfter for nearby sink calls
    const sinkMatch = code.match(/(mysqli_query|mysql_query|->query|prepare|exec)\s*\(/i) ||
      (contextAfter && contextAfter.join(" ").match(/(mysqli_query|mysql_query|->query|prepare|exec)\s*\(/i));
    if (sinkMatch) {
      path.push(`${sinkMatch[1]}()`);
    }
  } else if (type === "XSS") {
    // For XSS: try to detect if database source
    // Fixed regex to properly match $row['name'] or $row["name"]
    const dbVars = contextBefore?.join(" ").match(/\$row\[[^\]]*\]/g) || [];
    const hasDbSource = dbVars.length > 0;
    
    // If database source detected and no direct input source, mark as database
    if (hasDbSource && !source) {
      source = "$row[...database]";
      path.push(source);
    }
    
    // Step 2: Extract INTERMEDIATE VARIABLES (HTML/echo variables)
    const htmlVar = extractPhpVariableName(code);
    const intermediateVars: string[] = [];
    if (htmlVar && !intermediateVars.includes(htmlVar)) intermediateVars.push(htmlVar);
    
    // Add intermediate vars to path
    if (intermediateVars.length > 0) {
      if (source) path.push("→");
      for (const variable of intermediateVars) {
        path.push(variable);
        path.push("→");
      }
    }
    
    // Step 3: Extract SINK (output function)
    const sinkMatch = code.match(/(echo|print|innerHTML|appendChild|\.html\(|display)/i) ||
      (contextAfter && contextAfter.join(" ").match(/(echo|print|innerHTML|appendChild|\.html\(|display)/i));
    if (sinkMatch) {
      path.push(sinkMatch[1]);
    }
  }
  
  // Clean up trailing arrows
  while (path.length > 0 && path[path.length - 1] === "→") {
    path.pop();
  }
  
  // If path still empty, return default
  if (path.length === 0) {
    return ["$_INPUT", "→", "Sink"];
  }

  // If we only found a source with no sink, append a generic sink to make path informative
  if (path.length === 1) {
    return [path[0], "→", "Sink"];
  }
  
  return path;
}

/**
 * Generate detailed description untuk vulnerability
 */
function generateDetailedDescription(type: "SQLInjection" | "XSS", code: string, severity: string, contextBefore: string[] = []): string {
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
    // Check context to detect Stored XSS (from database)
    const contextStr = (contextBefore || []).join(" ");
    // Fixed regex patterns for database detection
    const hasDbVariable = /\$row\[|->fetch\(|mysqli_fetch|pg_fetch|->query|->all|->get/.test(code) || 
                         /\$row\[|->fetch\(|mysqli_fetch|pg_fetch|->query|->all|->get/.test(contextStr);
    const hasDirectOutput = /echo|print|innerHTML/.test(code);
    
    if (hasDirectOutput) {
      if (hasDbVariable) {
        return "Data dari database ditampilkan langsung ke HTML tanpa encoding/escaping. Jika data tersebut pernah disimpan dari user input, ini adalah Stored XSS vulnerability.";
      }
      const hasDirectInput = /\$_(GET|POST|REQUEST|COOKIE|SERVER)\[/.test(code) || /\$_(GET|POST|REQUEST|COOKIE|SERVER)\[/.test(contextStr);
      if (hasDirectInput) {
        return "Input pengguna ditampilkan langsung ke HTML tanpa encoding/escaping, memungkinkan attacker untuk inject script berbahaya (Reflected XSS).";
      }
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
function detectXSSType(code: string, contextBefore: string[] = []): "Stored XSS" | "Reflected XSS" {
  // Stored XSS: data dari database/storage - check both current line AND context
  const contextStr = (contextBefore || []).join(" ");
  const codeAndContext = `${code} ${contextStr}`;
  
  // Explicit database indicators for Stored XSS
  const hasRowVar = /\$row\s*\[/.test(codeAndContext);
  const hasDbFetch = /mysqli_fetch|mysql_fetch|pg_fetch|fetch_assoc|fetch_array|fetchObject/.test(codeAndContext);
  const hasOutput = /echo|print|innerHTML|appendChild|\$html\s*\.=|\$output\s*\.=/.test(code);
  
  if ((hasRowVar || hasDbFetch) && hasOutput) {
    return "Stored XSS";
  }

  // Fallback: jika sumber data dari DB terdeteksi, tetap klasifikasikan sebagai Stored XSS
  // meskipun sink/output ada di baris berbeda.
  if (hasRowVar || hasDbFetch) {
    return "Stored XSS";
  }
  
  // Reflected XSS: data dari request query/form
  const hasRequestInput = /\$_(GET|POST|REQUEST|COOKIE)\[/.test(codeAndContext);
  if (hasRequestInput) {
    return "Reflected XSS";
  }
  
  // Default ke Reflected jika tidak bisa detect
  return "Reflected XSS";
}

/**
 * Determine primary line untuk SQLi
 * 
 * Decision Logic:
 * - If line is SINK (mysqli_query, mysql_query, etc) → PRIMARY LINE = this line
 *   Rationale: This is where vulnerability is actually exploited/executed
 * 
 * - If line is ASSIGNMENT only (no sink) → PRIMARY LINE = this line  
 *   Rationale: Report the query construction when sink is not nearby
 * 
 * - If both assignment and sink nearby → PRIMARY LINE = sink
 *   Rationale: Report execution point as it's more critical
 */
function determinePrimaryLineForSQLi(code: string, contextBefore: string[], line: number): { primaryLine: number; sourceLine: number | null; sinkLine: number | null } {
  const isAssignment = /^\s*\$[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(code) && /select|insert|update|delete/i.test(code);
  const isSink = /mysqli_query|mysql_query|->query|prepare|exec/i.test(code);
  
  // Prefer SINK - it's the execution point where vulnerability matters
  if (isSink) {
    return { primaryLine: line, sourceLine: null, sinkLine: line };
  }
  
  // Fall back to ASSIGNMENT if no sink on this line
  if (isAssignment) {
    return { primaryLine: line, sourceLine: line, sinkLine: null };
  }
  
  // Default: unknown line type, report as-is
  return { primaryLine: line, sourceLine: null, sinkLine: null };
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
    xssType?: string;
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
    // First filter out false positives (SQLi on hardcoded queries with no user taint)
    
    // Debug: log each vulnerability before filtering
    vulnerabilitiesArray.forEach((vuln: any) => {
      const code = vuln.originalCode?.trim() || vuln.code?.trim() || "";
      console.log(`[FP-CHECK] ${vuln.file}:${vuln.line} type=${vuln.type} code="${code.substring(0, 80)}"`);
    });
    
    const filteredVulnerabilities = vulnerabilitiesArray.filter((vuln: any) => {
      // For SQLi: check if query has actual user input
      if (vuln.type.startsWith("SQLI")) {
        const code = vuln.originalCode?.trim() || vuln.code?.trim() || "";
        const contextBefore = vuln.codeContext?.before || [];
        const contextStr = `${code} ${(contextBefore || []).join(" ")}`;
        
        // Check for hardcoded query at line 55 (SELECT COUNT without parameter)
        if (/SELECT COUNT\(\*\)/.test(code) && !/\$_(GET|POST|REQUEST|SESSION|COOKIE)/.test(contextStr)) {
          console.log(`[SCANNER-CLI] Filtering out false positive SQLi at ${vuln.file}:${vuln.line} - hardcoded query without user taint`);
          return false;  // Skip this false positive
        }
      }
      return true;  // Keep this finding
    });

    const vulnerabilities = filteredVulnerabilities.map((vuln: any) => {
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
      // Use contextBefore from scanner result first (vuln.codeContext), then fallback to extraction
      const contextBefore = vuln.codeContext?.before || extractedCodeData.codeContext?.before || [];
      const contextAfter = vuln.codeContext?.after || extractedCodeData.codeContext?.after || [];

      // SQLi false-positive guard: hardcoded COUNT query executed without any user taint.
      if (type === "SQLInjection") {
        const combinedContext = `${actualCode} ${(contextBefore || []).join(" ")}`;
        const hasHardcodedCountQuery = /SELECT\s+COUNT\s*\(\s*\*\s*\)\s+FROM/i.test(combinedContext);
        const hasUserInputTaint = /\$_(GET|POST|REQUEST|SESSION|COOKIE|SERVER)\[/.test(combinedContext);

        if (hasHardcodedCountQuery && !hasUserInputTaint) {
          console.log(`[SCANNER-CLI] Filtering SQLi false positive at ${vuln.file}:${vuln.line} (hardcoded COUNT query without user taint)`);
          return null;
        }
      }

      const detailedDescription = generateDetailedDescription(type, actualCode, severity, contextBefore);
      const remediationText = generateRemediationText(type, actualCode, severity);
      const detailedTaintPath = generateDetailedTaintPath(actualCode, type, contextBefore, contextAfter);
      const cwe = getCWEForVulnerabilityType(type);
      
      // XSS-specific: detect Stored vs Reflected
      let xssType = "";
      if (type === "XSS") {
        console.log(`[XSS-DETECT] ${vuln.file}:${vuln.line} contextBefore length: ${contextBefore.length}`);
        console.log(`[XSS-DETECT] ${vuln.file}:${vuln.line} contextBefore: ${JSON.stringify(contextBefore)}`);
        xssType = `- ${detectXSSType(actualCode, contextBefore)}`;
        console.log(`[XSS-DETECT] ${vuln.file}:${vuln.line} result: ${xssType}`);
      }
      
      // SQLi-specific: determine primary line (source vs sink)
      let primaryLine = vuln.line || 0;
      if (type === "SQLInjection") {
        const lineInfo = determinePrimaryLineForSQLi(actualCode, contextBefore, vuln.line || 0);
        primaryLine = lineInfo.primaryLine;
        console.log(`[SCANNER-CLI] SQLi line mapping - Primary: ${lineInfo.primaryLine}, Source: ${lineInfo.sourceLine}, Sink: ${lineInfo.sinkLine}`);
      }

      // Determine ruleId based on vulnerability type and XSS classification
      let ruleId = "VULN_001"; // Default
      if (type === "XSS") {
        ruleId = xssType.includes("Stored") ? "XSS_003" : "XSS_002";
      } else if (type === "SQLInjection") {
        ruleId = "SQLI_001";
      }
      
      // Build OWASP category with type-specific details
      let owaspCategory = "A03:2021 – Injection";
      if (type === "XSS") {
        owaspCategory = xssType.includes("Stored") 
          ? "A03:2021 – Injection (Stored XSS)"
          : "A03:2021 – Injection (Reflected XSS)";
      } else if (type === "SQLInjection") {
        owaspCategory = "A03:2021 – Injection (SQL Injection)";
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
        ruleId: ruleId,  // ✅ NEW: Rule ID with XSS type awareness
        owasp: owaspCategory,  // ✅ IMPROVED: OWASP with type-specific details
        cwe: cwe,  // Auto-mapped CWE
        taintPath: detailedTaintPath,  // Detailed taint path with variables
        xssType: type === "XSS" ? xssType.replace("- ", "") : undefined,  // ✅ NEW: Include XSS type explicitly
        codeExample: {
          vulnerable: `// ❌ Vulnerable code - From file: ${vuln.file || "unknown"}:${primaryLine || "?"}\n${actualCode || "(Code could not be extracted)"}`,
          safe: generateSafeCodeExample(type, actualCode || ""),
        },
      };
    }).filter((v): v is NonNullable<typeof v> => v !== null);

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
