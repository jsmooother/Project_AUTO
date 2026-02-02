import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Package, Play, DollarSign, Settings as SettingsIcon, ChevronDown, Palette } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export function AppLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/app/dashboard" className="text-xl font-semibold tracking-tight">
                Project Auto
              </Link>

              <nav className="flex items-center gap-1">
                <Link to="/app/dashboard">
                  <Button
                    variant={isActive("/app/dashboard") ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/app/inventory">
                  <Button
                    variant={isActive("/app/inventory") ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Inventory
                  </Button>
                </Link>
                <Link to="/app/automation">
                  <Button
                    variant={isActive("/app/automation") ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Automation
                  </Button>
                </Link>
                <Link to="/app/templates">
                  <Button
                    variant={isActive("/app/templates") ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    Templates
                  </Button>
                </Link>
                <Link to="/app/billing">
                  <Button
                    variant={isActive("/app/billing") ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Billing
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/app/settings">
                <Button variant="ghost" size="icon">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      AC
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Account</DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/app/billing">Billing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}