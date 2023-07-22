import React, { useCallback, useEffect, useRef, useState } from "react";
import { FeatureRow, NewFeatureRow, WorldRow } from "./types";
import pinImage from "./assets/custom.pin.png";
import Unmined, { UnminedMarker } from "./Unmined";
import { Coordinate } from "ol/coordinate";
import NewFeatureForm from "./NewFeatureForm";
import s from "./Map.module.css";

interface MapProps {
  world: WorldRow;
  features: FeatureRow[];
  mapBase: string;
  onNewFeature: (newFeature: NewFeatureRow) => void;
}

// const MAP_BASE =
//   "https://j-minecraft-maps.s3.eu-west-1.amazonaws.com/unmined/joshcraft/overworld/";

async function loadFromScript(
  url: string,
  exportVar: string,
  preprocessSource?: (src: string) => string
) {
  const resp = await fetch(url);
  let source = await resp.text();

  if (preprocessSource) {
    source = preprocessSource(source);
  }

  const fnSource = `
    ${source}
    return ${exportVar}`;

  const fn = new Function(fnSource); // lmao
  return fn();
}

function mapFeature(feature: FeatureRow): UnminedMarker {
  return {
    id: feature.id,
    x: feature.pos_x ?? 0,
    z: feature.pos_y ?? 0,

    label: {
      text: feature.name,
      color: "white",
      font: "bold 18px monospace,sans serif",
      strokeColor: "black",

      offsetX: 0,
      offsetY: 20,
    },

    image: pinImage,
    imageAnchor: [0.5, 1],
    imageScale: 0.5,
  };
}

const Map: React.FC<MapProps> = ({
  features,
  mapBase,
  world,
  onNewFeature,
}) => {
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [newFeatureCoords, setNewFeatureCoords] = useState<Coordinate | null>(
    null
  );
  const unminedRef = useRef<Unmined | null>();

  const handleCreateCoordinate = useCallback((coords: Coordinate) => {
    const [posX, posY] = coords;

    setIsCreatingFeature(true);
    setNewFeatureCoords([Math.round(posX), Math.round(posY)]);
  }, []);

  const handleNewFeature = useCallback(
    (newFeature: NewFeatureRow) => {
      onNewFeature(newFeature);
      setNewFeatureCoords(null);
      setIsCreatingFeature(false);
    },
    [onNewFeature]
  );

  useEffect(() => {
    let effectCancelled = false;
    console.info("Running init map effect");
    const mapElId = "map";

    function clearMapEl() {
      const mapEl = document.getElementById(mapElId);
      while (mapEl && mapEl.firstChild) {
        if (mapEl.lastChild) {
          mapEl.removeChild(mapEl.lastChild);
        }
      }
    }

    const propertiesPromise = loadFromScript(
      `${mapBase}unmined.map.properties.js`,
      "UnminedMapProperties"
    );

    const regionsPromise = loadFromScript(
      `${mapBase}unmined.map.regions.js`,
      "UnminedRegions"
    );

    Promise.all([propertiesPromise, regionsPromise]).then(
      ([properties, regions]: [any, any]) => {
        if (effectCancelled) {
          console.warn("Init map effect has been cleared");
          return;
        }

        console.info("Creating map in init map effect");

        clearMapEl();
        let unmined = new Unmined();
        unmined.map(
          mapElId,
          properties,
          regions,
          mapBase,
          handleCreateCoordinate
        );
        unminedRef.current = unmined;

        for (const feature of features) {
          console.info("adding feature in init effect", feature.id);
          unminedRef.current.addMarker(mapFeature(feature));
        }
      }
    );

    return () => {
      effectCancelled = true;
      console.info("Cleaning up init map effect");
      clearMapEl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapBase]);

  useEffect(() => {
    console.info("Running features effect");

    if (!unminedRef.current) {
      console.warn("Map not created yet");
      return;
    }

    for (const feature of features) {
      unminedRef.current.addMarker(mapFeature(feature));
    }
  }, [features]);

  return (
    <div className={s.wrapper}>
      <div id="map" style={{ width: "100%", height: 700 }}></div>

      {/* <CreateFeatureModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
      /> */}

      {isCreatingFeature && (
        <div>
          <NewFeatureForm
            world={world}
            onNewFeature={handleNewFeature}
            initialCoordiantes={newFeatureCoords ?? undefined}
          />
          <button type="button" onClick={() => setIsCreatingFeature(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Map;
