import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthProvider";

export default function Auth() {
  const { session, isLoaded } = useAuth();

  if (!isLoaded) {
    return "Loading...";
  }

  if (!session) {
    return (
      <div style={{ maxWidth: 400 }}>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    );
  }

  return (
    <div>
      Logged in!{" "}
      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </div>
  );
}
