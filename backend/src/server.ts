import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRouter from "./routes/review";
import webhookRouter from "./routes/webhooks";
import historyRouter from "./routes/history";

dotenv.config();

const app = express();

app.use(cors());

// Capture raw body via verify callback so webhook HMAC verification always
// has the original bytes — compatible with both local dev and Vercel.
app.use(
  express.json({
    limit: "1mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/webhooks", webhookRouter);
app.use("/webhooks", webhookRouter);
app.use("/api/review", reviewRouter);
app.use("/review", reviewRouter);
app.use("/api/history", historyRouter);
app.use("/history", historyRouter);

export default app;
