
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
import { MoreHorizontal, Reply } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { deleteComment, editComment, replyToComment, deleteReply, updateReply } from "@/lib/api";
import ReplyItem from "./ReplyItem";
import EditCommentModal from "./EditCommentModal";
import ReplyCommentModal from "./ReplyCommentModal";

interface CommentItemProps {
  comment: any;
  postId: string;
  currentUserId: string;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, newContent: string) => void;
  onReply?: (commentId: string, newReply: any) => void;
  onDeleteReply?: (commentId: string, replyId: string) => void;
  onEditReply?: (commentId: string, replyId: string, newContent: string) => void;
}

const CommentItem = ({ 
  comment, 
  postId, 
  currentUserId, 
  onDelete, 
  onEdit, 
  onReply,
  onDeleteReply,
  onEditReply
}: CommentItemProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteComment(postId, comment._id);
      onDelete(comment._id);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment",
      });
    }
  };

  const handleEdit = async (newContent: string) => {
    try {
      await editComment(postId, comment._id, newContent);
      onEdit(comment._id, newContent);
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error("Error editing comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update comment",
      });
    }
  };

  const handleReply = async (content: string, anonymousAlias: string) => {
    try {
      const response = await replyToComment(postId, comment._id, content, anonymousAlias);
      if (onReply) {
        onReply(comment._id, response.reply);
      }
      setIsReplyModalOpen(false);
      toast({
        title: "Success",
        description: "Reply added successfully",
      });
    } catch (error) {
      console.error("Error replying to comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reply",
      });
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      await deleteReply(postId, comment._id, replyId);
      if (onDeleteReply) {
        onDeleteReply(comment._id, replyId);
      }
      toast({
        title: "Success",
        description: "Reply deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete reply",
      });
    }
  };

  const handleEditReply = async (replyId: string, newContent: string) => {
    try {
      await updateReply(postId, comment._id, replyId, newContent);
      if (onEditReply) {
        onEditReply(comment._id, replyId, newContent);
      }
      toast({
        title: "Success",
        description: "Reply updated successfully",
      });
    } catch (error) {
      console.error("Error updating reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update reply",
      });
    }
  };

  return (
    <div className="flex space-x-3 py-2">
      <Avatar>
        <AvatarImage src={`data:image/svg+xml,${encodeURIComponent(comment.avatarEmoji)}`} alt={comment.anonymousAlias} />
        <AvatarFallback>{comment.anonymousAlias.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{comment.anonymousAlias}</div>
          {currentUserId === comment.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{comment.content}</p>
        <div className="mt-2 flex items-center space-x-4 text-xs">
          <Button variant="ghost" size="sm" onClick={() => setIsReplyModalOpen(true)}>
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </Button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.replies.map((reply: any) => (
              <ReplyItem
                key={reply._id}
                reply={reply}
                commentId={comment._id}
                postId={postId}
                currentUserId={currentUserId}
                onDelete={handleDeleteReply}
                onEdit={handleEditReply}
              />
            ))}
          </div>
        )}
      </div>

      <EditCommentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        comment={comment}
        onEdit={handleEdit}
      />
      <ReplyCommentModal
        open={isReplyModalOpen}
        onOpenChange={setIsReplyModalOpen}
        onReply={handleReply}
      />
    </div>
  );
};

export default CommentItem;
