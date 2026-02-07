import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Zap } from "lucide-react";

export function Signup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    sessionStorage.setItem("signup_email", email);
    await new Promise(resolve => setTimeout(resolve, 800));
    navigate("/onboarding/start");
  };

  const handleSocialSignup = async (provider: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    sessionStorage.setItem("signup_provider", provider);
    navigate("/onboarding/start");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Gradient Background Orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        style={{ transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl"
        style={{ transform: "translate(-30%, 30%)" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap size={24} color="white" strokeWidth={2.5} />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Get started free
          </h1>
          <p className="text-gray-600">
            14-day free trial • No credit card required
          </p>
        </div>

        <Card 
          className="border-2 border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl"
        >
          <CardContent className="pt-6 pb-6 px-6 space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 text-gray-900"
                onClick={() => handleSocialSignup("google")}
                disabled={isLoading}
              >
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 text-gray-900"
                onClick={() => handleSocialSignup("apple")}
                disabled={isLoading}
              >
                Continue with Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600">
                  or with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base border-2 text-gray-900"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={isLoading || !email}
              >
                {isLoading ? "Loading..." : "Continue with email"}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-600 text-center leading-relaxed px-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>

        {/* Login Link */}
        <p className="text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
}