/**
 * Client-side API helper dengan automatic notification
 * Gunakan ini di pages/components untuk API calls
 */

import { useNotification } from "@/lib/notificationContext"
import { notificationMessages } from "@/lib/notificationMessages"

type NotificationKey = keyof typeof notificationMessages

export function useApiWithNotification() {
  const { addNotification } = useNotification()

  /**
   * Fetch wrapper yang automatically trigger notifications
   * @param url - API endpoint
   * @param options - Fetch options
   * @param notificationKey - Key dari notificationMessages atau custom notification
   * @returns Response JSON
   */
  const apiCall = async (
    url: string,
    options: RequestInit & { notificationOn?: { success?: NotificationKey; error?: NotificationKey } } = {},
    notificationOn: { success?: NotificationKey; error?: NotificationKey } = {}
  ) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Error notification
        if (notificationOn.error) {
          const errorMsg = notificationMessages[notificationOn.error]
          addNotification(errorMsg)
        } else {
          addNotification({
            type: "error",
            title: "Error",
            message: data.error || "An error occurred",
          })
        }
        throw new Error(data.error || "API call failed")
      }

      // Success notification
      if (notificationOn.success) {
        const successMsg = notificationMessages[notificationOn.success]
        addNotification(successMsg)
      }

      return data
    } catch (error) {
      // Network error
      addNotification({
        type: "error",
        title: "Network Error",
        message: error instanceof Error ? error.message : "Failed to connect to server",
      })
      throw error
    }
  }

  return { apiCall, addNotification }
}
