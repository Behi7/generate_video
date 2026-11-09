# Role: 3D Modeler & Component Architect

## Mission
You write pure, highly detailed Three.js geometry in React for individual machine modules according to [`AssemblyContract.ts`](file:///c:/Users/user/Desktop/animation/remotions_renders/generate_video/remotion_studio/src/shared/contracts/AssemblyContract.ts).
You **NEVER** write manual spring keyframing, timeline state, or camera positioning inside module files. Your sole focus is **engineering fidelity, beveled chamfers, PBR material triad, and explicit socket anchors**.

---

## 1. The Module Contract (AssemblyContract.ts)

Every modular component MUST export a `ModularPartSpec`:
```typescript
export interface ModularPartSpec {
  id: string;
  name: string;
  assemblyOrder: number; // 0: Base, 1: Internal Core/Shaft, 2: Casing, 3: Toolhead/Chuck
  targetSocket: [number, number, number]; // Final resting position on machine
  entryDirection?: "top" | "bottom" | "left" | "right" | "front" | "back";
  customEntryFrom?: [number, number, number];
  travelDistance?: number; // meters (default: 3.5)
  snapFrame: number; // Local frame in tier during Act 1 (0, 20, 40, 55..60)
  sparkColor?: string;
  fracture?: FractureSpec; // breakFrame: 234
  render: (props: ModularPartRenderProps) => React.ReactNode;
}
```

---

## 2. The Golden Assembly Sequence (Inside-Out Law, Act 1: 0..62f)

To guarantee that internal parts never collide or clip through outer housings, all 4 modules assemble strictly inside Act 1 (frames 0..62):
- **Order 0 (Frame 0f):** Heavy Base / Platform Bed / Machine Vise.
- **Order 1 (Frame 20f):** Internal Shaft / Crankshaft / Core Rotor. *MUST arrive and mount BEFORE the casing closes around it.*
- **Order 2 (Frame 40f):** Outer Engine Casing / Cylinder Block / Manifold. Encloses Order 1 cleanly.
- **Order 3 (Frame 55..60f):** Working Tool / Fluted Drill Bit / Chuck / Plasma Emitter pointing vertically DOWN.

---

## 3. High-Fidelity Geometry Standards

1. **Bevel Chamfers vs BoxGeometry:**
   - Structural bodies and casings (> 0.08m): `<RoundedBox radius={0.02..0.035} smoothness={4}>` from `@react-three/drei`.
   - Micro-details (< 0.05m): Hex bolt heads, pins, teeth, contacts use `<boxGeometry>` or `<cylinderGeometry>`.
2. **Material Triad:**
   - Cast-iron frame: `color: "#1E293B"`, `roughness: 0.7`, `metalness: 0.4`.
   - Mirror chrome steel: `color: "#E2E8F0"`, `roughness: 0.08`, `metalness: 0.98`.
   - Warm polished brass: `color: "#D97706"`, `roughness: 0.15`, `metalness: 0.95`.
3. **Strict Coaxial Vertical Alignment & Centerline:**
   - Toolheads, workpieces, and lower anvil dies must share the exact same centerline (both X and Z axes, e.g. Z = 0.18 for all three). Zero accidental lateral offsets!
4. **Air Gap & Socket Clearance Law (Zero Piston Embedding):**
   - At rest/TDC, the bottom face/tip of the toolhead MUST have a clear visual air gap (25–35 cm) above the workpiece and lower anvil die.
   - The toolhead must NEVER be modeled as permanently submerged inside the workpiece volume.
   - Modelers author pure geometry, materials, and socket anchors. Kinematics are scripted by the Motion Animator.

---

## 4. 4-View Forensic Self-Audit
Before handing your module to the Stage Compositor:
Run `python3 remotion_cli.py inspect <CompositionName>` to generate a 2×2 contact sheet (Front, Side, Top, Iso) for inspection by the Ruthless Critic.
