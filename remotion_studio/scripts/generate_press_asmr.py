#!/usr/bin/env python3
"""
generate_press_asmr.py
Procedural Foley ASMR Master Composer for PressProgression in remotion_studio.
Assembles a master 44.1 kHz 16-bit PCM stereo WAV track using real CC0 WAV samples
from public/audio/foley/ to assemble an exact 1280-frame (42.6667s @ 30 FPS,
1,881,600 audio samples) master track.

Strictly follows The Pure ASMR Law (remotion_studio/crew/sound_editor.md):
- ZERO AI VOICEOVER.
- ZERO SYNTHETIC SINE WAVES (100% Real CC0 Studio Foley Assets).
- Broadcast-grade soft-knee peak limiting to -1.0 dBFS true peak.
- Exact duration: 1280 frames @ 30 FPS = 42.6667s (1,881,600 samples).

Synchronized to the 74-Frame Cleanser Timeline (320 frames per tier):
- Act 1: Assembly (0..62 local / 63 frames = 2.10s)
- Act 2: Startup (63..122 local / 60 frames = 2.00s)
- Act 3: Operating (123..212 local / 90 frames = 3.00s)
- Act 4: Overload, Rupture & 74-Frame Cleanser (213..319 local / 107 frames = 3.57s):
  * 213..224 (12f): Organic strain & RPM deceleration with exponential torque bog-down pitch dive.
  * 225..233 (9f): Resonant pre-fracture shudder wave (increasing frequency & amplitude).
  * 234 (Rupture Frame): Catastrophic fracture transient shockwave (T1=234, T2=554, T3=874, T4=1194).
  * 234..308 (74f): Active procedural Cleanser Transition Effect:
    - Tier 1: Pneumatic Radial Air Blast (234..308f)
    - Tier 2: Black Hole Gravitational Singularity (234..308f, suction 248..300f, pop 305..308f)
    - Tier 3: Cryo-Neon Laser Scan Cleanser (234..308f, laser sweep 244..300f)
    - Tier 4: Thermal Ash Disintegration (234..308f, incandescent hiss & cooling embers)
  * 308..319 (12f): Pure silent air and settled clean table before next tier assembly.
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

from compose_asmr import ASMRMixer, STUDIO_DIR, FOLEY_DIR, SAMPLE_RATE, FPS, load_wav, pitch_shift, mix_sample

# Upgraded timeline constants (320 frames per tier, 1280 frames total = 42.6667s @ 30 FPS)
TOTAL_FRAMES = 1280
TIER_FRAMES = 320
TOTAL_SAMPLES = int((TOTAL_FRAMES / FPS) * SAMPLE_RATE)  # exactly 1,881,600 samples

# Deterministic cleanser assignment matching getTierTransition("hydraulic_press_progression", tier)
DEFAULT_CLEANSER_EFFECTS = {
    1: "pneumatic_air_blast",
    2: "black_hole_singularity",
    3: "laser_scan_cleanser",
    4: "ash_disintegration",
}

class PressASMRMixer(ASMRMixer):
    """Specialized Foley mixer for Press Progression with envelope trimming, varispeed pitch bending, reverse intake, and cleansers."""

    def __init__(self, total_frames=TOTAL_FRAMES):
        super().__init__(total_frames=total_frames)

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

    def add_pitch_bend_tone(self, category, filename, start_frame, duration_frames,
                            semi_start=0.0, semi_end=-6.0, gain_db=0.0,
                            fade_in_frames=2, fade_out_frames=4, pan=0.0, desc=""):
        """
        Authentic procedural varispeed pitch bend applied to a real CC0 studio Foley asset.
        Resamples raw WAV along a continuous phase acceleration trajectory.
        Zero synthetic sine waves!
        """
        rel_path = self.get_sample_path(category, filename)
        raw = load_wav(rel_path)
        target_len = int((duration_frames / FPS) * SAMPLE_RATE)
        
        s0 = 2.0 ** (semi_start / 12.0)
        s1 = 2.0 ** (semi_end / 12.0)
        u = np.arange(target_len, dtype=np.float64)
        phase = s0 * u + (s1 - s0) / (2.0 * target_len) * (u ** 2)
        
        needed_len = int(np.ceil(phase[-1])) + 2
        repeats = max(1, int(np.ceil(needed_len / len(raw))))
        raw_ext = np.tile(raw, (repeats, 1))
        
        out_l = np.interp(phase, np.arange(len(raw_ext)), raw_ext[:, 0])
        out_r = np.interp(phase, np.arange(len(raw_ext)), raw_ext[:, 1])
        bent = np.column_stack((out_l, out_r)).astype(np.float32)
        
        fade_in_samples = int((fade_in_frames / FPS) * SAMPLE_RATE)
        fade_out_samples = int((fade_out_frames / FPS) * SAMPLE_RATE)
        if fade_in_samples > 0 and fade_in_samples < len(bent):
            envelope_in = np.sin(np.linspace(0, np.pi / 2, fade_in_samples)) ** 2
            bent[:fade_in_samples, 0] *= envelope_in
            bent[:fade_in_samples, 1] *= envelope_in
        if fade_out_samples > 0 and fade_out_samples < len(bent):
            envelope_out = np.sin(np.linspace(np.pi / 2, 0, fade_out_samples)) ** 2
            bent[-fade_out_samples:, 0] *= envelope_out
            bent[-fade_out_samples:, 1] *= envelope_out
            
        mix_sample(self.master, bent, at_frame=start_frame, gain_db=gain_db, pan=pan)
        self.bom.append({
            "frame": start_frame,
            "category": category,
            "sample": rel_path,
            "gain_db": gain_db,
            "pitch_semitones": f"{semi_start:.1f}->{semi_end:.1f}",
            "desc": desc
        })

    def add_reverse_tone(self, category, filename, start_frame, duration_frames, 
                         semitones=0.0, gain_db=0.0, fade_in_frames=8, fade_out_frames=2, 
                         pan=0.0, desc=""):
        """Adds a time-reversed audio sample for authentic acoustic vacuum whoosh/intake."""
        rel_path = self.get_sample_path(category, filename)
        raw = load_wav(rel_path)
        if semitones != 0.0:
            raw = pitch_shift(raw, semitones)
        raw = raw[::-1, :].copy()
        
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
            "sample": rel_path + " (reversed)",
            "gain_db": gain_db,
            "pitch_semitones": semitones,
            "desc": desc
        })

    # =========================================================================
    # --- DEDICATED 74-FRAME PROCEDURAL CLEANSER TRANSITIONS (Frames 234..308) ---
    # =========================================================================

    def add_ash_disintegration(self, base_frame):
        """
        Cleanser: ash_disintegration (Local 234..308f, 74 frames)
        - 234..265: Sizzling hot slag & incandescent thermal hiss.
        - 250..300: Granular cooling crackles across bed.
        - 270..308: Soft wind gust dispersing embers off-stage.
        """
        # Sizzling hot slag
        self.add_continuous_tone("mechanisms/motors", "thruster_fire_001.wav", base_frame + 234, 32,
                                 semitones=2.0, gain_db=-1.5, fade_in_frames=3, fade_out_frames=8,
                                 pan=0.0, desc="Cleanser (Ash): Sizzling Hot Slag Steam Hiss")
        self.add_event("impacts/explosions", base_frame + 235, "explosion_crunch_003.wav",
                       semitones=3.0, gain_db=-2.0, pan=0.1, desc="Cleanser (Ash): Thermal Slag Crust Pop")

        # Cooling crackles across the bed (250..300)
        crackle_offsets = [252, 260, 268, 276, 284, 292, 298]
        for idx, cf in enumerate(crackle_offsets):
            s_idx = idx % 5
            pan = 0.22 if idx % 2 == 0 else -0.22
            decay_gain = -2.5 - (idx * 0.8)
            self.add_event("materials/stone", base_frame + cf, f"impact_mining_{s_idx:03d}.wav",
                           semitones=2.5 + (idx % 3), gain_db=decay_gain, pan=pan,
                           desc=f"Cleanser (Ash): Cooling Specimen Crackle {idx+1}")
            if idx % 2 == 1:
                self.add_event("materials/metal", base_frame + cf + 1, f"impact_plate_light_{s_idx:03d}.wav",
                               semitones=4.0, gain_db=decay_gain - 2.0, pan=-pan * 0.5,
                               desc=f"Cleanser (Ash): Bed Thermal Contraction Ping {idx+1}")

        # Wind gust dispersing embers off-stage (270..308)
        self.add_continuous_tone("mechanisms/motors", "space_engine_small_000.wav", base_frame + 270, 38,
                                 semitones=-2.0, gain_db=-5.0, fade_in_frames=8, fade_out_frames=8,
                                 pan=0.0, desc="Cleanser (Ash): Wind Gust Dispersing Embers")

    def add_laser_scan_cleanser(self, base_frame):
        """
        Cleanser: laser_scan_cleanser (Local 234..308f, 74 frames)
        - 234..243: High-voltage laser charge hum rising.
        - 244..300: Planar cutting laser sweep across bed with plasma sizzle.
        - 298..306: Resonant cooling pings.
        """
        # High-voltage laser hum rising
        self.add_pitch_bend_tone("mechanisms/scifi_laser", "force_field_001.wav", base_frame + 234, 12,
                                 semi_start=1.0, semi_end=6.5, gain_db=-2.5,
                                 fade_in_frames=2, fade_out_frames=3, pan=-0.1,
                                 desc="Cleanser (Laser): High-Voltage Laser Hum Rising")

        # Continuous cutting plasma bed hiss (244..300)
        self.add_continuous_tone("mechanisms/motors", "thruster_fire_000.wav", base_frame + 244, 56,
                                 semitones=3.5, gain_db=-3.5, fade_in_frames=4, fade_out_frames=6,
                                 pan=0.0, desc="Cleanser (Laser): Planar Laser Plasma Bed Hiss")

        # Sharp cutting plasma zap sweep across the bed (stereo motion: -0.4 -> 0.0 -> +0.4)
        self.add_event("mechanisms/scifi_laser", base_frame + 252, "laser_large_001.wav",
                       semitones=3.0, gain_db=2.5, pan=-0.35, desc="Cleanser (Laser): Plasma Sweep Entry Zap")
        self.add_event("mechanisms/scifi_laser", base_frame + 268, "laser_large_002.wav",
                       semitones=4.0, gain_db=3.0, pan=0.0, desc="Cleanser (Laser): Plasma Sweep Center Cut")
        self.add_event("mechanisms/scifi_laser", base_frame + 284, "laser_large_003.wav",
                       semitones=2.5, gain_db=2.0, pan=0.35, desc="Cleanser (Laser): Plasma Sweep Exit Zap")
        self.add_event("mechanisms/scifi_laser", base_frame + 286, "force_field_003.wav",
                       semitones=2.0, gain_db=-1.0, pan=0.2, desc="Cleanser (Laser): Plasma Ionization Fizz")

        # Crystalline cooling pings (298..306)
        self.add_event("materials/glass", base_frame + 298, "impact_glass_light_001.wav",
                       semitones=4.0, gain_db=0.5, pan=-0.15, desc="Cleanser (Laser): Quartz Bed Cooling Ping 1")
        self.add_event("materials/metal", base_frame + 304, "impact_plate_light_003.wav",
                       semitones=5.0, gain_db=-1.0, pan=0.2, desc="Cleanser (Laser): Bolster Cooling Ping 2")

    def add_pneumatic_air_blast(self, base_frame):
        """
        Cleanser: pneumatic_air_blast (Local 234..308f, 74 frames)
        - 234: Solenoid release valve pop & pilot blast.
        - 235..295: Long, rushing white-noise air blast jet.
        - 240..305: Metallic debris clattering off-screen across stereo.
        """
        # Compressed air release valve pop
        self.add_event("mechanisms/switches", base_frame + 234, "switch_004.wav",
                       gain_db=3.0, pan=-0.2, desc="Cleanser (Air): Solenoid Valve Trigger Snap")
        self.add_event("mechanisms/switches", base_frame + 234, "click_005.wav",
                       gain_db=2.0, pan=-0.2, desc="Cleanser (Air): Pneumatic Pilot Detent")
        self.add_event("materials/soft_plastic", base_frame + 234, "impact_soft_heavy_000.wav",
                       gain_db=1.0, pan=-0.15, desc="Cleanser (Air): Valve Seat Thump")

        # Sustained high-pressure rushing air jet across anvil bed (235..295, 60 frames)
        self.add_continuous_tone("mechanisms/motors", "thruster_fire_001.wav", base_frame + 235, 60,
                                 semitones=4.0, gain_db=-0.5, fade_in_frames=3, fade_out_frames=8,
                                 pan=0.0, desc="Cleanser (Air): Sustained Rushing Air Jet")
        self.add_continuous_tone("mechanisms/motors", "space_engine_small_004.wav", base_frame + 236, 55,
                                 semitones=3.5, gain_db=-3.0, fade_in_frames=2, fade_out_frames=6,
                                 pan=0.1, desc="Cleanser (Air): High-Velocity Nozzle Hiss")

        # Metallic debris clattering off-screen (panning across -0.2 -> 0.85)
        debris_hits = [
            (240, "impact_tin_medium_001.wav", 2.0, 1.5, -0.1),
            (248, "impact_plate_light_001.wav", 3.0, 0.5, 0.20),
            (258, "impact_metal_light_002.wav", 1.5, -0.5, 0.45),
            (270, "impact_tin_medium_004.wav", 2.5, -1.0, 0.65),
            (285, "impact_plate_light_000.wav", 3.5, -2.0, 0.80),
            (298, "impact_metal_light_003.wav", 4.0, -3.5, 0.90),
        ]
        for f_off, smp, semi, gain, pan in debris_hits:
            self.add_event("materials/metal", base_frame + f_off, smp,
                           semitones=semi, gain_db=gain, pan=pan,
                           desc=f"Cleanser (Air): Metallic Chip Clattering Off-Screen @ +{f_off}f")

    def add_black_hole_singularity(self, base_frame):
        """
        Cleanser: black_hole_singularity (Local 234..308f, 74 frames)
        - 234..247f: Gravitational anomaly birth (deep sub-bass velvet rumble & vacuum grip).
        - 248..300f: Inward debris suction & accretion disk swirl (reverse vacuum whoosh, spiraling matter particles).
        - 305..308f: Quantum micro-implosion / singularity collapse (instantaneous, dry, crisp vacuum pop).
        - 308..319f: Pure silent air (pure velvet silence before frame 320 next tier assembly).
        """
        # Phase 1 (234..247f): Deep sub-bass gravitational anomaly birth
        self.add_event("impacts/explosions", base_frame + 234, "low_frequency_explosion_000.wav",
                       semitones=-4.0, gain_db=3.0, pan=0.0, max_duration_frames=14, fade_out_frames=6,
                       desc="Cleanser (Black Hole): Gravitational Anomaly Sub-Bass Birth")
        self.add_continuous_tone("mechanisms/motors", "space_engine_low_001.wav", base_frame + 234, 14,
                                 semitones=-6.0, gain_db=-2.0, fade_in_frames=4, fade_out_frames=4,
                                 pan=0.0, desc="Cleanser (Black Hole): Event Horizon Resonant Hum")
        self.add_event("mechanisms/scifi_laser", base_frame + 235, "force_field_000.wav",
                       semitones=-3.0, gain_db=1.0, pan=0.0, desc="Cleanser (Black Hole): Gravitational Flux Grip")

        # Phase 2 (248..300f): Accretion disk spinning & debris inward suction (52 frames)
        # 1. Reverse vacuum whoosh (acoustic foley reverse intake)
        self.add_reverse_tone("mechanisms/motors", "thruster_fire_004.wav", base_frame + 248, 52,
                              semitones=2.0, gain_db=1.0, fade_in_frames=10, fade_out_frames=2,
                              pan=0.0, desc="Cleanser (Black Hole): Accretion Disk Reverse Vacuum Suction Whoosh")
        # 2. Rising gravitational frequency warp
        self.add_pitch_bend_tone("mechanisms/motors", "space_engine_small_001.wav", base_frame + 250, 50,
                                 semi_start=-2.0, semi_end=6.0, gain_db=-2.0, fade_in_frames=8, fade_out_frames=2,
                                 pan=0.0, desc="Cleanser (Black Hole): Relativistic Frequency Inward Warp")
        # 3. Accretion plasma vortex hum
        self.add_continuous_tone("mechanisms/motors", "space_engine_001.wav", base_frame + 248, 52,
                                 semitones=3.0, gain_db=-3.5, fade_in_frames=8, fade_out_frames=3,
                                 pan=0.0, desc="Cleanser (Black Hole): Accretion Disk Plasma Vortex")

        # 4. Swirling matter particle stream (stereo spiral inward 250..298)
        swirl_moments = [
            (250, "impact_glass_light_000.wav", 1.0, -1.0, -0.35),
            (256, "impact_plate_light_001.wav", 2.0, 0.0, 0.35),
            (262, "impact_tin_medium_000.wav", 2.5, -0.5, -0.40),
            (268, "impact_glass_light_002.wav", 3.0, 0.5, 0.40),
            (274, "impact_plate_light_002.wav", 3.5, 0.0, -0.30),
            (280, "impact_tin_medium_002.wav", 4.0, 0.8, 0.30),
            (286, "impact_glass_light_003.wav", 4.5, 0.5, -0.20),
            (292, "impact_plate_light_004.wav", 5.0, 1.0, 0.20),
            (298, "impact_glass_light_004.wav", 5.5, 1.2, 0.0),
        ]
        for f_off, smp_name, semi, gain, pan in swirl_moments:
            cat = "materials/glass" if "glass" in smp_name else "materials/metal"
            self.add_event(cat, base_frame + f_off, smp_name,
                           semitones=semi, gain_db=gain, pan=pan, max_duration_frames=4, fade_out_frames=2,
                           desc=f"Cleanser (Black Hole): Inward Swirling Matter Particle @ +{f_off}f")

        # Phase 3 (305..308f): Instantaneous Quantum Micro-Implosion Collapse (Vacuum Pop)
        self.add_event("mechanisms/switches", base_frame + 306, "switch_004.wav",
                       semitones=3.0, gain_db=3.5, pan=0.0, max_duration_frames=2, fade_out_frames=1,
                       desc="Cleanser (Black Hole): Singularity Implosion Vacuum Pop")
        self.add_event("materials/soft_plastic", base_frame + 306, "impact_soft_heavy_001.wav",
                       semitones=4.0, gain_db=2.5, pan=0.0, max_duration_frames=2, fade_out_frames=1,
                       desc="Cleanser (Black Hole): Micro-Cavitation Collapse Snap")
        self.add_event("mechanisms/scifi_laser", base_frame + 306, "force_field_004.wav",
                       semitones=5.0, gain_db=2.0, pan=0.0, max_duration_frames=2, fade_out_frames=1,
                       desc="Cleanser (Black Hole): Quantum Horizon Pinch Spark")
        self.add_event("impacts/explosions", base_frame + 306, "explosion_crunch_002.wav",
                       semitones=6.0, gain_db=1.0, pan=0.0, max_duration_frames=2, fade_out_frames=1,
                       desc="Cleanser (Black Hole): High-Energy Annihilation Transient")

        # Phase 4 (308..319f): Pure Silent Air (nothing scheduled, clean room anticipation)

    def add_cleanser_transition(self, effect_name, base_frame):
        """Dispatches to the appropriate procedural Foley cleanser transition layer."""
        if effect_name == "ash_disintegration":
            self.add_ash_disintegration(base_frame)
        elif effect_name == "laser_scan_cleanser":
            self.add_laser_scan_cleanser(base_frame)
        elif effect_name == "pneumatic_air_blast":
            self.add_pneumatic_air_blast(base_frame)
        elif effect_name in ("black_hole_singularity", "stage_drop_trap"):
            self.add_black_hole_singularity(base_frame)
        else:
            raise ValueError(f"Unknown cleanser effect: {effect_name}")


def generate_press_asmr_track(out_wav=None, bom_json=None, cleanser_effects=None):
    if out_wav is None:
        out_wav = os.path.join(STUDIO_DIR, "public", "audio", "asmr_press_progression.wav")
    if bom_json is None:
        bom_json = os.path.join(STUDIO_DIR, "public", "audio", "asmr_press_bom.json")

    effects = DEFAULT_CLEANSER_EFFECTS.copy()
    if cleanser_effects:
        effects.update(cleanser_effects)

    mixer = PressASMRMixer(total_frames=TOTAL_FRAMES)

    # =========================================================================
    # --- TIER 1 ($10 Manual Flywheel Screw Press, Frames 0..319) ---
    # =========================================================================
    t1_base = 0

    # --- Act 1 (0..62f): Snap Assembly ---
    # Frame 0: Heavy cast-iron press anvil bed landing thud
    mixer.add_event("materials/wood", t1_base + 0, "impact_wood_heavy_000.wav", gain_db=2.5, pan=0.0, desc="Tier 1 Bed Timber Landing Thud")
    mixer.add_event("materials/metal", t1_base + 0, "impact_metal_heavy_000.wav", gain_db=2.0, pan=0.0, desc="Tier 1 Cast Iron Anvil Settle")
    mixer.add_event("impacts/locks", t1_base + 0, "drop_001.wav", gain_db=-1.0, pan=-0.1, desc="Tier 1 Sub-Bass Bed Mass Dock")

    # Frame 15: Dual Acme screw thread & guide columns dock
    mixer.add_event("mechanisms/switches", t1_base + 15, "click_001.wav", gain_db=2.0, pan=-0.15, desc="Tier 1 Acme Screw Socket Detent")
    mixer.add_event("materials/metal", t1_base + 15, "impact_metal_light_000.wav", gain_db=1.0, pan=-0.1, desc="Tier 1 Screw Thread Seat Friction")
    mixer.add_event("materials/metal", t1_base + 15, "impact_plate_light_001.wav", gain_db=0.5, pan=-0.2, desc="Tier 1 Guide Column Ring")

    # Frame 30: Bronze collar & thrust bearing latch
    mixer.add_event("mechanisms/switches", t1_base + 30, "switch_001.wav", gain_db=2.5, pan=0.15, desc="Tier 1 Bronze Collar Latch Clack")
    mixer.add_event("materials/metal", t1_base + 30, "impact_metal_light_002.wav", gain_db=1.0, pan=0.2, desc="Tier 1 Bearing Metallic Seat")

    # Frame 45: Heavy cast-iron flywheel snap & T-handle lock
    mixer.add_event("mechanisms/switches", t1_base + 45, "switch_003.wav", gain_db=3.0, pan=0.0, desc="Tier 1 Flywheel Lock Snap")
    mixer.add_event("materials/metal", t1_base + 45, "impact_plate_medium_000.wav", gain_db=2.0, pan=0.05, desc="Tier 1 Cast Flywheel Seat Ring")
    mixer.add_event("impacts/locks", t1_base + 45, "door_close_000.wav", gain_db=-1.5, pan=0.1, desc="Tier 1 Flywheel Mass Clang")

    # Frame 60: Hardened tool-steel punch die nose dock
    mixer.add_event("mechanisms/switches", t1_base + 60, "switch_005.wav", gain_db=2.5, pan=0.0, desc="Tier 1 Punch Toolhead Dock Detent")
    mixer.add_event("materials/metal", t1_base + 60, "impact_plate_light_002.wav", gain_db=1.5, pan=0.05, desc="Tier 1 Punch Toolhead Latch Ring")

    # --- Act 2 (63..122f): Manual Crank Squeaks & Handle Spin Whir ---
    mixer.add_event("mechanisms/switches", t1_base + 63, "toggle_001.wav", gain_db=2.5, pan=0.0, desc="Tier 1 Handle Ratchet Toggle")
    mixer.add_event("mechanisms/switches", t1_base + 63, "click_003.wav", gain_db=1.5, pan=0.1, desc="Tier 1 Pawl Engagement")

    crank_moments = [
        (68, "impact_wood_light_000.wav", -1.0, -1.0, "tick_001.wav", -0.2),
        (76, "impact_plank_medium_001.wav", 0.0, -1.5, "tick_002.wav", 0.15),
        (84, "impact_wood_light_002.wav", 1.0, -0.5, "tick_004.wav", -0.15),
        (92, "impact_metal_light_001.wav", 2.0, 0.0, "tick_001.wav", 0.2),
        (100, "impact_wood_medium_000.wav", 1.5, 0.5, "tick_002.wav", -0.1),
    ]
    for frame_off, wood_smp, semi, gain, tick_smp, pan in crank_moments:
        mixer.add_event("materials/wood", t1_base + frame_off, wood_smp, semitones=semi, gain_db=gain, pan=pan, 
                        desc=f"Tier 1 Manual Crank Creak @ {frame_off}f")
        mixer.add_event("mechanisms/switches", t1_base + frame_off, tick_smp, gain_db=gain - 1.0, pan=pan * 0.5, 
                        desc=f"Tier 1 Crank Ratchet Tick @ {frame_off}f")

    # Flywheel spin whir smoothly bridging into compression strikes
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_000.wav", t1_base + 85, 30,
                              semitones=2.0, gain_db=-7.0, fade_in_frames=4, fade_out_frames=4,
                              pan=0.0, desc="Tier 1 Flywheel High-Speed Spin Whir")
    for f in [86, 92, 98, 104, 110]:
        mixer.add_event("mechanisms/switches", t1_base + f, "tick_004.wav", gain_db=-3.0, pan=0.1 * ((f % 2) * 2 - 1),
                        desc="Tier 1 Flywheel Revolution Tick")

    # --- Act 3 (123..212f): Copper Compression ASMR, Metal Strain, Rhythmic Thuds ---
    # Ram strikes copper specimen at EXACT kinematic contact frames: [134, 156, 178, 200]
    t1_compressions = [134, 156, 178, 200]
    for idx, f in enumerate(t1_compressions):
        s_idx = idx % 5
        pan = 0.18 if idx % 2 == 0 else -0.18
        progress = idx / len(t1_compressions)
        gain_boost = progress * 1.5

        # Layer 1: Heavy ram impact thud
        mixer.add_event("materials/metal", t1_base + f, f"impact_metal_heavy_{s_idx:03d}.wav",
                        semitones=-1.0 + (idx % 2), gain_db=1.5 + gain_boost, pan=pan,
                        desc=f"Tier 1 Compression Stroke {idx+1} (Ram Thud)")
        # Layer 2: Copper deformation ASMR & malleable crunch
        mixer.add_event("materials/soft_plastic", t1_base + f, f"impact_soft_heavy_{s_idx:03d}.wav",
                        semitones=1.0, gain_db=1.0 + gain_boost, pan=-pan * 0.5,
                        desc=f"Tier 1 Copper Malleable Crunch {idx+1}")
        mixer.add_event("materials/metal", t1_base + f + 1, f"impact_tin_medium_{s_idx:03d}.wav",
                        semitones=0.5, gain_db=0.0 + gain_boost, pan=pan * 0.7,
                        desc=f"Tier 1 Copper Specimen Yield ASMR {idx+1}")
        # Layer 3: Screw thread strain ring
        mixer.add_event("materials/metal", t1_base + f, f"impact_plate_light_{s_idx:03d}.wav",
                        semitones=2.0 + (idx % 3) * 0.5, gain_db=-2.0 + gain_boost, pan=pan * 0.4,
                        desc=f"Tier 1 Thread Torque Strain Ping {idx+1}")
        # Layer 4: Cast frame reaction creak
        mixer.add_event("materials/wood", t1_base + f + 2, f"impact_wood_medium_{s_idx:03d}.wav",
                        semitones=0.0, gain_db=-2.5 + gain_boost, pan=-pan * 0.8,
                        desc=f"Tier 1 Frame Creak Reaction {idx+1}")

    # Tactile copper flattening ASMR loop running through Act 3
    mixer.add_rapid_loop("materials/soft_plastic", t1_base + 115, t1_base + 212, interval_frames=6, gain_db=-2.0, pitch_var=1.5,
                         desc="Tier 1 Tactile Copper Flattening ASMR")

    # --- Act 4 (213..319f): Fluid Escalation, Acme Thread Rupture @ 234 & 74-Frame Cleanser ---
    # 213..224f: Pitch drop / torque groaning layer (flywheel pitch dive)
    mixer.add_pitch_bend_tone("mechanisms/motors", "engine_circular_001.wav", t1_base + 213, 12,
                              semi_start=-1.0, semi_end=-6.0, gain_db=-2.5, fade_in_frames=2, fade_out_frames=3,
                              pan=0.0, desc="Tier 1 Flywheel Deceleration Torque Pitch Dive")
    mixer.add_event("materials/metal", t1_base + 214, "impact_metal_medium_001.wav", semitones=-3.0, gain_db=2.0, pan=-0.1,
                    desc="Tier 1 Heavy Thread Friction Groan")
    mixer.add_event("materials/wood", t1_base + 218, "impact_wood_heavy_002.wav", semitones=-2.0, gain_db=1.5, pan=0.15,
                    desc="Tier 1 Timber Bed Groan Under Stalled Torque")
    mixer.add_event("materials/metal", t1_base + 222, "impact_plate_medium_000.wav", semitones=-1.0, gain_db=1.0, pan=-0.1,
                    desc="Tier 1 Guide Column Metallic Shudder")

    # 225..233f: Resonant pre-fracture shudder wave (increasing frequency & amplitude)
    t1_shudder_frames = [225, 227, 229, 231, 232, 233]
    for i, sf in enumerate(t1_shudder_frames):
        ratio = i / len(t1_shudder_frames)
        mixer.add_event("mechanisms/switches", t1_base + sf, "tick_001.wav",
                        gain_db=-1.0 + ratio * 3.5, pan=0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 1 Thread Shudder Tick {i+1}")
        mixer.add_event("materials/metal", t1_base + sf, f"impact_metal_light_{i%5:03d}.wav",
                        semitones=1.0 + ratio * 2.5, gain_db=-2.0 + ratio * 4.0, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 1 Thread Resonant Chatter {i+1}")

    # Local frame 234: CATASTROPHIC RUPTURE TRANSIENT (Single synchronized shockwave)
    mixer.add_event("materials/metal", t1_base + 234, "impact_metal_heavy_001.wav", semitones=1.0, gain_db=5.0, pan=0.0,
                    desc="Tier 1 Acme Thread Violent Shear Snap")
    mixer.add_event("materials/wood", t1_base + 234, "impact_wood_heavy_003.wav", semitones=2.0, gain_db=4.0, pan=-0.1,
                    desc="Tier 1 Frame Cleavage Crack")
    mixer.add_event("impacts/locks", t1_base + 234, "drop_001.wav", gain_db=2.0, pan=0.0,
                    desc="Tier 1 Deep Sub-Bass Bed Mass Impact Thud")
    mixer.add_event("materials/metal", t1_base + 234, "impact_plate_light_003.wav", semitones=3.5, gain_db=3.0, pan=0.2,
                    desc="Tier 1 Sheared Thread Metallic Ring")
    mixer.add_event("materials/metal", t1_base + 235, "impact_tin_medium_002.wav", semitones=2.0, gain_db=2.5, pan=-0.15,
                    desc="Tier 1 Bronze Shrapnel Ping")

    # Local frames 234..308: 74-Frame Cleanser Transition (Pneumatic Radial Air Blast)
    mixer.add_cleanser_transition(effects[1], t1_base)
    # Local frames 308..319: Pure silent air before Tier 2 at 320!


    # =========================================================================
    # --- TIER 2 ($100 Motorized Eccentric Punch Press, Frames 320..639) ---
    # =========================================================================
    t2_base = 320

    # --- Act 1 (320..382f / local 0..62): Snap Assembly ---
    mixer.add_event("materials/metal", t2_base + 0, "impact_metal_heavy_000.wav", gain_db=4.0, pan=0.0, desc="Tier 2 Welded Chassis Heavy Landing")
    mixer.add_event("impacts/locks", t2_base + 0, "door_close_000.wav", gain_db=2.5, pan=-0.1, desc="Tier 2 Heavy Steel Base Dock Thud")
    mixer.add_event("materials/metal", t2_base + 0, "impact_plate_heavy_000.wav", gain_db=2.0, pan=0.1, desc="Tier 2 Bed Plate Resonance")

    mixer.add_event("materials/metal", t2_base + 15, "impact_plate_medium_000.wav", gain_db=2.0, pan=-0.15, desc="Tier 2 Crankshaft Journal Seat")
    mixer.add_event("mechanisms/switches", t2_base + 15, "click_003.wav", gain_db=2.5, pan=-0.2, desc="Tier 2 Crankshaft Bearing Detent Lock")

    mixer.add_event("impacts/locks", t2_base + 30, "door_close_001.wav", gain_db=3.0, pan=0.15, desc="Tier 2 Motor Stator Housing Snap")
    mixer.add_event("mechanisms/switches", t2_base + 30, "switch_002.wav", gain_db=2.5, pan=0.2, desc="Tier 2 Motor Bracket Clamp Latch")
    mixer.add_event("materials/metal", t2_base + 30, "impact_metal_light_001.wav", gain_db=1.5, pan=0.1, desc="Tier 2 Aluminum Housing Seat Ring")

    mixer.add_event("mechanisms/switches", t2_base + 45, "switch_005.wav", gain_db=2.5, pan=-0.1, desc="Tier 2 V-Belt Idler Tensioner Snap")
    mixer.add_event("materials/metal", t2_base + 45, "impact_plate_medium_002.wav", gain_db=2.0, pan=-0.05, desc="Tier 2 Flywheel Keyway Lock")

    mixer.add_event("mechanisms/switches", t2_base + 60, "click_005.wav", gain_db=2.5, pan=0.0, desc="Tier 2 Ram Punch Toolhead Dock Detent")
    mixer.add_event("materials/metal", t2_base + 60, "impact_plate_light_000.wav", gain_db=2.0, pan=0.05, desc="Tier 2 Ram Punch Slide Clamp")

    # --- Act 2 (383..442f / local 63..122): Switch Clack, Electric Motor Spool-Up, V-Belt Whir ---
    mixer.add_event("mechanisms/switches", t2_base + 63, "switch_004.wav", gain_db=3.5, pan=0.0, desc="Tier 2 Knife Switch Contact Clack")
    mixer.add_event("mechanisms/switches", t2_base + 63, "switch_001.wav", gain_db=2.0, pan=0.05, desc="Tier 2 Switch Detent Snap")

    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_001.wav", t2_base + 65, 35,
                              semitones=1.0, gain_db=-3.0, fade_in_frames=8, fade_out_frames=4,
                              pan=-0.1, desc="Tier 2 AC Induction Motor Spool-Up")
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_small_000.wav", t2_base + 68, 32,
                              semitones=2.5, gain_db=-5.0, fade_in_frames=8, fade_out_frames=4,
                              pan=0.15, desc="Tier 2 High-Speed V-Belt Whir")
    for idx, f in enumerate([70, 78, 86, 94, 100]):
        mixer.add_event("mechanisms/switches", t2_base + f, "tick_004.wav", gain_db=-2.0, pan=0.15 * ((idx % 2) * 2 - 1),
                        desc=f"Tier 2 Pulley Revolution Tick {idx+1}")

    # --- Act 3 (443..532f / local 123..212): 10 Mechanical Punching Strikes ---
    # Cadence: 10 strikes at exact physical contact frames: [127, 136, 145, 154, 163, 171, 180, 189, 198, 207]
    t2_punches = [127, 136, 145, 154, 163, 171, 180, 189, 198, 207]
    mixer.add_continuous_tone("mechanisms/motors", "engine_circular_002.wav", t2_base + 100, 113,
                              semitones=2.0, gain_db=-4.5, fade_in_frames=6, fade_out_frames=6,
                              pan=-0.1, desc="Tier 2 Continuous Punching Motor Hum")

    for idx, f in enumerate(t2_punches):
        s_idx = idx % 5
        pan = 0.22 if idx % 2 == 0 else -0.22
        progress = idx / len(t2_punches)
        gain_boost = progress * 1.5

        # Layer 1: Sharp mechanical slap
        mixer.add_event("materials/metal", t2_base + f, f"impact_plate_light_{s_idx:03d}.wav",
                        semitones=1.5, gain_db=1.5 + gain_boost, pan=pan * 0.8,
                        desc=f"Tier 2 Punch Stroke {idx+1} (Slide Slap)")
        # Layer 2: Heavy punch impact transient
        mixer.add_event("materials/metal", t2_base + f, f"impact_plate_heavy_{s_idx:03d}.wav",
                        semitones=(idx % 3) - 1.0, gain_db=2.5 + gain_boost, pan=pan,
                        desc=f"Tier 2 Punch Stroke {idx+1} (Die Impact)")
        # Layer 3: Tactile aluminum crunch ASMR
        mixer.add_event("materials/metal", t2_base + f + 1, f"impact_tin_medium_{s_idx:03d}.wav",
                        semitones=1.0, gain_db=1.5 + gain_boost, pan=-pan * 0.5,
                        desc=f"Tier 2 Aluminum Punch ASMR {idx+1}")
        mixer.add_event("materials/soft_plastic", t2_base + f + 1, f"impact_soft_heavy_{s_idx:03d}.wav",
                        semitones=0.0, gain_db=0.0 + gain_boost, pan=pan * 0.5,
                        desc=f"Tier 2 Metal Sheet Shear Crunch {idx+1}")
        # Layer 4: Resonant die ring
        mixer.add_event("materials/metal", t2_base + f, f"impact_metal_light_{s_idx:03d}.wav",
                        semitones=2.5 + (idx % 2), gain_db=-1.5 + gain_boost, pan=pan * 0.3,
                        desc=f"Tier 2 Hardened Tool Steel Die Ping {idx+1}")

    # --- Act 4 (533..639f / local 213..319): Fluid Escalation, Connecting Rod Buckling @ 234 & Black Hole Cleanser ---
    # 213..224f local (533..544f global): Pitch drop / motor torque dive
    mixer.add_pitch_bend_tone("mechanisms/motors", "engine_circular_003.wav", t2_base + 213, 12,
                              semi_start=0.5, semi_end=-6.5, gain_db=-1.5, fade_in_frames=2, fade_out_frames=3,
                              pan=-0.1, desc="Tier 2 Induction Motor Torque Pitch Dive")
    mixer.add_event("materials/soft_plastic", t2_base + 215, "impact_soft_heavy_002.wav", gain_db=1.5, pan=0.15,
                    desc="Tier 2 V-Belt Friction Squeal")
    mixer.add_event("materials/metal", t2_base + 218, "impact_plate_heavy_000.wav", gain_db=2.0, pan=-0.1,
                    desc="Tier 2 Crankshaft Locked Torque Strain")
    mixer.add_event("materials/metal", t2_base + 222, "impact_metal_medium_003.wav", gain_db=1.5, pan=0.1,
                    desc="Tier 2 Chassis Resonant Shudder")

    # 225..233f local (545..553f global): Resonant pre-fracture bolt chatter & vibration rattling build-up
    t2_shudder_frames = [225, 227, 229, 231, 232, 233]
    for i, sf in enumerate(t2_shudder_frames):
        ratio = i / len(t2_shudder_frames)
        mixer.add_event("materials/metal", t2_base + sf, f"impact_plate_medium_{i%5:03d}.wav",
                        semitones=0.5 * i, gain_db=1.0 + ratio * 3.0, pan=0.18 * ((i % 2) * 2 - 1),
                        desc=f"Tier 2 Binding Shudder Impact {i+1}")
        mixer.add_event("mechanisms/switches", t2_base + sf, "click_004.wav",
                        gain_db=1.5 + ratio * 2.0, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 2 Crank Pin Chatter Click {i+1}")

    # Local frame 234 (554f global): CATASTROPHIC RUPTURE TRANSIENT
    mixer.add_event("materials/metal", t2_base + 234, "impact_metal_heavy_002.wav", semitones=1.0, gain_db=5.5, pan=-0.15,
                    desc="Tier 2 Forged Connecting Rod Buckling Crack")
    mixer.add_event("impacts/explosions", t2_base + 234, "explosion_crunch_000.wav", semitones=-0.5, gain_db=4.0, pan=0.1,
                    desc="Tier 2 Crankshaft Jam Explosive Blast")
    mixer.add_event("impacts/explosions", t2_base + 234, "low_frequency_explosion_000.wav", semitones=0.0, gain_db=3.5, pan=0.0,
                    desc="Tier 2 Sub-Bass Bed Structural Shock")
    mixer.add_event("materials/metal", t2_base + 234, "impact_plate_heavy_001.wav", semitones=2.0, gain_db=3.0, pan=0.2,
                    desc="Tier 2 Flywheel Inertial Snap Shock")

    # Local frames 234..308 (554..628f global): 74-Frame Cleanser Transition (Black Hole Gravitational Singularity)
    mixer.add_cleanser_transition(effects[2], t2_base)
    # Local frames 308..319: Pure silent air before Tier 3 at 640!


    # =========================================================================
    # --- TIER 3 ($1,000 Quad-Piston Hydraulic Forging Press, Frames 640..959) ---
    # =========================================================================
    t3_base = 640

    # --- Act 1 (640..702f / local 0..62): Snap Assembly ---
    mixer.add_event("materials/metal", t3_base + 0, "impact_plate_heavy_001.wav", gain_db=5.5, pan=0.0, desc="Tier 3 Bolster Plate Seismic Landing")
    mixer.add_event("materials/metal", t3_base + 0, "impact_metal_heavy_003.wav", gain_db=4.5, pan=0.1, desc="Tier 3 Anvil Bed Massive Thud")
    mixer.add_event("materials/stone", t3_base + 0, "footstep_concrete_000.wav", gain_db=3.0, pan=-0.1, desc="Tier 3 Foundation Concrete Shockwave")

    mixer.add_event("materials/metal", t3_base + 15, "impact_metal_heavy_001.wav", gain_db=3.5, pan=-0.2, desc="Tier 3 Quad Chrome Columns Seat")
    mixer.add_event("impacts/locks", t3_base + 15, "door_close_002.wav", gain_db=3.0, pan=-0.15, desc="Tier 3 Hydraulic Lower Seal Dock")
    mixer.add_event("mechanisms/switches", t3_base + 15, "click_005.wav", gain_db=3.0, pan=-0.1, desc="Tier 3 Locking Collar Detent")

    mixer.add_event("materials/metal", t3_base + 30, "impact_plate_heavy_002.wav", gain_db=4.0, pan=0.2, desc="Tier 3 Hydraulic Gantry Crown Dock")
    mixer.add_event("impacts/locks", t3_base + 30, "door_close_001.wav", gain_db=3.0, pan=0.15, desc="Tier 3 Massive Upper Platen Lock")
    mixer.add_event("mechanisms/switches", t3_base + 30, "switch_006.wav", gain_db=2.5, pan=0.1, desc="Tier 3 Manifold Coupler Detent")

    mixer.add_event("mechanisms/switches", t3_base + 45, "switch_002.wav", gain_db=3.0, pan=-0.15, desc="Tier 3 Power Unit Latch Snap")
    mixer.add_event("materials/metal", t3_base + 45, "impact_plate_medium_001.wav", gain_db=2.5, pan=-0.1, desc="Tier 3 Power Unit Bracket Seat")

    mixer.add_event("impacts/locks", t3_base + 60, "door_close_000.wav", gain_db=3.5, pan=0.0, desc="Tier 3 Crosshead Die Mass Dock")
    mixer.add_event("materials/metal", t3_base + 60, "impact_metal_heavy_002.wav", gain_db=3.0, pan=0.05, desc="Tier 3 Crosshead Die Guide Lock")

    # --- Act 2 (703..762f / local 63..122): Valve Lever Clack, 500-Bar Pump Whine & Fluid Surge ---
    mixer.add_event("mechanisms/switches", t3_base + 63, "switch_001.wav", gain_db=4.0, pan=0.0, desc="Tier 3 Hydraulic Valve Lever Clack")
    mixer.add_event("mechanisms/switches", t3_base + 63, "switch_003.wav", gain_db=3.0, pan=-0.05, desc="Tier 3 Pilot Spool Detent")
    mixer.add_event("materials/metal", t3_base + 63, "impact_plate_medium_001.wav", gain_db=2.5, pan=0.05, desc="Tier 3 Valve Block Metal Ring")

    mixer.add_continuous_tone("mechanisms/motors", "space_engine_low_000.wav", t3_base + 65, 35,
                              semitones=2.0, gain_db=-2.5, fade_in_frames=8, fade_out_frames=4,
                              pan=-0.1, desc="Tier 3 500-Bar Hydraulic Axial Pump Whine")
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_000.wav", t3_base + 68, 32,
                              semitones=1.5, gain_db=-4.0, fade_in_frames=8, fade_out_frames=4,
                              pan=0.15, desc="Tier 3 High-Pressure Fluid Surge In Hoses")
    for idx, f in enumerate([72, 80, 88, 96]):
        mixer.add_event("mechanisms/switches", t3_base + f, "click_004.wav", gain_db=1.0, pan=0.12 * ((idx % 2) * 2 - 1),
                        desc=f"Tier 3 Hydraulic Check Valve Click {idx+1}")

    # --- Act 3 (763..852f / local 123..212): 500-Ton Tonnage Drone & 5 Heavy Ram Strikes ---
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_low_001.wav", t3_base + 100, 113,
                              semitones=0.0, gain_db=-1.0, fade_in_frames=6, fade_out_frames=6,
                              pan=0.0, desc="Tier 3 Relentless 500-Ton Pressurization Drone")
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_001.wav", t3_base + 100, 113,
                              semitones=2.0, gain_db=-3.5, fade_in_frames=8, fade_out_frames=6,
                              pan=0.15, desc="Tier 3 Continuous High-Pressure Steam Hiss")

    # 4 Ram stroke thrusts at exact physical contact frames: [134, 156, 178, 200]
    t3_groan_frames = [134, 156, 178, 200]
    for idx, f in enumerate(t3_groan_frames):
        s_idx = idx % 5
        pan = 0.2 if idx % 2 == 0 else -0.2
        mixer.add_event("materials/metal", t3_base + f, f"impact_plate_heavy_{s_idx:03d}.wav",
                        semitones=-2.5, gain_db=2.5, pan=pan,
                        desc=f"Tier 3 Hydraulic Ram Groan {idx+1}")
        mixer.add_event("materials/metal", t3_base + f, f"impact_metal_heavy_{s_idx:03d}.wav",
                        semitones=-1.5, gain_db=2.0, pan=-pan * 0.5,
                        desc=f"Tier 3 Frame Strain Sub-Bass {idx+1}")

    # Workpiece core fracture ASMR
    t3_deform_frames = [114, 126, 139, 151, 164, 176, 189, 201, 212]
    for idx, f in enumerate(t3_deform_frames):
        s_idx = idx % 5
        pan = -0.22 if idx % 2 == 0 else 0.22
        mixer.add_event("materials/stone", t3_base + f, f"impact_mining_{s_idx:03d}.wav",
                        semitones=0.5, gain_db=1.5, pan=pan,
                        desc=f"Tier 3 Heavy Specimen Core Fracture ASMR {idx+1}")
        mixer.add_event("materials/metal", t3_base + f + 1, f"impact_tin_medium_{s_idx:03d}.wav",
                        semitones=-1.0, gain_db=1.0, pan=-pan * 0.7,
                        desc=f"Tier 3 Platen Micro-Yield Clank {idx+1}")

    mixer.add_rapid_loop("materials/stone", t3_base + 105, t3_base + 212, interval_frames=5, gain_db=-2.5, pitch_var=2.0,
                         desc="Tier 3 High-Pressure Aggregate Spall ASMR")

    # --- Act 4 (853..959f / local 213..319): Fluid Escalation, 600-Bar Seal Blowout @ 234 & Laser Cleanser ---
    # 213..224f local (853..864f global): Pitch drop / overpressure groaning
    mixer.add_pitch_bend_tone("mechanisms/motors", "thruster_fire_002.wav", t3_base + 213, 12,
                              semi_start=5.0, semi_end=-1.0, gain_db=1.0, fade_in_frames=2, fade_out_frames=3,
                              pan=0.1, desc="Tier 3 Pressure Relief Bypass Screech Pitch Dive")
    mixer.add_event("materials/metal", t3_base + 215, "impact_plate_heavy_002.wav", gain_db=2.5, pan=-0.1,
                    desc="Tier 3 Cylinder Wall Elastic Strain Groan")
    mixer.add_event("materials/metal", t3_base + 219, "impact_metal_heavy_003.wav", gain_db=2.0, pan=0.15,
                    desc="Tier 3 Tie-Rod Over-Tension Groan")
    mixer.add_event("materials/metal", t3_base + 223, "impact_metal_medium_004.wav", gain_db=1.5, pan=-0.1,
                    desc="Tier 3 Gantry Head Shudder")

    # 225..233f local (865..873f global): Cavitation shudder & check valve flutter
    t3_shudder_frames = [225, 227, 229, 231, 232, 233]
    for i, sf in enumerate(t3_shudder_frames):
        ratio = i / len(t3_shudder_frames)
        mixer.add_event("materials/metal", t3_base + sf, f"impact_plate_medium_{i%5:03d}.wav",
                        semitones=-1.0 + ratio * 2.5, gain_db=2.0 + ratio * 2.5, pan=0.2 * ((i % 2) * 2 - 1),
                        desc=f"Tier 3 Cavitation Shudder Pulse {i+1}")
        mixer.add_event("mechanisms/switches", t3_base + sf, "click_004.wav",
                        gain_db=1.0 + ratio * 2.0, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 3 Valve Flutter Click {i+1}")

    # Local frame 234 (874f global): CATASTROPHIC RUPTURE TRANSIENT
    mixer.add_event("impacts/explosions", t3_base + 234, "explosion_crunch_001.wav", semitones=0.0, gain_db=6.0, pan=0.0,
                    desc="Tier 3 600-Bar Catastrophic Seal Blowout Blast")
    mixer.add_event("impacts/explosions", t3_base + 234, "low_frequency_explosion_000.wav", semitones=1.0, gain_db=5.0, pan=-0.1,
                    desc="Tier 3 Hydraulic Accumulator Sub-Bass Shock")
    mixer.add_event("materials/metal", t3_base + 234, "impact_metal_heavy_004.wav", semitones=2.0, gain_db=5.0, pan=0.2,
                    desc="Tier 3 Cylinder Head High-Tensile Bolt Shear Snap")
    mixer.add_event("materials/metal", t3_base + 234, "impact_plate_light_004.wav", semitones=3.5, gain_db=3.5, pan=0.25,
                    desc="Tier 3 Sheared Bolt Supersonic Ricochet")
    mixer.add_event("materials/metal", t3_base + 235, "impact_plate_heavy_002.wav", semitones=1.0, gain_db=3.0, pan=0.15,
                    desc="Tier 3 Deformed Platen Rebound Slam")

    # Local frames 234..308 (874..948f global): 74-Frame Cleanser Transition (Cryo-Neon Laser Scan Cleanser)
    mixer.add_cleanser_transition(effects[3], t3_base)
    # Local frames 308..319: Pure silent air before Tier 4 at 960!


    # =========================================================================
    # --- TIER 4 ($100,000+ Superconducting Quantum Pinch Press, Frames 960..1279) ---
    # =========================================================================
    t4_base = 960

    # --- Act 1 (960..1022f / local 0..62): Snap Assembly ---
    mixer.add_event("mechanisms/scifi_laser", t4_base + 0, "force_field_000.wav", gain_db=3.5, pan=0.0, desc="Tier 4 Maglev Base Force Field Lock")
    mixer.add_event("mechanisms/scifi_laser", t4_base + 0, "force_field_001.wav", gain_db=2.5, pan=-0.15, desc="Tier 4 Superconducting Flux Settle")
    mixer.add_event("impacts/locks", t4_base + 0, "drop_003.wav", gain_db=2.0, pan=0.1, desc="Tier 4 Monolith Bed Plinth Mass Dock")

    mixer.add_event("mechanisms/scifi_laser", t4_base + 15, "laser_large_000.wav", gain_db=3.0, pan=-0.2, desc="Tier 4 Toroid Coil Magnetic Alignment Beam")
    mixer.add_event("mechanisms/switches", t4_base + 15, "toggle_002.wav", gain_db=2.5, pan=-0.15, desc="Tier 4 Toroid Superconducting Bus Latch")
    mixer.add_event("impacts/locks", t4_base + 15, "door_close_002.wav", gain_db=2.5, pan=0.1, desc="Tier 4 Hermetic Toroid Vacuum Lock")

    mixer.add_event("materials/glass", t4_base + 30, "impact_glass_heavy_000.wav", gain_db=3.0, pan=0.15, desc="Tier 4 Quartz Containment Armor Slam")
    mixer.add_event("materials/metal", t4_base + 30, "impact_plate_heavy_000.wav", gain_db=2.5, pan=-0.1, desc="Tier 4 Armored Hull Clamping Shock")
    mixer.add_event("mechanisms/switches", t4_base + 30, "click_002.wav", gain_db=2.5, pan=0.0, desc="Tier 4 High-Voltage Interlock Detent")

    mixer.add_event("mechanisms/scifi_laser", t4_base + 45, "force_field_003.wav", gain_db=2.5, pan=0.15, desc="Tier 4 Flux Manifold Lock")
    mixer.add_event("mechanisms/switches", t4_base + 45, "toggle_001.wav", gain_db=2.0, pan=0.1, desc="Tier 4 Cryo Manifold Coupler")

    mixer.add_event("mechanisms/scifi_laser", t4_base + 60, "laser_large_001.wav", gain_db=3.0, pan=0.0, desc="Tier 4 Pinch Die Maglev Lock")
    mixer.add_event("impacts/locks", t4_base + 60, "drop_002.wav", gain_db=2.0, pan=-0.05, desc="Tier 4 Pinch Die Sub-Bass Seat")

    # --- Act 2 (1023..1082f / local 63..122): Quantum Trigger Engage, High-Frequency Coil Riser, Cryo Hiss ---
    mixer.add_event("mechanisms/switches", t4_base + 63, "click_001.wav", gain_db=3.5, pan=0.0, desc="Tier 4 Quantum Trigger Master Contact")
    mixer.add_event("mechanisms/switches", t4_base + 63, "toggle_003.wav", gain_db=3.0, pan=0.05, desc="Tier 4 Magnetic Containment Breaker")

    mixer.add_continuous_tone("mechanisms/motors", "space_engine_large_000.wav", t4_base + 65, 35,
                              semitones=3.0, gain_db=-2.0, fade_in_frames=8, fade_out_frames=4,
                              pan=-0.1, desc="Tier 4 Superconducting Coil Charge Riser")
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_001.wav", t4_base + 68, 32,
                              semitones=5.0, gain_db=-4.0, fade_in_frames=8, fade_out_frames=4,
                              pan=0.15, desc="Tier 4 High-Frequency Resonator Whine")
    mixer.add_continuous_tone("mechanisms/motors", "thruster_fire_003.wav", t4_base + 65, 35,
                              semitones=0.0, gain_db=-4.5, fade_in_frames=8, fade_out_frames=4,
                              pan=0.0, desc="Tier 4 Liquid Helium Cryo Purge Hiss")

    for idx, f in enumerate([72, 80, 88]):
        mixer.add_event("mechanisms/scifi_laser", t4_base + f, "force_field_002.wav", gain_db=1.0, pan=0.15 * ((idx % 2) * 2 - 1),
                        desc=f"Tier 4 Plasma Arc Pre-Discharge {idx+1}")

    # --- Act 3 (1083..1172f / local 123..212): 7 Relativistic Magnetic Pinch Pulses ---
    # Cadence: 7 relativistic pinch pulses at exact physical contact frames: [133, 145, 157, 169, 181, 193, 205]
    t4_pinches = [133, 145, 157, 169, 181, 193, 205]
    mixer.add_continuous_tone("mechanisms/motors", "space_engine_large_001.wav", t4_base + 100, 113,
                              semitones=4.0, gain_db=-3.5, fade_in_frames=6, fade_out_frames=6,
                              pan=0.0, desc="Tier 4 Relativistic Magnetic Field Drone")

    for idx, f in enumerate(t4_pinches):
        s_idx = idx % 5
        pan = 0.25 if idx % 2 == 0 else -0.25
        progress = idx / len(t4_pinches)
        gain_boost = progress * 1.5

        # Layer 1: Sub-bass kinetic magnetic pinch slam
        mixer.add_event("impacts/explosions", t4_base + f, "low_frequency_explosion_000.wav",
                        semitones=1.0 + (idx % 2), gain_db=3.5 + gain_boost, pan=pan,
                        desc=f"Tier 4 Magnetic Pinch Pulse {idx+1} (Sub-Bass Slam)")
        mixer.add_event("materials/metal", t4_base + f, f"impact_metal_heavy_{s_idx:03d}.wav",
                        semitones=-2.0, gain_db=2.0 + gain_boost, pan=-pan * 0.5,
                        desc=f"Tier 4 Toroid Physical Shock {idx+1}")
        # Layer 2: Relativistic plasma arc snap
        mixer.add_event("mechanisms/scifi_laser", t4_base + f, f"laser_large_{s_idx:03d}.wav",
                        semitones=(idx % 3) * 1.5, gain_db=1.5 + gain_boost, pan=pan * 0.8,
                        desc=f"Tier 4 Plasma Arc Snap {idx+1}")
        mixer.add_event("mechanisms/scifi_laser", t4_base + f + 1, f"force_field_{s_idx:03d}.wav",
                        semitones=2.0, gain_db=-1.0 + gain_boost, pan=-pan * 0.6,
                        desc=f"Tier 4 Flux Discharge Fizz {idx+1}")
        # Layer 3: Crystalline quantum distortion
        mixer.add_event("materials/glass", t4_base + f, f"impact_glass_heavy_{s_idx:03d}.wav",
                        semitones=1.0 + (idx % 2), gain_db=1.5 + gain_boost, pan=pan * 0.5,
                        desc=f"Tier 4 Crystal Lattice Strain {idx+1}")
        mixer.add_event("materials/glass", t4_base + f + 1, f"impact_glass_medium_{s_idx:03d}.wav",
                        semitones=2.0, gain_db=0.0 + gain_boost, pan=-pan * 0.3,
                        desc=f"Tier 4 Quartz Compression Distortion {idx+1}")
        # Layer 4: High-frequency electromagnetic flux ring
        mixer.add_event("materials/glass", t4_base + f, f"impact_glass_light_{s_idx:03d}.wav",
                        semitones=3.0, gain_db=-2.0 + gain_boost, pan=pan * 0.2,
                        desc=f"Tier 4 Crystalline Flux Resonance Ring {idx+1}")

    mixer.add_rapid_loop("materials/glass", t4_base + 112, t4_base + 212, interval_frames=5, gain_db=-2.0, pitch_var=1.5,
                         desc="Tier 4 Crystalline Lattice Micro-Fracture ASMR")

    # --- Act 4 (1173..1279f / local 213..319): Fluid Escalation, Singularity Collapse @ 234 & Ash Cleanser ---
    # 213..224f local (1173..1184f global): Pitch drop / magnetic field collapse pitch descent & tremor
    mixer.add_pitch_bend_tone("mechanisms/motors", "space_engine_large_002.wav", t4_base + 213, 12,
                              semi_start=4.0, semi_end=-6.0, gain_db=1.0, fade_in_frames=2, fade_out_frames=3,
                              pan=0.0, desc="Tier 4 Magnetic Field Collapse Pitch Descent")
    mixer.add_event("impacts/explosions", t4_base + 215, "low_frequency_explosion_001.wav", semitones=-2.0, gain_db=1.5, pan=0.0,
                    desc="Tier 4 Spacetime Tremor Sub-Bass Rumble")
    mixer.add_event("materials/metal", t4_base + 219, "impact_plate_heavy_001.wav", semitones=-1.5, gain_db=2.0, pan=-0.1,
                    desc="Tier 4 Containment Ring Torque Tremor")
    mixer.add_event("materials/glass", t4_base + 223, "impact_glass_medium_003.wav", semitones=2.0, gain_db=1.5, pan=0.15,
                    desc="Tier 4 Crystalline Lattice Torsion Shudder")

    # 225..233f local (1185..1193f global): Quantum flux arc flutter & quartz chatter
    t4_shudder_frames = [225, 227, 229, 231, 232, 233]
    for i, sf in enumerate(t4_shudder_frames):
        ratio = i / len(t4_shudder_frames)
        mixer.add_event("mechanisms/scifi_laser", t4_base + sf, "force_field_002.wav",
                        semitones=1.0 + ratio * 3.0, gain_db=1.0 + ratio * 3.0, pan=0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 4 Flux Arc Flutter {i+1}")
        mixer.add_event("materials/glass", t4_base + sf, "impact_glass_light_002.wav",
                        semitones=2.0 + ratio * 2.0, gain_db=-1.0 + ratio * 3.5, pan=-0.15 * ((i % 2) * 2 - 1),
                        desc=f"Tier 4 Quartz Lattice Chatter {i+1}")

    # Local frame 234 (1194f global): CATASTROPHIC RUPTURE TRANSIENT (Climax Detonation)
    mixer.add_event("impacts/explosions", t4_base + 234, "low_frequency_explosion_001.wav", semitones=0.0, gain_db=6.5, pan=0.0,
                    desc="Tier 4 Singularity Collapse Shockwave Detonation")
    mixer.add_event("impacts/explosions", t4_base + 234, "explosion_crunch_004.wav", semitones=-1.0, gain_db=4.5, pan=-0.1,
                    desc="Tier 4 Spacetime Pinch Implosion Blast")
    mixer.add_event("mechanisms/scifi_laser", t4_base + 234, "laser_large_004.wav", semitones=2.0, gain_db=3.5, pan=0.15,
                    desc="Tier 4 High-Energy Plasma Annihilation Burst")
    mixer.add_event("materials/glass", t4_base + 234, "impact_glass_heavy_002.wav", semitones=1.5, gain_db=4.5, pan=0.2,
                    desc="Tier 4 Quartz Containment Viewport Shatter Fracture")
    mixer.add_event("mechanisms/scifi_laser", t4_base + 234, "force_field_004.wav", semitones=1.0, gain_db=2.5, pan=-0.15,
                    desc="Tier 4 Singularity Field Collapse Fizz")

    # Local frames 234..308 (1194..1268f global): 74-Frame Cleanser Transition (Thermal Ash Disintegration)
    mixer.add_cleanser_transition(effects[4], t4_base)
    # Local frames 308..319: Pure silent air and settled clean table!

    # =========================================================================
    # --- MASTER EXPORT WITH BROADCAST LIMITING & FORENSIC BOM ---
    # =========================================================================
    mixer.export(out_wav, bom_json, target_peak_db=-1.0)
    return mixer

if __name__ == "__main__":
    wav_path = sys.argv[1] if len(sys.argv) > 1 else None
    bom_path = sys.argv[2] if len(sys.argv) > 2 else None
    generate_press_asmr_track(wav_path, bom_path)
