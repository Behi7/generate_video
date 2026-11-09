#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer
Generates a 24.0-second 44.1kHz Stereo Master Track for 'Epic Mechanical Destruction & Modular Assembly'
Tailored for 30 FPS timing (720 frames).

Synchronized Audio Milestones:
- Docking Impacts:
    Frame 128 (4.27s): Heavy cast iron bed magnetic drop thud.
    Frame 133 (4.43s): Twin modular components snap-clamp ('TS-TS!').
    Frame 316 (10.53s): Turbo pump volute & motor high-velocity magnetic latch ('TS-TS-TS!').
    Frame 514 (17.13s): Quantum reactor twin impellers and quartz core magnetic lock ('TS-TS-TS!').
- Physical Triggers:
    Frame 180 (6.00s): Heavy polished brass throw-lever switch clack.
    Frame 360 (12.00s): Red industrial mushroom emergency button thwack + spring bounce.
    Frame 560 (18.67s): High-voltage armored cable plug slam + electric arc spark buzz ('ZZZZT!').
- Destruction & Climax:
    Violent structural fracture snaps, explosive steam purges, sheared flywheel rolling rumble,
    and 220+ sparkling resonant metal coin clinks cascading during the climax.
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
# 1. MAGNETIC SNAP-LOCK SOUND GENERATOR
# ==========================================================

def gen_magnetic_snap(dur=0.12, clicks=3, freq_base=800, metallic_gain=1.0):
    """
    Rapid transient metallic 'snap' with high resonant frequencies (3.5 kHz - 7 kHz)
    + punchy mid clamp (800 Hz) + sharp mechanical latch hit ('TS-TS-TS!').
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # Micro-click timing offsets for sharp latch hit ('TS-TS-TS!')
    if clicks == 1:
        offsets = [0.0]
        weights = [1.0]
    elif clicks == 2:
        offsets = [0.0, 0.022]
        weights = [0.7, 1.0]
    else:  # Default: 3 micro-strikes ('TS-TS-TS!')
        offsets = [0.0, 0.016, 0.036]
        weights = [0.5, 0.72, 1.0]

    for dt_start, weight in zip(offsets, weights):
        mask = t >= dt_start
        dt = t[mask] - dt_start
        if len(dt) == 0:
            continue

        # 1. High resonant metallic pings (3.5 kHz - 7 kHz)
        ring_3k6 = np.sin(2 * np.pi * 3650 * dt) * np.exp(-dt * 95)
        ring_5k2 = np.sin(2 * np.pi * 5200 * dt) * np.exp(-dt * 125) * 0.75
        ring_6k8 = np.sin(2 * np.pi * 6850 * dt) * np.exp(-dt * 155) * 0.55
        metallic_snap = (ring_3k6 + ring_5k2 + ring_6k8) * 0.65 * metallic_gain

        # 2. Punchy mid clamp (800 Hz)
        mid_clamp = (
            np.sin(2 * np.pi * freq_base * np.exp(-dt * 18) * dt)
            * np.exp(-dt * 48)
            * 0.9
        )

        # 3. Sharp mechanical latch hit ('TS-TS-TS!') - ultra-fast crisp transient burst
        noise = np.random.uniform(-0.85, 0.85, len(dt)) * np.exp(-dt * 170)
        sos_snap = signal.butter(3, [3500, 8500], btype="bandpass", fs=SR, output="sos")
        ts_hit = signal.sosfilt(sos_snap, noise) * 1.25

        hit = (metallic_snap + mid_clamp + ts_hit) * weight
        out[mask] += hit

    # Low-end mass seating impulse on final latch
    t_main = t[t >= offsets[-1]] - offsets[-1]
    if len(t_main) > 0:
        low_seat = np.sin(2 * np.pi * 135 * t_main) * np.exp(-t_main * 42) * 0.45
        out[t >= offsets[-1]] += low_seat

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)

# ==========================================================
# 2. ENHANCED PHYSICAL TRIGGER GENERATORS
# ==========================================================

def gen_brass_lever_throw(dur=0.28):
    """
    Frame 180 (6.00s): Heavy polished brass throw-lever switch clack.
    - Initial pivot mechanical slide / tension build.
    - Heavy detent latch impact with low cast brass mass (135 Hz).
    - Polished brass resonant chime harmonics (1680 Hz, 3360 Hz, 4850 Hz).
    - Secondary micro-bounce clack 9 ms later.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # 1. Pre-throw pivot slide friction (0 to 0.032s)
    t_pre = 0.032
    swish_t = t[t < t_pre]
    if len(swish_t) > 0:
        noise = np.random.uniform(-0.35, 0.35, len(swish_t))
        sos_swish = signal.butter(2, [1100, 4200], btype="bandpass", fs=SR, output="sos")
        swish = signal.sosfilt(sos_swish, noise) * np.sin(np.pi * swish_t / t_pre)
        out[:len(swish_t)] += swish * 0.45

    # 2. Heavy Detent Clack at t = 0.032s
    t_hit = t[t >= t_pre] - t_pre
    if len(t_hit) > 0:
        # Cast brass low mass thud
        thud = np.sin(2 * np.pi * 135 * np.exp(-t_hit * 12) * t_hit) * np.exp(-t_hit * 22) * 1.15
        # Sharp impact transient click
        click_noise = np.random.uniform(-0.9, 0.9, len(t_hit)) * np.exp(-t_hit * 95)
        sos_click = signal.butter(3, [1800, 6200], btype="bandpass", fs=SR, output="sos")
        click = signal.sosfilt(sos_click, click_noise) * 1.35
        # Polished brass resonant chime harmonics
        brass_1 = np.sin(2 * np.pi * 1680 * t_hit) * np.exp(-t_hit * 32) * 0.8
        brass_2 = np.sin(2 * np.pi * 3360 * t_hit) * np.exp(-t_hit * 44) * 0.5
        brass_3 = np.sin(2 * np.pi * 4850 * t_hit) * np.exp(-t_hit * 56) * 0.3

        # Secondary micro-bounce clack (9ms later)
        t_b = t_hit - 0.009
        bounce = np.zeros_like(t_hit)
        b_mask = t_b > 0
        bounce[b_mask] = np.sin(2 * np.pi * 2800 * t_b[b_mask]) * np.exp(-t_b[b_mask] * 75) * 0.42

        detent_hit = thud + click + brass_1 + brass_2 + brass_3 + bounce
        out[t >= t_pre] += detent_hit

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)

def gen_pushbutton_thwack(dur=0.28):
    """
    Frame 360 (12.00s): Red industrial mushroom emergency button thwack + spring bounce.
    - Deep operator palm thwack (82 Hz decaying into 55 Hz).
    - Sharp plastic cap bottom-out crack & internal microswitch trip.
    - Heavy conical return spring bounce (ping at 1250 Hz with 35 Hz tremor) + rebound shudder.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # 1. Primary palm strike + cap bottom-out (t = 0.0)
    thump = np.sin(2 * np.pi * 82 * np.exp(-t * 14) * t) * np.exp(-t * 16) * 1.25
    noise_crack = np.random.uniform(-0.9, 0.9, len(t)) * np.exp(-t * 95)
    sos_c = signal.butter(3, [1400, 5200], btype="bandpass", fs=SR, output="sos")
    crack = signal.sosfilt(sos_c, noise_crack) * 1.15
    trip = np.sin(2 * np.pi * 2450 * t) * np.exp(-t * 70) * 0.75

    out += (thump + crack + trip)

    # 2. Heavy return spring bounce & ring (t = 0.024s)
    t_b1 = t - 0.024
    m_b1 = t_b1 > 0
    if np.any(m_b1):
        dt1 = t_b1[m_b1]
        spring_ping = (
            np.sin(2 * np.pi * 1250 * dt1 + np.sin(2 * np.pi * 35 * dt1) * 0.5)
            * np.exp(-dt1 * 40)
            * 0.7
        )
        spring_click = np.sin(2 * np.pi * 3200 * dt1) * np.exp(-dt1 * 80) * 0.42
        out[m_b1] += (spring_ping + spring_click)

    # 3. Secondary spring shudder (t = 0.052s)
    t_b2 = t - 0.052
    m_b2 = t_b2 > 0
    if np.any(m_b2):
        dt2 = t_b2[m_b2]
        spring_recoil = np.sin(2 * np.pi * 1100 * dt2) * np.exp(-dt2 * 50) * 0.32
        out[m_b2] += spring_recoil

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)

def gen_high_voltage_plug_slam(dur=0.55):
    """
    Frame 560 (18.67s): High-voltage armored cable plug slam + electric arc spark buzz ('ZZZZT!').
    - Heavy armored connector impact: 54 Hz sub-bass drop + socket sleeve ring.
    - Multi-pin copper bayonet engagement clicks.
    - Full-wave rectified 100 Hz mains buzz + plasma arc spark sizzle (2.2 kHz - 8.5 kHz).
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # 1. Heavy Armored Connector Slam Impact (t = 0.0)
    sub_slam = np.sin(2 * np.pi * 54 * np.exp(-t * 7) * t) * np.exp(-t * 12) * 1.3
    sleeve_thud = np.sin(2 * np.pi * 280 * t) * np.exp(-t * 26) * 0.85
    sleeve_ring = np.sin(2 * np.pi * 840 * t) * np.exp(-t * 40) * 0.55

    # Multi-pin copper bayonet engagement clicks
    dt_p2 = np.maximum(t - 0.008, 0)
    dt_p3 = np.maximum(t - 0.018, 0)
    pins = (
        np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 85) * 0.75
        + np.sin(2 * np.pi * 3800 * dt_p2) * np.exp(-dt_p2 * 90) * (t >= 0.008) * 0.65
        + np.sin(2 * np.pi * 5200 * dt_p3) * np.exp(-dt_p3 * 110) * (t >= 0.018) * 0.85
    )

    out += (sub_slam + sleeve_thud + sleeve_ring + pins)

    # 2. Electric Arc Spark Buzz ('ZZZZT!') starting at t = 0.018s
    t_arc = t - 0.018
    m_arc = t_arc > 0
    if np.any(m_arc):
        t_a = t_arc[m_arc]
        dur_arc = 0.38
        m_dur = t_a < dur_arc
        t_a_act = t_a[m_dur]

        # Arc envelope: sudden spike then chaotic sizzle decaying
        env_arc = np.exp(-t_a_act * 7.5) * (1.0 + 0.3 * np.sin(2 * np.pi * 28 * t_a_act))

        # 100 Hz full-wave rectified mains hum harmonics
        f_hum = 100.0
        mains_buzz = np.zeros_like(t_a_act)
        for h in range(1, 14):
            amp = 1.0 / (h ** 0.85)
            mains_buzz += np.sin(2 * np.pi * f_hum * h * t_a_act + h * 0.4) * amp
        mains_buzz = (mains_buzz / np.max(np.abs(mains_buzz))) * 0.75

        # Plasma arc spark discharge noise modulated by 100 Hz pulse
        raw_noise = np.random.uniform(-1.0, 1.0, len(t_a_act))
        pulse_mod = (np.abs(np.sin(2 * np.pi * f_hum * t_a_act))) ** 1.8
        sos_arc = signal.butter(4, [2200, 8500], btype="bandpass", fs=SR, output="sos")
        plasma_sizzle = signal.sosfilt(sos_arc, raw_noise) * pulse_mod * 1.55

        # Micro-spark arc discharge snaps
        zap_bursts = np.zeros_like(t_a_act)
        for z_t in [0.01, 0.045, 0.09, 0.14, 0.21]:
            d_z = t_a_act - z_t
            mz = (d_z >= 0) & (d_z < 0.015)
            if np.any(mz):
                zap_bursts[mz] += np.random.uniform(-0.85, 0.85, np.sum(mz)) * np.exp(-d_z[mz] * 200)

        total_arc = (mains_buzz * 0.5 + plasma_sizzle * 1.0 + zap_bursts * 0.85) * env_arc
        out_slice = out[m_arc]
        out_slice[m_dur] += total_arc * 1.4
        out[m_arc] = out_slice

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)

# ==========================================================
# 3. AUXILIARY MECHANICAL & DESTRUCTION SOUND GENERATORS
# ==========================================================

def gen_water_droplet(pitch_start=1400, pitch_end=1900, dur=0.18):
    t = np.linspace(0, dur, int(SR * dur), False)
    freq = np.linspace(pitch_start, pitch_end, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 24)
    tone = np.sin(phase) * env
    ring = np.sin(2 * np.pi * pitch_end * 1.5 * t) * np.exp(-t * 36) * 0.25
    return (tone + ring).astype(np.float32)

def gen_rusty_lever_creak(dur=0.65):
    t = np.linspace(0, dur, int(SR * dur), False)
    mod = np.sin(2 * np.pi * 14 * t) * 130
    freq = 680 + mod + np.sin(2 * np.pi * 3 * t) * 80
    phase = 2 * np.pi * np.cumsum(freq) / SR
    env = np.sin(np.pi * (t / dur)) ** 1.5
    noise = np.random.uniform(-0.15, 0.15, len(t))
    creak = (np.sin(phase) + noise) * env
    sos = signal.butter(4, [400, 1400], btype="bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, creak).astype(np.float32)

def gen_metal_thud(dur=0.25, freq=85):
    t = np.linspace(0, dur, int(SR * dur), False)
    low = np.sin(2 * np.pi * freq * np.exp(-t * 6) * t) * np.exp(-t * 14)
    click = np.random.uniform(-0.5, 0.5, len(t)) * np.exp(-t * 80)
    overtone = np.sin(2 * np.pi * 780 * t) * np.exp(-t * 30) * 0.3
    return (low * 0.8 + click * 0.4 + overtone).astype(np.float32)

def gen_crack_snap(dur=0.35):
    t = np.linspace(0, dur, int(SR * dur), False)
    snap = np.random.uniform(-0.95, 0.95, len(t)) * np.exp(-t * 75)
    thud = np.sin(2 * np.pi * 125 * t) * np.exp(-t * 22) * 0.9
    ring = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 45) * 0.45
    sos = signal.butter(4, [350, 5200], btype="bandpass", fs=SR, output="sos")
    return (signal.sosfilt(sos, snap) * 1.2 + thud + ring).astype(np.float32)

def gen_metal_clatter(dur=0.8):
    t = np.linspace(0, dur, int(SR * dur), False)
    out = np.zeros_like(t)
    np.random.seed(42)
    for _ in range(9):
        t0 = np.random.uniform(0.01, 0.55)
        freq = np.random.uniform(950, 3600)
        dur_clink = np.random.uniform(0.05, 0.13)
        t_c = np.linspace(0, dur_clink, int(SR * dur_clink), False)
        clink = np.sin(2 * np.pi * freq * t_c) * np.exp(-t_c * 45)
        i0 = int(t0 * SR)
        i1 = min(i0 + len(clink), len(out))
        out[i0:i1] += clink[:i1 - i0] * np.random.uniform(0.25, 0.75)
    return out.astype(np.float32)

def gen_steam_explosion(dur=0.9):
    t = np.linspace(0, dur, int(SR * dur), False)
    noise = np.random.uniform(-0.95, 0.95, len(t))
    env = np.sin(np.pi * (t / dur)) ** 1.3
    low_boom = np.sin(2 * np.pi * 65 * t) * np.exp(-t * 8) * 0.95
    sos = signal.butter(3, [800, 9500], btype="bandpass", fs=SR, output="sos")
    steam = signal.sosfilt(sos, noise) * env
    return (steam * 0.95 + low_boom).astype(np.float32)

def gen_flywheel_roll_rumble(dur=0.85):
    t = np.linspace(0, dur, int(SR * dur), False)
    rumble = np.sin(2 * np.pi * np.linspace(58, 28, len(t)) * t) * np.exp(-t * 2.5) * 0.75
    wobble = np.sin(2 * np.pi * 18 * t) * np.sin(2 * np.pi * 95 * t) * np.exp(-t * 3.0) * 0.4
    metal_grind = (
        signal.sosfilt(
            signal.butter(3, [400, 1800], btype="bandpass", fs=SR, output="sos"),
            np.random.uniform(-0.35, 0.35, len(t)),
        )
        * np.exp(-t * 2.8)
    )
    return (rumble + wobble + metal_grind).astype(np.float32)

def gen_precision_slide(dur=0.45):
    t = np.linspace(0, dur, int(SR * dur), False)
    noise = np.random.uniform(-0.25, 0.25, len(t))
    sos = signal.butter(2, [500, 2600], btype="bandpass", fs=SR, output="sos")
    hiss = signal.sosfilt(sos, noise) * np.sin(np.pi * (t / dur))
    return hiss.astype(np.float32)

def gen_docking_clamp(dur=0.2):
    t = np.linspace(0, dur, int(SR * dur), False)
    thud = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 24)
    clack = np.sin(2 * np.pi * 1450 * t) * np.exp(-t * 55) * 0.65
    pneum = np.random.uniform(-0.3, 0.3, len(t)) * np.exp(-t * 32)
    return (thud + clack + pneum).astype(np.float32)

def gen_motor_spinup(dur=4.5):
    t = np.linspace(0, dur, int(SR * dur), False)
    freq = np.linspace(120, 3200, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / SR
    drone = np.sin(phase) * (0.15 + 0.35 * (t / dur))
    m50 = np.sin(2 * np.pi * 50 * t) * 0.35
    hiss = (
        signal.sosfilt(
            signal.butter(3, 3000, btype="highpass", fs=SR, output="sos"),
            np.random.uniform(-0.15, 0.15, len(t)),
        )
        * 0.22
    )
    return (drone + m50 + hiss).astype(np.float32)

def gen_quantum_drone(dur=5.3):
    t = np.linspace(0, dur, int(SR * dur), False)
    sub = np.sin(2 * np.pi * 38 * t) * 0.65
    plasma_l = np.sin(2 * np.pi * 120 * t) * (0.32 + 0.12 * np.sin(2 * np.pi * 4 * t))
    plasma_r = np.sin(2 * np.pi * 182 * t) * (0.32 + 0.12 * np.cos(2 * np.pi * 4 * t))
    riser = np.sin(2 * np.pi * np.linspace(700, 3800, len(t)) * t) * np.linspace(0.15, 0.5, len(t))
    return (
        (sub + plasma_l + riser * 0.55).astype(np.float32),
        (sub + plasma_r + riser * 0.55).astype(np.float32),
    )

def gen_coin_cascade(dur=4.8, count=220):
    left = np.zeros(int(SR * dur), dtype=np.float32)
    right = np.zeros(int(SR * dur), dtype=np.float32)
    np.random.seed(303)
    for _ in range(count):
        start = np.random.uniform(0.0, dur - 0.18)
        freq = np.random.uniform(3400, 7500)
        t = np.linspace(0, 0.14, int(SR * 0.14), False)
        clink = np.sin(2 * np.pi * freq * t) * np.exp(-t * 36) + np.random.uniform(
            -0.2, 0.2, len(t)
        ) * np.exp(-t * 110)
        pan = np.random.uniform(0.1, 0.9)
        idx0 = int(start * SR)
        idx1 = min(idx0 + len(clink), len(left))
        cl_len = idx1 - idx0
        vol = np.random.uniform(0.28, 0.95)
        left[idx0:idx1] += clink[:cl_len] * vol * (1.0 - pan)
        right[idx0:idx1] += clink[:cl_len] * vol * pan
    return left, right

# ==========================================================
# 4. MASTER SCORE ASSEMBLY (24.0 SECONDS @ 30 FPS SYNCHRONIZED)
# ==========================================================

print("1. Level 1: 10 ₽ Rusty Manual Pump (0.0s - 3.83s, frames 0 - 114)...")
for t_s in [0.4, 1.6, 2.8]:
    creak = gen_rusty_lever_creak(dur=0.6)
    add_audio(t_s, creak * 0.75, creak * 0.75)
    drop = gen_water_droplet(dur=0.18)
    add_audio(t_s + 0.65, drop * 0.85, drop * 0.65)
    thud = gen_metal_thud(dur=0.15, freq=130)
    add_audio(t_s + 0.66, thud * 0.25, thud * 0.3)

print("2. Destruction 1: Lever Snaps & Cylinder Bursts (3.83s, frame 115)...")
crack = gen_crack_snap(dur=0.35)
add_audio(115 / 30.0, crack * 1.15, crack * 1.15)
clatter = gen_metal_clatter(dur=0.75)
add_audio(118 / 30.0, clatter * 0.85, clatter * 0.85)

print("3. Docking 1: Cast Iron Bed Drop & Twin Modular Snap (frames 128 & 133)...")
# Frame 128 (4.27s): Heavy cast iron bed magnetic drop thud
iron_bed_thud = gen_metal_thud(dur=0.32, freq=72)
iron_bed_snap = gen_magnetic_snap(dur=0.12, clicks=1, freq_base=750)
add_audio(128 / 30.0, iron_bed_thud * 1.1)
add_audio(128 / 30.0, iron_bed_snap * 0.85)

# Pre-docking rail slide
slide1 = gen_precision_slide(dur=0.25)
add_audio(129 / 30.0, slide1 * 0.6, slide1 * 0.4)

# Frame 133 (4.43s): Twin modular components snap-clamp ('TS-TS!')
twin_snap = gen_magnetic_snap(dur=0.12, clicks=2, freq_base=820)
twin_clamp = gen_docking_clamp(dur=0.18)
add_audio(133 / 30.0, twin_snap * 1.25)
add_audio(133 / 30.0, twin_clamp * 0.7)

print("4. Trigger 1: Heavy Polished Brass Throw-Lever Switch Clack (frame 180, 6.00s)...")
# Frame 180 (6.00s): Heavy polished brass throw-lever switch clack
lever = gen_brass_lever_throw(dur=0.28)
add_audio(180 / 30.0, lever * 1.35, lever * 1.35)

print("5. Level 2: 100 ₽ Piston Pump in Operation (6.05s - 10.00s, frames 181 - 299)...")
t_p_stream = np.linspace(0, 3.95, int(SR * 3.95), False)
flywheel_drone = np.sin(2 * np.pi * 65 * t_p_stream) * 0.22
water_stream = (
    signal.sosfilt(
        signal.butter(3, [350, 1600], btype="bandpass", fs=SR, output="sos"),
        np.random.uniform(-0.35, 0.35, len(t_p_stream)),
    )
    * 0.3
)
add_audio(181 / 30.0, flywheel_drone + water_stream, flywheel_drone + water_stream)
for t_p in np.arange(184 / 30.0, 300 / 30.0, 0.48):
    thud = gen_metal_thud(dur=0.22, freq=110)
    pan = 0.6 if int(t_p * 2) % 2 == 0 else 0.4
    add_audio(t_p, thud * pan * 0.75, thud * (1 - pan) * 0.75)

print("6. Destruction 2: Steam Blowout & Flywheel Detachment (10.00s, frame 300)...")
steam1 = gen_steam_explosion(dur=0.85)
add_audio(300 / 30.0, steam1 * 1.15, steam1 * 1.15)
flywheel_crack = gen_crack_snap(dur=0.32)
add_audio(301 / 30.0, flywheel_crack * 0.95, flywheel_crack * 0.95)
fw_rumble = gen_flywheel_roll_rumble(dur=0.85)
add_audio(305 / 30.0, fw_rumble * 1.0, fw_rumble * 0.7)
clatter2 = gen_metal_clatter(dur=0.7)
add_audio(308 / 30.0, clatter2 * 0.85, clatter2 * 0.85)

print("7. Docking 2: Turbo Pump Volute & Motor High-Velocity Magnetic Latch (frame 316, 10.53s)...")
# High-speed approach slide
slide_m = gen_precision_slide(dur=0.35)
add_audio(311 / 30.0, slide_m * 0.7, slide_m * 0.5)
# Frame 316 (10.53s): Turbo pump volute & motor high-velocity magnetic latch ('TS-TS-TS!')
turbo_snap = gen_magnetic_snap(dur=0.12, clicks=3, freq_base=800, metallic_gain=1.3)
turbo_clamp = gen_docking_clamp(dur=0.20)
add_audio(316 / 30.0, turbo_snap * 1.35)
add_audio(316 / 30.0, turbo_clamp * 0.8)

# Secondary top pipe magnetic engagement
pipe_snap = gen_magnetic_snap(dur=0.10, clicks=2, freq_base=860, metallic_gain=1.1)
add_audio(336 / 30.0, pipe_snap * 0.9, pipe_snap * 0.9)

print("8. Trigger 2: Red Industrial Mushroom Emergency Button Thwack (frame 360, 12.00s)...")
# Frame 360 (12.00s): Red industrial mushroom emergency button thwack + spring bounce
btn = gen_pushbutton_thwack(dur=0.28)
add_audio(360 / 30.0, btn * 1.45, btn * 1.45)

print("9. Level 3: 1 000 ₽ Turbo-Pump at 100 Bar (12.05s - 16.50s, frames 361 - 494)...")
motor_whine = gen_motor_spinup(dur=4.45)
jet = (
    signal.sosfilt(
        signal.butter(4, [500, 3600], btype="bandpass", fs=SR, output="sos"),
        np.random.uniform(-0.5, 0.5, int(SR * 4.45)),
    )
    * 0.48
)
add_audio(361 / 30.0, motor_whine + jet, motor_whine + jet)

print("10. Destruction 3: Gauge Blowout & Casing Rupture (16.50s, frame 495)...")
boom = gen_steam_explosion(dur=0.95)
add_audio(495 / 30.0, boom * 1.25, boom * 1.25)
gauge_pop = gen_crack_snap(dur=0.3)
add_audio(497 / 30.0, gauge_pop * 1.1, gauge_pop * 1.1)
clatter3 = gen_metal_clatter(dur=0.7)
add_audio(501 / 30.0, clatter3 * 0.9, clatter3 * 0.9)

print("11. Docking 3: Quantum Reactor Impellers & Quartz Core Magnetic Lock (frame 514, 17.13s)...")
# Approach slide
mantle_slide = gen_precision_slide(dur=0.38)
add_audio(508 / 30.0, mantle_slide * 0.7, mantle_slide * 0.7)
# Frame 514 (17.13s): Quantum reactor twin impellers and quartz core magnetic lock ('TS-TS-TS!')
quantum_snap = gen_magnetic_snap(dur=0.12, clicks=3, freq_base=850, metallic_gain=1.35)
base_thud = gen_metal_thud(dur=0.35, freq=55)
add_audio(514 / 30.0, quantum_snap * 1.35)
add_audio(514 / 30.0, base_thud * 1.0)

# Secondary crystal alignment interlock
core_lock = gen_magnetic_snap(dur=0.10, clicks=2, freq_base=920, metallic_gain=1.15)
add_audio(534 / 30.0, core_lock * 0.95, core_lock * 0.95)

print("12. Trigger 3: High-Voltage Armored Cable Plug Slam (frame 560, 18.67s)...")
# Frame 560 (18.67s): High-voltage armored cable plug slam + electric arc spark buzz ('ZZZZT!')
plug_slam = gen_high_voltage_plug_slam(dur=0.55)
add_audio(560 / 30.0, plug_slam * 1.5, plug_slam * 1.5)

print("13. Level 4: 100 000 ₽+ Quantum Reactor Climax (18.7s - 24.0s, frames 561 - 720)...")
q_l, q_r = gen_quantum_drone(dur=DURATION - (561 / 30.0))
add_audio(561 / 30.0, q_l * 0.92, q_r * 0.92)

coins_l, coins_r = gen_coin_cascade(dur=DURATION - (576 / 30.0), count=220)
add_audio(576 / 30.0, coins_l * 0.95, coins_r * 0.95)

# Master normalization to -1.0 dB peak (0.891 amplitude limit)
max_val = np.max(np.abs(stereo))
print(f"Pre-normalized peak amplitude: {max_val:.4f}")
if max_val > 0:
    stereo = (stereo / max_val) * 0.891

out_wav = "remotion_studio/public/audio/asmr_epic_transformation.wav"
os.makedirs(os.path.dirname(out_wav), exist_ok=True)
wavfile.write(out_wav, SR, (stereo.T * 32767).astype(np.int16))

# Verification of output file
actual_samples = stereo.shape[1]
actual_dur = actual_samples / SR
final_peak = np.max(np.abs(stereo))
peak_db = 20 * np.log10(final_peak)

print(f"Master ASMR track successfully written to {out_wav}")
print(f"Track Duration: {actual_dur:.3f}s (exact {actual_samples} samples, {actual_dur * 30:.1f} frames @ 30 FPS)")
print(f"Audio Format: {SR} Hz Stereo 16-bit PCM WAV")
print(f"Peak Amplitude: {final_peak:.4f} ({peak_db:.2f} dBFS)")
