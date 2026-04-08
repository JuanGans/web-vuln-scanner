// Contoh integrasi di Frontend React/Next.js

// 1️⃣ Upload File ke Server
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload gagal");
  }

  const data = await response.json();
  return data.filePath;
};

// 2️⃣ Scan File yang Sudah Di-Upload
const scanFile = async (filePath: string, fileName: string) => {
  const response = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filePath,
      fileName,
    }),
  });

  if (!response.ok) {
    throw new Error("Scan gagal");
  }

  return await response.json();
};

// 3️⃣ Ambil History Scan
const getHistory = async () => {
  const response = await fetch("/api/history");

  if (!response.ok) {
    throw new Error("Gagal ambil history");
  }

  return await response.json();
};

// ⚙️ Full Workflow Example
export const handleUploadAndScan = async (file: File) => {
  try {
    console.log("📤 Uploading file...");
    const filePath = await uploadFile(file);

    console.log("🔍 Scanning file...");
    const scanResult = await scanFile(filePath, file.name);

    console.log("✅ Scan complete:", scanResult);
    return scanResult;
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
};
