import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { QRCodeSVG as QRCode } from "qrcode.react";
import type { Transfer, Location, Product } from "@shared/schema";

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeSearch, setBarcodeSearch] = useState("");

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

  const effectiveSearchTerm = barcodeSearch || searchTerm;
  const filteredTransfers = transfers.filter((transfer) => {
    const searchLower = effectiveSearchTerm.toLowerCase();
    const fromLocation = getLocationName(transfer.fromLocationId).toLowerCase();
    const toLocation = getLocationName(transfer.toLocationId).toLowerCase();
    
    return (
      fromLocation.includes(searchLower) ||
      toLocation.includes(searchLower) ||
      transfer.id.toLowerCase().includes(searchLower)
    );
  });

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>All Transfers Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; }
              .header p { margin: 5px 0; color: #666; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>All Transfers Report</h1>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Created</th>
                  <th>Dispatched</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransfers.map(transfer => `
                  <tr>
                    <td>${transfer.id}</td>
                    <td>${getLocationName(transfer.fromLocationId)}</td>
                    <td>${getLocationName(transfer.toLocationId)}</td>
                    <td>${transfer.status.replace("_", " ")}</td>
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
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold" data-testid="heading-transfers">
          All Transfers
        </h1>
        <Button 
          onClick={handlePrint} 
          variant="outline"
          size="sm"
          data-testid="button-print-transfers"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search by location or transfer ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setBarcodeSearch("");
              }}
              className="w-full"
              data-testid="input-search-transfers"
            />
            <Input
              type="text"
              placeholder="Or scan barcode here..."
              value={barcodeSearch}
              onChange={(e) => {
                setBarcodeSearch(e.target.value);
                setSearchTerm("");
              }}
              className="w-full"
              data-testid="input-barcode-scan"
              autoFocus
            />
          </div>

          {transfersLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading transfers...</p>
          ) : filteredTransfers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-transfers">
              No transfers found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer.id} data-testid={`row-transfer-${transfer.id}`}>
                      <TableCell className="text-center" data-testid={`barcode-cell-${transfer.id}`}>
                        <QRCode 
                          value={transfer.id} 
                          size={50}
                          level="L"
                          includeMargin={false}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm cursor-pointer hover:text-primary" data-testid={`text-id-${transfer.id}`}>
                        <Link href={`/transfers/${transfer.id}`}>
                          {transfer.id.substring(0, 12)}...
                        </Link>
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
                      <TableCell>
                        <Link href={`/transfers/${transfer.id}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-${transfer.id}`}>
                            View
                          </Button>
                        </Link>
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
