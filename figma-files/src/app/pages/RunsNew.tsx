import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Calendar,
  Activity,
} from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { Link } from "react-router";

interface Run {
  id: string;
  type: "crawl" | "sync" | "generation";
  status: "completed" | "failed" | "running";
  startTime: string;
  duration: string;
  itemsProcessed: number;
  itemsTotal: number;
  message?: string;
}

export function RunsNew() {
  const { lang } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "failed" | "running">("all");

  // Mock data
  const runs: Run[] = [
    {
      id: "run_12345",
      type: "crawl",
      status: "completed",
      startTime: "2026-02-06 14:30",
      duration: "2m 34s",
      itemsProcessed: 247,
      itemsTotal: 247,
      message: lang === "sv" ? "Alla objekt synkroniserade" : "All items synced",
    },
    {
      id: "run_12344",
      type: "generation",
      status: "completed",
      startTime: "2026-02-06 12:15",
      duration: "45s",
      itemsProcessed: 12,
      itemsTotal: 12,
      message: lang === "sv" ? "Nya mallar genererade" : "New templates generated",
    },
    {
      id: "run_12343",
      type: "sync",
      status: "completed",
      startTime: "2026-02-06 10:00",
      duration: "1m 12s",
      itemsProcessed: 247,
      itemsTotal: 247,
      message: lang === "sv" ? "Katalog uppdaterad" : "Catalog updated",
    },
    {
      id: "run_12342",
      type: "crawl",
      status: "failed",
      startTime: "2026-02-05 18:45",
      duration: "15s",
      itemsProcessed: 0,
      itemsTotal: 250,
      message: lang === "sv" ? "Anslutningsfel: Timeout" : "Connection error: Timeout",
    },
    {
      id: "run_12341",
      type: "crawl",
      status: "completed",
      startTime: "2026-02-05 14:30",
      duration: "2m 28s",
      itemsProcessed: 250,
      itemsTotal: 250,
      message: lang === "sv" ? "3 nya objekt upptäckta" : "3 new items discovered",
    },
    {
      id: "run_12340",
      type: "sync",
      status: "completed",
      startTime: "2026-02-05 10:00",
      duration: "1m 8s",
      itemsProcessed: 250,
      itemsTotal: 250,
    },
    {
      id: "run_12339",
      type: "generation",
      status: "completed",
      startTime: "2026-02-04 16:20",
      duration: "52s",
      itemsProcessed: 8,
      itemsTotal: 8,
    },
    {
      id: "run_12338",
      type: "crawl",
      status: "completed",
      startTime: "2026-02-04 14:30",
      duration: "2m 31s",
      itemsProcessed: 245,
      itemsTotal: 245,
    },
  ];

  const filteredRuns = runs.filter((run) => {
    if (filterStatus === "all") return true;
    return run.status === filterStatus;
  });

  const getRunTypeLabel = (type: string) => {
    if (lang === "sv") {
      switch (type) {
        case "crawl":
          return "Hämtning";
        case "sync":
          return "Synkronisering";
        case "generation":
          return "Generering";
        default:
          return type;
      }
    } else {
      switch (type) {
        case "crawl":
          return "Crawl";
        case "sync":
          return "Sync";
        case "generation":
          return "Generation";
        default:
          return type;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: {
        background: "#d1fae5",
        color: "#065f46",
        border: "1px solid #a7f3d0",
      },
      failed: {
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      },
      running: {
        background: "#dbeafe",
        color: "#1e40af",
        border: "1px solid #93c5fd",
      },
    };

    const labels = {
      completed: lang === "sv" ? "Slutförd" : "Completed",
      failed: lang === "sv" ? "Misslyckad" : "Failed",
      running: lang === "sv" ? "Körs" : "Running",
    };

    return (
      <Badge style={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Stats
  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;
  const successRate = ((completedRuns / totalRuns) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {lang === "sv" ? "Körningar" : "Runs"}
        </h1>
        <p className="text-sm text-gray-600">
          {lang === "sv"
            ? "Historik över automatiseringskörningar"
            : "Automation run history"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Totalt" : "Total runs"}
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalRuns}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Slutförda" : "Completed"}
                </div>
                <div className="text-3xl font-bold text-green-600">{completedRuns}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Misslyckade" : "Failed"}
                </div>
                <div className="text-3xl font-bold text-red-600">{failedRuns}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Framgångsgrad" : "Success rate"}
                </div>
                <div className="text-3xl font-bold text-gray-900">{successRate}%</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 bg-white mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              {lang === "sv" ? "Alla" : "All"}
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              {lang === "sv" ? "Slutförda" : "Completed"}
            </Button>
            <Button
              variant={filterStatus === "failed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("failed")}
            >
              {lang === "sv" ? "Misslyckade" : "Failed"}
            </Button>
            <Button
              variant={filterStatus === "running" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("running")}
            >
              {lang === "sv" ? "Körs" : "Running"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Runs List */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      run.status === "completed"
                        ? "bg-green-50"
                        : run.status === "failed"
                        ? "bg-red-50"
                        : "bg-blue-50"
                    }`}
                  >
                    {getStatusIcon(run.status)}
                  </div>

                  {/* Run Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-gray-900">{getRunTypeLabel(run.type)}</p>
                      {getStatusBadge(run.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{run.startTime}</span>
                      <span className="text-gray-300">•</span>
                      <span>{run.duration}</span>
                      <span className="text-gray-300">•</span>
                      <span>
                        {run.itemsProcessed}/{run.itemsTotal}{" "}
                        {lang === "sv" ? "objekt" : "items"}
                      </span>
                    </div>
                    {run.message && (
                      <p
                        className={`text-sm mt-1 ${
                          run.status === "failed" ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {run.message}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {run.status === "running" && (
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${(run.itemsProcessed / run.itemsTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>

          {filteredRuns.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {lang === "sv" ? "Inga körningar hittades" : "No runs found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}