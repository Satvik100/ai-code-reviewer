import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { LanguageSelector } from "./LanguageSelector";
import { FocusAreaSelector } from "./FocusAreaSelector";
import { ReviewDisplay } from "./ReviewDisplay";
import { useCodeReview } from "../hooks/useCodeReview";
import type { ReviewResult } from "../types";

interface Props {
  onSuccess: (code: string, language: string, result: ReviewResult) => void;
}

export function CodeReviewPanel({ onSuccess }: Props) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const { status, result, streamingText, error, submitReview, reset } = useCodeReview();

  useEffect(() => {
    if (status === "success" && result) {
      onSuccess(code, language, result);
    }
  }, [status, result]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      submitReview({ code, language, focusAreas });
    }
  }

  function handleReset() {
    setCode("");
    setFocusAreas([]);
    reset();
  }

  const isBusy = status === "loading" || status === "streaming";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Submit Code</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Paste your code to get an AI-powered review
              </p>
            </div>
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>

          <CodeEditor code={code} language={language} onChange={setCode} />

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Focus Areas (optional)
            </label>
            <FocusAreaSelector selected={focusAreas} onChange={setFocusAreas} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isBusy || !code.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connecting...
              </>
            ) : status === "streaming" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Reviewing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Review Code
              </>
            )}
          </button>

          {(status !== "idle" || code) && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isBusy}
              className="px-5 py-2.5 rounded-lg font-medium text-sm border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {status === "error" && error && (
        <div className="flex items-start gap-3 bg-red-950 border border-red-800 rounded-xl p-4 text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Review failed</p>
            <p className="text-sm mt-0.5 opacity-80">{error}</p>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 flex flex-col items-center gap-4 text-gray-400">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <div className="text-center">
            <p className="font-medium">Connecting to AI...</p>
            <p className="text-sm mt-1 text-gray-500">Starting review</p>
          </div>
        </div>
      )}

      {status === "streaming" && streamingText && (
        <ReviewDisplay
          result={{ review: streamingText, model: "" }}
          isStreaming
        />
      )}

      {status === "success" && result && <ReviewDisplay result={result} />}
    </div>
  );
}
