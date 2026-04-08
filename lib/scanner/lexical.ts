/**
 * LAYER 1: Lexical Analysis Scanner
 * Regex-based pattern matching untuk quick preprocessing
 * Sesuai Bab 2.6.1 Skripsi: Regex-Based Lexical Scanner
 */

import fs from "fs";
import path from "path";
import { REGEX_PATTERNS } from "./rules";

export interface LexicalMatch {
  type: "SQLInjection" | "XSS";
  line: number;
  column: number;
  code: string;
  pattern: string;
}

/**
 * Scan file dengan regex patterns
 * Mendeteksi pola mencurigakan di level token
 */
export const scanFileLexical = (filePath: string): LexicalMatch[] => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const matches: LexicalMatch[] = [];
  const isPhp = filePath.endsWith(".php");
  const isJs = filePath.endsWith(".js");

  if (!isPhp && !isJs) {
    return [];
  }

  // SQL Injection patterns - untuk PHP
  if (isPhp) {
    // Pattern 1: mysqli_query dengan variable
    lines.forEach((line, lineIdx) => {
      if (line.match(/mysqli_query.*\$[a-zA-Z_]\w*/gi)) {
        matches.push({
          type: "SQLInjection",
          line: lineIdx + 1,
          column: line.indexOf("$"),
          code: line.substring(0, 80),
          pattern: "mysqli_query_with_var",
        });
      }
    });

    // Pattern 2: Query concatenation dengan string literal + variable
    lines.forEach((line, lineIdx) => {
      if (line.match(/["'](SELECT|INSERT|UPDATE|DELETE|DROP)[^"']*["']\s*\.\s*\$/gi)) {
        matches.push({
          type: "SQLInjection",
          line: lineIdx + 1,
          column: line.lastIndexOf("$"),
          code: line.substring(0, 80),
          pattern: "query_concat",
        });
      }
    });

    // Pattern 3: mysql_query (deprecated)
    lines.forEach((line, lineIdx) => {
      if (line.match(/mysql_query.*\$[a-zA-Z_]\w*/gi)) {
        matches.push({
          type: "SQLInjection",
          line: lineIdx + 1,
          column: line.indexOf("$"),
          code: line.substring(0, 80),
          pattern: "mysql_query_deprecated",
        });
      }
    });

    // XSS Pattern 1: echo dengan variable
    lines.forEach((line, lineIdx) => {
      if (line.match(/(echo|print)\s+\$[a-zA-Z_]\w*/gi)) {
        // Check if NOT wrapped with htmlspecialchars
        if (!line.includes("htmlspecialchars") && !line.includes("htmlentities")) {
          matches.push({
            type: "XSS",
            line: lineIdx + 1,
            column: line.indexOf("$"),
            code: line.substring(0, 80),
            pattern: "echo_unescaped",
          });
        }
      }
    });

    // XSS Pattern 2: HTML string dengan variable {$var}
    lines.forEach((line, lineIdx) => {
      if (line.match(/["']\s*\.\s*\$|\{\s*\$[a-zA-Z_]\w*\s*\}/gi)) {
        // Vulnerable: var dalam HTML string tanpa escaping
        if (!line.includes("htmlspecialchars") && !line.includes("htmlentities")) {
          matches.push({
            type: "XSS",
            line: lineIdx + 1,
            column: Math.max(line.indexOf("{"), line.indexOf(".")),
            code: line.substring(0, 100),
            pattern: "html_var_interpolation",
          });
        }
      }
    });
  }

  // JavaScript patterns
  if (isJs) {
    // innerHTML dengan variable
    lines.forEach((line, lineIdx) => {
      if (line.match(/\.innerHTML\s*=\s*[^;]*\$[a-zA-Z_]\w*/gi)) {
        matches.push({
          type: "XSS",
          line: lineIdx + 1,
          column: line.indexOf("$"),
          code: line.substring(0, 80),
          pattern: "innerHTML_assign",
        });
      }
    });
  }

  return matches;
};

/**
 * Scan seluruh directory untuk deteksi lexical
 */
export const scanDirectoryLexical = (dirPath: string): Map<string, LexicalMatch[]> => {
  const results = new Map<string, LexicalMatch[]>();

  const walkDir = (dir: string) => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules dan vendor
        if (!file.includes("node_modules") && !file.includes("vendor")) {
          walkDir(fullPath);
        }
      } else if (file.endsWith(".php") || file.endsWith(".js")) {
        const matches = scanFileLexical(fullPath);
        if (matches.length > 0) {
          results.set(fullPath, matches);
        }
      }
    });
  };

  walkDir(dirPath);
  return results;
};
