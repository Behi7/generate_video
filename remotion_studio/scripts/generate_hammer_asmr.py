#!/usr/bin/env python3
"""
generate_hammer_asmr.py
Procedural Foley ASMR Master Composer for HammerProgression in remotion_studio.
Uses real CC0 WAV foley samples from public/audio/foley/ to assemble a
1160-frame (38.6667s @ 30 FPS) 44.1 kHz 16-bit PCM stereo master track.

Strictly follows The Pure ASMR Law:
- ZERO synthetic sine waves allowed!
- 100% Real CC0 Studio Foley Assets.
- True peak target: -1.0 dBFS.
- Synchronized across 4 distinct Progression Tiers:
  * Tier 1 (0..289f): Wood bed drop (0f), switch clicks (20f, 40f, 60f, 75f),
    crank creak loop (85..140f), rhythmic manual hammer impacts on workpiece
    (150..249f, interval ~12-14 frames, sharp wooden/metal thuds),
    wooden arm fracture & gear shear at 265f.
  * Tier 2 (290..579f): Heavy metal drop (290f), locks & switches (310f, 330f, 350f, 365f),
    electric motor spool (375..440f), rhythmic rapid drop hammer strikes
    (440..540f, interval ~8-10 frames, resonant metallic clangs),
    belt rupture & motor blowout at 555f.
  * Tier 3 (580..869f): Heavy plate seismic landing (580f), locks & switches (600f, 620f, 640f, 655f),
    hydraulic valve switch (660f), hydraulic pump hum (665..730f),
    heavy industrial drop hammer BOOMS (730..830f, interval ~10-12 frames, deep bass impacts with metal ringing),
    600-bar blowout blast at 845f.
  * Tier 4 (870..1159f): Sci-fi force field dock (870f), toroid locks (890f, 910f, 930f, 945f),
    laser accelerator spool (955..1020f), supersonic kinetic rail impact pulses
    (1020..1120f, interval ~8 frames, heavy sub-bass thump + laser transient),
    spacetime singularity pinch collapse shockwave at 1135f.
"""

import os
import sys
import numpy as np

# Ensure scripts dir is on sys.path across modular and root scripts
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
potential_dirs = [
    SCRIPT_DIR,
    os.path.abspath(os.path.join(SCRIPT_DIR, "../../../../scripts")),
    os.path.abspath(os.path.join(SCRIPT_DIR, "../../../scripts")),
    os.path.abspath(os.path.join(SCRIPT_DIR, "../../scripts")),
    os.path.abspath(os.path.join(SCRIPT_DIR, "../scripts")),
]
for p in potential_dirs:
    if os.path.exists(os.path.join(p, "compose_asmr.py")) and p not in sys.path:
        sys.path.insert(0, p)
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from compose_asmr import ASMRMixer, STUDIO_DIR, SAMPLE_RATE, FPS, TOTAL_FRAMES

def generate_hammer_asmr_track(out_wav=None, bom_json=None):
    if out_wav is None:
        out_wav = os.path.join(STUDIO_DIR, "public", "audio", "asmr_hammer_progression.wav")
    if bom_json is None:
        bom_json = os.path.join(STUDIO_DIR, "public", "audio", "asmr_hammer_bom.json")

    mixer = ASMRMixer()

    # =========================================================================
    # --- TIER 1 ($10 Manual Sledge / Claw Hammer, Frames 0..289) ---
    # =========================================================================

    # Act 1: Assembly Snaps & Contacts (0..79f)
    # Frame 0: Rough Cast-Iron Anvil & Timber Bed Drop
    mixer.add_event("materials/wood", 0, "impact_wood_heavy_000.wav", gain_db=3.5, pan=0.0, desc="Tier 1 Anvil Timber Bed Drop")
    mixer.add_event("materials/wood", 0, "impact_plank_medium_000.wav", gain_db=1.0, pan=-0.15, desc="Tier 1 Timber Bed Settle Resonance")
    mixer.add_event("impacts/locks", 0, "drop_001.wav", gain_db=-1.5, pan=0.1, desc="Tier 1 Heavy Mass Dock Thud")

    # Frame 20: Module 1 - Hardwood Ash Shaft Core Snap
    mixer.add_event("mechanisms/switches", 20, "click_001.wav", gain_db=2.0, pan=-0.2, desc="Tier 1 Ash Shaft Socket Click")
    mixer.add_event("materials/wood", 20, "impact_plank_medium_001.wav", gain_db=1.0, pan=-0.15, desc="Tier 1 Ash Shaft Seat Thud")

    # Frame 40: Module 2 - Forged Steel Collar Clamp
    mixer.add_event("mechanisms/switches", 40, "switch_001.wav", gain_db=2.0, pan=0.2, desc="Tier 1 Collar Clamp Latch")
    mixer.add_event("materials/metal", 40, "impact_metal_light_000.wav", gain_db=0.5, pan=0.15, desc="Tier 1 Collar Metallic Seat")

    # Frame 60: Module 3 - Cross-Peen Fixing Wedge Latch
    mixer.add_event("mechanisms/switches", 60, "click_002.wav", gain_db=2.5, pan=-0.1, desc="Tier 1 Fixing Wedge Clack")
    mixer.add_event("materials/metal", 60, "impact_plate_light_001.wav", gain_db=1.0, pan=-0.1, desc="Tier 1 Wedge Steel Friction Seat")

    # Frame 75: Module 4 - Toolhead Lock & Trigger Engage
    mixer.add_event("mechanisms/switches", 75, "toggle_001.wav", gain_db=3.0, pan=0.0, desc="Tier 1 Trigger Mechanism Toggle")
    mixer.add_event("materials/metal", 75, "impact_metal_medium_000.wav", gain_db=2.0, pan=0.05, desc="Tier 1 High-Carbon Sledge Head Lock")

    # Act 2: Manual Crank Creak / Straining Winding Buildup (85..140f)
    crank_frames = [85, 96, 107, 118, 128, 138]
    wood_creaks = [
        ("impact_wood_light_000.wav", -1.0, -1.0),
        ("impact_plank_medium_002.wav", 0.5, -2.0),
        ("impact_wood_light_001.wav", -0.5, -1.5),
        ("impact_plank_medium_003.wav", 1.0, -1.5),
        ("impact_wood_light_002.wav", 1.5, -1.0),
        ("impact_plank_medium_004.wav", 2.0, -0.5),
    ]
    ticks = ["tick_001.wav", "tick_002.wav", "tick_004.wav", "tick_001.wav", "tick_002.wav", "switch_002.wav"]
    for i, f in enumerate(crank_frames):
        sample, semi, gain = wood_creaks[i]
        pan = -0.2 if i % 2 == 0 else 0.2
        mixer.add_event("materials/wood", f, sample, semitones=semi, gain_db=gain, pan=pan, desc=f"Tier 1 Manual Crank Creak {i+1}")
        mixer.add_event("mechanisms/switches", f, ticks[i], gain_db=gain - 0.5, pan=pan * 0.5, desc=f"Tier 1 Ratchet Tick {i+1}")

    # Act 3: Rhythmic Manual Hammer Impacts on Workpiece (160..220f)
    # Exact 3D kinematic contact frames: (localFrame - 150) % 12 === 10
    t1_strikes = [160, 172, 184, 196, 208, 220]
    for idx, f in enumerate(t1_strikes):
        wood_idx = idx % 5
        metal_idx = idx % 5
        pan = 0.18 if idx % 2 == 0 else -0.18
        progress = idx / len(t1_strikes)
        gain_boost = progress * 1.5  # Dynamic building intensity

        # Layer A: Heavy wooden handle recoil & thud
        mixer.add_event(
            "materials/wood", f, f"impact_wood_heavy_{wood_idx:03d}.wav",
            semitones=(idx % 3) - 1.0, gain_db=2.5 + gain_boost, pan=pan,
            desc=f"Tier 1 Hammer Strike {idx+1} (Wooden Thud)"
        )
        # Layer B: Sharp metallic anvil/workpiece impact
        mixer.add_event(
            "materials/metal", f, f"impact_tin_medium_{metal_idx:03d}.wav",
            semitones=(idx % 2) * 1.5, gain_db=1.0 + gain_boost, pan=pan * 0.8,
            desc=f"Tier 1 Hammer Strike {idx+1} (Metal Ring)"
        )
        # Layer C: Workpiece deformation / splinter chip
        mixer.add_event(
            "materials/wood", f + 1, f"impact_wood_light_{wood_idx:03d}.wav",
            semitones=2.0, gain_db=-1.5 + gain_boost, pan=-pan * 0.5,
            desc=f"Tier 1 Hammer Strike {idx+1} (Debris Chip)"
        )

    # Act 4: Overload Fracture (265f)
    mixer.add_event("materials/wood", 265, "impact_wood_heavy_003.wav", semitones=2.0, gain_db=5.5, pan=-0.1, desc="Tier 1 Wooden Arm Fracture Snap")
    mixer.add_event("materials/wood", 265, "impact_plank_medium_004.wav", semitones=-1.0, gain_db=4.5, pan=0.15, desc="Tier 1 Hardwood Splinter Burst")
    mixer.add_event("materials/metal", 266, "impact_tin_medium_002.wav", semitones=-2.0, gain_db=3.5, pan=-0.2, desc="Tier 1 Gear Shear Clatter")
    mixer.add_event("impacts/locks", 268, "drop_002.wav", gain_db=2.0, pan=0.25, desc="Tier 1 Broken Head Anvil Bounce")


    # =========================================================================
    # --- TIER 2 ($100 Electric Rotary Jackhammer, Frames 290..579) ---
    # =========================================================================

    # Act 1: Assembly Snaps & Contacts (290..369f)
    # Frame 290: Heavy Stamping Base Mount & Clamping Jig Drop
    mixer.add_event("materials/metal", 290, "impact_metal_heavy_000.wav", gain_db=4.0, pan=0.0, desc="Tier 2 Stamping Base Drop")
    mixer.add_event("impacts/locks", 290, "door_close_000.wav", gain_db=2.5, pan=-0.1, desc="Tier 2 Heavy Metal Dock Thud")
    mixer.add_event("materials/metal", 290, "impact_plate_heavy_000.wav", gain_db=2.0, pan=0.1, desc="Tier 2 Cast Bed Resonance")

    # Frame 310: Module 1 - Copper Wound Stator & Armature Rotor Dock
    mixer.add_event("mechanisms/switches", 310, "click_003.wav", gain_db=2.0, pan=-0.2, desc="Tier 2 Armature Rotor Click")
    mixer.add_event("materials/metal", 310, "impact_plate_medium_000.wav", gain_db=1.0, pan=-0.15, desc="Tier 2 Rotor Stator Magnetic Settle")

    # Frame 330: Module 2 - High-Impact Cast Aluminum Gear Casing Latch
    mixer.add_event("impacts/locks", 330, "door_close_001.wav", gain_db=3.0, pan=0.2, desc="Tier 2 Gear Casing Heavy Latch")
    mixer.add_event("mechanisms/switches", 330, "switch_002.wav", gain_db=2.0, pan=0.15, desc="Tier 2 Aluminum Casing Clamp Snap")

    # Frame 350: Module 3 - Eccentric Crank & Pneumatic Striker Piston Dock
    mixer.add_event("mechanisms/switches", 350, "switch_005.wav", gain_db=1.5, pan=-0.1, desc="Tier 2 Crank Piston Latch")
    mixer.add_event("materials/metal", 350, "impact_plate_medium_000.wav", gain_db=1.0, pan=-0.1, desc="Tier 2 Striker Piston Mechanical Seat")

    # Frame 365: Module 4 - SDS-Max Bull-Point Chisel Lock
    mixer.add_event("mechanisms/switches", 365, "click_004.wav", gain_db=2.0, pan=0.0, desc="Tier 2 SDS-Max Chisel Ball-Detent Lock")
    mixer.add_event("materials/metal", 365, "impact_metal_light_002.wav", gain_db=1.5, pan=0.05, desc="Tier 2 Chisel High-Tensile Steel Ping")

    # Act 2: Electric Motor Spool-Up (370..439f)
    # Frame 370: Power switch engage
    mixer.add_event("mechanisms/switches", 370, "switch_004.wav", gain_db=2.5, pan=0.0, desc="Tier 2 Industrial Power Switch Clack")

    # Frames 375..440: Electric motor spooling up (calibrated spacing & anti-aliasing)
    spool_frames = list(range(375, 440, 14))
    for i, f in enumerate(spool_frames):
        ratio = i / (len(spool_frames) - 1)
        semi = -2.0 + ratio * 4.0  # Semitones from -2 to +2 (avoids ultrasonic crackle)
        gain = -6.0 + ratio * 3.0  # Smooth background hum ramping from -6 dB to -3 dB
        sample_idx = i % 5
        mixer.add_event(
            "mechanisms/motors", f, f"engine_circular_{sample_idx:03d}.wav",
            semitones=semi, gain_db=gain, pan=0.1 * ((i % 2) * 2 - 1),
            desc=f"Tier 2 Electric Motor Spool {i+1}"
        )

    # Act 3: Rhythmic Rapid Drop Hammer Strikes (446..510f)
    # Exact 3D kinematic contact frames: 290 + local ((localFrame - 150) % 8 === 6)
    t2_strikes = [446, 454, 462, 470, 478, 486, 494, 502, 510]
    for idx, f in enumerate(t2_strikes):
        s_idx = idx % 5
        pan = 0.22 if idx % 2 == 0 else -0.22
        progress = idx / len(t2_strikes)
        gain_boost = progress * 1.0

        # Layer A: Resonant heavy metallic drop hammer strike
        mixer.add_event(
            "materials/metal", f, f"impact_plate_heavy_{s_idx:03d}.wav",
            semitones=(idx % 3) - 1.0, gain_db=1.5 + gain_boost, pan=pan,
            desc=f"Tier 2 Jackhammer Strike {idx+1} (Heavy Clang)"
        )
        # Layer B: Controlled SDS chisel resonance ring
        mixer.add_event(
            "materials/metal", f, f"impact_plate_light_{s_idx:03d}.wav",
            semitones=0.5 + (idx % 2), gain_db=-2.5 + gain_boost, pan=pan * 0.7,
            desc=f"Tier 2 Jackhammer Strike {idx+1} (Chisel Ring)"
        )
        # Layer C: Pneumatic piston slap
        mixer.add_event(
            "materials/metal", f, f"impact_metal_light_{s_idx:03d}.wav",
            semitones=0.0, gain_db=-3.0 + gain_boost, pan=-pan * 0.5,
            desc=f"Tier 2 Jackhammer Strike {idx+1} (Piston Slap)"
        )
        # Layer D: Hot glowing copper billet deformation clink
        mixer.add_event(
            "materials/metal", f + 1, f"impact_plate_medium_{s_idx:03d}.wav",
            semitones=1.0, gain_db=-2.0 + gain_boost, pan=pan * 0.3,
            desc=f"Tier 2 Jackhammer Strike {idx+1} (Forging Clink)"
        )

    # Act 4: Overload Fracture (555f)
    mixer.add_event("materials/metal", 555, "impact_metal_heavy_002.wav", semitones=1.0, gain_db=3.5, pan=-0.15, desc="Tier 2 Drive Belt Rupture Snap")
    mixer.add_event("impacts/explosions", 555, "explosion_crunch_000.wav", semitones=-1.0, gain_db=2.5, pan=0.1, desc="Tier 2 Armature Electrical Blowout")
    mixer.add_event("materials/metal", 556, "impact_plate_light_004.wav", semitones=3.0, gain_db=1.0, pan=0.3, desc="Tier 2 High-Velocity Shrapnel Ping")
    mixer.add_event("mechanisms/motors", 557, "engine_circular_003.wav", semitones=-6.0, gain_db=-4.5, pan=-0.2, desc="Tier 2 Motor Stalling Groan")


    # =========================================================================
    # --- TIER 3 ($1,000 Industrial Hydraulic Power Hammer, Frames 580..869) ---
    # =========================================================================

    # Act 1: Assembly Snaps & Contacts (580..659f)
    # Frame 580: Heavy Plate Monolithic H-Frame Bed Seismic Landing
    mixer.add_event("materials/metal", 580, "impact_plate_heavy_001.wav", gain_db=5.5, pan=0.0, desc="Tier 3 H-Frame Bed Seismic Landing")
    mixer.add_event("materials/metal", 580, "impact_metal_heavy_003.wav", gain_db=4.5, pan=0.1, desc="Tier 3 Massive Anvil Base Shock")
    mixer.add_event("materials/stone", 580, "footstep_concrete_000.wav", gain_db=2.5, pan=-0.1, desc="Tier 3 Foundation Concrete Thud")

    # Frame 600: Module 1 - Chrome Plated Hydraulic Cylinder & Ram Dock
    mixer.add_event("materials/metal", 600, "impact_metal_heavy_001.wav", gain_db=3.0, pan=-0.2, desc="Tier 3 Chrome Cylinder Dock")
    mixer.add_event("impacts/locks", 600, "door_close_002.wav", gain_db=2.5, pan=-0.15, desc="Tier 3 Hydraulic Seal Lock")

    # Frame 620: Module 2 - Twin Column Heavy Steel Press Gantry Latch
    mixer.add_event("materials/metal", 620, "impact_plate_heavy_002.wav", gain_db=3.5, pan=0.2, desc="Tier 3 Press Gantry Heavy Settle")
    mixer.add_event("mechanisms/switches", 620, "switch_005.wav", gain_db=2.5, pan=0.15, desc="Tier 3 Gantry Column Clamp Latch")

    # Frame 640: Module 3 - High-Pressure Hydraulic Valve Manifold & Braided Hoses
    mixer.add_event("mechanisms/switches", 640, "switch_006.wav", gain_db=3.0, pan=-0.15, desc="Tier 3 Valve Manifold Coupler Lock")
    mixer.add_event("materials/metal", 640, "impact_metal_light_003.wav", gain_db=2.0, pan=-0.1, desc="Tier 3 Braided Hose Metal Fitting Snap")

    # Frame 655: Module 4 - Hardened Tool Steel Flat Forging Die Ram
    mixer.add_event("materials/metal", 655, "impact_plate_heavy_003.wav", gain_db=4.0, pan=0.0, desc="Tier 3 Tool Steel Forging Die Seat")
    mixer.add_event("mechanisms/switches", 655, "click_005.wav", gain_db=3.0, pan=0.05, desc="Tier 3 Die Keyway Lock Snap")

    # Act 2: 500-Bar Hydraulic Spool & Pump Hum (660..729f)
    # Frame 660: Heavy Hydraulic Valve Switch
    mixer.add_event("mechanisms/switches", 660, "switch_001.wav", gain_db=4.0, pan=0.0, desc="Tier 3 Heavy Hydraulic Valve Clack")
    mixer.add_event("materials/metal", 660, "impact_plate_medium_001.wav", gain_db=2.5, pan=0.1, desc="Tier 3 Valve Detent Ring")

    # Frames 665..730: Hydraulic pump spooling up (spaced intervals, clean hydraulic drone)
    pump_frames = list(range(665, 730, 16))
    for i, f in enumerate(pump_frames):
        ratio = i / (len(pump_frames) - 1)
        semi = 0.0 + ratio * 2.0   # Semitones from 0.0 to +2.0
        gain = -5.0 + ratio * 2.5   # Gain from -5.0 to -2.5 dB (clean background drone)
        sample_idx = i % 5
        mixer.add_event(
            "mechanisms/motors", f, f"space_engine_low_{sample_idx:03d}.wav",
            semitones=semi, gain_db=gain, pan=0.12 * ((i % 2) * 2 - 1),
            desc=f"Tier 3 Hydraulic Pump Hum {i+1}"
        )

    # Act 3: Heavy Industrial Drop Hammer BOOMS (748..792f)
    # Exact 3D kinematic contact frames: 580 + local ((localFrame - 150) % 22 === 18 or 19)
    t3_strikes = [748, 770, 792]
    t3_booms = t3_strikes
    for idx, f in enumerate(t3_strikes):
        s_idx = idx % 5
        pan = 0.2 if idx % 2 == 0 else -0.2
        progress = idx / len(t3_booms)
        gain_boost = progress * 1.0

        # Layer A: Seismic sub-bass hammer boom (punchy, clean, zero clipping)
        mixer.add_event(
            "materials/metal", f, f"impact_metal_heavy_{s_idx:03d}.wav",
            semitones=-2.0 + (idx % 2), gain_db=1.8 + gain_boost, pan=pan,
            desc=f"Tier 3 Drop Hammer Boom {idx+1} (Seismic Sub)"
        )
        # Layer B: Hardened anvil plate heavy metallic ringing
        mixer.add_event(
            "materials/metal", f, f"impact_plate_heavy_{s_idx:03d}.wav",
            semitones=(idx % 3) * 0.5, gain_db=0.0 + gain_boost, pan=pan * 0.8,
            desc=f"Tier 3 Drop Hammer Boom {idx+1} (Plate Ring)"
        )
        # Layer C: Forging billet deformation & hot scale crunch
        mixer.add_event(
            "materials/stone", f + 1, f"impact_mining_{s_idx:03d}.wav",
            semitones=0.0, gain_db=-2.0 + gain_boost, pan=-pan * 0.5,
            desc=f"Tier 3 Drop Hammer Boom {idx+1} (Billet Deformation)"
        )
        # Layer D: Controlled hydraulic impulse transient
        mixer.add_event(
            "impacts/explosions", f, f"explosion_crunch_{s_idx:03d}.wav",
            semitones=1.5, gain_db=-2.5 + gain_boost, pan=pan * 0.3,
            desc=f"Tier 3 Drop Hammer Boom {idx+1} (Impulse Transient)"
        )

    # Act 4: 600-Bar Hydraulic Blowout Blast (845f)
    mixer.add_event("impacts/explosions", 845, "explosion_crunch_001.wav", semitones=0.0, gain_db=3.5, pan=0.0, desc="Tier 3 600-Bar Hydraulic Hose Blowout")
    mixer.add_event("mechanisms/motors", 845, "thruster_fire_000.wav", semitones=2.0, gain_db=1.5, pan=-0.2, desc="Tier 3 High-Pressure Fluid Jet Hiss")
    mixer.add_event("materials/metal", 846, "impact_plate_heavy_002.wav", semitones=1.0, gain_db=2.0, pan=0.25, desc="Tier 3 Sheared Forging Die Ricochet")
    mixer.add_event("materials/metal", 847, "impact_tin_medium_004.wav", semitones=-1.0, gain_db=0.5, pan=-0.15, desc="Tier 3 Machine Frame Shock Ring")


    # =========================================================================
    # --- TIER 4 ($100,000+ Quantum Kinetic Rail-Hammer, Frames 870..1159) ---
    # =========================================================================

    # Act 1: Assembly Snaps & Docking (870..954f)
    # Frame 870: Sci-Fi Zero-G Magnetic Base Bed Force Field Dock
    mixer.add_event("mechanisms/scifi_laser", 870, "force_field_000.wav", gain_db=2.5, pan=0.0, desc="Tier 4 Zero-G Maglev Base Force Field Dock")
    mixer.add_event("mechanisms/scifi_laser", 870, "force_field_001.wav", gain_db=1.5, pan=-0.15, desc="Tier 4 Superconducting Flux Settle")
    mixer.add_event("impacts/locks", 870, "door_close_000.wav", gain_db=1.0, pan=0.1, desc="Tier 4 Sub-Spatial Bed Plinth Dock")

    # Frame 890: Module 1 - Electromagnetic Linear Rail Cores Dock
    mixer.add_event("mechanisms/scifi_laser", 890, "laser_large_000.wav", gain_db=2.0, pan=-0.2, desc="Tier 4 Rail Cores Alignment Beam")
    mixer.add_event("mechanisms/switches", 890, "toggle_002.wav", gain_db=1.5, pan=-0.15, desc="Tier 4 Linear Rail Magnetic Latch")

    # Frame 910: Module 2 - Titanium Exoskeleton Cryo-Cooling Jacket Latch
    mixer.add_event("impacts/locks", 910, "door_close_002.wav", gain_db=2.0, pan=0.2, desc="Tier 4 Cryo Jacket Hermetic Lock")
    mixer.add_event("mechanisms/scifi_laser", 910, "force_field_002.wav", gain_db=1.5, pan=0.15, desc="Tier 4 Cryo Containment Field Engage")

    # Frame 930: Module 3 - Toroidal Pulse Capacitors & Superconductors Lock
    mixer.add_event("mechanisms/scifi_laser", 930, "force_field_003.wav", gain_db=2.5, pan=-0.15, desc="Tier 4 Toroidal Capacitor Lock Pulse")
    mixer.add_event("mechanisms/switches", 930, "click_002.wav", gain_db=2.0, pan=-0.1, desc="Tier 4 Superconductor Bus Snap")

    # Frame 945: Module 4 - Tachyon Magnetic Slug Projectile Hammer Tip Lock
    mixer.add_event("materials/glass", 945, "impact_glass_heavy_000.wav", gain_db=2.0, pan=0.0, desc="Tier 4 Tachyon Slug Crystalline Seal")
    mixer.add_event("mechanisms/switches", 945, "toggle_003.wav", gain_db=1.5, pan=0.05, desc="Tier 4 Magnetic Breech Lock")

    # Act 2: Laser Accelerator Spool (950..1019f)
    # Frame 950: Quantum Trigger Engage
    mixer.add_event("mechanisms/switches", 950, "click_001.wav", gain_db=2.5, pan=0.0, desc="Tier 4 Quantum Trigger Engage Click")

    # Frames 955..1020: Accelerator charge spool (controlled layering, no wall of noise)
    accel_frames = list(range(955, 1020, 16))
    for i, f in enumerate(accel_frames):
        ratio = i / (len(accel_frames) - 1)
        semi = -1.0 + ratio * 4.0   # Clean pitch rise (-1 to +3)
        gain = -5.0 + ratio * 2.5   # Smooth ramp -5 to -2.5 dB
        sample_idx = i % 5
        mixer.add_event(
            "mechanisms/motors", f, f"space_engine_large_{sample_idx:03d}.wav",
            semitones=semi, gain_db=gain, pan=0.15 * ((i % 2) * 2 - 1),
            desc=f"Tier 4 Particle Accelerator Spool {i+1}"
        )
        if i % 2 == 0:
            mixer.add_event(
                "mechanisms/motors", f, f"thruster_fire_{sample_idx:03d}.wav",
                semitones=semi * 0.7, gain_db=gain - 2.5, pan=-0.15 * ((i % 2) * 2 - 1),
                desc=f"Tier 4 Plasma Arc Whine {i+1}"
            )

    # Act 3: Supersonic Kinetic Rail Impact Pulses (1030..1090f)
    # Exact 3D kinematic contact frames: 870 + local ((localFrame - 150) % 12 === 10)
    t4_strikes = [1030, 1042, 1054, 1066, 1078, 1090]
    t4_pulses = t4_strikes
    for idx, f in enumerate(t4_strikes):
        s_idx = idx % 5
        pan = 0.25 if idx % 2 == 0 else -0.25
        progress = idx / len(t4_pulses)
        gain_boost = progress * 1.0

        # Layer A: Heavy supersonic kinetic sub-bass thump (punchy & defined)
        mixer.add_event(
            "impacts/explosions", f, "low_frequency_explosion_000.wav",
            semitones=1.0 + (idx % 2), gain_db=2.0 + gain_boost, pan=pan,
            desc=f"Tier 4 Rail Pulse {idx+1} (Supersonic Sub Thump)"
        )
        # Layer B: Laser transient impact crack
        mixer.add_event(
            "mechanisms/scifi_laser", f, f"laser_large_{s_idx:03d}.wav",
            semitones=(idx % 3) * 1.5, gain_db=0.5 + gain_boost, pan=pan * 0.8,
            desc=f"Tier 4 Rail Pulse {idx+1} (Laser Transient)"
        )
        # Layer C: Ionized plasma discharge buzz
        mixer.add_event(
            "mechanisms/scifi_laser", f, f"force_field_{s_idx:03d}.wav",
            semitones=2.0, gain_db=-2.5 + gain_boost, pan=-pan * 0.6,
            desc=f"Tier 4 Rail Pulse {idx+1} (Plasma Arc)"
        )
        # Layer D: Quantum crystalline lattice shatter
        mixer.add_event(
            "materials/glass", f + 1, f"impact_glass_heavy_{s_idx:03d}.wav",
            semitones=1.0 + (idx % 2), gain_db=-1.5 + gain_boost, pan=pan * 0.4,
            desc=f"Tier 4 Rail Pulse {idx+1} (Crystalline Shatter)"
        )

    # Act 4: Spacetime Singularity Pinch Collapse Shockwave (1135f)
    mixer.add_event("impacts/explosions", 1135, "low_frequency_explosion_001.wav", semitones=0.0, gain_db=3.5, pan=0.0, desc="Tier 4 Singularity Pinch Shockwave Blast")
    mixer.add_event("mechanisms/scifi_laser", 1135, "laser_large_004.wav", semitones=2.0, gain_db=2.0, pan=-0.2, desc="Tier 4 Singularity Laser Annihilation Burst")
    mixer.add_event("materials/glass", 1136, "impact_glass_heavy_002.wav", semitones=1.5, gain_db=1.5, pan=0.25, desc="Tier 4 Cryo Quartz Viewport Shatter")
    mixer.add_event("mechanisms/motors", 1137, "thruster_fire_004.wav", semitones=-2.0, gain_db=0.5, pan=0.0, desc="Tier 4 Spacetime Expansion Shockwave Tail")

    # Export Master Audio Track & Forensic BOM
    mixer.export(out_wav, bom_json)
    return mixer

if __name__ == "__main__":
    wav_path = sys.argv[1] if len(sys.argv) > 1 else None
    bom_path = sys.argv[2] if len(sys.argv) > 2 else None
    generate_hammer_asmr_track(wav_path, bom_path)
