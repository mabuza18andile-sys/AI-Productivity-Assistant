import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, RefreshCw, Search, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyOutput, ErrorBox, FieldError, LoadingState, Markdown, PageHeader, Panel, ReviewNote } from "@/components/shared";
import { copyText, useAi } from "@/hooks/use-ai";
import { logActivity } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => pageMeta("AI Research Assistant", "Get structured overviews, insights and next steps on any topic."),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState("");
  const [audience, setAudience] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [err, setErr] = useState<string>();
  const ai = useAi("research");

  async function research() {
    if (topic.trim().length < 5) return setErr("Enter a topic or question (at least 5 characters).");
    setErr(undefined);
    const text = await ai.run(`Topic/question: ${topic}\nAudience: ${audience}\nLength: ${length}\nArticle supplied: ${article.trim() ? "yes" : "no"}${article.trim() ? `\n\nArticle text:\n${article}` : ""}`);
    if (text) { logActivity("research", topic); toast.success("Research summary ready"); }
  }

  return (
    <div>
      <PageHeader icon={Search} title="AI Research Assistant" description="Understand topics quickly. Based on the model's knowledge and any text you supply — no live web search." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rt">Topic or research question *</Label>
              <Input id="rt" className="mt-1.5" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Benefits and risks of a four-day work week" />
              <FieldError msg={err} />
            </div>
            <div>
              <Label htmlFor="ra">Article or report text (optional)</Label>
              <Textarea id="ra" className="mt-1.5 min-h-[180px]" value={article} onChange={(e) => setArticle(e.target.value)} placeholder="Paste text to analyse…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Beginner", "Student", "Professional"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Short", "Medium", "Detailed"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={research} disabled={ai.loading}><Wand2 /> Research</Button>
              <Button variant="outline" disabled={ai.loading} onClick={() => { setTopic(""); setArticle(""); ai.setOutput(""); ai.setError(null); }}><Trash2 /> Clear</Button>
            </div>
          </div>
        </Panel>
        <Panel className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Research summary</h2>
            {ai.output && !ai.loading && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(ai.output)}><Copy /> Copy</Button>
                <Button size="sm" variant="outline" onClick={research}><RefreshCw /> Regenerate</Button>
              </div>
            )}
          </div>
          {ai.error && <div className="mb-3"><ErrorBox message={ai.error} /></div>}
          {ai.loading ? <LoadingState label="Researching…" /> : ai.output ? (<><Markdown>{ai.output}</Markdown><ReviewNote /></>) : <EmptyOutput text="Overview, findings, insights, recommendations, limitations and next steps will appear here." />}
        </Panel>
      </div>
    </div>
  );
}
