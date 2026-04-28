import { useState } from "react";
import { Code2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { CodeEditor } from "./components/CodeEditor";
import { LanguageSelector } from "./components/LanguageSelector";
import { FocusAreaSelector } from "./components/FocusAreaSelector";
import { ReviewDisplay } from "./components/ReviewDisplay";
import { useCodeReview } from "./hooks/useCodeReview";

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const { status, result, error, submitReview, reset } = useCodeReview();

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

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Code2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Code Reviewer</h1>
            <p className="text-xs text-gray-400">Powered by Groq</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">Submit Code</h2>
                <p className="text-xs text-gray-400 mt-0.5">Paste your code to get an AI-powered review</p>
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
              disabled={isLoading || !code.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              {isLoading ? (
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
                disabled={isLoading}
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
              <p className="font-medium">Analyzing your code...</p>
              <p className="text-sm mt-1 text-gray-500">This may take a few seconds</p>
            </div>
          </div>
        )}

        {status === "success" && result && <ReviewDisplay result={result} />}
      </main>
    </div>
  );
}
