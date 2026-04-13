import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { QuizBuilder } from "./pages/QuizBuilder";
import { CalculatorBuilder } from "./pages/CalculatorBuilder";
import { ChatbotBuilder } from "./pages/ChatbotBuilder";
import { SpinWheelBuilder } from "./pages/SpinWheelBuilder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quiz-builder" element={<QuizBuilder />} />
          <Route path="/calculator-builder" element={<CalculatorBuilder />} />
          <Route path="/chatbot-builder" element={<ChatbotBuilder />} />
          <Route path="/spin-wheel-builder" element={<SpinWheelBuilder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
