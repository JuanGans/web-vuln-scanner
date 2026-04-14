import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";

type ResponseData = {
  success?: boolean;
  data?: Record<string, unknown>[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({
      error: "Gagal mengambil history: " + String(error),
    });
  }
}
