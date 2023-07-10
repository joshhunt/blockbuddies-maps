import React, { useEffect, useRef } from "react";
import { FeatureRow } from "./types";
import pinImage from "./assets/custom.pin.png";
import Unmined from "./Unmined";

interface MapProps {
  features: FeatureRow[];
  mapBase: string;
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

const Map: React.FC<MapProps> = ({ features, mapBase }) => {
  const ranRef = useRef<true | null>();
  useEffect(() => {
    // if (ranRef.current) {
    //   return;
    // }

    const mapElId = "map";

    ranRef.current = true;

    function clearMapEl() {
      const mapEl = document.getElementById(mapElId);
      while (mapEl && mapEl.firstChild) {
        if (mapEl.lastChild) {
          mapEl.removeChild(mapEl.lastChild);
        }
      }
    }

    async function run() {
      console.log("creating map");

      const properties = await loadFromScript(
        `${mapBase}unmined.map.properties.js`,
        "UnminedMapProperties"
      );

      const regions = await loadFromScript(
        `${mapBase}unmined.map.regions.js`,
        "UnminedRegions"
      );

      const markers = features.map((feature) => {
        return {
          x: feature.pos_x,
          z: feature.pos_y,
          image: pinImage,
          imageAnchor: [0.5, 1],
          imageScale: 0.5,

          text: feature.name,
          textColor: "white",
          offsetX: 0,
          offsetY: 20,
          font: "bold 16px monospace,sans serif",
        };
      });

      properties.markers = markers;

      clearMapEl();
      let unmined = new Unmined();
      unmined.map(mapElId, properties, regions, mapBase);
    }

    run();

    return () => {
      clearMapEl();
    };
  }, [features, mapBase]);

  return (
    <div>
      <div id="map" style={{ width: "100%", height: 700 }}></div>
    </div>
  );
};

export default Map;
