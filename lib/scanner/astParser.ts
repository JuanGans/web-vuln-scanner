/**
 * LAYER 2: AST Parser & Structural Analysis
 * Parse kode menjadi Abstract Syntax Tree untuk context-aware analysis
 * Sesuai Bab 2.6.2 Skripsi: AST Parser
 */

import fs from "fs";
import path from "path";
import * as acorn from "acorn";

export interface VariableInfo {
  name: string;
  isTainted: boolean;
  sources: string[];
  assignmentLine: number;
}

export interface FunctionCallInfo {
  name: string;
  arguments: string[];
  line: number;
  isSafe: boolean;
}

/**
 * Parse JavaScript file menggunakan Acorn
 */
export const parseJavaScriptAST = (filePath: string): Record<string, unknown> | null => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const ast = acorn.parse(content, {
      ecmaVersion: 2020,
      sourceType: "module",
    });
    return ast as unknown as Record<string, unknown>;
  } catch (error) {
    console.error(`Error parsing JS file ${filePath}:`, error);
    return null;
  }
};

/**
 * Simple PHP parsing - extract variables dan function calls
 * (Full PHP-Parser dapat diintegrasikan nanti untuk analisis lebih dalam)
 */
export const analyzePHPSourceCode = (
  filePath: string
): { variables: VariableInfo[]; functionCalls: FunctionCallInfo[] } => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const variables: VariableInfo[] = [];
  const functionCalls: FunctionCallInfo[] = [];

  // Deteksi sources ($_GET, $_POST, etc.)
  lines.forEach((line, idx) => {
    // Extract variable assignments dari $_GET, $_POST, dll
    const varMatch = /\$\w+\s*=\s*\$_(GET|POST|REQUEST|COOKIE)\[['"]([^'"]+)['"]\]/g;
    let match;
    while ((match = varMatch.exec(line)) !== null) {
      variables.push({
        name: match[0].split("=")[0].trim(),
        isTainted: true,
        sources: [`$_${match[1]}`],
        assignmentLine: idx + 1,
      });
    }

    // Deteksi function calls yang berbahaya (sinks)
    const callMatch = /(mysqli_query|pg_query|echo|print|mysql_query|execute)\s*\(([^)]*)\)/g;
    while ((match = callMatch.exec(line)) !== null) {
      functionCalls.push({
        name: match[1],
        arguments: [match[2]],
        line: idx + 1,
        isSafe: false, // Default: assume unsafe until proven otherwise
      });
    }
  });

  return { variables, functionCalls };
};

/**
 * Analyze JavaScript untuk XSS vulnerabilities
 */
export const analyzeJavaScriptSourceCode = (
  filePath: string
): {
  variables: VariableInfo[];
  assignments: Array<{ target: string; source: string; line: number }>;
} => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const variables: VariableInfo[] = [];
  const assignments: Array<{ target: string; source: string; line: number }> = [];

  lines.forEach((line, idx) => {
    // Deteksi assignment dari location.search, request.args, dll
    const assignMatch =
      /(?:const|let|var)\s+(\w+)\s*=\s*(location\.search|window\.location\.search|request\.args|document\.location)/g;
    let match;
    while ((match = assignMatch.exec(line)) !== null) {
      variables.push({
        name: match[1],
        isTainted: true,
        sources: [match[2]],
        assignmentLine: idx + 1,
      });
    }

    // Deteksi innerHTML, appendChild, write calls
    const sinkMatch = /(\w+)\s*\.\s*(innerHTML|insertAdjacentHTML|appendChild|document\.write)\s*(?:=|\()/g;
    while ((match = sinkMatch.exec(line)) !== null) {
      assignments.push({
        target: match[1],
        source: match[2],
        line: idx + 1,
      });
    }
  });

  return { variables, assignments };
};
