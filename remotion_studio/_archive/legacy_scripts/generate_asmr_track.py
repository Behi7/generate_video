#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer
Generates a 23.0-second 44.1kHz Stereo Master Track for 'Pump Progression'
Strictly follows The Pure ASMR Law (Zero AI Voiceover, rich Low/Mid/High textures).
"""

import numpy as np
from scipy.io import wavfile
from scipy import signal
import os

SR = 44100
DURATION = 23.0
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

# --- Sound Synthesis Modules ---

def gen_water_droplet(pitch_start=1350, pitch_end=1850, dur=0.18):
    t = np.linspace(0, dur, int(SR * dur), False)
    freq = np.linspace(pitch_start, pitch_end, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 22)
    tone = np.sin(phase) * env
    # Reverb ring
    ring = np.sin(2 * np.pi * pitch_end * 1.5 * t) * np.exp(-t * 35) * 0.25
    return (tone + ring).astype(np.float32)

def gen_rusty_lever_creak(dur=0.7):
    t = np.linspace(0, dur, int(SR * dur), False)
    # FM modulation for metal squeak
    mod = np.sin(2 * np.pi * 12 * t) * 120
    freq = 680 + mod + np.sin(2 * np.pi * 3 * t) * 80
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.sin(np.pi * (t / dur)) ** 1.5
    noise = np.random.uniform(-0.15, 0.15, len(t))
    creak = (np.sin(phase) + noise) * env
    # Bandpass filter around 750Hz
    sos = signal.butter(4, [400, 1400], btype='bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, creak).astype(np.float32)

def gen_metal_thud(dur=0.25, freq=85):
    t = np.linspace(0, dur, int(SR * dur), False)
    # Low thud
    low = np.sin(2 * np.pi * freq * np.exp(-t * 6) * t) * np.exp(-t * 14)
    # Click transient
    click = np.random.uniform(-0.5, 0.5, len(t)) * np.exp(-t * 80)
    # Metallic overtone
    overtone = np.sin(2 * np.pi * 780 * t) * np.exp(-t * 30) * 0.3
    return (low * 0.8 + click * 0.4 + overtone).astype(np.float32)

def gen_piston_stroke(dur=0.45):
    thud = gen_metal_thud(dur=0.25, freq=110)
    # Metal sliding scrape
    t_scrape = np.linspace(0, dur, int(SR * dur), False)
    scrape = np.random.uniform(-0.2, 0.2, len(t_scrape)) * np.exp(-t_scrape * 7)
    sos = signal.butter(4, [800, 2400], btype='bandpass', fs=SR, output='sos')
    scrape_filtered = signal.sosfilt(sos, scrape)
    total = np.zeros(int(SR * dur), dtype=np.float32)
    total[:len(thud)] += thud * 0.7
    total += scrape_filtered * 0.35
    return total

def gen_flywheel_hum(dur=5.5, rpm_freq=2.2):
    t = np.linspace(0, dur, int(SR * dur), False)
    # Low continuous rotation thrum
    thrum = np.sin(2 * np.pi * 65 * t) * (0.8 + 0.2 * np.sin(2 * np.pi * rpm_freq * t))
    # Soft air whoosh
    noise = np.random.uniform(-0.1, 0.1, len(t))
    sos = signal.butter(2, [120, 500], btype='bandpass', fs=SR, output='sos')
    whoosh = signal.sosfilt(sos, noise) * (0.7 + 0.3 * np.cos(2 * np.pi * rpm_freq * t))
    return (thrum * 0.25 + whoosh * 0.35).astype(np.float32)

def gen_water_flow_stream(dur=5.5, intensity=0.4):
    t = np.linspace(0, dur, int(SR * dur), False)
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(4, [350, 1600], btype='bandpass', fs=SR, output='sos')
    filtered = signal.sosfilt(sos, noise)
    envelope = 0.8 + 0.2 * np.sin(2 * np.pi * 3.5 * t)
    return (filtered * envelope * intensity).astype(np.float32)

def gen_pneumatic_whoosh(dur=0.8):
    t = np.linspace(0, dur, int(SR * dur), False)
    freq = np.linspace(1400, 250, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    noise = np.random.uniform(-0.6, 0.6, len(t))
    env = np.sin(np.pi * (t / dur)) ** 1.8
    burst = (np.sin(phase) * 0.3 + noise * 0.7) * env
    sos = signal.butter(2, [300, 4500], btype='bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, burst).astype(np.float32)

def gen_industrial_motor(dur=5.5):
    t = np.linspace(0, dur, int(SR * dur), False)
    # 50 Hz fundamental + 100Hz + 250Hz
    m50 = np.sin(2 * np.pi * 50 * t) * 0.45
    m100 = np.sin(2 * np.pi * 100 * t) * 0.25
    m250 = np.sin(2 * np.pi * 250 * t) * 0.15
    # High pressure turbine whirl
    whirl = np.sin(2 * np.pi * 840 * t) * 0.12
    # Pressure hiss
    hiss = signal.sosfilt(signal.butter(4, 2500, btype='highpass', fs=SR, output='sos'), np.random.uniform(-0.2, 0.2, len(t))) * 0.3
    return (m50 + m100 + m250 + whirl + hiss).astype(np.float32)

def gen_quantum_drone(dur=6.5):
    t = np.linspace(0, dur, int(SR * dur), False)
    # Sub-bass 38 Hz drone
    sub = np.sin(2 * np.pi * 38 * t) * 0.55
    # Twin pulsating plasma carriers (120 Hz, 182 Hz)
    plasma_l = np.sin(2 * np.pi * 120 * t) * (0.3 + 0.1 * np.sin(2 * np.pi * 4 * t))
    plasma_r = np.sin(2 * np.pi * 182 * t) * (0.3 + 0.1 * np.cos(2 * np.pi * 4 * t))
    # Hypersonic riser / continuous turbine whine
    riser = np.sin(2 * np.pi * np.linspace(600, 2200, len(t)) * t) * np.linspace(0.1, 0.35, len(t))
    out_l = sub + plasma_l + riser * 0.5
    out_r = sub + plasma_r + riser * 0.5
    return out_l.astype(np.float32), out_r.astype(np.float32)

def gen_single_coin_clink(dur=0.12, freq=4800):
    t = np.linspace(0, dur, int(SR * dur), False)
    tone = np.sin(2 * np.pi * freq * t) * np.exp(-t * 35)
    harmonic = np.sin(2 * np.pi * (freq * 1.58) * t) * np.exp(-t * 50) * 0.5
    transient = np.random.uniform(-0.3, 0.3, len(t)) * np.exp(-t * 120)
    return (tone + harmonic + transient).astype(np.float32)

def gen_coin_cascade(dur=5.0, count=140):
    left = np.zeros(int(SR * dur), dtype=np.float32)
    right = np.zeros(int(SR * dur), dtype=np.float32)
    np.random.seed(42)
    for _ in range(count):
        start = np.random.uniform(0.0, dur - 0.2)
        freq = np.random.uniform(3200, 6800)
        clink = gen_single_coin_clink(dur=np.random.uniform(0.08, 0.18), freq=freq)
        pan = np.random.uniform(0.1, 0.9)
        idx0 = int(start * SR)
        idx1 = min(idx0 + len(clink), len(left))
        cl_len = idx1 - idx0
        vol = np.random.uniform(0.2, 0.8)
        left[idx0:idx1] += clink[:cl_len] * vol * (1.0 - pan)
        right[idx0:idx1] += clink[:cl_len] * vol * pan
    return left, right

# ==========================================================
# BUILD THE 23-SECOND SCORE
# ==========================================================

print("Synthesizing Stage 1 (0.0s - 5.5s): 10 ₽ Rusty Hand Pump...")
# Hand pump strokes at 0.5s, 2.2s, 3.9s
for stroke_t in [0.4, 2.1, 3.8]:
    creak = gen_rusty_lever_creak(dur=0.7)
    add_audio(stroke_t, creak * 0.75, creak * 0.75)
    # Droplet falls 0.9s after lever push
    drop = gen_water_droplet(dur=0.2)
    add_audio(stroke_t + 0.85, drop * 0.9, drop * 0.7)
    # Tiny tin bucket reverberation
    thud = gen_metal_thud(dur=0.15, freq=140)
    add_audio(stroke_t + 0.86, thud * 0.25, thud * 0.3)

print("Synthesizing Transition 1 (5.2s - 6.0s): Servo Glide...")
whoosh1 = gen_pneumatic_whoosh(dur=0.7)
add_audio(5.2, whoosh1 * 0.8, whoosh1 * 0.6)

print("Synthesizing Stage 2 (5.5s - 11.0s): 100 ₽ Cast-Iron Piston & Flywheel...")
# Continuous flywheel and water stream
flywheel = gen_flywheel_hum(dur=5.5, rpm_freq=2.0)
stream = gen_water_flow_stream(dur=5.5, intensity=0.25)
add_audio(5.5, flywheel + stream, flywheel + stream)
# Rhythmic piston strokes (120 BPM = every 0.5s)
for t_p in np.arange(5.5, 11.0, 0.5):
    piston = gen_piston_stroke(dur=0.35)
    # Slight alternating stereo pan
    pan = 0.6 if int(t_p * 2) % 2 == 0 else 0.4
    add_audio(t_p, piston * pan * 0.7, piston * (1 - pan) * 0.7)

print("Synthesizing Transition 2 (10.7s - 11.5s): Industrial Hydraulic Shift...")
whoosh2 = gen_pneumatic_whoosh(dur=0.8)
thud_trans = gen_metal_thud(dur=0.3, freq=65)
add_audio(10.7, whoosh2 * 0.9, whoosh2 * 0.7)
add_audio(10.75, thud_trans * 0.6, thud_trans * 0.6)

print("Synthesizing Stage 3 (11.0s - 16.5s): 1 000 ₽ High-Pressure Turbo-Pump...")
motor = gen_industrial_motor(dur=5.5)
jet_stream = gen_water_flow_stream(dur=5.5, intensity=0.6)
add_audio(11.0, motor + jet_stream, motor + jet_stream)
# Pressure valve flutter clicks
for t_v in np.arange(11.3, 16.5, 0.4):
    click = gen_single_coin_clink(dur=0.04, freq=1800) * 0.3
    add_audio(t_v, click, click)

print("Synthesizing Transition 3 (16.2s - 17.0s): Sci-Fi Plasma Overdrive Shift...")
whoosh3 = gen_pneumatic_whoosh(dur=0.9)
add_audio(16.2, whoosh3 * 1.1, whoosh3 * 1.1)

print("Synthesizing Stage 4 (16.5s - 23.0s): 100 000 ₽+ Quantum Reactor Turbine...")
drone_l, drone_r = gen_quantum_drone(dur=6.5)
add_audio(16.5, drone_l * 0.85, drone_r * 0.85)
# Exploding coin cascade starting from 17.2s
coins_l, coins_r = gen_coin_cascade(dur=5.8, count=160)
add_audio(17.2, coins_l * 0.75, coins_r * 0.75)

# Normalization to -1.0 dB Peak / Solid RMS
max_val = np.max(np.abs(stereo))
if max_val > 0:
    stereo = (stereo / max_val) * 0.89

out_path = "remotion_studio/public/audio/asmr_pump_progression.wav"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
wavfile.write(out_path, SR, (stereo.T * 32767).astype(np.int16))
print(f"Master ASMR track successfully written to {out_path} ({DURATION}s, {SR}Hz Stereo)")
