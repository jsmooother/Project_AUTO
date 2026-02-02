import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Users, Globe, Play, DollarSign, Settings, Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export function AdminLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="mx-auto max-w-[1600px] px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-400" />
                <span className="text-white font-semibold">Project Auto</span>
                <Badge className="bg-red-600 text-xs">ADMIN</Badge>
              </div>
              <div className="text-xs text-gray-400">Internal Dashboard</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">admin@projectauto.com</div>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)]">
          <nav className="p-3 space-y-1">
            <Link to="/admin/overview">
              <Button
                variant={isActive("/admin/overview") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </Button>
            </Link>
            <Link to="/admin/customers">
              <Button
                variant={isActive("/admin/customers") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Users className="h-4 w-4" />
                Customers
              </Button>
            </Link>
            <Link to="/admin/sources">
              <Button
                variant={isActive("/admin/sources") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Globe className="h-4 w-4" />
                Inventory Sources
              </Button>
            </Link>
            <Link to="/admin/runs">
              <Button
                variant={isActive("/admin/runs") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Play className="h-4 w-4" />
                Runs & Automations
              </Button>
            </Link>
            <Link to="/admin/billing">
              <Button
                variant={isActive("/admin/billing") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <DollarSign className="h-4 w-4" />
                Billing & Payments
              </Button>
            </Link>
            <Link to="/admin/system">
              <Button
                variant={isActive("/admin/system") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <Settings className="h-4 w-4" />
                System Config
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
