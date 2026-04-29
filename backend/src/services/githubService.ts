export interface PRFile {
  filename: string;
  additions: number;
  deletions: number;
  patch?: string;
  status: string;
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

export interface PRData {
  metadata: PRMetadata;
  files: PRFile[];
}

const MAX_PATCH_LENGTH = 3000;
const MAX_FILES = 15;

export function parsePRUrl(url: string): { owner: string; repo: string; number: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: match[3] };
}

export async function fetchPRData(
  owner: string,
  repo: string,
  prNumber: string,
  token?: string
): Promise<PRData> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AI-Code-Reviewer/1.0",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const [prRes, filesRes] = await Promise.all([
    fetch(`${base}/pulls/${prNumber}`, { headers }),
    fetch(`${base}/pulls/${prNumber}/files?per_page=100`, { headers }),
  ]);

  if (!prRes.ok) {
    if (prRes.status === 404)
      throw new Error("PR not found. Check the URL and ensure the repo is public.");
    if (prRes.status === 403)
      throw new Error("Rate limit exceeded or repo is private. Add a GitHub token.");
    if (prRes.status === 401)
      throw new Error("Invalid GitHub token.");
    throw new Error(`GitHub API error: ${prRes.status}`);
  }

  const pr = await prRes.json() as Record<string, any>;
  const filesData = await filesRes.json() as Record<string, any>[];

  const files: PRFile[] = filesData
    .slice(0, MAX_FILES)
    .map((f) => ({
      filename: f.filename as string,
      additions: f.additions as number,
      deletions: f.deletions as number,
      status: f.status as string,
      patch: f.patch
        ? (f.patch as string).length > MAX_PATCH_LENGTH
          ? (f.patch as string).slice(0, MAX_PATCH_LENGTH) + "\n... [diff truncated]"
          : (f.patch as string)
        : undefined,
    }));

  return {
    metadata: {
      title: pr.title as string,
      number: pr.number as number,
      repo: `${owner}/${repo}`,
      author: (pr.user as Record<string, any>)?.login as string || "unknown",
      additions: pr.additions as number,
      deletions: pr.deletions as number,
      changedFiles: pr.changed_files as number,
      url: pr.html_url as string,
    },
    files,
  };
}
