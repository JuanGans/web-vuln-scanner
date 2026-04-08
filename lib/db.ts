import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  // In development, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient()
  }

  prisma = globalWithPrisma.prisma
}

export default prisma
