
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getActiveAMAs, startAMA, askAMAQuestion, answerAMAQuestion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AMASessionList() {
  const { data: amas = [], refetch } = useQuery({ queryKey: ["amas"], queryFn: getActiveAMAs });
  const [showStart, setShowStart] = useState(false);
  const [title, setTitle] = useState("");
  const [qText, setQText] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const { mutate: start } = useMutation({
    mutationFn: startAMA,
    onSuccess: () => { setShowStart(false); refetch(); }
  });
  const { mutate: ask } = useMutation({
    mutationFn: askAMAQuestion,
    onSuccess: () => { setQText(""); refetch(); }
  });

  return (
    <div>
      <Button onClick={() => setShowStart(true)}>Start AMA/Q&A Session</Button>
      <Dialog open={showStart} onOpenChange={setShowStart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a Q&A Session</DialogTitle>
          </DialogHeader>
          <Textarea value={title} onChange={e => setTitle(e.target.value)} placeholder="Session title" />
          <Button onClick={() => start({ title })}>Start</Button>
        </DialogContent>
      </Dialog>
      <div className="mt-4 space-y-3">
        {amas.map((ama: any) => (
          <div key={ama._id} className="border rounded p-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{ama.title}</span>
              <span className="text-xs text-muted-foreground">by {ama.host?.anonymousAlias}</span>
            </div>
            <Button size="sm" onClick={() => setSelected(ama)}>View</Button>
            <Dialog open={selected && selected._id === ama._id} onOpenChange={() => setSelected(null)}>
              <DialogContent>
                <DialogHeader><DialogTitle>{ama.title}</DialogTitle></DialogHeader>
                <div>
                  <div className="space-y-2 mb-4">
                    {ama.questions.map((q: any, i: number) => (
                      <div key={i} className="rounded bg-muted p-2">
                        <div>{q.text}</div>
                        {q.answered
                          ? <div className="text-emerald-600 font-semibold mt-1">A: {q.answer}</div>
                          : selected.host?._id === ama.host._id
                            ? (
                              <form
                                onSubmit={e => {e.preventDefault(); answerAMAQuestion({ sessionId: ama._id, qIdx: i, answer: qText }); refetch(); setQText("");}}
                                className="flex gap-1"
                              >
                                <Textarea value={qText} onChange={e => setQText(e.target.value)} placeholder="Type answer" rows={1} />
                                <Button type="submit" size="sm">Answer</Button>
                              </form>
                            )
                            : <span className="text-xs text-muted-foreground">Awaiting answer</span>
                        }
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {e.preventDefault(); ask({ sessionId: ama._id, text: qText });}}
                    className="flex gap-2"
                  >
                    <Textarea value={qText} onChange={e => setQText(e.target.value)} placeholder="Ask a question..." rows={1} />
                    <Button type="submit">Ask</Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}
