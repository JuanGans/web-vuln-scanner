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

  if (req.method === "PUT") {
    try {
      const { id, name, description } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Project ID is required",
        })
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Project name is required",
        })
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
        },
      })

      return res.status(200).json({
        success: true,
        data: project,
      })
    } catch (error: any) {
      console.error("Error updating project:", error)
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        })
      }
      return res.status(500).json({
        success: false,
        error: "Failed to update project",
      })
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Project ID is required",
        })
      }

      await prisma.project.update({
        where: { id: id as string },
        data: { status: "DELETED" },
      })

      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting project:", error)
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        })
      }
      return res.status(500).json({
        success: false,
        error: "Failed to delete project",
      })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
