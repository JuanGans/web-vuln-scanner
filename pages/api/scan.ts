import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";
import path from "path";
import fs from "fs";
import { extractZip, cleanupFolder } from "@/lib/extract";
import { runScannerWithFallback } from "@/lib/scanner";

type ResponseData = {
  success?: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const extractPath = path.join(process.cwd(), "uploads", "extracted");
  let scanDirPath = extractPath; // Default untuk ZIP files

  try {
    const { filePath, fileName, fileType } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "File path diperlukan" });
    }

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    // Handle berdasarkan file type sesuai FR-02 requirement (zip, php, js)
    if (fileType === "zip") {
      // Untuk .zip: extract dulu, scan folder yang sudah di-extract
      console.log(`Extracting ZIP file: ${filePath}`);
      extractZip(filePath, extractPath);
      scanDirPath = extractPath;
    } else if (fileType === "php" || fileType === "js") {
      // Untuk .php atau .js: buat folder temporary, copy file ke sana, scan folder tersebut
      const tempScanDir = path.join(extractPath, `single_${Date.now()}`);
      if (!fs.existsSync(tempScanDir)) {
        fs.mkdirSync(tempScanDir, { recursive: true });
      }
      const destPath = path.join(tempScanDir, path.basename(filePath));
      fs.copyFileSync(filePath, destPath);
      scanDirPath = tempScanDir;
      console.log(`Copied ${fileType.toUpperCase()} file to: ${scanDirPath}`);
    } else {
      return res.status(400).json({ 
        error: `Tipe file tidak didukung. Gunakan .zip, .php, atau .js sesuai requirement FR-02` 
      });
    }

    // Run scanner pada folder yang sudah disiapkan
    console.log(`Running scanner on: ${scanDirPath}`);
    const scanResult = await runScannerWithFallback(scanDirPath);

    // Save result ke database
    const dbResult = await prisma.scanResult.create({
      data: {
        fileName: fileName || path.basename(filePath),
        result: scanResult as any,
      },
    });

    // Return result
    res.status(200).json({
      success: true,
      data: {
        id: dbResult.id,
        fileName: dbResult.fileName,
        result: scanResult,
        createdAt: dbResult.createdAt,
      },
    });

    // Cleanup extracted folder
    setTimeout(() => {
      cleanupFolder(extractPath);
      // Delete uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 1000);
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({
      error: "Scan gagal: " + String(error),
    });
  }
}
