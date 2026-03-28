"use client"
import { ArrowLeft, AlertTriangle, Zap, Code, Database, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const ProjectDetailPage = () => {
  const vulnerabilities = [
    {
      id: 1,
      type: "SQL Injection",
      severity: "Critical",
      endpoint: "/api/users",
      cve: "CVE-2024-0001",
      status: "Unfixed",
    },
    {
      id: 2,
      type: "XSS Vulnerability",
      severity: "High",
      endpoint: "/dashboard",
      cve: "CVE-2024-0002",
      status: "Unfixed",
    },
    {
      id: 3,
      type: "CSRF Token Missing",
      severity: "Medium",
      endpoint: "/api/settings",
      cve: "CVE-2024-0003",
      status: "Fixed",
    },
    {
      id: 4,
      type: "Insecure Deserialization",
      severity: "High",
      endpoint: "/api/upload",
      cve: "CVE-2024-0004",
      status: "Unfixed",
    },
    {
      id: 5,
      type: "Missing Security Headers",
      severity: "Medium",
      endpoint: "Global",
      cve: "CVE-2024-0005",
      status: "Unfixed",
    },
  ]

  const stats = [
    { label: "Total Vulnerabilities", value: "5", color: "text-red-400" },
    { label: "Critical Issues", value: "1", color: "text-orange-400" },
    { label: "Fixed", value: "1", color: "text-green-400" },
    { label: "Risk Score", value: "7.8/10", color: "text-red-400" },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "High":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">E-Commerce API</h1>
              <p className="text-sm text-gray-400">Scan completed on Jan 15, 2024</p>
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground hover:opacity-90">Rescan Project</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card border-border">
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Vulnerabilities Section */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Detected Vulnerabilities
            </h2>
          </div>

          <div className="divide-y divide-border">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="p-6 hover:bg-primary/5 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{vuln.type}</h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${getSeverityColor(vuln.severity)}`}
                      >
                        {vuln.severity}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          vuln.status === "Fixed" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {vuln.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p>
                        <strong className="text-gray-300">Endpoint:</strong>{" "}
                        <code className="bg-input px-2 py-1 rounded text-cyan-400">{vuln.endpoint}</code>
                      </p>
                      <p>
                        <strong className="text-gray-300">CVE ID:</strong> {vuln.cve}
                      </p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 border border-border rounded-lg hover:bg-primary/10">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="bg-card border-border mt-8">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Recommendations
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <Code className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Implement Input Validation</p>
                <p className="text-sm text-gray-400">
                  Add parameterized queries and input sanitization to prevent SQL injection attacks.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Add Security Headers</p>
                <p className="text-sm text-gray-400">
                  Enable CSP, X-Frame-Options, and other security headers to prevent XSS and clickjacking.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Database className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Update Dependencies</p>
                <p className="text-sm text-gray-400">
                  Review and update third-party libraries to their latest secure versions.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}

export default ProjectDetailPage
