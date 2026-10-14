import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, ShieldCheck } from "lucide-react";
import { PageHeader, Panel } from "@/components/shared";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/help")({
  head: () => pageMeta("Help & Responsible AI", "How to use WorkSmart AI responsibly, plus tips for each tool."),
  component: HelpPage,
});

const SAFEGUARDS = [
  "Every output carries a reminder to review and verify before use.",
  "Prompts forbid invented facts, names, dates, citations and statistics; missing details are marked \"Not specified\" or shown as [placeholders].",
  "No account or personal profile is required; only activity titles and planner tasks are kept in your browser.",
  "You can clear chat history and all saved data at any time.",
  "Error messages explain what to do without exposing technical details.",
  "Your content is treated as data, never as instructions that override safety rules.",
  "The assistant never claims to send emails, browse the web or add calendar events.",
];

const TIPS = [
  { to: "/email", t: "Smart Email Generator", d: "Give a clear purpose and any facts the email must contain. Placeholders like [Date] show what you still need to fill in." },
  { to: "/meetings", t: "Meeting Summarizer", d: "Paste notes as-is. Owners and deadlines are only listed when your notes mention them." },
  { to: "/planner", t: "AI Task Planner", d: "Add durations and deadlines for better plans. Tick tasks when done, then regenerate." },
  { to: "/research", t: "Research Assistant", d: "Paste an article to get points separated into article content vs. interpretation." },
  { to: "/chat", t: "Workplace Chatbot", d: "Ask follow-up questions — the assistant remembers the conversation for this session." },
] as const;

function HelpPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader icon={HelpCircle} title="Help & Responsible AI" description="Use AI as a helpful assistant — with human judgement in charge." />
      <Panel className="border-accent/40">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm leading-relaxed text-foreground">
            <strong>Responsible AI Notice:</strong> WorkSmart AI uses artificial intelligence to assist with workplace tasks.
            AI-generated content may contain errors, omissions, bias, or outdated information. Review and verify outputs before
            using them for important business decisions or sending communications. Do not enter passwords, confidential business
            information, personal identifiers, or sensitive data unless the system has been approved for that purpose.
            AI-generated content should support, not replace, human judgment.
          </p>
        </div>
      </Panel>
      <Panel>
        <h2 className="font-semibold text-foreground">Built-in safeguards</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {SAFEGUARDS.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </Panel>
      <Panel>
        <h2 className="font-semibold text-foreground">Getting the best results</h2>
        <div className="mt-3 space-y-3">
          {TIPS.map((x) => (
            <div key={x.to}>
              <Link to={x.to} className="text-sm font-semibold text-accent hover:underline">{x.t}</Link>
              <p className="text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
