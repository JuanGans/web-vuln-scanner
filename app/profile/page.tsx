"use client"

import { Navbar } from "@/components/navbar"
import { Manrope } from "next/font/google"
import { Edit, LogOut, Mail, Check, X } from "lucide-react"
import { useState } from "react"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "700", "800"] })

export default function ProfilePage() {
  const [bioAuth, setBioAuth] = useState(true)
  const [loginNotif, setLoginNotif] = useState(true)
  const [encryptExport, setEncryptExport] = useState(false)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [vulnSummary, setVulnSummary] = useState(true)
  const [marketingReports, setMarketingReports] = useState(false)
  const [theme, setTheme] = useState("light")

  return (
    <div className="min-h-screen bg-white text-on-surface flex flex-col">
      <Navbar activePage="profile" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-8 py-16">
        {/* Page Title Header */}
        <header className="mb-12">
          <h1 className={`${manrope.className} text-5xl font-extrabold tracking-tight text-on-surface mb-2`}>
            Account Curator
          </h1>
          <p className="text-on-surface-variant font-medium text-lg">
            Manage your digital identity and security parameters.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Identity & Vital Stats */}
          <aside className="lg:col-span-4 space-y-8">
            {/* User Identity Card */}
            <div className="bg-surface-container-lowest p-8 rounded-lg border border-outline-variant/10 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <img
                      alt="Profile picture"
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjD7osCnju1ze7NED2ak_DcbtUQPjE_VnP0eEZx2gy4rt2qqEri7ILMKlZlNpt-YdWer4njwwWIQNrR1R1og2gfF-3OdOUeLmH5g8NSdSnw8v7-45HdLskiQdjwoTB0t-zyAK-ff24RcPhQu_PjKT7Rblglt1FlhphenHRIag3LAa6vARENHaAA7G4GmDcjqBGOxVv-g-5iEoGkzh7Z_j6ASCgrkVV4TklV2SrEH238_O1CaLNpUt94Gw-3BIaxwGIsg30528jd-o"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-primary hover:text-primary-dim transition-colors">
                      📷
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface">Alex Mercer</h2>
                  <p className="text-on-surface-variant font-medium text-sm mb-6 uppercase tracking-wider">Lead Security Architect</p>
                  <div className="w-full space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-on-surface-variant bg-surface-container-low/50 py-3 px-4 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">a.mercer@cyberguard.tech</span>
                    </div>
                    <div className="flex items-center gap-3 text-on-surface-variant bg-surface-container-low/50 py-3 px-4 rounded-lg">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">Verified Administrator</span>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-3">
                    <button className="bg-primary text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="bg-transparent text-on-surface-variant font-bold py-3 px-4 rounded-full border border-outline-variant hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 text-sm">
                      <LogOut className="w-4 h-4" />
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Quick Glance */}
            <div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
                🛡️ Security Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-sm font-semibold">2FA Enabled</span>
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary-container px-2 py-0.5 rounded-full uppercase">
                    Secure
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-white/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
                      ⏱️
                    </div>
                    <span className="text-sm font-semibold">Password</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">124d ago</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Settings & Controls */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section: Security Protocol */}
            <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container/30 rounded-full flex items-center justify-center">
                    🔒
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Security Protocol</h3>
                </div>
              </div>
              <div className="space-y-1">
                {/* Biometric Authentication */}
                <div className="group flex items-center justify-between p-5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Biometric Authentication</span>
                    <span className="text-sm text-on-surface-variant">FaceID or Fingerprint instant access</span>
                  </div>
                  <button
                    onClick={() => setBioAuth(!bioAuth)}
                    className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-all ${
                      bioAuth ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${bioAuth ? "translate-x-6" : ""}`}
                    ></div>
                  </button>
                </div>

                {/* Login Notifications */}
                <div className="group flex items-center justify-between p-5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Login Notifications</span>
                    <span className="text-sm text-on-surface-variant">Alert on new browser sessions</span>
                  </div>
                  <button
                    onClick={() => setLoginNotif(!loginNotif)}
                    className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-all ${
                      loginNotif ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${loginNotif ? "translate-x-6" : ""}`}
                    ></div>
                  </button>
                </div>

                {/* Encrypted Data Exports */}
                <div className="group flex items-center justify-between p-5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Encrypted Data Exports</span>
                    <span className="text-sm text-on-surface-variant">AES-256 wrapping for reports</span>
                  </div>
                  <button
                    onClick={() => setEncryptExport(!encryptExport)}
                    className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-all ${
                      encryptExport ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${encryptExport ? "translate-x-6" : ""}`}
                    ></div>
                  </button>
                </div>
              </div>
            </section>

            {/* Section: Communication & Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Dispatch Center */}
              <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm">
                <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                  📧 Dispatch Center
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={criticalAlerts}
                      onChange={(e) => setCriticalAlerts(e.target.checked)}
                      className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary/20 transition-all"
                      type="checkbox"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      Critical Alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={vulnSummary}
                      onChange={(e) => setVulnSummary(e.target.checked)}
                      className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary/20 transition-all"
                      type="checkbox"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      Vulnerability Summary
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      checked={marketingReports}
                      onChange={(e) => setMarketingReports(e.target.checked)}
                      className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary/20 transition-all"
                      type="checkbox"
                    />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      Marketing Reports
                    </span>
                  </label>
                </div>
              </section>

              {/* Interface Engine */}
              <section className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10">
                <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                  🎨 Interface Engine
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`border-2 p-4 rounded-lg flex flex-col items-center gap-2 group transition-all shadow-sm ${
                      theme === "light"
                        ? "bg-white border-primary"
                        : "bg-surface-container-highest/30 border-transparent hover:bg-white/50"
                    }`}
                  >
                    <span className="text-2xl">☀️</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Luminescent</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`border-2 p-4 rounded-lg flex flex-col items-center gap-2 group transition-all ${
                      theme === "dark"
                        ? "bg-surface-container-highest border-secondary"
                        : "border-transparent hover:bg-surface-container-highest/50"
                    }`}
                  >
                    <span className="text-2xl">🌙</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Obscure</span>
                  </button>
                </div>
              </section>
            </div>

            {/* Section: Active Curator Sessions */}
            <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  Active Curator Sessions
                </h3>
                <button className="text-xs font-bold text-primary hover:underline">Revoke All</button>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {/* Session 1 */}
                <div className="flex items-center justify-between py-5 group">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center">
                      💻
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">
                        MacBook Pro 16&quot;
                        <span className="text-primary font-normal text-xs ml-2 bg-primary-container px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      </p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">London, UK • Chrome 124.0</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-error transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Session 2 */}
                <div className="flex items-center justify-between py-5 group">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">iPhone 15 Pro</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        London, UK • App v4.2.1 • 2h ago
                      </p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-error transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 w-full py-12 px-8 border-t border-slate-200/10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className={`${manrope.className} font-bold text-slate-900 text-xl`}>CyberGuard</span>
            <p className="text-slate-400 mt-2 text-sm tracking-normal">
              © 2024 CyberGuard Editorial. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            <a className="text-slate-400 hover:text-primary underline underline-offset-4 text-sm transition-opacity duration-300" href="#">
              Documentation
            </a>
            <a className="text-slate-400 hover:text-primary underline underline-offset-4 text-sm transition-opacity duration-300" href="#">
              Privacy Policy
            </a>
            <a className="text-slate-400 hover:text-primary underline underline-offset-4 text-sm transition-opacity duration-300" href="#">
              Security Hub
            </a>
            <a className="text-slate-400 hover:text-primary underline underline-offset-4 text-sm transition-opacity duration-300" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
