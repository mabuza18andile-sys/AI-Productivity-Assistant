import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarClock, Clock, FileText, Mail, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/shared";
import { NAV } from "@/components/AppShell";
import { useActivity, type ActivityType } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Dashboard", "Your WorkSmart AI dashboard: five AI productivity tools and your recent activity."),
  component: Dashboard,
});

const TOOLS = [
  { to: "/email", title: "Smart Email Generator", desc: "Draft polished emails in any tone.", icon: Mail },
  { to: "/meetings", title: "Meeting Summarizer", desc: "Turn notes into decisions and actions.", icon: FileText },
  { to: "/planner", title: "AI Task Planner", desc: "Build a realistic daily or weekly plan.", icon: CalendarClock },
  { to: "/research", title: "Research Assistant", desc: "Understand any topic quickly.", icon: Search },
  { to: "/chat", title: "Workplace Chatbot", desc: "Ask WorkSmart Assistant anything.", icon: MessageSquare },
] as const;

const TYPE_META: Record<ActivityType, { label: string; icon: typeof Mail }> = {
  email: { label: "Email", icon: Mail },
  meeting: { label: "Meeting", icon: FileText },
  planner: { label: "Plan", icon: CalendarClock },
  research: { label: "Research", icon: Search },
  chat: { label: "Chat", icon: MessageSquare },
};

function Dashboard() {
  const activity = useActivity();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const count = (t: ActivityType) => activity.filter((a) => a.type === t).length;
  const matches = q.trim() ? NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase())) : [];

  const stats = [
    { label: "Emails Generated", value: count("email"), icon: Mail },
    { label: "Meetings Summarized", value: count("meeting"), icon: FileText },
    { label: "Tasks Planned", value: count("planner"), icon: CalendarClock },
    { label: "Research Sessions", value: count("research"), icon: Search },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-card sm:p-10">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Welcome to WorkSmart AI.</h1>
        <p className="mt-2 max-w-xl text-primary-foreground/80">Work smarter, save time, and stay organized with AI.</p>
        <form
          className="relative mt-6 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (matches[0]) navigate({ to: matches[0].to });
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a tool… (e.g. email, planner)"
            className="h-11 border-0 bg-card pl-9 text-foreground"
            aria-label="Quick search tools"
          />
          {matches.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-card">
              {matches.map((m) => (
                <Link key={m.to} to={m.to} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary">
                  <m.icon className="h-4 w-4 text-accent" /> {m.label}
                </Link>
              ))}
            </div>
          )}
        </form>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label} className="!p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-foreground">{s.value}</p>
          </Panel>
        ))}
      </section>
      <p className="-mt-5 text-xs text-muted-foreground">Counts reflect activity saved in this browser.</p>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Recent Activity</h2>
        <Panel>
          {activity.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-3 font-semibold text-foreground">No activity yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Try drafting your first email — it takes less than a minute.</p>
              <Link to="/email" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Write an email
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {activity.slice(0, 8).map((a) => {
                const M = TYPE_META[a.type];
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <M.icon className="h-4 w-4 shrink-0 text-accent" />
                    <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">{M.label}</span>
                    <span className="flex-1 truncate text-sm text-foreground">{a.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}
