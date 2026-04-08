import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser untuk handling file upload
  },
};

type ResponseData = {
  success?: boolean;
  filePath?: string;
  fileName?: string;
  fileType?: string;
  error?: string;
};

// Supported file types sesuai requirement skripsi FR-02: .zip, .php, .js
const SUPPORTED_EXTENSIONS = [".zip", ".php", ".js"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB sesuai requirement skripsi 1.3

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Buat folder uploads jika belum ada
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        if (err.message.includes("File size exceeds")) {
          return res.status(413).json({ 
            error: `File terlalu besar. Maksimal 50MB sesuai requirement sistem.` 
          });
        }
        return res.status(500).json({ error: "Upload gagal: " + err.message });
      }

      if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
        return res.status(400).json({ error: "File tidak ditemukan" });
      }

      const uploadedFile = files.file[0];
      const filePath = uploadedFile.filepath;
      const originalFileName = uploadedFile.originalFilename || "";
      const fileExtension = path.extname(originalFileName).toLowerCase();
      
      // Validasi extension sesuai FR-02: .zip, .php, .js
      if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
        // Delete file jika extension tidak support
        fs.unlinkSync(filePath);
        return res.status(400).json({ 
          error: `Format file tidak didukung. Gunakan: ${SUPPORTED_EXTENSIONS.join(", ")}` 
        });
      }

      // Validasi file size (double check)
      const fileStats = fs.statSync(filePath);
      if (fileStats.size > MAX_FILE_SIZE) {
        fs.unlinkSync(filePath);
        return res.status(413).json({ 
          error: `File terlalu besar. Maksimal 50MB sesuai requirement sistem.` 
        });
      }

      res.status(200).json({
        success: true,
        filePath: filePath,
        fileName: originalFileName,
        fileType: fileExtension.substring(1), // Remove dot: .zip -> zip
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload gagal: " + String(error) });
  }
}
