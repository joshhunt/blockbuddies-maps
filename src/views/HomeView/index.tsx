import { useCallback, useState } from "react";
import { useWorlds } from "../../supabaseClient";
import { Link } from "wouter";
import { Session } from "@supabase/supabase-js";
import Auth from "../../Auth";

export default function HomeView() {
  const [worlds, error] = useWorlds();
  const [session, setSession] = useState<Session | null>(null);

  const handleAuthSession = useCallback((ns: Session | null) => {
    setSession(ns);
  }, []);

  return (
    <div>
      <h2>Worlds</h2>

      {error ? <div>error loading worlds</div> : null}

      <ul>
        {worlds.map((world) => (
          <li>
            <Link href={`/${world.slug}`}> {world.name}</Link>
          </li>
        ))}
      </ul>

      <Auth session={session} onAuthSession={handleAuthSession} />
    </div>
  );
}
