import { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const projects = await prisma.project.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      })

      return res.status(200).json({
        success: true,
        data: projects,
      })
    } catch (error) {
      console.error("Error fetching projects:", error)
      return res.status(500).json({
        success: false,
        error: "Failed to fetch projects",
      })
    }
  }

  if (req.method === "POST") {
    try {
      const { name, description } = req.body

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Project name is required",
        })
      }

      const project = await prisma.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          status: "ACTIVE",
        },
      })

      return res.status(201).json({
        success: true,
        data: project,
      })
    } catch (error) {
      console.error("Error creating project:", error)
      return res.status(500).json({
        success: false,
        error: "Failed to create project",
      })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
