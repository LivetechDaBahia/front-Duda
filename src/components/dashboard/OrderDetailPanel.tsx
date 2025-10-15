import { PurchaseOrder } from '@/types/order';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, Mail, MapPin, Package, User } from 'lucide-react';

interface OrderDetailPanelProps {
  order: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  completed: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  approved: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  declined: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const OrderDetailPanel = ({ order, open, onClose }: OrderDetailPanelProps) => {
  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto animate-slide-in">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl">{order.id}</SheetTitle>
              <p className="text-muted-foreground mt-1">Purchase Order Details</p>
            </div>
            <Badge className={statusColors[order.status]}>
              {order.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Client Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Client Information</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{order.clientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.clientEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Order Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Total Value</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${order.value.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Total Items</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {order.items}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(order.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Description</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{order.description}</p>
            </div>
          </div>

          <Separator />

          {/* Addresses */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Addresses</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                    <p className="font-medium">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Billing Address</p>
                    <p className="font-medium">{order.billingAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
