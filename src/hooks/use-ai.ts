import { useState } from "react";
import { toast } from "sonner";
import { runAi, type AiTool } from "@/lib/ai.functions";

export function useAi(tool: AiTool) {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(input: string, history?: { role: "user" | "assistant"; content: string }[]) {
    setLoading(true);
    setError(null);
    try {
      const res = await runAi({ data: { tool, input, history } });
      if ("error" in res) {
        setError(res.error);
        toast.error(res.error);
        return null;
      }
      setOutput(res.text);
      return res.text;
    } catch {
      const msg = "Could not reach the AI service. Check your connection and try again.";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { run, loading, output, setOutput, error, setError };
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Copy failed — please select and copy manually.");
  }
}
