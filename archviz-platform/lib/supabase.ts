import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface VisitorEntry {
  id?: string;
  name: string;
  email: string;
  contact: string;
  project: string;
  project_id: string;
  timestamp?: string;
}

export async function saveVisitor(data: VisitorEntry): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("visitors").insert([
      {
        name: data.name,
        email: data.email,
        contact: data.contact,
        project: data.project,
        project_id: data.project_id,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred" };
  }
}
