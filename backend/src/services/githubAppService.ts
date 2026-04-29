import crypto from "crypto";
import type { PRReviewResult } from "./claudeService";

// ─── JWT ──────────────────────────────────────────────────────────────────────

function base64url(data: string | Buffer): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function createAppJWT(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 600, iss: appId })
  );
  const data = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(data);
  const sig = sign
    .sign(privateKey, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `${data}.${sig}`;
}

// ─── Installation Token ───────────────────────────────────────────────────────

export async function getInstallationToken(
  installationId: number
): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !privateKey)
    throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY must be set");

  const jwt = createAppJWT(appId, privateKey);

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AI-Code-Reviewer/1.0",
      },
    }
  );

  if (!res.ok) throw new Error(`Failed to get installation token: ${res.status}`);
  const data = (await res.json()) as { token: string };
  return data.token;
}

// ─── Webhook Verification ─────────────────────────────────────────────────────

export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

// ─── Format Review as Markdown ────────────────────────────────────────────────

function formatReview(result: PRReviewResult): string {
  const { criticalCount, warningCount, suggestionCount } = result.stats;
  const total = criticalCount + warningCount + suggestionCount;

  const statsTable =
    `| 🔴 Critical | ⚠️ Warning | 💡 Suggestion |\n` +
    `|---|---|---|\n` +
    `| ${criticalCount} | ${warningCount} | ${suggestionCount} |`;

  const fileSection = result.files
    .map((file) => {
      const issueCount = file.comments.length;
      const heading =
        issueCount === 0
          ? `<summary><strong>${file.filename}</strong> — ✅ No issues</summary>`
          : `<summary><strong>${file.filename}</strong> — ${issueCount} issue${issueCount !== 1 ? "s" : ""}</summary>`;

      const comments = file.comments
        .map((c) => {
          const icon =
            c.severity === "critical"
              ? "🔴"
              : c.severity === "warning"
              ? "⚠️"
              : c.severity === "praise"
              ? "✅"
              : "💡";
          const cap = c.severity.charAt(0).toUpperCase() + c.severity.slice(1);
          const line = c.line ? ` · Line ${c.line}` : "";
          const fix = c.suggestion ? `\n> 💡 **Fix:** ${c.suggestion}` : "";
          return `${icon} **${cap}**${line}\n${c.message}${fix}`;
        })
        .join("\n\n");

      const body =
        issueCount === 0
          ? `*${file.summary}*`
          : `*${file.summary}*\n\n${comments}`;

      return `<details>\n${heading}\n\n${body}\n\n</details>`;
    })
    .join("\n\n");

  return [
    `## 🤖 AI Code Review`,
    ``,
    result.overall,
    ``,
    `---`,
    ``,
    `### 📊 ${total} issue${total !== 1 ? "s" : ""} found`,
    ``,
    statsTable,
    ``,
    `---`,
    ``,
    `### 📁 File Reviews`,
    ``,
    fileSection,
    ``,
    `---`,
    `*Powered by [AI Code Reviewer](https://github.com) · Llama 3.3 70B*`,
  ].join("\n");
}

// ─── Post Review ──────────────────────────────────────────────────────────────

export async function postPRReview(
  owner: string,
  repo: string,
  prNumber: number,
  token: string,
  result: PRReviewResult
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "AI-Code-Reviewer/1.0",
      },
      body: JSON.stringify({ body: formatReview(result), event: "COMMENT" }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to post review: ${res.status} ${text}`);
  }
}

// ─── Config Check ─────────────────────────────────────────────────────────────

export function isConfigured(): boolean {
  return !!(
    process.env.GITHUB_APP_ID &&
    process.env.GITHUB_APP_PRIVATE_KEY &&
    process.env.GITHUB_WEBHOOK_SECRET
  );
}
