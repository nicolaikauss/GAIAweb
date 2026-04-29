import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  size?: "auto" | "compact" | "regular";
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  size = "auto",
}: LiquidMetalButtonProps) {
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const onChange = () => setIsTablet(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const dimensions = useMemo(() => {
    const resolvedSize = size === "auto" ? (isMobile ? "compact" : isTablet ? "regular" : "regular") : size;

    if (viewMode === "icon") {
      const iconSize = resolvedSize === "compact" ? 40 : 46;
      return {
        width: iconSize,
        height: iconSize,
        innerWidth: iconSize - 4,
        innerHeight: iconSize - 4,
        shaderWidth: iconSize,
        shaderHeight: iconSize,
        fontSize: 13,
        iconSize: resolvedSize === "compact" ? 14 : 16,
      };
    }

    const baseWidth = resolvedSize === "compact" ? 104 : 142;
    const fontSize = resolvedSize === "compact" ? 11 : 14;
    const height = resolvedSize === "compact" ? 34 : 46;
    const dynamicWidth = Math.max(baseWidth, 24 + label.length * 8);
    return {
      width: dynamicWidth,
      height,
      innerWidth: dynamicWidth - 4,
      innerHeight: height - 4,
      shaderWidth: dynamicWidth,
      shaderHeight: height,
      fontSize,
      iconSize: 16,
    };
  }, [viewMode, label, size, isMobile, isTablet]);

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (shaderRef.current) {
      shaderMount.current?.destroy?.();
      shaderMount.current = new ShaderMount(
        shaderRef.current,
        liquidMetalFragmentShader,
        {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 8,
          u_shape: 1,
          u_offsetX: 0.1,
          u_offsetY: -0.1,
        },
        undefined,
        0.6,
      );
    }

    return () => {
      shaderMount.current?.destroy?.();
      shaderMount.current = null;
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed?.(0.6);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    shaderMount.current?.setSpeed?.(2.4);
    setTimeout(() => {
      shaderMount.current?.setSpeed?.(isHovered ? 1 : 0.6);
    }, 300);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    onClick?.();
  };

  return (
    <div className="relative inline-block">
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition:
              "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            transform: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {viewMode === "icon" ? (
              <Sparkles
                size={dimensions.iconSize}
                style={{
                  color: "#1f2937",
                  filter: "drop-shadow(0px 1px 1px rgba(255, 255, 255, 0.35))",
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: `${dimensions.fontSize}px`,
                  color: "#111827",
                  fontWeight: 500,
                  textShadow: "0px 1px 1px rgba(255, 255, 255, 0.25)",
                  transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: "scale(1)",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "100px",
                background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(148, 163, 184, 0.45), inset 0px 1px 2px rgba(148, 163, 184, 0.35)"
                  : "none",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "100px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(226, 232, 240, 0.95), 0px 1px 2px 0px rgba(15, 23, 42, 0.22)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(226, 232, 240, 0.95), 0px 12px 6px 0px rgba(15, 23, 42, 0.05), 0px 8px 5px 0px rgba(15, 23, 42, 0.08), 0px 4px 4px 0px rgba(15, 23, 42, 0.1), 0px 1px 2px 0px rgba(15, 23, 42, 0.14)"
                    : "0px 0px 0px 1px rgba(226, 232, 240, 0.9), 0px 26px 12px 0px rgba(15, 23, 42, 0.02), 0px 14px 10px 0px rgba(15, 23, 42, 0.05), 0px 7px 8px 0px rgba(15, 23, 42, 0.08), 0px 2px 4px 0px rgba(15, 23, 42, 0.12)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "rgb(0 0 0 / 0)",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.4s ease, height 0.4s ease",
                }}
              />
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}
