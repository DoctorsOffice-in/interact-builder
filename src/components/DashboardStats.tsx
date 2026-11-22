import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Radio, Users } from "lucide-react";

export const DashboardStats = ({ publishedContent, draftContent, leadCount }: { publishedContent: number; draftContent: number; leadCount: number }) => {
  const stats = [
    {
      title: "Published content",
      value: publishedContent,
      icon: Radio,
      color: "text-primary"
    },
    {
      title: "Drafts",
      value: draftContent,
      icon: FileText,
      color: "text-warning"
    },
    {
      title: "Patient leads",
      value: leadCount,
      icon: Users,
      color: "text-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-card border-border hover:shadow-custom-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};