import { PurchaseOrder } from '@/types/order';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Package, User } from 'lucide-react';

interface OrderCardProps {
  order: PurchaseOrder;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, orderId: string) => void;
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  completed: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  approved: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  declined: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const OrderCard = ({ order, onClick, onDragStart }: OrderCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, order.id);
    }
  };

  return (
    <Card 
      className="p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-[1.02] animate-scale-in bg-gradient-to-br from-card to-card/50"
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.clientName}
            </p>
          </div>
          <Badge className={statusColors[order.status]}>
            {order.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Value
            </span>
            <span className="font-semibold text-foreground">
              ${order.value.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              Items
            </span>
            <span className="font-medium text-foreground">{order.items}</span>
          </div>
          
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due
            </span>
            <span className="font-medium text-foreground">
              {new Date(order.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
