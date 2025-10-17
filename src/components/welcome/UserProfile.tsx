import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";

export const UserProfile = () => {
  const { t } = useLocale();
  const { user: authUser } = useAuth();

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const user = {
    name: authUser?.name || "User",
    role: t("profile.role"),
    email: authUser?.email || "",
    initials: authUser?.name ? getInitials(authUser.name) : "U",
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>

        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          <User className="w-3 h-3 mr-1" />
          {user.role}
        </Badge>
      </div>
    </Card>
  );
};
