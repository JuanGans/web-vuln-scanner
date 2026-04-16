/**
 * Notification events/messages untuk berbagai actions
 */

export const notificationMessages = {
  // Login/Auth
  LOGIN_SUCCESS: {
    title: "Welcome Back!",
    message: "You have successfully logged in",
    type: "success" as const,
  },
  LOGOUT_SUCCESS: {
    title: "Logged Out",
    message: "You have been logged out",
    type: "success" as const,
  },
  REGISTER_SUCCESS: {
    title: "Account Created",
    message: "Your account has been successfully created",
    type: "success" as const,
  },

  // Upload
  UPLOAD_START: {
    title: "Upload Starting",
    message: "Your file is being uploaded...",
    type: "info" as const,
  },
  UPLOAD_SUCCESS: {
    title: "Upload Successful",
    message: "Your file has been uploaded and is ready for scanning",
    type: "success" as const,
  },
  UPLOAD_ERROR: {
    title: "Upload Failed",
    message: "Failed to upload your file. Please try again",
    type: "error" as const,
  },

  // Scanning
  SCAN_START: {
    title: "Scan Starting",
    message: "Security scan has been initiated",
    type: "info" as const,
  },
  SCAN_SUCCESS: {
    title: "Scan Completed",
    message: "Security scan has been completed successfully",
    type: "success" as const,
  },
  SCAN_ERROR: {
    title: "Scan Failed",
    message: "An error occurred during the scan",
    type: "error" as const,
  },

  // Projects
  PROJECT_CREATED: {
    title: "Project Created",
    message: "New project has been created successfully",
    type: "success" as const,
  },
  PROJECT_UPDATED: {
    title: "Project Updated",
    message: "Project has been updated successfully",
    type: "success" as const,
  },
  PROJECT_DELETED: {
    title: "Project Deleted",
    message: "Project has been deleted",
    type: "success" as const,
  },

  // Profile
  PROFILE_UPDATED: {
    title: "Profile Updated",
    message: "Your profile has been updated successfully",
    type: "success" as const,
  },
  PASSWORD_CHANGED: {
    title: "Password Changed",
    message: "Your password has been changed successfully",
    type: "success" as const,
  },

  // Errors
  ERROR_GENERIC: {
    title: "Error",
    message: "An error occurred. Please try again",
    type: "error" as const,
  },
  NETWORK_ERROR: {
    title: "Network Error",
    message: "Failed to connect to server",
    type: "error" as const,
  },

  // Warnings
  SESSION_EXPIRING: {
    title: "Session Expiring Soon",
    message: "Your session will expire soon. Please refresh the page",
    type: "warning" as const,
  },
}
