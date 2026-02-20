import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesItem } from "@/types/sales";
import { getSalesItemDetails } from "@/data/mockSales";
import { useMemo } from "react";

interface SalesDetailPanelProps {
  item: SalesItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number, currency: string = "BRL") => {
  const currencyMap: Record<string, string> = { R$: "BRL", US$: "USD", "€": "EUR" };
  const code = currencyMap[currency] || currency || "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: code }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesDetailPanel = ({ item, isOpen, onClose }: SalesDetailPanelProps) => {
  const details = useMemo(() => {
    if (!item) return null;
    return getSalesItemDetails(item.id);
  }, [item]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {item?.offer} - {item?.clientName}
          </SheetTitle>
        </SheetHeader>

        {item && details && (
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Order Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Offer:</span>
                    <p className="font-medium">{details.overview.offer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Client:</span>
                    <p className="font-medium">{details.overview.client} - {details.overview.clientName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value:</span>
                    <p className="font-medium">{formatCurrency(details.overview.value, details.overview.currency)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seller:</span>
                    <p className="font-medium">{details.overview.sellerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{details.overview.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{details.overview.date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment:</span>
                    <p className="font-medium">{details.overview.paymentConditions}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Observations:</span>
                    <p className="font-medium">{details.overview.observations}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4 mt-4">
              <h3 className="font-semibold">Products</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.unitPrice, item.currency)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.total, item.currency)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4 mt-4">
              <h3 className="font-semibold">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{details.shipping.address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">City:</span>
                  <p className="font-medium">{details.shipping.city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">State:</span>
                  <p className="font-medium">{details.shipping.state}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ZIP Code:</span>
                  <p className="font-medium">{details.shipping.zipCode}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Method:</span>
                  <p className="font-medium">{details.shipping.method}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Delivery:</span>
                  <p className="font-medium">{details.shipping.estimatedDelivery}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tracking:</span>
                  <p className="font-medium">{details.shipping.trackingCode}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};
