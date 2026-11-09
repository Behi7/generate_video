#!/usr/bin/env python3
"""
compose_asmr.py
Universal 4-Act Procedural Foley ASMR Master Composer for remotion_studio.
Uses real CC0 WAV foley samples from public/audio/foley/ to assemble a 
1160-frame (38.6667s @ 30 FPS) 44.1 kHz 16-bit PCM stereo master track.
ZERO synthetic sine waves allowed!
"""

import os
import sys
import json
import wave
import struct
import random
import numpy as np
import scipy.signal

STUDIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLEY_DIR = os.path.join(STUDIO_DIR, "public", "audio", "foley")
SAMPLE_RATE = 44100
FPS = 30
TOTAL_FRAMES = 1160
TOTAL_SAMPLES = int((TOTAL_FRAMES / FPS) * SAMPLE_RATE)  # exactly 1,705,200 samples

def load_wav(rel_path):
    """Loads a WAV file from public/audio/foley/ and returns normalized stereo float32 array [-1.0, 1.0]."""
    full_path = os.path.join(FOLEY_DIR, rel_path)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"Foley sound missing: {full_path}")
    
    with wave.open(full_path, "rb") as wf:
        n_ch = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        rate = wf.getframerate()
        n_frames = wf.getnframes()
        raw = wf.readframes(n_frames)

    if sampwidth == 2:
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    elif sampwidth == 4:
        data = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
    else:
        raise ValueError(f"Unsupported sample width: {sampwidth}")

    if n_ch == 1:
        data = np.column_stack((data, data))
    elif n_ch == 2:
        data = data.reshape(-1, 2)
    else:
        data = data.reshape(-1, n_ch)[:, :2]

    # Resample if not 44.1 kHz
    if rate != SAMPLE_RATE:
        target_len = int(len(data) * SAMPLE_RATE / rate)
        data = scipy.signal.resample(data, target_len)

    return data

def pitch_shift(audio, semitones):
    """Fast pitch shift by resampling with linear interpolation."""
    factor = 2.0 ** (semitones / 12.0)
    new_len = int(len(audio) / factor)
    if new_len < 10:
        return audio
    return scipy.signal.resample(audio, new_len)

def mix_sample(master_track, sample, at_frame, gain_db=0.0, pan=0.0):
    """Mixes a stereo sample into master_track starting at at_frame."""
    start_sample = int((at_frame / FPS) * SAMPLE_RATE)
    if start_sample >= len(master_track):
        return

    # Apply gain
    gain_linear = 10.0 ** (gain_db / 20.0)
    proc_sample = sample * gain_linear

    # Apply pan (-1.0 = left, 1.0 = right)
    left_gain = np.cos((pan + 1.0) * np.pi / 4.0)
    right_gain = np.sin((pan + 1.0) * np.pi / 4.0)
    proc_sample[:, 0] *= left_gain
    proc_sample[:, 1] *= right_gain

    end_sample = min(start_sample + len(proc_sample), len(master_track))
    mix_len = end_sample - start_sample
    master_track[start_sample:end_sample] += proc_sample[:mix_len]

class ASMRMixer:
    def __init__(self, total_frames=TOTAL_FRAMES):
        self.total_frames = total_frames
        self.total_samples = int((total_frames / FPS) * SAMPLE_RATE)
        self.master = np.zeros((self.total_samples, 2), dtype=np.float32)
        self.bom = []
        with open(os.path.join(FOLEY_DIR, "foley_manifest.json"), "r") as f:
            self.manifest = json.load(f)

    def get_sample_path(self, category, filename=None):
        files = self.manifest.get(category, [])
        if not files:
            raise KeyError(f"No files in category {category}")
        if filename:
            match = [f for f in files if filename in f]
            if match:
                return os.path.join(category, match[0])
        return os.path.join(category, random.choice(files))

    def add_event(self, category, frame, filename=None, semitones=0.0, gain_db=0.0, pan=0.0, desc=""):
        rel_path = self.get_sample_path(category, filename)
        raw = load_wav(rel_path)
        if semitones != 0.0:
            raw = pitch_shift(raw, semitones)
        mix_sample(self.master, raw, at_frame=frame, gain_db=gain_db, pan=pan)
        self.bom.append({
            "frame": frame,
            "category": category,
            "sample": rel_path,
            "gain_db": gain_db,
            "pitch_semitones": semitones,
            "desc": desc
        })

    def add_rapid_loop(self, category, start_frame, end_frame, interval_frames=4, gain_db=0.0, pitch_var=2.0, desc=""):
        f = start_frame
        while f < end_frame:
            semi = random.uniform(-pitch_var, pitch_var)
            pan = random.uniform(-0.35, 0.35)
            self.add_event(category, f, semitones=semi, gain_db=gain_db + random.uniform(-1.5, 1.5), pan=pan, desc=desc)
            f += interval_frames + random.randint(-1, 1)

    def export(self, out_wav_path, bom_json_path=None, target_peak_db=-1.5):
        """
        Exports master track to 16-bit PCM WAV with broadcast-grade soft limiting:
        - Pre-limiting headroom scaling to protect dynamic range and prevent square-wave distortion
        - Analogue-style soft-knee compression for transients exceeding threshold
        - Target true peak normalized to -1.5 dBFS (0.8414) for zero distortion on mobile & headphones
        """
        target_peak_linear = 10.0 ** (target_peak_db / 20.0)  # ~0.841 for -1.5 dBFS

        raw_peak = np.max(np.abs(self.master))
        if raw_peak > 0:
            # 1. Pre-limiting headroom scaling:
            # If the raw mix is excessively hot (> 1.25), scale down smoothly so transients
            # enter the soft limiter without turning into harsh square-wave fuzz.
            if raw_peak > 1.25:
                headroom_scale = 1.25 / raw_peak
                self.master *= headroom_scale

        # 2. Transparent soft-knee limiter
        # Linear response below threshold (0.65), smooth saturation up to max_peak
        threshold = 0.65
        max_peak = target_peak_linear
        mask = np.abs(self.master) > threshold
        if np.any(mask):
            val = np.abs(self.master[mask])
            sign = np.sign(self.master[mask])
            excess = val - threshold
            compressed = threshold + (max_peak - threshold) * np.tanh(excess / (max_peak - threshold))
            self.master[mask] = sign * compressed

        # 3. Final True-Peak normalization
        final_peak = np.max(np.abs(self.master))
        if final_peak > 0:
            norm_factor = target_peak_linear / final_peak
            self.master *= norm_factor

        # Convert to 16-bit PCM with safety guard
        pcm_data = (self.master * 32767.0).clip(-32767, 32767).astype(np.int16)

        with wave.open(out_wav_path, "wb") as wf:
            wf.setnchannels(2)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(pcm_data.tobytes())

        if bom_json_path:
            with open(bom_json_path, "w") as f:
                json.dump({
                    "total_frames": getattr(self, "total_frames", TOTAL_FRAMES),
                    "sample_rate": SAMPLE_RATE,
                    "event_count": len(self.bom),
                    "events": self.bom
                }, f, indent=2)

        print(f"🎵 Master ASMR WAV exported: {out_wav_path}")
        print(f"   Duration: {len(self.master)/SAMPLE_RATE:.2f}s | Events: {len(self.bom)} | Peak: {np.max(np.abs(self.master)):.2f}")


def assemble_canonical_foley_track(out_wav, bom_json=None):
    """Assembles a benchmark 4-tier track using real Foley assets."""
    mixer = ASMRMixer()

    # --- TIER 1 ($10 Manual Level, Frames 0..289) ---
    # Act 1: Assembly (0..69f)
    mixer.add_event("materials/wood", 0, "impact_wood_heavy_000.wav", gain_db=2.0, desc="Tier 1 Bed Drop")
    mixer.add_event("mechanisms/switches", 20, "click_000.wav", gain_db=0.0, desc="Tier 1 Core Dock")
    mixer.add_event("materials/metal", 40, "impact_tin_medium_000.wav", gain_db=-1.0, desc="Tier 1 Skeleton Frame Snap")
    mixer.add_event("mechanisms/switches", 60, "switch_001.wav", gain_db=1.0, desc="Tier 1 Crank Handle Snap")
    mixer.add_event("materials/metal", 75, "impact_plate_light_000.wav", gain_db=0.0, desc="Tier 1 Cutter Blades Latch")
    # Act 2: Startup (70..149f)
    mixer.add_event("mechanisms/switches", 75, "toggle_000.wav", gain_db=2.0, desc="Tier 1 Trigger Toggle")
    for f in range(85, 140, 14):
        mixer.add_event("materials/wood", f, "impact_wood_light_000.wav", gain_db=-3.0, desc="Tier 1 Manual Crank Creak")
    # Act 3: Plastic Crush ASMR (150..249f)
    mixer.add_rapid_loop("materials/soft_plastic", 150, 250, interval_frames=5, gain_db=1.5, desc="Tier 1 Plastic Crunch ASMR")
    # Act 4: Overload Fracture (250..289f)
    mixer.add_event("materials/wood", 265, "impact_wood_heavy_001.wav", gain_db=4.0, desc="Tier 1 Crank Arm Snap Crack")
    mixer.add_event("materials/metal", 266, "impact_tin_medium_001.wav", gain_db=2.0, desc="Tier 1 Gear Shear")

    # --- TIER 2 ($100 Electric Level, Frames 290..579) ---
    # Act 1: Assembly (290..359f)
    mixer.add_event("materials/metal", 290, "impact_metal_heavy_000.wav", gain_db=2.0, desc="Tier 2 Welded Pedestal Drop")
    mixer.add_event("materials/metal", 310, "impact_plate_medium_000.wav", gain_db=0.0, desc="Tier 2 Copper Rotor Dock")
    mixer.add_event("impacts/locks", 330, "door_close_000.wav", gain_db=1.0, desc="Tier 2 Motor Stator Housing Snap")
    mixer.add_event("mechanisms/switches", 350, "switch_002.wav", gain_db=1.0, desc="Tier 2 Chain Sprocket Latch")
    mixer.add_event("materials/metal", 365, "impact_metal_light_001.wav", gain_db=0.0, desc="Tier 2 Carbide Cutters Lock")
    # Act 2: Electric Motor Spool-Up (360..439f)
    mixer.add_event("mechanisms/switches", 370, "switch_000.wav", gain_db=3.0, desc="Tier 2 Industrial Switch Clack")
    for f in range(375, 440, 8):
        mixer.add_event("mechanisms/motors", f, "engine_circular_000.wav", semitones=(f - 375)*0.2, gain_db=-2.0, desc="Tier 2 Motor Spool")
    # Act 3: Aluminum Can Crunch ASMR (440..539f)
    mixer.add_rapid_loop("materials/metal", 440, 540, interval_frames=4, gain_db=2.0, desc="Tier 2 Metal Sheet Shear ASMR")
    # Act 4: Chain Rupture Fracture (540..579f)
    mixer.add_event("materials/metal", 555, "impact_metal_heavy_002.wav", gain_db=5.0, desc="Tier 2 Chain Rupture Snap")
    mixer.add_event("impacts/explosions", 556, "explosion_crunch_000.wav", gain_db=3.0, desc="Tier 2 Motor Electrical Blowout")

    # --- TIER 3 ($1 000 Hydraulic Monster, Frames 580..869) ---
    # Act 1: Assembly (580..649f)
    mixer.add_event("materials/metal", 580, "impact_plate_heavy_000.wav", gain_db=4.0, desc="Tier 3 H-Frame Bed Seismic Landing")
    mixer.add_event("materials/metal", 600, "impact_metal_heavy_001.wav", gain_db=2.0, desc="Tier 3 Solid Hex Shafts Dock")
    mixer.add_event("impacts/locks", 620, "door_close_001.wav", gain_db=2.0, desc="Tier 3 Chamber & Hopper Dock")
    mixer.add_event("mechanisms/switches", 640, "switch_003.wav", gain_db=1.0, desc="Tier 3 Hydraulic Manifold Lock")
    mixer.add_event("materials/metal", 655, "impact_plate_medium_001.wav", gain_db=1.0, desc="Tier 3 Collector Bin Lock")
    # Act 2: 500-Bar Hydraulic Spool (650..729f)
    mixer.add_event("mechanisms/switches", 660, "switch_001.wav", gain_db=3.0, desc="Tier 3 Valve Lever Clack")
    for f in range(665, 730, 10):
        mixer.add_event("mechanisms/motors", f, "space_engine_low_000.wav", semitones=2.0, gain_db=1.0, desc="Tier 3 Hydraulic Pump Hum")
    # Act 3: Heavy Titanium I-Beam Shredding ASMR (730..829f)
    mixer.add_rapid_loop("materials/metal", 730, 830, interval_frames=4, gain_db=3.0, desc="Tier 3 Heavy Steel Groan ASMR")
    mixer.add_rapid_loop("materials/stone", 730, 830, interval_frames=6, gain_db=1.0, desc="Tier 3 High-Pressure Chip Shucking")
    # Act 4: 600-Bar Hydraulic Blowout (830..869f)
    mixer.add_event("impacts/explosions", 845, "explosion_crunch_001.wav", gain_db=6.0, desc="Tier 3 600-Bar Hydraulic Blowout Blast")
    mixer.add_event("materials/metal", 846, "impact_plate_heavy_001.wav", gain_db=4.0, desc="Tier 3 Sheared Claw Tooth Ricochet")

    # --- TIER 4 ($100 000+ Quantum Singularity, Frames 870..1159) ---
    # Act 1: Assembly (870..939f)
    mixer.add_event("mechanisms/scifi_laser", 870, "force_field_000.wav", gain_db=3.0, desc="Tier 4 Maglev Monolith Plinth Dock")
    mixer.add_event("mechanisms/scifi_laser", 890, "laser_large_000.wav", gain_db=2.0, desc="Tier 4 Plasma Vortex Cores Dock")
    mixer.add_event("impacts/locks", 910, "door_close_002.wav", gain_db=2.0, desc="Tier 4 Superconducting Toroid Dock")
    mixer.add_event("mechanisms/scifi_laser", 930, "thruster_fire_000.wav", gain_db=2.0, desc="Tier 4 Pinch Coils Lock")
    mixer.add_event("materials/glass", 945, "impact_glass_heavy_000.wav", gain_db=2.0, desc="Tier 4 Quartz Viewport Seal")
    # Act 2: Laser Accelerator Charge (940..1019f)
    mixer.add_event("mechanisms/switches", 950, "click_002.wav", gain_db=2.0, desc="Tier 4 Quantum Trigger Engage")
    for f in range(955, 1020, 8):
        mixer.add_event("mechanisms/motors", f, "space_engine_large_000.wav", semitones=(f - 955)*0.25, gain_db=0.0, desc="Tier 4 Singularity Spool")
    # Act 3: Dark Matter Singularity Shredding ASMR (1020..1119f)
    mixer.add_rapid_loop("mechanisms/scifi_laser", 1020, 1120, interval_frames=4, gain_db=2.0, desc="Tier 4 Ionized Plasma Cut ASMR")
    mixer.add_rapid_loop("materials/glass", 1020, 1120, interval_frames=6, gain_db=1.0, desc="Tier 4 Crystalline Quantum Lattice Shatter")
    # Act 4: Spacetime Pinch Collapse Shockwave (1120..1159f)
    mixer.add_event("impacts/explosions", 1135, "low_frequency_explosion_000.wav", gain_db=7.0, desc="Tier 4 Singularity Shockwave Detonation")
    mixer.add_event("materials/glass", 1136, "impact_glass_heavy_001.wav", gain_db=4.0, desc="Tier 4 Quartz Viewport Shatter Fracture")

    mixer.export(out_wav, bom_json)
    return mixer

if __name__ == "__main__":
    out_file = os.path.join(STUDIO_DIR, "public", "audio", "asmr_shredder_progression.wav")
    bom_file = os.path.join(STUDIO_DIR, "public", "audio", "asmr_foley_bom.json")
    assemble_canonical_foley_track(out_file, bom_file)
