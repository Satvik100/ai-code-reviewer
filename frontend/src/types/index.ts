// ─── Code Review ─────────────────────────────────────────────────────────────

export interface ReviewResult {
  review: string;
  model: string;
}

export interface ReviewRequest {
  code: string;
  language: string;
  focusAreas: string[];
}

export type ReviewStatus = "idle" | "loading" | "streaming" | "success" | "error";

// ─── PR Review ────────────────────────────────────────────────────────────────

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

export interface PRMetadata {
  title: string;
  number: number;
  repo: string;
  author: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  url: string;
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

export interface PRReviewResponse {
  metadata: PRMetadata;
  result: PRReviewResult;
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  type: "code" | "pr";
  timestamp: number;
  title: string;
  codeData?: { code: string; language: string; result: ReviewResult };
  prData?: { prUrl: string; metadata: PRMetadata; result: PRReviewResult };
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash/Shell" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
] as const;

export const FOCUS_AREAS = [
  "Security",
  "Performance",
  "Code Quality",
  "Best Practices",
  "Error Handling",
  "Testing",
  "Documentation",
] as const;
