import type { HistoryEntry } from "../types";

function headers(userId: string) {
  return { "Content-Type": "application/json", "x-user-id": userId };
}

export async function saveCloudReview(
  userId: string,
  entry: Omit<HistoryEntry, "id" | "timestamp">
): Promise<string | null> {
  try {
    const res = await fetch("/api/history", {
      method: "POST",
      headers: headers(userId),
      body: JSON.stringify({
        type: entry.type,
        title: entry.title,
        data: entry.codeData ?? entry.prData,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { id: string | null };
    return json.id;
  } catch {
    return null;
  }
}

export async function getCloudHistory(userId: string): Promise<HistoryEntry[]> {
  try {
    const res = await fetch("/api/history", { headers: { "x-user-id": userId } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      reviews: Array<{
        id: string;
        type: "code" | "pr";
        title: string;
        data: Record<string, unknown>;
        created_at: string;
      }>;
    };
    return json.reviews.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      timestamp: new Date(row.created_at).getTime(),
      ...(row.type === "code"
        ? { codeData: row.data as HistoryEntry["codeData"] }
        : { prData: row.data as HistoryEntry["prData"] }),
    }));
  } catch {
    return [];
  }
}

export async function deleteCloudReview(userId: string, id: string): Promise<void> {
  try {
    await fetch(`/api/history/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": userId },
    });
  } catch {
    // best-effort
  }
}

export async function clearCloudHistory(userId: string): Promise<void> {
  try {
    await fetch("/api/history/all", {
      method: "DELETE",
      headers: { "x-user-id": userId },
    });
  } catch {
    // best-effort
  }
}
