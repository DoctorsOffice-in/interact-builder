import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { QuizQuestion, QuizOption } from "@/pages/QuizBuilder";

interface Props {
  question: QuizQuestion;
  index: number;
  scoringType: "points" | "category";
  onUpdate: (id: string, updates: Partial<QuizQuestion>) => void;
  onDelete: (id: string) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionIndex: number, value: string) => void;
  onUpdateOptionSettings: (questionId: string, optionIndex: number, updates: Partial<QuizOption>) => void;
  onRemoveOption: (questionId: string, optionIndex: number) => void;
  onImageUpload: (questionId: string) => void;
}

export const QuizQuestionEditor = ({
  question,
  index,
  scoringType,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onUpdateOptionSettings,
  onRemoveOption,
  onImageUpload,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="border border-border/50 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2 flex-1">
            <button {...attributes} {...listeners} className="mt-2 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Q{index + 1}</Badge>
                <Badge variant="outline" className="text-xs">
                  {question.type.replace("-", " ")}
                </Badge>
              </div>
              <Input
                value={question.question}
                onChange={(e) => onUpdate(question.id, { question: e.target.value })}
                placeholder="Enter your question..."
                className="text-base font-medium"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={() => onImageUpload(question.id)}>
              <Image className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(question.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>

        {question.imageUrl && (
          <div className="mt-3 relative">
            <img src={question.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg" />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => onUpdate(question.id, { imageUrl: undefined, image: undefined })}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Remove
            </Button>
          </div>
        )}

        {!question.imageUrl && question.image && (
          <div
            className="mt-3 p-4 border border-dashed border-border rounded-lg text-center cursor-pointer hover:bg-muted/50"
            onClick={() => onImageUpload(question.id)}
          >
            <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload image</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => onUpdateOption(question.id, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1"
                />
                {scoringType === "points" && (
                  <Input
                    type="number"
                    value={question.optionSettings?.[optionIndex]?.points ?? 0}
                    onChange={(e) =>
                      onUpdateOptionSettings(question.id, optionIndex, {
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-20"
                    placeholder="Pts"
                    title="Points for this answer"
                  />
                )}
                {scoringType === "category" && (
                  <Input
                    value={question.optionSettings?.[optionIndex]?.resultCategory ?? ""}
                    onChange={(e) =>
                      onUpdateOptionSettings(question.id, optionIndex, {
                        resultCategory: e.target.value,
                      })
                    }
                    className="w-32"
                    placeholder="Category"
                    title="Result category"
                  />
                )}
                {question.options.length > 2 && (
                  <Button size="icon" variant="ghost" onClick={() => onRemoveOption(question.id, optionIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={() => onAddOption(question.id)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
