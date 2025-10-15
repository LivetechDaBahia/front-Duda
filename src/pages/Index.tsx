import { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KanbanView } from '@/components/dashboard/KanbanView';
import { TableView } from '@/components/dashboard/TableView';
import { OrderDetailPanel } from '@/components/dashboard/OrderDetailPanel';
import { mockOrders } from '@/data/mockOrders';
import { PurchaseOrder, OrderStatus } from '@/types/order';
import { toast } from 'sonner';

const Index = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleOrderClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />
      
      <main className="container mx-auto px-6 py-8">
        {viewMode === 'kanban' ? (
          <KanbanView 
            orders={orders} 
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TableView 
            orders={orders} 
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      <OrderDetailPanel
        order={selectedOrder}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};

export default Index;
