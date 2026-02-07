import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";

export function BillingNew() {
  const { lang } = useLanguage();
  const [topUpAmount, setTopUpAmount] = useState("5000");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data
  const currentBalance = 8240;
  const estimatedRunway = 14;
  const dailyBurn = 588;
  const runwayLow = estimatedRunway < 7;

  const transactions = [
    { id: "1", date: "2026-02-04", type: "top_up", amount: 10000, status: "completed" },
    { id: "2", date: "2026-01-28", type: "ad_spend", amount: -1760, status: "completed" },
    { id: "3", date: "2026-01-21", type: "top_up", amount: 5000, status: "completed" },
    { id: "4", date: "2026-01-15", type: "ad_spend", amount: -2340, status: "completed" },
  ];

  const presetAmounts = ["2500", "5000", "10000", "25000"];

  const handleTopUp = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Top-up initiated: ${topUpAmount} SEK`);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {lang === "sv" ? "Krediter" : "Credits"}
        </h1>
        <p className="text-sm text-gray-600">
          {lang === "sv" ? "Hantera ditt annonskonto och krediter" : "Manage your ad account and credits"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Balance & Top-up */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance */}
          <Card
            className="border-2"
            style={{
              background: runwayLow ? "#fef3c7" : "white",
              borderColor: runwayLow ? "#fde68a" : "#e5e7eb",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    {lang === "sv" ? "Nuvarande saldo" : "Current balance"}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {currentBalance.toLocaleString()} <span className="text-xl text-gray-600">SEK</span>
                  </div>
                  <div className={`text-sm font-medium ${runwayLow ? "text-amber-700" : "text-gray-600"}`}>
                    ≈ {estimatedRunway} {lang === "sv" ? "dagar kvar" : "days remaining"}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              {runwayLow && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 mb-6">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-medium mb-1">
                      {lang === "sv" ? "Lågt saldo" : "Low balance"}
                    </p>
                    <p className="text-xs text-amber-800">
                      {lang === "sv"
                        ? "Fyll på nu för att undvika avbrott i dina annonser."
                        : "Top up now to avoid interruptions to your ads."}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {lang === "sv" ? "Daglig förbrukning:" : "Daily burn:"}
                    <span className="font-semibold text-gray-900 ml-1">{dailyBurn} SEK</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top-up Section */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {lang === "sv" ? "Fyll på krediter" : "Top up credits"}
              </h3>

              {/* Preset Amounts */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      topUpAmount === amount
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {parseInt(amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">SEK</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-amount" className="text-sm font-medium mb-2">
                    {lang === "sv" ? "Eller ange belopp" : "Or enter amount"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="custom-amount"
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="h-12 pr-16 text-lg"
                      placeholder="5000"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                      SEK
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleTopUp}
                  disabled={isProcessing || !topUpAmount}
                  className="w-full h-12"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {isProcessing ? (
                    <span>{lang === "sv" ? "Bearbetar..." : "Processing..."}</span>
                  ) : (
                    <>
                      {lang === "sv" ? "Fyll på" : "Top up"} {parseInt(topUpAmount).toLocaleString()} SEK
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-600 mt-4 text-center">
                {lang === "sv"
                  ? "Säker betalning via Stripe • Krediter används automatiskt för annonser"
                  : "Secure payment via Stripe • Credits are used automatically for ads"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Usage Stats */}
        <div className="space-y-6">
          {/* This Month Stats */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lang === "sv" ? "Denna månad" : "This month"}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {lang === "sv" ? "1-6 Feb" : "Feb 1-6"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Använt" : "Spent"}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    3,528 <span className="text-base text-gray-600">SEK</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Genomsnitt/dag" : "Avg per day"}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    588 <span className="text-sm text-gray-600">SEK</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Prognos månad" : "Month forecast"}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    17,640 <span className="text-sm text-gray-600">SEK</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Top-up (Coming Soon) */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lang === "sv" ? "Automatisk påfyllning" : "Auto top-up"}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {lang === "sv"
                  ? "Sätt regler för automatisk påfyllning när saldot blir lågt."
                  : "Set rules for automatic top-up when balance runs low."}
              </p>
              <Badge variant="secondary" className="text-xs">
                {lang === "sv" ? "Kommer snart" : "Coming soon"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="border border-gray-200 bg-white mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">
              {lang === "sv" ? "Transaktionshistorik" : "Transaction history"}
            </h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {lang === "sv" ? "Exportera" : "Export"}
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === "top_up"
                        ? "bg-green-50"
                        : "bg-gray-100"
                    }`}
                  >
                    {transaction.type === "top_up" ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === "top_up"
                        ? lang === "sv"
                          ? "Påfyllning"
                          : "Top-up"
                        : lang === "sv"
                        ? "Annonsering"
                        : "Ad spend"}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.amount > 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString()} SEK
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {lang === "sv" ? "Slutförd" : "Completed"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}