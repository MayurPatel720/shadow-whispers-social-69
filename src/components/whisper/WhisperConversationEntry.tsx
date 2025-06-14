
import React, { useState } from "react";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { MoreVertical, Loader } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

type ConversationEntryProps = {
  convo: any;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
  showDeleteDialog: boolean;
  onShowDeleteDialog: (open: boolean) => void;
  deletePending: boolean;
  getLastMessageTime: (timestamp: string) => string;
};

const WhisperConversationEntry: React.FC<ConversationEntryProps> = ({
  convo,
  selected,
  onClick,
  onDelete,
  showDeleteDialog,
  onShowDeleteDialog,
  deletePending,
  getLastMessageTime,
}) => {
  // Control the menu open state
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`group p-3 hover:bg-undercover-purple/5 cursor-pointer relative ${
        selected ? "bg-undercover-purple/10" : ""
      }`}
    >
      <div className="flex items-center space-x-3" onClick={onClick}>
        <AvatarGenerator
          emoji={convo.partner.avatarEmoji || "🎭"}
          nickname={convo.partner.anonymousAlias}
          color="#6E59A5"
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="font-medium truncate">
              {convo.partner.anonymousAlias || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getLastMessageTime(convo.lastMessage.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground truncate pr-2">
              {convo.lastMessage.content}
            </p>
            {convo.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-undercover-purple text-white text-xs">
                {convo.unreadCount}
              </span>
            )}
          </div>
        </div>
        {/* Three dots: normal color, opens menu on click */}
        <div
          className="relative"
          onClick={e => e.stopPropagation()} // prevent parent click
          tabIndex={-1}
        >
          <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center cursor-pointer rounded-full p-1 
                  opacity-70 group-hover:opacity-100 
                  text-muted-foreground 
                  hover:bg-undercover-purple/15 hover:text-undercover-purple 
                  focus:bg-undercover-purple/15 focus:text-undercover-purple 
                  transition"
                tabIndex={0}
                aria-label="Conversation menu"
                onClick={e => {
                  e.preventDefault();
                  setMenuOpen((v) => !v);
                }}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent align="end" className="z-30">
              <ContextMenuItem
                className="text-red-500 focus:bg-red-100"
                onClick={() => {
                  setMenuOpen(false);
                  onShowDeleteDialog(true);
                }}
              >
                Delete Conversation
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={onShowDeleteDialog}
      >
        <AlertDialogTrigger asChild>
          <div />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages with{" "}
              <b>{convo.partner.anonymousAlias}</b>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePending}
              onClick={onDelete}
            >
              {deletePending ? <Loader className="h-4 w-4 animate-spin mr-1" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WhisperConversationEntry;

