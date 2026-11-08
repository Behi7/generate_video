#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer
Generates a 24.0-second 44.1kHz Stereo Master Track for 'Mechanical Transformation'
Strictly follows The Pure ASMR Law (Zero AI Voiceover, rich Low/Mid/High textures, physical triggers).
"""

import numpy as np
from scipy.io import wavfile
from scipy import signal
import os

SR = 44100
DURATION = 24.0
N_SAMPLES = int(SR * DURATION)
stereo = np.zeros((2, N_SAMPLES), dtype=np.float32)

def time_slice(start_sec, dur_sec):
    i0 = int(start_sec * SR)
    i1 = min(i0 + int(dur_sec * SR), N_SAMPLES)
    return i0, i1, i1 - i0

def add_audio(start_sec, left, right=None, gain=1.0):
    if right is None:
        right = left
    i0, i1, length = time_slice(start_sec, len(left) / SR)
    if length <= 0:
        return
    stereo[0, i0:i1] += left[:length] * gain
    stereo[1, i0:i1] += right[:length] * gain

# --- Sound Synthesis Building Blocks ---

def gen_water_droplet(pitch_start=1400, pitch_end=1900, dur=0.18):
    t = np.linspace(0, dur, int(SR * dur), False)
    freq = np.linspace(pitch_start, pitch_end, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 24)
    tone = np.sin(phase) * env
    ring = np.sin(2 * np.pi * pitch_end * 1.5 * t) * np.exp(-t * 36) * 0.25
    return (tone + ring).astype(np.float32)

def gen_rusty_lever_creak(dur=0.7):
    t = np.linspace(0, dur, int(SR * dur), False)
    mod = np.sin(2 * np.pi * 14 * t) * 130
    freq = 680 + mod + np.sin(2 * np.pi * 3 * t) * 80
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.sin(np.pi * (t / dur)) ** 1.5
    noise = np.random.uniform(-0.15, 0.15, len(t))
    creak = (np.sin(phase) + noise) * env
    sos = signal.butter(4, [400, 1400], btype='bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, creak).astype(np.float32)

def gen_metal_thud(dur=0.25, freq=85):
    t = np.linspace(0, dur, int(SR * dur), False)
    low = np.sin(2 * np.pi * freq * np.exp(-t * 6) * t) * np.exp(-t * 14)
    click = np.random.uniform(-0.5, 0.5, len(t)) * np.exp(-t * 80)
    overtone = np.sin(2 * np.pi * 780 * t) * np.exp(-t * 30) * 0.3
    return (low * 0.8 + click * 0.4 + overtone).astype(np.float32)

def gen_hatch_slide(dur=0.6):
    t = np.linspace(0, dur, int(SR * dur), False)
    noise = np.random.uniform(-0.3, 0.3, len(t))
    sos = signal.butter(3, [300, 1800], btype='bandpass', fs=SR, output='sos')
    scrape = signal.sosfilt(sos, noise) * np.sin(np.pi * (t / dur))
    motor = np.sin(2 * np.pi * 120 * t) * 0.2 * np.sin(np.pi * (t / dur))
    return (scrape + motor).astype(np.float32)

def gen_precision_clank(dur=0.15, freq=1200):
    t = np.linspace(0, dur, int(SR * dur), False)
    impact = np.sin(2 * np.pi * freq * t) * np.exp(-t * 40)
    thud = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 25) * 0.6
    trans = np.random.uniform(-0.4, 0.4, len(t)) * np.exp(-t * 120)
    return (impact * 0.6 + thud + trans).astype(np.float32)

def gen_toggle_switch_click(dur=0.08):
    t = np.linspace(0, dur, int(SR * dur), False)
    click1 = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 90)
    click2 = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 70) * 0.7
    trans = np.random.uniform(-0.6, 0.6, len(t)) * np.exp(-t * 140)
    return (click1 + click2 + trans).astype(np.float32)

def gen_pushbutton_slam(dur=0.22):
    t = np.linspace(0, dur, int(SR * dur), False)
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 16)
    click = np.random.uniform(-0.7, 0.7, len(t)) * np.exp(-t * 90)
    ring = np.sin(2 * np.pi * 1650 * t) * np.exp(-t * 35) * 0.35
    return (thump * 0.9 + click * 0.5 + ring).astype(np.float32)

def gen_knife_switch_slam(dur=0.35):
    t = np.linspace(0, dur, int(SR * dur), False)
    # Heavy copper jaws impact
    heavy_thud = np.sin(2 * np.pi * 70 * t) * np.exp(-t * 12)
    copper_ring = np.sin(2 * np.pi * 920 * t) * np.exp(-t * 22) * 0.5
    # Electrical arc crackle
    zap_noise = np.random.uniform(-0.8, 0.8, len(t)) * np.exp(-t * 45)
    zap_sos = signal.butter(4, [1500, 7000], btype='bandpass', fs=SR, output='sos')
    zap = signal.sosfilt(zap_sos, zap_noise) * 0.75
    return (heavy_thud + copper_ring + zap).astype(np.float32)

def gen_pneumatic_purge(dur=0.6):
    t = np.linspace(0, dur, int(SR * dur), False)
    noise = np.random.uniform(-0.6, 0.6, len(t))
    env = np.sin(np.pi * (t / dur)) ** 1.8
    sos = signal.butter(2, [800, 5000], btype='bandpass', fs=SR, output='sos')
    return (signal.sosfilt(sos, noise) * env).astype(np.float32)

def gen_steam_purge(dur=0.8):
    t = np.linspace(0, dur, int(SR * dur), False)
    noise = np.random.uniform(-0.8, 0.8, len(t))
    env = np.sin(np.pi * (t / dur)) ** 1.4
    sos = signal.butter(3, [1200, 8000], btype='bandpass', fs=SR, output='sos')
    return (signal.sosfilt(sos, noise) * env).astype(np.float32)

def gen_motor_spinup(dur=4.5):
    t = np.linspace(0, dur, int(SR * dur), False)
    freq = np.linspace(80, 2400, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    drone = np.sin(phase) * (0.15 + 0.25 * (t / dur))
    # Motor 50 Hz fundamental
    m50 = np.sin(2 * np.pi * 50 * t) * 0.35
    hiss = signal.sosfilt(signal.butter(3, 3000, btype='highpass', fs=SR, output='sos'), np.random.uniform(-0.15, 0.15, len(t))) * 0.2
    return (drone + m50 + hiss).astype(np.float32)

def gen_quantum_drone(dur=5.0):
    t = np.linspace(0, dur, int(SR * dur), False)
    sub = np.sin(2 * np.pi * 38 * t) * 0.55
    plasma_l = np.sin(2 * np.pi * 120 * t) * (0.3 + 0.1 * np.sin(2 * np.pi * 4 * t))
    plasma_r = np.sin(2 * np.pi * 182 * t) * (0.3 + 0.1 * np.cos(2 * np.pi * 4 * t))
    riser = np.sin(2 * np.pi * np.linspace(800, 3200, len(t)) * t) * np.linspace(0.15, 0.4, len(t))
    return (sub + plasma_l + riser * 0.5).astype(np.float32), (sub + plasma_r + riser * 0.5).astype(np.float32)

def gen_coin_cascade(dur=4.2, count=180):
    left = np.zeros(int(SR * dur), dtype=np.float32)
    right = np.zeros(int(SR * dur), dtype=np.float32)
    np.random.seed(101)
    for _ in range(count):
        start = np.random.uniform(0.0, dur - 0.18)
        freq = np.random.uniform(3400, 7200)
        t = np.linspace(0, 0.14, int(SR * 0.14), False)
        clink = np.sin(2 * np.pi * freq * t) * np.exp(-t * 36) + np.random.uniform(-0.2, 0.2, len(t)) * np.exp(-t * 110)
        pan = np.random.uniform(0.1, 0.9)
        idx0 = int(start * SR)
        idx1 = min(idx0 + len(clink), len(left))
        cl_len = idx1 - idx0
        vol = np.random.uniform(0.2, 0.85)
        left[idx0:idx1] += clink[:cl_len] * vol * (1.0 - pan)
        right[idx0:idx1] += clink[:cl_len] * vol * pan
    return left, right

# ==========================================================
# MASTER SCORE ASSEMBLY (24.0 SECONDS)
# ==========================================================

print("1. Level 1: 10 ₽ Rusty Manual Pump (0.0s - 5.0s)...")
for t_s in [0.4, 2.2, 3.8]:
    creak = gen_rusty_lever_creak(dur=0.65)
    add_audio(t_s, creak * 0.8, creak * 0.8)
    drop = gen_water_droplet(dur=0.18)
    add_audio(t_s + 0.8, drop * 0.9, drop * 0.7)
    bucket_thud = gen_metal_thud(dur=0.15, freq=130)
    add_audio(t_s + 0.82, bucket_thud * 0.25, bucket_thud * 0.3)

print("2. Transformation 1: Dismantle & Modular Assembly (5.0s - 6.5s)...")
# Hatch opening & pump collapsing into floor
hatch = gen_hatch_slide(dur=0.6)
add_audio(5.0, hatch * 0.7, hatch * 0.7)
thud_down = gen_metal_thud(dur=0.25, freq=75)
add_audio(5.3, thud_down * 0.7, thud_down * 0.7)
# Flywheel and bronze pillars rising & locking
clank1 = gen_precision_clank(dur=0.15, freq=1100)
add_audio(5.8, clank1 * 0.8, clank1 * 0.5)
clank2 = gen_precision_clank(dur=0.15, freq=1400)
add_audio(6.1, clank2 * 0.5, clank2 * 0.8)

print("3. Trigger 1: Brass Toggle Switch Click (6.5s)...")
toggle = gen_toggle_switch_click(dur=0.08)
add_audio(6.5, toggle * 1.2, toggle * 1.2)

print("4. Level 2: 100 ₽ Cast-Iron & Bronze Piston Pump (6.5s - 11.5s)...")
# Continuous flywheel and stream
t_p_stream = np.linspace(0, 5.0, int(SR * 5.0), False)
flywheel = np.sin(2 * np.pi * 65 * t_p_stream) * 0.2
stream = signal.sosfilt(signal.butter(3, [350, 1600], btype='bandpass', fs=SR, output='sos'), np.random.uniform(-0.4, 0.4, len(t_p_stream))) * 0.3
add_audio(6.6, flywheel + stream, flywheel + stream)
# Piston strokes 120 BPM
for t_p in np.arange(6.6, 11.5, 0.5):
    thud = gen_metal_thud(dur=0.25, freq=110)
    pan = 0.6 if int(t_p * 2) % 2 == 0 else 0.4
    add_audio(t_p, thud * pan * 0.75, thud * (1 - pan) * 0.75)

print("5. Transformation 2: Retract & Turbo Assembly (11.5s - 13.0s)...")
pneu = gen_pneumatic_purge(dur=0.6)
add_audio(11.5, pneu * 0.85, pneu * 0.7)
rail_slide = gen_hatch_slide(dur=0.7)
add_audio(11.9, rail_slide * 0.6, rail_slide * 0.6)
clamp = gen_precision_clank(dur=0.2, freq=850)
add_audio(12.6, clamp * 1.1, clamp * 1.1)

print("6. Trigger 2: Red Pushbutton Slam (13.0s)...")
btn = gen_pushbutton_slam(dur=0.22)
add_audio(13.0, btn * 1.3, btn * 1.3)

print("7. Level 3: 1 000 ₽ High-Pressure Turbo-Pump (13.0s - 18.0s)...")
motor_whine = gen_motor_spinup(dur=5.0)
jet = signal.sosfilt(signal.butter(4, [500, 3500], btype='bandpass', fs=SR, output='sos'), np.random.uniform(-0.5, 0.5, int(SR * 5.0))) * 0.45
add_audio(13.05, motor_whine + jet, motor_whine + jet)

print("8. Transformation 3: Steam Purge & Quantum Assembly (18.0s - 19.5s)...")
steam = gen_steam_purge(dur=0.8)
add_audio(18.0, steam * 1.0, steam * 0.9)
heavy_mantle_drop = gen_metal_thud(dur=0.35, freq=55)
add_audio(18.8, heavy_mantle_drop * 0.9, heavy_mantle_drop * 0.9)
mag_lock = gen_precision_clank(dur=0.18, freq=1600)
add_audio(19.2, mag_lock * 1.0, mag_lock * 1.0)

print("9. Trigger 3: Heavy Copper Knife Switch Slam (19.5s)...")
knife = gen_knife_switch_slam(dur=0.35)
add_audio(19.5, knife * 1.4, knife * 1.4)

print("10. Level 4: 100 000 ₽+ Quantum Reactor Climax (19.5s - 24.0s)...")
q_l, q_r = gen_quantum_drone(dur=4.5)
add_audio(19.55, q_l * 0.85, q_r * 0.85)
coins_l, coins_r = gen_coin_cascade(dur=4.2, count=180)
add_audio(19.8, coins_l * 0.85, coins_r * 0.85)

# Normalization to -1.0 dB Peak
max_val = np.max(np.abs(stereo))
if max_val > 0:
    stereo = (stereo / max_val) * 0.89

out_wav = "remotion_studio/public/audio/asmr_transformation.wav"
os.makedirs(os.path.dirname(out_wav), exist_ok=True)
wavfile.write(out_wav, SR, (stereo.T * 32767).astype(np.int16))
print(f"Master ASMR track successfully written to {out_wav} ({DURATION}s, {SR}Hz Stereo)")
