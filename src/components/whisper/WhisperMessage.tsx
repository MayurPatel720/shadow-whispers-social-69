
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Edit, Trash, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WhisperMessageProps {
  message: any;
  isOwn: boolean;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

const WhisperMessage: React.FC<WhisperMessageProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(message._id);
    setShowDeleteDialog(false);
  };

  // Check if message was actually edited (more than 1 second difference)
  const isActuallyEdited = () => {
    if (!message.updatedAt || !message.createdAt) return false;
    const createdTime = new Date(message.createdAt).getTime();
    const updatedTime = new Date(message.updatedAt).getTime();
    return updatedTime - createdTime > 1000; // More than 1 second difference
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
        isOwn 
          ? "bg-undercover-purple text-white" 
          : "bg-muted"
      }`}>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-sm bg-background/20 border-background/30"
              autoFocus
            />
            <div className="flex justify-end space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0 hover:bg-background/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm">{message.content}</p>
            <p className="text-xs opacity-75 mt-1">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              {isActuallyEdited() && " (edited)"}
            </p>
          </>
        )}
        
        {isOwn && !isEditing && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full bg-background hover:bg-muted"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WhisperMessage;
