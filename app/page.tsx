"use client"

import Link from "next/link"
import { Inter, Manrope } from "next/font/google"
import { useEffect } from "react"
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bug,
  Check,
  ChevronDown,
  Database,
  Github,
  LayoutDashboard,
  ScanSearch,
  Shield,
  Terminal,
  Wrench,
} from "lucide-react"

const inter = Inter({ subsets: ["latin"] })
const manrope = Manrope({ subsets: ["latin"], weight: ["500", "700", "800"] })

type Feature = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tags?: string[]
}

const features: Feature[] = [
  {
    title: "DeepScan Engine",
    description:
      "Advanced Multi-Engine Detection that combines high-speed Regex pattern matching with deep static analysis of PHP source code.",
    icon: ScanSearch,
    tags: ["SQL Injection", "XSS", "LFI"],
  },
  {
    title: "Remediation Database",
    description:
      "Receive step-by-step fix recommendations and side-by-side code comparisons to resolve vulnerabilities instantly.",
    icon: Database,
  },
  {
    title: "CLI & Web Integration",
    description:
      "Whether you prefer a terminal tool for automation or a visual dashboard for triage, SecureCLI has you covered.",
    icon: Terminal,
  },
]

const faqItems = [
  "How does DeepScan differ from standard Regex?",
  "Can I integrate SecureCLI into my CI/CD pipeline?",
  "What PHP versions are currently supported?",
]

export default function LandingPage() {
  useEffect(() => {
    const reveal = () => {
      const reveals = document.querySelectorAll<HTMLElement>(".reveal")
      const windowHeight = window.innerHeight

      reveals.forEach((el) => {
        const elementTop = el.getBoundingClientRect().top
        if (elementTop < windowHeight - 120) {
          el.classList.add("active")
        }
      })
    }

    reveal()
    window.addEventListener("scroll", reveal)
    return () => window.removeEventListener("scroll", reveal)
  }, [])

  return (
    <div className={`${inter.className} min-h-screen bg-background text-on-surface overflow-x-hidden`}>
      <nav className="sticky top-0 z-50 w-full border-b border-outline-variant/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-10">
            <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-tight text-on-surface">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-on-primary">S</span>
              SecureCLI
            </a>

            <div className="hidden gap-8 lg:flex">
              <a href="#" className="text-sm font-medium text-on-surface/80 transition-colors hover:text-primary">
                Documentation
              </a>
              <a href="#" className="text-sm font-medium text-on-surface/80 transition-colors hover:text-primary">
                Vulnerabilities
              </a>
              <a href="#" className="text-sm font-medium text-on-surface/80 transition-colors hover:text-primary">
                GitHub
              </a>
            </div>
          </div>

          <Link
            href="/upload"
            className="rounded bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-all hover:bg-primary/90"
          >
            Download Scanner
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero-grid relative px-6 pb-36 pt-20 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="reveal z-10">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Web Vuln Scanner v1.0.4</span>
                </div>

                <h1 className={`${manrope.className} mb-8 text-5xl font-bold leading-[1.08] tracking-tight text-on-surface lg:text-7xl`}>
                  Local PHP Vulnerability Scanning.
                </h1>

                <p className="mb-12 max-w-lg text-xl leading-relaxed text-on-surface-variant">
                  A powerful Multi-Engine Detection tool using Regex and DeepScan pattern matching to find security flaws in
                  your local PHP applications before they reach production.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-2 rounded bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:bg-primary/90"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded border border-outline bg-white px-8 py-4 font-bold text-on-surface transition-all hover:bg-surface-dim"
                  >
                    View GitHub Repo
                  </a>
                </div>

                <div className="mt-12 flex items-center gap-4 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1 font-medium">
                    <Terminal className="h-4 w-4" /> CLI Power
                  </span>
                  <span className="opacity-20">|</span>
                  <span className="flex items-center gap-1 font-medium">
                    <LayoutDashboard className="h-4 w-4" /> Web UI
                  </span>
                </div>
              </div>

              <div className="reveal relative lg:[transition-delay:150ms]">
                <div className="absolute -inset-10 rounded-full bg-primary/5 blur-[100px]" />
                <div className="relative">
                  <div className="float-animation overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-white/5 bg-slate-800/50 px-4 py-2">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                      </div>
                      <div className="mx-auto text-[10px] font-mono text-slate-400">securecli --scan ./src</div>
                    </div>

                    <div className="p-6 font-mono text-xs leading-relaxed text-slate-300">
                      <div className="mb-2 text-primary-fixed">{'➜ SecureCLI Scanning Engine Started...'}</div>
                      <div className="text-slate-500">[14:32:01] Processing 142 files...</div>

                      <div className="mt-4">
                        <span className="rounded bg-red-500/20 px-1 text-red-400">CRITICAL</span>
                        <span className="ml-2 text-white">Potential SQL Injection found in index.php:42</span>
                      </div>
                      <div className="mt-2 text-slate-500">{'>'} $query = "SELECT * FROM users WHERE id = " . $_GET['id'];</div>

                      <div className="mt-4">
                        <span className="rounded bg-yellow-500/20 px-1 text-yellow-400">WARNING</span>
                        <span className="ml-2 text-white">Reflected XSS in search.php:12</span>
                      </div>

                      <div className="mt-6 flex items-center gap-4">
                        <span className="text-green-400">Scan Complete. 2 Issues found.</span>
                      </div>
                    </div>
                  </div>

                  <div className="float-delayed absolute -right-8 -top-12 z-20 w-48 rounded-lg border border-outline-variant bg-white p-4 shadow-xl">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-600">
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">OWASP Top 10</span>
                    </div>
                    <div className="text-[11px] font-bold text-on-surface">A03:2021-Injection</div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-slate-100">
                      <div className="h-full w-4/5 bg-red-500" />
                    </div>
                  </div>

                  <div className="float-animation absolute -bottom-16 -left-8 z-20 w-64 rounded-lg bg-slate-900 p-5 text-white shadow-2xl">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-mono text-[10px] tracking-wider text-green-400">REMEDIATION_READY</span>
                    </div>
                    <div className="space-y-2">
                      <div className="font-mono text-[10px] uppercase tracking-tight text-slate-400">Recommended Fix:</div>
                      <div className="rounded bg-white/5 p-2 font-mono text-[11px] text-primary-fixed">
                        filter_var($input, FILTER_SANITIZE_STRING)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <div className="reveal mb-24 text-center">
              <h2 className={`${manrope.className} mb-6 text-4xl font-bold tracking-tight`}>
                Enterprise security for every developer.
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
                A specialized toolkit designed to identify, analyze, and fix common PHP vulnerabilities.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                const delayClass = idx === 1 ? "md:[transition-delay:100ms]" : idx === 2 ? "md:[transition-delay:200ms]" : ""

                return (
                  <article
                    key={feature.title}
                    className={`reveal group rounded-xl border border-outline-variant bg-white p-8 transition-all duration-300 hover:border-primary/50 ${delayClass}`}
                  >
                    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-primary transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-4 text-xl font-bold">{feature.title}</h3>
                    <p className="mb-6 leading-relaxed text-on-surface-variant">{feature.description}</p>

                    {feature.tags ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {feature.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-outline-variant bg-surface-dim px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {feature.title === "Remediation Database" ? (
                      <a href="#" className="group/link inline-flex items-center gap-1 text-sm font-bold text-primary">
                        Browse fixes
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                      </a>
                    ) : null}

                    {feature.title === "CLI & Web Integration" ? (
                      <div className="flex items-center gap-3">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">OWASP Classified</span>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-slate-900 py-32 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 lg:grid-cols-2">
            <div className="reveal">
              <h2 className={`${manrope.className} mb-10 text-4xl font-bold leading-tight lg:text-5xl`}>
                Sophisticated Risk Scoring.
              </h2>
              <div className="space-y-12">
                <div className="group flex gap-6">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="mb-3 text-lg font-bold">Tri-Metric Analysis</h4>
                    <p className="leading-relaxed text-slate-400">
                      Each finding is evaluated across three critical axes: <strong>Severity</strong> (impact),
                      <strong> Confidence</strong> (accuracy), and <strong>Exploitability</strong> (risk level).
                    </p>
                  </div>
                </div>

                <div className="group flex gap-6">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="mb-3 text-lg font-bold">OWASP Pattern Library</h4>
                    <p className="leading-relaxed text-slate-400">
                      Our detection library is continuously updated to match the latest OWASP Top 10 vulnerabilities,
                      ensuring your app stays compliant with modern security standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal lg:[transition-delay:150ms]">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-800 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                    <div className="h-3 w-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30">Scanner Report: #SEC-PHP-91</span>
                </div>

                <div className="p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded bg-red-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      Critical
                    </div>
                    <div className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
                      Confidence: 95%
                    </div>
                  </div>

                  <h5 className={`${manrope.className} mb-6 text-2xl font-bold`}>Local File Inclusion (LFI)</h5>
                  <div className="space-y-4 font-mono text-xs">
                    <div className="rounded border border-white/5 bg-black/40 p-4">
                      <div className="mb-2 uppercase tracking-tight text-white/30">// Vulnerable Source</div>
                      <div className="text-blue-400">include($_GET['page'] + '.php');</div>
                    </div>
                    <div className="rounded border border-white/5 bg-black/40 p-4">
                      <div className="mb-2 uppercase tracking-tight text-white/30">// Proposed Mitigation</div>
                      <div className="text-green-400">$allowed = ['home', 'about']; if (in_array($page, $allowed)) {'{ ... }'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-32">
          <div className="mx-auto max-w-3xl">
            <h2 className={`${manrope.className} reveal mb-16 text-center text-3xl font-bold tracking-tight`}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqItems.map((question) => (
                <div
                  key={question}
                  className="reveal cursor-pointer rounded-lg border border-outline-variant bg-white p-6 transition-colors hover:border-slate-300"
                >
                  <h4 className="group flex items-center justify-between font-bold">
                    {question}
                    <ChevronDown className="h-5 w-5 text-slate-300 transition-colors group-hover:text-primary" />
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hero-grid relative overflow-hidden bg-slate-900 px-6 py-40 text-white">
          <div className="absolute inset-0 opacity-10" />
          <div className="reveal relative z-10 mx-auto max-w-7xl text-center">
            <h2 className={`${manrope.className} mb-10 text-5xl font-bold tracking-tight lg:text-7xl`}>
              Stop vulnerabilities at the source.
            </h2>
            <p className="mx-auto mb-16 max-w-2xl text-xl leading-relaxed text-slate-400">
              SecureCLI is open-source and ready to audit your local PHP files today.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded bg-white px-10 py-5 text-lg font-bold text-slate-900 transition-all hover:bg-slate-100"
              >
                Clone Repository
              </a>
              <a
                href="#"
                className="rounded border border-white/20 bg-transparent px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/5"
              >
                View Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-outline-variant bg-white pb-12 pt-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-4 lg:px-12">
          <div>
            <a href="#" className="mb-6 block text-xl font-bold tracking-tight text-on-surface">
              SecureCLI
            </a>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              The modern standard for local PHP vulnerability scanning. Built for developers who care about code security.
            </p>
          </div>

          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Scanner</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="#" className="transition-colors hover:text-primary">CLI Tool</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Web Dashboard</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Detection Patterns</a></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Community</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="#" className="transition-colors hover:text-primary">GitHub</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Discussions</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Contributing</a></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Resources</h5>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="#" className="transition-colors hover:text-primary">OWASP Top 10</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">PHP Security Guide</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Fix Database</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-24 flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-outline-variant/30 px-6 pt-10 md:flex-row lg:px-12">
          <p className="text-xs font-medium text-slate-400">© 2024 SecureCLI. Released under the MIT License.</p>
          <div className="flex gap-6 opacity-50">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-100">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="transition-opacity hover:opacity-100">
              <BookOpen className="h-4 w-4" />
            </a>
            <a href="#" className="transition-opacity hover:opacity-100">
              <Wrench className="h-4 w-4" />
            </a>
            <a href="#" className="transition-opacity hover:opacity-100">
              <Bug className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-grid {
          background-size: 40px 40px;
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
