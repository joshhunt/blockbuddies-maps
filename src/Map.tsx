import React, { useCallback, useEffect, useRef } from "react";
import { FeatureRow } from "./types";
import pinImage from "./assets/custom.pin.png";
import Unmined, { UnminedMarker } from "./Unmined";
import { Coordinate } from "ol/coordinate";
import s from "./Map.module.css";

interface MapProps {
  features: FeatureRow[];
  mapBase: string;
  requestNewFeature: (coordinates: Coordinate) => void;
}

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
    z: feature.pos_z ?? 0,

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

const Map: React.FC<MapProps> = ({ features, mapBase, requestNewFeature }) => {
  const unminedRef = useRef<Unmined | null>();

  const handleCreateCoordinate = useCallback(
    (coords: Coordinate) => {
      const [posX, posZ] = coords;
      requestNewFeature([Math.round(posX), Math.round(posZ)]);
    },
    [requestNewFeature]
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

  return <div id="map" className={s.map}></div>;
};

export default Map;
