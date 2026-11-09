#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer: GeneratorProgression
Generates a 24.0-second 44.1kHz Stereo Master Track for 'GeneratorProgression'
Tailored for 30 FPS timing (720 frames).

Strictly follows The Pure ASMR Law:
1. Zero AI Voiceover.
2. Rich tactile mechanical ASMR synthesized to exactly 720 frames (24.0s @ 30 FPS, 44.1 kHz stereo WAV).
3. Synchronized audio events:
   - High-velocity magnetic snap clicks ('TS-TS-TS!') on module docking impacts.
   - On-machine triggers: heavy brass lever clack, industrial mushroom button thwack,
     armored cable plug slam with electrical buzz.
   - Overload destruction: metal snapping crack, iron clatters, sheared flywheel rolling rumble,
     explosive steam purge, bulb shatter.
   - Coin cascade: 220+ bright resonant metal coin clinks climbing during climax.
"""

import numpy as np
from scipy.io import wavfile
from scipy import signal
import os

SR = 44100
FPS = 30
DURATION = 24.0
N_SAMPLES = int(SR * DURATION)
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
# 1. TIER 1 GENERATORS ($10 DYNAMO: CRANK, FILAMENT, SHATTER)
# ==========================================================

def gen_crank_turn(dur=0.55, intensity=1.0):
    """
    Hand crank rotation: mechanical bushing squeak + gear/friction texture + torque thrum.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Elliptical rotation effort envelope
    env = np.sin(np.pi * (t / dur)) ** 1.6
    
    # 1. Bushing friction squeak (FM modulated around 750-950 Hz)
    f_mod = np.sin(2 * np.pi * 8.5 * t) * 110.0
    f_carrier = 780.0 + f_mod
    phase_sq = 2 * np.pi * np.cumsum(f_carrier) / SR
    squeak_raw = np.sin(phase_sq) * env
    sos_sq = signal.butter(3, [500, 1900], btype="bandpass", fs=SR, output="sos")
    squeak = signal.sosfilt(sos_sq, squeak_raw) * 0.85
    
    # 2. Axle friction & rubbing texture
    noise = np.random.uniform(-0.5, 0.5, n_pts)
    sos_fric = signal.butter(3, [1100, 3200], btype="bandpass", fs=SR, output="sos")
    friction = signal.sosfilt(sos_fric, noise) * env * 0.6
    
    # 3. Gear ratchet micro-clicks (4 clicks per quarter turn)
    clicks = np.zeros(n_pts, dtype=np.float32)
    for c_t in [0.08, 0.18, 0.29, 0.41]:
        idx = int(c_t * SR)
        if idx < n_pts:
            dur_c = 0.015
            n_c = int(SR * dur_c)
            tc = np.linspace(0, dur_c, n_c, False)
            click_ping = np.sin(2 * np.pi * 2200 * tc) * np.exp(-tc * 220)
            clicks[idx:min(idx + n_c, n_pts)] += click_ping[:min(n_c, n_pts - idx)] * 0.5
            
    # 4. Low rotational torque thrum
    thrum = np.sin(2 * np.pi * 140 * t) * env * 0.45
    
    out = (squeak + friction + clicks + thrum) * intensity
    return out.astype(np.float32)


def gen_dynamo_filament_hum(dur=3.35):
    """
    Continuous dynamo alternator hum (50/60 Hz harmonics) + filament vibration buzz.
    Grows in amplitude across the crank turns until blowout.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Progressive power generation envelope
    env = np.linspace(0.15, 1.0, n_pts) ** 1.3
    
    # 55 Hz alternator fundamental + harmonics
    h55 = np.sin(2 * np.pi * 55 * t) * 0.4
    h110 = np.sin(2 * np.pi * 110 * t) * 0.25
    h220 = np.sin(2 * np.pi * 220 * t) * 0.18
    h330 = np.sin(2 * np.pi * 330 * t) * 0.12
    mains_buzz = (h55 + h110 + h220 + h330) * env
    
    # High-pitched filament wire micro-vibration (tungsten resonance 2800 - 3600 Hz)
    f_fil = 3100.0 + np.sin(2 * np.pi * 12 * t) * 80.0
    phase_fil = 2 * np.pi * np.cumsum(f_fil) / SR
    fil_buzz = np.sin(phase_fil) * (0.08 + 0.14 * env)
    
    # Subtle current hiss
    noise = np.random.uniform(-0.15, 0.15, n_pts)
    sos_hiss = signal.butter(3, [2400, 5500], btype="bandpass", fs=SR, output="sos")
    curr_hiss = signal.sosfilt(sos_hiss, noise) * env * 0.18
    
    left = (mains_buzz * 0.8 + fil_buzz * 0.9 + curr_hiss).astype(np.float32)
    right = (mains_buzz * 0.85 + fil_buzz * 0.75 + curr_hiss).astype(np.float32)
    return left, right


def gen_dynamo_blowout(dur=0.85):
    """
    Frame 115 (3.83s): Snapping handle crack + filament pop & glass shatter clatter onto metal floor.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    left = np.zeros(n_pts, dtype=np.float32)
    right = np.zeros(n_pts, dtype=np.float32)
    
    # 1. Snapping handle crack (t = 0.0)
    # Violent wood/metal fracture snap
    crack_noise = np.random.uniform(-0.95, 0.95, n_pts) * np.exp(-t * 85)
    sos_crack = signal.butter(3, [1600, 5800], btype="bandpass", fs=SR, output="sos")
    handle_crack = signal.sosfilt(sos_crack, crack_noise) * 1.35
    thud_snap = np.sin(2 * np.pi * 145 * np.exp(-t * 15) * t) * np.exp(-t * 24) * 1.1
    ring_snap = np.sin(2 * np.pi * 2350 * t) * np.exp(-t * 40) * 0.55
    
    # 2. Electrical filament pop (t = 0.012s)
    t_pop = t - 0.012
    m_pop = t_pop >= 0
    pop_sound = np.zeros(n_pts, dtype=np.float32)
    if np.any(m_pop):
        dt_p = t_pop[m_pop]
        pop_transient = np.sin(2 * np.pi * 1850 * dt_p) * np.exp(-dt_p * 110) * 0.85
        spark_fizz = (
            signal.sosfilt(
                signal.butter(3, [3500, 8000], btype="bandpass", fs=SR, output="sos"),
                np.random.uniform(-0.8, 0.8, len(dt_p)),
            )
            * np.exp(-dt_p * 95)
            * 0.95
        )
        pop_sound[m_pop] = pop_transient + spark_fizz
        
    base_impact = handle_crack + thud_snap + ring_snap + pop_sound
    left += base_impact
    right += base_impact
    
    # 3. Glass shatter & 24+ crystalline shards clattering onto metal floor (t = 0.025s to 0.65s)
    np.random.seed(115)
    n_shards = 26
    for i in range(n_shards):
        # Staggered impact times
        t0 = 0.022 + (i / float(n_shards)) * 0.52 + np.random.uniform(-0.015, 0.02)
        if t0 >= dur:
            continue
        freq_glass = np.random.uniform(3600, 8800)
        dur_shard = np.random.uniform(0.025, 0.09)
        n_sh = int(SR * dur_shard)
        t_sh = np.linspace(0, dur_shard, n_sh, False)
        
        # High-frequency glass ping + micro metal floor contact click
        ping = np.sin(2 * np.pi * freq_glass * t_sh) * np.exp(-t_sh * np.random.uniform(50, 110))
        click = np.random.uniform(-0.35, 0.35, n_sh) * np.exp(-t_sh * 180)
        shard_snd = (ping * 0.75 + click * 0.4) * np.random.uniform(0.3, 0.85)
        
        pan = np.random.uniform(0.15, 0.85)
        i0 = int(t0 * SR)
        i1 = min(i0 + n_sh, n_pts)
        sh_len = i1 - i0
        if sh_len > 0:
            left[i0:i1] += shard_snd[:sh_len] * (1.0 - pan)
            right[i0:i1] += shard_snd[:sh_len] * pan
            
    # Small metallic floor clatter accompaniment
    for t_c in [0.09, 0.17, 0.28, 0.42, 0.58]:
        idx = int(t_c * SR)
        if idx < n_pts:
            dur_m = 0.06
            nm = int(SR * dur_m)
            tm = np.linspace(0, dur_m, nm, False)
            metal_clink = np.sin(2 * np.pi * np.random.uniform(1400, 2900) * tm) * np.exp(-tm * 65) * 0.35
            left[idx:min(idx + nm, n_pts)] += metal_clink[:min(nm, n_pts - idx)] * 0.5
            right[idx:min(idx + nm, n_pts)] += metal_clink[:min(nm, n_pts - idx)] * 0.5
            
    return left, right


# ==========================================================
# 2. DOCKING IMPACTS & MAGNETIC SNAP GENERATORS
# ==========================================================

def gen_cast_iron_drop(dur=0.35, freq=72):
    """
    Frame 128 (4.27s): Cast-iron bed drop thud (72 Hz).
    Heavy cast-iron machine bed docking with steel floor plate.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 72 Hz fundamental with fast exponential decay
    low_thud = np.sin(2 * np.pi * freq * np.exp(-t * 5.5) * t) * np.exp(-t * 13) * 1.3
    # Low-end mass resonance (38-55 Hz)
    sub = np.sin(2 * np.pi * 42 * t) * np.exp(-t * 9) * 0.85
    # Heavy metal surface impact click
    click_noise = np.random.uniform(-0.85, 0.85, n_pts) * np.exp(-t * 95)
    sos_click = signal.butter(3, [1200, 4800], btype="bandpass", fs=SR, output="sos")
    impact_click = signal.sosfilt(sos_click, click_noise) * 0.95
    # Cast iron structural ringing
    ring = np.sin(2 * np.pi * 560 * t) * np.exp(-t * 28) * 0.45
    
    out = low_thud + sub + impact_click + ring
    return out.astype(np.float32)


def gen_magnetic_snap(dur=0.12, clicks=3, freq_base=800, metallic_gain=1.0):
    """
    High-velocity magnetic snap clicks ('TS-TS-TS!') on module docking impacts.
    - High resonant frequencies (3.5 kHz - 7 kHz)
    - Punchy mid clamp (800 Hz)
    - Ultra-crisp transient bursts
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    if clicks == 1:
        offsets = [0.0]
        weights = [1.0]
    elif clicks == 2:
        offsets = [0.0, 0.022]
        weights = [0.72, 1.0]
    else:  # 3 micro-strikes ('TS-TS-TS!')
        offsets = [0.0, 0.016, 0.036]
        weights = [0.55, 0.75, 1.0]

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
            * 0.95
        )

        # 3. Crisp transient burst noise ('TS!')
        noise = np.random.uniform(-0.85, 0.85, len(dt)) * np.exp(-dt * 170)
        sos_snap = signal.butter(3, [3500, 8500], btype="bandpass", fs=SR, output="sos")
        ts_hit = signal.sosfilt(sos_snap, noise) * 1.3

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


def gen_precision_slide(dur=0.35):
    """Guide rail mechanical slide approach before snap-docking."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    noise = np.random.uniform(-0.3, 0.3, n_pts)
    sos = signal.butter(2, [600, 2800], btype="bandpass", fs=SR, output="sos")
    slide = signal.sosfilt(sos, noise) * np.sin(np.pi * (t / dur))
    return slide.astype(np.float32)


def gen_docking_clamp(dur=0.22):
    """Pneumatic / mechanical clamp locking thud."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    thud = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 24)
    clack = np.sin(2 * np.pi * 1450 * t) * np.exp(-t * 55) * 0.65
    pneum = np.random.uniform(-0.35, 0.35, n_pts) * np.exp(-t * 32)
    return (thud + clack + pneum).astype(np.float32)


# ==========================================================
# 3. ON-MACHINE PHYSICAL TRIGGERS
# ==========================================================

def gen_brass_lever_throw(dur=0.28):
    """
    Frame 180 (6.00s): Heavy polished brass throw-lever switch clack.
    - Pre-throw pivot slide friction (0 to 32ms)
    - Heavy detent latch impact with low cast brass mass (135 Hz)
    - Polished brass resonant chime harmonics (1680 Hz, 3360 Hz, 4850 Hz)
    - Secondary micro-bounce clack 9ms later
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
        thud = np.sin(2 * np.pi * 135 * np.exp(-t_hit * 12) * t_hit) * np.exp(-t_hit * 22) * 1.2
        # Sharp impact transient click
        click_noise = np.random.uniform(-0.9, 0.9, len(t_hit)) * np.exp(-t_hit * 95)
        sos_click = signal.butter(3, [1800, 6200], btype="bandpass", fs=SR, output="sos")
        click = signal.sosfilt(sos_click, click_noise) * 1.4
        # Polished brass resonant chime harmonics
        brass_1 = np.sin(2 * np.pi * 1680 * t_hit) * np.exp(-t_hit * 32) * 0.85
        brass_2 = np.sin(2 * np.pi * 3360 * t_hit) * np.exp(-t_hit * 44) * 0.55
        brass_3 = np.sin(2 * np.pi * 4850 * t_hit) * np.exp(-t_hit * 56) * 0.35

        # Secondary micro-bounce clack (9ms later)
        t_b = t_hit - 0.009
        bounce = np.zeros_like(t_hit)
        b_mask = t_b > 0
        bounce[b_mask] = np.sin(2 * np.pi * 2800 * t_b[b_mask]) * np.exp(-t_b[b_mask] * 75) * 0.45

        detent_hit = thud + click + brass_1 + brass_2 + brass_3 + bounce
        out[t >= t_pre] += detent_hit

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)


def gen_pushbutton_thwack(dur=0.28):
    """
    Frame 360 (12.00s): Red industrial mushroom emergency button thwack + spring bounce.
    - Deep operator palm thwack (82 Hz decaying into 55 Hz)
    - Sharp plastic cap bottom-out crack & internal microswitch trip
    - Heavy conical return spring bounce (1250 Hz ping with 35 Hz tremor) + rebound shudder
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # 1. Primary palm strike + cap bottom-out (t = 0.0)
    thump = np.sin(2 * np.pi * 82 * np.exp(-t * 14) * t) * np.exp(-t * 16) * 1.3
    noise_crack = np.random.uniform(-0.9, 0.9, len(t)) * np.exp(-t * 95)
    sos_c = signal.butter(3, [1400, 5200], btype="bandpass", fs=SR, output="sos")
    crack = signal.sosfilt(sos_c, noise_crack) * 1.2
    trip = np.sin(2 * np.pi * 2450 * t) * np.exp(-t * 70) * 0.8

    out += (thump + crack + trip)

    # 2. Heavy return spring bounce & ring (t = 0.024s)
    t_b1 = t - 0.024
    m_b1 = t_b1 > 0
    if np.any(m_b1):
        dt1 = t_b1[m_b1]
        spring_ping = (
            np.sin(2 * np.pi * 1250 * dt1 + np.sin(2 * np.pi * 35 * dt1) * 0.5)
            * np.exp(-dt1 * 40)
            * 0.75
        )
        spring_click = np.sin(2 * np.pi * 3200 * dt1) * np.exp(-dt1 * 80) * 0.45
        out[m_b1] += (spring_ping + spring_click)

    # 3. Secondary spring shudder (t = 0.052s)
    t_b2 = t - 0.052
    m_b2 = t_b2 > 0
    if np.any(m_b2):
        dt2 = t_b2[m_b2]
        spring_recoil = np.sin(2 * np.pi * 1100 * dt2) * np.exp(-dt2 * 50) * 0.35
        out[m_b2] += spring_recoil

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)


def gen_high_voltage_plug_slam(dur=0.55):
    """
    Frame 560 (18.67s): High-voltage armored cable plug slam + electric arc spark buzz ('ZZZZT!').
    - Heavy armored connector impact: 54 Hz sub-bass drop + socket sleeve ring
    - Multi-pin copper bayonet engagement clicks
    - Full-wave rectified 100 Hz mains buzz + plasma arc spark sizzle (2.2 kHz - 8.5 kHz)
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # 1. Heavy Armored Connector Slam Impact (t = 0.0)
    sub_slam = np.sin(2 * np.pi * 54 * np.exp(-t * 7) * t) * np.exp(-t * 12) * 1.35
    sleeve_thud = np.sin(2 * np.pi * 280 * t) * np.exp(-t * 26) * 0.9
    sleeve_ring = np.sin(2 * np.pi * 840 * t) * np.exp(-t * 40) * 0.6

    # Multi-pin copper bayonet engagement clicks
    dt_p2 = np.maximum(t - 0.008, 0)
    dt_p3 = np.maximum(t - 0.018, 0)
    pins = (
        np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 85) * 0.8
        + np.sin(2 * np.pi * 3800 * dt_p2) * np.exp(-dt_p2 * 90) * (t >= 0.008) * 0.7
        + np.sin(2 * np.pi * 5200 * dt_p3) * np.exp(-dt_p3 * 110) * (t >= 0.018) * 0.9
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
        mains_buzz = (mains_buzz / np.max(np.abs(mains_buzz))) * 0.8

        # Plasma arc spark discharge noise modulated by 100 Hz pulse
        raw_noise = np.random.uniform(-1.0, 1.0, len(t_a_act))
        pulse_mod = (np.abs(np.sin(2 * np.pi * f_hum * t_a_act))) ** 1.8
        sos_arc = signal.butter(4, [2200, 8500], btype="bandpass", fs=SR, output="sos")
        plasma_sizzle = signal.sosfilt(sos_arc, raw_noise) * pulse_mod * 1.6

        # Micro-spark arc discharge snaps
        zap_bursts = np.zeros_like(t_a_act)
        for z_t in [0.01, 0.045, 0.09, 0.14, 0.21]:
            d_z = t_a_act - z_t
            mz = (d_z >= 0) & (d_z < 0.015)
            if np.any(mz):
                zap_bursts[mz] += np.random.uniform(-0.85, 0.85, np.sum(mz)) * np.exp(-d_z[mz] * 200)

        total_arc = (mains_buzz * 0.5 + plasma_sizzle * 1.0 + zap_bursts * 0.85) * env_arc
        out_slice = out[m_arc]
        out_slice[m_dur] += total_arc * 1.45
        out[m_arc] = out_slice

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)


# ==========================================================
# 4. TIER 2 ($100 PISTON GENERATOR: CHUG & BLOWOUT)
# ==========================================================

def gen_single_piston_thud(dur=0.22, freq=95):
    """Single low-frequency reciprocating piston impact + bore sleeve scrape."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Low piston punch (95 Hz)
    thud = np.sin(2 * np.pi * freq * np.exp(-t * 8) * t) * np.exp(-t * 18) * 1.15
    # Cylinder bore scrape
    noise = np.random.uniform(-0.4, 0.4, n_pts) * np.exp(-t * 22)
    sos = signal.butter(3, [700, 2400], btype="bandpass", fs=SR, output="sos")
    scrape = signal.sosfilt(sos, noise) * 0.65
    # High wrist-pin metallic ping
    ping = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 45) * 0.35
    
    return (thud + scrape + ping).astype(np.float32)


def gen_exhaust_putt(dur=0.18):
    """Subtle exhaust puff on engine stroke: hollow low-passed pop."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Low hollow gas expansion pop
    pop = np.sin(2 * np.pi * 180 * np.exp(-t * 12) * t) * np.exp(-t * 24) * 0.75
    # Exhaust gas rush noise
    noise = np.random.uniform(-0.45, 0.45, n_pts)
    sos = signal.butter(2, [250, 950], btype="bandpass", fs=SR, output="sos")
    puff = signal.sosfilt(sos, noise) * np.exp(-t * 28) * 0.65
    
    return (pop + puff).astype(np.float32)


def gen_flywheel_shear_crack(dur=0.35):
    """Frame 300 (10.00s): Flywheel shear crack under excess torque."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Sharp fracture crack
    snap = np.random.uniform(-0.95, 0.95, n_pts) * np.exp(-t * 80)
    sos = signal.butter(4, [800, 5600], btype="bandpass", fs=SR, output="sos")
    crack = signal.sosfilt(sos, snap) * 1.35
    thud = np.sin(2 * np.pi * 120 * t) * np.exp(-t * 20) * 1.05
    ring = np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 48) * 0.6
    
    return (crack + thud + ring).astype(np.float32)


def gen_flywheel_roll_rumble(dur=0.85):
    """Sheared heavy flywheel rolling and shuddering across the floor."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Rolling frequency slowing down from 58 Hz to 28 Hz
    freq = np.linspace(58, 28, n_pts)
    rumble = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 2.6) * 0.85
    wobble = np.sin(2 * np.pi * 18 * t) * np.sin(2 * np.pi * 95 * t) * np.exp(-t * 3.0) * 0.45
    metal_grind = (
        signal.sosfilt(
            signal.butter(3, [400, 1800], btype="bandpass", fs=SR, output="sos"),
            np.random.uniform(-0.4, 0.4, n_pts),
        )
        * np.exp(-t * 2.8)
    )
    return (rumble + wobble + metal_grind).astype(np.float32)


def gen_exhaust_backfire(dur=0.45):
    """Overload exhaust backfire pop: explosive combustion bang."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Explosive shockwave
    boom = np.sin(2 * np.pi * 65 * np.exp(-t * 6) * t) * np.exp(-t * 10) * 1.25
    crack_noise = np.random.uniform(-0.95, 0.95, n_pts) * np.exp(-t * 70)
    sos = signal.butter(3, [900, 4500], btype="bandpass", fs=SR, output="sos")
    crack = signal.sosfilt(sos, crack_noise) * 1.15
    tailpipe_reverb = np.sin(2 * np.pi * 380 * t) * np.exp(-t * 18) * 0.4
    
    return (boom + crack + tailpipe_reverb).astype(np.float32)


# ==========================================================
# 5. TIER 3 ($1 000 TURBO GENERATOR: WHINE & BLOWOUT)
# ==========================================================

def gen_skid_base_drop(dur=0.32):
    """Frame 312 (10.40s): Skid base drop impact."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    thud = np.sin(2 * np.pi * 88 * np.exp(-t * 7) * t) * np.exp(-t * 15) * 1.1
    chime1 = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 25) * 0.4
    chime2 = np.sin(2 * np.pi * 980 * t) * np.exp(-t * 35) * 0.25
    cushion = signal.sosfilt(
        signal.butter(2, [300, 1200], btype="bandpass", fs=SR, output="sos"),
        np.random.uniform(-0.35, 0.35, n_pts)
    ) * np.exp(-t * 30)
    return (thud + chime1 + chime2 + cushion).astype(np.float32)


def gen_turbo_generator_running(dur=4.4):
    """
    Turbine running (12.1–16.5s):
    - Accelerating high-RPM turbine whine (450 Hz -> 1400 Hz) with blade-pass harmonics (2x, 3x)
    - Deep alternator hum (120 Hz fundamental + 240 Hz octave)
    - Aerodynamic air suction whoosh
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. Accelerating high-RPM turbine whine (450 Hz -> 1400 Hz)
    # Quadratic ramp for natural centrifugal acceleration
    t_norm = t / dur
    freq_whine = 450.0 + (1400.0 - 450.0) * (t_norm ** 1.35)
    phase_whine = 2 * np.pi * np.cumsum(freq_whine) / SR
    
    # Fundamental + 2x and 3x blade harmonics
    amp_ramp = np.linspace(0.18, 0.48, n_pts)
    blade_1 = np.sin(phase_whine) * amp_ramp
    blade_2 = np.sin(phase_whine * 2.0) * amp_ramp * 0.45
    blade_3 = np.sin(phase_whine * 3.0) * amp_ramp * 0.22
    turbine_whine = blade_1 + blade_2 + blade_3
    
    # 2. Deep alternator hum (120 Hz fundamental + 240 Hz)
    alt_120 = np.sin(2 * np.pi * 120 * t) * 0.42
    alt_240 = np.sin(2 * np.pi * 240 * t) * 0.22
    alt_hum = alt_120 + alt_240
    
    # 3. Aerodynamic air intake rush / whoosh
    noise = np.random.uniform(-0.4, 0.4, n_pts)
    sos_whoosh = signal.butter(3, [1200, 4800], btype="bandpass", fs=SR, output="sos")
    whoosh = signal.sosfilt(sos_whoosh, noise) * np.linspace(0.15, 0.42, n_pts)
    
    left = (turbine_whine * 0.85 + alt_hum * 0.65 + whoosh * 0.6).astype(np.float32)
    right = (turbine_whine * 0.75 + alt_hum * 0.7 + whoosh * 0.65).astype(np.float32)
    return left, right


def gen_steam_blowout_purge(dur=1.2):
    """
    Frame 495 (16.50s): Overload 150-bar blowout valve explosive pop
    + continuous rushing high-pressure steam hiss.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. 150-bar explosive valve pop (t = 0.0)
    low_detonation = np.sin(2 * np.pi * 65 * np.exp(-t * 6) * t) * np.exp(-t * 9) * 1.35
    valve_crack_noise = np.random.uniform(-0.95, 0.95, n_pts) * np.exp(-t * 85)
    sos_v = signal.butter(3, [1100, 6500], btype="bandpass", fs=SR, output="sos")
    valve_crack = signal.sosfilt(sos_v, valve_crack_noise) * 1.3
    valve_ping = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 35) * 0.55
    
    # 2. Continuous rushing high-pressure steam hiss
    # Intense turbulent release decaying smoothly over 1.2s
    noise_steam = np.random.uniform(-0.95, 0.95, n_pts)
    sos_steam = signal.butter(3, [850, 9200], btype="bandpass", fs=SR, output="sos")
    # Envelope: sudden spike then sustained rushing hiss with exponential decay
    env_steam = (np.sin(np.pi * np.clip(t / 0.15, 0, 1) * 0.5) ** 0.8) * np.exp(-t * 2.2)
    turbulent_mod = 1.0 + 0.25 * np.sin(2 * np.pi * 14 * t)
    steam_hiss = signal.sosfilt(sos_steam, noise_steam) * env_steam * turbulent_mod * 1.25
    
    out = low_detonation + valve_crack + valve_ping + steam_hiss
    return out.astype(np.float32)


# ==========================================================
# 6. TIER 4 ($100 000 TOKAMAK REACTOR & COIN CASCADE)
# ==========================================================

def gen_titanium_docking_thud(dur=0.38):
    """
    Frame 508 (16.93s): Titanium torus base docking thud.
    Deep 48-55 Hz mass seating + titanium high chime harmonics (1150 Hz, 2400 Hz).
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    sub = np.sin(2 * np.pi * 50 * np.exp(-t * 5) * t) * np.exp(-t * 11) * 1.3
    thud_mid = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 25) * 0.75
    ti_ring1 = np.sin(2 * np.pi * 1150 * t) * np.exp(-t * 30) * 0.55
    ti_ring2 = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 45) * 0.35
    click = np.random.uniform(-0.6, 0.6, n_pts) * np.exp(-t * 90)
    sos = signal.butter(3, [1500, 5500], btype="bandpass", fs=SR, output="sos")
    transient = signal.sosfilt(sos, click) * 0.7
    
    return (sub + thud_mid + ti_ring1 + ti_ring2 + transient).astype(np.float32)


def gen_fusion_climax_hum(dur=5.3):
    """
    Fusion Climax (18.7–24.0s):
    - Deep sub-bass plasma vortex hum (45 Hz) with slow swirling LFO modulation
    - Crystal overtone shimmer: quartz containment harmonics (1780 Hz, 2670 Hz, 3560 Hz, 5340 Hz)
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. Deep sub-bass plasma vortex hum (45 Hz)
    sub_45 = np.sin(2 * np.pi * 45 * t) * 0.75
    sub_90 = np.sin(2 * np.pi * 90 * t) * 0.35
    # Swirling LFO (0.35 Hz) for vortex spatial rotation
    lfo_l = 0.5 + 0.35 * np.sin(2 * np.pi * 0.35 * t)
    lfo_r = 0.5 + 0.35 * np.cos(2 * np.pi * 0.35 * t)
    
    # 2. Crystal overtone shimmer (quartz mantle resonance)
    # Shimmering high harmonics with 4.5 Hz tremolo
    tremolo = 0.85 + 0.15 * np.sin(2 * np.pi * 4.5 * t)
    c1 = np.sin(2 * np.pi * 1780 * t) * 0.22
    c2 = np.sin(2 * np.pi * 2670 * t) * 0.18
    c3 = np.sin(2 * np.pi * 3560 * t) * 0.12
    c4 = np.sin(2 * np.pi * 5340 * t) * 0.08
    shimmer = (c1 + c2 + c3 + c4) * tremolo * np.linspace(0.4, 1.0, n_pts)
    
    # 3. High-energy plasma containment riser
    riser_freq = np.linspace(800, 3200, n_pts)
    phase_riser = 2 * np.pi * np.cumsum(riser_freq) / SR
    riser = np.sin(phase_riser) * np.linspace(0.08, 0.35, n_pts)
    
    left = (sub_45 * lfo_l + sub_90 * 0.7 + shimmer * 0.85 + riser * 0.5).astype(np.float32)
    right = (sub_45 * lfo_r + sub_90 * 0.7 + shimmer * 0.85 + riser * 0.5).astype(np.float32)
    return left, right


def gen_coin_cascade(dur=5.0, count=235):
    """
    Climax Coin Cascade (19.0s - 24.0s, frames 570 - 720):
    220+ metal coin cascade clinks climbing in density and volume towards climax.
    """
    n_pts = int(SR * dur)
    left = np.zeros(n_pts, dtype=np.float32)
    right = np.zeros(n_pts, dtype=np.float32)
    np.random.seed(777)
    
    for i in range(count):
        # Non-linear time distribution: density accelerates towards the end
        # Using power distribution so later seconds have high coin density
        u = np.random.uniform(0.0, 1.0)
        t_start = (u ** 1.85) * (dur - 0.16)
        
        freq = np.random.uniform(3400, 7600)
        dur_clink = np.random.uniform(0.08, 0.16)
        n_c = int(SR * dur_clink)
        t_c = np.linspace(0, dur_clink, n_c, False)
        
        # Dual-harmonic bright metallic chime + strike transient
        tone = np.sin(2 * np.pi * freq * t_c) * np.exp(-t_c * 36)
        harm = np.sin(2 * np.pi * (freq * 1.58) * t_c) * np.exp(-t_c * 50) * 0.5
        transient = np.random.uniform(-0.35, 0.35, n_c) * np.exp(-t_c * 115)
        clink = tone + harm + transient
        
        # Volume climbs as time approaches climax
        progress = t_start / dur
        vol = np.random.uniform(0.35, 0.6) + progress * 0.45
        pan = np.random.uniform(0.08, 0.92)
        
        idx0 = int(t_start * SR)
        idx1 = min(idx0 + n_c, n_pts)
        cl_len = idx1 - idx0
        if cl_len > 0:
            left[idx0:idx1] += clink[:cl_len] * vol * (1.0 - pan)
            right[idx0:idx1] += clink[:cl_len] * vol * pan
            
    return left, right


# ==========================================================
# 7. MASTER SYNCHRONIZATION AND ASSEMBLY (720 FRAMES @ 30 FPS)
# ==========================================================

def assemble_master_score():
    print("=" * 70)
    print("PRO PROCEDURAL ASMR GENERATOR: GeneratorProgression")
    print(f"Target: {DURATION:.1f}s ({int(DURATION * FPS)} frames @ {FPS} FPS, {SR} Hz Stereo)")
    print("=" * 70)
    
    # ----------------------------------------------------
    # Tier 1 ($10 Dynamo, 0–4.0s, frames 0 - 120)
    # ----------------------------------------------------
    print("\n[Tier 1] $10 Dynamo (0.0s - 4.0s, frames 0 - 120):")
    # Hand crank squeak & friction at frames 15, 45, 75
    for f_crank, intens in [(15, 0.85), (45, 1.05), (75, 1.25)]:
        t_c = frame_to_sec(f_crank)
        print(f"  - Frame {f_crank:3d} ({t_c:.3f}s): Hand crank squeak & friction (effort {intens:.2f})")
        crank = gen_crank_turn(dur=0.55, intensity=intens)
        add_audio(t_c, crank * 0.9, crank * 0.85)

    # Low electrical hum & filament buzz (frames 15 to 114)
    t_hum_start = frame_to_sec(15)
    t_hum_dur = frame_to_sec(115) - t_hum_start
    print(f"  - Frames 15-114 ({t_hum_start:.3f}s - {frame_to_sec(115):.3f}s): Low electrical hum & filament buzz")
    hum_l, hum_r = gen_dynamo_filament_hum(dur=t_hum_dur)
    add_audio(t_hum_start, hum_l * 0.75, hum_r * 0.75)

    # Frame 115 (3.83s): Snapping handle crack + filament pop & glass shatter clatter
    t_f115 = frame_to_sec(115)
    print(f"  - Frame 115 ({t_f115:.3f}s): Snapping handle crack + filament pop & glass shatter clatter")
    blow_l, blow_r = gen_dynamo_blowout(dur=0.85)
    add_audio(t_f115, blow_l * 1.35, blow_r * 1.35)

    # ----------------------------------------------------
    # Tier 2 ($100 Piston Generator, 4.1–10.0s, frames 121 - 300)
    # ----------------------------------------------------
    print("\n[Tier 2] $100 Piston Generator (4.1s - 10.0s, frames 121 - 300):")
    
    # Frame 128 (4.27s): Cast-iron bed drop thud (72 Hz)
    t_f128 = frame_to_sec(128)
    print(f"  - Frame 128 ({t_f128:.3f}s): Cast-iron bed drop thud (72 Hz)")
    bed_thud = gen_cast_iron_drop(dur=0.35, freq=72)
    add_audio(t_f128, bed_thud * 1.25, bed_thud * 1.2)

    # Approach slide before docking clamp
    slide1 = gen_precision_slide(dur=0.22)
    add_audio(frame_to_sec(129), slide1 * 0.65, slide1 * 0.5)

    # Frame 133 (4.43s): Twin module snap-clamp ('TS-TS!')
    t_f133 = frame_to_sec(133)
    print(f"  - Frame 133 ({t_f133:.3f}s): Twin module snap-clamp ('TS-TS!')")
    snap_twin = gen_magnetic_snap(dur=0.12, clicks=2, freq_base=820, metallic_gain=1.2)
    clamp_twin = gen_docking_clamp(dur=0.18)
    add_audio(t_f133, snap_twin * 1.3, snap_twin * 1.3)
    add_audio(t_f133, clamp_twin * 0.75, clamp_twin * 0.75)

    # Frame 180 (6.00s): Heavy polished brass throw-lever switch clack
    t_f180 = frame_to_sec(180)
    print(f"  - Frame 180 ({t_f180:.3f}s): Heavy polished brass throw-lever switch clack")
    lever = gen_brass_lever_throw(dur=0.28)
    add_audio(t_f180, lever * 1.45, lever * 1.45)

    # Engine running (6.1–10.0s, frames 183 - 299):
    # Rhythmic low-frequency piston thuds ('chug-chug-chug' at ~4 Hz) with subtle exhaust putts
    t_eng_start = frame_to_sec(183)
    t_eng_end = frame_to_sec(300)
    print(f"  - Engine running ({t_eng_start:.3f}s - {t_eng_end:.3f}s, frames 183-300): Piston thuds (~4 Hz) + exhaust putts")
    
    # Flywheel rotation background hum & exhaust rumble
    dur_eng = t_eng_end - t_eng_start
    t_stream = np.linspace(0, dur_eng, int(SR * dur_eng), False)
    eng_hum = np.sin(2 * np.pi * 65 * t_stream) * 0.28 + np.sin(2 * np.pi * 130 * t_stream) * 0.16
    add_audio(t_eng_start, eng_hum * 0.85, eng_hum * 0.85)

    # Rhythmic strokes every 0.245s (~4.08 Hz)
    piston_times = np.arange(t_eng_start, t_eng_end - 0.1, 0.245)
    for idx_p, t_p in enumerate(piston_times):
        p_thud = gen_single_piston_thud(dur=0.22, freq=95 if idx_p % 2 == 0 else 105)
        p_putt = gen_exhaust_putt(dur=0.18)
        pan = 0.58 if idx_p % 2 == 0 else 0.42
        add_audio(t_p, p_thud * pan * 0.85, p_thud * (1.0 - pan) * 0.85)
        add_audio(t_p + 0.045, p_putt * 0.55, p_putt * 0.55)

    # Frame 300 (10.00s): Torque blowout: flywheel shear crack + rattling heavy metallic roll + exhaust backfire pop
    t_f300 = frame_to_sec(300)
    print(f"  - Frame 300 ({t_f300:.3f}s): Torque blowout: flywheel shear crack + metallic roll + backfire")
    shear_crack = gen_flywheel_shear_crack(dur=0.35)
    add_audio(t_f300, shear_crack * 1.35, shear_crack * 1.35)

    backfire = gen_exhaust_backfire(dur=0.45)
    add_audio(t_f300 + 0.015, backfire * 1.25, backfire * 1.25)

    fw_roll = gen_flywheel_roll_rumble(dur=0.85)
    add_audio(t_f300 + 0.06, fw_roll * 1.1, fw_roll * 0.85)

    # ----------------------------------------------------
    # Tier 3 ($1 000 Turbo Generator, 10.1–16.5s, frames 301 - 495)
    # ----------------------------------------------------
    print("\n[Tier 3] $1 000 Turbo Generator (10.1s - 16.5s, frames 301 - 495):")
    
    # Frame 312 (10.40s): Skid base drop
    t_f312 = frame_to_sec(312)
    print(f"  - Frame 312 ({t_f312:.3f}s): Skid base drop")
    skid = gen_skid_base_drop(dur=0.32)
    add_audio(t_f312, skid * 1.2, skid * 1.15)

    # Frame 316 (10.53s): High-velocity turbine stator snap-lock ('TS-TS-TS!')
    t_f316 = frame_to_sec(316)
    print(f"  - Frame 316 ({t_f316:.3f}s): High-velocity turbine stator snap-lock ('TS-TS-TS!')")
    snap_turbo = gen_magnetic_snap(dur=0.12, clicks=3, freq_base=800, metallic_gain=1.35)
    clamp_turbo = gen_docking_clamp(dur=0.20)
    add_audio(t_f316, snap_turbo * 1.4, snap_turbo * 1.4)
    add_audio(t_f316, clamp_turbo * 0.85, clamp_turbo * 0.85)

    # Frame 360 (12.00s): Red industrial mushroom button palm thwack with spring bounce
    t_f360 = frame_to_sec(360)
    print(f"  - Frame 360 ({t_f360:.3f}s): Red industrial mushroom button palm thwack with spring bounce")
    btn = gen_pushbutton_thwack(dur=0.28)
    add_audio(t_f360, btn * 1.5, btn * 1.5)

    # Turbine running (12.1–16.5s, frames 363–495):
    # Accelerating high-RPM turbine whine (450 Hz -> 1400 Hz) + deep alternator hum (120 Hz)
    t_turb_start = frame_to_sec(363)
    t_turb_end = frame_to_sec(495)
    dur_turb = t_turb_end - t_turb_start
    print(f"  - Turbine running ({t_turb_start:.3f}s - {t_turb_end:.3f}s): Accelerating whine (450Hz->1400Hz) + alternator hum (120Hz)")
    turb_l, turb_r = gen_turbo_generator_running(dur=dur_turb)
    add_audio(t_turb_start, turb_l * 1.15, turb_r * 1.15)

    # Frame 495 (16.50s): Overload 150-bar blowout valve explosive pop + continuous rushing high-pressure steam hiss
    t_f495 = frame_to_sec(495)
    print(f"  - Frame 495 ({t_f495:.3f}s): Overload 150-bar blowout valve explosive pop + rushing steam hiss")
    steam_blowout = gen_steam_blowout_purge(dur=1.2)
    add_audio(t_f495, steam_blowout * 1.45, steam_blowout * 1.45)

    # ----------------------------------------------------
    # Tier 4 ($100 000 Tokamak Quantum Reactor, 16.6–24.0s, frames 496 - 720)
    # ----------------------------------------------------
    print("\n[Tier 4] $100 000 Tokamak Quantum Reactor (16.6s - 24.0s, frames 496 - 720):")
    
    # Frame 508 (16.93s): Titanium torus base docking thud
    t_f508 = frame_to_sec(508)
    print(f"  - Frame 508 ({t_f508:.3f}s): Titanium torus base docking thud")
    ti_thud = gen_titanium_docking_thud(dur=0.38)
    add_audio(t_f508, ti_thud * 1.35, ti_thud * 1.35)

    # Frame 514 (17.13s): Quartz mantle & magnetic coils snap-clamp ('TS-TS-TS!')
    t_f514 = frame_to_sec(514)
    print(f"  - Frame 514 ({t_f514:.3f}s): Quartz mantle & magnetic coils snap-clamp ('TS-TS-TS!')")
    snap_tokamak = gen_magnetic_snap(dur=0.12, clicks=3, freq_base=860, metallic_gain=1.45)
    clamp_tokamak = gen_docking_clamp(dur=0.22)
    add_audio(t_f514, snap_tokamak * 1.45, snap_tokamak * 1.45)
    add_audio(t_f514, clamp_tokamak * 0.9, clamp_tokamak * 0.9)

    # Frame 560 (18.67s): Armored power cable plug slam + 100 Hz mains hum harmonics + chaotic electric arc spark discharge ('ZZZZT!')
    t_f560 = frame_to_sec(560)
    print(f"  - Frame 560 ({t_f560:.3f}s): Armored power cable plug slam + 100 Hz mains buzz + spark discharge ('ZZZZT!')")
    plug_slam = gen_high_voltage_plug_slam(dur=0.55)
    add_audio(t_f560, plug_slam * 1.55, plug_slam * 1.55)

    # Fusion Climax (18.7–24.0s, frames 561–720):
    # Deep sub-bass plasma vortex hum (45 Hz) + crystal overtone shimmer
    t_fusion_start = frame_to_sec(561)
    dur_fusion = DURATION - t_fusion_start
    print(f"  - Fusion Climax ({t_fusion_start:.3f}s - {DURATION:.3f}s): Deep sub-bass plasma vortex (45 Hz) + crystal shimmer")
    fus_l, fus_r = gen_fusion_climax_hum(dur=dur_fusion)
    add_audio(t_fusion_start, fus_l * 1.1, fus_r * 1.1)

    # 220+ metal coin cascade clinks climbing in density and volume (19.0s - 24.0s)
    t_coins_start = frame_to_sec(570)
    dur_coins = DURATION - t_coins_start
    print(f"  - Climax Cascade ({t_coins_start:.3f}s - {DURATION:.3f}s): 235 resonant metal coin clinks cascading")
    coins_l, coins_r = gen_coin_cascade(dur=dur_coins, count=235)
    add_audio(t_coins_start, coins_l * 1.05, coins_r * 1.05)


def master_and_export():
    assemble_master_score()

    # Peak normalization to exactly -1.0 dBFS (amplitude = 10^(-1.0 / 20) ≈ 0.89125)
    target_peak = 10.0 ** (-1.0 / 20.0)  # ~0.8912509
    current_max = np.max(np.abs(stereo))
    print("\n" + "=" * 70)
    print(f"Pre-normalized peak amplitude: {current_max:.4f}")

    if current_max > 0:
        norm_factor = target_peak / current_max
        stereo_master = stereo * norm_factor
    else:
        stereo_master = stereo

    final_peak = np.max(np.abs(stereo_master))
    final_peak_db = 20.0 * np.log10(final_peak)

    # Convert to 16-bit PCM WAV
    int16_data = np.clip(stereo_master * 32767.0, -32768, 32767).astype(np.int16)

    out_wav = os.path.abspath("remotion_studio/public/audio/asmr_generator_progression.wav")
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    wavfile.write(out_wav, SR, int16_data.T)

    actual_samples = stereo_master.shape[1]
    actual_dur = actual_samples / float(SR)
    actual_frames = actual_dur * FPS

    print(f"Master ASMR track written to: {out_wav}")
    print(f"Track Duration: {actual_dur:.4f}s ({actual_samples} samples, {actual_frames:.1f} frames @ {FPS} FPS)")
    print(f"Audio Format: {SR} Hz Stereo 16-bit PCM WAV")
    print(f"Final Peak Amplitude: {final_peak:.5f} ({final_peak_db:.2f} dBFS)")
    print("=" * 70)

    return out_wav, actual_dur, final_peak, final_peak_db


if __name__ == "__main__":
    master_and_export()
