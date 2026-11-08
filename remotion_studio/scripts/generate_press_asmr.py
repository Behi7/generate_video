#!/usr/bin/env python3
"""
generate_press_asmr.py
Procedural Foley ASMR Master Composer for PressProgression in remotion_studio.
Assembles a master 44.1 kHz 16-bit PCM stereo WAV track using real CC0 WAV samples
from public/audio/foley/ to assemble an exact 1160-frame (38.6667s @ 30 FPS,
1,705,200 audio samples) master track.

Strictly follows The Pure ASMR Law (remotion_studio/crew/sound_editor.md):
- ZERO AI VOICEOVER.
- ZERO SYNTHETIC SINE WAVES (100% Real CC0 Studio Foley Assets).
- Broadcast-grade soft-knee peak limiting to -1.0 dBFS true peak.
- Exact duration: 1160 frames @ 30 FPS = 38.6667s (1,705,200 samples).

Synchronized across 4 distinct Progression Tiers (290 frames per tier):
- Tier 1 ($10 Manual Flywheel Screw Press, Frames 0..289):
  * Act 1 (0..69f): Snap assembly (thud, screw thread dock, bronze collar latch, flywheel snap).
  * Act 2 (70..149f): Manual crank squeaks, handle spin whir.
  * Act 3 (150..224f): Copper compression ASMR, metal strain, rhythmic thuds.
  * Act 4 (225..289f): Deceleration groan (225..244f), screw thread shudder (245..264f), frame 265 thread shear snap & metallic ring.
- Tier 2 ($100 Motorized Eccentric Punch Press, Frames 290..579):
  * Act 1 (290..359f): Welded chassis drop, crankshaft dock, motor housing snap, flywheel lock.
  * Act 2 (360..439f): Switch clack, electric motor spool-up, V-belt whir.
  * Act 3 (440..539f): Rapid mechanical punching strikes (sharp metal slap, punch impact, aluminum crunch ASMR).
  * Act 4 (540..579f): Motor bog-down, binding shudder (545..564f), connecting rod buckling crack & electrical pop at 555/565f.
- Tier 3 ($1,000 Quad-Piston Hydraulic Forging Press, Frames 580..869):
  * Act 1 (580..649f): Massive bolster plate landing, 4 chrome column lock, hydraulic gantry dock.
  * Act 2 (650..729f): Valve lever clack, 500-bar hydraulic pump whine & fluid surge.
  * Act 3 (730..829f): Unstoppable hydraulic tonnage groan, metal deformation, high-pressure steam hiss.
  * Act 4 (830..869f): Pressure relief scream, cavitation shudder (845..864f), catastrophic seal blowout & cylinder head bolt shear at 845/865f.
- Tier 4 ($100,000+ Superconducting Quantum Pinch Press, Frames 870..1159):
  * Act 1 (870..939f): Maglev base lock, superconducting toroid dock, containment armor lock.
  * Act 2 (940..1019f): Quantum trigger engage, high-frequency coil charge-up riser, cryo hiss.
  * Act 3 (1020..1119f): Relativistic magnetic pinch pulses (sub-bass slam, plasma arc snap, crystal distortion).
  * Act 4 (1120..1159f): Magnetic field collapse pitch descent, intense tremor, singularity collapse shockwave at 1135/1145f.
"""

import os
import sys
import json
import random
import numpy as np

# Ensure scripts dir is on sys.path across modular and root script invocations
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

from compose_asmr import ASMRMixer, STUDIO_DIR, SAMPLE_RATE, FPS, TOTAL_FRAMES, load_wav, pitch_shift, mix_sample

class PressASMRMixer(ASMRMixer):
    """Specialized Foley mixer for Press Progression with envelope & duration trimming."""

    def add_event(self, category, frame, filename=None, semitones=0.0, gain_db=0.0, pan=0.0, 
                  max_duration_frames=None, fade_out_frames=6, desc=""):
        rel_path = self.get_sample_path(category, filename)
        raw = load_wav(rel_path)
        if semitones != 0.0:
            raw = pitch_shift(raw, semitones)
        
        if max_duration_frames is not None:
            max_samples = int((max_duration_frames / FPS) * SAMPLE_RATE)
            if len(raw) > max_samples:
                raw = raw[:max_samples].copy()
                fade_samples = min(int((fade_out_frames / FPS) * SAMPLE_RATE), len(raw) // 2)
                if fade_samples > 0:
                    fade = np.linspace(1.0, 0.0, fade_samples)
                    raw[-fade_samples:, 0] *= fade
                    raw[-fade_samples:, 1] *= fade

        mix_sample(self.master, raw, at_frame=frame, gain_db=gain_db, pan=pan)
        self.bom.append({
            "frame": frame,
            "category": category,
            "sample": rel_path,
            "gain_db": gain_db,
            "pitch_semitones": semitones,
            "desc": desc
        })

    def add_continuous_tone(self, category, filename, start_frame, duration_frames, 
                            semitones=0.0, gain_db=0.0, fade_in_frames=10, fade_out_frames=10, 
                            pan=0.0, desc=""):
        """Adds a continuous motor hum, steam hiss or fluid surge with smooth raised-cosine fades."""
        rel_path = self.get_sample_path(category, filename)
        raw = load_wav(rel_path)
        if semitones != 0.0:
            raw = pitch_shift(raw, semitones)
        
        target_len = int((duration_frames / FPS) * SAMPLE_RATE)
        if len(raw) < target_len:
            repeats = int(np.ceil(target_len / len(raw)))
            raw = np.tile(raw, (repeats, 1))[:target_len]
        else:
            raw = raw[:target_len].copy()

        fade_in_samples = int((fade_in_frames / FPS) * SAMPLE_RATE)
        fade_out_samples = int((fade_out_frames / FPS) * SAMPLE_RATE)

        if fade_in_samples > 0 and fade_in_samples < len(raw):
            envelope_in = np.sin(np.linspace(0, np.pi / 2, fade_in_samples)) ** 2
            raw[:fade_in_samples, 0] *= envelope_in
            raw[:fade_in_samples, 1] *= envelope_in

        if fade_out_samples > 0 and fade_out_samples < len(raw):
            envelope_out = np.sin(np.linspace(np.pi / 2, 0, fade_out_samples)) ** 2
            raw[-fade_out_samples:, 0] *= envelope_out
            raw[-fade_out_samples:, 1] *= envelope_out

        mix_sample(self.master, raw, at_frame=start_frame, gain_db=gain_db, pan=pan)
        self.bom.append({
            "frame": start_frame,
            "category": category,
            "sample": rel_path,
            "gain_db": gain_db,
            "pitch_semitones": semitones,
            "desc": desc
        })


def generate_press_asmr_track(out_wav=None, bom_json=None):
    if out_wav is None:
        out_wav = os.path.join(STUDIO_DIR, "public", "audio", "asmr_press_progression.wav")
    if bom_json is None:
        bom_json = os.path.join(STUDIO_DIR, "public", "audio", "asmr_press_bom.json")

    mixer = PressASMRMixer()

    # =========================================================================
    # --- TIER 1 ($10 Manual Flywheel Screw Press, Frames 0..289) ---
    # =========================================================================

    # --- Act 1 (0..69f): Snap Assembly ---
    # Frame 0: Heavy cast-iron press anvil bed landing thud
    mixer.add_event("materials/wood", 0, "impact_wood_heavy_000.wav", gain_db=2.5, pan=0.0, desc="Tier 1 Bed Timber Landing Thud")
    mixer.add_event("materials/metal", 0, "impact_metal_heavy_000.wav", gain_db=2.0, pan=0.0, desc="Tier 1 Cast Iron Anvil Settle")
    mixer.add_event("impacts/locks", 0, "drop_001.wav", gain_db=-1.0, pan=-0.1, desc="Tier 1 Sub-Bass Bed Mass Dock")

    # Frame 20: Dual Acme screw thread & guide columns dock
    mixer.add_event("mechanisms/switches", 20, "click_001.wav", gain_db=2.0, pan=-0.15, desc="Tier 1 Acme Screw Socket Detent")
    mixer.add_event("materials/metal", 20, "impact_metal_light_000.wav", gain_db=1.0, pan=-0.1, desc="Tier 1 Screw Thread Seat Friction")
    mixer.add_event("materials/metal", 20, "impact_plate_light_001.wav", gain_db=0.5, pan=-0.2, desc="Tier 1 Guide Column Ring")

    # Frame 40: Bronze collar & thrust bearing latch
    mixer.add_event("mechanisms/switches", 40, "switch_001.wav", gain_db=2.5, pan=0.15, desc="Tier 1 Bronze Collar Latch Clack")
    mixer.add_event("materials/metal", 40, "impact_metal_light_002.wav", gain_db=1.0, pan=0.2, desc="Tier 1 Bearing Metallic Seat")

    # Frame 60: Heavy cast-iron flywheel snap & T-handle lock
    mixer.add_event("mechanisms/switches", 60, "switch_003.wav", gain_db=3.0, pan=0.0, desc="Tier 1 Flywheel Lock Snap")
    mixer.add_event("materials/metal", 60, "impact_plate_medium_000.wav", gain_db=2.0, pan=0.05, desc="Tier 1 Cast Flywheel Seat Ring")
    mixer.add_event("impacts/locks", 60, "door_close_000.wav", gain_db=-1.5, pan=0.1, desc="Tier 1 Flywheel Mass Clang")

    # --- Act 2 (70..149f): Manual Crank Squeaks & Handle Spin Whir ---
    # Frame 70: Operator engages manual handle
    mixer.add_event("mechanisms/switches", 70, "toggle_001.wav", gain_db=2.5, pan=0.0, desc="Tier 1 Handle Ratchet Toggle")
    mixer.add_event("mechanisms/switches", 70, "click_003.wav", gain_db=1.5, pan=0.1, desc="Tier 1 Pawl Engagement")

    # Frames 72..96: Manual crank squeaks & straining wood/metal creaks
    crank_moments = [
        (72, "impact_wood_light_000.wav", -1.0, -1.0, "tick_001.wav", -0.2),
        (78, "impact_plank_medium_001.wav", 0.0, -1.5, "tick_002.wav", 0.15),
        (84, "impact_wood_light_002.wav", 1.0, -0.5, "tick_004.wav", -0.15),
        (90, "impact_metal_light_001.wav", 2.0, 0.0, "tick_001.wav", 0.2),
        (96, "impact_wood_medium_000.wav", 1.5, 0.5, "tick_002.wav", -0.1),
    ]
    for frame, wood_smp, semi, gain, tick_smp, pan in crank_moments:
        mixer.add_event("materials/wood", frame, wood_smp, semitones=semi, gain_db=gain, pan=pan, 
                        desc=f"Tier 1 Manual Crank Creak @ {frame}f")
        mixer.add_event("mechanisms/switches", frame, tick_smp, gain_db=gain - 1.0, pan=pan * 0.5, 
                        desc=f"Tier 1 Crank Ratchet Tick @ {frame}f")

    # Frames 85..99: Handle spin whir (flywheel picks up momentum and free-spins)
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_000.wav", 85, 15,
                              semitones=2.0, gain_db=-7.0, fade_in_frames=4, fade_out_frames=4,
                              pan=0.0, desc="Tier 1 Flywheel High-Speed Spin Whir")
    # Rapid rotational tick flutter
    for f in [86, 90, 94, 98]:
        mixer.add_event("mechanisms/switches", f, "tick_004.wav", gain_db=-3.0, pan=0.1 * ((f % 2) * 2 - 1),
                        desc="Tier 1 Flywheel Revolution Tick")

    # --- Act 3 (100..224f): Copper Compression ASMR, Metal Strain, Rhythmic Thuds ---
    # Ram strikes copper specimen at frames 111, 136, 161, 186, 211
    t1_compressions = [111, 136, 161, 186, 211]
    for idx, f in enumerate(t1_compressions):
        s_idx = idx % 5
        pan = 0.18 if idx % 2 == 0 else -0.18
        progress = idx / len(t1_compressions)
        gain_boost = progress * 1.5

        # Layer 1: Heavy ram impact thud
        mixer.add_event("materials/metal", f, f"impact_metal_heavy_{s_idx:03d}.wav",
                        semitones=-1.0 + (idx % 2), gain_db=1.5 + gain_boost, pan=pan,
                        desc=f"Tier 1 Compression Stroke {idx+1} (Ram Thud)")
        # Layer 2: Copper deformation ASMR & malleable crunch
        mixer.add_event("materials/soft_plastic", f, f"impact_soft_heavy_{s_idx:03d}.wav",
                        semitones=1.0, gain_db=1.0 + gain_boost, pan=-pan * 0.5,
                        desc=f"Tier 1 Copper Malleable Crunch {idx+1}")
        mixer.add_event("materials/metal", f + 1, f"impact_tin_medium_{s_idx:03d}.wav",
                        semitones=0.5, gain_db=0.0 + gain_boost, pan=pan * 0.7,
                        desc=f"Tier 1 Copper Specimen Yield ASMR {idx+1}")
        # Layer 3: Screw thread strain ring
        mixer.add_event("materials/metal", f, f"impact_plate_light_{s_idx:03d}.wav",
                        semitones=2.0 + (idx % 3) * 0.5, gain_db=-2.0 + gain_boost, pan=pan * 0.4,
                        desc=f"Tier 1 Thread Torque Strain Ping {idx+1}")
        # Layer 4: Cast frame reaction creak
        mixer.add_event("materials/wood", f + 2, f"impact_wood_medium_{s_idx:03d}.wav",
                        semitones=0.0, gain_db=-2.5 + gain_boost, pan=-pan * 0.8,
                        desc=f"Tier 1 Frame Creak Reaction {idx+1}")

    # Micro-deformation crunchy texture loop between strokes
    mixer.add_rapid_loop("materials/soft_plastic", 115, 222, interval_frames=6, gain_db=-2.0, pitch_var=1.5,
                         desc="Tier 1 Tactile Copper Flattening ASMR")

    # --- Act 4 (225..289f): Deceleration Groan, Shudder, Frame 265 Thread Shear Snap ---
    # 225..244f: Deceleration groan (motor/flywheel bogs down into ultra-hard core)
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_001.wav", 225, 20,
                              semitones=-4.0, gain_db=-3.0, fade_in_frames=4, fade_out_frames=4,
                              pan=0.0, desc="Tier 1 Flywheel Deceleration Groan")
    mixer.add_event("materials/metal", 226, "impact_metal_medium_001.wav", semitones=-3.0, gain_db=2.0, pan=-0.1,
                    desc="Tier 1 Heavy Thread Friction Groan")
    mixer.add_event("materials/wood", 236, "impact_wood_heavy_002.wav", semitones=-2.0, gain_db=1.5, pan=0.15,
                    desc="Tier 1 Timber Bed Groan Under Stalled Torque")

    # 245..264f: Screw thread shudder (high-frequency stick-slip chatter)
    shudder_frames = [245, 248, 251, 254, 257, 260, 263]
    for i, sf in enumerate(shudder_frames):
        ratio = i / len(shudder_frames)
        mixer.add_event("mechanisms/switches", sf, "tick_001.wav", gain_db=-1.0 + ratio * 3.0, pan=0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 1 Thread Shudder Tick {i+1}")
        mixer.add_event("materials/metal", sf, f"impact_metal_light_{i%5:03d}.wav", semitones=1.0 + ratio * 2.0, 
                        gain_db=-2.0 + ratio * 3.5, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 1 Thread Shudder Chatter {i+1}")

    # Frame 265: Catastrophic Thread Shear Snap & Metallic Ring
    mixer.add_event("materials/metal", 265, "impact_metal_heavy_001.wav", semitones=1.0, gain_db=5.0, pan=0.0,
                    desc="Tier 1 Acme Thread Violent Shear Snap")
    mixer.add_event("materials/wood", 265, "impact_wood_heavy_003.wav", semitones=2.0, gain_db=4.0, pan=-0.1,
                    desc="Tier 1 Frame Cleavage Crack")
    mixer.add_event("materials/metal", 265, "impact_plate_light_003.wav", semitones=3.5, gain_db=3.0, pan=0.2,
                    desc="Tier 1 Sheared Thread Metallic Ring")
    mixer.add_event("materials/metal", 266, "impact_tin_medium_002.wav", semitones=2.0, gain_db=2.5, pan=-0.15,
                    desc="Tier 1 Bronze Shrapnel Ping")
    mixer.add_event("impacts/locks", 268, "drop_002.wav", gain_db=2.0, pan=0.25,
                    desc="Tier 1 Detached Flywheel Secondary Bed Bounce")


    # =========================================================================
    # --- TIER 2 ($100 Motorized Eccentric Punch Press, Frames 290..579) ---
    # =========================================================================

    # --- Act 1 (290..359f): Snap Assembly ---
    # Frame 290: Welded structural steel chassis drop
    mixer.add_event("materials/metal", 290, "impact_metal_heavy_000.wav", gain_db=4.0, pan=0.0, desc="Tier 2 Welded Chassis Heavy Landing")
    mixer.add_event("impacts/locks", 290, "door_close_000.wav", gain_db=2.5, pan=-0.1, desc="Tier 2 Heavy Steel Base Dock Thud")
    mixer.add_event("materials/metal", 290, "impact_plate_heavy_000.wav", gain_db=2.0, pan=0.1, desc="Tier 2 Bed Plate Resonance")

    # Frame 310: Forged eccentric crankshaft dock
    mixer.add_event("materials/metal", 310, "impact_plate_medium_000.wav", gain_db=2.0, pan=-0.15, desc="Tier 2 Crankshaft Journal Seat")
    mixer.add_event("mechanisms/switches", 310, "click_003.wav", gain_db=2.5, pan=-0.2, desc="Tier 2 Crankshaft Bearing Detent Lock")

    # Frame 330: Electric motor housing snap
    mixer.add_event("impacts/locks", 330, "door_close_001.wav", gain_db=3.0, pan=0.15, desc="Tier 2 Motor Stator Housing Snap")
    mixer.add_event("mechanisms/switches", 330, "switch_002.wav", gain_db=2.5, pan=0.2, desc="Tier 2 Motor Bracket Clamp Latch")
    mixer.add_event("materials/metal", 330, "impact_metal_light_001.wav", gain_db=1.5, pan=0.1, desc="Tier 2 Aluminum Housing Seat Ring")

    # Frame 350: Flywheel lock & V-belt tensioner snap
    mixer.add_event("mechanisms/switches", 350, "switch_005.wav", gain_db=2.5, pan=-0.1, desc="Tier 2 V-Belt Idler Tensioner Snap")
    mixer.add_event("materials/metal", 350, "impact_plate_medium_002.wav", gain_db=2.0, pan=-0.05, desc="Tier 2 Flywheel Keyway Lock")

    # --- Act 2 (360..389f): Switch Clack, Electric Motor Spool-Up, V-Belt Whir ---
    # Frame 360: Industrial high-amp knife switch clack
    mixer.add_event("mechanisms/switches", 360, "switch_004.wav", gain_db=3.5, pan=0.0, desc="Tier 2 Knife Switch Contact Clack")
    mixer.add_event("mechanisms/switches", 360, "switch_001.wav", gain_db=2.0, pan=0.05, desc="Tier 2 Switch Detent Snap")

    # Frames 362..389f: Electric motor spool-up & V-belt whir
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_001.wav", 362, 28,
                              semitones=1.0, gain_db=-3.0, fade_in_frames=8, fade_out_frames=4,
                              pan=-0.1, desc="Tier 2 AC Induction Motor Spool-Up")
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_small_000.wav", 365, 25,
                              semitones=2.5, gain_db=-5.0, fade_in_frames=8, fade_out_frames=4,
                              pan=0.15, desc="Tier 2 High-Speed V-Belt Whir")
    # Accelerating pulley ticks
    vbelt_ticks = [366, 372, 378, 384, 389]
    for idx, f in enumerate(vbelt_ticks):
        mixer.add_event("mechanisms/switches", f, "tick_004.wav", gain_db=-2.0, pan=0.15 * ((idx % 2) * 2 - 1),
                        desc=f"Tier 2 Pulley Revolution Tick {idx+1}")

    # --- Act 3 (390..514f): Rapid Mechanical Punching Strikes (14-Stroke Cadence) ---
    # Cadence: exact strike frames [394, 403, 412, 421, 430, 439, 448, 456, 465, 474, 483, 492, 501, 510]
    t2_punches = [394, 403, 412, 421, 430, 439, 448, 456, 465, 474, 483, 492, 501, 510]
    # Continuous induction motor drone during punching operation
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_002.wav", 390, 125,
                              semitones=2.0, gain_db=-4.5, fade_in_frames=6, fade_out_frames=6,
                              pan=-0.1, desc="Tier 2 Continuous Punching Motor Hum")

    for idx, f in enumerate(t2_punches):
        s_idx = idx % 5
        pan = 0.22 if idx % 2 == 0 else -0.22
        progress = idx / len(t2_punches)
        gain_boost = progress * 1.2

        # Layer 1: Sharp mechanical slap (ram guide & clutch slide)
        mixer.add_event("materials/metal", f, f"impact_plate_light_{s_idx:03d}.wav",
                        semitones=1.5, gain_db=1.5 + gain_boost, pan=pan * 0.8,
                        desc=f"Tier 2 Punch Stroke {idx+1} (Slide Slap)")
        # Layer 2: Heavy punch impact transient (tool steel punch hitting die)
        mixer.add_event("materials/metal", f, f"impact_plate_heavy_{s_idx:03d}.wav",
                        semitones=(idx % 3) - 1.0, gain_db=2.5 + gain_boost, pan=pan,
                        desc=f"Tier 2 Punch Stroke {idx+1} (Die Impact)")
        # Layer 3: Tactile aluminum crunch ASMR (sheet metal shear/deformation)
        mixer.add_event("materials/metal", f + 1, f"impact_tin_medium_{s_idx:03d}.wav",
                        semitones=1.0, gain_db=1.5 + gain_boost, pan=-pan * 0.5,
                        desc=f"Tier 2 Aluminum Punch ASMR {idx+1}")
        mixer.add_event("materials/soft_plastic", f + 1, f"impact_soft_heavy_{s_idx:03d}.wav",
                        semitones=0.0, gain_db=0.0 + gain_boost, pan=pan * 0.5,
                        desc=f"Tier 2 Metal Sheet Shear Crunch {idx+1}")
        # Layer 4: Resonant die ring
        mixer.add_event("materials/metal", f, f"impact_metal_light_{s_idx:03d}.wav",
                        semitones=2.5 + (idx % 2), gain_db=-1.5 + gain_boost, pan=pan * 0.3,
                        desc=f"Tier 2 Hardened Tool Steel Die Ping {idx+1}")

    # --- Act 4 (515..579f): Motor Bog-Down, Binding Shudder, Buckling Crack at 555f ---
    # 515..534f: Motor sudden bog-down (pitch dive as punch reaches bottom dead center on jam)
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_003.wav", 515, 20,
                              semitones=-5.0, gain_db=-1.5, fade_in_frames=2, fade_out_frames=4,
                              pan=-0.1, desc="Tier 2 Motor Sudden Bog-Down Drone")

    # 535..554f: Binding shudder (rapid mechanical chatter under locked torque)
    t2_shudder = [535, 538, 541, 544, 547, 550, 553]
    for i, sf in enumerate(t2_shudder):
        mixer.add_event("materials/metal", sf, f"impact_plate_medium_{i%5:03d}.wav",
                        semitones=0.5 * i, gain_db=1.0 + (i / len(t2_shudder)) * 2.5, pan=0.18 * ((i % 2) * 2 - 1),
                        desc=f"Tier 2 Binding Shudder Impact {i+1}")
        mixer.add_event("mechanisms/switches", sf, "click_004.wav", gain_db=1.5, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 2 Crank Pin Chatter Click {i+1}")

    # Frame 555: CONNECTING ROD BUCKLING CRACK
    mixer.add_event("materials/metal", 555, "impact_metal_heavy_002.wav", semitones=1.0, gain_db=5.5, pan=-0.15,
                    desc="Tier 2 Forged Connecting Rod Buckling Crack")
    mixer.add_event("impacts/explosions", 555, "explosion_crunch_000.wav", semitones=-0.5, gain_db=4.0, pan=0.1,
                    desc="Tier 2 Crankshaft Jam Explosive Blast")
    mixer.add_event("materials/metal", 555, "impact_plate_heavy_001.wav", semitones=2.0, gain_db=3.0, pan=0.2,
                    desc="Tier 2 Flywheel Inertial Snap Shock")

    # Frame 565: SECONDARY ELECTRICAL POP & V-BELT WHIP
    mixer.add_event("impacts/explosions", 565, "explosion_crunch_002.wav", semitones=1.0, gain_db=3.5, pan=0.2,
                    desc="Tier 2 Motor Winding Electrical Pop")
    mixer.add_event("mechanisms/switches", 565, "switch_007.wav", semitones=2.0, gain_db=3.0, pan=0.15,
                    desc="Tier 2 Circuit Breaker Arc Trip")
    mixer.add_event("materials/soft_plastic", 565, "impact_soft_heavy_003.wav", gain_db=2.5, pan=-0.25,
                    desc="Tier 2 V-Belt Whip Slap")
    # Motor spindown after disconnect
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_004.wav", 566, 13,
                              semitones=-8.0, gain_db=-6.0, fade_in_frames=2, fade_out_frames=6,
                              pan=-0.15, desc="Tier 2 Free-Wheeling Motor Spindown")


    # =========================================================================
    # --- TIER 3 ($1,000 Quad-Piston Hydraulic Forging Press, Frames 580..869) ---
    # =========================================================================

    # --- Act 1 (580..649f): Snap Assembly ---
    # Frame 580: Massive 5-ton bolster plate landing
    mixer.add_event("materials/metal", 580, "impact_plate_heavy_001.wav", gain_db=5.5, pan=0.0, desc="Tier 3 Bolster Plate Seismic Landing")
    mixer.add_event("materials/metal", 580, "impact_metal_heavy_003.wav", gain_db=4.5, pan=0.1, desc="Tier 3 Anvil Bed Massive Thud")
    mixer.add_event("materials/stone", 580, "footstep_concrete_000.wav", gain_db=3.0, pan=-0.1, desc="Tier 3 Foundation Concrete Shockwave")

    # Frame 600: 4 chrome tie columns lock
    mixer.add_event("materials/metal", 600, "impact_metal_heavy_001.wav", gain_db=3.5, pan=-0.2, desc="Tier 3 Quad Chrome Columns Seat")
    mixer.add_event("impacts/locks", 600, "door_close_002.wav", gain_db=3.0, pan=-0.15, desc="Tier 3 Hydraulic Cylinder Lower Seal Dock")
    mixer.add_event("mechanisms/switches", 600, "click_005.wav", gain_db=3.0, pan=-0.1, desc="Tier 3 Hydraulic Locking Collar Detent")

    # Frame 625: Quad-cylinder hydraulic gantry dock
    mixer.add_event("materials/metal", 625, "impact_plate_heavy_002.wav", gain_db=4.0, pan=0.2, desc="Tier 3 Hydraulic Gantry Crown Dock")
    mixer.add_event("impacts/locks", 625, "door_close_001.wav", gain_db=3.0, pan=0.15, desc="Tier 3 Massive Upper Platen Lock")
    mixer.add_event("mechanisms/switches", 625, "switch_006.wav", gain_db=2.5, pan=0.1, desc="Tier 3 High-Pressure Hydraulic Manifold Coupler")

    # --- Act 2 (650..679f): Valve Lever Clack, 500-Bar Pump Whine & Fluid Surge ---
    # Frame 650: Heavy hydraulic directional valve lever clack
    mixer.add_event("mechanisms/switches", 650, "switch_001.wav", gain_db=4.0, pan=0.0, desc="Tier 3 Hydraulic Valve Lever Clack")
    mixer.add_event("mechanisms/switches", 650, "switch_003.wav", gain_db=3.0, pan=-0.05, desc="Tier 3 Pilot Spool Detent")
    mixer.add_event("materials/metal", 650, "impact_plate_medium_001.wav", gain_db=2.5, pan=0.05, desc="Tier 3 Valve Block Metal Ring")

    # Frames 652..679f: 500-bar hydraulic pump whine & fluid surge
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_low_000.wav", 652, 28,
                              semitones=2.0, gain_db=-2.5, fade_in_frames=8, fade_out_frames=4,
                              pan=-0.1, desc="Tier 3 500-Bar Hydraulic Axial Pump Whine")
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_000.wav", 654, 26,
                              semitones=1.5, gain_db=-4.0, fade_in_frames=8, fade_out_frames=4,
                              pan=0.15, desc="Tier 3 High-Pressure Fluid Surge In Hoses")
    # Pressure relief cycling clicks
    for idx, f in enumerate([658, 666, 674]):
        mixer.add_event("mechanisms/switches", f, "click_004.wav", gain_db=1.0, pan=0.12 * ((idx % 2) * 2 - 1),
                        desc=f"Tier 3 Hydraulic Check Valve Click {idx+1}")

    # --- Act 3 (680..804f): Unstoppable Hydraulic Tonnage Groan, Metal Deformation, Steam Hiss ---
    # Monolithic continuous tonnage groan: 500 tons of unstoppable hydraulic power
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_low_001.wav", 680, 125,
                              semitones=0.0, gain_db=-1.0, fade_in_frames=6, fade_out_frames=6,
                              pan=0.0, desc="Tier 3 Relentless 500-Ton Pressurization Drone")
    # High-pressure steam hiss from hot workpiece vaporization
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_001.wav", 680, 125,
                              semitones=2.0, gain_db=-3.5, fade_in_frames=8, fade_out_frames=6,
                              pan=0.15, desc="Tier 3 Continuous High-Pressure Steam Hiss")

    # Periodic ram stroke thrusts and heavy steel frame groan at frames [690, 715, 740, 765, 790]
    t3_groan_frames = [690, 715, 740, 765, 790]
    for idx, f in enumerate(t3_groan_frames):
        s_idx = idx % 5
        pan = 0.2 if idx % 2 == 0 else -0.2
        # Deep structural steel groan
        mixer.add_event("materials/metal", f, f"impact_plate_heavy_{s_idx:03d}.wav",
                        semitones=-2.5, gain_db=2.5, pan=pan,
                        desc=f"Tier 3 Hydraulic Ram Groan {idx+1}")
        mixer.add_event("materials/metal", f, f"impact_metal_heavy_{s_idx:03d}.wav",
                        semitones=-1.5, gain_db=2.0, pan=-pan * 0.5,
                        desc=f"Tier 3 Frame Strain Sub-Bass {idx+1}")

    # Metal deformation ASMR (rock & alloy core yielding and fracturing under 500 tons)
    t3_deform_frames = [694, 706, 719, 731, 744, 756, 769, 781, 794]
    for idx, f in enumerate(t3_deform_frames):
        s_idx = idx % 5
        pan = -0.22 if idx % 2 == 0 else 0.22
        mixer.add_event("materials/stone", f, f"impact_mining_{s_idx:03d}.wav",
                        semitones=0.5, gain_db=1.5, pan=pan,
                        desc=f"Tier 3 Heavy Specimen Core Fracture ASMR {idx+1}")
        mixer.add_event("materials/metal", f + 1, f"impact_tin_medium_{s_idx:03d}.wav",
                        semitones=-1.0, gain_db=1.0, pan=-pan * 0.7,
                        desc=f"Tier 3 Platen Micro-Yield Clank {idx+1}")

    # Rapid high-pressure chip crackle
    mixer.add_rapid_loop("materials/stone", 685, 804, interval_frames=5, gain_db=-2.5, pitch_var=2.0,
                         desc="Tier 3 High-Pressure Aggregate Spall ASMR")

    # --- Act 4 (805..869f): Pressure Relief Scream, Cavitation Shudder, 845f Seal Blowout ---
    # 805..824f: Pressure relief scream (650-bar bypass valve screech)
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_002.wav", 805, 20,
                              semitones=5.0, gain_db=1.0, fade_in_frames=3, fade_out_frames=2,
                              pan=0.1, desc="Tier 3 Pressure Relief Scream")
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_small_002.wav", 830, 15,
                              semitones=3.0, gain_db=0.0, fade_in_frames=2, fade_out_frames=2,
                              pan=-0.1, desc="Tier 3 Valve Chattering Whine")

    # Frame 845: CATASTROPHIC 600-BAR SEAL BLOWOUT BLAST
    mixer.add_event("impacts/explosions", 845, "explosion_crunch_001.wav", semitones=0.0, gain_db=6.0, pan=0.0,
                    desc="Tier 3 600-Bar Catastrophic Seal Blowout Blast")
    mixer.add_event("impacts/explosions", 845, "low_frequency_explosion_000.wav", semitones=1.0, gain_db=4.5, pan=-0.1,
                    desc="Tier 3 Hydraulic Accumulator Sub-Bass Shock")
    mixer.add_event("mechanisms/motors", 845, "thruster_fire_001.wav", semitones=2.0, gain_db=3.5, pan=0.2,
                    desc="Tier 3 Super-Heated Hydraulic Fluid Jet Hiss")
    mixer.add_event("materials/metal", 846, "impact_plate_heavy_002.wav", semitones=1.0, gain_db=3.0, pan=0.15,
                    desc="Tier 3 Deformed Platen Rebound Slam")

    # 845..864f: Severe pump cavitation shudder & manifold violent rattling
    t3_shudder = [847, 850, 853, 856, 859, 862]
    for i, sf in enumerate(t3_shudder):
        mixer.add_event("materials/metal", sf, f"impact_plate_medium_{i%5:03d}.wav",
                        semitones=-1.0 + i * 0.4, gain_db=2.0, pan=0.2 * ((i % 2) * 2 - 1),
                        desc=f"Tier 3 Cavitation Shudder Pulse {i+1}")
        mixer.add_event("mechanisms/switches", sf, "tick_001.wav", gain_db=1.0, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 3 Valve Flutter Click {i+1}")

    # Frame 865: CYLINDER HEAD HIGH-TENSILE BOLT SHEAR
    mixer.add_event("materials/metal", 865, "impact_metal_heavy_004.wav", semitones=2.0, gain_db=5.0, pan=0.2,
                    desc="Tier 3 Cylinder Head High-Tensile Bolt Shear Snap")
    mixer.add_event("materials/metal", 865, "impact_plate_light_004.wav", semitones=3.5, gain_db=3.5, pan=0.25,
                    desc="Tier 3 Sheared Bolt Supersonic Ricochet")
    mixer.add_event("impacts/explosions", 865, "explosion_crunch_003.wav", semitones=1.5, gain_db=3.0, pan=-0.15,
                    desc="Tier 3 Cylinder Flange Rupture Pop")


    # =========================================================================
    # --- TIER 4 ($100,000+ Superconducting Quantum Pinch Press, Frames 870..1159) ---
    # =========================================================================

    # --- Act 1 (870..939f): Snap Assembly ---
    # Frame 870: Maglev zero-G superconducting base lock
    mixer.add_event("mechanisms/scifi_laser", 870, "force_field_000.wav", gain_db=3.5, pan=0.0, desc="Tier 4 Maglev Base Force Field Lock")
    mixer.add_event("mechanisms/scifi_laser", 870, "force_field_001.wav", gain_db=2.5, pan=-0.15, desc="Tier 4 Superconducting Flux Settle")
    mixer.add_event("impacts/locks", 870, "drop_003.wav", gain_db=2.0, pan=0.1, desc="Tier 4 Monolith Bed Plinth Mass Dock")

    # Frame 895: Superconducting toroid magnetic coil dock
    mixer.add_event("mechanisms/scifi_laser", 895, "laser_large_000.wav", gain_db=3.0, pan=-0.2, desc="Tier 4 Toroid Coil Magnetic Alignment Beam")
    mixer.add_event("mechanisms/switches", 895, "toggle_002.wav", gain_db=2.5, pan=-0.15, desc="Tier 4 Toroid Superconducting Bus Latch")
    mixer.add_event("impacts/locks", 895, "door_close_002.wav", gain_db=2.5, pan=0.1, desc="Tier 4 Hermetic Toroid Vacuum Lock")

    # Frame 920: Heavy hexagonal containment armor lock
    mixer.add_event("materials/glass", 920, "impact_glass_heavy_000.wav", gain_db=3.0, pan=0.15, desc="Tier 4 Quartz Containment Armor Slam")
    mixer.add_event("materials/metal", 920, "impact_plate_heavy_000.wav", gain_db=2.5, pan=-0.1, desc="Tier 4 Armored Hull Clamping Shock")
    mixer.add_event("mechanisms/switches", 920, "click_002.wav", gain_db=2.5, pan=0.0, desc="Tier 4 High-Voltage Interlock Detent")

    # --- Act 2 (940..969f): Quantum Trigger Engage, High-Frequency Coil Riser, Cryo Hiss ---
    # Frame 940: Quantum trigger engage
    mixer.add_event("mechanisms/switches", 940, "click_001.wav", gain_db=3.5, pan=0.0, desc="Tier 4 Quantum Trigger Master Contact")
    mixer.add_event("mechanisms/switches", 940, "toggle_003.wav", gain_db=3.0, pan=0.05, desc="Tier 4 Magnetic Containment Breaker")

    # Frames 942..969f: High-frequency coil charge-up riser & cryo hiss
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_large_000.wav", 942, 28,
                              semitones=3.0, gain_db=-2.0, fade_in_frames=8, fade_out_frames=4,
                              pan=-0.1, desc="Tier 4 Superconducting Coil Charge Riser")
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_001.wav", 945, 25,
                              semitones=5.0, gain_db=-4.0, fade_in_frames=8, fade_out_frames=4,
                              pan=0.15, desc="Tier 4 High-Frequency Resonator Whine")
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_003.wav", 942, 28,
                              semitones=0.0, gain_db=-4.5, fade_in_frames=8, fade_out_frames=4,
                              pan=0.0, desc="Tier 4 Liquid Helium Cryo Purge Hiss")

    # Pre-pinch plasma arc crackles
    for idx, f in enumerate([948, 955, 962]):
        mixer.add_event("mechanisms/scifi_laser", f, "force_field_002.wav", gain_db=1.0, pan=0.15 * ((idx % 2) * 2 - 1),
                        desc=f"Tier 4 Plasma Arc Pre-Discharge {idx+1}")

    # --- Act 3 (970..1094f): Relativistic Magnetic Pinch Pulses (Sub-Bass Slam, Plasma Arc, Crystal Distortion) ---
    # Cadence: 10 relativistic pinch pulses at frames [980, 992, 1004, 1016, 1028, 1040, 1052, 1064, 1076, 1088]
    t4_pinches = [980, 992, 1004, 1016, 1028, 1040, 1052, 1064, 1076, 1088]
    # Continuous relativistic containment field drone
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_large_001.wav", 970, 125,
                              semitones=4.0, gain_db=-3.5, fade_in_frames=6, fade_out_frames=6,
                              pan=0.0, desc="Tier 4 Relativistic Magnetic Field Drone")

    for idx, f in enumerate(t4_pinches):
        s_idx = idx % 5
        pan = 0.25 if idx % 2 == 0 else -0.25
        progress = idx / len(t4_pinches)
        gain_boost = progress * 1.5

        # Layer 1: Sub-bass kinetic magnetic pinch slam (clean, devastating transient)
        mixer.add_event("impacts/explosions", f, "low_frequency_explosion_000.wav",
                        semitones=1.0 + (idx % 2), gain_db=3.5 + gain_boost, pan=pan,
                        desc=f"Tier 4 Magnetic Pinch Pulse {idx+1} (Sub-Bass Slam)")
        mixer.add_event("materials/metal", f, f"impact_metal_heavy_{s_idx:03d}.wav",
                        semitones=-2.0, gain_db=2.0 + gain_boost, pan=-pan * 0.5,
                        desc=f"Tier 4 Toroid Physical Shock {idx+1}")
        # Layer 2: Relativistic plasma arc snap (ionized energy discharge)
        mixer.add_event("mechanisms/scifi_laser", f, f"laser_large_{s_idx:03d}.wav",
                        semitones=(idx % 3) * 1.5, gain_db=1.5 + gain_boost, pan=pan * 0.8,
                        desc=f"Tier 4 Plasma Arc Snap {idx+1}")
        mixer.add_event("mechanisms/scifi_laser", f + 1, f"force_field_{s_idx:03d}.wav",
                        semitones=2.0, gain_db=-1.0 + gain_boost, pan=-pan * 0.6,
                        desc=f"Tier 4 Flux Discharge Fizz {idx+1}")
        # Layer 3: Crystalline quantum distortion (quartz atomic lattice compression)
        mixer.add_event("materials/glass", f, f"impact_glass_heavy_{s_idx:03d}.wav",
                        semitones=1.0 + (idx % 2), gain_db=1.5 + gain_boost, pan=pan * 0.5,
                        desc=f"Tier 4 Crystal Lattice Strain {idx+1}")
        mixer.add_event("materials/glass", f + 1, f"impact_glass_medium_{s_idx:03d}.wav",
                        semitones=2.0, gain_db=0.0 + gain_boost, pan=-pan * 0.3,
                        desc=f"Tier 4 Quartz Compression Distortion {idx+1}")
        # Layer 4: High-frequency electromagnetic flux ring
        mixer.add_event("materials/glass", f, f"impact_glass_light_{s_idx:03d}.wav",
                        semitones=3.0, gain_db=-2.0 + gain_boost, pan=pan * 0.2,
                        desc=f"Tier 4 Crystalline Flux Resonance Ring {idx+1}")

    # Micro-lattice crackle ASMR between pulses
    mixer.add_rapid_loop("materials/glass", 982, 1088, interval_frames=5, gain_db=-2.0, pitch_var=1.5,
                         desc="Tier 4 Crystalline Lattice Micro-Fracture ASMR")

    # --- Act 4 (1120..1159f): Magnetic Field Collapse, Intense Tremor, Singularity Collapse at 1135/1145f ---
    # 1120..1134f: Magnetic field collapse pitch descent & intense tremor
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_large_002.wav", 1120, 15,
                              semitones=-6.0, gain_db=1.0, fade_in_frames=2, fade_out_frames=2,
                              pan=0.0, desc="Tier 4 Magnetic Field Collapse Pitch Descent")
    mixer.add_event("impacts/explosions", 1122, "low_frequency_explosion_001.wav", semitones=-2.0, gain_db=1.0, pan=0.0,
                    desc="Tier 4 Spacetime Tremor Sub-Bass Rumble")
    mixer.add_event("materials/metal", 1125, "impact_plate_heavy_001.wav", semitones=-1.5, gain_db=2.0, pan=-0.1,
                    desc="Tier 4 Containment Ring Torque Tremor")

    # Frame 1135: SINGULARITY COLLAPSE SHOCKWAVE (Primary Climax Blast)
    mixer.add_event("impacts/explosions", 1135, "low_frequency_explosion_001.wav", semitones=0.0, gain_db=6.5, pan=0.0,
                    desc="Tier 4 Singularity Collapse Shockwave Detonation")
    mixer.add_event("impacts/explosions", 1135, "explosion_crunch_004.wav", semitones=-1.0, gain_db=4.5, pan=-0.1,
                    desc="Tier 4 Spacetime Pinch Implosion Blast")
    mixer.add_event("mechanisms/scifi_laser", 1135, "laser_large_004.wav", semitones=2.0, gain_db=3.5, pan=0.15,
                    desc="Tier 4 High-Energy Plasma Annihilation Burst")
    mixer.add_event("mechanisms/scifi_laser", 1135, "force_field_004.wav", semitones=1.0, gain_db=2.5, pan=-0.15,
                    desc="Tier 4 Singularity Field Collapse Fizz")

    # Frame 1145: SECONDARY VACUUM IMPLOSION ECHO & CRYSTALLINE SHATTER
    mixer.add_event("materials/glass", 1145, "impact_glass_heavy_002.wav", semitones=1.5, gain_db=4.5, pan=0.2,
                    desc="Tier 4 Quartz Containment Viewport Shatter Fracture")
    mixer.add_event("materials/glass", 1145, "impact_glass_medium_001.wav", semitones=2.5, gain_db=3.0, pan=-0.2,
                    desc="Tier 4 Crystalline Debris Burst")
    mixer.add_event("impacts/explosions", 1145, "explosion_crunch_002.wav", semitones=1.0, gain_db=2.5, pan=0.0,
                    desc="Tier 4 Secondary Vacuum Implosion Shock")
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_004.wav", 1147, 13,
                              semitones=-2.0, gain_db=-2.5, fade_in_frames=2, fade_out_frames=6,
                              pan=0.0, desc="Tier 4 Expanding Shockwave Vacuum Dissipation")

    # =========================================================================
    # --- MASTER EXPORT WITH BROADCAST LIMITING & FORENSIC BOM ---
    # =========================================================================
    # True peak target is -1.0 dBFS (-14 LUFS broadcast standard)
    mixer.export(out_wav, bom_json, target_peak_db=-1.0)
    return mixer

if __name__ == "__main__":
    wav_path = sys.argv[1] if len(sys.argv) > 1 else None
    bom_path = sys.argv[2] if len(sys.argv) > 2 else None
    generate_press_asmr_track(wav_path, bom_path)
