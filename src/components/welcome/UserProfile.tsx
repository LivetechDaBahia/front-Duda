import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Building2 } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileBasic } from "@/hooks/useProfileBasic";

export const UserProfile = () => {
  const { t } = useLocale();
  const { user: authUser } = useAuth();
  const { data: profile, isLoading, error } = useProfileBasic();

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  console.log(profile)

  const displayName = profile?.name || authUser?.name || "User";
  const displayRole = profile?.role || t("profile.notSpecified");
  const displayDepartment = profile?.department || t("profile.notSpecified");
  const displayPosition = profile?.position || t("profile.notSpecified");
  const displayEmail = authUser?.email || "";
  const initials = displayName ? getInitials(displayName) : "U";

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
            <p className="text-muted-foreground">{displayEmail}</p>
            <p className="text-sm text-destructive mt-1">{t("profile.errorLoading")}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
          <p className="text-muted-foreground">{displayEmail}</p>
          {displayDepartment !== t("profile.notSpecified") && (
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Building2 className="w-3 h-3" />
              <span>{displayDepartment}</span>
            </div>
          )}
        </div>

        {displayPosition !== t("profile.notSpecified") && (
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <User className="w-3 h-3 mr-1" />
            {displayPosition}
          </Badge>
        )}
      </div>
    </Card>
  );
};
