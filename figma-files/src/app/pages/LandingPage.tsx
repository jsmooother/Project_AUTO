import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ArrowRight, Globe, Zap, BarChart3, RefreshCw, Play } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold tracking-tight">Project Auto</div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold tracking-tight mb-6">
            Smarter ads. Zero busywork.
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect your website inventory, choose templates, set budget — we keep ads updated
            with new and removed listings automatically.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Book demo
            </Button>
          </div>
        </div>

        {/* Trusted by */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-6">Trusted by industry leaders</p>
          <div className="flex items-center gap-12 opacity-40">
            <div className="h-8 w-24 bg-gray-300 rounded" />
            <div className="h-8 w-24 bg-gray-300 rounded" />
            <div className="h-8 w-24 bg-gray-300 rounded" />
            <div className="h-8 w-24 bg-gray-300 rounded" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-gray-600">Three simple steps to automated ads</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">Step 1</div>
                <h3 className="text-lg font-semibold mb-2">Connect your website URL</h3>
                <p className="text-gray-600">
                  We automatically discover and track your inventory — vehicles, jobs, or any
                  listing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">Step 2</div>
                <h3 className="text-lg font-semibold mb-2">Connect ad accounts</h3>
                <p className="text-gray-600">
                  Link Meta, X, and LinkedIn accounts. Choose templates and set brand settings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">Step 3</div>
                <h3 className="text-lg font-semibold mb-2">Set rules + budget</h3>
                <p className="text-gray-600">
                  Ads run continuously and update automatically when inventory changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Automation + transparency + control
            </h2>
            <p className="text-lg text-gray-600">
              Not a black box. You see everything and stay in control.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create</h3>
                <p className="text-gray-600 mb-4">
                  Choose from templates, customize brand settings, and preview ads before launch.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Template library</li>
                  <li>• Brand customization</li>
                  <li>• Live previews</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Automate</h3>
                <p className="text-gray-600 mb-4">
                  Always-on campaigns sync nightly. On-demand campaigns run when you need them.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Always-on mode</li>
                  <li>• On-demand runs</li>
                  <li>• Inventory tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analyze</h3>
                <p className="text-gray-600 mb-4">
                  Complete visibility into runs, logs, and performance. Full run history and
                  reproducibility.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Performance reporting</li>
                  <li>• Run logs & history</li>
                  <li>• Confidence scores</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Always On vs On Demand */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Always On vs On Demand
            </h2>
            <p className="text-lg text-gray-600">Two modes. One platform. Total control.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-4xl">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold">Always On</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Set it and forget it. Ads sync nightly and update automatically as your
                  inventory changes.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Scheduled syncs (nightly default)</li>
                  <li>✓ Automatic new listing detection</li>
                  <li>✓ Automatic removed listing cleanup</li>
                  <li>✓ Budget managed automatically</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold">On Demand</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Run campaigns when you need them. Perfect for special promotions or testing.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Manual trigger anytime</li>
                  <li>✓ Preview before launch</li>
                  <li>✓ Budget per campaign</li>
                  <li>✓ Full run history</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="bg-gray-900 rounded-2xl px-16 py-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
              Ready to automate your ads?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Start free. No credit card required.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Company</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Resources</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Community</li>
                <li>Partners</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Legal</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500">
            © 2026 Project Auto. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
