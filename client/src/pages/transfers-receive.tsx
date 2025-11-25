import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transfer, Location, ShortageItem, DamageItem } from "@shared/schema";

export default function TransfersReceive() {
  const { toast } = useToast();
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [shortages, setShortages] = useState<ShortageItem[]>([]);
  const [damages, setDamages] = useState<DamageItem[]>([]);

  const { data: transfers = [], isLoading } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PATCH", `/api/transfers/${id}/receive`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      setSelectedTransfer(null);
      setShortages([]);
      setDamages([]);
      toast({ title: "Transfer received successfully. Email notification sent." });
    },
  });

  const inTransitTransfers = transfers.filter((t) => t.status === "in_transit");

  const getLocationName = (id: string) => {
    return locations.find((l) => l.id === id)?.name || id;
  };

  const handleReceiveClick = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    // Initialize shortage and damage arrays
    setShortages([]);
    setDamages([]);
  };

  const addShortage = () => {
    if (!selectedTransfer) return;
    const firstItem = selectedTransfer.items[0];
    setShortages([
      ...shortages,
      {
        productId: firstItem.productId,
        productCode: firstItem.productCode,
        productName: firstItem.productName,
        quantityShort: 0,
      },
    ]);
  };

  const addDamage = () => {
    if (!selectedTransfer) return;
    const firstItem = selectedTransfer.items[0];
    setDamages([
      ...damages,
      {
        productId: firstItem.productId,
        productCode: firstItem.productCode,
        productName: firstItem.productName,
        quantityDamaged: 0,
        reason: "",
      },
    ]);
  };

  const handleSubmitReceive = () => {
    if (!selectedTransfer) return;

    receiveMutation.mutate({
      id: selectedTransfer.id,
      data: {
        shortages: shortages.filter((s) => s.quantityShort > 0),
        damages: damages.filter((d) => d.quantityDamaged > 0),
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold" data-testid="heading-receive">
        Receive Transfers
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>In Transit Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : inTransitTransfers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-transit">
              No transfers in transit
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inTransitTransfers.map((transfer) => (
                  <TableRow key={transfer.id} data-testid={`transfer-${transfer.id}`}>
                    <TableCell className="font-mono">{transfer.id}</TableCell>
                    <TableCell>{getLocationName(transfer.fromLocationId)}</TableCell>
                    <TableCell>{getLocationName(transfer.toLocationId)}</TableCell>
                    <TableCell>{transfer.driverName}</TableCell>
                    <TableCell>{transfer.items.length} items</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800" data-testid={`status-${transfer.id}`}>
                        In Transit
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleReceiveClick(transfer)}
                        data-testid={`button-receive-${transfer.id}`}
                      >
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Mark as Received
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedTransfer}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTransfer(null);
            setShortages([]);
            setDamages([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-receive">
          <DialogHeader>
            <DialogTitle>Receive Transfer #{selectedTransfer?.id}</DialogTitle>
            <DialogDescription>
              Review the transfer and report any shortages or damages
            </DialogDescription>
          </DialogHeader>

          {selectedTransfer && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">From</Label>
                  <p className="font-medium">{getLocationName(selectedTransfer.fromLocationId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">To</Label>
                  <p className="font-medium">{getLocationName(selectedTransfer.toLocationId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Driver</Label>
                  <p className="font-medium">{selectedTransfer.driverName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vehicle</Label>
                  <p className="font-mono">{selectedTransfer.vehicleReg}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold mb-2 block">Products in Transfer</Label>
                <div className="border rounded-md p-4 space-y-2">
                  {selectedTransfer.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.productCode} - {item.productName}
                      </span>
                      <span className="font-medium">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Shortages (Optional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addShortage} data-testid="button-add-shortage">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    Add Shortage
                  </Button>
                </div>
                {shortages.map((shortage, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 border rounded-md" data-testid={`shortage-${idx}`}>
                    <div className="col-span-6">
                      <Label className="text-xs">Product</Label>
                      <select
                        className="w-full mt-1 px-2 py-1 text-sm border rounded"
                        value={shortage.productId}
                        onChange={(e) => {
                          const product = selectedTransfer.items.find(
                            (i) => i.productId === e.target.value
                          );
                          if (product) {
                            const newShortages = [...shortages];
                            newShortages[idx] = {
                              productId: product.productId,
                              productCode: product.productCode,
                              productName: product.productName,
                              quantityShort: shortage.quantityShort,
                            };
                            setShortages(newShortages);
                          }
                        }}
                      >
                        {selectedTransfer.items.map((item) => (
                          <option key={item.productId} value={item.productId}>
                            {item.productCode} - {item.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <Label className="text-xs">Quantity Short</Label>
                      <Input
                        type="number"
                        min="0"
                        value={shortage.quantityShort}
                        onChange={(e) => {
                          const newShortages = [...shortages];
                          newShortages[idx].quantityShort = parseInt(e.target.value) || 0;
                          setShortages(newShortages);
                        }}
                        className="mt-1"
                        data-testid={`input-shortage-quantity-${idx}`}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShortages(shortages.filter((_, i) => i !== idx))}
                        data-testid={`button-remove-shortage-${idx}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Damages (Optional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addDamage} data-testid="button-add-damage">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    Add Damage
                  </Button>
                </div>
                {damages.map((damage, idx) => (
                  <div key={idx} className="space-y-2 p-3 border rounded-md" data-testid={`damage-${idx}`}>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6">
                        <Label className="text-xs">Product</Label>
                        <select
                          className="w-full mt-1 px-2 py-1 text-sm border rounded"
                          value={damage.productId}
                          onChange={(e) => {
                            const product = selectedTransfer.items.find(
                              (i) => i.productId === e.target.value
                            );
                            if (product) {
                              const newDamages = [...damages];
                              newDamages[idx] = {
                                ...newDamages[idx],
                                productId: product.productId,
                                productCode: product.productCode,
                                productName: product.productName,
                              };
                              setDamages(newDamages);
                            }
                          }}
                        >
                          {selectedTransfer.items.map((item) => (
                            <option key={item.productId} value={item.productId}>
                              {item.productCode} - {item.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs">Quantity Damaged</Label>
                        <Input
                          type="number"
                          min="0"
                          value={damage.quantityDamaged}
                          onChange={(e) => {
                            const newDamages = [...damages];
                            newDamages[idx].quantityDamaged = parseInt(e.target.value) || 0;
                            setDamages(newDamages);
                          }}
                          className="mt-1"
                          data-testid={`input-damage-quantity-${idx}`}
                        />
                      </div>
                      <div className="col-span-2 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDamages(damages.filter((_, i) => i !== idx))}
                          data-testid={`button-remove-damage-${idx}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Reason for Damage</Label>
                      <Textarea
                        value={damage.reason}
                        onChange={(e) => {
                          const newDamages = [...damages];
                          newDamages[idx].reason = e.target.value;
                          setDamages(newDamages);
                        }}
                        placeholder="Describe the damage..."
                        rows={2}
                        className="mt-1"
                        data-testid={`input-damage-reason-${idx}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedTransfer(null);
                setShortages([]);
                setDamages([]);
              }}
              data-testid="button-cancel-receive"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitReceive}
              disabled={receiveMutation.isPending}
              data-testid="button-confirm-receive"
            >
              {receiveMutation.isPending ? "Processing..." : "Confirm Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
