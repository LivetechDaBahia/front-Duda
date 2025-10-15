import { LayoutGrid, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  viewMode: 'kanban' | 'table';
  onViewChange: (mode: 'kanban' | 'table') => void;
}

export const DashboardHeader = ({ viewMode, onViewChange }: DashboardHeaderProps) => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Purchase Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your purchase orders
            </p>
          </div>
          
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('kanban')}
              className="transition-all"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('table')}
              className="transition-all"
            >
              <Table2 className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
