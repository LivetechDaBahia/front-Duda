import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KanbanView } from '@/components/dashboard/KanbanView';
import { TableView } from '@/components/dashboard/TableView';
import { OrderDetailPanel } from '@/components/dashboard/OrderDetailPanel';
import { mockOrders } from '@/data/mockOrders';
import { PurchaseOrder } from '@/types/order';

const Index = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleOrderClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />
      
      <main className="container mx-auto px-6 py-8">
        {viewMode === 'kanban' ? (
          <KanbanView orders={mockOrders} onOrderClick={handleOrderClick} />
        ) : (
          <TableView orders={mockOrders} onOrderClick={handleOrderClick} />
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
