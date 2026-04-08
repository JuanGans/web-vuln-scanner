import AdmZip from "adm-zip";
import fs from "fs";

export const extractZip = (filePath: string, outputPath: string) => {
  try {
    // Buat folder output jika belum ada
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const zip = new AdmZip(filePath);
    zip.extractAllTo(outputPath, true);

    return true;
  } catch (error) {
    console.error("Error extracting ZIP:", error);
    throw error;
  }
};

// Utility function untuk membersihkan folder
export const cleanupFolder = (folderPath: string) => {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Error cleaning up folder:", error);
  }
};
