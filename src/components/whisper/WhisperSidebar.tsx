
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhisperMatchEntry from "@/components/feed/WhisperMatchEntry";
import WhisperConversationEntry from "./WhisperConversationEntry";
import { MessageSquare, Plus } from "lucide-react";

type WhisperSidebarProps = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredConversations: any[];
  selectedConversation: any;
  onSelectConversation: (convo: any) => void;
  isWhisperModalOpen: boolean;
  setIsWhisperModalOpen: (open: boolean) => void;
  setIsYourMatchesOpen: (open: boolean) => void;
  deletingId: string | null;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (open: boolean) => void;
  setDeletingId: (id: string | null) => void;
  onDeleteConversation: (partnerId: string) => void;
  deletePendingId: string | null;
  getLastMessageTime: (timestamp: string) => string;
};

const WhisperSidebar: React.FC<WhisperSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  filteredConversations,
  selectedConversation,
  onSelectConversation,
  isWhisperModalOpen,
  setIsWhisperModalOpen,
  setIsYourMatchesOpen,
  deletingId,
  showDeleteDialog,
  setShowDeleteDialog,
  setDeletingId,
  onDeleteConversation,
  deletePendingId,
  getLastMessageTime,
}) => {
  return (
    <div className={`md:w-1/3 max-w-md border-r border-border flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-undercover-light-purple">Whispers</h2>
        <p className="text-sm text-muted-foreground">Anonymous messages</p>
      </div>
      <div className="p-4 border-b border-border flex flex-col gap-2">
        <WhisperMatchEntry onClick={() => setIsYourMatchesOpen(true)} />
      </div>
      <div className="p-2 sticky top-0 bg-background z-10">
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-card"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {filteredConversations && filteredConversations.length > 0 ? (
        <div className="divide-y divide-border overflow-auto flex-1">
          {filteredConversations.map((convo) => (
            <WhisperConversationEntry
              key={convo._id}
              convo={convo}
              selected={selectedConversation && selectedConversation._id === convo._id}
              onClick={() => onSelectConversation(convo)}
              onDelete={() => onDeleteConversation(convo._id)}
              showDeleteDialog={showDeleteDialog && deletingId === convo._id}
              onShowDeleteDialog={(open) => {
                setShowDeleteDialog(open);
                if (open) setDeletingId(convo._id);
                else setDeletingId(null);
              }}
              deletePending={deletePendingId === convo._id}
              getLastMessageTime={getLastMessageTime}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center justify-center flex-1">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-center text-muted-foreground">
            {searchTerm ? "No matching conversations" : "No whispers yet."}
          </p>
          <Button className="mt-4 bg-undercover-purple" onClick={() => setIsWhisperModalOpen(true)}>
            Start a whisper
          </Button>
          <div className="mt-3 w-full">
            <WhisperMatchEntry onClick={() => setIsYourMatchesOpen(true)} />
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <Button
          className="w-full bg-undercover-purple hover:bg-undercover-deep-purple"
          onClick={() => setIsWhisperModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Whisper
        </Button>
      </div>
    </div>
  );
};

export default WhisperSidebar;
