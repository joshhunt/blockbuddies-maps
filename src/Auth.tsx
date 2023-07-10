import { useEffect } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./supabaseClient";
import { Session } from "@supabase/supabase-js";

interface Props {
  session: Session | null;
  onAuthSession: (session: Session | null) => void;
}

export default function Auth({ session, onAuthSession }: Props) {
  useEffect(() => {
    console.log("auth effect");
    supabase.auth.getSession().then(({ data: { session } }) => {
      onAuthSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      onAuthSession(session);
    });

    return () => subscription.unsubscribe();
  }, [onAuthSession]);

  if (!session) {
    return (
      <div style={{ maxWidth: 400 }}>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={[]}
        />
      </div>
    );
  } else {
    return (
      <div>
        Logged in!{" "}
        <button onClick={() => supabase.auth.signOut()}>sign out</button>
      </div>
    );
  }
}
