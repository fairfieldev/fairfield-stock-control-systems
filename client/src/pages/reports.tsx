import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import type { Transfer, Location, Product } from "@shared/schema";

export default function Reports() {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: transfers = [], isLoading: transfersLoading } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const getLocationName = (id: string) => {
    return locations.find((l) => l.id === id)?.name || id;
  };

  const getProductName = (id: string) => {
    return products.find((p) => p.id === id)?.name || id;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in_transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const filteredTransfers = filterStatus === "all" 
    ? transfers 
    : transfers.filter(t => t.status === filterStatus);

  // Calculate statistics
  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === "pending").length,
    dispatched: transfers.filter(t => t.status === "in_transit").length,
    received: transfers.filter(t => t.status === "received").length,
    totalItems: transfers.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0),
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      const summaryHtml = `
        <html>
          <head>
            <title>Transfer Reports</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; }
              .header p { margin: 5px 0; color: #666; }
              .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 30px; }
              .stat-card { border: 1px solid #ccc; padding: 15px; text-align: center; }
              .stat-card .number { font-size: 24px; font-weight: bold; }
              .stat-card .label { font-size: 12px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Transfer Reports</h1>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>

            <div class="stats">
              <div class="stat-card">
                <div class="number">${stats.total}</div>
                <div class="label">Total Transfers</div>
              </div>
              <div class="stat-card">
                <div class="number">${stats.pending}</div>
                <div class="label">Pending</div>
              </div>
              <div class="stat-card">
                <div class="number">${stats.dispatched}</div>
                <div class="label">Dispatched</div>
              </div>
              <div class="stat-card">
                <div class="number">${stats.received}</div>
                <div class="label">Received</div>
              </div>
              <div class="stat-card">
                <div class="number">${stats.totalItems}</div>
                <div class="label">Total Items</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Created Date</th>
                  <th>Dispatched Date</th>
                  <th>Received Date</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransfers.map(transfer => `
                  <tr>
                    <td>${transfer.id.substring(0, 12)}...</td>
                    <td>${getLocationName(transfer.fromLocationId)}</td>
                    <td>${getLocationName(transfer.toLocationId)}</td>
                    <td><span class="status-badge">${transfer.status.replace("_", " ")}</span></td>
                    <td>${transfer.items.length}</td>
                    <td>${new Date(transfer.createdAt).toLocaleDateString()}</td>
                    <td>${transfer.dispatchedAt ? new Date(transfer.dispatchedAt).toLocaleDateString() : "-"}</td>
                    <td>${transfer.receivedAt ? new Date(transfer.receivedAt).toLocaleDateString() : "-"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="footer">
              <p>This is an automated report from Fairfield Stock Control System</p>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(summaryHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" data-testid="heading-reports">
          Reports
        </h1>
        <Button 
          onClick={handlePrint} 
          variant="outline"
          size="sm"
          data-testid="button-print-reports"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dispatched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.dispatched}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.received}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transfer History</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                data-testid="button-filter-all"
              >
                All
              </Button>
              <Button 
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("pending")}
                data-testid="button-filter-pending"
              >
                Pending
              </Button>
              <Button 
                variant={filterStatus === "in_transit" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("in_transit")}
                data-testid="button-filter-dispatched"
              >
                Dispatched
              </Button>
              <Button 
                variant={filterStatus === "received" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("received")}
                data-testid="button-filter-received"
              >
                Received
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transfersLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading reports...</p>
          ) : filteredTransfers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-transfers">
              No transfers found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Dispatched</TableHead>
                    <TableHead>Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer.id} data-testid={`row-transfer-${transfer.id}`}>
                      <TableCell className="font-mono text-sm" data-testid={`text-id-${transfer.id}`}>
                        {transfer.id.substring(0, 12)}...
                      </TableCell>
                      <TableCell data-testid={`text-from-${transfer.id}`}>
                        {getLocationName(transfer.fromLocationId)}
                      </TableCell>
                      <TableCell data-testid={`text-to-${transfer.id}`}>
                        {getLocationName(transfer.toLocationId)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transfer.status)} data-testid={`badge-status-${transfer.id}`}>
                          {transfer.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-items-${transfer.id}`}>
                        {transfer.items.length} item{transfer.items.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-created-${transfer.id}`}>
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-dispatched-${transfer.id}`}>
                        {transfer.dispatchedAt
                          ? new Date(transfer.dispatchedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-received-${transfer.id}`}>
                        {transfer.receivedAt
                          ? new Date(transfer.receivedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
