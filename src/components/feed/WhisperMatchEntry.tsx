
import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface WhisperMatchEntryProps {
  onClick: () => void;
}

export default function WhisperMatchEntry({ onClick }: WhisperMatchEntryProps) {
  // Replaces the old match button with "Your Matches"
  return (
    <Button
      onClick={onClick}
      className="bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2 rounded-md px-3 py-2 mb-3"
    >
      <Users size={18} />
      Your Matches
    </Button>
  );
}
