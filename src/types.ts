import { Database } from "./supabase";

export type WorldRow = Database["public"]["Tables"]["World"]["Row"];
export type FeatureRow = Database["public"]["Tables"]["Feature"]["Row"];
export type NewFeatureRow = Database["public"]["Tables"]["Feature"]["Insert"];
