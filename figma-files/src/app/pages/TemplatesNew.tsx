import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Palette,
  Sparkles,
  Eye,
  Download,
  RefreshCw,
  CheckCircle2,
  Edit,
  Copy,
} from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";

interface Template {
  id: string;
  name: string;
  preview: string;
  format: string;
  status: "active" | "draft";
  performance: {
    ctr: number;
    impressions: number;
  };
}

export function TemplatesNew() {
  const { lang } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Mock data
  const templates: Template[] = [
    {
      id: "1",
      name: lang === "sv" ? "Premium Lyx" : "Premium Luxury",
      preview: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop",
      format: "Feed, Reels",
      status: "active",
      performance: {
        ctr: 3.4,
        impressions: 45230,
      },
    },
    {
      id: "2",
      name: lang === "sv" ? "Modern Minimalist" : "Modern Minimalist",
      preview: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop",
      format: "Feed, Stories",
      status: "active",
      performance: {
        ctr: 3.1,
        impressions: 38920,
      },
    },
    {
      id: "3",
      name: lang === "sv" ? "Action Sport" : "Action Sport",
      preview: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop",
      format: "Reels, Stories",
      status: "active",
      performance: {
        ctr: 2.9,
        impressions: 32145,
      },
    },
    {
      id: "4",
      name: lang === "sv" ? "Klassisk Elegans" : "Classic Elegance",
      preview: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=400&fit=crop",
      format: "Feed",
      status: "draft",
      performance: {
        ctr: 0,
        impressions: 0,
      },
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handleDuplicate = (templateId: string) => {
    console.log("Duplicate template:", templateId);
  };

  const handleEdit = (templateId: string) => {
    console.log("Edit template:", templateId);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {lang === "sv" ? "Mallar" : "Templates"}
            </h1>
            <p className="text-sm text-gray-600">
              {lang === "sv"
                ? "Hantera dina kreativa annonsmallar"
                : "Manage your creative ad templates"}
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                {lang === "sv" ? "Genererar..." : "Generating..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {lang === "sv" ? "Generera nya mallar" : "Generate new templates"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Generation Info */}
      <Card
        className="border mb-6"
        style={{
          background: "#dbeafe",
          borderColor: "#93c5fd",
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                {lang === "sv"
                  ? "AI-genererade mallar"
                  : "AI-generated templates"}
              </p>
              <p className="text-xs text-blue-800">
                {lang === "sv"
                  ? "Vårt AI skapar automatiskt nya mallar baserat på ditt lager och varumärke. Generering tar 30-60 sekunder."
                  : "Our AI automatically creates new templates based on your inventory and brand. Generation takes 30-60 seconds."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`border-2 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "border-blue-500 shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardContent className="p-0">
              {/* Preview Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                {template.status === "active" && (
                  <Badge
                    className="absolute top-3 left-3"
                    style={{
                      background: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {lang === "sv" ? "Aktiv" : "Active"}
                  </Badge>
                )}
                {template.status === "draft" && (
                  <Badge
                    className="absolute top-3 left-3"
                    style={{
                      background: "#f3f4f6",
                      color: "#6b7280",
                      border: "1px solid #d1d5db",
                    }}
                  >
                    {lang === "sv" ? "Utkast" : "Draft"}
                  </Badge>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{template.format}</p>

                {/* Performance Stats */}
                {template.status === "active" && (
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-4 pb-4 border-b">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {template.performance.ctr}%
                      </span>{" "}
                      CTR
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {(template.performance.impressions / 1000).toFixed(1)}K
                      </span>{" "}
                      {lang === "sv" ? "visningar" : "impressions"}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(template.id);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    {lang === "sv" ? "Redigera" : "Edit"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(template.id);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Template Card */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all cursor-pointer">
          <CardContent className="p-0 h-full">
            <div className="flex flex-col items-center justify-center aspect-square">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Palette className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">
                {lang === "sv" ? "Skapa ny mall" : "Create new template"}
              </p>
              <p className="text-xs text-gray-500 text-center px-6">
                {lang === "sv"
                  ? "Använd AI eller börja från grunden"
                  : "Use AI or start from scratch"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Details (when selected) */}
      {selectedTemplate && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {lang === "sv" ? "Malldetaljer" : "Template details"}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  {lang === "sv" ? "Förhandsvisning" : "Preview"}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  {lang === "sv" ? "Ladda ner" : "Download"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {lang === "sv" ? "Mallnamn" : "Template name"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {templates.find((t) => t.id === selectedTemplate)?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {lang === "sv" ? "Format" : "Formats"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {templates.find((t) => t.id === selectedTemplate)?.format}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {lang === "sv" ? "Status" : "Status"}
                  </p>
                  <Badge
                    style={{
                      background:
                        templates.find((t) => t.id === selectedTemplate)?.status ===
                        "active"
                          ? "#d1fae5"
                          : "#f3f4f6",
                      color:
                        templates.find((t) => t.id === selectedTemplate)?.status ===
                        "active"
                          ? "#065f46"
                          : "#6b7280",
                      border:
                        templates.find((t) => t.id === selectedTemplate)?.status ===
                        "active"
                          ? "1px solid #a7f3d0"
                          : "1px solid #d1d5db",
                    }}
                  >
                    {templates.find((t) => t.id === selectedTemplate)?.status ===
                    "active"
                      ? lang === "sv"
                        ? "Aktiv"
                        : "Active"
                      : lang === "sv"
                      ? "Utkast"
                      : "Draft"}
                  </Badge>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {lang === "sv" ? "Prestanda" : "Performance"}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CTR</span>
                      <span className="font-semibold text-gray-900">
                        {templates.find((t) => t.id === selectedTemplate)
                          ?.performance.ctr}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {lang === "sv" ? "Visningar" : "Impressions"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {templates
                          .find((t) => t.id === selectedTemplate)
                          ?.performance.impressions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}