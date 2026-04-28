import { useState } from "react";
import type { ReviewResult, ReviewRequest, ReviewStatus } from "../types";

export function useCodeReview() {
  const [status, setStatus] = useState<ReviewStatus>("idle");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitReview(request: ReviewRequest) {
    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get review");
      }

      setResult(data as ReviewResult);
      setStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return { status, result, error, submitReview, reset };
}
