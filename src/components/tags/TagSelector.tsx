
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Hash } from "lucide-react";
import { getAllTags, Tag } from "@/lib/api-tags";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 3,
  className
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getAllTags();
        setAvailableTags(response.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm font-medium text-foreground mb-2">Tags (Loading...)</div>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">
          Tags ({selectedTags.length}/{maxTags})
        </div>
        {selectedTags.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onTagsChange([])}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagName => {
            const tag = availableTags.find(t => t.name === tagName);
            return (
              <Badge
                key={tagName}
                variant="secondary"
                className="flex items-center gap-1 bg-purple-500/20 text-purple-400 border-purple-500/30"
              >
                <Hash className="h-3 w-3" />
                {tag?.displayName || tagName}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tagName)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <Button
            key={tag._id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTagToggle(tag.name)}
            disabled={selectedTags.includes(tag.name) || (!selectedTags.includes(tag.name) && selectedTags.length >= maxTags)}
            className={cn(
              "h-8 px-3 rounded-full transition-all duration-200",
              selectedTags.includes(tag.name)
                ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted hover:text-foreground"
            )}
          >
            <Hash className="h-3 w-3 mr-1" />
            {tag.displayName}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;
