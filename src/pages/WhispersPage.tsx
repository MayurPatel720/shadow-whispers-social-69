
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMyWhispers, joinWhisperMatch, deleteConversation } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhisperConversation from "@/components/whisper/WhisperConversation";
import WhisperModal from "@/components/whisper/WhisperModal";
import { toast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import WhisperSidebar from "@/components/whisper/WhisperSidebar";
import YourMatchesModal from "@/components/whisper/YourMatchesModal";

// Custom hook to detect mobile screen
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const WhispersPage = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [isYourMatchesOpen, setIsYourMatchesOpen] = useState(false);
  const [joinedMatch, setJoinedMatch] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Used only for mobile to force sidebar open/close
  // On desktop, always visible
  // On mobile: true = sidebar, false = conversation
  const showSidebarOnMobile = isMobile && !selectedConversation;
  const showConversationOnMobile = isMobile && selectedConversation;

  // Handle userId passed via query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userIdFromQS = params.get("userId");
    if (userIdFromQS && user) {
      setSelectedConversation({ _id: userIdFromQS });
      params.delete("userId");
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
    // eslint-disable-next-line
  }, [location.search, user]);
  
  useEffect(() => {
    if (user && !joinedMatch) {
      joinWhisperMatch()
        .then(() => setJoinedMatch(true))
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Error joining match session",
            description: "Could not start whisper match session. Please try again later."
          });
        });
    }
    // eslint-disable-next-line
  }, [user]);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['whispers'],
    queryFn: getMyWhispers,
    enabled: !!user,
    refetchInterval: 15000,
    meta: {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error loading whispers",
          description: "Could not load your whispers. Please try again later."
        });
      }
    }
  });

  const filteredConversations = React.useMemo(() => {
    if (!conversations) return [];
    if (!searchTerm.trim()) return conversations;
    return conversations.filter(convo => 
      convo.partner.anonymousAlias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (convo.partner.username && convo.partner.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [conversations, searchTerm]);

  const handleSelectConversation = (convo) => {
    setSelectedConversation(convo);
  };

  const getLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (partnerId: string) => deleteConversation(partnerId),
    onSuccess: (_, partnerId) => {
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
      if (selectedConversation && selectedConversation._id === partnerId) {
        setSelectedConversation(null);
      }
      setShowDeleteDialog(false);
      setDeletingId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to Delete",
        description: "Could not delete the conversation. Please try again.",
      });
      setShowDeleteDialog(false);
      setDeletingId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-background">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SIDEBAR: 
          - On DESKTOP: always show
          - On mobile: show only if no conversation selected */}
        <div
          className={`
            w-full md:w-1/3 max-w-md border-r border-border flex flex-col h-full
            ${showSidebarOnMobile ? "fixed inset-0 z-30 bg-background" : ""}
            ${isMobile && selectedConversation ? "hidden" : "flex"}
            md:static md:flex
          `}
          style={{
            minWidth: isMobile ? '100vw' : undefined,
            maxWidth: isMobile ? '100vw' : undefined,
          }}
        >
          <WhisperSidebar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredConversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            isWhisperModalOpen={isWhisperModalOpen}
            setIsWhisperModalOpen={setIsWhisperModalOpen}
            setIsYourMatchesOpen={setIsYourMatchesOpen}
            deletingId={deletingId}
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
            setDeletingId={setDeletingId}
            onDeleteConversation={(partnerId) => deleteConversationMutation.mutate(partnerId)}
            deletePendingId={deleteConversationMutation.isPending ? deletingId : null}
            getLastMessageTime={getLastMessageTime}
          />
        </div>
        {/* CONVERSATION: 
          - On DESKTOP: always show panel
          - On mobile: show only if a conversation is selected
            & insert a "Back" button at the very top */}
        <div
          className={`
            flex-1 flex flex-col bg-background h-full overflow-auto
            ${isMobile ? (selectedConversation ? "flex" : "hidden") : "flex"}
          `}
        >
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              {isMobile && (
                <div className="sticky top-0 z-50 bg-card border-b flex items-center p-2">
                  <Button size="icon" variant="ghost" onClick={() => setSelectedConversation(null)}>
                    <svg viewBox="0 0 20 20" fill="none" width={22} height={22}>
                      <path d="M12.5 5L8 10L12.5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                  <span className="ml-2 font-semibold">Back</span>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <WhisperConversation 
                  partnerId={selectedConversation._id} 
                  onBack={
                    isMobile
                      ? () => setSelectedConversation(null)
                      : undefined
                  }
                />
              </div>
            </div>
          ) : (
            !isMobile && (
              <div className="h-full flex flex-col items-center justify-center p-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium text-undercover-light-purple mb-2">
                  Your Whispers
                </h3>
                <p className="text-center text-muted-foreground max-w-md">
                  Select a conversation to view your whispers. 
                  All messages are anonymous until someone correctly guesses your identity.
                </p>
                <div className="mt-4">
                  {/* Note: this button only shows on desktop */}
                  <Button onClick={() => setIsYourMatchesOpen(true)} className="bg-undercover-purple">
                    Your Matches
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      {/* Modals */}
      <YourMatchesModal
        open={isYourMatchesOpen}
        onOpenChange={setIsYourMatchesOpen}
      />
      <WhisperModal
        open={isWhisperModalOpen}
        onOpenChange={setIsWhisperModalOpen}
      />
    </div>
  );
};

export default WhispersPage;
