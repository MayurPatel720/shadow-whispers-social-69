
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { joinWhisperMatch, sendWhisperMatchMessage, leaveWhisperMatch } from "@/lib/api";
import { Loader2, User2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

export default function WhisperMatchModal({ open, onOpenChange }: Props) {
  const [match, setMatch] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [waiting, setWaiting] = useState(false);

  const { mutate: join, isPending: isJoining } = useMutation({
    mutationFn: joinWhisperMatch,
    onSuccess: (data) => {
      if (data.status === "matched") setMatch(data.match);
      else setWaiting(true);
    },
  });

  const { mutate: send, isPending: isSending } = useMutation({
    mutationFn: sendWhisperMatchMessage,
    onSuccess: (_res) => {
      setMessages([...messages, { sender: "me", content: msg }]);
      setMsg("");
    },
  });

  const start = () => {
    setMatch(null); setWaiting(false); setMessages([]);
    join();
  };

  const leave = () => {
    if (match?._id) {
      leaveWhisperMatch(match._id);
    }
    setMatch(null);
    setWaiting(false);
    setMessages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={leave}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Whisper Match</DialogTitle>
        </DialogHeader>
        {!match && !waiting && (
          <Button onClick={start} disabled={isJoining}>
            {isJoining ? <Loader2 className="animate-spin mr-2" /> : null}
            Find Match
          </Button>
        )}
        {waiting && (
          <div className="text-center space-y-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p>Waiting for another user...</p>
            <Button onClick={leave}>Cancel</Button>
          </div>
        )}
        {match && (
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              Matched! Session ends {match.sessionExpiresAt ? new Date(match.sessionExpiresAt).toLocaleTimeString() : ""}
            </div>
            <div className="h-32 overflow-y-auto border rounded mb-2 bg-muted p-2">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.sender === "me" ? "text-right text-purple-600" : "text-left"}`}>{m.content}</div>
              ))}
            </div>
            <form
              onSubmit={e => {e.preventDefault(); send({ matchId: match._id, content: msg });}}
              className="flex gap-2"
            >
              <Textarea value={msg} onChange={e => setMsg(e.target.value)} rows={1} className="resize-none" />
              <Button type="submit" disabled={!msg || isSending}>Send</Button>
            </form>
            <Button variant="ghost" className="mt-2" onClick={leave}>Leave</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

