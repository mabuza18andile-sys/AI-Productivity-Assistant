import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Send, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ErrorBox, Markdown, PageHeader } from "@/components/shared";
import { useAi } from "@/hooks/use-ai";
import { logActivity } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/chat")({
  head: () => pageMeta("Workplace Chatbot", "Chat with WorkSmart Assistant for practical workplace guidance."),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };
const SUGGESTIONS = [
  "Help me write a professional email.",
  "Summarize these meeting notes.",
  "Help me prioritize my workload.",
  "Explain this business topic in simple language.",
  "Create a plan for my working day.",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const ai = useAi("chat");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, ai.loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || ai.loading) return;
    const history = messages;
    setMessages([...history, { role: "user", content: t }]);
    setInput("");
    const reply = await ai.run(t, history);
    if (reply) {
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (history.length === 0) logActivity("chat", t);
    }
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[520px] flex-col">
      <div className="flex items-start justify-between gap-3">
        <PageHeader icon={MessageSquare} title="WorkSmart Assistant" description="Practical workplace guidance. History lasts for this session only." />
        {messages.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" size="sm"><Trash2 /> Clear</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
                <AlertDialogDescription>All messages in this session will be removed. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { setMessages([]); ai.setError(null); }}>Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border bg-card p-4 shadow-card sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground"><Bot className="h-6 w-6" /></div>
            <p className="mt-4 font-semibold text-foreground">How can I help you today?</p>
            <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border bg-secondary px-3.5 py-1.5 text-sm text-secondary-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {m.role === "user" ? <p className="whitespace-pre-wrap text-sm">{m.content}</p> : <Markdown>{m.content}</Markdown>}
                </div>
              </div>
            ))}
            {ai.loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-accent" /> WorkSmart Assistant is thinking…</div>
            )}
            {ai.error && <ErrorBox message={ai.error} />}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1}
          placeholder="Ask anything about your work… (Enter to send, Shift+Enter for new line)"
          className="min-h-[44px] resize-none bg-card"
          aria-label="Message"
        />
        <Button type="submit" disabled={!input.trim() || ai.loading} className="h-auto" aria-label="Send"><Send /></Button>
      </form>
    </div>
  );
}
