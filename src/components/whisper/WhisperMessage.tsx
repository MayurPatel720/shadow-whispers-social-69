
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
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 group`}>
      <div className={`
        max-w-[280px] md:max-w-md px-4 py-3 rounded-2xl relative
        shadow-sm transition-all duration-200 group-hover:shadow-md
        ${isOwn 
          ? "bg-gradient-to-br from-undercover-purple to-undercover-deep-purple text-white ml-12" 
          : "bg-muted/80 backdrop-blur-sm border border-border/50 mr-12"
        }
      `}>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`
                text-sm border-0 bg-background/20 
                focus:bg-background/30 transition-colors
                ${isOwn ? 'text-white placeholder:text-white/70' : ''}
              `}
              placeholder="Edit your message..."
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className={`
                  h-7 w-7 p-0 rounded-full transition-all
                  ${isOwn 
                    ? 'hover:bg-white/20 text-white/80 hover:text-white' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className={`
                  h-7 w-7 p-0 rounded-full transition-all
                  ${isOwn 
                    ? 'hover:bg-white/20 text-white/80 hover:text-white' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
            <div className={`
              flex items-center justify-between mt-2 pt-1 border-t
              ${isOwn ? 'border-white/20' : 'border-border/30'}
            `}>
              <p className={`
                text-xs transition-opacity
                ${isOwn ? 'text-white/70' : 'text-muted-foreground'}
              `}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                {isActuallyEdited() && (
                  <span className={`ml-2 ${isOwn ? 'text-white/50' : 'text-muted-foreground/70'}`}>
                    (edited)
                  </span>
                )}
              </p>
            </div>
          </>
        )}
        
        {isOwn && !isEditing && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-105">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full bg-background hover:bg-muted shadow-lg border border-border/20"
                >
                  <MoreVertical className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-xl border border-border/50 backdrop-blur-sm">
                <DropdownMenuItem 
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-muted/80 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        <AlertDialogContent className="backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-muted/80">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WhisperMessage;
