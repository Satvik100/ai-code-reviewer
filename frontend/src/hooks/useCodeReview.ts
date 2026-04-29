import { useState } from "react";
import type { ReviewResult, ReviewRequest, ReviewStatus } from "../types";

export function useCodeReview() {
  const [status, setStatus] = useState<ReviewStatus>("idle");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submitReview(request: ReviewRequest) {
    setStatus("loading");
    setError(null);
    setResult(null);
    setStreamingText("");

    try {
      const response = await fetch("/api/review/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? "Failed to get review");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let model = "llama-3.3-70b-versatile";

      setStatus("streaming");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const dataLine = event.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          const jsonStr = dataLine.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr) as {
              chunk?: string;
              done?: boolean;
              model?: string;
              error?: string;
            };

            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) {
              accumulated += parsed.chunk;
              setStreamingText(accumulated);
            }
            if (parsed.model) model = parsed.model;
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== jsonStr) {
              throw parseErr;
            }
          }
        }
      }

      setResult({ review: accumulated, model });
      setStreamingText("");
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setStreamingText("");
    setError(null);
  }

  return { status, result, streamingText, error, submitReview, reset };
}
