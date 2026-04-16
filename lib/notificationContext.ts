"use client"

import { createContext, useContext, useState, useCallback, ReactNode, createElement, useEffect } from "react"

export interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: Date | string
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = "notifications_storage"

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isClient, setIsClient] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setNotifications(parsed)
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage:", error)
    }
  }, [])

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
      } catch (error) {
        console.error("Failed to save notifications to localStorage:", error)
      }
    }
  }, [notifications, isClient])

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50))

      // Auto-delete info notifications after 5 seconds (progress/status updates)
      if (notification.type === "info") {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, 5000)
      }
    },
    []
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearNotification,
    clearAllNotifications,
  }

  return createElement(NotificationContext.Provider, { value }, children)
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}
