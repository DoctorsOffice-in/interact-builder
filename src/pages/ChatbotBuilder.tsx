import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Bot, MessageSquare, Plus, Trash2, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BotNode {
  id: string;
  botMessage: string;
  options: { label: string; nextNodeId: string | null }[];
}

interface BotTemplate {
  name: string;
  greeting: string;
  nodes: BotNode[];
}

const botTemplates: Record<string, BotTemplate> = {
  "Appointment Scheduling Bot": {
    name: "Appointment Scheduling Bot",
    greeting: "Hello! I'm here to help you schedule an appointment. What type of visit do you need?",
    nodes: [
      {
        id: "1",
        botMessage: "What type of visit do you need?",
        options: [
          { label: "General Checkup", nextNodeId: "2" },
          { label: "Specialist Consultation", nextNodeId: "3" },
          { label: "Follow-up Visit", nextNodeId: "4" },
        ],
      },
      {
        id: "2",
        botMessage: "Great! For a general checkup, we have availability this week. When would you prefer?",
        options: [
          { label: "Morning (8AM-12PM)", nextNodeId: "5" },
          { label: "Afternoon (1PM-5PM)", nextNodeId: "5" },
          { label: "Any time works", nextNodeId: "5" },
        ],
      },
      {
        id: "3",
        botMessage: "Which specialist would you like to see?",
        options: [
          { label: "Cardiologist", nextNodeId: "5" },
          { label: "Dermatologist", nextNodeId: "5" },
          { label: "Orthopedic", nextNodeId: "5" },
        ],
      },
      {
        id: "4",
        botMessage: "When was your last visit with us?",
        options: [
          { label: "Less than a month ago", nextNodeId: "5" },
          { label: "1-3 months ago", nextNodeId: "5" },
          { label: "More than 3 months ago", nextNodeId: "5" },
        ],
      },
      {
        id: "5",
        botMessage: "Perfect! Please provide your contact details and we'll confirm your appointment within 24 hours. Thank you for choosing our practice! 🏥",
        options: [],
      },
    ],
  },
  "Symptom Checker Bot": {
    name: "Symptom Checker Bot",
    greeting: "Hi! I can help you understand your symptoms. Please note this is not a diagnosis. What's your main concern?",
    nodes: [
      {
        id: "1",
        botMessage: "What area of your body is affected?",
        options: [
          { label: "Head / Neurological", nextNodeId: "2" },
          { label: "Chest / Respiratory", nextNodeId: "3" },
          { label: "Abdomen / Digestive", nextNodeId: "4" },
          { label: "Musculoskeletal", nextNodeId: "5" },
        ],
      },
      {
        id: "2",
        botMessage: "How would you describe your headache?",
        options: [
          { label: "Throbbing / Migraine-like", nextNodeId: "6" },
          { label: "Constant dull ache", nextNodeId: "6" },
          { label: "Sharp / Sudden onset", nextNodeId: "6" },
        ],
      },
      {
        id: "3",
        botMessage: "What chest symptoms are you experiencing?",
        options: [
          { label: "Shortness of breath", nextNodeId: "6" },
          { label: "Cough / Congestion", nextNodeId: "6" },
          { label: "Chest pain", nextNodeId: "6" },
        ],
      },
      {
        id: "4",
        botMessage: "What digestive symptoms do you have?",
        options: [
          { label: "Nausea / Vomiting", nextNodeId: "6" },
          { label: "Abdominal pain", nextNodeId: "6" },
          { label: "Changes in bowel habits", nextNodeId: "6" },
        ],
      },
      {
        id: "5",
        botMessage: "Where is the pain located?",
        options: [
          { label: "Back / Spine", nextNodeId: "6" },
          { label: "Joints", nextNodeId: "6" },
          { label: "Muscles", nextNodeId: "6" },
        ],
      },
      {
        id: "6",
        botMessage: "Based on your responses, I recommend scheduling an appointment with your doctor for a proper evaluation. Would you like to book an appointment?",
        options: [
          { label: "Yes, schedule appointment", nextNodeId: null },
          { label: "No, thank you", nextNodeId: null },
        ],
      },
    ],
  },
  "Patient Intake Bot": {
    name: "Patient Intake Bot",
    greeting: "Welcome! Let me help you complete your intake form before your visit.",
    nodes: [
      {
        id: "1",
        botMessage: "Is this your first visit to our practice?",
        options: [
          { label: "Yes, I'm a new patient", nextNodeId: "2" },
          { label: "No, I'm a returning patient", nextNodeId: "3" },
        ],
      },
      {
        id: "2",
        botMessage: "Welcome! Do you have insurance?",
        options: [
          { label: "Yes", nextNodeId: "4" },
          { label: "No, self-pay", nextNodeId: "4" },
        ],
      },
      {
        id: "3",
        botMessage: "Has your insurance or contact information changed since your last visit?",
        options: [
          { label: "Yes, it has changed", nextNodeId: "4" },
          { label: "No, everything is the same", nextNodeId: "4" },
        ],
      },
      {
        id: "4",
        botMessage: "Do you have any allergies we should know about?",
        options: [
          { label: "Yes", nextNodeId: "5" },
          { label: "No known allergies", nextNodeId: "5" },
        ],
      },
      {
        id: "5",
        botMessage: "Thank you for completing the intake! Your information has been recorded. Please arrive 10 minutes early for your appointment. 📋",
        options: [],
      },
    ],
  },
  "FAQ Assistant Bot": {
    name: "FAQ Assistant Bot",
    greeting: "Hi! How can I help you today?",
    nodes: [
      {
        id: "1",
        botMessage: "What would you like to know about?",
        options: [
          { label: "Office Hours", nextNodeId: "2" },
          { label: "Insurance & Billing", nextNodeId: "3" },
          { label: "Services Offered", nextNodeId: "4" },
        ],
      },
      {
        id: "2",
        botMessage: "Our office hours are:\n• Monday-Friday: 8AM - 6PM\n• Saturday: 9AM - 1PM\n• Sunday: Closed\n\nIs there anything else I can help with?",
        options: [
          { label: "Yes, another question", nextNodeId: "1" },
          { label: "No, thank you", nextNodeId: null },
        ],
      },
      {
        id: "3",
        botMessage: "We accept most major insurance plans including Aetna, BlueCross BlueShield, Cigna, and United Healthcare. For billing questions, please call our billing department at (555) 123-4567.",
        options: [
          { label: "Ask another question", nextNodeId: "1" },
          { label: "That's all, thanks", nextNodeId: null },
        ],
      },
      {
        id: "4",
        botMessage: "We offer:\n• Primary Care\n• Pediatrics\n• Dermatology\n• Cardiology\n• Orthopedics\n• Lab Services\n\nWould you like to schedule an appointment?",
        options: [
          { label: "Yes, schedule now", nextNodeId: null },
          { label: "Another question", nextNodeId: "1" },
        ],
      },
    ],
  },
  "Insurance Verification Bot": {
    name: "Insurance Verification Bot",
    greeting: "Let me help you verify your insurance coverage.",
    nodes: [
      {
        id: "1",
        botMessage: "Which insurance provider do you have?",
        options: [
          { label: "Aetna", nextNodeId: "2" },
          { label: "BlueCross BlueShield", nextNodeId: "2" },
          { label: "Cigna", nextNodeId: "2" },
          { label: "Other", nextNodeId: "3" },
        ],
      },
      {
        id: "2",
        botMessage: "Great, we accept your insurance! What type of visit are you planning?",
        options: [
          { label: "Preventive / Wellness", nextNodeId: "4" },
          { label: "Specialist Visit", nextNodeId: "4" },
          { label: "Urgent Care", nextNodeId: "4" },
        ],
      },
      {
        id: "3",
        botMessage: "Please call our billing department at (555) 123-4567 to verify if we accept your plan.",
        options: [
          { label: "Okay, thanks", nextNodeId: null },
        ],
      },
      {
        id: "4",
        botMessage: "Your typical copay would be $20-$40 depending on your plan. Would you like to schedule an appointment?",
        options: [
          { label: "Yes, schedule", nextNodeId: null },
          { label: "No, just checking", nextNodeId: null },
        ],
      },
    ],
  },
  "Prescription Refill Bot": {
    name: "Prescription Refill Bot",
    greeting: "Need a prescription refill? I can help with that!",
    nodes: [
      {
        id: "1",
        botMessage: "How would you like to request your refill?",
        options: [
          { label: "By medication name", nextNodeId: "2" },
          { label: "Refill all current medications", nextNodeId: "3" },
        ],
      },
      {
        id: "2",
        botMessage: "How many refills do you need?",
        options: [
          { label: "Just this one time", nextNodeId: "4" },
          { label: "90-day supply", nextNodeId: "4" },
        ],
      },
      {
        id: "3",
        botMessage: "We'll process refills for all your active medications. Which pharmacy should we send them to?",
        options: [
          { label: "Same pharmacy as before", nextNodeId: "4" },
          { label: "Different pharmacy", nextNodeId: "4" },
        ],
      },
      {
        id: "4",
        botMessage: "Your refill request has been submitted! You'll receive a confirmation within 24-48 hours. Please contact us if you're running low on medication. 💊",
        options: [],
      },
    ],
  },
};

export const ChatbotBuilder = () => {
  const navigate = useNavigate();
  const [activeTemplate, setActiveTemplate] = useState("Appointment Scheduling Bot");
  const [nodes, setNodes] = useState<BotNode[]>(botTemplates["Appointment Scheduling Bot"].nodes);
  const [greeting, setGreeting] = useState(botTemplates["Appointment Scheduling Bot"].greeting);
  const [showPreview, setShowPreview] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ sender: "bot" | "user"; text: string }[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const loadTemplate = (name: string) => {
    const t = botTemplates[name];
    setActiveTemplate(name);
    setNodes(t.nodes);
    setGreeting(t.greeting);
    resetChat();
    toast.success(`Loaded ${name}`);
  };

  const resetChat = () => {
    setChatHistory([]);
    setCurrentNodeId(null);
  };

  const startChat = () => {
    setChatHistory([{ sender: "bot", text: greeting }]);
    if (nodes.length > 0) {
      setTimeout(() => {
        setChatHistory((prev) => [...prev, { sender: "bot", text: nodes[0].botMessage }]);
        setCurrentNodeId(nodes[0].id);
      }, 600);
    }
  };

  const handleOption = (option: { label: string; nextNodeId: string | null }) => {
    setChatHistory((prev) => [...prev, { sender: "user", text: option.label }]);
    if (option.nextNodeId) {
      const nextNode = nodes.find((n) => n.id === option.nextNodeId);
      if (nextNode) {
        setTimeout(() => {
          setChatHistory((prev) => [...prev, { sender: "bot", text: nextNode.botMessage }]);
          setCurrentNodeId(nextNode.id);
        }, 500);
      }
    } else {
      setCurrentNodeId(null);
      setTimeout(() => {
        setChatHistory((prev) => [...prev, { sender: "bot", text: "Thank you! Is there anything else I can help you with?" }]);
      }, 500);
    }
  };

  const updateNode = (nodeId: string, updates: Partial<BotNode>) => {
    setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
  };

  const currentNode = nodes.find((n) => n.id === currentNodeId);

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Chatbot Builder</h1>
                <p className="text-muted-foreground">Create intelligent chatbots for patient support</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setShowPreview(!showPreview); if (!showPreview) { resetChat(); setTimeout(startChat, 100); } }}>
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Edit Mode" : "Preview"}
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={() => toast.success("Chatbot saved!")}>
                <Save className="w-4 h-4 mr-2" />
                Save Chatbot
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Bot Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.keys(botTemplates).map((name) => (
                    <Button
                      key={name}
                      variant={activeTemplate === name ? "default" : "ghost"}
                      className={`w-full justify-start text-xs ${activeTemplate === name ? "bg-gradient-primary text-white" : ""}`}
                      onClick={() => loadTemplate(name)}
                    >
                      <Bot className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate">{name}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {showPreview ? (
                /* Chat Preview */
                <Card className="bg-gradient-card border-border max-w-lg mx-auto">
                  <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{activeTemplate}</CardTitle>
                        <p className="text-white/80 text-xs">Online</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 h-[400px] overflow-y-auto space-y-3">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-line ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {currentNode && currentNode.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentNode.options.map((opt, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleOption(opt)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </CardContent>
                  <div className="p-3 border-t border-border">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => { resetChat(); setTimeout(startChat, 100); }}>
                      Restart Conversation
                    </Button>
                  </div>
                </Card>
              ) : (
                /* Edit Mode - Flow Editor */
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <MessageSquare className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold">{activeTemplate}</h2>
                        <Badge className="bg-gradient-primary text-white mt-1">AI Chatbot</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Greeting Message</Label>
                      <Textarea
                        value={greeting}
                        onChange={(e) => setGreeting(e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <Label className="text-sm font-medium block">Conversation Flow</Label>
                    {nodes.map((node, idx) => (
                      <Card key={node.id} className="border border-border/50">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Step {idx + 1}</Badge>
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                          <Textarea
                            value={node.botMessage}
                            onChange={(e) => updateNode(node.id, { botMessage: e.target.value })}
                            rows={2}
                            className="text-sm"
                          />
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Response Options</Label>
                            {node.options.map((opt, oi) => (
                              <div key={oi} className="flex gap-2 items-center">
                                <Input
                                  value={opt.label}
                                  onChange={(e) => {
                                    const newOpts = [...node.options];
                                    newOpts[oi] = { ...newOpts[oi], label: e.target.value };
                                    updateNode(node.id, { options: newOpts });
                                  }}
                                  className="text-sm flex-1"
                                  placeholder="Option text"
                                />
                                <Badge variant="outline" className="text-xs shrink-0">
                                  → {opt.nextNodeId ? `Step ${nodes.findIndex((n) => n.id === opt.nextNodeId) + 1}` : "End"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
