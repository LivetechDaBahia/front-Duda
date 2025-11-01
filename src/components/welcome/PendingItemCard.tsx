import { PendingItem } from "@/types/order";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Info,
  FileText,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PendingItemCardProps {
  item: PendingItem;
  onApprove?: (itemId: string) => void;
  onDecline?: (itemId: string) => void;
  onViewDetails: (item: PendingItem) => void;
}

export const PendingItemCard = ({
  item,
  onApprove,
  onDecline,
  onViewDetails,
}: PendingItemCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    setTimeout(() => {
      onApprove(item.id);
      toast.success(
        `${item.type === "purchase_order" ? "Order" : "Credit"} ${item.title} approved successfully`
      );
      setIsProcessing(false);
    }, 500);
  };

  const handleDecline = async () => {
    if (!onDecline) return;
    setIsProcessing(true);
    setTimeout(() => {
      onDecline(item.id);
      toast.error(
        `${item.type === "purchase_order" ? "Order" : "Credit"} ${item.title} declined`
      );
      setIsProcessing(false);
    }, 500);
  };

  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(item.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const isUrgent = daysSinceCreation > 3;

  const ItemIcon = item.type === "purchase_order" ? FileText : CreditCard;
  const itemTypeLabel =
    item.type === "purchase_order" ? "Purchase Order" : "Credit Request";

  return (
    <Card className="p-5 hover:shadow-md transition-all animate-scale-in bg-gradient-to-br from-card to-card/50 w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ItemIcon className="w-4 h-4 text-muted-foreground" />
              <p className="font-semibold text-foreground text-lg">
                {item.title}
              </p>
              {isUrgent && (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{itemTypeLabel}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              {item.supplierOrClient}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(item)}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>

        {/* Item Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs">Value</span>
            </div>
            <p className="font-semibold text-foreground">
              {item.coinSymbol}
              {item.value.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Created</span>
            </div>
            <p
              className={`font-semibold ${isUrgent ? "text-warning" : "text-foreground"}`}
            >
              {daysSinceCreation} days ago
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Action Buttons - Only show for purchase orders */}
        {item.type === "purchase_order" && onApprove && onDecline && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDecline}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-md"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}

        {/* View Details Button for Credit Items */}
        {item.type === "credit" && (
          <Button
            onClick={() => onViewDetails(item)}
            variant="outline"
            className="w-full"
          >
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
};
