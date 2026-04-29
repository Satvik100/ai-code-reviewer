import { useState, useEffect } from "react";
import {
  GitPullRequest,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Lock,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  FileCode,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { usePRReview } from "../hooks/usePRReview";
import type { PRMetadata, PRReviewResult, PRReviewComment } from "../types";

interface Props {
  onSuccess: (prUrl: string, metadata: PRMetadata, result: PRReviewResult) => void;
}

type Severity = PRReviewComment["severity"];

const SEVERITY_CONFIG: Record<
  Severity,
  {
    Icon: React.ElementType;
    label: string;
    containerClass: string;
    iconClass: string;
    labelClass: string;
  }
> = {
  critical: {
    Icon: ShieldAlert,
    label: "Critical",
    containerClass: "bg-red-950/50 border-red-800",
    iconClass: "text-red-400",
    labelClass: "text-red-400",
  },
  warning: {
    Icon: AlertTriangle,
    label: "Warning",
    containerClass: "bg-amber-950/50 border-amber-800",
    iconClass: "text-amber-400",
    labelClass: "text-amber-400",
  },
  suggestion: {
    Icon: Lightbulb,
    label: "Suggestion",
    containerClass: "bg-blue-950/50 border-blue-800",
    iconClass: "text-blue-400",
    labelClass: "text-blue-400",
  },
  praise: {
    Icon: ThumbsUp,
    label: "Praise",
    containerClass: "bg-green-950/50 border-green-800",
    iconClass: "text-green-400",
    labelClass: "text-green-400",
  },
};

export function PRReviewPanel({ onSuccess }: Props) {
  const [prUrl, setPrUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const { status, result, error, submitPRReview, reset } = usePRReview();

  useEffect(() => {
    if (status === "success" && result) {
      onSuccess(prUrl, result.metadata, result.result);
    }
  }, [status, result]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (prUrl.trim()) {
      submitPRReview(prUrl.trim(), githubToken.trim() || undefined);
    }
  }

  function handleReset() {
    setPrUrl("");
    setGithubToken("");
    setExpandedFiles(new Set());
    reset();
  }

  function toggleFile(filename: string) {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  }

  function expandAll() {
    if (result) {
      setExpandedFiles(new Set(result.result.files.map((f) => f.filename)));
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Review GitHub PR</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Paste a GitHub pull request URL to get a file-by-file AI review
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Pull Request URL
            </label>
            <div className="relative">
              <GitPullRequest
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                disabled={isLoading}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Lock size={12} />
              {showToken ? "Hide token" : "Add GitHub token"} (required for private repos)
              <ChevronDown
                size={12}
                className={`transition-transform ${showToken ? "rotate-180" : ""}`}
              />
            </button>
            {showToken && (
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                disabled={isLoading}
                className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !prUrl.trim()}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing PR...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Review PR
              </>
            )}
          </button>

          {(status !== "idle" || prUrl) && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg font-medium text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Error */}
      {status === "error" && error && (
        <div className="flex items-start gap-3 bg-red-950 border border-red-800 rounded-xl p-4 text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Review failed</p>
            <p className="text-sm mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 flex flex-col items-center gap-4 text-gray-400">
          <Loader2 size={32} className="animate-spin text-purple-500" />
          <div className="text-center">
            <p className="font-medium">Fetching PR &amp; analyzing code...</p>
            <p className="text-sm mt-1 text-gray-500">This may take 10–20 seconds</p>
          </div>
        </div>
      )}

      {/* Results */}
      {status === "success" && result && (
        <div className="space-y-4">
          {/* PR Header */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    #{result.metadata.number}
                  </span>
                  <span className="text-xs text-gray-500 font-mono truncate">
                    {result.metadata.repo}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white leading-snug">
                  {result.metadata.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">by {result.metadata.author}</p>
              </div>
              <a
                href={result.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 shrink-0"
              >
                Open <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-1.5">
                <Plus size={14} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  {result.metadata.additions}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Minus size={14} className="text-red-400" />
                <span className="text-sm text-red-400 font-medium">
                  {result.metadata.deletions}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {result.metadata.changedFiles} files changed
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Critical",
                count: result.result.stats.criticalCount,
                color: "text-red-400",
                bg: "bg-red-950/40 border-red-900",
              },
              {
                label: "Warnings",
                count: result.result.stats.warningCount,
                color: "text-amber-400",
                bg: "bg-amber-950/40 border-amber-900",
              },
              {
                label: "Suggestions",
                count: result.result.stats.suggestionCount,
                color: "text-blue-400",
                bg: "bg-blue-950/40 border-blue-900",
              },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg border p-3 text-center ${s.bg}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Overall Summary */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <h4 className="text-sm font-semibold text-white mb-2">Overall Summary</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{result.result.overall}</p>
          </div>

          {/* File Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">File Reviews</h4>
              <button
                onClick={expandAll}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Expand all
              </button>
            </div>

            <div className="space-y-2">
              {result.result.files.map((file) => {
                const isExpanded = expandedFiles.has(file.filename);
                const criticals = file.comments.filter(
                  (c) => c.severity === "critical"
                ).length;

                return (
                  <div
                    key={file.filename}
                    className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFile(file.filename)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                      )}
                      <FileCode size={16} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-200 font-mono flex-1 truncate">
                        {file.filename}
                      </span>
                      {criticals > 0 && (
                        <span className="shrink-0 text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">
                          {criticals} critical
                        </span>
                      )}
                      <span className="shrink-0 text-xs text-gray-500">
                        {file.comments.length} issue{file.comments.length !== 1 ? "s" : ""}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-800 p-4 space-y-3">
                        {file.summary && (
                          <p className="text-sm text-gray-400 italic">{file.summary}</p>
                        )}
                        {file.comments.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No issues found in this file.
                          </p>
                        ) : (
                          file.comments.map((comment, i) => {
                            const cfg =
                              SEVERITY_CONFIG[comment.severity] ??
                              SEVERITY_CONFIG.suggestion;
                            const Icon = cfg.Icon;
                            return (
                              <div
                                key={i}
                                className={`rounded-lg border p-3 space-y-1.5 ${cfg.containerClass}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon size={14} className={cfg.iconClass} />
                                  <span
                                    className={`text-xs font-medium uppercase tracking-wide ${cfg.labelClass}`}
                                  >
                                    {cfg.label}
                                  </span>
                                  {comment.line && (
                                    <span className="text-xs text-gray-500">
                                      Line {comment.line}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-300">{comment.message}</p>
                                {comment.suggestion && (
                                  <p className="text-xs text-gray-400 pl-2 border-l border-gray-600">
                                    Fix: {comment.suggestion}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
