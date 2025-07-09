
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: any;
  onEdit: (content: string) => void;
}

const EditCommentModal = ({ 
  open, 
  onOpenChange, 
  comment, 
  onEdit 
}: EditCommentModalProps) => {
  const [content, setContent] = useState(comment?.content || "");

  const handleSubmit = () => {
    if (content.trim()) {
      onEdit(content.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Edit Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your comment..."
            className="bg-gray-800 border-gray-700 text-gray-200"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCommentModal;
