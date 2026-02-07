import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { 
  Sparkles, 
  Zap, 
  Globe,
  RefreshCw, 
  Target,
  BarChart3, 
  Play,
  CheckCircle2
} from "lucide-react";

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Agentic Ads</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link to="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Complete automation platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6 max-w-3xl">
            Everything you need to automate vehicle ads
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl">
            From inventory sync to live ads across Meta, TikTok, and LinkedIn. One platform, zero manual work.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          
          <div className="flex items-center justify-center gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mb-4">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Connect Website</div>
              <div className="text-sm text-gray-500 max-w-[200px]">Paste your inventory URL</div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Link Ad Accounts</div>
              <div className="text-sm text-gray-500 max-w-[200px]">One-click OAuth</div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <Play className="h-10 w-10 text-white fill-current" />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Go Live</div>
              <div className="text-sm text-gray-500 max-w-[200px]">Set rules & budget</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Core features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="border-2 border-gray-100 hover:border-indigo-200 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Real-time Inventory Sync</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Automatically detects new vehicles and creates ads within minutes. Ads pause instantly when vehicles sell.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-2 border-gray-100 hover:border-purple-200 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI-Powered Ad Creation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Generates compelling ad copy and selects best images optimized for each platform's audience.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-2 border-gray-100 hover:border-green-200 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Multi-Platform Publishing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Publish to Meta, TikTok, and LinkedIn simultaneously with optimized formats for each platform.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-2 border-gray-100 hover:border-orange-200 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Smart Targeting Rules</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Set targeting rules once for demographics, location, and interests. Auto-applies to all new ads.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="border-2 border-gray-100 hover:border-blue-200 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Performance Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Real-time dashboards show impressions, clicks, and conversions per vehicle.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="border-2 border-gray-100 hover:border-pink-200 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Budget Automation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Set budgets and let AI allocate spend across platforms. Auto-pauses when limits are reached.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Capabilities */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">More capabilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Approval workflows",
              "Custom templates",
              "Scheduled campaigns",
              "API access",
              "Team collaboration",
              "White-label reports",
              "Compliance checks",
              "Inventory filters",
              "Performance alerts"
            ].map((capability, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-16 py-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Start automating today
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Free trial • No credit card • 5-minute setup
          </p>
          <Link to="/signup">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 rounded-lg px-8 py-6 text-lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}