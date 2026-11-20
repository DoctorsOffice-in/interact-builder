import { supabase } from "@/integrations/supabase/client";
import { contentInputSchema } from "@/lib/content-validation";
import type { Json } from "@/integrations/supabase/types";

export interface SavedContentItem {
  id: string;
  content_type: string;
  title: string;
  slug: string;
  content: Json;
  is_published: boolean;
  updated_at: string;
}

export const makeContentSlug = (title: string) => {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || "doctor-content";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
};

export const getSignedInUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const saveContentItem = async (input: {
  id?: string;
  contentType: "quiz" | "calculator" | "chatbot" | "spin-wheel";
  title: string;
  content: Record<string, unknown>;
  publish?: boolean;
}) => {
  const parsed = contentInputSchema.safeParse({ ...input, publish: input.publish ?? false });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check the content and try again.");

  const user = await getSignedInUser();
  if (!user) throw new Error("Sign in to save content to your account.");

  const row = {
    content_type: parsed.data.contentType,
    title: parsed.data.title,
    slug: makeContentSlug(parsed.data.title),
    content: parsed.data.content as Json,
    is_published: parsed.data.publish,
    updated_at: new Date().toISOString(),
  };

  const query = parsed.data.id
    ? supabase.from("content_items").update(row).eq("id", parsed.data.id).eq("owner_id", user.id)
    : supabase.from("content_items").insert({ ...row, owner_id: user.id });
  const { data, error } = await query.select("id, content_type, title, slug, content, is_published, updated_at").single();
  if (error) throw error;
  return data as SavedContentItem;
};

export const getContentItem = async (id: string) => {
  const user = await getSignedInUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("content_items")
    .select("id, content_type, title, slug, content, is_published, updated_at")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data as SavedContentItem | null;
};

export const listContentItems = async () => {
  const user = await getSignedInUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("content_items")
    .select("id, content_type, title, slug, content, is_published, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as SavedContentItem[];
};