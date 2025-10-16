import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export const UserProfile = () => {
  const { t } = useLocale();
  
  // Mock user data - in real app this would come from auth/database
  const user = {
    name: 'John Anderson',
    role: t('profile.role'),
    email: 'john.anderson@company.com',
    initials: 'JA'
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
