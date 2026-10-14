import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, Copy, Pencil, Plus, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyOutput, ErrorBox, FieldError, LoadingState, Markdown, PageHeader, Panel, ReviewNote } from "@/components/shared";
import { copyText, useAi } from "@/hooks/use-ai";
import { logActivity } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => pageMeta("AI Task Planner", "Prioritise tasks and generate a realistic daily or weekly schedule."),
  component: PlannerPage,
});

type Task = {
  id: string; name: string; description: string; deadline: string; duration: string;
  priority: "High" | "Medium" | "Low"; important: boolean; urgent: boolean; done: boolean;
};
const BLANK: Omit<Task, "id" | "done"> = { name: "", description: "", deadline: "", duration: "60", priority: "Medium", important: false, urgent: false };
const KEY = "worksmart.tasks.v1";

function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState(BLANK);
  const [editId, setEditId] = useState<string | null>(null);
  const [mode, setMode] = useState<"Daily" | "Weekly">("Daily");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [err, setErr] = useState<string>();
  const ai = useAi("planner");

  useEffect(() => {
    try { setTasks(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
  }, []);
  const save = (t: Task[]) => { setTasks(t); localStorage.setItem(KEY, JSON.stringify(t)); };

  function submitTask() {
    if (!draft.name.trim()) return setErr("Task name is required.");
    if (!Number(draft.duration) || Number(draft.duration) <= 0) return setErr("Enter a duration in minutes.");
    setErr(undefined);
    if (editId) save(tasks.map((t) => (t.id === editId ? { ...t, ...draft } : t)));
    else save([...tasks, { ...draft, id: crypto.randomUUID(), done: false }]);
    setDraft(BLANK); setEditId(null);
  }

  const today = new Date().toISOString().slice(0, 10);
  const open = tasks.filter((t) => !t.done);

  async function generate() {
    if (!open.length) return toast.error("Add at least one open task first.");
    if (start >= end) return toast.error("Working hours end must be after start.");
    const list = open.map((t, i) =>
      `${i + 1}. ${t.name} | description: ${t.description || "none"} | deadline: ${t.deadline || "Not specified"} | duration: ${t.duration} min | priority: ${t.priority} | important: ${t.important ? "yes" : "no"} | urgent: ${t.urgent ? "yes" : "no"}`).join("\n");
    const text = await ai.run(`Today's date: ${today}\nPlanning mode: ${mode}\nAvailable working hours: ${start}–${end}${mode === "Weekly" ? " (Monday–Friday)" : ""}\n\nTasks:\n${list}`);
    if (text) { logActivity("planner", `${mode} plan · ${open.length} tasks`); toast.success("Schedule generated"); }
  }

  const status = (t: Task) => {
    if (!t.deadline || t.done) return null;
    if (t.deadline < today) return <Badge variant="destructive">Overdue</Badge>;
    const days = (new Date(t.deadline).getTime() - new Date(today).getTime()) / 864e5;
    return days <= 2 ? <Badge className="bg-warning text-foreground">Due soon</Badge> : null;
  };

  return (
    <div>
      <PageHeader icon={CalendarClock} title="AI Task Planner" description="Add your tasks, set your hours and let AI build a prioritised schedule." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Panel>
            <h2 className="mb-4 font-semibold text-foreground">{editId ? "Edit task" : "Add a task"}</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="tn">Task name *</Label>
                <Input id="tn" className="mt-1.5" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Prepare board report" />
              </div>
              <div>
                <Label htmlFor="td">Description</Label>
                <Textarea id="td" rows={2} className="mt-1.5" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="tdl">Deadline</Label><Input id="tdl" type="date" className="mt-1.5" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} /></div>
                <div><Label htmlFor="tdu">Duration (min)</Label><Input id="tdu" type="number" min={5} step={5} className="mt-1.5" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} /></div>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v as Task["priority"] })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{["High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-5 pt-1 text-sm">
                <label className="flex items-center gap-2"><Checkbox checked={draft.important} onCheckedChange={(c) => setDraft({ ...draft, important: !!c })} /> Important</label>
                <label className="flex items-center gap-2"><Checkbox checked={draft.urgent} onCheckedChange={(c) => setDraft({ ...draft, urgent: !!c })} /> Urgent</label>
              </div>
              <FieldError msg={err} />
              <div className="flex gap-2 pt-1">
                <Button onClick={submitTask} variant="secondary"><Plus /> {editId ? "Save changes" : "Add task"}</Button>
                {editId && <Button variant="ghost" onClick={() => { setEditId(null); setDraft(BLANK); }}>Cancel</Button>}
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-3 font-semibold text-foreground">Your tasks ({open.length} open)</h2>
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks yet. Add one above to get started.</p> : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <Checkbox className="mt-0.5" checked={t.done} aria-label={`Mark ${t.name} complete`} onCheckedChange={(c) => save(tasks.map((x) => (x.id === t.id ? { ...x, done: !!c } : x)))} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant="outline">{t.priority}</Badge>
                        <span>{t.duration} min</span>
                        {t.deadline && <span>· due {t.deadline}</span>}
                        {t.important && <span>· important</span>}
                        {t.urgent && <span>· urgent</span>}
                        {status(t)}
                      </div>
                    </div>
                    <button aria-label="Edit task" className="text-muted-foreground hover:text-foreground" onClick={() => { setEditId(t.id); setDraft(t); }}><Pencil className="h-4 w-4" /></button>
                    <button aria-label="Delete task" className="text-muted-foreground hover:text-destructive" onClick={() => save(tasks.filter((x) => x.id !== t.id))}><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel className="lg:col-span-3">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Planning mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "Daily" | "Weekly")}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="ws">Start</Label><Input id="ws" type="time" className="mt-1.5" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><Label htmlFor="we">End</Label><Input id="we" type="time" className="mt-1.5" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={generate} disabled={ai.loading}><Wand2 /> Generate My Schedule</Button>
            {ai.output && !ai.loading && <>
              <Button variant="outline" onClick={generate}><RefreshCw /> Regenerate</Button>
              <Button variant="outline" onClick={() => copyText(ai.output)}><Copy /> Copy</Button>
            </>}
          </div>
          {ai.error && <div className="mb-3"><ErrorBox message={ai.error} /></div>}
          {ai.loading ? <LoadingState label="Building your schedule…" /> : ai.output ? (<><Markdown>{ai.output}</Markdown><ReviewNote /><p className="mt-1 text-xs text-muted-foreground">This plan is not added to any calendar.</p></>) : <EmptyOutput text="Your prioritised schedule will appear here." />}
        </Panel>
      </div>
    </div>
  );
}
