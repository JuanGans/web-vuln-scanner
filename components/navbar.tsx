"use client"

import { Manrope } from "next/font/google"
import Link from "next/link"
import { Bell, Search, UserRound, LogOut, Edit } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

interface NavbarProps {
  activePage?: "dashboard" | "projects" | "upload" | "scan-result" | "profile"
}

export function Navbar({ activePage = "dashboard" }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navItems = [
    { label: "Dashboard", href: "/dashboard", key: "dashboard" },
    { label: "Projects", href: "/projects", key: "projects" },
    { label: "Upload", href: "/upload", key: "upload" },
    { label: "Scan Result", href: "/scan-result", key: "scan-result" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e8f0]/80 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <span className={`${manrope.className} text-xl font-extrabold tracking-tight text-[#0052cc]`}>
            CyberGuard
          </span>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activePage === item.key
                    ? "bg-[#0052cc]/5 font-semibold text-[#0052cc]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9]">
            <Search className="h-[22px] w-[22px]" />
          </button>
          <button className="relative rounded-full p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9]">
            <Bell className="h-[22px] w-[22px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#e11d48]" />
          </button>
          <div className="mx-2 h-6 w-px bg-[#e2e8f0]" />
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-1 transition-all hover:opacity-80"
            >
              <div className="mr-1 hidden flex-col items-end sm:flex">
                <span className="text-xs font-bold leading-none">Alex Rivera</span>
                <span className="text-[10px] font-medium leading-tight text-[#64748b]">Security Architect</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] ring-2 ring-[#f1f5f9] transition-all hover:ring-[#0052cc]/20">
                <UserRound className="h-4 w-4 text-[#334155]" />
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e2e8f0] rounded-lg shadow-lg overflow-hidden z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#f1f5f9] transition-colors border-b border-[#e2e8f0]"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Edit className="w-4 h-4 text-[#0052cc]" />
                  Edit Profile
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#f1f5f9] transition-colors text-left">
                  <LogOut className="w-4 h-4 text-[#e11d48]" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
