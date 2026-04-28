import { Router, Request, Response } from "express";
import { reviewCode } from "../services/claudeService";

const router = Router();

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

export default router;
