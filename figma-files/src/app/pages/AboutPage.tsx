import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Sparkles, Zap, Target, Users, Brain, TrendingUp, Shield, Rocket } from "lucide-react";

export function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Simplicity first",
      desc: "We build tools that are simple to use and understand, without compromising on power.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Customer success",
      desc: "Your success is our success. We're committed to helping you achieve your goals.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Sparkles,
      title: "Innovation",
      desc: "We push the boundaries of what's possible with automation and AI.",
      gradient: "from-green-500 to-teal-600"
    }
  ];

  const techStack = [
    {
      icon: Brain,
      title: "AI-Powered Copywriting",
      desc: "Our models analyze thousands of high-performing ads to generate compelling copy that converts."
    },
    {
      icon: TrendingUp,
      title: "Predictive Optimization",
      desc: "Machine learning predicts which vehicles will perform best and adjusts budgets in real-time."
    },
    {
      icon: Shield,
      title: "Automated Compliance",
      desc: "AI validates ads against platform policies before publishing, reducing rejections by 95%."
    }
  ];

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
            <Rocket className="h-4 w-4" />
            Founded 2023 in Stockholm
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-3xl">
            Building the future of{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ad automation
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl">
            We use advanced AI to automate the entire advertising process—from inventory detection to live ads across all platforms.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Ads automated" },
            { value: "50+", label: "Active customers" },
            { value: "98%", label: "Uptime" },
            { value: "3", label: "Ad platforms" }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-8 text-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
            >
              <div className="text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Technology Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Powered by advanced AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine machine learning, NLP, and computer vision to create a fully autonomous advertising platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techStack.map((tech, idx) => (
              <Card key={idx} className="border-2 border-gray-100 hover:border-indigo-200 transition-all">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                    <tech.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{tech.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{tech.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Our mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4 text-lg">
              We were founded in 2023 with a vision: No dealership should have to spend time on manual advertising. Every vehicle should automatically get an optimized ad across all platforms within minutes of being added to inventory.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Today, we serve dealerships across Europe, collectively saving them thousands of hours every week. We're building the first truly autonomous advertising platform—where AI handles everything from copywriting to budgeting.
            </p>
          </div>
          <div className="rounded-2xl p-10 text-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <div className="text-5xl font-bold mb-2">€2M+</div>
            <p className="text-lg opacity-90 mb-8">Ad spend managed</p>
            <div className="text-5xl font-bold mb-2">24/7</div>
            <p className="text-lg opacity-90">Automated monitoring</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Our values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <Card key={idx} className="border-2 border-gray-100 hover:border-indigo-200 transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-4`}>
                    <value.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Small team, big impact
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're a dedicated team of AI engineers, product designers, and advertising experts based in Stockholm. We believe in building powerful tools that save time and create value.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-50 border border-indigo-200">
            <Users className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">
              Remote-first • Stockholm HQ • Growing fast
            </span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-16 py-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to start automating?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join dealerships saving 10+ hours per week
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