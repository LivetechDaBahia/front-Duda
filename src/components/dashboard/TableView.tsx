import { PurchaseOrder } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface TableViewProps {
  orders: PurchaseOrder[];
  onOrderClick: (order: PurchaseOrder) => void;
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  processing: 'bg-info/10 text-info border-info/20',
  completed: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  approved: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20',
  declined: 'bg-destructive/10 text-destructive border-destructive/20',
};

type SortField = 'id' | 'clientName' | 'value' | 'status' | 'dueDate';

export const TableView = ({ orders, onOrderClick }: TableViewProps) => {
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'value') {
      return (a.value - b.value) * multiplier;
    }
    
    if (sortField === 'dueDate') {
      return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * multiplier;
    }
    
    return String(a[sortField]).localeCompare(String(b[sortField])) * multiplier;
  });

  return (
    <div className="bg-card rounded-lg border shadow-sm animate-fade-in overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                Order ID
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('clientName')}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                Client
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('value')}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                Value
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>Items</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                Status
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('dueDate')}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                Due Date
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow
              key={order.id}
              onClick={() => onOrderClick(order)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.clientName}</TableCell>
              <TableCell className="font-semibold">
                ${order.value.toLocaleString()}
              </TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell>
                <Badge className={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(order.dueDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
