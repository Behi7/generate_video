import React, { useMemo } from "react";
import * as THREE from "three";

export interface ScatteredHardwareProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  count?: number;
}

// Calibrated Workshop Steel Materials
const MATERIALS = {
  blackenedOxide: {
    color: "#1E293B",
    metalness: 0.82,
    roughness: 0.4,
  },
  galvanizedSilver: {
    color: "#94A3B8",
    metalness: 0.92,
    roughness: 0.25,
  },
  innerCavity: {
    color: "#0B0F19",
    metalness: 0.3,
    roughness: 0.8,
  },
};

/** High-Detail Heavy M16/M20 Industrial Hex Head Flanged Bolt */
const HexBolt: React.FC<{
  finish: "blackened" | "galvanized";
  shankRadius?: number;
  shankLength?: number;
}> = ({ finish, shankRadius = 0.009, shankLength = 0.048 }) => {
  const mat = finish === "blackened" ? MATERIALS.blackenedOxide : MATERIALS.galvanizedSilver;
  const headRadius = shankRadius * 1.65;
  const headHeight = shankRadius * 1.15;
  const flangeRadius = shankRadius * 1.95;
  const flangeThickness = 0.002;

  // Number of helical thread ridges
  const threadCount = 9;
  const threadSpacing = (shankLength * 0.65) / threadCount;

  return (
    <group>
      {/* 1. Hexagonal Bolt Head */}
      <mesh position={[0, headHeight / 2, 0]}>
        <cylinderGeometry args={[headRadius, headRadius, headHeight, 6]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* 2. Top Hex Head Chamfer / Crown */}
      <mesh position={[0, headHeight + 0.0008, 0]}>
        <cylinderGeometry
          args={[headRadius * 0.88, headRadius, 0.0016, 6]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* 3. Flanged Collar Washer directly below hex head */}
      <mesh position={[0, -flangeThickness / 2, 0]}>
        <cylinderGeometry
          args={[flangeRadius, flangeRadius, flangeThickness, 24]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* 4. Smooth Grip Shank Section */}
      <mesh position={[0, -flangeThickness - shankLength * 0.18, 0]}>
        <cylinderGeometry
          args={[shankRadius, shankRadius, shankLength * 0.35, 16]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* 5. Threaded Shank Section */}
      <mesh
        position={[
          0,
          -flangeThickness - shankLength * 0.35 - (shankLength * 0.65) / 2,
          0,
        ]}
      >
        <cylinderGeometry
          args={[shankRadius * 0.95, shankRadius * 0.95, shankLength * 0.65, 16]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* 6. Thread Ridges (Machine Thread Pitch) */}
      {Array.from({ length: threadCount }).map((_, i) => (
        <mesh
          key={i}
          position={[
            0,
            -flangeThickness - shankLength * 0.35 - (i + 0.5) * threadSpacing,
            0,
          ]}
        >
          <cylinderGeometry
            args={[shankRadius * 1.02, shankRadius * 1.02, threadSpacing * 0.45, 16]}
          />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}

      {/* 7. Rounded/Chamfered Bolt Point Tip */}
      <mesh
        position={[0, -flangeThickness - shankLength - 0.0015, 0]}
      >
        <cylinderGeometry
          args={[shankRadius * 0.95, shankRadius * 0.7, 0.003, 16]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
};

/** Precision Industrial Chamfered Hex Nut with Hollow Core */
const HexNut: React.FC<{
  finish: "blackened" | "galvanized";
  radius?: number;
  height?: number;
}> = ({ finish, radius = 0.016, height = 0.014 }) => {
  const mat = finish === "blackened" ? MATERIALS.blackenedOxide : MATERIALS.galvanizedSilver;
  const innerRadius = radius * 0.58;

  // Hollow hex nut geometry via 2D Shape extrusion with hole
  const nutGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    // Center hole
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    return new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.0015,
      bevelSize: 0.0012,
      bevelSegments: 2,
    });
  }, [radius, innerRadius, height]);

  return (
    <group>
      <mesh geometry={nutGeometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Dark internal thread cavity */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[innerRadius * 0.96, innerRadius * 0.96, height * 0.98, 16, 1, true]} />
        <meshStandardMaterial {...MATERIALS.innerCavity} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Stamped Steel Flat Washer */
const FlatWasher: React.FC<{
  finish: "blackened" | "galvanized";
  outerRadius?: number;
  innerRadius?: number;
  thickness?: number;
}> = ({
  finish,
  outerRadius = 0.017,
  innerRadius = 0.0095,
  thickness = 0.0025,
}) => {
  const mat = finish === "blackened" ? MATERIALS.blackenedOxide : MATERIALS.galvanizedSilver;

  const washerGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.0004,
      bevelSize: 0.0004,
      bevelSegments: 1,
    });
  }, [outerRadius, innerRadius, thickness]);

  return (
    <mesh geometry={washerGeometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial {...mat} />
    </mesh>
  );
};

/** Split-Ring Spring Lock Washer with Helical Offset */
const SplitLockWasher: React.FC<{
  finish: "blackened" | "galvanized";
  ringRadius?: number;
  tubeRadius?: number;
}> = ({ finish, ringRadius = 0.013, tubeRadius = 0.0022 }) => {
  const mat = finish === "blackened" ? MATERIALS.blackenedOxide : MATERIALS.galvanizedSilver;

  return (
    <group>
      {/* Split helical torus ring (330 degrees circumference) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[ringRadius, tubeRadius, 8, 24, Math.PI * 1.84]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Spring offset sharp sheared cut tips */}
      <mesh
        position={[
          ringRadius * Math.cos(Math.PI * 1.84),
          0.0018,
          ringRadius * Math.sin(Math.PI * 1.84),
        ]}
      >
        <cylinderGeometry
          args={[tubeRadius * 0.98, tubeRadius * 0.98, 0.0012, 8]}
        />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
};

/**
 * Natural Floor Scatter of Industrial Fastener Hardware:
 * Organic pile of heavy bolts, hex nuts, flat washers, and spring lock washers.
 * Grounded on Y = 0 with physics-plausible resting positions and slight random orientations.
 */
export const ScatteredHardware: React.FC<ScatteredHardwareProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  count = 12,
}) => {
  const normalizedScale: [number, number, number] = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  // 12 handcrafted, physics-plausible resting pieces in an organic floor cluster
  const items = useMemo(
    () => [
      // 0. Heavy M20 Bolt lying sideways on floor (Galvanized Silver)
      {
        id: "bolt-0",
        component: (
          <group
            position={[0.06, 0.0175, 0.02]}
            rotation={[0, 0.52, Math.PI / 2]}
          >
            <HexBolt
              finish="galvanized"
              shankRadius={0.01}
              shankLength={0.056}
            />
          </group>
        ),
      },

      // 1. Hex Nut lying flat on floor (Blackened Oxide)
      {
        id: "nut-1",
        component: (
          <group position={[-0.08, 0, 0.05]} rotation={[0, 0.35, 0]}>
            <HexNut finish="blackened" radius={0.016} height={0.014} />
          </group>
        ),
      },

      // 2. Stamped Flat Washer flat on floor (Galvanized Silver)
      {
        id: "washer-2",
        component: (
          <group position={[-0.05, 0, -0.06]} rotation={[0, 1.1, 0]}>
            <FlatWasher
              finish="galvanized"
              outerRadius={0.018}
              innerRadius={0.01}
              thickness={0.0028}
            />
          </group>
        ),
      },

      // 3. Heavy M16 Bolt lying sideways (Blackened Oxide)
      {
        id: "bolt-3",
        component: (
          <group
            position={[-0.04, 0.015, 0.09]}
            rotation={[0, -1.2, Math.PI / 2]}
          >
            <HexBolt finish="blackened" shankRadius={0.0085} shankLength={0.048} />
          </group>
        ),
      },

      // 4. Split-Ring Lock Washer flat on floor (Galvanized Silver)
      {
        id: "lock-4",
        component: (
          <group position={[0.04, 0.0025, -0.07]} rotation={[0, 0.8, 0]}>
            <SplitLockWasher finish="galvanized" ringRadius={0.013} />
          </group>
        ),
      },

      // 5. Hex Nut leaning tilted (22 deg) against Bolt 0 shank (Galvanized Silver)
      {
        id: "nut-5",
        component: (
          <group
            position={[0.095, 0.005, 0.035]}
            rotation={[0.38, 0.15, -0.32]}
          >
            <HexNut finish="galvanized" radius={0.015} height={0.013} />
          </group>
        ),
      },

      // 6. Flat Washer overlapping slightly on edge of Washer 2 (Blackened Oxide)
      {
        id: "washer-6",
        component: (
          <group position={[-0.035, 0.0028, -0.065]} rotation={[0.04, -0.4, 0]}>
            <FlatWasher
              finish="blackened"
              outerRadius={0.016}
              innerRadius={0.009}
              thickness={0.0025}
            />
          </group>
        ),
      },

      // 7. Heavy M20 Bolt lying angled (Blackened Oxide)
      {
        id: "bolt-7",
        component: (
          <group
            position={[0.13, 0.0175, -0.04]}
            rotation={[0, 2.15, Math.PI / 2]}
          >
            <HexBolt
              finish="blackened"
              shankRadius={0.0095}
              shankLength={0.052}
            />
          </group>
        ),
      },

      // 8. Hex Nut lying flat on floor (Blackened Oxide)
      {
        id: "nut-8",
        component: (
          <group position={[-0.12, 0, -0.01]} rotation={[0, -0.65, 0]}>
            <HexNut finish="blackened" radius={0.017} height={0.015} />
          </group>
        ),
      },

      // 9. Split-Ring Lock Washer on floor (Blackened Oxide)
      {
        id: "lock-9",
        component: (
          <group position={[0.08, 0.0025, 0.11]} rotation={[0, -1.8, 0]}>
            <SplitLockWasher finish="blackened" ringRadius={0.012} />
          </group>
        ),
      },

      // 10. Heavy M16 Bolt with head rested on Flat Washer 11 (Galvanized Silver)
      {
        id: "bolt-10",
        component: (
          <group
            position={[-0.01, 0.016, -0.12]}
            rotation={[0.05, -2.45, Math.PI / 2]}
          >
            <HexBolt
              finish="galvanized"
              shankRadius={0.0085}
              shankLength={0.045}
            />
          </group>
        ),
      },

      // 11. Stamped Flat Washer flat on floor (Galvanized Silver)
      {
        id: "washer-11",
        component: (
          <group position={[0.14, 0, 0.07]} rotation={[0, 0.9, 0]}>
            <FlatWasher
              finish="galvanized"
              outerRadius={0.019}
              innerRadius={0.0105}
              thickness={0.0028}
            />
          </group>
        ),
      },
    ],
    []
  );

  const displayCount = Math.min(items.length, Math.max(1, count));
  const visibleItems = items.slice(0, displayCount);

  return (
    <group position={position} rotation={rotation} scale={normalizedScale}>
      {visibleItems.map((item) => (
        <React.Fragment key={item.id}>{item.component}</React.Fragment>
      ))}
    </group>
  );
};
