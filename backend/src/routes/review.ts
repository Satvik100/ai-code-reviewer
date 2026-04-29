import { Router, Request, Response } from "express";
import { reviewCode, reviewCodeStream, reviewPR } from "../services/claudeService";
import { parsePRUrl, fetchPRData } from "../services/githubService";

const router = Router();

// ─── Code Review ─────────────────────────────────────────────────────────────

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { code, language, focusAreas } = req.body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "code is required and must be a non-empty string" });
    return;
  }

  if (!language || typeof language !== "string") {
    res.status(400).json({ error: "language is required" });
    return;
  }

  if (code.length > 50000) {
    res.status(400).json({ error: "Code exceeds maximum length of 50,000 characters" });
    return;
  }

  try {
    const result = await reviewCode({ code, language, focusAreas });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Failed to review code: ${message}` });
  }
});

// ─── Streaming Code Review ───────────────────────────────────────────────────

router.post("/stream", async (req: Request, res: Response): Promise<void> => {
  const { code, language, focusAreas } = req.body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "code is required and must be a non-empty string" });
    return;
  }

  if (!language || typeof language !== "string") {
    res.status(400).json({ error: "language is required" });
    return;
  }

  if (code.length > 50000) {
    res.status(400).json({ error: "Code exceeds maximum length of 50,000 characters" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const { model } = await reviewCodeStream(
      { code, language, focusAreas },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );
    res.write(`data: ${JSON.stringify({ done: true, model })}\n\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
  } finally {
    res.end();
  }
});

// ─── PR Review ────────────────────────────────────────────────────────────────

router.post("/pr", async (req: Request, res: Response): Promise<void> => {
  const { prUrl, githubToken } = req.body;

  if (!prUrl || typeof prUrl !== "string") {
    res.status(400).json({ error: "prUrl is required" });
    return;
  }

  const parsed = parsePRUrl(prUrl);
  if (!parsed) {
    res
      .status(400)
      .json({ error: "Invalid GitHub PR URL. Expected format: https://github.com/owner/repo/pull/123" });
    return;
  }

  try {
    const prData = await fetchPRData(
      parsed.owner,
      parsed.repo,
      parsed.number,
      typeof githubToken === "string" && githubToken ? githubToken : undefined
    );
    const result = await reviewPR(prData);
    res.json({ metadata: prData.metadata, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
