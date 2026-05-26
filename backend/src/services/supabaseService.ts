import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function db(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function saveReview(params: {
  userId: string;
  type: "code" | "pr";
  title: string;
  data: unknown;
}): Promise<string | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("reviews")
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      data: params.data,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[supabase] saveReview:", error.message);
    return null;
  }
  return (data as { id: string }).id;
}

export async function getReviews(userId: string): Promise<unknown[]> {
  const client = db();
  if (!client) return [];
  const { data, error } = await client
    .from("reviews")
    .select("id, type, title, data, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[supabase] getReviews:", error.message);
    return [];
  }
  return data ?? [];
}

export async function deleteReview(id: string, userId: string): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const { error } = await client
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("[supabase] deleteReview:", error.message);
    return false;
  }
  return true;
}

export async function getReviewById(id: string): Promise<unknown | null> {
  const client = db();
  if (!client) return null;
  const { data, error } = await client
    .from("reviews")
    .select("id, type, title, data, created_at")
    .eq("id", id)
    .single();
  if (error) {
    console.error("[supabase] getReviewById:", error.message);
    return null;
  }
  return data;
}

export async function clearReviews(userId: string): Promise<boolean> {
  const client = db();
  if (!client) return false;
  const { error } = await client
    .from("reviews")
    .delete()
    .eq("user_id", userId);
  if (error) {
    console.error("[supabase] clearReviews:", error.message);
    return false;
  }
  return true;
}
