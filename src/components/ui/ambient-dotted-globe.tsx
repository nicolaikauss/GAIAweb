"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type AmbientDottedGlobeProps = {
  className?: string;
  rotationSpeed?: number;
};

type DotData = {
  lng: number;
  lat: number;
};

const LAND_GEOJSON_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json";

const generateDotsForFeature = (feature: GeoJSON.Feature, dotSpacing = 16): DotData[] => {
  const dots: DotData[] = [];
  const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature as d3.GeoPermissibleObjects);
  const stepSize = dotSpacing * 0.1;

  for (let lng = minLng; lng <= maxLng; lng += stepSize) {
    for (let lat = minLat; lat <= maxLat; lat += stepSize) {
      const point: [number, number] = [lng, lat];
      if (d3.geoContains(feature as d3.GeoPermissibleObjects, point)) {
        dots.push({ lng, lat });
      }
    }
  }

  return dots;
};

export function AmbientDottedGlobe({ className = "", rotationSpeed = 0.095 }: AmbientDottedGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    let width = 0;
    let height = 0;
    let radius = 1;
    let rotation: [number, number] = [20, -8];
    let dots: DotData[] = [];
    let landFeatures: GeoJSON.FeatureCollection | null = null;
    let isDisposed = false;

    const projection = d3.geoOrthographic();
    const path = d3.geoPath(projection, context);
    const graticule = d3.geoGraticule();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      radius = Math.min(width, height) * 0.36;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      projection.scale(radius).translate([width * 0.72, height * 0.47]).clipAngle(90).rotate(rotation);
      render();
    };

    const render = () => {
      context.clearRect(0, 0, width, height);

      context.beginPath();
      context.arc(width * 0.72, height * 0.47, radius, 0, 2 * Math.PI);
      context.fillStyle = "rgba(15,23,42,0.02)";
      context.fill();
      context.strokeStyle = "rgba(15,23,42,0.42)";
      context.lineWidth = 1.05;
      context.stroke();

      context.beginPath();
      path(graticule());
      context.strokeStyle = "rgba(15,23,42,0.2)";
      context.lineWidth = 0.65;
      context.stroke();

      if (!landFeatures) return;

      context.beginPath();
      landFeatures.features.forEach((feature) => path(feature as d3.GeoPermissibleObjects));
      context.strokeStyle = "rgba(15,23,42,0.46)";
      context.lineWidth = 0.9;
      context.stroke();

      context.fillStyle = "rgba(15,23,42,0.74)";
      for (const dot of dots) {
        const projected = projection([dot.lng, dot.lat]);
        if (!projected) continue;
        context.beginPath();
        context.arc(projected[0], projected[1], 1.05, 0, 2 * Math.PI);
        context.fill();
      }
    };

    const loadWorldData = async () => {
      try {
        const response = await fetch(LAND_GEOJSON_URL);
        if (!response.ok) return;
        const data = (await response.json()) as GeoJSON.FeatureCollection;
        if (isDisposed) return;

        landFeatures = data;
        dots = data.features.flatMap((feature) => generateDotsForFeature(feature, 16));
        render();
      } catch {
        // Keep hero clean if remote map data fails.
      }
    };

    resize();
    loadWorldData();

    const timer = d3.timer(() => {
      if (reduceMotion || document.hidden) return;
      rotation = [rotation[0] + rotationSpeed, rotation[1]];
      projection.rotate(rotation);
      render();
    });

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      isDisposed = true;
      timer.stop();
      ro.disconnect();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [rotationSpeed]);

  return <div ref={containerRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className}`} />;
}
