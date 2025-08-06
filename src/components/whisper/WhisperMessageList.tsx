
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import WhisperMessage from "./WhisperMessage";
import { editWhisper, deleteWhisperMessage } from "@/lib/api-whispers";
import { toast } from "@/hooks/use-toast";

interface WhisperMessageListProps {
  messages: any[];
  currentUserId: string;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

const WhisperMessageList: React.FC<WhisperMessageListProps> = ({
  messages,
  currentUserId,
  onLoadMore,
  isLoadingMore,
  hasMore,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editWhisper(messageId, content);
      // The message will be updated via socket event
      toast({
        title: "Message edited",
        description: "Your message has been updated."
      });
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        variant: "destructive",
        title: "Edit failed",
        description: "Could not edit your message. Please try again."
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteWhisperMessage(messageId);
      // The message will be removed via socket event
      toast({
        title: "Message deleted",
        description: "Your message has been removed."
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "Delete failed", 
        description: "Could not delete your message. Please try again."
      });
    }
  };

  return (
    <div className="flex-1 overflow-auto" ref={scrollRef}>
      {/* Load more button at top */}
      {hasMore && (
        <div className="p-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader className="h-3 w-3 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load older messages"
            )}
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="p-4 space-y-2">
        {messages.map((message) => (
          <WhisperMessage
            key={message._id}
            message={message}
            isOwn={message.sender === currentUserId}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default WhisperMessageList;
