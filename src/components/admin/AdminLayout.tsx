import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AdminLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminLayout({
  title,
  description,
  children,
}: AdminLayoutProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Content */}
      <Card className="border-2">{children}</Card>
    </div>
  );
}
