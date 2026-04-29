import Groq from "groq-sdk";
import type { PRFile, PRMetadata } from "./githubService";

function getClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey: key });
}

// ─── Code Review ────────────────────────────────────────────────────────────

export interface ReviewRequest {
  code: string;
  language: string;
  focusAreas?: string[];
}

export interface ReviewResponse {
  review: string;
  model: string;
}

const CODE_SYSTEM_PROMPT = `You are an expert code reviewer with deep knowledge across multiple programming languages and best practices. Your reviews are thorough, constructive, and educational.

When reviewing code, analyze the following aspects (as applicable):
1. **Code Quality**: Readability, naming conventions, code structure
2. **Bugs & Logic Errors**: Potential bugs, edge cases, logic flaws
3. **Performance**: Inefficiencies, bottlenecks, optimization opportunities
4. **Security**: Vulnerabilities, injection risks, unsafe practices
5. **Best Practices**: Language idioms, design patterns, SOLID principles
6. **Error Handling**: Missing error handling, exception safety
7. **Testing Considerations**: Testability, missing test scenarios

Format your response using Markdown with clear sections. Be specific — reference line numbers or code snippets when pointing out issues. Provide concrete suggestions and improved code examples where helpful.`;

function buildCodeMessages(request: ReviewRequest) {
  const focusSection =
    request.focusAreas && request.focusAreas.length > 0
      ? `\n\nPay special attention to: ${request.focusAreas.join(", ")}.`
      : "";

  const userMessage = `Please review the following ${request.language} code:${focusSection}

\`\`\`${request.language}
${request.code}
\`\`\``;

  return [
    { role: "system" as const, content: CODE_SYSTEM_PROMPT },
    { role: "user" as const, content: userMessage },
  ];
}

export async function reviewCode(request: ReviewRequest): Promise<ReviewResponse> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: buildCodeMessages(request),
    max_tokens: 4096,
  });

  const review = completion.choices[0]?.message?.content;
  if (!review) throw new Error("No response from Groq");

  return { review, model: completion.model };
}

export async function reviewCodeStream(
  request: ReviewRequest,
  onChunk: (text: string) => void
): Promise<{ model: string }> {
  const client = getClient();

  const stream = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: buildCodeMessages(request),
    max_tokens: 4096,
    stream: true,
  });

  let model = "llama-3.3-70b-versatile";

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) onChunk(text);
    if (chunk.model) model = chunk.model;
  }

  return { model };
}

// ─── PR Review ───────────────────────────────────────────────────────────────

export interface PRReviewComment {
  severity: "critical" | "warning" | "suggestion" | "praise";
  line?: number;
  message: string;
  suggestion?: string;
}

export interface PRFileReview {
  filename: string;
  summary: string;
  comments: PRReviewComment[];
}

export interface PRReviewResult {
  overall: string;
  files: PRFileReview[];
  stats: {
    criticalCount: number;
    warningCount: number;
    suggestionCount: number;
  };
  model: string;
}

const PR_SYSTEM_PROMPT = `You are an expert code reviewer. Review the provided GitHub PR diff and return a structured JSON response.

Return ONLY a valid JSON object with this exact structure:
{
  "overall": "Overall summary of the PR quality, what it does, and key findings (2-4 sentences)",
  "files": [
    {
      "filename": "path/to/file.ts",
      "summary": "Brief summary of what changed in this file",
      "comments": [
        {
          "severity": "critical|warning|suggestion|praise",
          "line": 42,
          "message": "Specific issue or observation",
          "suggestion": "How to fix or improve (for critical/warning only)"
        }
      ]
    }
  ]
}

Severity levels:
- critical: bugs, security issues, data loss risks
- warning: performance issues, bad practices, code smells
- suggestion: style improvements, refactoring opportunities
- praise: well-written code worth highlighting

Be specific and actionable. Reference actual code from the diff.`;

export async function reviewPR(data: {
  metadata: PRMetadata;
  files: PRFile[];
}): Promise<PRReviewResult> {
  const client = getClient();

  const diffContent = data.files
    .map((f) => {
      const header = `## ${f.filename} (+${f.additions}/-${f.deletions}, ${f.status})`;
      return f.patch
        ? `${header}\n\`\`\`diff\n${f.patch}\n\`\`\``
        : `${header}\n[Binary file or no diff available]`;
    })
    .join("\n\n");

  const userMessage = `Review this GitHub PR:

**PR #${data.metadata.number}: ${data.metadata.title}**
- Repo: ${data.metadata.repo}
- Author: ${data.metadata.author}
- Changes: +${data.metadata.additions}/-${data.metadata.deletions} across ${data.metadata.changedFiles} files

## Diff:
${diffContent}`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: PR_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");

  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  let criticalCount = 0;
  let warningCount = 0;
  let suggestionCount = 0;

  const files: PRFileReview[] = (parsed.files || []).map((f: any) => {
    const comments: PRReviewComment[] = (f.comments || []).map((c: any) => {
      if (c.severity === "critical") criticalCount++;
      else if (c.severity === "warning") warningCount++;
      else if (c.severity === "suggestion") suggestionCount++;
      return {
        severity: c.severity || "suggestion",
        line: c.line,
        message: c.message || "",
        suggestion: c.suggestion,
      };
    });
    return { filename: f.filename || "", summary: f.summary || "", comments };
  });

  return {
    overall: parsed.overall || "",
    files,
    stats: { criticalCount, warningCount, suggestionCount },
    model: completion.model,
  };
}
