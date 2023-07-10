import { useCallback, useEffect, useMemo, useState } from "react";
import NewFeatureForm from "./NewFeatureForm";
import { supabase, useSubscription } from "./supabaseClient";
import { FeatureRow, NewFeatureRow, WorldRow } from "./types";
import Auth from "./Auth";
import { Session } from "@supabase/supabase-js";
import Map from "./Map";

function App() {
  const [selectedWorld, setSelectedWorld] = useState<WorldRow | undefined>(
    undefined
  );
  const [session, setSession] = useState<Session | null>(null);
  const [worlds, setWorlds] = useState<WorldRow[]>([]);

  const featuresFilter = useMemo(
    () =>
      selectedWorld ? { column: "world", value: selectedWorld.id } : undefined,
    [selectedWorld]
  );
  const allFeatures = useSubscription<FeatureRow>("Feature", featuresFilter);

  const featuresForWorld = useMemo(
    () => allFeatures.filter((v) => v.world === selectedWorld?.id),
    [allFeatures, selectedWorld?.id]
  );

  useEffect(() => {
    supabase
      .from("World")
      .select()
      .then(({ data }) => {
        if (data) {
          setWorlds(data);
        }
      });
  }, []);

  const handleNewFeature = useCallback((newFeature: NewFeatureRow) => {
    supabase
      .from("Feature")
      .insert(newFeature)
      .then(() => {});
  }, []);

  const handleAuthSession = useCallback((ns: any) => {
    setSession(ns);
  }, []);

  return (
    <div>
      <ul>
        {worlds.map((world) => {
          const worldEl = (
            <a href="#" onClick={() => setSelectedWorld(world)}>
              {world.name}
            </a>
          );

          if (selectedWorld && selectedWorld.id === world.id) {
            return (
              <li key={world.name}>
                {worldEl}
                <ul>
                  {featuresForWorld.map((feature) => (
                    <li key={feature.id}>{feature.name}</li>
                  ))}

                  <li>
                    <NewFeatureForm
                      world={selectedWorld}
                      onNewFeature={handleNewFeature}
                    />
                  </li>
                </ul>
              </li>
            );
          }

          return <li key={world.name}>{worldEl}</li>;
        })}
      </ul>

      <pre>{JSON.stringify(featuresFilter)}</pre>

      <h3>All Features</h3>
      <table>
        <thead>
          <tr>
            <td>created_at</td>
            <td>cross_dimension</td>
            <td>dimension</td>
            <td>icon</td>
            <td>name</td>
            <td>pos_x</td>
            <td>pos_y</td>
            <td>world</td>
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr key={feature.id}>
              <td>{new Date(feature.created_at ?? "").toLocaleString()}</td>
              <td>{feature.cross_dimension ? "true" : "false"}</td>
              <td>{feature.dimension}</td>
              <td>{feature.icon}</td>
              <td>{feature.name}</td>
              <td>{feature.pos_x}</td>
              <td>{feature.pos_y}</td>
              <td>{feature.world}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <Auth session={session} onAuthSession={handleAuthSession} />

      <hr />

      <Map features={allFeatures} />
    </div>
  );
}

export default App;
