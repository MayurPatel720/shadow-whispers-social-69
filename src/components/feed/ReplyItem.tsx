
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";

interface ReplyItemProps {
  reply: any;
  commentId: string;
  postId: string;
  currentUserId: string;
  onDelete: (replyId: string) => void;
  onEdit: (replyId: string, newContent: string) => void;
}

const ReplyItem = ({ 
  reply, 
  currentUserId, 
  onDelete, 
  onEdit 
}: ReplyItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(reply._id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(reply._id);
  };

  return (
    <div className="flex space-x-3 py-2 ml-8">
      <Avatar className="h-6 w-6">
        <AvatarImage src={`data:image/svg+xml,${encodeURIComponent(reply.avatarEmoji)}`} alt={reply.anonymousAlias} />
        <AvatarFallback className="text-xs">{reply.anonymousAlias.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-gray-300">{reply.anonymousAlias}</div>
          {currentUserId === reply.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-4 w-4 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isEditing ? (
          <div className="mt-1">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
            />
            <div className="flex space-x-2 mt-1">
              <Button size="sm" onClick={handleEdit} className="text-xs h-6">Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="text-xs h-6">Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">{reply.content}</p>
        )}
      </div>
    </div>
  );
};

export default ReplyItem;
