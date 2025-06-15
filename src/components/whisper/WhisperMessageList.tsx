
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
  userId: string;
  partnerInfo: any;
  hasRecognized: boolean;
  editingMessage: Message | null;
  editContent: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
  onStartEditing: (msg: Message) => void;
  onCancelEditing: () => void;
  onChangeEditContent: (val: string) => void;
  onEditMessage: () => void;
  onDeleteMessage: (id: string) => void;
}

const WhisperMessageList: React.FC<WhisperMessageListProps> = ({
  messages,
  userId,
  partnerInfo,
  hasRecognized,
  editingMessage,
  editContent,
  textareaRef,
  messagesEndRef,
  onStartEditing,
  onCancelEditing,
  onChangeEditContent,
  onEditMessage,
  onDeleteMessage,
}) => {
  const formatMessageTime = (timestamp: string) => format(new Date(timestamp), "h:mm a");
  
  return (
    <div className="flex flex-col space-y-2">
      {messages.map((message) => {
        const isOwnMessage = message.sender === userId;
        const isEditing = editingMessage?._id === message._id;
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
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => onChangeEditContent(e.target.value)}
                    className="min-h-[60px] bg-background text-foreground"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onCancelEditing}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={onEditMessage}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="break-words">{message.content}</p>
                  <div
                    className={cn(
                      "text-xs mt-1 flex justify-between items-center",
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
                    {isOwnMessage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                              isOwnMessage
                                ? "hover:bg-purple-700 text-white/70"
                                : "hover:bg-muted-foreground/10"
                            )}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onStartEditing(message)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDeleteMessage(message._id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );  
};

export default WhisperMessageList;
