// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface DottedSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Import Three.js dynamically
    import("three").then((THREE) => {
      const { Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute, PointsMaterial, Points, Vector3 } = THREE;

      // Scene setup
      const scene = new Scene();
      const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new WebGLRenderer({ alpha: true, antialias: true });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current?.appendChild(renderer.domElement);

      // Create dots
      const dotCount = 2000;
      const positions = new Float32Array(dotCount * 3);
      const colors = new Float32Array(dotCount * 3);

      for (let i = 0; i < dotCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        // Color based on theme
        const isLight = theme === "light";
        const baseColor = isLight ? 0.8 : 0.2;
        const variation = Math.random() * 0.4;
        
        colors[i * 3] = baseColor + variation;
        colors[i * 3 + 1] = baseColor + variation;
        colors[i * 3 + 2] = baseColor + variation;
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(positions, 3));
      geometry.setAttribute("color", new BufferAttribute(colors, 3));

      const material = new PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
      });

      const dots = new Points(geometry, material);
      scene.add(dots);

      // Camera position
      camera.position.z = 5;

      // Animation
      let time = 0;
      const animate = () => {
        time += 0.005;
        
        // Rotate dots
        dots.rotation.x = time * 0.1;
        dots.rotation.y = time * 0.15;
        
        // Move camera slightly
        camera.position.x = Math.sin(time * 0.5) * 0.5;
        camera.position.y = Math.cos(time * 0.3) * 0.3;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();
      sceneRef.current = { scene, renderer, dots };

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    });

    return () => {
      if (sceneRef.current) {
        const { renderer, scene } = sceneRef.current;
        if (renderer && scene) {
          renderer.dispose();
          scene.clear();
        }
      }
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none fixed inset-0 -z-10", className)}
      {...props}
    />
  );
}
