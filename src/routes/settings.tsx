import { createFileRoute } from "@tanstack/react-router";
import { Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, Panel } from "@/components/shared";
import { clearActivity, useActivity } from "@/lib/activity";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/settings")({
  head: () => pageMeta("Settings", "Manage your WorkSmart AI data and privacy preferences."),
  component: SettingsPage,
});

function SettingsPage() {
  const activity = useActivity();
  return (
    <div className="max-w-3xl">
      <PageHeader icon={Settings} title="Settings" description="Manage what WorkSmart AI keeps on this device." />
      <div className="space-y-6">
        <Panel>
          <h2 className="font-semibold text-foreground">Data & privacy</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No account is needed. WorkSmart AI stores only activity titles (for dashboard counts) and your planner tasks in this
            browser. Full AI outputs and chat conversations are not saved. Your input is sent to the AI model only when you
            press a generate button.
          </p>
          <p className="mt-3 text-sm text-foreground">Saved activity entries: <strong>{activity.length}</strong></p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4"><Trash2 /> Clear all saved data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all saved data?</AlertDialogTitle>
                <AlertDialogDescription>This removes your activity history, dashboard counts and planner tasks from this browser.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { clearActivity(); localStorage.removeItem("worksmart.tasks.v1"); toast.success("All saved data cleared"); }}>
                  Clear data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Panel>
        <Panel>
          <h2 className="font-semibold text-foreground">AI configuration</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI features run through Lovable AI on a secure server. The access key is stored as a server secret and is never sent to your browser.
          </p>
        </Panel>
      </div>
    </div>
  );
}
