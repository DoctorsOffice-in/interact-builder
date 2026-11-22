import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardStats } from "@/components/DashboardStats";
import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { deleteContentItem, listContentItems, saveContentItem, type SavedContentItem } from "@/lib/content-storage";

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [contentItems, setContentItems] = useState<SavedContentItem[]>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [items, leads] = await Promise.all([
        listContentItems(),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);
      setContentItems(items);
      setLeadCount(leads.count ?? 0);
      if (leads.error) throw leads.error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Dashboard content could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshDashboard(); }, [refreshDashboard]);

  const builderPath = (type: string) => ({ quiz: "/quiz-builder", calculator: "/calculator-builder", chatbot: "/chatbot-builder", "spin-wheel": "/spin-wheel-builder" }[type] || "/");
  const categoryFor = (type: string) => ({ quiz: "Quiz", calculator: "Calculator", chatbot: "Chatbot", "spin-wheel": "Spin Wheel" }[type] || "Content");
  const descriptionFor = (item: SavedContentItem) => {
    const content = item.content as Record<string, unknown>;
    const settings = content.settings && typeof content.settings === "object" ? content.settings as Record<string, unknown> : null;
    const description = settings?.description ?? content.description;
    return typeof description === "string" && description.trim() ? description : "Saved interactive content for your practice.";
  };

  const templateCategories = [
    { name: "All Content", count: contentItems.length },
    { name: "Quizzes", count: contentItems.filter((item) => item.content_type === "quiz").length },
    { name: "Calculators", count: contentItems.filter((item) => item.content_type === "calculator").length },
    { name: "Chatbots", count: contentItems.filter((item) => item.content_type === "chatbot").length },
    { name: "Spin Wheels", count: contentItems.filter((item) => item.content_type === "spin-wheel").length },
  ];

  const categoryMap: Record<string, string> = {
    "Quizzes": "quiz",
    "Calculators": "Calculator",
    "Chatbots": "chatbot",
    "Spin Wheels": "spin-wheel",
  };

  const filteredTemplates = contentItems.filter((item) => {
    const matchCategory = activeCategory === "All Content" || item.content_type === categoryMap[activeCategory]?.toLowerCase();
    const description = descriptionFor(item);
    const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const duplicateItem = async (item: SavedContentItem) => {
    try {
      await saveContentItem({
        contentType: item.content_type as "quiz" | "calculator" | "chatbot" | "spin-wheel",
        title: `${item.title} copy`,
        content: item.content as Record<string, unknown>,
      });
      toast.success("A draft copy was created.");
      await refreshDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "This content could not be duplicated.");
    }
  };

  const removeItem = async (item: SavedContentItem) => {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    try {
      await deleteContentItem(item.id);
      toast.success("Content deleted.");
      await refreshDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Content could not be deleted.");
    }
  };

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
                  Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
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

          <DashboardStats publishedContent={contentItems.filter((item) => item.is_published).length} draftContent={contentItems.filter((item) => !item.is_published).length} leadCount={leadCount} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Your content</CardTitle>
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
                  {loading ? <div className="py-10 text-center text-muted-foreground">Loading your content…</div>
                    : filteredTemplates.length > 0 ? filteredTemplates.map((template) => (
                    <TemplateCard 
                      key={template.id}
                      title={template.title}
                      description={descriptionFor(template)}
                      category={categoryFor(template.content_type)}
                      updatedAt={template.updated_at}
                      status={template.is_published ? "published" : "draft"}
                      onEdit={() => navigate(`${builderPath(template.content_type)}?id=${template.id}`)}
                      onPreview={() => {
                        if (template.content_type === "quiz" && template.is_published) navigate(`/p/${template.slug}`);
                        else navigate(`${builderPath(template.content_type)}?id=${template.id}`);
                      }}
                      onDuplicate={() => void duplicateItem(template)}
                      onDelete={() => void removeItem(template)}
                      onViewLive={template.content_type === "quiz" && template.is_published ? () => navigate(`/p/${template.slug}`) : undefined}
                    />
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {contentItems.length ? "No content matches your search." : "Your saved quizzes, calculators, chatbots, and wheels will appear here."}
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
