import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navigation/Navbar';
import { UserProfile } from '@/components/welcome/UserProfile';
import { TodayStats } from '@/components/welcome/TodayStats';
import { PendingOrderCard } from '@/components/welcome/PendingOrderCard';
import { OrderDetailPanel } from '@/components/dashboard/OrderDetailPanel';
import { PurchaseOrder } from '@/types/order';
import { useLocale } from '@/contexts/LocaleContext';
import { useOrders } from '@/hooks/useOrders';

const Welcome = () => {
  const { t } = useLocale();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const { orders, isLoading, error, approveOrder, declineOrder } = useOrders();

  const handleApprove = (orderId: string) => {
    approveOrder(orderId);
  };

  const handleDecline = (orderId: string) => {
    declineOrder(orderId);
  };

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const pendingOrders = useMemo(() => 
    orders.filter(order => order.needsApproval && order.status === 'pending'),
    [orders]
  );

  const urgentOrders = useMemo(() => 
    pendingOrders.filter(order => {
      const daysUntilDue = Math.ceil(
        (new Date(order.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue <= 7;
    }),
    [pendingOrders]
  );

  const totalValue = useMemo(() => 
    pendingOrders.reduce((sum, order) => sum + order.value, 0),
    [pendingOrders]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8 animate-fade-in">
            <UserProfile />
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8 animate-fade-in">
            <UserProfile />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading orders</p>
              <p className="text-sm text-muted-foreground">{error?.message || 'Unknown error'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8">
        {/* User Profile */}
        <div className="mb-8 animate-fade-in">
          <UserProfile />
        </div>

        {/* Today's Stats */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-bold mb-4 text-foreground">{t('welcome.todayOverview')}</h2>
          <TodayStats 
            pendingCount={pendingOrders.length}
            urgentCount={urgentOrders.length}
            totalValue={totalValue}
          />
        </div>

        {/* Pending Approvals */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {t('welcome.pendingApprovals')}
            </h2>
            <Button variant="outline" asChild>
              <Link to="/purchase-orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t('welcome.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-lg">
                {t('welcome.noPendingOrders')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('welcome.allCaughtUp')}
              </p>
            </div>
          )}
        </div>
      </main>

      <OrderDetailPanel
        order={selectedOrder}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};

export default Welcome;
