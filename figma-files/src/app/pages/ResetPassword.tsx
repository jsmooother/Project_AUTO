import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { Zap, Mail, ArrowRight, CheckCircle } from "lucide-react";

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { lang } = useLanguage();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsLoading(false);
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
            {lang === "sv" ? "Återställ lösenord" : lang === "de" ? "Passwort zurücksetzen" : "Reset password"}
          </h1>
          <p className="text-gray-600">
            {lang === "sv" 
              ? "Vi skickar dig en återställningslänk"
              : lang === "de"
              ? "Wir senden Ihnen einen Zurücksetzungslink"
              : "We'll send you a reset link"}
          </p>
        </div>

        <Card 
          className="border-2 border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl"
        >
          <CardContent className="pt-6 pb-6 px-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {lang === "sv" ? "Kolla din e-post" : lang === "de" ? "Überprüfen Sie Ihre E-Mail" : "Check your email"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {lang === "sv"
                    ? `Vi har skickat återställningsinstruktioner till ${email}`
                    : lang === "de"
                    ? `Wir haben Anweisungen zum Zurücksetzen an ${email} gesendet`
                    : `We've sent reset instructions to ${email}`}
                </p>
                <Link to="/login">
                  <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {lang === "sv" ? "Tillbaka till inloggning" : lang === "de" ? "Zurück zur Anmeldung" : "Back to login"}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {lang === "sv" ? "E-postadress" : lang === "de" ? "E-Mail-Adresse" : "Email address"}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={lang === "sv" ? "du@företag.se" : lang === "de" ? "du@unternehmen.de" : "you@company.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base border-2"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    lang === "sv" ? "Skickar..." : lang === "de" ? "Senden..." : "Sending..."
                  ) : (
                    <>
                      {lang === "sv" ? "Skicka återställningslänk" : lang === "de" ? "Link senden" : "Send reset link"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Back to Login */}
        {!submitted && (
          <p className="text-sm text-gray-600 text-center mt-6">
            {lang === "sv" ? "Kom ihåg ditt lösenord?" : lang === "de" ? "Passwort erinnert?" : "Remember your password?"}{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              {lang === "sv" ? "Logga in" : lang === "de" ? "Anmelden" : "Sign in"}
            </Link>
          </p>
        )}

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← {lang === "sv" ? "Tillbaka" : lang === "de" ? "Zurück" : "Back"}
          </Link>
        </div>
      </div>
    </div>
  );
}
