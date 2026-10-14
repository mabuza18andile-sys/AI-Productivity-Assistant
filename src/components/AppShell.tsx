import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BrainCircuit,
  CalendarClock,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: FileText },
  { to: "/planner", label: "AI Task Planner", icon: CalendarClock },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "Workplace Chatbot", icon: MessageSquare },
] as const;

const SECONDARY = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & Responsible AI", icon: HelpCircle },
] as const;

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
        <BrainCircuit className="h-5 w-5" />
      </div>
      <span className="font-display text-lg font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        WorkSmart <span className="text-accent">AI</span>
      </span>
    </div>
  );
}

function NavList({ items }: { items: readonly { to: string; label: string; icon: typeof Mail }[] }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton asChild isActive={path === item.to} tooltip={item.label}>
            <Link to={item.to} onClick={() => setOpenMobile(false)}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavList items={NAV} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavList items={SECONDARY} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger aria-label="Toggle navigation" />
          <span className="font-display text-sm font-semibold text-muted-foreground">WorkSmart AI</span>
          <div className="ml-auto">
            <Link
              to="/settings"
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
        <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          <strong className="text-foreground">Responsible AI Notice:</strong> AI-generated content may contain errors,
          omissions, bias or outdated information. Review outputs before use and do not enter sensitive data.{" "}
          <Link to="/help" className="font-medium text-accent underline-offset-2 hover:underline">
            Learn more
          </Link>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
