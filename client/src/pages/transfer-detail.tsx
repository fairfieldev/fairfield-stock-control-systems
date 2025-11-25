import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "lucide-react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import type { Transfer, Location, Product } from "@shared/schema";

export default function TransferDetail() {
  const [, params] = useRoute("/transfers/:id");
  const [, navigate] = useLocation();
  const transferId = params?.id;

  const { data: transfers = [] } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const transfer = transfers.find(t => t.id === transferId);

  if (!transfer) {
    return (
      <div className="space-y-6">
        <Button 
          onClick={() => navigate("/transfers")} 
          variant="outline"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transfers
        </Button>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Transfer not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getLocationName = (id: string) => {
    return locations.find(l => l.id === id)?.name || id;
  };

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || id;
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

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=1000");
    if (printWindow) {
      const itemsHtml = transfer.items.map(item => `
        <tr>
          <td>${item.productCode}</td>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
        </tr>
      `).join("");

      const shortagesHtml = transfer.shortages && transfer.shortages.length > 0 ? `
        <h3 style="font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Shortages</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Product Code</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Product Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Quantity Short</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.shortages.map((s: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${s.productCode}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${s.productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${s.quantityShort}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : "";

      const damagesHtml = transfer.damages && transfer.damages.length > 0 ? `
        <h3 style="font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Damages</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Product Code</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Product Name</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Quantity Damaged</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Reason</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.damages.map((d: any) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${d.productCode}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${d.productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${d.quantityDamaged}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${d.reason}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : "";

      const html = `
        <html>
          <head>
            <title>Transfer Report - ${transfer.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; }
              .header p { margin: 5px 0; color: #666; }
              .barcode { text-align: center; margin: 20px 0; }
              .barcode img { max-width: 200px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
              .info-box { border: 1px solid #ddd; padding: 15px; }
              .info-label { font-weight: bold; color: #666; font-size: 12px; }
              .info-value { font-size: 16px; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
              .status-badge { padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Transfer Report</h1>
              <p>Transfer ID: ${transfer.id}</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>

            <div class="barcode" id="barcode-container"></div>

            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">From Location</div>
                <div class="info-value">${getLocationName(transfer.fromLocationId)}</div>
              </div>
              <div class="info-box">
                <div class="info-label">To Location</div>
                <div class="info-value">${getLocationName(transfer.toLocationId)}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Driver Name</div>
                <div class="info-value">${transfer.driverName}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Vehicle Registration</div>
                <div class="info-value">${transfer.vehicleReg}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Status</div>
                <div class="info-value"><span class="status-badge">${transfer.status.replace("_", " ")}</span></div>
              </div>
              <div class="info-box">
                <div class="info-label">Created Date</div>
                <div class="info-value">${new Date(transfer.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <h3 style="font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Transfer Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            ${shortagesHtml}
            ${damagesHtml}

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
        <Button 
          onClick={() => navigate("/transfers")} 
          variant="outline"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transfers
        </Button>
        <Button 
          onClick={handlePrint} 
          variant="outline"
          size="sm"
          data-testid="button-print-detail"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Transfer
        </Button>
      </div>

      {/* Barcode */}
      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <QRCode 
            value={transfer.id} 
            size={200}
            level="H"
            includeMargin
            data-testid="barcode-transfer"
          />
          <p className="mt-4 text-sm text-muted-foreground font-mono">{transfer.id}</p>
        </CardContent>
      </Card>

      {/* Transfer Details */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">From Location</CardTitle>
          </CardHeader>
          <CardContent data-testid="text-from-location">
            {getLocationName(transfer.fromLocationId)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">To Location</CardTitle>
          </CardHeader>
          <CardContent data-testid="text-to-location">
            {getLocationName(transfer.toLocationId)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Driver Name</CardTitle>
          </CardHeader>
          <CardContent data-testid="text-driver">
            {transfer.driverName}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicle Registration</CardTitle>
          </CardHeader>
          <CardContent data-testid="text-vehicle">
            {transfer.vehicleReg}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(transfer.status)} data-testid="badge-status">
              {transfer.status.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Created Date</CardTitle>
          </CardHeader>
          <CardContent data-testid="text-created">
            {new Date(transfer.createdAt).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Product Code</th>
                  <th className="text-left py-2 px-2">Product Name</th>
                  <th className="text-right py-2 px-2">Quantity</th>
                  <th className="text-left py-2 px-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items.map((item, idx) => (
                  <tr key={idx} className="border-b" data-testid={`row-item-${idx}`}>
                    <td className="py-2 px-2 font-mono text-xs">{item.productCode}</td>
                    <td className="py-2 px-2">{item.productName}</td>
                    <td className="py-2 px-2 text-right font-semibold">{item.quantity}</td>
                    <td className="py-2 px-2">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Shortages */}
      {transfer.shortages && transfer.shortages.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-700">Shortages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Product Code</th>
                    <th className="text-left py-2 px-2">Product Name</th>
                    <th className="text-right py-2 px-2">Quantity Short</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.shortages.map((shortage: any, idx: number) => (
                    <tr key={idx} className="border-b" data-testid={`row-shortage-${idx}`}>
                      <td className="py-2 px-2 font-mono text-xs">{shortage.productCode}</td>
                      <td className="py-2 px-2">{shortage.productName}</td>
                      <td className="py-2 px-2 text-right">{shortage.quantityShort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Damages */}
      {transfer.damages && transfer.damages.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Damages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Product Code</th>
                    <th className="text-left py-2 px-2">Product Name</th>
                    <th className="text-right py-2 px-2">Quantity Damaged</th>
                    <th className="text-left py-2 px-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.damages.map((damage: any, idx: number) => (
                    <tr key={idx} className="border-b" data-testid={`row-damage-${idx}`}>
                      <td className="py-2 px-2 font-mono text-xs">{damage.productCode}</td>
                      <td className="py-2 px-2">{damage.productName}</td>
                      <td className="py-2 px-2 text-right">{damage.quantityDamaged}</td>
                      <td className="py-2 px-2">{damage.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
