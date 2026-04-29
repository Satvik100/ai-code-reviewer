import {
  Clock,
  Code2,
  GitPullRequest,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import type { HistoryEntry } from "../types";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface Props {
  history: HistoryEntry[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryPanel({ history, onDelete, onClearAll }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Clock size={36} className="mb-3 opacity-20" />
        <p className="text-sm font-medium">No review history yet</p>
        <p className="text-xs mt-1 text-gray-600">
          Reviews you run will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {history.length} review{history.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onClearAll}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    entry.type === "pr" ? "bg-purple-900" : "bg-blue-900"
                  }`}
                >
                  {entry.type === "pr" ? (
                    <GitPullRequest size={14} className="text-purple-300" />
                  ) : (
                    <Code2 size={14} className="text-blue-300" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {entry.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timeAgo(entry.timestamp)}
                  </p>

                  {entry.type === "pr" && entry.prData && (
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {entry.prData.result.stats.criticalCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <ShieldAlert size={10} />
                          {entry.prData.result.stats.criticalCount} critical
                        </span>
                      )}
                      {entry.prData.result.stats.warningCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-400">
                          <AlertTriangle size={10} />
                          {entry.prData.result.stats.warningCount} warning
                          {entry.prData.result.stats.warningCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {entry.prData.result.stats.suggestionCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-blue-400">
                          <Lightbulb size={10} />
                          {entry.prData.result.stats.suggestionCount} suggestion
                          {entry.prData.result.stats.suggestionCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {entry.prData.metadata.changedFiles} file
                        {entry.prData.metadata.changedFiles !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {entry.type === "code" && entry.codeData && (
                    <span className="text-xs text-gray-500 mt-1 inline-block capitalize">
                      {entry.codeData.language}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDelete(entry.id)}
                className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
