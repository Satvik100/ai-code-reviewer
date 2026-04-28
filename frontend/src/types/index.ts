export interface ReviewResult {
  review: string;
  model: string;
}

export interface ReviewRequest {
  code: string;
  language: string;
  focusAreas: string[];
}

export type ReviewStatus = "idle" | "loading" | "success" | "error";

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
