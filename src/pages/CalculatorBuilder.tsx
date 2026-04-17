import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye, Calculator, Plus, Trash2, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CalcField {
  id: string;
  label: string;
  type: "number" | "select";
  unit: string;
  options?: { label: string; value: number }[];
  defaultValue: number;
}

interface CalcTemplate {
  name: string;
  fields: CalcField[];
  formula: string;
  resultLabel: string;
  resultUnit: string;
  evaluate: (values: Record<string, number>) => { result: number; interpretation: string };
}

const templates: Record<string, CalcTemplate> = {
  "BMI Calculator": {
    name: "BMI Calculator",
    fields: [
      { id: "weight", label: "Weight", type: "number", unit: "kg", defaultValue: 70 },
      { id: "height", label: "Height", type: "number", unit: "cm", defaultValue: 170 },
    ],
    formula: "weight / (height/100)²",
    resultLabel: "BMI",
    resultUnit: "kg/m²",
    evaluate: (v) => {
      const bmi = v.weight / Math.pow(v.height / 100, 2);
      let interpretation = "";
      if (bmi < 18.5) interpretation = "Underweight – Consider nutritional counseling";
      else if (bmi < 25) interpretation = "Normal weight – Maintain healthy lifestyle";
      else if (bmi < 30) interpretation = "Overweight – Recommend diet and exercise plan";
      else interpretation = "Obese – Recommend comprehensive weight management";
      return { result: Math.round(bmi * 10) / 10, interpretation };
    },
  },
  "Medication Dosage Calculator": {
    name: "Medication Dosage Calculator",
    fields: [
      { id: "weight", label: "Patient Weight", type: "number", unit: "kg", defaultValue: 70 },
      { id: "dosePerKg", label: "Dose per kg", type: "number", unit: "mg/kg", defaultValue: 10 },
      { id: "frequency", label: "Doses per Day", type: "number", unit: "times", defaultValue: 3 },
    ],
    formula: "weight × dosePerKg / frequency",
    resultLabel: "Single Dose",
    resultUnit: "mg",
    evaluate: (v) => {
      const totalDaily = v.weight * v.dosePerKg;
      const singleDose = totalDaily / v.frequency;
      return {
        result: Math.round(singleDose * 10) / 10,
        interpretation: `Total daily dose: ${Math.round(totalDaily)}mg. Give ${Math.round(singleDose)}mg every ${Math.round(24 / v.frequency)} hours.`,
      };
    },
  },
  "Calorie Needs Calculator": {
    name: "Calorie Needs Calculator",
    fields: [
      { id: "weight", label: "Weight", type: "number", unit: "kg", defaultValue: 70 },
      { id: "height", label: "Height", type: "number", unit: "cm", defaultValue: 170 },
      { id: "age", label: "Age", type: "number", unit: "years", defaultValue: 30 },
      { id: "activity", label: "Activity Factor", type: "number", unit: "1.2-1.9", defaultValue: 1.55 },
    ],
    formula: "(10 × weight + 6.25 × height - 5 × age + 5) × activity",
    resultLabel: "Daily Calories",
    resultUnit: "kcal",
    evaluate: (v) => {
      const bmr = 10 * v.weight + 6.25 * v.height - 5 * v.age + 5;
      const tdee = bmr * v.activity;
      return {
        result: Math.round(tdee),
        interpretation: `BMR: ${Math.round(bmr)} kcal. For weight loss: ${Math.round(tdee - 500)} kcal. For weight gain: ${Math.round(tdee + 500)} kcal.`,
      };
    },
  },
  "Blood Pressure Risk Calculator": {
    name: "Blood Pressure Risk Calculator",
    fields: [
      { id: "systolic", label: "Systolic BP", type: "number", unit: "mmHg", defaultValue: 120 },
      { id: "diastolic", label: "Diastolic BP", type: "number", unit: "mmHg", defaultValue: 80 },
      { id: "age", label: "Age", type: "number", unit: "years", defaultValue: 45 },
      { id: "smoking", label: "Smoking (0=No, 1=Yes)", type: "number", unit: "", defaultValue: 0 },
    ],
    formula: "Risk scoring based on BP readings and risk factors",
    resultLabel: "Risk Score",
    resultUnit: "/ 10",
    evaluate: (v) => {
      let score = 0;
      if (v.systolic >= 140) score += 3;
      else if (v.systolic >= 130) score += 2;
      else if (v.systolic >= 120) score += 1;
      if (v.diastolic >= 90) score += 3;
      else if (v.diastolic >= 80) score += 2;
      if (v.age > 55) score += 2;
      else if (v.age > 40) score += 1;
      if (v.smoking) score += 2;
      let interpretation = "";
      if (score <= 2) interpretation = "Low risk – Continue monitoring annually";
      else if (score <= 5) interpretation = "Moderate risk – Lifestyle modifications recommended";
      else interpretation = "High risk – Medical intervention recommended";
      return { result: Math.min(score, 10), interpretation };
    },
  },
  "Pregnancy Due Date Calculator": {
    name: "Pregnancy Due Date Calculator",
    fields: [
      { id: "lmpDay", label: "LMP Day of Month", type: "number", unit: "day", defaultValue: 15 },
      { id: "lmpMonth", label: "LMP Month (1-12)", type: "number", unit: "month", defaultValue: 1 },
      { id: "lmpYear", label: "LMP Year", type: "number", unit: "year", defaultValue: 2025 },
    ],
    formula: "Naegele's Rule: LMP + 280 days",
    resultLabel: "Gestational Age",
    resultUnit: "weeks",
    evaluate: (v) => {
      const lmp = new Date(v.lmpYear, v.lmpMonth - 1, v.lmpDay);
      const now = new Date();
      const diffMs = now.getTime() - lmp.getTime();
      const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      const dueDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
      return {
        result: Math.max(0, weeks),
        interpretation: `Estimated due date: ${dueDate.toLocaleDateString()}. Currently ${Math.max(0, weeks)} weeks and ${Math.max(0, Math.floor((diffMs / (24 * 60 * 60 * 1000)) % 7))} days.`,
      };
    },
  },
  "Risk Assessment Calculator": {
    name: "Risk Assessment Calculator",
    fields: [
      { id: "age", label: "Age", type: "number", unit: "years", defaultValue: 50 },
      { id: "cholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", defaultValue: 200 },
      { id: "hdl", label: "HDL Cholesterol", type: "number", unit: "mg/dL", defaultValue: 50 },
      { id: "systolic", label: "Systolic BP", type: "number", unit: "mmHg", defaultValue: 130 },
    ],
    formula: "Simplified cardiovascular risk scoring",
    resultLabel: "CV Risk",
    resultUnit: "%",
    evaluate: (v) => {
      const ratio = v.cholesterol / v.hdl;
      let risk = (v.age / 100) * 10 + (ratio - 3) * 2 + (v.systolic - 120) * 0.1;
      risk = Math.max(1, Math.min(50, Math.round(risk * 10) / 10));
      let interpretation = "";
      if (risk < 10) interpretation = "Low 10-year cardiovascular risk";
      else if (risk < 20) interpretation = "Moderate risk – Consider statin therapy";
      else interpretation = "High risk – Aggressive risk factor management needed";
      return { result: risk, interpretation };
    },
  },
};

export const CalculatorBuilder = () => {
  const navigate = useNavigate();
  const [activeTemplate, setActiveTemplate] = useState("BMI Calculator");
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    templates["BMI Calculator"].fields.forEach((f) => (initial[f.id] = f.defaultValue));
    return initial;
  });
  const [showPreview, setShowPreview] = useState(false);

  const currentTemplate = templates[activeTemplate];

  const loadTemplate = (name: string) => {
    setActiveTemplate(name);
    const t = templates[name];
    const v: Record<string, number> = {};
    t.fields.forEach((f) => (v[f.id] = f.defaultValue));
    setValues(v);
    toast.success(`Loaded ${name} template`);
  };

  const result = currentTemplate.evaluate(values);

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
                <h1 className="text-2xl font-bold text-foreground">Calculator Builder</h1>
                <p className="text-muted-foreground">Create medical calculators for your practice</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Edit Mode" : "Preview"}
              </Button>
              <Button variant="outline" onClick={() => setShowEmbed(true)}>
                <Code2 className="w-4 h-4 mr-2" />
                Embed
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={() => toast.success("Calculator saved!")}>
                <Save className="w-4 h-4 mr-2" />
                Save Calculator
              </Button>
            </div>
          </div>

          <EmbedCodeDialog
            open={showEmbed}
            onOpenChange={setShowEmbed}
            contentType="calculator"
            contentTitle={activeTemplate}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.keys(templates).map((name) => (
                    <Button
                      key={name}
                      variant={activeTemplate === name ? "default" : "ghost"}
                      className={`w-full justify-start text-sm ${activeTemplate === name ? "bg-gradient-primary text-white" : ""}`}
                      onClick={() => loadTemplate(name)}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      {name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {showPreview ? (
                /* Preview Mode */
                <Card className="bg-gradient-card border-border max-w-lg mx-auto">
                  <CardHeader className="text-center">
                    <Calculator className="w-10 h-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-xl">{activeTemplate}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Fill in the values below to get your result</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentTemplate.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        <Label className="text-sm font-medium">
                          {field.label} {field.unit && <span className="text-muted-foreground">({field.unit})</span>}
                        </Label>
                        <Input
                          type="number"
                          value={values[field.id] || 0}
                          onChange={(e) => setValues({ ...values, [field.id]: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    ))}

                    <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-1">{currentTemplate.resultLabel}</p>
                      <p className="text-4xl font-bold text-primary">
                        {result.result}
                        <span className="text-lg ml-1">{currentTemplate.resultUnit}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-3">{result.interpretation}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Edit Mode */
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Calculator className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold">{activeTemplate}</h2>
                        <Badge className="bg-gradient-primary text-white mt-1">Medical Calculator</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Formula</Label>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg font-mono text-sm">{currentTemplate.formula}</div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Input Fields</Label>
                      <div className="space-y-3">
                        {currentTemplate.fields.map((field) => (
                          <div key={field.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Label</Label>
                                <Input value={field.label} readOnly className="mt-1" />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Unit</Label>
                                <Input value={field.unit} readOnly className="mt-1" />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Default</Label>
                                <Input
                                  type="number"
                                  value={values[field.id] || 0}
                                  onChange={(e) => setValues({ ...values, [field.id]: parseFloat(e.target.value) || 0 })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Result Preview */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <Label className="text-sm font-medium text-muted-foreground">Live Result Preview</Label>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">{result.result}</span>
                        <span className="text-muted-foreground">{currentTemplate.resultUnit}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
                    </div>
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
