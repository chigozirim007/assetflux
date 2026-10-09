import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Server-side only: uses the service-role key so the anon key
// is never used for sensitive lookups from the browser.
// Lazily initialised — at build time the env vars may not exist yet.
let _supabaseAdmin;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseAdmin;
}

export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 }
      );
    }

    const clean = username.trim().replace(/^@+/, "");

    // Only return enough to identify the account — never expose email in the response.
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("id, username, first_name, last_name, email")
      .ilike("username", clean)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Lookup failed. Please sign in with your email." },
        { status: 500 }
      );
    }

    if (!data?.email) {
      return NextResponse.json(
        { error: "No account found for that username." },
        { status: 404 }
      );
    }

    // Return only what the sign-in form needs — the email to authenticate with.
    // The email is not shown to the user; it is only used internally to call signInWithPassword.
    return NextResponse.json({
      email: data.email,
      profile: {
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
