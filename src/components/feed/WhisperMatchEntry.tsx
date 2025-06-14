
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import WhisperMatchModal from "../whisper/WhisperMatchModal";

export default function WhisperMatchEntry() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2 rounded-md px-3 py-2 mb-3"
      >
        <MessageCircle size={18} />
        Start Whisper Match
      </Button>
      <WhisperMatchModal open={open} onOpenChange={setOpen} />
    </>
  );
}
