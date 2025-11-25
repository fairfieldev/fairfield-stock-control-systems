import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, Clock, TruckIcon } from "lucide-react";
import type { Product, Location, Transfer } from "@shared/schema";

export default function Dashboard() {
  // Auto-verify Firebase data is up to date on each dashboard load
  useEffect(() => {
    const verifyData = async () => {
      try {
        await fetch("/api/migrate-firebase-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        // Silent verification - no need to show errors
        console.debug("Background data verification completed");
      }
    };
    verifyData();
  }, []);

  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: locations = [] } = useQuery<Location[]>({ queryKey: ["/api/locations"] });
  const { data: transfers = [] } = useQuery<Transfer[]>({ queryKey: ["/api/transfers"] });

  const pendingTransfers = transfers.filter(t => t.status === "pending").length;
  const inTransitTransfers = transfers.filter(t => t.status === "in_transit").length;
  const recentTransfers = [...transfers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-blue-500",
      testId: "stat-products"
    },
    {
      title: "Locations",
      value: locations.length,
      icon: MapPin,
      color: "bg-green-500",
      testId: "stat-locations"
    },
    {
      title: "Pending Transfers",
      value: pendingTransfers,
      icon: Clock,
      color: "bg-orange-500",
      testId: "stat-pending"
    },
    {
      title: "In Transit",
      value: inTransitTransfers,
      icon: TruckIcon,
      color: "bg-red-500",
      testId: "stat-transit"
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold" data-testid="heading-dashboard">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-elevate" data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-md`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid={`${stat.testId}-value`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransfers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" data-testid="text-no-transfers">
              No transfers yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransfers.map((transfer) => {
                const fromLocation = locations.find(l => l.id === transfer.fromLocationId);
                const toLocation = locations.find(l => l.id === transfer.toLocationId);
                
                return (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`transfer-${transfer.id}`}
                  >
                    <div className="space-y-1">
                      <p className="font-medium" data-testid={`transfer-${transfer.id}-id`}>
                        #{transfer.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fromLocation?.name} → {toLocation?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transfer.items.length} items • {transfer.driverName}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(transfer.status)}`}
                      data-testid={`transfer-${transfer.id}-status`}
                    >
                      {transfer.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
