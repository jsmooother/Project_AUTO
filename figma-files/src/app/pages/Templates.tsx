import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Check, Facebook, Instagram } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

// Mock inventory data
const mockInventory = [
  {
    id: 1,
    make: "Porsche",
    model: "911 Carrera",
    year: 2024,
    price: 124990,
    image: "https://images.unsplash.com/photo-1722591602044-17962109fa91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzcG9ydHMlMjBjYXJ8ZW58MXx8fHwxNzY5OTc2MTg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    offer: "Limited Time Offer",
  },
  {
    id: 2,
    make: "BMW",
    model: "X5 xDrive40i",
    year: 2024,
    price: 68900,
    image: "https://images.unsplash.com/photo-1767949374180-e5895daa1990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWx2ZXIlMjBzdXYlMjBjYXJ8ZW58MXx8fHwxNzcwMDI1Nzk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    offer: "Save $5,000",
  },
  {
    id: 3,
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2024,
    price: 52990,
    image: "https://images.unsplash.com/photo-1621601628445-ff13122a9caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwc2VkYW4lMjBjYXJ8ZW58MXx8fHwxNzcwMDM4MjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    offer: "0% APR for 60 months",
  },
];

type TemplateStyle = "classic" | "bold" | "minimal" | "modern";

export function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>("classic");
  const [selectedFormat, setSelectedFormat] = useState<"feed" | "story">("feed");
  const currentCar = mockInventory[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Ad Templates</h1>
        <p className="text-gray-600">
          Choose how your ads will appear on Meta platforms. Templates automatically use your inventory data.
        </p>
      </div>

      {/* Format Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3">Ad Format</label>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedFormat("feed")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedFormat === "feed"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              <Instagram className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Feed (Square)</div>
              <div className="text-xs text-gray-600">Facebook & Instagram Feed</div>
            </div>
            {selectedFormat === "feed" && (
              <Check className="h-4 w-4 text-blue-600 ml-2" />
            )}
          </button>

          <button
            onClick={() => setSelectedFormat("story")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedFormat === "story"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Instagram className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium text-sm">Stories (Vertical)</div>
              <div className="text-xs text-gray-600">Instagram & Facebook Stories</div>
            </div>
            {selectedFormat === "story" && (
              <Check className="h-4 w-4 text-blue-600 ml-2" />
            )}
          </button>
        </div>
      </div>

      {/* Template Styles */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Template Style</label>
        <div className="grid grid-cols-4 gap-4">
          {(["classic", "bold", "minimal", "modern"] as TemplateStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setSelectedTemplate(style)}
              className={`text-left p-3 rounded-lg border-2 transition-all ${
                selectedTemplate === style
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm capitalize">{style}</span>
                {selectedTemplate === style && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <p className="text-xs text-gray-600">
                {style === "classic" && "Balanced layout with clear pricing"}
                {style === "bold" && "Large price with high contrast"}
                {style === "minimal" && "Clean design, subtle text"}
                {style === "modern" && "Contemporary with gradient"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="grid grid-cols-2 gap-8">
        {/* Live Preview */}
        <div>
          <h2 className="font-medium mb-4">Preview</h2>
          <Card className="bg-gray-50 border-2">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-300" />
                <div>
                  <div className="font-medium text-gray-900">Acme Motors</div>
                  <div className="text-xs">Sponsored</div>
                </div>
              </div>

              {selectedFormat === "feed" ? (
                <AdTemplateFeed template={selectedTemplate} car={currentCar} />
              ) : (
                <AdTemplateStory template={selectedTemplate} car={currentCar} />
              )}

              <div className="mt-3 text-sm text-gray-700">
                <p className="mb-2">
                  Experience luxury and performance. Visit our showroom today.
                </p>
                <Button className="w-full" size="sm">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example Inventory Items */}
        <div>
          <h2 className="font-medium mb-4">Example Inventory Ads</h2>
          <div className="space-y-4">
            {mockInventory.map((car) => (
              <Card key={car.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {selectedFormat === "feed" ? (
                    <AdTemplateFeed template={selectedTemplate} car={car} compact />
                  ) : (
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-24 h-32 relative rounded overflow-hidden flex-shrink-0">
                        <AdTemplateStory template={selectedTemplate} car={car} compact />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">
                          {car.year} {car.make} {car.model}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${car.price.toLocaleString()}
                        </div>
                        {car.offer && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {car.offer}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div>
          <div className="font-medium">Template: {selectedTemplate}</div>
          <div className="text-sm text-gray-600">
            Format: {selectedFormat === "feed" ? "Feed (Square)" : "Stories (Vertical)"}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Preview More</Button>
          <Button>Apply Template</Button>
        </div>
      </div>
    </div>
  );
}

// Feed Ad Template Component
function AdTemplateFeed({
  template,
  car,
  compact = false,
}: {
  template: TemplateStyle;
  car: typeof mockInventory[0];
  compact?: boolean;
}) {
  const size = compact ? "h-64" : "h-96";

  return (
    <div className={`relative ${size} w-full rounded-lg overflow-hidden`}>
      <ImageWithFallback
        src={car.image}
        alt={`${car.make} ${car.model}`}
        className="w-full h-full object-cover"
      />

      {/* Classic Template */}
      {template === "classic" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="text-sm font-medium mb-1">
              {car.year} {car.make}
            </div>
            <div className="text-xl font-bold mb-2">{car.model}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">${car.price.toLocaleString()}</div>
              {car.offer && (
                <Badge className="bg-yellow-500 text-black border-0">
                  {car.offer}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bold Template */}
      {template === "bold" && (
        <div className="absolute inset-0 bg-black/60">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
            <div className="text-5xl font-black mb-2 text-yellow-400">
              ${(car.price / 1000).toFixed(0)}K
            </div>
            <div className="text-2xl font-bold mb-1">
              {car.year} {car.make}
            </div>
            <div className="text-xl font-semibold">{car.model}</div>
            {car.offer && (
              <Badge className="mt-3 bg-red-600 text-white text-sm px-3 py-1">
                {car.offer}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Minimal Template */}
      {template === "minimal" && (
        <>
          <div className="absolute top-4 left-4 right-4">
            <div className="inline-block bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-900">
              {car.year} {car.make} {car.model}
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="text-lg font-bold text-gray-900">
                ${car.price.toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modern Template */}
      {template === "modern" && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/60 to-transparent">
          <div className="absolute top-4 left-4 right-4">
            {car.offer && (
              <Badge className="bg-white text-purple-600 border-0 text-xs">
                {car.offer}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="text-sm font-medium mb-1 opacity-90">
              {car.year} Model
            </div>
            <div className="text-2xl font-bold mb-1">
              {car.make} {car.model}
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black">
                ${(car.price / 1000).toFixed(0)}K
              </div>
              <div className="text-sm opacity-75">starting at</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Story Ad Template Component
function AdTemplateStory({
  template,
  car,
  compact = false,
}: {
  template: TemplateStyle;
  car: typeof mockInventory[0];
  compact?: boolean;
}) {
  const containerClass = compact ? "w-full h-full" : "w-full aspect-[9/16] max-w-sm mx-auto";

  return (
    <div className={`relative ${containerClass} rounded-lg overflow-hidden`}>
      <ImageWithFallback
        src={car.image}
        alt={`${car.make} ${car.model}`}
        className="w-full h-full object-cover"
      />

      {/* Classic Template */}
      {template === "classic" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-base font-medium mb-2">
              {car.year} {car.make}
            </div>
            <div className="text-3xl font-bold mb-3">{car.model}</div>
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold">${car.price.toLocaleString()}</div>
            </div>
            {car.offer && (
              <Badge className="bg-yellow-500 text-black border-0 mt-3 text-sm">
                {car.offer}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Bold Template */}
      {template === "bold" && (
        <div className="absolute inset-0 bg-black/70">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <div className="text-7xl font-black mb-3 text-yellow-400">
              ${(car.price / 1000).toFixed(0)}K
            </div>
            <div className="text-3xl font-bold mb-2">
              {car.year} {car.make}
            </div>
            <div className="text-2xl font-semibold">{car.model}</div>
            {car.offer && (
              <Badge className="mt-4 bg-red-600 text-white text-base px-4 py-2">
                {car.offer}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Minimal Template */}
      {template === "minimal" && (
        <>
          <div className="absolute top-6 left-6 right-6">
            <div className="inline-block bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full font-medium text-gray-900">
              {car.year} {car.make} {car.model}
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full inline-block">
              <div className="text-2xl font-bold text-gray-900">
                ${car.price.toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modern Template */}
      {template === "modern" && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/60 to-transparent">
          <div className="absolute top-6 left-6 right-6">
            {car.offer && (
              <Badge className="bg-white text-purple-600 border-0">
                {car.offer}
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="text-base font-medium mb-2 opacity-90">
              {car.year} Model
            </div>
            <div className="text-3xl font-bold mb-2">
              {car.make} {car.model}
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-black">
                ${(car.price / 1000).toFixed(0)}K
              </div>
              <div className="text-sm opacity-75">starting at</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
