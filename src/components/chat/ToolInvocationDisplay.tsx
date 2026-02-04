import { Loader2 } from "lucide-react";
import { formatToolDisplay } from "@/lib/utils/tool-display";

interface ToolInvocationDisplayProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

export function ToolInvocationDisplay({
  toolName,
  args,
  state,
}: ToolInvocationDisplayProps) {
  const displayText = formatToolDisplay(toolName, args);
  const isCompleted = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{displayText}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayText}</span>
        </>
      )}
    </div>
  );
}
