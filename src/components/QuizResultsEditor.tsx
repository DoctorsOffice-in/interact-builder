import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ExternalLink, Tag } from "lucide-react";
import type { QuizResult } from "@/pages/QuizBuilder";

interface Props {
  results: QuizResult[];
  onUpdateResults: (results: QuizResult[]) => void;
  scoringType: "points" | "category";
}

export const QuizResultsEditor = ({ results, onUpdateResults, scoringType }: Props) => {
  const addResult = () => {
    const newResult: QuizResult = {
      id: Date.now().toString(),
      title: "New Result",
      description: "Description for this result outcome",
      minScore: 0,
      maxScore: 10,
      redirectUrl: "",
      couponCode: "",
      category: "",
    };
    onUpdateResults([...results, newResult]);
  };

  const updateResult = (id: string, updates: Partial<QuizResult>) => {
    onUpdateResults(results.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteResult = (id: string) => {
    onUpdateResults(results.filter((r) => r.id !== id));
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Quiz Results & Outcomes</CardTitle>
          <Button variant="outline" onClick={addResult}>
            <Plus className="w-4 h-4 mr-2" />
            Add Result
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {scoringType === "points"
            ? "Define score ranges to show different results. Each answer's points add up to determine the outcome."
            : "Define categories. The most-selected category determines the result shown."}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {results.map((result, i) => (
          <Card key={result.id} className="border border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <h3 className="font-semibold">Result {i + 1}</h3>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteResult(result.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Result Title</Label>
                  <Input
                    value={result.title}
                    onChange={(e) => updateResult(result.id, { title: e.target.value })}
                    placeholder="e.g., Wellness Champion 🌟"
                    className="mt-1"
                  />
                </div>
                {scoringType === "points" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Min Score</Label>
                      <Input
                        type="number"
                        value={result.minScore}
                        onChange={(e) => updateResult(result.id, { minScore: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Max Score</Label>
                      <Input
                        type="number"
                        value={result.maxScore}
                        onChange={(e) => updateResult(result.id, { maxScore: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm">Category Name</Label>
                    <Input
                      value={result.category || ""}
                      onChange={(e) => updateResult(result.id, { category: e.target.value })}
                      placeholder="e.g., Preventive"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm">Result Description</Label>
                <Textarea
                  value={result.description}
                  onChange={(e) => updateResult(result.id, { description: e.target.value })}
                  placeholder="What to tell the user when they get this result..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Redirect URL
                  </Label>
                  <Input
                    value={result.redirectUrl || ""}
                    onChange={(e) => updateResult(result.id, { redirectUrl: e.target.value })}
                    placeholder="https://your-booking-page.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Coupon Code
                  </Label>
                  <Input
                    value={result.couponCode || ""}
                    onChange={(e) => updateResult(result.id, { couponCode: e.target.value })}
                    placeholder="e.g., HEALTH20"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No results configured yet. Add results to show personalized outcomes.</p>
            <Button onClick={addResult} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add First Result
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
