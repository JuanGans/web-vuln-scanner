"use client"

import { Inter, Manrope } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Bolt, Check, ChevronDown, CircleCheck, FolderOpen, Search, Upload, AlertCircle } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useNotification } from "@/lib/notificationContext"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] })
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

interface Project {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [selectedProject, setSelectedProject] = useState("upload-without-project")
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"upload" | "scanning" | "completed">("upload")
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchProjects()
  }, [])

  // Prefill projectId and fileName when navigated from a rescan action
  const searchParams = useSearchParams()
  const [rescanMode, setRescanMode] = useState(false)
  const [rescanFileName, setRescanFileName] = useState<string | null>(null)

  useEffect(() => {
    const fetchRescanData = async () => {
      try {
        const scanId = searchParams?.get("scanId")
        if (!scanId) return

        // Fetch scan data from API
        const res = await fetch(`/api/history`)
        if (!res.ok) throw new Error("Failed to fetch scan data")
        
        const data = await res.json()
        const scan = data.data?.find((s: any) => s.id === scanId)
        
        if (scan) {
          // Pre-fill project if exists
          if (scan.projectId) {
            setSelectedProject(scan.projectId)
          }
          // Store fileName for display hint
          if (scan.fileName) {
            setRescanFileName(scan.fileName)
          }
          setRescanMode(true)
        }
      } catch (e) {
        console.error("Failed to load rescan data:", e)
      }
    }

    fetchRescanData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()
      setProjects(data.data || [])
    } catch (err) {
      console.error("Failed to fetch projects:", err)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const getSelectedProjectDisplayName = () => {
    if (selectedProject === "upload-without-project") {
      return "Upload without Project"
    }
    const project = projects.find((p) => p.id === selectedProject)
    return project?.name || "Select Project"
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (selectedFile: File) => {
    // Support file types sesuai FR-02: .zip, .php, .js
    const supportedExtensions = [".zip", ".php", ".js"]
    const fileName = selectedFile.name.toLowerCase()
    const isSupported = supportedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!isSupported) {
      setError(`Format file tidak didukung. Gunakan: ${supportedExtensions.join(", ")}`)
      return
    }
    
    // Check file size (max 50MB sesuai requirement)
    const maxSizeBytes = 50 * 1024 * 1024
    if (selectedFile.size > maxSizeBytes) {
      setError("File terlalu besar. Maksimal 50MB sesuai requirement sistem.")
      return
    }
    
    setFile(selectedFile)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleStartScan = async () => {
    if (!file) {
      setError("Pilih file terlebih dahulu")
      addNotification({
        type: "warning",
        title: "File Required",
        message: "Please select a file to scan",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    // Notification: Upload start (info - auto-delete)
    addNotification({
      type: "info",
      title: "Upload Starting",
      message: `Uploading ${file.name}...`,
    })

    try {
      setCurrentStep("upload")
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text()
        let errorMsg = `Upload gagal: ${uploadRes.status} ${uploadRes.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.error || errorMsg
        } catch {
          // Response bukan JSON, gunakan status message
        }
        throw new Error(errorMsg)
      }

      const uploadData = await uploadRes.json()

      // Notification: Upload success (info - auto-delete after 5s, then scan starts)
      addNotification({
        type: "info",
        title: "Upload Successful",
        message: "File uploaded successfully. Starting scan...",
      })

      setCurrentStep("scanning")
      
      // Notification: Scan start (info - auto-delete)
      addNotification({
        type: "info",
        title: "Scanning Started",
        message: "Analyzing vulnerabilities...",
      })

      const scanRes = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: uploadData.filePath,
          fileName: file.name,
          fileType: uploadData.fileType,
          projectId: selectedProject === "upload-without-project" ? null : selectedProject,
        }),
      })

      if (!scanRes.ok) {
        const errorText = await scanRes.text()
        let errorMsg = `Scan gagal: ${scanRes.status} ${scanRes.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.error || errorMsg
        } catch {
          // Response bukan JSON, gunakan status message
        }
        throw new Error(errorMsg)
      }

      const scanData = await scanRes.json()
      setScanResult(scanData.data)
      setCurrentStep("completed")

      // Notification: Scan success (success - persistent)
      addNotification({
        type: "success",
        title: "Scan Completed",
        message: `Found ${scanData.data?.vulnerabilityCount || 0} vulnerabilities`,
      })
    } catch (err) {
      const errorMessage = String(err)
      setError(errorMessage)
      setCurrentStep("upload")

      // Notification: Error (error - persistent for critical issues)
      addNotification({
        type: "error",
        title: "Scan Failed",
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${inter.className} flex min-h-screen flex-col bg-[#f7f9fb]`}>
      <Navbar activePage="upload" />

      <main className="flex flex-grow flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10 text-center">
            <h1 className={`${manrope.className} mb-3 text-4xl font-extrabold tracking-tight text-[#2a3439]`}>
              Initialize Analysis
            </h1>
            <p className="font-medium text-[#566166]">
              Securely upload your source code for deep-learning vulnerability scanning.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg bg-white p-10 shadow-[0_32px_64px_rgba(42,52,57,0.08)]">
            <div className="mb-8">
              <label className="mb-2 block px-1 text-[10px] font-extrabold uppercase tracking-widest text-[#566166]">
                Active Project
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#566166]">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <button
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="w-full appearance-none rounded-[1rem] border-none bg-[#f0f4f7] py-4 pl-12 pr-10 font-semibold text-[#2a3439] transition-all hover:bg-[#e8eff3] focus:ring-2 focus:ring-[#0053db]/20 text-left flex items-center justify-between"
                >
                  <span>{getSelectedProjectDisplayName()}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      showProjectDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showProjectDropdown && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-outline-variant rounded-lg shadow-lg z-10">
                    {/* Default option: Upload without Project */}
                    <button
                      onClick={() => {
                        setSelectedProject("upload-without-project")
                        setShowProjectDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#f0f4f7] transition-colors border-b border-outline-variant/50 flex items-center gap-3 ${
                        selectedProject === "upload-without-project" ? "bg-[#dbe1ff]/20 font-semibold text-[#0053db]" : "text-[#2a3439]"
                      }`}
                    >
                      {selectedProject === "upload-without-project" && <Check className="h-4 w-4 text-[#0053db]" />}
                      <span className="flex-1">Upload without Project</span>
                      <span className="text-xs text-on-surface-variant">(Default)</span>
                    </button>

                    {/* Project options from DB */}
                    {isLoadingProjects ? (
                      <div className="px-4 py-3 text-sm text-on-surface-variant text-center">Loading projects...</div>
                    ) : projects.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                        No projects yet.{" "}
                        <Link href="/projects" className="text-primary hover:underline">
                          Create one
                        </Link>
                      </div>
                    ) : (
                      projects.map((project, index) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project.id)
                            setShowProjectDropdown(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-[#f0f4f7] transition-colors flex items-center gap-3 ${
                            selectedProject === project.id ? "bg-[#dbe1ff]/20 font-semibold text-[#0053db]" : "text-[#2a3439]"
                          } ${index < projects.length - 1 ? "border-b border-outline-variant/50" : ""}`}
                        >
                          {selectedProject === project.id && <Check className="h-4 w-4 text-[#0053db]" />}
                          <div className="flex-1">
                            <div className="font-semibold">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-on-surface-variant">{project.description}</div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {currentStep === "upload" && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="group relative cursor-pointer mb-6"
              >
                <div
                  className={`flex flex-col items-center justify-center gap-0 rounded-lg border-2 border-dashed px-8 py-20 text-center transition-all duration-300 ${
                    isDragActive
                      ? "border-[#0053db] bg-[#dbe1ff]/20"
                      : "border-[#0053db]/20 bg-[#f0f4f7] hover:border-[#0053db]/50 hover:bg-[#d9e4ea]/30"
                  }`}
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#dbe1ff] text-[#0053db] transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                    <Upload className="h-10 w-10" style={{ fill: "currentColor" }} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-[#2a3439]">Drop your files here</h3>
                  <p className="mb-8 max-w-xs text-sm leading-relaxed text-[#566166]">
                    Upload file code Anda dalam format <span className="font-bold">.ZIP, .PHP, atau .JS</span>
                    <br />
                    Maksimal <span className="font-bold">50 MB</span> per file (sesuai requirement sistem)
                  </p>
                  <button
                    onClick={handleBrowseClick}
                    className="rounded-full border border-[#0053db]/10 bg-white px-8 py-3 font-bold text-[#0053db] shadow-sm transition-all duration-300 hover:bg-[#0053db] hover:text-white hover:shadow-md"
                  >
                    Browse Local Files
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.php,.js"
                  onChange={handleInputChange}
                  className="absolute inset-0 opacity-0"
                />
              </div>
            )}

            {file && currentStep === "upload" && (
              <div className="mb-6 rounded-lg bg-[#dbe1ff]/20 p-4 border border-[#0053db]/20">
                <div className="flex items-center gap-3">
                  <CircleCheck className="h-5 w-5 text-[#0053db]" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#2a3439]">{file.name}</p>
                    <p className="text-sm text-[#566166]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rescan hint when navigated from history/detail */}
            {rescanMode && rescanFileName && (
              <div className="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <span className="font-bold">Rescan Mode</span>
                  <span className="text-sm text-on-surface-variant">Preparing to rescan: {rescanFileName}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-6">
              {currentStep === "upload" && (
                <button
                  onClick={handleStartScan}
                  disabled={!file || isLoading}
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#0053db] py-6 text-xl font-extrabold text-white shadow-xl shadow-[#0053db]/20 transition-all hover:bg-[#0048c1] hover:shadow-2xl hover:shadow-[#0053db]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bolt className="h-6 w-6" style={{ fill: "currentColor" }} />
                  Start Analysis Scan
                </button>
              )}

              <div className="space-y-4 pt-4">
                <div className="mb-1 flex items-end justify-between">
                  <div className="flex items-center gap-2">
                    {isLoading && (
                      <div className="animate-spin text-[#0053db]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </div>
                    )}
                    <span className="text-xs font-bold uppercase tracking-wide text-[#0053db]">
                      {isLoading ? "Processing..." : "System Ready"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#566166] opacity-60">
                    {currentStep === "upload" ? "Waiting for input" : currentStep === "scanning" ? "Scanning..." : "Completed"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#d9e4ea]">
                  <div
                    className="h-full bg-[#0053db] transition-all duration-500"
                    style={{
                      width: currentStep === "upload" ? "0%" : currentStep === "scanning" ? "50%" : "100%",
                    }}
                  />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div
                    className={`flex flex-col items-center gap-2 ${currentStep === "upload" || isLoading ? "opacity-100" : "opacity-100"}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        currentStep === "upload" || isLoading
                          ? "border-white bg-[#d5e3fc]"
                          : "border-white bg-[#0053db]"
                      } shadow-sm`}
                    >
                      <Check className={`h-4 w-4 ${currentStep === "upload" ? "text-[#526074]" : "text-white"}`} />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-tighter ${currentStep === "upload" ? "text-[#526074]" : "text-[#0053db]"}`}>
                      Uploading
                    </span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-2 ${currentStep === "scanning" ? "opacity-100" : "opacity-40"}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep === "scanning" ? "bg-[#0053db]" : "bg-[#d9e4ea]"}`}>
                      <Search className={`h-4 w-4 ${currentStep === "scanning" ? "text-white animate-spin" : "text-[#566166]"}`} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-tighter text-[#566166]">Scanning</span>
                  </div>
                  <div
                    className={`flex flex-col items-center gap-2 ${currentStep === "completed" ? "opacity-100" : "opacity-40"}`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep === "completed" ? "bg-[#0053db]" : "bg-[#d9e4ea]"}`}>
                      <CircleCheck className={`h-4 w-4 ${currentStep === "completed" ? "text-white" : "text-[#566166]"}`} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-tighter text-[#566166]">Completed</span>
                  </div>
                </div>
              </div>

              {currentStep === "completed" && scanResult && (
                <div className="mt-8 rounded-lg bg-green-50 border border-green-200 p-6">
                  <h3 className="font-bold text-green-900 mb-4">Scan Results Available</h3>
                  <Link
                    href={`/scan-result/${scanResult.id}`}
                    className="inline-block px-6 py-3 bg-[#0053db] text-white font-bold rounded-full hover:bg-[#0048c1] transition-all"
                  >
                    View Scan Result
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200/10 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-8 py-12 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className={`${manrope.className} font-bold text-slate-900`}>CyberGuard</span>
            <span className="text-sm text-slate-400">© 2024 CyberGuard Editorial. All rights reserved.</span>
          </div>
          <div className="flex gap-8">
            <a className="text-sm text-slate-400 underline underline-offset-4 transition-opacity hover:text-[#0053db]" href="#">
              Documentation
            </a>
            <a className="text-sm text-slate-400 underline underline-offset-4 transition-opacity hover:text-[#0053db]" href="#">
              Privacy Policy
            </a>
            <a className="text-sm text-slate-400 underline underline-offset-4 transition-opacity hover:text-[#0053db]" href="#">
              Security Hub
            </a>
            <a className="text-sm text-slate-400 underline underline-offset-4 transition-opacity hover:text-[#0053db]" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
