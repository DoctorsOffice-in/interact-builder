import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SpinWheel } from "@/components/SpinWheel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye, Plus, Trash2, Palette, Code2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { EmbedCodeDialog } from "@/components/EmbedCodeDialog";
import { getContentItem, saveContentItem } from "@/lib/content-storage";

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  value: string;
  type: "discount" | "offer" | "freebie" | "custom";
}

const defaultColors = [
  "#3B82F6", "#A855F7", "#22C55E", "#F59E0B",
  "#EF4444", "#06B6D4", "#8B5CF6", "#14B8A6",
  "#F97316", "#EC4899",
];

const presetTemplates: Record<string, WheelSegment[]> = {
  "Dental Clinic Offers": [
    { id: "1", label: "20% Off Cleaning", color: defaultColors[0], value: "CLEAN20", type: "discount" },
    { id: "2", label: "Free Consultation", color: defaultColors[1], value: "FREECONSULT", type: "freebie" },
    { id: "3", label: "10% Off Whitening", color: defaultColors[2], value: "WHITE10", type: "discount" },
    { id: "4", label: "$50 Off Braces", color: defaultColors[3], value: "BRACE50", type: "discount" },
    { id: "5", label: "Free X-Ray", color: defaultColors[4], value: "FREEXRAY", type: "freebie" },
    { id: "6", label: "15% Off Any Service", color: defaultColors[5], value: "ANY15", type: "discount" },
  ],
  "General Practice Promo": [
    { id: "1", label: "Free Health Check", color: defaultColors[0], value: "FREECHECK", type: "freebie" },
    { id: "2", label: "20% Off Lab Tests", color: defaultColors[1], value: "LAB20", type: "discount" },
    { id: "3", label: "Free Flu Shot", color: defaultColors[2], value: "FREEFLU", type: "freebie" },
    { id: "4", label: "$25 Off Visit", color: defaultColors[3], value: "VISIT25", type: "discount" },
    { id: "5", label: "Free BP Monitor", color: defaultColors[4], value: "FREEBP", type: "freebie" },
    { id: "6", label: "10% Off All Services", color: defaultColors[5], value: "ALL10", type: "discount" },
  ],
  "Wellness Center": [
    { id: "1", label: "Free Yoga Class", color: defaultColors[0], value: "FREEYOGA", type: "freebie" },
    { id: "2", label: "30% Off Massage", color: defaultColors[1], value: "MASS30", type: "discount" },
    { id: "3", label: "Free Nutrition Plan", color: defaultColors[2], value: "FREENUTRI", type: "freebie" },
    { id: "4", label: "1 Month Free Gym", color: defaultColors[3], value: "GYM1MO", type: "freebie" },
    { id: "5", label: "$20 Off Supplements", color: defaultColors[4], value: "SUPP20", type: "discount" },
    { id: "6", label: "Free Wellness Eval", color: defaultColors[5], value: "FREEEVAL", type: "freebie" },
  ],
};

export const SpinWheelBuilder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPreview, setShowPreview] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(searchParams.get("id")));
  const [wheelTitle, setWheelTitle] = useState("Spin to Win a Special Offer!");
  const [segments, setSegments] = useState<WheelSegment[]>(presetTemplates["Dental Clinic Offers"]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      setLoadingExisting(false);
      return;
    }
    let active = true;
    setLoadingExisting(true);
    void getContentItem(id).then((item) => {
      if (!active) return;
      if (!item || item.content_type !== "spin-wheel") {
        toast.error("That saved wheel could not be found.");
        setLoadingExisting(false);
        return;
      }
      const content = item.content as unknown as { title?: string; segments?: WheelSegment[] };
      setWheelTitle(content.title ?? item.title);
      setSegments(content.segments?.length ? content.segments : presetTemplates["Dental Clinic Offers"]);
      setSavedItemId(item.id);
      setLoadingExisting(false);
    }).catch((error: unknown) => {
      if (active) {
        toast.error(error instanceof Error ? error.message : "Could not load this wheel.");
        setLoadingExisting(false);
      }
    });
    return () => { active = false; };
  }, [searchParams]);

  const addSegment = () => {
    const newSeg: WheelSegment = {
      id: Date.now().toString(),
      label: "New Prize",
      color: defaultColors[segments.length % defaultColors.length],
      value: "CODE" + segments.length,
      type: "discount",
    };
    setSegments([...segments, newSeg]);
  };

  const updateSegment = (id: string, updates: Partial<WheelSegment>) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) {
      toast.error("Minimum 2 segments required");
      return;
    }
    setSegments(segments.filter((s) => s.id !== id));
  };

  const loadTemplate = (name: string) => {
    setSegments(presetTemplates[name]);
    toast.success(`Loaded "${name}" template`);
  };

  const saveWheel = async () => {
    setSaving(true);
    try {
      const item = await saveContentItem({
        id: savedItemId,
        contentType: "spin-wheel",
        title: wheelTitle,
        content: { title: wheelTitle, segments },
      });
      setSavedItemId(item.id);
      if (!savedItemId) setSearchParams({ id: item.id }, { replace: true });
      toast.success("Spin wheel saved to your content.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Spin wheel could not be saved.");
    } finally {
      setSaving(false);
    }
  };

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
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Spin the Wheel Builder</h1>
                <p className="text-muted-foreground">Create customizable spin wheels with offers & discounts</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Edit" : "Preview"}
              </Button>
              <Button variant="outline" onClick={() => setShowEmbed(true)}>
                <Code2 className="w-4 h-4 mr-2" />
                Embed
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={() => void saveWheel()} disabled={saving || loadingExisting}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving…" : "Save Wheel"}
              </Button>
            </div>
          </div>

          <EmbedCodeDialog
            open={showEmbed}
            onOpenChange={setShowEmbed}
            contentType="spin-wheel"
            contentTitle={wheelTitle}
          />

          {showPreview ? (
            <Card className="bg-gradient-card border-border max-w-xl mx-auto">
              <CardContent className="p-8">
                <SpinWheel
                  segments={segments}
                  title={wheelTitle}
                  onResult={(seg) => toast.success(`Won: ${seg.label} — Code: ${seg.value}`)}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.keys(presetTemplates).map((name) => (
                      <Button
                        key={name}
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => loadTemplate(name)}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        {name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <div className="space-y-3">
                      <Label>Wheel Title</Label>
                      <Input value={wheelTitle} onChange={(e) => setWheelTitle(e.target.value)} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Segments ({segments.length})</h3>
                      <Button variant="outline" onClick={addSegment}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Segment
                      </Button>
                    </div>

                    {segments.map((seg, i) => (
                      <Card key={seg.id} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-6 h-6 rounded-full mt-2 shrink-0 border-2 border-border"
                              style={{ backgroundColor: seg.color }}
                            />
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <Label className="text-xs">Label</Label>
                                <Input
                                  value={seg.label}
                                  onChange={(e) => updateSegment(seg.id, { label: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Code / Value</Label>
                                <Input
                                  value={seg.value}
                                  onChange={(e) => updateSegment(seg.id, { value: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Type</Label>
                                <Select
                                  value={seg.type}
                                  onValueChange={(v) => updateSegment(seg.id, { type: v as WheelSegment["type"] })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="discount">Discount</SelectItem>
                                    <SelectItem value="offer">Offer</SelectItem>
                                    <SelectItem value="freebie">Freebie</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Color</Label>
                                <Input
                                  type="color"
                                  value={seg.color}
                                  onChange={(e) => updateSegment(seg.id, { color: e.target.value })}
                                  className="mt-1 h-9 p-1"
                                />
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeSegment(seg.id)}
                              className="mt-1"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Mini preview */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-48 h-48">
                        <SpinWheel segments={segments} title="" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
