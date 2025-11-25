import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Plus,
  Send,
  Download,
  List,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Locations from "@/pages/locations";
import NewTransfer from "@/pages/transfers-new";
import TransfersDispatch from "@/pages/transfers-dispatch";
import TransfersReceive from "@/pages/transfers-receive";
import Transfers from "@/pages/transfers";
import UserManagement from "@/pages/user-management";
import IntegrationSettings from "@/pages/integration-settings";

function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch logo from system settings
    fetch("/api/system-settings")
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      })
      .catch(err => console.error("Failed to fetch logo:", err));
  }, []);

  const hasPermission = (tabId: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.permissions?.includes(tabId) || false;
  };

  const navigationItems = [
    { id: "dashboard", path: "/", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", path: "/products", label: "Products", icon: Package },
    { id: "locations", path: "/locations", label: "Locations", icon: MapPin },
    { id: "new-transfer", path: "/transfers/new", label: "New Transfer", icon: Plus },
    { id: "dispatch", path: "/transfers/dispatch", label: "Dispatch", icon: Send },
    { id: "receive", path: "/transfers/receive", label: "Receive", icon: Download },
    { id: "all-transfers", path: "/transfers", label: "All Transfers", icon: List },
    { id: "reports", path: "/reports", label: "Reports", icon: BarChart3 },
    { id: "users", path: "/users", label: "User Management", icon: Users },
    { id: "integration", path: "/integration", label: "Integration", icon: Settings },
  ];

  const visibleItems = navigationItems.filter((item) => hasPermission(item.id));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4">
            {logoUrl && (
              <div className="mb-3 flex justify-center">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-12 w-auto object-contain"
                  data-testid="logo-sidebar"
                />
              </div>
            )}
            <SidebarGroupLabel className="text-lg font-bold">
              Fairfield Stock Control
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.path}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {user && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                Role: {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/login" />;
  }

  const hasPermission = (tabId: string) => {
    if (user.role === "admin") return true;
    return user.permissions?.includes(tabId) || false;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            {hasPermission("products") && <Route path="/products" component={Products} />}
            {hasPermission("locations") && <Route path="/locations" component={Locations} />}
            {hasPermission("new-transfer") && <Route path="/transfers/new" component={NewTransfer} />}
            {hasPermission("dispatch") && <Route path="/transfers/dispatch" component={TransfersDispatch} />}
            {hasPermission("receive") && <Route path="/transfers/receive" component={TransfersReceive} />}
            {hasPermission("all-transfers") && <Route path="/transfers" component={Transfers} />}
            {hasPermission("users") && <Route path="/users" component={UserManagement} />}
            {hasPermission("integration") && <Route path="/integration" component={IntegrationSettings} />}
            <Route>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
                  <p className="text-gray-600">You don't have permission to view this page.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <LoginPage onLogin={login} />}
      </Route>
      <Route>
        <AuthenticatedApp />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
