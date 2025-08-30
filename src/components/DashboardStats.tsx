import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Total Views",
      value: "24,573",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Leads Generated", 
      value: "1,247",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: Users,
      color: "text-success"
    },
    {
      title: "Conversion Rate",
      value: "5.8%",
      change: "-2.1%",
      changeType: "negative" as const,
      icon: MousePointer,
      color: "text-secondary"
    },
    {
      title: "Active Content",
      value: "18",
      change: "+3",
      changeType: "positive" as const,
      icon: BarChart3,
      color: "text-warning"
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
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="flex items-center text-xs">
              {stat.changeType === "positive" ? (
                <ArrowUpRight className="w-3 h-3 text-success mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive mr-1" />
              )}
              <span className={stat.changeType === "positive" ? "text-success" : "text-destructive"}>
                {stat.change}
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};