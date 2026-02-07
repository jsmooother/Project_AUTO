import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Target,
  Info,
  TrendingUp,
} from "lucide-react";

type BoostStatus = "active" | "completed" | "scheduled" | "cancelled";

interface Boost {
  id: string;
  name: string;
  vehicle_id: string;
  vehicle_name: string;
  status: BoostStatus;
  budget: number;
  currency: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  spend: number;
}

export function AdsBoosts() {
  const [creatingBoost, setCreatingBoost] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [boostBudget, setBoostBudget] = useState("");
  const [boostDuration, setBoostDuration] = useState("7");

  // Mock boost campaigns
  const boosts: Boost[] = [
    {
      id: "boost_001",
      name: "New Year Sale - Tesla Model Y",
      vehicle_id: "veh_002",
      vehicle_name: "2023 Tesla Model Y Long Range",
      status: "active",
      budget: 2000,
      currency: "SEK",
      duration_days: 7,
      start_date: "2026-02-01",
      end_date: "2026-02-08",
      impressions: 45280,
      clicks: 892,
      spend: 1240,
    },
    {
      id: "boost_002",
      name: "Featured - Volvo XC90",
      vehicle_id: "veh_001",
      vehicle_name: "2024 Volvo XC90 T8 AWD",
      status: "completed",
      budget: 1500,
      currency: "SEK",
      duration_days: 5,
      start_date: "2026-01-20",
      end_date: "2026-01-25",
      impressions: 38420,
      clicks: 756,
      spend: 1500,
    },
    {
      id: "boost_003",
      name: "Weekend Special - BMW X5",
      vehicle_id: "veh_003",
      vehicle_name: "2024 BMW X5 xDrive40i",
      status: "scheduled",
      budget: 1000,
      currency: "SEK",
      duration_days: 3,
      start_date: "2026-02-15",
      end_date: "2026-02-18",
      impressions: 0,
      clicks: 0,
      spend: 0,
    },
  ];

  // Mock available vehicles
  const availableVehicles = [
    { id: "veh_001", name: "2024 Volvo XC90 T8 AWD" },
    { id: "veh_002", name: "2023 Tesla Model Y Long Range" },
    { id: "veh_003", name: "2024 BMW X5 xDrive40i" },
    { id: "veh_004", name: "2023 Audi Q7 55 TFSI quattro" },
    { id: "veh_005", name: "2024 Mercedes-Benz GLE 450" },
  ];

  const handleCreateBoost = () => {
    console.log("Creating boost:", {
      vehicle: selectedVehicle,
      budget: boostBudget,
      duration: boostDuration,
    });
    // In production: POST to /api/ads/boosts
    setCreatingBoost(false);
    setSelectedVehicle("");
    setBoostBudget("");
    setBoostDuration("7");
  };

  const getStatusBadge = (status: BoostStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "completed":
        return <Badge className="bg-gray-600">Completed</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-600">Scheduled</Badge>;
      case "cancelled":
        return <Badge className="bg-red-600">Cancelled</Badge>;
    }
  };

  const getStatusIcon = (status: BoostStatus) => {
    switch (status) {
      case "active":
        return <Zap className="h-4 w-4 text-green-600" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/app/ads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ads
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Boost Campaigns</h1>
            <p className="text-gray-600">On-demand promotion for specific vehicles</p>
          </div>
          <Button onClick={() => setCreatingBoost(!creatingBoost)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Boost
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">About Boost Campaigns</p>
                <p>
                  Boosts are short-term, high-visibility campaigns for specific vehicles. Use them for
                  special promotions, new arrivals, or vehicles you want to move quickly. Boosts run
                  alongside your Always On campaign with a dedicated budget.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Boost Form */}
        {creatingBoost && (
          <Card className="border-2 border-blue-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Create New Boost</CardTitle>
                  <CardDescription>Set up a targeted boost campaign</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Selection */}
              <div>
                <Label htmlFor="vehicle" className="text-sm font-semibold mb-3 block">
                  Select Vehicle to Boost
                </Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Choose a vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Select which vehicle you want to promote with this boost campaign
                </p>
              </div>

              {/* Budget and Duration Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Budget */}
                <div>
                  <Label htmlFor="budget" className="text-sm font-semibold mb-3 block">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Boost Budget (SEK)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="1000"
                    value={boostBudget}
                    onChange={(e) => setBoostBudget(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Total budget for this boost campaign
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration" className="text-sm font-semibold mb-3 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Duration
                  </Label>
                  <Select value={boostDuration} onValueChange={setBoostDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    How long to run this boost campaign
                  </p>
                </div>
              </div>

              {/* Preview */}
              {selectedVehicle && boostBudget && (
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <div className="text-sm font-semibold mb-3">Boost Preview</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">
                        {availableVehicles.find((v) => v.id === selectedVehicle)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Budget:</span>
                      <span className="font-medium">{boostBudget} SEK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{boostDuration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Budget:</span>
                      <span className="font-medium">
                        ~{Math.round(parseInt(boostBudget) / parseInt(boostDuration))} SEK/day
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Est. Start:</span>
                      <span className="font-medium">Immediately</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setCreatingBoost(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBoost}
                  disabled={!selectedVehicle || !boostBudget}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Launch Boost
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active & Scheduled Boosts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Active & Scheduled Boosts</CardTitle>
                  <CardDescription>Currently running and upcoming boost campaigns</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boost Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boosts
                  .filter((boost) => boost.status === "active" || boost.status === "scheduled")
                  .map((boost) => (
                    <TableRow key={boost.id}>
                      <TableCell className="font-medium">{boost.name}</TableCell>
                      <TableCell className="text-sm">{boost.vehicle_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(boost.status)}
                          {getStatusBadge(boost.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(boost.start_date)} - {formatDate(boost.end_date)}
                        <div className="text-xs text-gray-500">{boost.duration_days} days</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {boost.budget.toLocaleString()} {boost.currency}
                      </TableCell>
                      <TableCell className="text-right">
                        {boost.status === "scheduled" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className="font-medium">
                            {boost.spend.toLocaleString()} {boost.currency}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {boost.status === "scheduled" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="text-sm">
                            <div className="font-medium">
                              {boost.impressions.toLocaleString()} views
                            </div>
                            <div className="text-gray-500">{boost.clicks} clicks</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {boosts.filter((boost) => boost.status === "active" || boost.status === "scheduled")
                  .length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No active or scheduled boosts. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Completed Boosts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle>Completed Boosts</CardTitle>
                <CardDescription>Past boost campaigns and their results</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boost Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boosts
                  .filter((boost) => boost.status === "completed")
                  .map((boost) => (
                    <TableRow key={boost.id}>
                      <TableCell className="font-medium">{boost.name}</TableCell>
                      <TableCell className="text-sm">{boost.vehicle_name}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(boost.start_date)} - {formatDate(boost.end_date)}
                        <div className="text-xs text-gray-500">{boost.duration_days} days</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {boost.budget.toLocaleString()} {boost.currency}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {boost.spend.toLocaleString()} {boost.currency}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <div className="font-medium">
                            {boost.impressions.toLocaleString()} views
                          </div>
                          <div className="text-gray-500">{boost.clicks} clicks</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">Boost Best Practices</p>
                <ul className="space-y-1 list-disc list-inside text-gray-600">
                  <li>Use boosts for time-sensitive promotions or new inventory</li>
                  <li>Recommended minimum budget: 1,000 SEK for meaningful results</li>
                  <li>Shorter boosts (3-7 days) work well for urgency-driven sales</li>
                  <li>Boosts run in addition to your Always On campaign</li>
                  <li>Budget is spent evenly across the duration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
