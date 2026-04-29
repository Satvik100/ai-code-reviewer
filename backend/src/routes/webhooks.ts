import { Router, Request, Response } from "express";
import {
  verifyWebhookSignature,
  getInstallationToken,
  postPRReview,
  isConfigured,
} from "../services/githubAppService";
import { fetchPRData } from "../services/githubService";
import { reviewPR } from "../services/claudeService";

const router = Router();

// ─── Status ───────────────────────────────────────────────────────────────────

router.get("/status", (_req: Request, res: Response) => {
  res.json({ configured: isConfigured() });
});

// ─── GitHub Webhook ───────────────────────────────────────────────────────────

router.post("/github", async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const event = req.headers["x-github-event"] as string | undefined;

  if (!secret) {
    res.status(500).json({ error: "GITHUB_WEBHOOK_SECRET not set" });
    return;
  }

  if (!signature) {
    res.status(401).json({ error: "Missing x-hub-signature-256 header" });
    return;
  }

  if (!verifyWebhookSignature(req.body as Buffer, signature, secret)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  // Respond immediately — GitHub marks deliveries as failed after 10s
  res.status(200).json({ ok: true });

  if (event !== "pull_request") return;

  let payload: Record<string, any>;
  try {
    payload = JSON.parse((req.body as Buffer).toString());
  } catch {
    console.error("[webhook] Failed to parse payload");
    return;
  }

  const { action, installation, repository, pull_request } = payload;

  if (!["opened", "synchronize", "reopened"].includes(action as string)) return;

  const fullName = repository?.full_name as string;
  const [owner, repo] = fullName?.split("/") ?? [];
  const prNumber = pull_request?.number as number;
  const installationId = installation?.id as number;

  if (!owner || !repo || !prNumber || !installationId) {
    console.error("[webhook] Missing required fields in payload");
    return;
  }

  processReview(owner, repo, prNumber, installationId).catch((err) =>
    console.error(`[webhook] Review failed for ${owner}/${repo}#${prNumber}:`, err)
  );
});

// ─── Background Review ────────────────────────────────────────────────────────

async function processReview(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number
): Promise<void> {
  console.log(`[bot] Starting review for ${owner}/${repo}#${prNumber}`);

  const token = await getInstallationToken(installationId);
  const prData = await fetchPRData(owner, repo, String(prNumber), token);
  const result = await reviewPR(prData);
  await postPRReview(owner, repo, prNumber, token, result);

  console.log(`[bot] Review posted for ${owner}/${repo}#${prNumber}`);
}

export default router;
