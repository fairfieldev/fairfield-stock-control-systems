import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transfer, Location, Product } from "@shared/schema";

export default function Transfers() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredTransfers = transfers.filter((transfer) => {
    const searchLower = searchTerm.toLowerCase();
    const fromLocation = getLocationName(transfer.fromLocationId).toLowerCase();
    const toLocation = getLocationName(transfer.toLocationId).toLowerCase();
    
    return (
      fromLocation.includes(searchLower) ||
      toLocation.includes(searchLower) ||
      transfer.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold" data-testid="heading-transfers">
        All Transfers
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Search by location or transfer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            data-testid="input-search-transfers"
          />

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
                    <TableHead>ID</TableHead>
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
                        {transfer.id.substring(0, 8)}...
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
