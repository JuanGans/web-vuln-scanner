import { Shield, Lock, Zap, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: "Real-time Threat Detection",
      description:
        "Advanced AI-powered scanning to detect vulnerabilities instantly across your entire web application.",
      color: "text-cyan-400",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Military-grade encryption and compliance with OWASP standards to protect your sensitive data.",
      color: "text-blue-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast Scans",
      description: "Complete vulnerability analysis in seconds with our optimized scanning engine.",
      color: "text-purple-400",
    },
    {
      icon: TrendingUp,
      title: "Detailed Reports",
      description: "Comprehensive vulnerability reports with actionable recommendations and severity levels.",
      color: "text-orange-400",
    },
  ]

  const testimonials = [
    { company: "TechCorp", quote: "SecurityDefender helped us eliminate 95% of our vulnerabilities in 3 months." },
    { company: "FinanceHub", quote: "The best security scanner we've used. Fast, accurate, and incredibly reliable." },
    { company: "CloudServices", quote: "Essential tool for maintaining our security posture. Highly recommend!" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SecurityDefender
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:opacity-90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center mb-16">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
            <span className="text-primary text-sm font-medium">The Future of Web Security</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Defend Your Web Applications
            </span>
            <br /> From Threats
          </h2>

          <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
            Advanced vulnerability scanning with AI-powered threat detection. Identify and fix security issues before
            attackers find them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-6 text-lg h-auto">
                Start Free Scan
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-primary/30 text-foreground hover:bg-primary/10 bg-transparent px-8 py-6 text-lg h-auto"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Powerful Security Features</h3>
            <p className="text-foreground/60 text-lg">Everything you need to protect your applications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="bg-card border-border hover:border-primary/50 transition-all group p-6">
                  <div className="mb-4">
                    <Icon className={`w-12 h-12 ${feature.color}`} />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-foreground/60 text-sm">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">10M+</div>
              <p className="text-foreground/60">Vulnerabilities Detected</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">50K+</div>
              <p className="text-foreground/60">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-2">99.9%</div>
              <p className="text-foreground/60">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Trusted by Industry Leaders</h3>
            <p className="text-foreground/60 text-lg">Join thousands of companies securing their applications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-card border-border p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-cyan-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-foreground/80 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="font-semibold text-primary">{testimonial.company}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <Card className="relative bg-gradient-to-r from-card to-card border-primary/30 p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/5 rounded-full -ml-20 -mt-20" />
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Ready to Secure Your Applications?</h3>
                <p className="text-foreground/70 mb-8 text-lg">
                  Get started with a free vulnerability scan. No credit card required.
                </p>
                <Link href="/register">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90 px-8 py-6 text-lg h-auto">
                    Start Free Scan Today
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-foreground/60 text-sm">
          <p>© 2026 SecurityDefender. Protecting web applications worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
