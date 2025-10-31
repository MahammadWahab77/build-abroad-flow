import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Users, UserCog, BarChart3, FileUp, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = profile?.role === "admin";
  const basePath = isAdmin ? "/admin" : "/counselor";

  const navigation = isAdmin
    ? [
        { name: "Dashboard", href: "/admin", icon: Home },
        { name: "Leads", href: "/admin/leads", icon: Users },
        { name: "Users", href: "/admin/users", icon: UserCog },
        { name: "Reports", href: "/admin/reports", icon: BarChart3 },
        { name: "Import", href: "/admin/import", icon: FileUp },
      ]
    : [
        { name: "Dashboard", href: "/counselor", icon: Home },
        { name: "My Leads", href: "/counselor/leads", icon: Users },
      ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">Build Abroad</span>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/40 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
