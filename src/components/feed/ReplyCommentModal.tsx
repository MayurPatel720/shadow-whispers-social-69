
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

interface ReplyCommentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: (content: string, anonymousAlias: string) => void;
}

const ReplyCommentModal = ({ 
  open, 
  onOpenChange, 
  onReply 
}: ReplyCommentModalProps) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();

  const handleSubmit = () => {
    if (content.trim() && user?.anonymousAlias) {
      onReply(content.trim(), user.anonymousAlias);
      setContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Reply to Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reply..."
            className="bg-gray-800 border-gray-700 text-gray-200"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyCommentModal;
