/**
 * HYBRID SAST RULESET
 * Sesuai dengan Bab 2.6 Skripsi: Mesin Inti Sistem Deteksi
 * Rule-Based Static Taint Analysis dengan sources, sinks, dan sanitizers
 */

export interface Rule {
  id: string;
  name: string;
  type: "SQLInjection" | "XSS";
  severity: "Kritis" | "Tinggi" | "Sedang" | "Rendah";
  description: string;
  sources: string[];
  sinks: string[];
  sanitizers: string[];
  remediation: string;
  codeExample: {
    vulnerable: string;
    safe: string;
  };
}

/**
 * LAYER 1: Regex Patterns untuk Lexical Analysis
 * Deteksi cepat pola mencurigakan di level token
 */
export const REGEX_PATTERNS = {
  // SQLInjection patterns
  sqlInjection: {
    // mysqli_query dengan variable
    mysqlQuery: /mysqli_query\s*\([^;]*?[\.\s"']\s*\$[a-zA-Z_]\w*/gi,
    // pg_query dengan variable
    postgresQuery: /pg_query\s*\([^;]*\$[a-zA-Z_]\w*/gi,
    // Direct query dengan concatenation
    queryConcat: /(SELECT|INSERT|UPDATE|DELETE|DROP|FROM|WHERE)[^;]*\$[a-zA-Z_]\w*/gi,
    // mysql_query() dengan variable
    mysqlQueryOld: /mysql_query\s*\([^;]*\$[a-zA-Z_]\w*/gi,
    // query() dengan variable
    query: /->?\s*query\s*\([^;]*\$[a-zA-Z_]\w*/gi,
  },
  
  // XSS patterns
  xss: {
    // Variables dalam HTML string: "{$var}" atau '{$var}'
    htmlVarInterpolation: /["']\s*\.\s*\$[a-zA-Z_]\w*|["'](.*?)\{\$[a-zA-Z_]\w*\}(.*?)["']/gi,
    // echo $variable tanpa htmlspecialchars
    echo: /(echo|print|printf|var_dump)\s+\$[a-zA-Z_]\w*/gi,
    // Variable directly in HTML string: "<h1>{$var}</h1>"
    htmlVarSyntax: /[<"']\s*\{?\$[a-zA-Z_]\w*\}?[>"']/gi,
    // innerHTML assignment dengan variable
    innerHTML: /\.innerHTML\s*=\s*[^;]*\$[a-zA-Z_]\w*/gi,
    // Direct output: <h1><?php echo $var ?></h1>
    phpOutput: /<\?php\s*(echo|print)\s+\$[a-zA-Z_]\w*/gi,
    // res.send, res.json dengan variable
    responseOutput: /(res\.|response\.)(send|json|write)\s*\([^;]*\$[a-zA-Z_]\w*/gi,
  },
};

/**
 * LAYER 3: Taint Analysis Rules
 * Define sources, sinks, dan sanitizers untuk tracking data flow
 */
export const TAINT_RULES: Rule[] = [
  // SQL Injection Rules
  {
    id: "sqli-php-001",
    name: "SQL Injection via mysqli_query",
    type: "SQLInjection",
    severity: "Kritis",
    description: "User input langsung digunakan dalam query database tanpa sanitasi",
    sources: ["$_GET", "$_POST", "$_REQUEST", "$_COOKIE", "request.args"],
    sinks: ["mysqli_query", "pg_query", "query", "execute"],
    sanitizers: [
      "mysqli_real_escape_string",
      "mysqli_escape_string",
      "prepared_statement",
      "prepared statement with ?",
      "parameterized query",
      "intval",
      "floatval",
      "PDO::prepare",
    ],
    remediation:
      "Gunakan prepared statement dengan placeholder (?) atau parameterized query alih-alih string concatenation",
    codeExample: {
      vulnerable: `$id = $_GET['id'];
$sql = "SELECT * FROM users WHERE id = " . $id;
$result = mysqli_query($conn, $sql);`,
      safe: `$id = $_GET['id'];
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();`,
    },
  },

  {
    id: "sqli-php-002",
    name: "SQL Injection via mysql_query (deprecated)",
    type: "SQLInjection",
    severity: "Kritis",
    description: "Fungsi mysql_query deprecated dan rentan SQLi",
    sources: ["$_GET", "$_POST", "$_REQUEST"],
    sinks: ["mysql_query"],
    sanitizers: ["mysql_real_escape_string", "prepared_statement"],
    remediation: "Gunakan mysqli atau PDO dengan prepared statement",
    codeExample: {
      vulnerable: `$query = "SELECT * FROM users WHERE user_id = " . $_GET['id'];
$result = mysql_query($query);`,
      safe: `$id = intval($_GET['id']);
$stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();`,
    },
  },

  // XSS Rules
  {
    id: "xss-php-001",
    name: "Reflected XSS via echo",
    type: "XSS",
    severity: "Tinggi",
    description: "User input ditampilkan ke HTML tanpa escaping",
    sources: ["$_GET", "$_POST", "$_REQUEST", "request.args"],
    sinks: ["echo", "print", "printf", "var_dump", "response.write"],
    sanitizers: ["htmlspecialchars", "htmlentities", "strip_tags", "DOMPurify.sanitize"],
    remediation: "Gunakan htmlspecialchars() untuk escape HTML special characters",
    codeExample: {
      vulnerable: `<h1><?php echo $_GET['username']; ?></h1>`,
      safe: `<h1><?php echo htmlspecialchars($_GET['username'], ENT_QUOTES, 'UTF-8'); ?></h1>`,
    },
  },

  {
    id: "xss-js-001",
    name: "DOM-based XSS via innerHTML",
    type: "XSS",
    severity: "Tinggi",
    description: "User input ditetapkan ke innerHTML tanpa sanitasi",
    sources: ["location.search", "document.location", "window.name", "request.args"],
    sinks: ["innerHTML", "insertAdjacentHTML", "document.write"],
    sanitizers: ["DOMPurify.sanitize", "textContent", "createElement"],
    remediation: "Gunakan textContent atau DOMPurify library untuk sanitasi",
    codeExample: {
      vulnerable: `const name = new URLSearchParams(location.search).get('name');
document.getElementById('greeting').innerHTML = 'Hello, ' + name;`,
      safe: `const name = new URLSearchParams(location.search).get('name');
const div = document.getElementById('greeting');
div.textContent = 'Hello, ';
div.appendChild(document.createTextNode(name));`,
    },
  },

  {
    id: "xss-js-002",
    name: "Reflected XSS via eval()",
    type: "XSS",
    severity: "Kritis",
    description: "User input di-evaluate sebagai JavaScript code",
    sources: ["location.search", "request.args"],
    sinks: ["eval", "Function", "setTimeout", "setInterval"],
    sanitizers: ["JSON.parse", "JSON.stringify"],
    remediation: "Jangan gunakan eval() atau Function(). Gunakan JSON.parse() jika diperlukan",
    codeExample: {
      vulnerable: `const userCode = new URLSearchParams(location.search).get('code');
eval(userCode);`,
      safe: `const userData = new URLSearchParams(location.search).get('data');
const parsed = JSON.parse(userData); // Parsing aman untuk JSON saja`,
    },
  },
];

/**
 * Helper: Get rule by type
 */
export const getRulesByType = (type: "SQLInjection" | "XSS"): Rule[] => {
  return TAINT_RULES.filter((rule) => rule.type === type);
};

/**
 * Helper: Check if function is a source
 */
export const isSource = (functionName: string): boolean => {
  const sources = [
    "$_GET",
    "$_POST",
    "$_REQUEST",
    "$_COOKIE",
    "$_SERVER",
    "request.args",
    "request.form",
    "location.search",
    "document.location",
  ];
  return sources.some((src) => functionName.includes(src));
};

/**
 * Helper: Find matching rule for sink
 */
export const findRuleForSink = (sink: string, type: "SQLInjection" | "XSS"): Rule | undefined => {
  return TAINT_RULES.find((rule) => rule.type === type && rule.sinks.some((s) => sink.includes(s)));
};

/**
 * Helper: Check if sanitizer covers the vulnerability
 */
export const hasSanitizer = (rule: Rule, path: string): boolean => {
  return rule.sanitizers.some((sanitizer) => path.includes(sanitizer));
};
