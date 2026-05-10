import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRouter from "./routes/review";
import webhookRouter from "./routes/webhooks";

dotenv.config();

const app = express();

app.use(cors());

// Webhook routes need raw body for HMAC signature verification —
// must be registered before express.json() parses the body.
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRouter
);
app.use(
  "/webhooks",
  express.raw({ type: "application/json" }),
  webhookRouter
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/review", reviewRouter);
app.use("/review", reviewRouter);

export default app;
