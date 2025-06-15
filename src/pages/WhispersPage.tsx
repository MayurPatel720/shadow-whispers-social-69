
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMyWhispers, joinWhisperMatch, deleteConversation } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader, MessageSquare, Search, Plus, ArrowLeft, Trash, Menu, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhisperConversation from "@/components/whisper/WhisperConversation";
import WhisperModal from "@/components/whisper/WhisperModal";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import WhisperMatchEntry from "@/components/feed/WhisperMatchEntry";
import YourMatchesModal from "@/components/whisper/YourMatchesModal";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import WhisperSidebar from "@/components/whisper/WhisperSidebar";

const WhispersPage = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [isYourMatchesOpen, setIsYourMatchesOpen] = useState(false);
  const [joinedMatch, setJoinedMatch] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Conversation being deleted
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

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

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['whispers'],
    queryFn: getMyWhispers,
    enabled: !!user,
    refetchInterval: 15000,
    meta: {
      onError: (error) => {
        console.error("Error fetching whispers:", error);
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
      return format(date, 'h:mm a');
    }
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      return format(date, 'EEE');
    }
    return format(date, 'MMM d');
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
      // If currently open convo is the deleted one, close it
      if (selectedConversation && selectedConversation._id === partnerId) {
        setSelectedConversation(null);
      }
      setShowDeleteDialog(false);
      setDeletingId(null);
    },
    onError: (error: any) => {
      console.error("Delete conversation error:", error);
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className={
        `w-full md:w-1/3 max-w-md flex-none border-r border-border bg-background
        ${selectedConversation ? 'hidden md:flex' : 'flex'}`
      }>
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
      {/* Conversation area */}
      <div className={`flex-1 flex flex-col min-h-0 w-full ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <div className="flex flex-col flex-1 h-full min-h-0">
            <WhisperConversation 
              partnerId={selectedConversation._id} 
              onBack={() => setSelectedConversation(null)}
            />
          </div>
        ) : (
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
              <WhisperMatchEntry onClick={() => setIsYourMatchesOpen(true)} />
            </div>
          </div>
        )}
      </div>

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

