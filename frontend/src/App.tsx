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
import {
  saveCloudReview,
  getCloudHistory,
  deleteCloudReview,
  clearCloudHistory,
  getSharedReview,
} from "./utils/cloudStorage";
import type {
  HistoryEntry,
  ReviewResult,
  PRMetadata,
  PRReviewResult,
} from "./types";

type Tab = "code" | "pr" | "history" | "bot";

interface Props {
  authSlot?: React.ReactNode;
  signInSlot?: React.ReactNode;
  userId?: string | null;
  isSignedIn?: boolean;
}

export default function App({ authSlot, signInSlot, userId = null, isSignedIn = false }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(
    () => (localStorage.getItem("activeTab") as Tab) ?? "code"
  );

  const [preloadedEntry, setPreloadedEntry] = useState<HistoryEntry | null>(null);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  }

  function handleLoadEntry(entry: HistoryEntry) {
    setPreloadedEntry(entry);
    handleTabChange(entry.type === "code" ? "code" : "pr");
  }

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    if (shareId) {
      getSharedReview(shareId).then((entry) => {
        if (entry) {
          handleLoadEntry(entry);
          window.history.replaceState({}, "", window.location.pathname);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && userId) {
      getCloudHistory(userId).then((entries) => {
        setHistory(entries.length > 0 ? entries : getHistory());
      });
    } else {
      setHistory(getHistory());
    }
  }, [isSignedIn, userId]);

  async function handleCodeSuccess(
    code: string,
    language: string,
    result: ReviewResult
  ) {
    const entryBase = {
      type: "code" as const,
      title: `${language.charAt(0).toUpperCase() + language.slice(1)} review`,
      codeData: { code, language, result },
    };

    if (isSignedIn && userId) {
      const cloudId = await saveCloudReview(userId, entryBase);
      if (cloudId) {
        setHistory((prev) => [
          { ...entryBase, id: cloudId, timestamp: Date.now() },
          ...prev,
        ]);
        return;
      }
    }
    const entry = addToHistory(entryBase);
    setHistory((prev) => [entry, ...prev]);
  }

  async function handlePRSuccess(
    prUrl: string,
    metadata: PRMetadata,
    result: PRReviewResult
  ) {
    const title = `PR #${metadata.number}: ${
      metadata.title.length > 50
        ? metadata.title.slice(0, 50) + "…"
        : metadata.title
    }`;
    const entryBase = {
      type: "pr" as const,
      title,
      prData: { prUrl, metadata, result },
    };

    if (isSignedIn && userId) {
      const cloudId = await saveCloudReview(userId, entryBase);
      if (cloudId) {
        setHistory((prev) => [
          { ...entryBase, id: cloudId, timestamp: Date.now() },
          ...prev,
        ]);
        return;
      }
    }
    const entry = addToHistory(entryBase);
    setHistory((prev) => [entry, ...prev]);
  }

  async function handleDeleteHistory(id: string) {
    if (isSignedIn && userId) {
      await deleteCloudReview(userId, id);
    } else {
      removeFromHistory(id);
    }
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleClearHistory() {
    if (isSignedIn && userId) {
      await clearCloudHistory(userId);
    } else {
      clearHistory();
    }
    setHistory([]);
  }

  const tabs: { id: Tab; label: string; Icon: React.ElementType; badge?: number }[] = [
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
          <div className="flex items-center justify-between pt-4 pb-3">
            <div className="flex items-center gap-3">
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
            {authSlot}
          </div>

          <div className="flex gap-1">
            {tabs.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
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
          <CodeReviewPanel
            onSuccess={handleCodeSuccess}
            preloaded={preloadedEntry?.type === "code" ? preloadedEntry : null}
          />
        )}
        {activeTab === "pr" && (
          <PRReviewPanel
            onSuccess={handlePRSuccess}
            preloaded={preloadedEntry?.type === "pr" ? preloadedEntry : null}
          />
        )}
        {activeTab === "history" && (
          <HistoryPanel
            history={history}
            isCloud={!!(isSignedIn && userId)}
            signInSlot={signInSlot}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearHistory}
            onLoad={handleLoadEntry}
          />
        )}
        {activeTab === "bot" && <BotSetupPanel />}
      </main>
    </div>
  );
}
