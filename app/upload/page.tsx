"use client"

import { Inter, Manrope } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Bolt, Check, ChevronDown, CircleCheck, FolderOpen, Search, Upload } from "lucide-react"
import { useRef, useState } from "react"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] })
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedProject, setSelectedProject] = useState("Main Infrastructure Core")
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`${inter.className} flex min-h-screen flex-col bg-[#f7f9fb]`}>
      <Navbar activePage="upload" />

      {/* Main Content */}
      <main className="flex flex-grow flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className={`${manrope.className} mb-3 text-4xl font-extrabold tracking-tight text-[#2a3439]`}>
              Initialize Analysis
            </h1>
            <p className="font-medium text-[#566166]">
              Securely upload your source code for deep-learning vulnerability scanning.
            </p>
          </div>

          {/* Upload Card */}
          <div className="relative overflow-hidden rounded-lg bg-white p-10 shadow-[0_32px_64px_rgba(42,52,57,0.08)]">
            {/* Project Selector Dropdown */}
            <div className="mb-8">
              <label className="mb-2 block px-1 text-[10px] font-extrabold uppercase tracking-widest text-[#566166]">
                Active Project
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#566166]">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full appearance-none rounded-[1rem] border-none bg-[#f0f4f7] py-4 pl-12 pr-10 font-semibold text-[#2a3439] transition-all hover:bg-[#e8eff3] focus:ring-2 focus:ring-[#0053db]/20"
                >
                  <option>Main Infrastructure Core</option>
                  <option>Customer Portal API</option>
                  <option>Legacy Authentication Service</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-colors group-hover:text-[#0053db]">
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              className="group relative cursor-pointer"
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
                  Securely upload ZIP, PHP, or JS archives.
                  <br />
                  Maximum file size allowed: <span className="font-bold">500MB</span>
                </p>
                <button
                  onClick={handleBrowseClick}
                  className="rounded-full border border-[#0053db]/10 bg-white px-8 py-3 font-bold text-[#0053db] shadow-sm transition-all duration-300 hover:bg-[#0053db] hover:text-white hover:shadow-md"
                >
                  Browse Local Files
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple className="absolute inset-0 opacity-0" />
            </div>

            {/* Primary Action */}
            <div className="mt-8 flex flex-col gap-6">
              <button className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#0053db] py-6 text-xl font-extrabold text-white shadow-xl shadow-[#0053db]/20 transition-all hover:bg-[#0048c1] hover:shadow-2xl hover:shadow-[#0053db]/30 active:scale-95">
                <Bolt className="h-6 w-6" style={{ fill: "currentColor" }} />
                Start Analysis Scan
              </button>

              {/* Status Indicator */}
              <div className="space-y-4 pt-4">
                <div className="mb-1 flex items-end justify-between">
                  <div className="flex items-center gap-2">
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
                    <span className="text-xs font-bold uppercase tracking-wide text-[#0053db]">System Ready</span>
                  </div>
                  <span className="text-xs font-bold text-[#566166] opacity-60">Waiting for input</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#d9e4ea]">
                  <div className="h-full w-0 bg-[#0053db] transition-all duration-500" />
                </div>

                {/* Mini Checklist */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2 opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#d5e3fc] shadow-sm">
                      <Check className="h-4 w-4 text-[#526074]" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-tighter text-[#526074]">Uploading</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9e4ea]">
                      <Search className="h-4 w-4 text-[#566166]" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-tighter">Scanning</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9e4ea]">
                      <CircleCheck className="h-4 w-4 text-[#566166]" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-tighter">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
