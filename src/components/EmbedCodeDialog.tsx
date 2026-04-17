import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code2 } from "lucide-react";
import { toast } from "sonner";

interface EmbedCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: "quiz" | "calculator" | "spin-wheel" | "chatbot";
  contentId?: string;
  contentTitle?: string;
}

export const EmbedCodeDialog = ({
  open,
  onOpenChange,
  contentType,
  contentId = "demo",
  contentTitle = "My Content",
}: EmbedCodeDialogProps) => {
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("600");
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${baseUrl}/embed/${contentType}/${contentId}`;
  const directLink = `${baseUrl}/${contentType}/${contentId}`;

  const iframeCode = useMemo(
    () =>
      `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 12px; max-width: 100%;"
  title="${contentTitle}"
  allow="clipboard-write"
></iframe>`,
    [embedUrl, width, height, contentTitle]
  );

  const scriptCode = useMemo(
    () =>
      `<div id="dr-buddy-${contentType}-${contentId}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.width = '${width}';
    iframe.height = '${height}';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.maxWidth = '100%';
    iframe.title = '${contentTitle}';
    document.getElementById('dr-buddy-${contentType}-${contentId}').appendChild(iframe);
  })();
</script>`,
    [embedUrl, width, height, contentTitle, contentType, contentId]
  );

  const wpShortcode = `[dr_buddy type="${contentType}" id="${contentId}" width="${width}" height="${height}"]`;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const labelMap = {
    quiz: "Quiz",
    calculator: "Calculator",
    "spin-wheel": "Spin Wheel",
    chatbot: "Chatbot",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Embed {labelMap[contentType]} on Your Website
          </DialogTitle>
          <DialogDescription>
            Copy and paste the code below into your website to embed "{contentTitle}".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div>
            <Label htmlFor="embed-width">Width</Label>
            <Input
              id="embed-width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="100% or 800"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="embed-height">Height (px)</Label>
            <Input
              id="embed-height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="600"
              className="mt-1"
            />
          </div>
        </div>

        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="script">JavaScript</TabsTrigger>
            <TabsTrigger value="wordpress">WordPress</TabsTrigger>
            <TabsTrigger value="link">Direct Link</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Works on any website. Paste this into your HTML.
            </p>
            <Textarea readOnly value={iframeCode} className="font-mono text-xs h-40" />
            <Button onClick={() => copy(iframeCode, "iframe")} className="w-full">
              {copied === "iframe" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "iframe" ? "Copied!" : "Copy iFrame Code"}
            </Button>
          </TabsContent>

          <TabsContent value="script" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Async script — use when you need more control over loading.
            </p>
            <Textarea readOnly value={scriptCode} className="font-mono text-xs h-48" />
            <Button onClick={() => copy(scriptCode, "script")} className="w-full">
              {copied === "script" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "script" ? "Copied!" : "Copy Script Code"}
            </Button>
          </TabsContent>

          <TabsContent value="wordpress" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use our WordPress plugin shortcode (plugin install required).
            </p>
            <Textarea readOnly value={wpShortcode} className="font-mono text-xs h-20" />
            <Button onClick={() => copy(wpShortcode, "wp")} className="w-full">
              {copied === "wp" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "wp" ? "Copied!" : "Copy Shortcode"}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Share a direct link via email, SMS, or social media.
            </p>
            <Input readOnly value={directLink} className="font-mono text-xs" />
            <Button onClick={() => copy(directLink, "link")} className="w-full">
              {copied === "link" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "link" ? "Copied!" : "Copy Direct Link"}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> The embed is fully responsive and will adapt to your website's layout. Set width to <code className="bg-background px-1 rounded">100%</code> for best results.
        </div>
      </DialogContent>
    </Dialog>
  );
};
