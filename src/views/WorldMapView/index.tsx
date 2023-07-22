import { useCallback, useMemo, useState } from "react";
import {
  DONT_QUERY,
  supabase,
  useSubscription,
  useWorld,
} from "../../supabaseClient";
import { FeatureRow, NewFeatureRow, WorldRow } from "../../types";
import NewFeatureForm from "../../NewFeatureForm";
import { Link } from "wouter";
import React from "react";

import s from "./styles.module.css";
import { Coordinate } from "ol/coordinate";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Heading,
} from "@chakra-ui/react";
import { useAuth } from "../../AuthProvider";
import Auth from "../../Auth";

const Map = React.lazy(() => import("../../Map"));

interface WorldMapViewProps {
  params: {
    worldSlug: string;
    dimensionSlug: string;
  };
}

function getOtherDimFeatures(allFeatures: FeatureRow[], thisDimension: string) {
  if (thisDimension === "nether") {
    const overworldFeatures = allFeatures
      .filter((f) => f.dimension === "overworld")
      .map((f) => ({
        ...f,
        pos_x: (f.pos_x ?? 0) / 8,
        pos_z: (f.pos_z ?? 0) / 8,
      }));

    return overworldFeatures;
  }

  return [];
}

export default function WorldMapView({
  params: { worldSlug, dimensionSlug },
}: WorldMapViewProps) {
  const { session, isLoaded } = useAuth();
  const [world, worldError] = useWorld(worldSlug);
  const features = useDimensionFeatures(world, dimensionSlug);

  const [newFeatureInitialValues, setNewFeatureInitialValues] = useState<
    Partial<NewFeatureRow>
  >({});
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [addPinError, setAddPinError] = useState<string | null>();

  const handleNewFeature = useCallback((newFeature: NewFeatureRow) => {
    supabase
      .from("Feature")
      .insert(newFeature)
      .then(
        () => {},
        (error) => {
          console.log("error making pin", error);

          const errorMessage =
            error?.message || error?.toString?.() || error || "Unknown error";

          setAddPinError(errorMessage);
        }
      );
  }, []);

  const handleStartCreatingFeature = useCallback(
    ([posX, posZ]: Coordinate) => {
      setIsCreatingFeature(true);
      setNewFeatureInitialValues((v) => ({
        ...v,
        dimension: dimensionSlug,
        pos_x: posX,
        pos_z: posZ,
      }));
    },
    [dimensionSlug]
  );

  if (worldError) {
    return <div>error loading world.</div>;
  }

  if (!world) {
    return <div>loading...</div>;
  }

  const mapBaseUrl = world.map_base_url + dimensionSlug + "/";

  return (
    <div className={s.root}>
      <div className={s.header}>
        <Heading size="md">{world.name}</Heading>

        <Link href={`/${worldSlug}/overworld`}>Overworld</Link>
        <Link href={`/${worldSlug}/nether`}>Nether</Link>
        <Link href={`/${worldSlug}/end`}>The End</Link>

        <div className={s.flexGrow} />

        <Link href={`/`}>Home</Link>
      </div>

      <div className={s.map}>
        <div className={s.mapShadows} />
        <Map
          features={features}
          mapBase={mapBaseUrl}
          requestNewFeature={handleStartCreatingFeature}
        />
      </div>

      {(isCreatingFeature || addPinError) && (
        <div className={s.drawer}>
          {session ? (
            <NewFeatureForm
              world={world}
              initialValues={newFeatureInitialValues}
              onNewFeature={handleNewFeature}
              onCancel={() => setIsCreatingFeature(false)}
            />
          ) : (
            <Auth />
          )}

          {addPinError && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Error creating pin</AlertTitle>
              <AlertDescription>{addPinError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

function useDimensionFeatures(world: WorldRow | null, dimensionSlug: string) {
  const featuresFilter = useMemo(
    () => (world ? { column: "world", value: world.id } : DONT_QUERY),
    [world]
  );
  const allFeatures = useSubscription<FeatureRow>("Feature", featuresFilter);
  const features = useMemo(() => {
    const thisDimFeatures = allFeatures.filter(
      (f) => f.dimension === dimensionSlug
    );

    const otherDimFeatures = getOtherDimFeatures(allFeatures, dimensionSlug);

    return [...thisDimFeatures, ...otherDimFeatures];
  }, [allFeatures, dimensionSlug]);

  return features;
}
