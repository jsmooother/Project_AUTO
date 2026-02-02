import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DollarSign } from "lucide-react";

export function OnboardingStep2() {
  const [selectedBudget, setSelectedBudget] = useState("");

  const budgetOptions = [
    { value: "500", label: "$500 - $2,000/mo", description: "Small inventory or testing" },
    { value: "2000", label: "$2,000 - $10,000/mo", description: "Growing dealership" },
    { value: "10000", label: "$10,000 - $50,000/mo", description: "Established operation" },
    { value: "50000", label: "$50,000+/mo", description: "Large scale" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight mb-4">Project Auto</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
          <p className="text-sm text-gray-600">Step 2 of 4</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Budget intent</CardTitle>
              </div>
            </div>
            <CardDescription>
              What's your rough monthly ad spend? (You can change this later)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedBudget(option.value)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedBudget === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>How pricing works:</strong> You pay your ad platforms directly. Project
                Auto charges 3% of your actual ad spend (min $50/mo). No surprises.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link to="/onboarding/step1">
                <Button variant="ghost">Back</Button>
              </Link>
              <Link to="/onboarding/step3">
                <Button disabled={!selectedBudget}>
                  Continue
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
