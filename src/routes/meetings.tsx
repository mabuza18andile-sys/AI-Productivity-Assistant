import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, FileText, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyOutput, ErrorBox, FieldError, LoadingState, Markdown, PageHeader, Panel, ReviewNote } from "@/components/shared";
import { copyText, useAi } from "@/hooks/use-ai";
import { logActivity } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => pageMeta("Meeting Notes Summarizer", "Turn long meeting notes into decisions, action items and deadlines."),
  component: MeetingsPage,
});

const SAMPLE = `Weekly ops sync. Present: Thandi, Mark, Priya.
Thandi said the Q3 supplier review is behind. Agreed to move the review meeting to next Tuesday.
Mark will update the inventory dashboard by Friday.
Priya suggested switching courier providers — needs cost comparison first, no decision.
Question: who owns the onboarding checklist update?`;

function extractActions(md: string) {
  const i = md.search(/##\s*Action Items/i);
  if (i < 0) return "";
  const rest = md.slice(i);
  const next = rest.slice(3).search(/\n##\s/);
  return next < 0 ? rest : rest.slice(0, next + 3);
}

function MeetingsPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string>();
  const ai = useAi("meeting");

  async function summarize() {
    if (notes.trim().length < 30) return setErr("Please paste at least 30 characters of meeting notes.");
    setErr(undefined);
    const text = await ai.run(`Meeting title: ${title || "Not specified"}\nMeeting date: ${date || "Not specified"}\n\nNotes:\n${notes}`);
    if (text) {
      logActivity("meeting", title || notes.slice(0, 60));
      toast.success("Summary ready");
    }
  }

  return (
    <div>
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Paste your notes to extract the summary, decisions and action items." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <Label htmlFor="mt">Meeting title</Label>
                <Input id="mt" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label htmlFor="md">Date</Label>
                <Input id="md" type="date" className="mt-1.5" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mn">Meeting notes *</Label>
                <button type="button" className="text-xs font-semibold text-accent hover:underline" onClick={() => setNotes(SAMPLE)}>Use example</button>
              </div>
              <Textarea id="mn" className="mt-1.5 min-h-[300px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste raw meeting notes or a transcript…" />
              <FieldError msg={err} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={summarize} disabled={ai.loading}><Wand2 /> Summarize Notes</Button>
              <Button variant="outline" disabled={ai.loading} onClick={() => { setTitle(""); setDate(""); setNotes(""); ai.setOutput(""); ai.setError(null); }}><Trash2 /> Clear</Button>
            </div>
          </div>
        </Panel>
        <Panel className="lg:col-span-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Structured summary</h2>
            {ai.output && !ai.loading && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(ai.output)}><Copy /> Copy summary</Button>
                <Button size="sm" variant="outline" onClick={() => copyText(extractActions(ai.output) || ai.output)}><Copy /> Copy actions</Button>
                <Button size="sm" variant="outline" onClick={summarize}><RefreshCw /> Regenerate</Button>
              </div>
            )}
          </div>
          {ai.error && <div className="mb-3"><ErrorBox message={ai.error} /></div>}
          {ai.loading ? <LoadingState label="Analysing your notes…" /> : ai.output ? (<><Markdown>{ai.output}</Markdown><ReviewNote /></>) : <EmptyOutput text="Your summary, decisions and action-item table will appear here." />}
        </Panel>
      </div>
    </div>
  );
}
