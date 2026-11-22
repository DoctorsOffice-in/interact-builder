import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Eye, Edit3, Copy, Trash2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateCardProps {
  title: string;
  description: string;
  category: string;
  updatedAt?: string;
  status?: "published" | "draft" | "archived";
  onEdit?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onViewLive?: () => void;
}

export const TemplateCard = ({ 
  title, 
  description, 
  category, 
  status = "draft",
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onViewLive,
  updatedAt,
}: TemplateCardProps) => {
  const statusColors = {
    published: "bg-success text-success-foreground",
    draft: "bg-warning text-warning-foreground",
    archived: "bg-muted text-muted-foreground"
  };

  return (
    <div className="group bg-gradient-card border border-border rounded-lg p-6 hover:shadow-custom-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">{category}</Badge>
            <Badge className={`text-xs ${statusColors[status]}`}>{status}</Badge>
          </div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="w-4 h-4 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onViewLive} disabled={!onViewLive}>
              <ExternalLink className="w-4 h-4 mr-2" />View Live
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

      {updatedAt && <p className="mb-4 text-xs text-muted-foreground">Last saved {new Date(updatedAt).toLocaleDateString()}</p>}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />Preview
        </Button>
        <Button size="sm" className="flex-1 bg-gradient-primary hover:opacity-90" onClick={onEdit}>
          <Edit3 className="w-4 h-4 mr-2" />Edit
        </Button>
      </div>
    </div>
  );
};
