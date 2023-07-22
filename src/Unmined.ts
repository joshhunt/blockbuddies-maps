import OpenLayersMap from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import {
  Projection,
  addCoordinateTransforms,
  transform as projTransform,
} from "ol/proj";
import Point from "ol/geom/Point";
import { boundingExtent } from "ol/extent";
import TileGrid from "ol/tilegrid/TileGrid";
import Tile from "ol/layer/Tile";
import LayerVector from "ol/layer/Vector";
import SourceVector from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Coordinate, createStringXY } from "ol/coordinate";
import { MousePosition, defaults as controlDefaults } from "ol/control";
import { Text, Stroke, Fill, Style, Icon } from "ol/style";
import "ol/ol.css";
import "ol-contextmenu/ol-contextmenu.css";
import Geometry from "ol/geom/Geometry";
import ContextMenu from "ol-contextmenu";
import pinImage from "./assets/custom.pin.png";

interface UnminedOptions {
  minRegionX: number;
  minRegionZ: number;
  maxRegionX: number;
  maxRegionZ: number;
  maxZoom: number;
  minZoom: number;
  imageFormat: string;
  markers: any[];
  background?: string;
}

interface MarkerText {
  text: string;
  color: string;
  font: string;
  strokeColor: string;

  offsetX: number;
  offsetY: number;
}

export interface UnminedMarker {
  id: number;

  x: number;
  z: number;

  label?: MarkerText;
  subtitle?: MarkerText;

  image: string;
  imageAnchor: [number, number];
  imageScale: number;
}

export default class Unmined {
  dataProjection!: Projection;
  viewProjection!: Projection;
  openlayersMap!: OpenLayersMap;
  vectorSource!: SourceVector<Geometry>;
  vectorLayer!: LayerVector<any>;

  map(
    mapId: string,
    options: UnminedOptions,
    regions: any,
    tileURLBase: string,
    requestCreatePin: (coords: Coordinate) => void
  ) {
    const dpiScale = window.devicePixelRatio ?? 1.0;

    const worldMinX = options.minRegionX * 512;
    const worldMinY = options.minRegionZ * 512;
    const worldWidth = (options.maxRegionX + 1 - options.minRegionX) * 512;
    const worldHeight = (options.maxRegionZ + 1 - options.minRegionZ) * 512;

    const worldTileSize = 256;

    const worldMaxZoomFactor = Math.pow(2, options.maxZoom);

    // left, bottom, right, top, Y is negated
    var mapExtent = boundingExtent([
      [
        worldMinX * worldMaxZoomFactor,
        -(worldMinY + worldHeight) * worldMaxZoomFactor,
      ],
      [
        (worldMinX + worldWidth) * worldMaxZoomFactor,
        -worldMinY * worldMaxZoomFactor,
      ],
    ]);

    var viewProjection = new Projection({
      code: "VIEW",
      units: "pixels",
    });

    var dataProjection = new Projection({
      code: "DATA",
      units: "pixels",
    });
    this.dataProjection = dataProjection;
    this.viewProjection = viewProjection;

    // Coordinate transformation between view and data
    // OpenLayers Y is positive up, world Y is positive down
    addCoordinateTransforms(
      viewProjection,
      dataProjection,
      function (coordinate: any) {
        return [coordinate[0], -coordinate[1]];
      },
      function (coordinate: any) {
        return [coordinate[0], -coordinate[1]];
      }
    );

    const mapZoomLevels = options.maxZoom - options.minZoom;
    // Resolution for each OpenLayers zoom level
    var resolutions = new Array(mapZoomLevels + 1);
    for (let z = 0; z < mapZoomLevels + 1; ++z) {
      resolutions[mapZoomLevels - z] =
        (Math.pow(2, z) * dpiScale) / worldMaxZoomFactor;
    }

    var tileGrid = new TileGrid({
      extent: mapExtent,
      origin: [0, 0],
      resolutions: resolutions,
      tileSize: worldTileSize / dpiScale,
    });

    var unminedLayer = new Tile({
      source: new XYZ({
        projection: viewProjection,
        tileGrid: tileGrid,
        tilePixelRatio: dpiScale,
        tileSize: worldTileSize / dpiScale,

        tileUrlFunction: function (coordinate: any) {
          const worldZoom = -(mapZoomLevels - coordinate[0]) + options.maxZoom;
          const worldZoomFactor = Math.pow(2, worldZoom);

          const minTileX = Math.floor(
            (worldMinX * worldZoomFactor) / worldTileSize
          );
          const minTileY = Math.floor(
            (worldMinY * worldZoomFactor) / worldTileSize
          );
          const maxTileX =
            Math.ceil(
              ((worldMinX + worldWidth) * worldZoomFactor) / worldTileSize
            ) - 1;
          const maxTileY =
            Math.ceil(
              ((worldMinY + worldHeight) * worldZoomFactor) / worldTileSize
            ) - 1;

          const tileX = coordinate[1];
          const tileY = coordinate[2];

          const tileBlockSize = worldTileSize / worldZoomFactor;
          const tileBlockPoint = {
            x: tileX * tileBlockSize,
            z: tileY * tileBlockSize,
          };

          const hasTile = function () {
            const tileRegionPoint = {
              x: Math.floor(tileBlockPoint.x / 512),
              z: Math.floor(tileBlockPoint.z / 512),
            };
            const tileRegionSize = Math.ceil(tileBlockSize / 512);

            for (
              let x = tileRegionPoint.x;
              x < tileRegionPoint.x + tileRegionSize;
              x++
            ) {
              for (
                let z = tileRegionPoint.z;
                z < tileRegionPoint.z + tileRegionSize;
                z++
              ) {
                const group = {
                  x: Math.floor(x / 32),
                  z: Math.floor(z / 32),
                };
                const regionMap = regions.find(
                  (e: any) => e.x == group.x && e.z == group.z
                );
                if (regionMap) {
                  const relX = x - group.x * 32;
                  const relZ = z - group.z * 32;
                  const inx = relZ * 32 + relX;
                  var b = regionMap.m[Math.floor(inx / 32)];
                  var bit = inx % 32;
                  var found = (b & (1 << bit)) != 0;
                  if (found) return true;
                }
              }
            }
            return false;
          };

          if (
            tileX >= minTileX &&
            tileY >= minTileY &&
            tileX <= maxTileX &&
            tileY <= maxTileY &&
            hasTile()
          ) {
            const url = (
              tileURLBase +
              "tiles/zoom.{z}/{xd}/{yd}/tile.{x}.{y}." +
              options.imageFormat
            )
              .replace("{z}", worldZoom.toString())
              .replace("{yd}", Math.floor(tileY / 10).toString())
              .replace("{xd}", Math.floor(tileX / 10).toString())
              .replace("{y}", tileY)
              .replace("{x}", tileX);
            return url;
          } else return undefined;
        },
      }),
    });

    var mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(0),
      projection: dataProjection,
    });

    var map = new OpenLayersMap({
      target: mapId,
      controls: controlDefaults().extend([mousePositionControl]),
      layers: [unminedLayer],
      view: new View({
        center: [0, 0],
        extent: mapExtent,
        projection: viewProjection,
        resolutions: tileGrid.getResolutions(),
        maxZoom: mapZoomLevels,
        zoom: mapZoomLevels - options.maxZoom,
        constrainResolution: true,
        showFullExtent: true,
        constrainOnlyCenter: true,
      }),
    });

    if (options.markers) {
      var markersLayer = this.createMarkersLayer(options.markers);
      map.addLayer(markersLayer);
    }

    if (options.background) {
      document.getElementById(mapId)!.style.backgroundColor =
        options.background;
    }

    this.openlayersMap = map;

    const contextmenu = new ContextMenu({
      width: 170,
      defaultItems: true, // defaultItems are (for now) Zoom In/Zoom Out
      items: [
        {
          text: "Add a Marker",
          classname: "some-style-class", // you can add this icon with a CSS class
          // instead of `icon` property (see next line)
          icon: pinImage, // this can be relative or absolute
          callback: (ev) => {
            const mcCoords = projTransform(
              ev.coordinate,
              this.viewProjection,
              this.dataProjection
            );

            requestCreatePin(mcCoords);
          },
        },
        "-", // this is a separator
      ],
    });
    map.addControl(contextmenu);
  }

  createText(text: MarkerText) {
    return new Text({
      text: text.text,
      font: text.font,
      offsetX: text.offsetX,
      offsetY: text.offsetY,
      stroke: new Stroke({
        color: text.strokeColor,
        width: 2,
      }),
      fill: new Fill({
        color: text.color,
      }),
    });
  }

  existingMarkers: Map<
    UnminedMarker["id"],
    [UnminedMarker, Feature<Point> /* Feature */]
  > = new Map();

  createMarkersLayer(markers: UnminedMarker[]) {
    this.vectorSource = new SourceVector({
      features: [],
    });

    this.vectorLayer = new LayerVector({
      source: this.vectorSource,
    });

    for (const item of markers) {
      this.addMarker(item);
    }

    return this.vectorLayer;
  }

  addMarker(marker: UnminedMarker) {
    if (this.existingMarkers.has(marker.id)) {
      const [, feature] = this.existingMarkers.get(marker.id) ?? [];
      if (!feature) return;

      this.vectorSource.removeFeature(feature);
    }

    const feature = this.createMarkerFeature(marker);
    this.existingMarkers.set(marker.id, [marker, feature]);
    this.vectorSource.addFeature(feature);
  }

  createMarkerFeature(item: UnminedMarker) {
    var longitude = item.x;
    var latitude = item.z;

    var feature = new Feature({
      geometry: new Point(
        projTransform(
          [longitude, latitude],
          this.dataProjection,
          this.viewProjection
        )
      ),
    });

    var style = new Style();
    if (item.image) {
      style.setImage(
        new Icon({
          src: item.image,
          anchor: item.imageAnchor,
          scale: item.imageScale,
        })
      );
    }

    if (item.label) {
      const text = this.createText(item.label);
      style.setText(text);
    }

    feature.setStyle(style);

    return feature;
  }
}
