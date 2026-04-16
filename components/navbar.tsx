"use client"

import { Manrope } from "next/font/google"
import Link from "next/link"
import { Bell, UserRound, LogOut, Edit, Check, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useNotification } from "@/lib/notificationContext"

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

interface NavbarProps {
  activePage?: "dashboard" | "projects" | "upload" | "scan-result" | "profile"
}

export function Navbar({ activePage = "dashboard" }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, clearNotification, clearAllNotifications } = useNotification()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓"
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      default:
        return "ℹ"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      default:
        return "text-blue-600"
    }
  }

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
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative rounded-full p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9]"
            >
              <Bell className="h-[22px] w-[22px]" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#e11d48]" />
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-[#e2e8f0] rounded-lg shadow-xl overflow-hidden z-50">
                {/* Header */}
                <div className="border-b border-[#e2e8f0] px-4 py-3 flex items-center justify-between bg-[#f9fafb]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0f172a]">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-[#64748b]">{unreadCount} unread</p>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs font-medium text-[#e11d48] hover:text-[#c41e3a] transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-[#64748b]">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`border-b border-[#e2e8f0] px-4 py-3 hover:bg-[#f9fafb] transition-colors ${
                          !notif.read ? "bg-[#f0f7ff]" : ""
                        }`}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${getNotificationColor(notif.type)}`}
                          >
                            <span className={`text-sm font-bold ${getNotificationIconColor(notif.type)}`}>
                              {getNotificationIcon(notif.type)}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-[#0f172a]">{notif.title}</p>
                                <p className="text-xs text-[#64748b] line-clamp-2 mt-1">{notif.message}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  clearNotification(notif.id)
                                }}
                                className="text-[#94a3b8] hover:text-[#e11d48] transition-colors flex-shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-[#94a3b8] mt-2">
                              {typeof notif.timestamp === "string"
                                ? new Date(notif.timestamp).toLocaleTimeString()
                                : notif.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
