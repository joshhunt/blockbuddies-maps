import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type SessionData =
  | { isLoaded: false; session: null }
  | {
      session: Session | null;
      isLoaded: true;
    };

const initialContextValue = {
  isLoaded: false,
  session: null,
};

const AuthContext = createContext<SessionData>(initialContextValue);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SessionData>(initialContextValue);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        isLoaded: true,
        session,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        isLoaded: true,
        session,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
