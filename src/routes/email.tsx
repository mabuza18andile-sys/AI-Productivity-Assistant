import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Mail, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyOutput, ErrorBox, FieldError, LoadingState, PageHeader, Panel, ReviewNote } from "@/components/shared";
import { copyText, useAi } from "@/hooks/use-ai";
import { logActivity } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => pageMeta("Smart Email Generator", "Generate clear, professional emails in the tone you need."),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive", "Professional"];
const TYPES = ["Business inquiry", "Follow-up", "Meeting request", "Apology", "Thank-you", "Complaint", "General"];
const INITIAL = { recipient: "", subject: "", purpose: "", context: "", tone: "Professional", type: "General" };

function EmailPage() {
  const [f, setF] = useState(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ai = useAi("email");
  const set = (k: keyof typeof INITIAL) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  async function generate() {
    const e: Record<string, string> = {};
    if (!f.recipient.trim()) e.recipient = "Please enter a recipient or audience.";
    if (f.purpose.trim().length < 10) e.purpose = "Describe the purpose in at least 10 characters.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const text = await ai.run(
      `Recipient/audience: ${f.recipient}\nSubject (optional): ${f.subject || "Not provided — suggest one"}\nPurpose: ${f.purpose}\nAdditional context: ${f.context || "None"}\nTone: ${f.tone}\nEmail type: ${f.type}`,
    );
    if (text) {
      logActivity("email", f.subject || f.purpose);
      toast.success("Email generated");
    }
  }

  return (
    <div>
      <PageHeader icon={Mail} title="Smart Email Generator" description="Describe what you need and get a polished draft you can edit." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rec">Recipient or audience *</Label>
              <Input id="rec" className="mt-1.5" placeholder="e.g. Procurement team at Acme Ltd" value={f.recipient} onChange={(e) => set("recipient")(e.target.value)} />
              <FieldError msg={errors.recipient} />
            </div>
            <div>
              <Label htmlFor="sub">Email subject</Label>
              <Input id="sub" className="mt-1.5" placeholder="Optional — AI will suggest one" value={f.subject} onChange={(e) => set("subject")(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pur">Purpose of the email *</Label>
              <Textarea id="pur" className="mt-1.5" rows={3} placeholder="e.g. Request a quote for 50 office chairs delivered by month end" value={f.purpose} onChange={(e) => set("purpose")(e.target.value)} />
              <FieldError msg={errors.purpose} />
            </div>
            <div>
              <Label htmlFor="ctx">Additional context</Label>
              <Textarea id="ctx" className="mt-1.5" rows={3} placeholder="Any details the email should include" value={f.context} onChange={(e) => set("context")(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Tone</Label>
                <Select value={f.tone} onValueChange={set("tone")}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Email type</Label>
                <Select value={f.type} onValueChange={set("type")}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={generate} disabled={ai.loading}><Wand2 /> Generate Email</Button>
              <Button variant="outline" onClick={() => { setF(INITIAL); setErrors({}); ai.setOutput(""); ai.setError(null); }} disabled={ai.loading}>
                <Trash2 /> Clear Form
              </Button>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Generated email</h2>
            {ai.output && !ai.loading && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(ai.output)}><Copy /> Copy</Button>
                <Button size="sm" variant="outline" onClick={generate}><RefreshCw /> Regenerate</Button>
              </div>
            )}
          </div>
          {ai.error && <div className="mb-3"><ErrorBox message={ai.error} /></div>}
          {ai.loading ? (
            <LoadingState label="Drafting your email…" />
          ) : ai.output ? (
            <>
              <Textarea aria-label="Generated email (editable)" className="min-h-[380px] font-sans text-sm leading-relaxed" value={ai.output} onChange={(e) => ai.setOutput(e.target.value)} />
              <ReviewNote />
            </>
          ) : (
            <EmptyOutput text="Your email will appear here. You can edit it before copying." />
          )}
        </Panel>
      </div>
    </div>
  );
}
