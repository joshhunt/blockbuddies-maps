import { useCallback, useMemo } from "react";
import {
  DONT_QUERY,
  supabase,
  useSubscription,
  useWorld,
} from "../../supabaseClient";
import { FeatureRow, NewFeatureRow } from "../../types";
import Map from "../../Map";
import NewFeatureForm from "../../NewFeatureForm";
import { Link } from "wouter";

interface WorldMapViewProps {
  params: {
    worldSlug: string;
    dimensionSlug: string;
  };
}

export default function WorldMapView({
  params: { worldSlug, dimensionSlug },
}: WorldMapViewProps) {
  const [world, worldError] = useWorld(worldSlug);
  const featuresFilter = useMemo(
    () => (world ? { column: "world", value: world.id } : DONT_QUERY),
    [world]
  );
  const allFeatures = useSubscription<FeatureRow>("Feature", featuresFilter);

  const features = useMemo(() => {
    return allFeatures.filter((f) => f.dimension === dimensionSlug);
  }, [allFeatures, dimensionSlug]);

  const handleNewFeature = useCallback((newFeature: NewFeatureRow) => {
    supabase
      .from("Feature")
      .insert(newFeature)
      .then(() => {});
  }, []);

  if (worldError) {
    return <div>error loading world.</div>;
  }

  if (!world) {
    return <div>loading...</div>;
  }

  const mapBaseUrl = world.map_base_url + dimensionSlug + "/";

  return (
    <div>
      <h2>{world.name}</h2>
      <p>
        <Link to="/">Home</Link>
      </p>
      <p>
        <Link href={`/${worldSlug}/overworld`}>Overworld</Link>
        {" / "}
        <Link href={`/${worldSlug}/nether`}>Nether</Link>
        {" / "}
        <Link href={`/${worldSlug}/end`}>The End</Link>
      </p>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <h3>
            Features for {world.slug}/{dimensionSlug}
          </h3>
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
              {features.map((feature) => (
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
        </div>

        <div>
          <h3>Add pin</h3>
          <NewFeatureForm world={world} onNewFeature={handleNewFeature} />
        </div>
      </div>
      <h3>Map</h3>
      <Map features={features} mapBase={mapBaseUrl} />
    </div>
  );
}
