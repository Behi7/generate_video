import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { TestingBayEnvironment } from "./TestingBayEnvironment";
import { ContactShadows, Grid } from "@react-three/drei";

export interface ModelInspectorProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  modelCenter?: [number, number, number];
}

interface CameraViewConfig {
  name: string;
  badge: string;
  badgeColor: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const VIEW_CONFIGS: Record<number, CameraViewConfig> = {
  // Frame 1: Front View (XY Plane)
  1: {
    name: "01 • FRONT VIEW",
    badge: "XY PLANE",
    badgeColor: "#F59E0B",
    position: [0, 0.2, 4.0],
    target: [0, -0.15, 0],
    fov: 38,
  },
  // Frame 2: Side Right View (ZY Plane)
  2: {
    name: "02 • SIDE RIGHT",
    badge: "ZY PLANE",
    badgeColor: "#06B6D4",
    position: [4.0, 0.2, 0],
    target: [0, -0.15, 0],
    fov: 38,
  },
  // Frame 3: Top View (XZ Plane)
  3: {
    name: "03 • TOP VIEW",
    badge: "XZ PLANE",
    badgeColor: "#8B5CF6",
    position: [0, 4.2, 0.001],
    target: [0, -0.15, 0],
    fov: 38,
  },
  // Frame 4: Heroic 3/4 Isometric Perspective
  4: {
    name: "04 • HEROIC 3/4 ISO",
    badge: "STUDIO 3D",
    badgeColor: "#10B981",
    position: [2.3, 1.8, 3.6],
    target: [0, -0.3, 0],
    fov: 40,
  },
};

const InspectorCameraController: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}> = ({ position, target, fov }) => {
  const { camera } = useThree();

  camera.position.set(position[0], position[1], position[2]);
  if (position[0] === 0 && position[2] < 0.01 && position[1] > 0) {
    camera.up.set(0, 0, -1);
  } else {
    camera.up.set(0, 1, 0);
  }
  camera.lookAt(target[0], target[1], target[2]);
  if ("fov" in camera) {
    camera.fov = fov;
  }
  camera.updateProjectionMatrix();

  return null;
};

export const ModelInspector: React.FC<ModelInspectorProps> = ({
  title = "3D Asset Quality Inspection",
  children,
  modelCenter = [0, 0, 0],
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Map frames 1..4 (or clamp if outside)
  const viewIndex = Math.min(4, Math.max(1, frame || 1));
  const currentView = VIEW_CONFIGS[viewIndex];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#070B14",
        position: "relative",
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 3D WebGL Arena with dynamic camera per frame */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: currentView.position,
          fov: currentView.fov,
          near: 0.1,
          far: 50,
        }}
      >
        <InspectorCameraController
          position={currentView.position}
          target={currentView.target}
          fov={currentView.fov}
        />
        <TestingBayEnvironment />
        <ContactShadows position={[0, -1.05, 0]} opacity={0.85} scale={5.5} blur={1.8} far={3.0} />
        <Grid position={[0, -1.04, 0]} args={[8, 8]} cellColor="#334155" sectionColor="#64748B" />
        <group position={modelCenter}>{children}</group>
      </ThreeCanvas>

      {/* Technical HUD Overlay */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
        }}
      >
        <span
          style={{
            background: currentView.badgeColor,
            color: "#000",
            fontSize: 13,
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: 6,
            letterSpacing: 0.8,
            boxShadow: `0 0 20px ${currentView.badgeColor}66`,
          }}
        >
          {currentView.name}
        </span>
        <span
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid #334155",
            color: "#94A3B8",
            fontSize: 12,
            fontFamily: "monospace",
            padding: "4px 10px",
            borderRadius: 6,
          }}
        >
          {currentView.badge} | Camera [{currentView.position.join(", ")}]
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 24,
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid #334155",
          padding: "6px 14px",
          borderRadius: 8,
          color: "#E2E8F0",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {title}
      </div>
    </div>
  );
};
