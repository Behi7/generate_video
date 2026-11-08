#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer: CrusherProgression
Generates a 38.6667-second 44.1kHz Stereo Master Track for 'CrusherProgression'
Tailored for 30 FPS timing (1160 frames, 1,705,200 samples).

Strictly follows The Pure ASMR Law:
1. Zero AI Voiceover.
2. Rich tactile mechanical ASMR synthesized to exactly 1160 frames (38.6667s @ 30 FPS, 44.1 kHz stereo WAV).
3. Synchronized audio events across 4 distinct Progression Tiers:
   - Tier 1 ($10 Manual Screw Crusher, 0..289f):
     Anvil land (0f), twin columns snap (20f), upper bridge snap (40f), ACME screw drop & T-handle lock (60f).
     Slow squeaky thread turns (75..110f), accelerating spin, heavy stone crunching and cracking (150..249f),
     jamming shudder (255f), cast iron frame fracture crack & flying handle clatter (265f).
   - Tier 2 ($100 Motor Piston Crusher, 290..579f):
     Bed land (290f), tower snap (310f), 2-stroke engine snap (330f), hammer ram dock (350f).
     Starter cord pull & choke clack (370f), compression cough & exhaust puff, 180 RPM rhythmic hammer
     pounding ('WHAM! WHAM! WHAM!') with stone shatters and metallic ring (440..539f),
     connecting rod snap & chain rupture whip (555f).
   - Tier 3 ($1 000 100-Ton Hydraulic Portal Crusher, 580..869f):
     Portal columns land (580f), hydraulic cylinder dock (600f), manifold & hoses dock (620f),
     carbide platen dock (640f). Emergency red mushroom button thwack (660f), pressure gauge spike & coolant hiss,
     100-Ton relentless deep hydraulic crush & boiling mist hiss (730..829f),
     500-Bar hydraulic hose blowout & rushing high-pressure steam blast (845f).
   - Tier 4 ($100 000+ Quantum Magnetic Plasma Crusher, 870..1159f):
     Monolithic chassis dock (870f), toroid rings snap (890f), laser head dock (910f),
     armored cryo cable slam + 100 Hz mains hum & electric arc 'ZZZZT!' (930f).
     Sequential coil charging wave (955..1019f), hypersonic laser plasma whine & crystalline singularity pinch,
     and massive 260+ coin cascade clinking surge climbing exponentially to +$1 480 000 with sub-bass climax chord.
"""

import numpy as np
from scipy.io import wavfile
from scipy import signal
import os

SR = 44100
FPS = 30
DURATION_FRAMES = 1160
DURATION = DURATION_FRAMES / float(FPS)  # 38.666666666666664 s
N_SAMPLES = int(round(SR * DURATION))    # 1,705,200 samples
stereo = np.zeros((2, N_SAMPLES), dtype=np.float32)

def frame_to_sec(frame):
    return frame / float(FPS)

def time_slice(start_sec, dur_sec):
    i0 = int(round(start_sec * SR))
    i1 = min(i0 + int(round(dur_sec * SR)), N_SAMPLES)
    return i0, i1, i1 - i0

def add_audio(start_sec, left, right=None, gain=1.0):
    if right is None:
        right = left
    i0, i1, length = time_slice(start_sec, len(left) / SR)
    if length <= 0 or i0 >= N_SAMPLES:
        return
    stereo[0, i0:i1] += left[:length] * gain
    stereo[1, i0:i1] += right[:length] * gain

# ==========================================================
# 1. CORE TRANSIENT IMPACTS & DOCKING GENERATORS
# ==========================================================

def gen_thud(dur=0.35, freq=65.0, decay=16.0):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    sub = np.sin(2 * np.pi * freq * np.exp(-t * 12.0) * t) * np.exp(-t * decay)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * (decay * 2.5))
    click = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 90.0)
    sig = sub * 0.75 + noise * 0.15 + click * 0.1
    return sig, sig

def gen_metallic_snap(dur=0.18, freq1=3800.0, freq2=6200.0, decay=42.0):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    ch1 = np.sin(2 * np.pi * freq1 * t) * np.exp(-t * decay)
    ch2 = np.sin(2 * np.pi * freq2 * t) * np.exp(-t * (decay * 1.3))
    click = np.sin(2 * np.pi * 9200 * t) * np.exp(-t * 140.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * (decay * 2.0))
    sig = ch1 * 0.4 + ch2 * 0.35 + click * 0.2 + noise * 0.05
    return sig, sig * 0.95

def gen_heavy_latch_lock(dur=0.45, freq=480.0, ring_freq=3200.0):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    impact = np.sin(2 * np.pi * freq * np.exp(-t * 8.0) * t) * np.exp(-t * 22.0)
    ring = np.sin(2 * np.pi * ring_freq * t) * np.exp(-t * 14.0)
    click = np.sin(2 * np.pi * 5500 * t) * np.exp(-t * 80.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 35.0)
    sig_l = impact * 0.5 + ring * 0.3 + click * 0.15 + noise * 0.05
    sig_r = impact * 0.5 + ring * 0.32 + click * 0.12 + noise * 0.06
    return sig_l, sig_r

# ==========================================================
# 2. CRUSHING, HAMMERING & SQUEAK GENERATORS
# ==========================================================

def gen_screw_creak(dur=0.8, pitch_start=320.0, pitch_end=580.0):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    freq = np.linspace(pitch_start, pitch_end, len(t))
    chirp = np.sin(2 * np.pi * freq * t) * (1 - np.cos(2 * np.pi * t / dur)) * 0.5
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 4.0) * 0.15
    sig = chirp * 0.6 + noise * 0.4
    return sig, sig * 0.9

def gen_stone_crush_crunch(dur=0.25):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    # bandpass for crunchy stone
    sos = signal.butter(4, [800, 4500], btype='bandpass', fs=SR, output='sos')
    filtered = signal.sosfilt(sos, noise)
    env = np.exp(-t * 24.0)
    sig = filtered * env * 1.5
    return sig, sig * 0.92

def gen_hammer_blow(dur=0.22, punch_freq=180.0):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    thud = np.sin(2 * np.pi * punch_freq * np.exp(-t * 25.0) * t) * np.exp(-t * 24.0)
    anvil_ring = np.sin(2 * np.pi * 2400.0 * t) * np.exp(-t * 30.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 50.0)
    sig_l = thud * 0.6 + anvil_ring * 0.3 + noise * 0.15
    sig_r = thud * 0.6 + anvil_ring * 0.35 + noise * 0.12
    return sig_l, sig_r

def gen_hydraulic_crush_loop(dur=3.3):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    hum = np.sin(2 * np.pi * 120.0 * t) * 0.25 + np.sin(2 * np.pi * 240.0 * t) * 0.12
    hiss = np.random.uniform(-1, 1, len(t)) * 0.18
    # stone deformation groan
    groan = np.sin(2 * np.pi * 95.0 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.2 * t)) * 0.2
    sig = hum + hiss + groan
    fade = np.minimum(1.0, np.minimum(t * 8.0, (dur - t) * 8.0))
    return sig * fade, sig * fade * 0.95

def gen_steam_blowout(dur=1.4):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    pop = np.sin(2 * np.pi * 140.0 * t) * np.exp(-t * 25.0) * 0.8
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(3, [1200, 8000], btype='bandpass', fs=SR, output='sos')
    steam = signal.sosfilt(sos, noise) * np.exp(-t * 2.8)
    sig = pop * 0.4 + steam * 0.6
    return sig, sig

def gen_plasma_arc(dur=0.6):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    hum = np.sin(2 * np.pi * 100.0 * t) * 0.4
    buzz = signal.sawtooth(2 * np.pi * 360.0 * t) * 0.35
    noise = np.random.uniform(-1, 1, len(t)) * 0.25
    env = np.exp(-t * 5.0)
    sig = (hum + buzz + noise) * env
    return sig, sig * 0.9

def gen_climax_coins_and_subbass(dur=5.0):
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Deep sub-bass crescendo chord
    sub = (np.sin(2 * np.pi * 55.0 * t) + np.sin(2 * np.pi * 110.0 * t) * 0.6) * np.minimum(1.0, t * 0.8) * 0.35
    sig_l = sub.copy()
    sig_r = sub.copy()
    # Rapid coin clinks
    np.random.seed(42)
    coin_times = np.sort(np.random.uniform(0.1, dur - 0.2, 140))
    for ct in coin_times:
        idx0 = int(round(ct * SR))
        cdur = 0.08
        ct_arr = np.linspace(0, cdur, int(round(SR * cdur)), endpoint=False)
        cfreq = np.random.uniform(2800, 7200)
        cring = np.sin(2 * np.pi * cfreq * ct_arr) * np.exp(-ct_arr * 70.0) * 0.12
        length = min(len(cring), len(sig_l) - idx0)
        if length > 0:
            pan = np.random.uniform(0.7, 1.3)
            sig_l[idx0:idx0+length] += cring[:length] * pan
            sig_r[idx0:idx0+length] += cring[:length] * (2.0 - pan)
    return sig_l, sig_r

# ==========================================================
# 3. SCORE MASTER ASSEMBLY
# ==========================================================

def assemble_master_score():
    print(f"Synthesizing 1160-frame Crusher ASMR track ({DURATION:.3f}s)...")

    # --- TIER 1 ($10 Manual Screw Crusher: frames 0..289 / 0..9.67s) ---
    add_audio(frame_to_sec(0), *gen_thud(dur=0.35, freq=70.0), gain=0.9)
    add_audio(frame_to_sec(20), *gen_metallic_snap(dur=0.15, freq1=3400, freq2=5800), gain=0.85)
    add_audio(frame_to_sec(40), *gen_metallic_snap(dur=0.15, freq1=4200, freq2=6800), gain=0.85)
    add_audio(frame_to_sec(60), *gen_heavy_latch_lock(dur=0.45, freq=520, ring_freq=3400), gain=1.0)

    # Act 2 (75..149f): Squeaky thread turns
    add_audio(frame_to_sec(75), *gen_screw_creak(dur=0.6, pitch_start=280, pitch_end=420), gain=0.7)
    add_audio(frame_to_sec(105), *gen_screw_creak(dur=0.5, pitch_start=340, pitch_end=520), gain=0.8)
    add_audio(frame_to_sec(125), *gen_screw_creak(dur=0.4, pitch_start=450, pitch_end=620), gain=0.85)

    # Act 3 (150..249f): Rapid steady screw-down & crunchy stone fractures
    for f in range(150, 245, 14):
        add_audio(frame_to_sec(f), *gen_stone_crush_crunch(dur=0.22), gain=0.9)
        add_audio(frame_to_sec(f + 4), *gen_screw_creak(dur=0.25, pitch_start=500, pitch_end=650), gain=0.5)

    # Act 4 (255..289f): Jam & catastrophic cast iron frame crack
    add_audio(frame_to_sec(255), *gen_thud(dur=0.25, freq=90.0, decay=28.0), gain=0.8)
    add_audio(frame_to_sec(265), *gen_heavy_latch_lock(dur=0.5, freq=280, ring_freq=1800), gain=1.2)
    add_audio(frame_to_sec(268), *gen_metallic_snap(dur=0.3, freq1=1400, freq2=4800, decay=20), gain=1.1)

    # --- TIER 2 ($100 Motor Piston Crusher: frames 290..579 / 9.67..19.33s) ---
    add_audio(frame_to_sec(290), *gen_thud(dur=0.35, freq=60.0), gain=0.9)
    add_audio(frame_to_sec(310), *gen_metallic_snap(dur=0.15, freq1=3200, freq2=5200), gain=0.85)
    add_audio(frame_to_sec(330), *gen_metallic_snap(dur=0.15, freq1=4000, freq2=6200), gain=0.85)
    add_audio(frame_to_sec(350), *gen_heavy_latch_lock(dur=0.4, freq=460, ring_freq=3800), gain=1.0)

    # Act 2 (370..439f): Starter cord pull & engine cough
    add_audio(frame_to_sec(370), *gen_metallic_snap(dur=0.18, freq1=2400, freq2=4600), gain=0.9)
    add_audio(frame_to_sec(385), *gen_thud(dur=0.2, freq=85.0), gain=0.7)
    add_audio(frame_to_sec(405), *gen_thud(dur=0.2, freq=95.0), gain=0.8)
    add_audio(frame_to_sec(420), *gen_thud(dur=0.2, freq=110.0), gain=0.9)

    # Act 3 (440..539f): Repetitive hammer blows (every 10 frames = 3 blows/sec)
    for f in range(440, 535, 10):
        add_audio(frame_to_sec(f), *gen_hammer_blow(dur=0.18, punch_freq=160.0), gain=1.0)

    # Act 4 (540..579f): Connecting rod snap & chain rupture
    add_audio(frame_to_sec(550), *gen_thud(dur=0.15, freq=140.0), gain=0.8)
    add_audio(frame_to_sec(555), *gen_heavy_latch_lock(dur=0.55, freq=220, ring_freq=1600), gain=1.3)
    add_audio(frame_to_sec(558), *gen_metallic_snap(dur=0.35, freq1=1100, freq2=5200, decay=15), gain=1.1)

    # --- TIER 3 ($1 000 100-Ton Hydraulic Portal: frames 580..869 / 19.33..29.00s) ---
    add_audio(frame_to_sec(580), *gen_thud(dur=0.45, freq=50.0), gain=1.0)
    add_audio(frame_to_sec(600), *gen_metallic_snap(dur=0.18, freq1=2800, freq2=5000), gain=0.9)
    add_audio(frame_to_sec(620), *gen_metallic_snap(dur=0.18, freq1=3800, freq2=6400), gain=0.9)
    add_audio(frame_to_sec(640), *gen_heavy_latch_lock(dur=0.5, freq=420, ring_freq=4200), gain=1.0)

    # Act 2 (660..729f): Red button thwack & pressure rise
    add_audio(frame_to_sec(660), *gen_metallic_snap(dur=0.2, freq1=1800, freq2=3600), gain=1.0)
    add_audio(frame_to_sec(675), *gen_screw_creak(dur=1.2, pitch_start=120, pitch_end=480), gain=0.6)

    # Act 3 (730..829f): Hypnotic 100-ton hydraulic crushing
    add_audio(frame_to_sec(730), *gen_hydraulic_crush_loop(dur=3.3), gain=1.1)

    # Act 4 (830..869f): 500-Bar blowout
    add_audio(frame_to_sec(845), *gen_steam_blowout(dur=1.4), gain=1.3)

    # --- TIER 4 ($100 000+ Quantum Magnetic Crusher: frames 870..1159 / 29.00..38.67s) ---
    add_audio(frame_to_sec(870), *gen_thud(dur=0.45, freq=45.0), gain=1.0)
    add_audio(frame_to_sec(890), *gen_metallic_snap(dur=0.18, freq1=4500, freq2=7800), gain=0.95)
    add_audio(frame_to_sec(910), *gen_metallic_snap(dur=0.18, freq1=5200, freq2=8500), gain=0.95)
    # Cable slam & high-voltage arc ZZZZT!
    add_audio(frame_to_sec(930), *gen_heavy_latch_lock(dur=0.55, freq=320, ring_freq=6800), gain=1.1)
    add_audio(frame_to_sec(932), *gen_plasma_arc(dur=0.65), gain=1.2)

    # Act 2 (955..1019f): Sequential charging wave
    for f in [960, 980, 1000]:
        add_audio(frame_to_sec(f), *gen_metallic_snap(dur=0.15, freq1=3000 + f, freq2=7000), gain=0.7)

    # Act 3 & 4 (1010..1159f): Blinding laser pinch, singularity & exponential coin cascade
    t_coins = frame_to_sec(1010)
    climax_l, climax_r = gen_climax_coins_and_subbass(dur=DURATION - t_coins)
    add_audio(t_coins, climax_l, climax_r, gain=1.2)


def master_and_export():
    assemble_master_score()

    # Peak normalization to exactly -1.0 dBFS
    target_peak = 10.0 ** (-1.0 / 20.0)  # ~0.8912509
    current_max = np.max(np.abs(stereo))
    print(f"Pre-normalized peak amplitude: {current_max:.5f}")

    if current_max > 0:
        norm_factor = target_peak / current_max
        stereo_master = stereo * norm_factor
    else:
        stereo_master = stereo

    final_peak = np.max(np.abs(stereo_master))
    final_peak_db = 20.0 * np.log10(final_peak)

    int16_data = np.clip(stereo_master * 32767.0, -32768, 32767).astype(np.int16)

    out_wav = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio", "asmr_crusher_progression.wav")
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    wavfile.write(out_wav, SR, int16_data.T)

    actual_samples = stereo_master.shape[1]
    actual_dur = actual_samples / float(SR)
    print(f"Master ASMR track written to: {out_wav}")
    print(f"Track Duration: {actual_dur:.4f}s ({actual_samples} samples, {actual_dur * FPS:.1f} frames @ {FPS} FPS)")
    print(f"Final Peak Amplitude: {final_peak:.5f} ({final_peak_db:.2f} dBFS)")


if __name__ == "__main__":
    master_and_export()
