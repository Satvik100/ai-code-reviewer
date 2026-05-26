import { Router, Request, Response } from "express";
import {
  saveReview,
  getReviews,
  getReviewById,
  deleteReview,
  clearReviews,
  isSupabaseConfigured,
} from "../services/supabaseService";

const router = Router();

function userId(req: Request): string | undefined {
  return req.headers["x-user-id"] as string | undefined;
}

router.get("/status", (_req: Request, res: Response) => {
  res.json({ configured: isSupabaseConfigured() });
});

router.post("/share", async (req: Request, res: Response): Promise<void> => {
  const { type, title, data } = req.body as { type: "code" | "pr"; title: string; data: unknown };
  if (!type || !title || !data) { res.status(400).json({ error: "type, title, and data required" }); return; }
  const id = await saveReview({ userId: "shared", type, title, data });
  if (!id) { res.status(500).json({ error: "Failed to save" }); return; }
  res.json({ id });
});

router.get("/share/:id", async (req: Request, res: Response): Promise<void> => {
  const review = await getReviewById(String(req.params.id));
  if (!review) { res.status(404).json({ error: "not found" }); return; }
  res.json(review);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const uid = userId(req);
  if (!uid) { res.status(401).json({ error: "x-user-id required" }); return; }
  const reviews = await getReviews(uid);
  res.json({ reviews });
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const uid = userId(req);
  if (!uid) { res.status(401).json({ error: "x-user-id required" }); return; }
  const { type, title, data } = req.body as {
    type: "code" | "pr";
    title: string;
    data: unknown;
  };
  if (!type || !title || !data) {
    res.status(400).json({ error: "type, title, and data are required" });
    return;
  }
  const id = await saveReview({ userId: uid, type, title, data });
  res.json({ id });
});

router.delete("/all", async (req: Request, res: Response): Promise<void> => {
  const uid = userId(req);
  if (!uid) { res.status(401).json({ error: "x-user-id required" }); return; }
  const ok = await clearReviews(uid);
  res.json({ ok });
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const uid = userId(req);
  if (!uid) { res.status(401).json({ error: "x-user-id required" }); return; }
  const ok = await deleteReview(String(req.params.id), uid);
  res.json({ ok });
});

export default router;
