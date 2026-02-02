import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Globe, Info } from "lucide-react";

export function OnboardingStep2() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight mb-2">Project Auto</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Add data source (Website)
            </CardTitle>
            <CardDescription>
              Connect your inventory website. We'll discover and track your listings automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://yoursite.com/inventory"
              />
              <p className="text-sm text-gray-500">
                Provide your inventory listing page or homepage. We'll discover listings from there.
              </p>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="advanced" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium">
                  Advanced options
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seed-urls">Optional seed URLs</Label>
                    <Textarea
                      id="seed-urls"
                      placeholder="https://yoursite.com/cars&#10;https://yoursite.com/trucks"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">
                      One URL per line. Help us discover specific sections.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sitemap">Optional sitemap URL</Label>
                    <Input
                      id="sitemap"
                      type="url"
                      placeholder="https://yoursite.com/sitemap.xml"
                    />
                    <p className="text-sm text-gray-500">
                      If available, this speeds up discovery.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="headless">Allow headless fallback</Label>
                        <Info className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        More coverage for JavaScript-heavy sites. Higher cost per run.
                      </p>
                    </div>
                    <Switch id="headless" />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p className="text-blue-800">
                    We'll run a <strong>Probe</strong> to analyze your site structure and discover
                    listings. This takes 30–60 seconds and shows you what we found.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link to="/onboarding/step1">
                <Button variant="ghost">Back</Button>
              </Link>
              <Link to="/onboarding/step3">
                <Button>Run Probe</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
