"use client"

import { Navbar } from "@/components/navbar"
import {
  ChevronRight,
  Flag,
  Share2,
  AlertCircle,
  CheckCircle,
  Copy,
} from "lucide-react"
import { Manrope } from "next/font/google"
import { useState } from "react"
import { useParams } from "next/navigation"

const manrope = Manrope({ subsets: ["latin"], weight: ["200", "400", "600", "800"] })

interface CodeContext {
  line: number
  code: string
  highlight: boolean
}

interface VulnerabilityDetail {
  id: number
  project: string
  title: string
  file: string
  lineNumber: number
  severity: string
  riskScore: number
  confidence: number
  exploitability: number
  owaspCategory: string
  cweIdentifier: string
  explanation: string
  codeContext: CodeContext[]
  recommendations: string[]
  vulnerableCode: string
  secureCode: string
}

// Sample vulnerability data - in a real app, this would come from a database
const vulnerabilityData: Record<string, VulnerabilityDetail> = {
  "1": {
    id: 1,
    project: "DVWA_SCAN_01",
    title: "XSS_DOM_BASED",
    file: "C:/xampp/htdocs/DVWA/vulnerabilities/xss_d/index.php",
    lineNumber: 53,
    severity: "CRITICAL",
    riskScore: 10,
    confidence: 92,
    exploitability: 9,
    owaspCategory: "A03:2021 – Injection",
    cweIdentifier: "CWE-79",
    explanation:
      '"Input dari pengguna diproses ke output HTML tanpa encoding/sanitasi yang memadai, memungkinkan eksekusi script berbahaya dalam konteks browser pengguna."',
    codeContext: [
      { line: 51, code: 'document.getElementById(\'welcome\').innerHTML = "Hello, " +', highlight: false },
      { line: 52, code: '    decodeURIComponent(window.location.hash.substring(1));', highlight: false },
      { line: 53, code: 'document.write("Target: " + window.location.search);', highlight: true },
      { line: 54, code: 'var current_url = window.location.href;', highlight: false },
      { line: 55, code: 'console.log("Navigated to: " + current_url);', highlight: false },
    ],
    recommendations: [
      'Gunakan textContent atau innerText daripada innerHTML.',
      'Implementasikan fungsi encoding HTML khusus untuk output dinamis.',
      'Validasi input URL parameter menggunakan regex yang ketat.',
    ],
    vulnerableCode: 'document.write("Target: " + window.location.search);',
    secureCode: `const target = new URLSearchParams(window.location.search).get('target');
document.getElementById('status').textContent = \`Target: \${target}\`;`,
  },
  "2": {
    id: 2,
    project: "DVWA_SCAN_01",
    title: "SQL_INJECTION",
    file: "C:/xampp/htdocs/DVWA/vulnerabilities/sqli/index.php",
    lineNumber: 42,
    severity: "CRITICAL",
    riskScore: 10,
    confidence: 95,
    exploitability: 10,
    owaspCategory: "A03:2021 – Injection",
    cweIdentifier: "CWE-89",
    explanation:
      '"Database queries constructed with user input tanpa menggunakan parameterized queries, memungkinkan SQL injection attacks."',
    codeContext: [
      { line: 40, code: "$user = $_GET['username'];", highlight: false },
      { line: 41, code: "$pass = $_GET['password'];", highlight: false },
      { line: 42, code: '$query = "SELECT * FROM users WHERE username=\'" + $user + "\' AND password=\'" + $pass + "\'";', highlight: true },
      { line: 43, code: "$result = mysqli_query($con, $query);", highlight: false },
      { line: 44, code: "if(mysqli_num_rows($result) > 0) { authenticate(); }", highlight: false },
    ],
    recommendations: [
      'Gunakan prepared statements dengan parameter binding.',
      'Implementasikan input validation dan escape routines.',
      'Gunakan ORM atau query builder yang secure.',
    ],
    vulnerableCode: '$query = "SELECT * FROM users WHERE username=\'" + $user + "\' AND password=\'" + $pass + "\'";',
    secureCode: `$stmt = $con->prepare("SELECT * FROM users WHERE username=? AND password=?");
$stmt->bind_param("ss", $user, $pass);
$stmt->execute();
$result = $stmt->get_result();`,
  },
}

export default function VulnerabilityDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const data = vulnerabilityData[id] || vulnerabilityData["1"]

  const [copied, setCopied] = useState(false)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar activePage="scan-result" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-8 pt-12 pb-24">
        {/* Header & Breadcrumb */}
        <header className="mb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-on-surface-variant mb-4 text-sm font-medium tracking-wide">
            <span>PROJECTS</span>
            <ChevronRight className="w-4 h-4" />
            <span>{data.project}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-bold">VULNERABILITY #{data.id}</span>
          </div>

          {/* Title and Location */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className={`${manrope.className} text-5xl font-extrabold tracking-tighter text-on-surface mb-4`}>
                Vulnerability #{data.id}: {data.title}
              </h1>
              <p className="mt-4 text-on-surface-variant font-medium text-lg flex items-center gap-2">
                <span>📁</span>
                {data.file} <span className="opacity-50">at</span>{" "}
                <span className="text-primary bg-primary-container px-2 py-0.5 rounded-md">Line {data.lineNumber}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all">
                <Flag className="w-5 h-5" />
                Mark as False Positive
              </button>
              <button className="bg-surface-container-highest text-on-surface px-8 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 transition-all hover:bg-surface-container">
                <Share2 className="w-5 h-5" />
                Export Finding
              </button>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column - Risk Assessment */}
          <div className="md:col-span-4 space-y-8">
            {/* Severity Scorecard */}
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_20px_40px_rgba(42,52,57,0.06)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <AlertCircle className="text-error w-24 h-24" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Risk Assessment</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Severity</span>
                  <span className="bg-error/20 text-error px-4 py-1 rounded-full text-xs font-black uppercase">
                    {data.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Risk Score</span>
                  <span className={`${manrope.className} font-extrabold text-2xl text-on-surface`}>
                    {data.riskScore}
                    <span className="text-outline-variant text-base font-normal">/10</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Confidence</span>
                  <span className={`${manrope.className} font-extrabold text-2xl text-on-surface`}>
                    {data.confidence}
                    <span className="text-outline-variant text-base font-normal">%</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Exploitability</span>
                  <span className={`${manrope.className} font-extrabold text-2xl text-on-surface`}>
                    {data.exploitability}
                    <span className="text-outline-variant text-base font-normal">/10</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="bg-surface-container rounded-lg p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Classification</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-on-surface-variant font-bold mb-1">OWASP CATEGORY</p>
                  <p className="text-on-surface font-semibold">{data.owaspCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold mb-1">CWE IDENTIFIER</p>
                  <p className={`${manrope.className} text-primary font-bold`}>{data.cweIdentifier}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="md:col-span-8 space-y-8">
            {/* Finding Explanation */}
            <div className="bg-surface-container-lowest rounded-lg p-10 shadow-[0_20px_40px_rgba(42,52,57,0.06)]">
              <h3 className={`${manrope.className} text-2xl font-black tracking-tight text-on-surface mb-6`}>
                Finding Explanation
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-lg italic">{data.explanation}</p>
            </div>

            {/* Code Context */}
            <div className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-slate-950 px-6 py-3 flex justify-between items-center border-b border-white/5">
                <span className="text-white/40 text-xs font-mono">Source Viewer — {data.file.split("/").pop()}</span>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-40"></div>
                </div>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                {data.codeContext.map((ctx: CodeContext, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${ctx.highlight ? "bg-error/20 border-l-4 border-error -mx-6 px-6" : "text-white/30"}`}
                  >
                    <span className={`w-12 shrink-0 ${ctx.highlight ? "text-error font-bold" : ""}`}>{ctx.line}</span>
                    <span className={ctx.highlight ? "text-white font-medium" : "text-white/60"}>{ctx.code}</span>
                    {ctx.highlight && (
                      <AlertCircle className="ml-auto text-error w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations and Fix Snippet Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recommendations */}
              <div className="bg-surface-container-high rounded-lg p-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Recommendations</h4>
                <ul className="space-y-4">
                  {data.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-on-surface text-sm font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fix Snippet Header */}
              <div className="bg-white rounded-lg p-8 border border-outline-variant/15 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    SECURE CODING PATTERN
                  </span>
                </div>
                <h3 className={`${manrope.className} text-2xl font-black tracking-tighter text-on-surface`}>
                  Snippet Perbaikan
                </h3>
                <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
                  Gunakan template literal dengan encoding atau sink manipulasi DOM yang aman.
                </p>
              </div>
            </div>

            {/* Vulnerable vs Secure Code Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vulnerable */}
              <div className="bg-surface-container-lowest rounded-lg border border-error/20 overflow-hidden">
                <div className="bg-error/5 px-4 py-2 text-[10px] font-bold text-error uppercase tracking-widest flex items-center gap-2">
                  <span>✕</span> Vulnerable
                </div>
                <div className="p-6 font-mono text-xs text-on-surface-variant whitespace-pre-wrap break-words">
                  {data.vulnerableCode}
                </div>
              </div>

              {/* Secure Fix */}
              <div className="bg-surface-container-lowest rounded-lg border border-primary/20 overflow-hidden">
                <div className="bg-primary/5 px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Secure Fix
                </div>
                <div className="p-6 font-mono text-xs text-primary font-medium whitespace-pre-wrap break-words group relative">
                  {data.secureCode}
                  <button
                    onClick={() => handleCopyCode(data.secureCode)}
                    className="absolute top-2 right-2 p-2 bg-primary/10 rounded hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-4 h-4 text-primary" />
                  </button>
                  {copied && (
                    <span className="absolute top-2 right-12 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant/10 w-full mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center w-full py-10 px-8">
          <div className="mb-6 md:mb-0">
            <span className={`${manrope.className} font-black text-primary text-xl`}>CyberGuard</span>
            <p className="text-on-surface-variant text-[11px] mt-1 font-medium">
              © 2024 CyberGuard Editorial. Protected Systems.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Documentation
            </a>
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Security Hub
            </a>
            <a className="text-on-surface-variant hover:text-primary text-xs font-medium transition-colors" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
