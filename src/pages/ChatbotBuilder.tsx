import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Bot, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ChatbotBuilder = () => {
  const navigate = useNavigate();
  
  const [botName, setBotName] = useState("Medical Assistant Bot");

  const doctorBots = [
    "Appointment Scheduling Bot",
    "Symptom Checker Bot", 
    "Insurance Verification Bot",
    "Patient Intake Bot",
    "FAQ Assistant Bot",
    "Prescription Refill Bot"
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Chatbot Builder</h1>
                <p className="text-muted-foreground">Create intelligent chatbots for patient support</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Chatbot
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle>Bot Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {doctorBots.map((bot, index) => (
                    <Button 
                      key={index}
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        setBotName(bot);
                        toast.success(`Loaded ${bot} template`);
                      }}
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      {bot}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <Input 
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        className="text-xl font-semibold bg-transparent border-0 p-0"
                      />
                      <Badge className="bg-gradient-primary text-white mt-2">
                        AI Chatbot
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Chatbot Builder</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a template from the sidebar to start building your medical chatbot
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