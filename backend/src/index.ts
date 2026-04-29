import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRouter from "./routes/review";
import webhookRouter from "./routes/webhooks";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Webhook route must use raw body so we can verify the HMAC signature.
// Register it before express.json() parses the body.
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRouter
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/review", reviewRouter);
app.use("/review", reviewRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
