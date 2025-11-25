import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Location, Product, InsertTransfer, TransferItem } from "@shared/schema";

export default function NewTransfer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fromLocationId: "",
    toLocationId: "",
    driverName: "",
    vehicleReg: "",
  });
  
  const [items, setItems] = useState<TransferItem[]>([]);
  const [searchFilter, setSearchFilter] = useState("");

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTransfer) => apiRequest("POST", "/api/transfers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      toast({ title: "Transfer created successfully" });
      setLocation("/dispatch");
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productCode: "",
        productName: "",
        quantity: 1,
        unit: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TransferItem, value: any) => {
    const newItems = [...items];
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          unit: product.unit,
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive",
      });
      return;
    }

    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all product details",
        variant: "destructive",
      });
      return;
    }

    const transferData: InsertTransfer = {
      ...formData,
      status: "pending",
      items,
      createdBy: "current-user", // Will be replaced with actual user
    };

    createMutation.mutate(transferData);
  };

  const filteredProducts = products.filter((p) =>
    searchFilter
      ? p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.code.toLowerCase().includes(searchFilter.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold" data-testid="heading-new-transfer">Create New Transfer</h1>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromLocation">From Location</Label>
                <Select
                  value={formData.fromLocationId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromLocationId: value })
                  }
                  required
                >
                  <SelectTrigger id="fromLocation" data-testid="select-from-location">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toLocation">To Location</Label>
                <Select
                  value={formData.toLocationId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, toLocationId: value })
                  }
                  required
                >
                  <SelectTrigger id="toLocation" data-testid="select-to-location">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter((loc) => loc.id !== formData.fromLocationId)
                      .map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) =>
                    setFormData({ ...formData, driverName: e.target.value })
                  }
                  placeholder="Enter driver name"
                  required
                  data-testid="input-driver-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleReg">Vehicle Registration</Label>
                <Input
                  id="vehicleReg"
                  value={formData.vehicleReg}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleReg: e.target.value })
                  }
                  placeholder="e.g., ABC-1234"
                  required
                  data-testid="input-vehicle-reg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Products</Label>
                <Button type="button" onClick={addItem} variant="outline" data-testid="button-add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Label>Filter Products</Label>
                  <Input
                    placeholder="Type to filter products in dropdowns..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    data-testid="input-product-filter"
                  />
                </div>
              )}

              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-md" data-testid="text-no-items">
                  No products added yet. Click "Add Product" to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border rounded-md"
                      data-testid={`transfer-item-${index}`}
                    >
                      <div className="md:col-span-5 space-y-2">
                        <Label>Product</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateItem(index, "productId", value)}
                          required
                        >
                          <SelectTrigger data-testid={`select-product-${index}`}>
                            <SelectValue placeholder="Select product..." />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.code} - {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", parseInt(e.target.value) || 1)
                          }
                          required
                          data-testid={`input-quantity-${index}`}
                        />
                      </div>

                      <div className="md:col-span-3 space-y-2">
                        <Label>Unit</Label>
                        <Input
                          value={item.unit}
                          readOnly
                          className="bg-muted"
                          placeholder="Auto-filled"
                          data-testid={`input-unit-${index}`}
                        />
                      </div>

                      <div className="md:col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                          data-testid={`button-remove-item-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-create-transfer"
              >
                {createMutation.isPending ? "Creating..." : "Create Transfer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
