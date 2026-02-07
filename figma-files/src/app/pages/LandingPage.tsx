import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Sparkles, Play, Globe, Zap, Target } from "lucide-react";

export function LandingPage() {
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
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Turn your inventory into ads automatically
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl">
            <div className="text-6xl font-bold tracking-tight text-gray-900 mb-2">
              Your inventory.
            </div>
            <div className="text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Automated ads.
            </div>
            <div className="text-6xl font-bold tracking-tight text-gray-900">
              Every platform.
            </div>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mt-8 max-w-2xl">
            We turn your vehicle inventory into high-performing ads on Meta, TikTok, and LinkedIn. Automatically.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 mt-10">
            <Link to="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 py-6 text-lg flex items-center gap-2">
                <Play className="h-5 w-5 fill-current" />
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" className="rounded-lg px-8 py-6 text-lg border-gray-300">
              Watch Demo →
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-6">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Free trial • No credit card • 5-minute setup
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Watch it work in real-time
            </h2>
            <p className="text-gray-600">
              Your website becomes ads in seconds
            </p>
          </div>

          {/* 3-Step Visualization */}
          <div className="flex items-center justify-center gap-12 mt-16">
            {/* Step 1: Your Website */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mb-4">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Your Website</div>
              <div className="text-sm text-gray-500">Live inventory</div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>

            {/* Step 2: Agentic Ads */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center mb-4">
                <Zap className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="text-lg font-semibold text-gray-400 mb-1">Agentic Ads</div>
              <div className="text-sm text-gray-400"></div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>

            {/* Step 3: Live Ads */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Target className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Live Ads</div>
              <div className="text-sm text-gray-500">All platforms</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}