import { useState } from "react";
import type { PRReviewResponse, ReviewStatus } from "../types";

export function usePRReview() {
  const [status, setStatus] = useState<ReviewStatus>("idle");
  const [result, setResult] = useState<PRReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitPRReview(prUrl: string, githubToken?: string) {
    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/review/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, githubToken }),
      });

      const text = await response.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server error (${response.status}): ${text.slice(0, 300) || "empty response"}`
        );
      }

      if (!response.ok) {
        throw new Error((data.error as string) || "Failed to review PR");
      }

      setResult(data as unknown as PRReviewResponse);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return { status, result, error, submitPRReview, reset };
}
