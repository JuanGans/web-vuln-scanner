import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";

type ResponseData = {
  success?: boolean;
  data?: Record<string, unknown>[] | Record<string, unknown>;
  error?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    try {
      const data = await prisma.scanResult.findMany({
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Limit 100 results
      });

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("History fetch error:", error);
      return res.status(500).json({
        error: "Gagal mengambil history: " + String(error),
      });
    }
  }

  if (req.method === "DELETE") {
    const id = typeof req.query.id === "string" ? req.query.id : undefined;

    if (!id) {
      return res.status(400).json({
        error: "Parameter id diperlukan",
      });
    }

    try {
      const deleted = await prisma.scanResult.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Scan berhasil dihapus",
        data: { id: deleted.id },
      });
    } catch (error) {
      console.error("History delete error:", error);
      return res.status(500).json({
        error: "Gagal menghapus scan: " + String(error),
      });
    }
  }

  if (req.method !== "GET" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
