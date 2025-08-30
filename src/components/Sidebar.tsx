import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Settings,
  Zap,
  Heart,
  TrendingUp
} from "lucide-react";

export const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "My Content", count: 12 },
    { icon: Calculator, label: "Calculators", count: 5 },
    { icon: MessageSquare, label: "Chatbots", count: 3 },
    { icon: BarChart3, label: "Analytics" },
    { icon: Users, label: "Leads", count: 247 },
  ];

  const quickActions = [
    { icon: Zap, label: "Quiz Builder", color: "text-primary" },
    { icon: Calculator, label: "Calculator", color: "text-secondary" },
    { icon: Heart, label: "Assessment", color: "text-success" },
    { icon: TrendingUp, label: "Survey", color: "text-warning" },
  ];

  return (
    <aside className="w-64 bg-card/30 backdrop-blur-sm border-r border-border flex flex-col">
      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${
                item.active 
                  ? "bg-gradient-primary text-white shadow-glow" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.active 
                    ? "bg-white/20 text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {item.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Create
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-16 flex-col p-2 bg-gradient-card border-border hover:shadow-custom-md transition-all"
              >
                <action.icon className={`w-5 h-5 mb-1 ${action.color}`} />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-primary"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
        
        {/* Upgrade Prompt */}
        <div className="mt-4 p-3 bg-gradient-primary rounded-lg text-white">
          <div className="text-sm font-medium mb-1">Upgrade to Pro</div>
          <div className="text-xs opacity-90 mb-2">
            Get unlimited templates and advanced features
          </div>
          <Button size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  );
};