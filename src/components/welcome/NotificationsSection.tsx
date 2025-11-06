import { Clock, Package, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "info" | "warning" | "urgent";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// TODO: Replace with real notifications data from the API or context
const notifications: Notification[] = [];

export const NotificationsSection = () => {
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <Clock className="w-5 h-5 text-warning" />;
      case "info":
        return <Package className="w-5 h-5 text-primary" />;
    }
  };

  const getNotificationBadge = (type: Notification["type"]) => {
    switch (type) {
      case "urgent":
        return (
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="text-xs border-warning text-warning"
          >
            Warning
          </Badge>
        );
      case "info":
        return (
          <Badge variant="secondary" className="text-xs">
            Info
          </Badge>
        );
    }
  };

  return (
    <div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 transition-colors hover:bg-accent/50 cursor-pointer ${
              !notification.read ? "bg-primary/5 border-primary/20" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-semibold text-sm ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {notification.title}
                  </h3>
                  {getNotificationBadge(notification.type)}
                </div>
                <p
                  className={`text-sm ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.timestamp}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
