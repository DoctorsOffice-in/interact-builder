import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const recentTemplates = [
    {
      title: "Patient Risk Assessment Quiz",
      description: "Interactive quiz to assess patient risk factors for cardiovascular disease with personalized recommendations.",
      category: "Assessment",
      views: 1247,
      conversions: 8.5,
      status: "published" as const,
      builderPath: "/quiz-builder"
    },
    {
      title: "BMI Calculator", 
      description: "Professional BMI calculator with health recommendations and lifestyle tips for patients.",
      category: "Calculator",
      views: 2156,
      conversions: 12.3,
      status: "published" as const,
      builderPath: "/calculator-builder"
    },
    {
      title: "Medication Dosage Calculator",
      description: "Calculate proper medication dosages based on patient weight, age, and condition severity.",
      category: "Calculator", 
      views: 987,
      conversions: 15.7,
      status: "draft" as const,
      builderPath: "/calculator-builder"
    },
    {
      title: "Symptom Checker Bot",
      description: "AI-powered chatbot to help patients identify potential conditions based on their symptoms.",
      category: "Chatbot",
      views: 3421,
      conversions: 6.8,
      status: "published" as const,
      builderPath: "/chatbot-builder"
    },
    {
      title: "Patient Satisfaction Survey",
      description: "Gather feedback from patients about their experience at your practice.",
      category: "Assessment",
      views: 890,
      conversions: 22.1,
      status: "published" as const,
      builderPath: "/quiz-builder"
    },
    {
      title: "Appointment Pre-screening Quiz",
      description: "Pre-screen patients before their appointment to optimize consultation time.",
      category: "Assessment",
      views: 654,
      conversions: 18.3,
      status: "draft" as const,
      builderPath: "/quiz-builder"
    }
  ];

  const templateCategories = [
    { name: "All Templates", count: recentTemplates.length },
    { name: "Calculators", count: recentTemplates.filter(t => t.category === "Calculator").length },
    { name: "Assessments", count: recentTemplates.filter(t => t.category === "Assessment").length },
    { name: "Chatbots", count: recentTemplates.filter(t => t.category === "Chatbot").length },
  ];

  const categoryMap: Record<string, string> = {
    "Calculators": "Calculator",
    "Assessments": "Assessment",
    "Chatbots": "Chatbot",
  };

  const filteredTemplates = recentTemplates.filter(t => {
    const matchCategory = activeCategory === "All Templates" || t.category === categoryMap[activeCategory];
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
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
              <Button 
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
                onClick={() => navigate("/quiz-builder")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create New Content
              </Button>
            </div>
          </div>

          <DashboardStats />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Recent Content</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                  
                  {showSearch && (
                    <Input 
                      placeholder="Search templates..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mt-3"
                      autoFocus
                    />
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {templateCategories.map((category, index) => (
                      <Badge
                        key={index}
                        variant={activeCategory === category.name ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          activeCategory === category.name
                            ? "bg-gradient-primary text-white shadow-glow" 
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setActiveCategory(category.name)}
                      >
                        {category.name} ({category.count})
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {filteredTemplates.length > 0 ? filteredTemplates.map((template, index) => (
                    <TemplateCard 
                      key={index} 
                      title={template.title}
                      description={template.description}
                      category={template.category}
                      views={template.views}
                      conversions={template.conversions}
                      status={template.status}
                      onEdit={() => navigate(template.builderPath)}
                      onPreview={() => toast.info(`Previewing ${template.title}...`)}
                    />
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No templates match your search.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-secondary border-border">
                <CardHeader>
                  <CardTitle className="text-white">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => navigate("/quiz-builder")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Patient Quiz
                  </Button>
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => navigate("/calculator-builder")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Build Calculator
                  </Button>
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => navigate("/chatbot-builder")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Setup Chatbot
                  </Button>
                </CardContent>
              </Card>

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
