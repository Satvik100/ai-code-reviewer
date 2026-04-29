import { useState, useEffect } from "react";
import { Code2, GitPullRequest, Clock, Bot } from "lucide-react";
import { CodeReviewPanel } from "./components/CodeReviewPanel";
import { PRReviewPanel } from "./components/PRReviewPanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { BotSetupPanel } from "./components/BotSetupPanel";
import {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
} from "./utils/storage";
import type {
  HistoryEntry,
  ReviewResult,
  PRMetadata,
  PRReviewResult,
} from "./types";

type Tab = "code" | "pr" | "history" | "bot";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("code");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleCodeSuccess(
    code: string,
    language: string,
    result: ReviewResult
  ) {
    const entry = addToHistory({
      type: "code",
      title: `${language.charAt(0).toUpperCase() + language.slice(1)} review`,
      codeData: { code, language, result },
    });
    setHistory((prev) => [entry, ...prev]);
  }

  function handlePRSuccess(
    prUrl: string,
    metadata: PRMetadata,
    result: PRReviewResult
  ) {
    const title = `PR #${metadata.number}: ${
      metadata.title.length > 50
        ? metadata.title.slice(0, 50) + "…"
        : metadata.title
    }`;
    const entry = addToHistory({
      type: "pr",
      title,
      prData: { prUrl, metadata, result },
    });
    setHistory((prev) => [entry, ...prev]);
  }

  function handleDeleteHistory(id: string) {
    removeFromHistory(id);
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  const tabs: {
    id: Tab;
    label: string;
    Icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: "code", label: "Code Review", Icon: Code2 },
    { id: "pr", label: "PR Review", Icon: GitPullRequest },
    {
      id: "history",
      label: "History",
      Icon: Clock,
      badge: history.length > 0 ? history.length : undefined,
    },
    { id: "bot", label: "GitHub Bot", Icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Logo row */}
          <div className="flex items-center gap-3 pt-4 pb-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Code2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                AI Code Reviewer
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Powered by Groq + Llama 3.3 70B
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1">
            {tabs.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-blue-500 text-white bg-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/40"
                }`}
              >
                <Icon size={15} />
                {label}
                {badge !== undefined && (
                  <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === "code" && (
          <CodeReviewPanel onSuccess={handleCodeSuccess} />
        )}
        {activeTab === "pr" && (
          <PRReviewPanel onSuccess={handlePRSuccess} />
        )}
        {activeTab === "history" && (
          <HistoryPanel
            history={history}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearHistory}
          />
        )}
        {activeTab === "bot" && <BotSetupPanel />}
      </main>
    </div>
  );
}
