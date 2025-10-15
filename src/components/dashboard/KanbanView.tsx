import { PurchaseOrder, OrderStatus } from '@/types/order';
import { OrderCard } from './OrderCard';

interface KanbanViewProps {
  orders: PurchaseOrder[];
  onOrderClick: (order: PurchaseOrder) => void;
}

const columns: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'border-warning' },
  { status: 'processing', label: 'Processing', color: 'border-info' },
  { status: 'completed', label: 'Completed', color: 'border-[hsl(var(--success))]' },
  { status: 'cancelled', label: 'Cancelled', color: 'border-destructive' },
];

export const KanbanView = ({ orders, onOrderClick }: KanbanViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {columns.map(({ status, label, color }) => {
        const columnOrders = orders.filter(order => order.status === status);
        
        return (
          <div key={status} className="flex flex-col">
            <div className={`mb-4 pb-2 border-b-2 ${color}`}>
              <h3 className="font-semibold text-foreground flex items-center justify-between">
                {label}
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {columnOrders.length}
                </span>
              </h3>
            </div>
            
            <div className="space-y-3 flex-1">
              {columnOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => onOrderClick(order)}
                />
              ))}
              
              {columnOrders.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                  No orders
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
