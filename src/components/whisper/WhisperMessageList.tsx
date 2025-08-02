
import React, { RefObject } from "react";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
  edited?: boolean;
};

interface WhisperMessageListProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore: () => Promise<void>;
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
  const formatMessageTime = (timestamp: string) => format(new Date(timestamp), "h:mm a");
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {hasMore && (
        <div className="text-center pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-sm text-muted-foreground"
          >
            {isLoadingMore ? "Loading..." : "Load more messages"}
          </Button>
        </div>
      )}
      <div className="flex flex-col space-y-2">
        {messages.map((message) => {
          const isOwnMessage = message.sender === currentUserId;
          return (
            <div
              key={message._id}
              className={cn(
                "flex",
                isOwnMessage ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2",
                  isOwnMessage
                    ? "bg-purple-600 text-white"
                    : "bg-muted text-foreground"
                )}
              >
                <p className="break-words">{message.content}</p>
                <div
                  className={cn(
                    "text-xs mt-1",
                    isOwnMessage
                      ? "text-white/70"
                      : "text-muted-foreground"
                  )}
                >
                  <span>
                    {formatMessageTime(message.createdAt)}
                    {message.edited && (
                      <span className="ml-1">(edited)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );  
};

export default WhisperMessageList;
