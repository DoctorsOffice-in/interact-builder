import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Search, Sparkles } from "lucide-react";

const Index = () => {
  const recentTemplates = [
    {
      title: "Patient Risk Assessment Quiz",
      description: "Interactive quiz to assess patient risk factors for cardiovascular disease with personalized recommendations.",
      category: "Assessment",
      views: 1247,
      conversions: 8.5,
      status: "published" as const
    },
    {
      title: "BMI Calculator", 
      description: "Professional BMI calculator with health recommendations and lifestyle tips for patients.",
      category: "Calculator",
      views: 2156,
      conversions: 12.3,
      status: "published" as const
    },
    {
      title: "Medication Dosage Calculator",
      description: "Calculate proper medication dosages based on patient weight, age, and condition severity.",
      category: "Calculator", 
      views: 987,
      conversions: 15.7,
      status: "draft" as const
    },
    {
      title: "Symptom Checker Bot",
      description: "AI-powered chatbot to help patients identify potential conditions based on their symptoms.",
      category: "Chatbot",
      views: 3421,
      conversions: 6.8,
      status: "published" as const
    }
  ];

  const templateCategories = [
    { name: "All Templates", count: 47, active: true },
    { name: "Calculators", count: 12 },
    { name: "Assessments", count: 18 },
    { name: "Chatbots", count: 8 },
    { name: "Surveys", count: 9 }
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, Dr. Smith
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's what's happening with your interactive content today.
                </p>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Create New Content
              </Button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <DashboardStats />

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Content */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Recent Content</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                  
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {templateCategories.map((category, index) => (
                      <Badge
                        key={index}
                        variant={category.active ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          category.active 
                            ? "bg-gradient-primary text-white shadow-glow" 
                            : "hover:bg-muted"
                        }`}
                      >
                        {category.name} ({category.count})
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {recentTemplates.map((template, index) => (
                    <TemplateCard key={index} {...template} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Tips */}
            <div className="space-y-6">
              {/* Quick Start */}
              <Card className="bg-gradient-secondary border-border">
                <CardHeader>
                  <CardTitle className="text-white">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Patient Quiz
                  </Button>
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Build Calculator
                  </Button>
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Setup Chatbot
                  </Button>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle>Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-primary mb-1">Increase Engagement</h4>
                    <p className="text-muted-foreground">
                      Add personalized results to boost completion rates by up to 40%.
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <h4 className="font-medium text-success mb-1">Better Conversions</h4>
                    <p className="text-muted-foreground">
                      Use progress bars and step indicators to reduce drop-offs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
