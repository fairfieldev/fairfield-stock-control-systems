import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transfer, Location } from "@shared/schema";

export default function TransfersDispatch() {
  const { toast } = useToast();

  const { data: transfers = [], isLoading } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/transfers/${id}/dispatch`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      toast({ title: "Transfer dispatched successfully" });
    },
  });

  const pendingTransfers = transfers.filter((t) => t.status === "pending");

  const getLocationName = (id: string) => {
    return locations.find((l) => l.id === id)?.name || id;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold" data-testid="heading-dispatch">
        Dispatch Transfers
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : pendingTransfers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-pending">
              No pending transfers to dispatch
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransfers.map((transfer) => (
                  <TableRow key={transfer.id} data-testid={`transfer-${transfer.id}`}>
                    <TableCell className="font-mono">{transfer.id}</TableCell>
                    <TableCell>{getLocationName(transfer.fromLocationId)}</TableCell>
                    <TableCell>{getLocationName(transfer.toLocationId)}</TableCell>
                    <TableCell>{transfer.driverName}</TableCell>
                    <TableCell className="font-mono">{transfer.vehicleReg}</TableCell>
                    <TableCell>{transfer.items.length} items</TableCell>
                    <TableCell>
                      <Badge variant="secondary" data-testid={`status-${transfer.id}`}>
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (confirm("Dispatch this transfer?")) {
                            dispatchMutation.mutate(transfer.id);
                          }
                        }}
                        disabled={dispatchMutation.isPending}
                        data-testid={`button-dispatch-${transfer.id}`}
                      >
                        <Send className="h-3 w-3 mr-2" />
                        Dispatch
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
