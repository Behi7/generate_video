#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer: DrillProgression
Generates a 38.6667-second 44.1kHz Stereo Master Track for 'DrillProgression'
Tailored for 30 FPS timing (1160 frames, 1,705,200 samples).

Strictly follows The Pure ASMR Law:
1. Zero AI Voiceover.
2. Rich tactile mechanical ASMR synthesized to exactly 1160 frames (38.6667s @ 30 FPS, 44.1 kHz stereo WAV).
3. Synchronized audio events across 4 distinct Progression Tiers:
   - Tier 1 ($10 Manual Auger, 0..289f): Vise thud (0f), spiral drop (25f), handle snap (50f),
     squeaky crank turns with dry stone rubbing friction and crumble plinks, steady rhythmic boring
     with grit cascade, sudden stone jam (255f), fracture crack of steel spiral (265f), handle clatter.
   - Tier 2 ($100 Gas Motor Drill, 290..579f): Sled frame drop (290f), 2-stroke engine snap (310f),
     gearbox snap (330f), bit lock (350f), clutch lever clack (370f), compression cough & exhaust puff (390f),
     chain spool-up rattle (410f), aggressive carbide teeth chewing stone with low motor vibration
     and high-speed chain clatter, torque jam (545f), shear pin snap (555f), chain whip/clatter & backfire.
   - Tier 3 ($1 000 Diamond Core Drill, 580..869f): Column base drop (580f), motor dock (600f),
     manifold snap (620f), diamond barrel lock (640f), mushroom button thwack (660f), water valve hiss (680f),
     accelerating 3000 RPM whine (700f), clean wet diamond grinding friction, slurry gurgle, core barrel resonance,
     water hammer pop (835f), hose coupling blowout & explosive rushing spray hiss (845f).
   - Tier 4 ($100 000+ Plasma Tunnel Shield, 870..1159f): Titanium casing dock (870f), rotary laser lock (895f),
     cryo conduit clamps (920f), armored cable plug slam + 100 Hz mains hum & electric arc 'ZZZZT!' (950f),
     magnetic coil charging wave & 4 laser emitter hums, hypersonic rotary plasma whine, crystalline vaporization
     sizzle, beam resonance, and massive 250+ coin cascade clinking surge climbing exponentially to +$1 480 000
     with deep resonant sub-bass climax chord.
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
# 1. CORE TRANSIENT IMPACTS & MAGNETIC DOCKING GENERATORS
# ==========================================================

def gen_magnetic_snap(dur=0.12, clicks=3, freq_base=820, metallic_gain=1.0):
    """
    Rapid transient metallic snap ('TS-TS-TS!') on module docking impacts.
    - High resonant frequencies (3.5 kHz - 7.2 kHz)
    - Punchy mid clamp (820 Hz)
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

        # High resonant metallic pings (3.6 kHz - 6.8 kHz)
        ring_3k6 = np.sin(2 * np.pi * 3650 * dt) * np.exp(-dt * 95)
        ring_5k2 = np.sin(2 * np.pi * 5200 * dt) * np.exp(-dt * 125) * 0.75
        ring_6k8 = np.sin(2 * np.pi * 6850 * dt) * np.exp(-dt * 155) * 0.55
        metallic_snap = (ring_3k6 + ring_5k2 + ring_6k8) * 0.65 * metallic_gain

        # Punchy mid clamp
        mid_clamp = (
            np.sin(2 * np.pi * freq_base * np.exp(-dt * 18) * dt)
            * np.exp(-dt * 48)
            * 0.95
        )

        # Ultra-crisp transient burst noise ('TS!')
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


def gen_docking_clamp(dur=0.22):
    """Mechanical clamp locking thud."""
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    thud = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 24)
    clack = np.sin(2 * np.pi * 1450 * t) * np.exp(-t * 55) * 0.65
    pneum = np.random.uniform(-0.35, 0.35, n_pts) * np.exp(-t * 32)
    return (thud + clack + pneum).astype(np.float32)


# ==========================================================
# 2. ON-MACHINE PHYSICAL TRIGGERS
# ==========================================================

def gen_brass_lever_throw(dur=0.28):
    """
    Heavy polished brass throw-lever switch clack.
    - Pre-throw pivot slide friction (0 to 32ms)
    - Heavy detent latch impact with low cast brass mass (135 Hz)
    - Polished brass resonant chime harmonics (1680 Hz, 3360 Hz, 4850 Hz)
    - Secondary micro-bounce clack 9ms later
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    # 1. Pre-throw pivot slide friction
    t_pre = 0.032
    swish_t = t[t < t_pre]
    if len(swish_t) > 0:
        noise = np.random.uniform(-0.35, 0.35, len(swish_t))
        sos_swish = signal.butter(2, [1100, 4200], btype="bandpass", fs=SR, output="sos")
        swish = signal.sosfilt(sos_swish, noise) * np.sin(np.pi * swish_t / t_pre)
        out[:len(swish_t)] += swish * 0.45

    # 2. Heavy Detent Clack
    t_hit = t[t >= t_pre] - t_pre
    if len(t_hit) > 0:
        thud = np.sin(2 * np.pi * 135 * np.exp(-t_hit * 12) * t_hit) * np.exp(-t_hit * 22) * 1.2
        click_noise = np.random.uniform(-0.9, 0.9, len(t_hit)) * np.exp(-t_hit * 95)
        sos_click = signal.butter(3, [1800, 6200], btype="bandpass", fs=SR, output="sos")
        click = signal.sosfilt(sos_click, click_noise) * 1.4
        brass_1 = np.sin(2 * np.pi * 1680 * t_hit) * np.exp(-t_hit * 32) * 0.85
        brass_2 = np.sin(2 * np.pi * 3360 * t_hit) * np.exp(-t_hit * 44) * 0.55
        brass_3 = np.sin(2 * np.pi * 4850 * t_hit) * np.exp(-t_hit * 56) * 0.35

        t_b = t_hit - 0.009
        bounce = np.zeros_like(t_hit)
        b_mask = t_b > 0
        bounce[b_mask] = np.sin(2 * np.pi * 2800 * t_b[b_mask]) * np.exp(-t_b[b_mask] * 75) * 0.45

        out[t >= t_pre] += thud + click + brass_1 + brass_2 + brass_3 + bounce

    peak = np.max(np.abs(out))
    if peak > 0:
        out = out / peak
    return out.astype(np.float32)


def gen_pushbutton_thwack(dur=0.28):
    """
    Red industrial mushroom emergency button thwack + spring bounce.
    - Deep operator palm thwack (82 Hz decaying into 55 Hz)
    - Sharp plastic cap bottom-out crack & internal microswitch trip
    - Heavy conical return spring bounce (1250 Hz ping with 35 Hz tremor) + rebound shudder
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    thump = np.sin(2 * np.pi * 82 * np.exp(-t * 14) * t) * np.exp(-t * 16) * 1.3
    noise_crack = np.random.uniform(-0.9, 0.9, len(t)) * np.exp(-t * 95)
    sos_c = signal.butter(3, [1400, 5200], btype="bandpass", fs=SR, output="sos")
    crack = signal.sosfilt(sos_c, noise_crack) * 1.2
    trip = np.sin(2 * np.pi * 2450 * t) * np.exp(-t * 70) * 0.8
    out += thump + crack + trip

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
        out[m_b1] += spring_ping + spring_click

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


def gen_armored_cable_plug_slam(dur=0.55):
    """
    High-voltage armored cable plug slam + electric arc spark buzz ('ZZZZT!').
    - Heavy armored connector impact: 54 Hz sub-bass drop + socket sleeve ring
    - Multi-pin copper bayonet engagement clicks
    - Full-wave rectified 100 Hz mains buzz + plasma arc spark sizzle (2.2 kHz - 8.5 kHz)
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    out = np.zeros(n_pts, dtype=np.float32)

    sub_slam = np.sin(2 * np.pi * 54 * np.exp(-t * 7) * t) * np.exp(-t * 12) * 1.35
    sleeve_thud = np.sin(2 * np.pi * 280 * t) * np.exp(-t * 26) * 0.9
    sleeve_ring = np.sin(2 * np.pi * 840 * t) * np.exp(-t * 40) * 0.6

    dt_p2 = np.maximum(t - 0.008, 0)
    dt_p3 = np.maximum(t - 0.018, 0)
    pins = (
        np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 85) * 0.8
        + np.sin(2 * np.pi * 3800 * dt_p2) * np.exp(-dt_p2 * 90) * (t >= 0.008) * 0.7
        + np.sin(2 * np.pi * 5200 * dt_p3) * np.exp(-dt_p3 * 110) * (t >= 0.018) * 0.9
    )
    out += sub_slam + sleeve_thud + sleeve_ring + pins

    t_arc = t - 0.018
    m_arc = t_arc > 0
    if np.any(m_arc):
        t_a = t_arc[m_arc]
        dur_arc = 0.38
        m_dur = t_a < dur_arc
        t_a_act = t_a[m_dur]

        env_arc = np.exp(-t_a_act * 7.5) * (1.0 + 0.3 * np.sin(2 * np.pi * 28 * t_a_act))

        f_hum = 100.0
        mains_buzz = np.zeros_like(t_a_act)
        for h in range(1, 14):
            amp = 1.0 / (h ** 0.85)
            mains_buzz += np.sin(2 * np.pi * f_hum * h * t_a_act + h * 0.4) * amp
        mains_buzz = (mains_buzz / np.max(np.abs(mains_buzz))) * 0.8

        raw_noise = np.random.uniform(-1.0, 1.0, len(t_a_act))
        pulse_mod = (np.abs(np.sin(2 * np.pi * f_hum * t_a_act))) ** 1.8
        sos_arc = signal.butter(4, [2200, 8500], btype="bandpass", fs=SR, output="sos")
        plasma_sizzle = signal.sosfilt(sos_arc, raw_noise) * pulse_mod * 1.6

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
# 3. TIER 1 ($10 MANUAL AUGER: 0..289f / 0..9.67s)
# ==========================================================

def gen_vise_clamp_thud(dur=0.45):
    """
    Frame 0 (0.00s): Heavy cast iron bench vise clamp thud.
    - Acme lead screw tightening slide friction
    - Solid cast-iron clamp jaw bottom-out thud (68 Hz fundamental + 38 Hz mass sub)
    - Metal-on-metal bed plate contact transient
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Lead screw pre-swish (0 to 60ms)
    t_sw = 0.06
    sw_mask = t < t_sw
    swish = np.zeros(n_pts, dtype=np.float32)
    if np.any(sw_mask):
        n_sw = np.sum(sw_mask)
        sw_noise = np.random.uniform(-0.4, 0.4, n_sw)
        sos_sw = signal.butter(2, [800, 3200], btype="bandpass", fs=SR, output="sos")
        swish[sw_mask] = signal.sosfilt(sos_sw, sw_noise) * np.sin(np.pi * t[sw_mask] / t_sw)
    
    # Impact at t = 0.06s
    t_hit = t - t_sw
    hit_mask = t_hit >= 0
    hit = np.zeros(n_pts, dtype=np.float32)
    if np.any(hit_mask):
        dt = t_hit[hit_mask]
        sub = np.sin(2 * np.pi * 38 * dt) * np.exp(-dt * 12) * 0.85
        thud = np.sin(2 * np.pi * 68 * np.exp(-dt * 6) * dt) * np.exp(-dt * 16) * 1.3
        ring = np.sin(2 * np.pi * 580 * dt) * np.exp(-dt * 32) * 0.45
        click_n = np.random.uniform(-0.8, 0.8, len(dt)) * np.exp(-dt * 90)
        sos_cl = signal.butter(3, [1200, 4800], btype="bandpass", fs=SR, output="sos")
        click = signal.sosfilt(sos_cl, click_n) * 1.1
        hit[hit_mask] = sub + thud + ring + click
    
    out = swish * 0.5 + hit * 1.2
    return out.astype(np.float32)


def gen_auger_spiral_drop(dur=0.35):
    """
    Frame 25 (0.833s): Steel spiral auger dropped into chuck.
    - Helical metal guide friction slide
    - Resonant hollow steel spiral ping (1280 Hz, 2560 Hz, 4100 Hz)
    - Chuck seating click
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Guide slide
    slide_noise = np.random.uniform(-0.35, 0.35, n_pts) * np.exp(-t * 18)
    sos_sl = signal.butter(2, [900, 3800], btype="bandpass", fs=SR, output="sos")
    slide = signal.sosfilt(sos_sl, slide_noise) * 0.6
    
    # Resonant helical flute ring
    ring1 = np.sin(2 * np.pi * 1280 * t) * np.exp(-t * 26) * 0.65
    ring2 = np.sin(2 * np.pi * 2560 * t) * np.exp(-t * 38) * 0.45
    ring3 = np.sin(2 * np.pi * 4100 * t) * np.exp(-t * 55) * 0.3
    
    # Seating click
    click = np.random.uniform(-0.7, 0.7, n_pts) * np.exp(-t * 120) * 0.75
    
    out = slide + ring1 + ring2 + ring3 + click
    return out.astype(np.float32)


def gen_handle_snap(dur=0.18):
    """
    Frame 50 (1.667s): T-handle snapping into chuck collar.
    Dual magnetic detent snap ('TS-TS!') with crisp mechanical latch.
    """
    return gen_magnetic_snap(dur=dur, clicks=2, freq_base=850, metallic_gain=1.1)


def gen_squeaky_crank_turn(dur=0.65, intensity=1.0):
    """
    Individual manual crank revolution: squeaky bronze bushing FM + dry stone rubbing + crumble plinks.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    env = np.sin(np.pi * (t / dur)) ** 1.5
    
    # 1. Bushing friction squeak (FM modulated 750-960 Hz)
    f_mod = np.sin(2 * np.pi * 7.5 * t) * 120.0
    f_carrier = 820.0 + f_mod
    phase_sq = 2 * np.pi * np.cumsum(f_carrier) / SR
    squeak_raw = np.sin(phase_sq) * env
    sos_sq = signal.butter(3, [500, 2000], btype="bandpass", fs=SR, output="sos")
    squeak = signal.sosfilt(sos_sq, squeak_raw) * 0.85
    
    # 2. Dry stone abrasive rubbing friction
    noise = np.random.uniform(-0.55, 0.55, n_pts)
    sos_fric = signal.butter(3, [1200, 4200], btype="bandpass", fs=SR, output="sos")
    rubbing = signal.sosfilt(sos_fric, noise) * env * 0.85
    
    # 3. Crumble plinks (micro stone fracture chips)
    plinks = np.zeros(n_pts, dtype=np.float32)
    for c_t in [0.12, 0.25, 0.38, 0.52]:
        idx = int(c_t * SR)
        if idx < n_pts:
            dur_p = 0.02
            np_p = int(SR * dur_p)
            tp = np.linspace(0, dur_p, np_p, False)
            freq_p = np.random.uniform(2600, 5800)
            plink_hit = np.sin(2 * np.pi * freq_p * tp) * np.exp(-tp * 240)
            plinks[idx:min(idx + np_p, n_pts)] += plink_hit[:min(np_p, n_pts - idx)] * 0.45
            
    # 4. Low rotational torque groan
    thrum = np.sin(2 * np.pi * 125 * t) * env * 0.4
    
    out = (squeak + rubbing + plinks + thrum) * intensity
    return out.astype(np.float32)


def gen_manual_auger_boring(dur=3.8):
    """
    Frames 140..254 (4.67s..8.47s): Steady rhythmic boring ASMR with dry grit cascade.
    - Rhythmic cycle (~1.8 Hz rotational effort)
    - Dry stone crunching / abrasive grating texture
    - Cascading dry mineral grit and crumbs tumbling onto floor
    - Low shaft torque thrum (110 Hz)
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Rhythmic rotation envelope (1.8 Hz)
    rot_env = (0.55 + 0.45 * np.sin(2 * np.pi * 1.8 * t)) ** 1.3
    
    # 1. Intense dry stone crunching / grinding
    noise_stone = np.random.uniform(-0.7, 0.7, n_pts)
    sos_stone = signal.butter(3, [1100, 4600], btype="bandpass", fs=SR, output="sos")
    grinding = signal.sosfilt(sos_stone, noise_stone) * rot_env * 0.95
    
    # 2. Continuous dry grit cascade (shower of micro stone particles)
    # Generated with Poisson-like micro transient pings
    cascade_l = np.zeros(n_pts, dtype=np.float32)
    cascade_r = np.zeros(n_pts, dtype=np.float32)
    np.random.seed(42)
    n_crumbs = int(dur * 65)  # ~65 particle hits per second
    for _ in range(n_crumbs):
        t_c = np.random.uniform(0.05, dur - 0.05)
        idx_c = int(t_c * SR)
        dur_c = np.random.uniform(0.008, 0.025)
        nc = int(SR * dur_c)
        tc = np.linspace(0, dur_c, nc, False)
        fc = np.random.uniform(2200, 6800)
        c_sound = np.sin(2 * np.pi * fc * tc) * np.exp(-tc * np.random.uniform(150, 320))
        pan = np.random.uniform(0.2, 0.8)
        cascade_l[idx_c:min(idx_c + nc, n_pts)] += c_sound[:min(nc, n_pts - idx_c)] * (1.0 - pan) * 0.35
        cascade_r[idx_c:min(idx_c + nc, n_pts)] += c_sound[:min(nc, n_pts - idx_c)] * pan * 0.35
        
    # 3. Bushing squeak micro-texture
    squeak_carrier = 780.0 + np.sin(2 * np.pi * 1.8 * t) * 90.0
    phase_sq = 2 * np.pi * np.cumsum(squeak_carrier) / SR
    squeak = np.sin(phase_sq) * rot_env * 0.3
    
    # 4. Low shaft torque thrum (110 Hz)
    thrum = np.sin(2 * np.pi * 110 * t) * rot_env * 0.4
    
    left = (grinding * 0.85 + cascade_l + squeak * 0.6 + thrum * 0.7).astype(np.float32)
    right = (grinding * 0.85 + cascade_r + squeak * 0.5 + thrum * 0.7).astype(np.float32)
    return left, right


def gen_auger_jam_and_fracture(dur=1.1):
    """
    Frame 255 (8.50s): Sudden stone jam (heavy friction bind, sharp halt thud, torque groan).
    Frame 265 (8.83s): Violent high-frequency fracture crack of steel spiral + handle clatter.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    left = np.zeros(n_pts, dtype=np.float32)
    right = np.zeros(n_pts, dtype=np.float32)
    
    # 1. Stone Jam at t = 0.0s (Frame 255)
    jam_thud = np.sin(2 * np.pi * 95 * np.exp(-t * 14) * t) * np.exp(-t * 22) * 1.2
    jam_screech_noise = np.random.uniform(-0.8, 0.8, n_pts) * np.exp(-t * 30)
    sos_screech = signal.butter(3, [1800, 5200], btype="bandpass", fs=SR, output="sos")
    jam_screech = signal.sosfilt(sos_screech, jam_screech_noise) * 1.1
    strain_groan = np.sin(2 * np.pi * 140 * t) * np.clip((t / 0.1), 0, 1) * np.exp(-t * 8) * 0.65
    
    jam = jam_thud + jam_screech + strain_groan
    left += jam * 0.95
    right += jam * 0.95
    
    # 2. Violent Fracture Crack at t = 0.333s (Frame 265 = 10 frames after jam)
    t_crack = t - 0.333
    m_crack = t_crack >= 0
    if np.any(m_crack):
        dt_c = t_crack[m_crack]
        # Explosive metal snapping crack
        crack_noise = np.random.uniform(-1.0, 1.0, len(dt_c)) * np.exp(-dt_c * 95)
        sos_snap = signal.butter(4, [1600, 7500], btype="bandpass", fs=SR, output="sos")
        sharp_crack = signal.sosfilt(sos_snap, crack_noise) * 1.6
        
        # High-frequency tensile fracture ring (3200 Hz, 5400 Hz)
        ring_3k2 = np.sin(2 * np.pi * 3200 * dt_c) * np.exp(-dt_c * 42) * 0.85
        ring_5k4 = np.sin(2 * np.pi * 5400 * dt_c) * np.exp(-dt_c * 65) * 0.6
        sub_crack = np.sin(2 * np.pi * 150 * dt_c) * np.exp(-dt_c * 28) * 0.9
        
        fracture = sharp_crack + ring_3k2 + ring_5k4 + sub_crack
        left[m_crack] += fracture * 1.2
        right[m_crack] += fracture * 1.2
        
    # 3. Broken Handle Pieces Clattering on Bed (t = 0.45s to 1.05s)
    np.random.seed(265)
    clatter_times = [0.46, 0.54, 0.63, 0.72, 0.81, 0.90, 0.97]
    for idx_cl, t_cl in enumerate(clatter_times):
        idx0 = int(t_cl * SR)
        if idx0 < n_pts:
            dur_cl = np.random.uniform(0.04, 0.08)
            n_cl = int(SR * dur_cl)
            t_c = np.linspace(0, dur_cl, n_cl, False)
            f_cl = np.random.uniform(1600, 3600)
            amp_cl = (0.75 ** idx_cl) * 0.7
            clink = (np.sin(2 * np.pi * f_cl * t_c) + 0.4 * np.sin(2 * np.pi * (f_cl * 1.8) * t_c)) * np.exp(-t_c * 70) * amp_cl
            pan = np.random.uniform(0.25, 0.75)
            left[idx0:min(idx0 + n_cl, n_pts)] += clink[:min(n_cl, n_pts - idx0)] * (1.0 - pan)
            right[idx0:min(idx0 + n_cl, n_pts)] += clink[:min(n_cl, n_pts - idx0)] * pan
            
    return left, right


# ==========================================================
# 4. TIER 2 ($100 GAS MOTOR DRILL: 290..579f / 9.67..19.33s)
# ==========================================================

def gen_tubular_sled_drop(dur=0.42):
    """
    Frame 290 (9.667s): Tubular sled frame drop.
    - Hollow tubular steel frame hitting bed with tubular ring (380 Hz, 820 Hz)
    - Low-frequency mass seating thud (62 Hz)
    - Rubber foot damping impulse
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    sub = np.sin(2 * np.pi * 62 * np.exp(-t * 6) * t) * np.exp(-t * 14) * 1.25
    tube_ring1 = np.sin(2 * np.pi * 380 * t) * np.exp(-t * 22) * 0.65
    tube_ring2 = np.sin(2 * np.pi * 820 * t) * np.exp(-t * 35) * 0.45
    impact_click = np.random.uniform(-0.7, 0.7, n_pts) * np.exp(-t * 85)
    sos_c = signal.butter(3, [1100, 4400], btype="bandpass", fs=SR, output="sos")
    click = signal.sosfilt(sos_c, impact_click) * 0.9
    
    out = sub + tube_ring1 + tube_ring2 + click
    return out.astype(np.float32)


def gen_drill_bit_lock(dur=0.22):
    """
    Frame 350 (11.667s): Heavy carbide auger bit locking into hex drive.
    Hex sleeve insertion friction + spring detent snap ('CLACK!') + carbide blade chime.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Hex sleeve insertion
    fric = signal.sosfilt(
        signal.butter(2, [700, 2600], btype="bandpass", fs=SR, output="sos"),
        np.random.uniform(-0.4, 0.4, n_pts)
    ) * np.exp(-t * 30) * 0.5
    
    # Detent CLACK at t = 0.04s
    t_det = t - 0.04
    m_det = t_det >= 0
    detent = np.zeros(n_pts, dtype=np.float32)
    if np.any(m_det):
        dt = t_det[m_det]
        thud = np.sin(2 * np.pi * 160 * dt) * np.exp(-dt * 35) * 1.1
        click = np.sin(2 * np.pi * 2800 * dt) * np.exp(-dt * 65) * 0.85
        carbide = np.sin(2 * np.pi * 4400 * dt) * np.exp(-dt * 90) * 0.55
        detent[m_det] = thud + click + carbide
        
    out = fric + detent * 1.3
    return out.astype(np.float32)


def gen_twostroke_startup(dur=0.67):
    """
    Frame 390 (13.000s): Engine first compression cough with exhaust puff.
    - Violent 2-stroke compression kickback pop (85 Hz)
    - Combustion cough pop + rich exhaust gas puff
    - Reed valve air flutter
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Compression thump
    thump = np.sin(2 * np.pi * 85 * np.exp(-t * 8) * t) * np.exp(-t * 18) * 1.35
    
    # Combustion pop
    pop_n = np.random.uniform(-0.9, 0.9, n_pts) * np.exp(-t * 45)
    sos_pop = signal.butter(3, [450, 2800], btype="bandpass", fs=SR, output="sos")
    pop = signal.sosfilt(sos_pop, pop_n) * 1.25
    
    # Exhaust puff
    puff_n = np.random.uniform(-0.55, 0.55, n_pts)
    sos_puff = signal.butter(2, [180, 850], btype="bandpass", fs=SR, output="sos")
    puff = signal.sosfilt(sos_puff, puff_n) * np.exp(-t * 12) * 0.85
    
    # Reed valve flutter (70 Hz vibrato)
    flutter = np.sin(2 * np.pi * 420 * t + np.sin(2 * np.pi * 70 * t) * 1.2) * np.exp(-t * 22) * 0.4
    
    out = thump + pop + puff + flutter
    return out.astype(np.float32)


def gen_chain_spoolup(dur=0.70):
    """
    Frame 410 (13.667s): Chain tensioning & accelerating rattle spool-up.
    - Tensioner arm snap-slap
    - Roller chain teeth engaging sprockets (frequency ramps 8 Hz -> 35 Hz)
    - Engine revving from 1200 RPM idle thrum to 5500 RPM two-stroke buzz
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. Tensioner slap (t = 0.0)
    slap = np.sin(2 * np.pi * 145 * t) * np.exp(-t * 30) * 0.7 + np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 60) * 0.5
    
    # 2. Roller chain rattle accelerating
    chain_rate = np.linspace(10.0, 38.0, n_pts)
    phase_chain = 2 * np.pi * np.cumsum(chain_rate) / SR
    chain_clicks = (np.sin(phase_chain) ** 5) * np.linspace(0.2, 0.85, n_pts)
    chain_buzz = signal.sosfilt(
        signal.butter(3, [1400, 4800], btype="bandpass", fs=SR, output="sos"),
        chain_clicks
    ) * 1.1
    
    # 3. 2-stroke engine revving (65 Hz -> 180 Hz)
    f_eng = np.linspace(65, 180, n_pts)
    phase_eng = 2 * np.pi * np.cumsum(f_eng) / SR
    eng_hum = (np.sin(phase_eng) * 0.6 + np.sin(phase_eng * 2.0) * 0.35) * np.linspace(0.3, 0.95, n_pts)
    
    out = slap + chain_buzz + eng_hum
    return out.astype(np.float32)


def gen_gas_drill_chewing(dur=3.8):
    """
    Frames 430..544 (14.33s..18.13s): Aggressive carbide teeth chewing stone with
    low-end motor vibration and crisp high-speed chain drive clatter.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. 2-stroke combustion motor buzz (~120 Hz fundamental + 240 Hz + 360 Hz)
    m1 = np.sin(2 * np.pi * 120 * t) * 0.55
    m2 = np.sin(2 * np.pi * 240 * t) * 0.35
    m3 = np.sin(2 * np.pi * 360 * t) * 0.2
    # Slight torque hunt LFO
    motor_mod = 0.85 + 0.15 * np.sin(2 * np.pi * 4.2 * t)
    motor = (m1 + m2 + m3) * motor_mod
    
    # 2. Aggressive carbide teeth chewing stone (violent micro-impacts 1800 - 5500 Hz)
    noise_teeth = np.random.uniform(-0.85, 0.85, n_pts)
    sos_teeth = signal.butter(3, [1600, 5200], btype="bandpass", fs=SR, output="sos")
    teeth_crunch = signal.sosfilt(sos_teeth, noise_teeth) * 1.15
    # Rapid hammer-rate pulse (~28 Hz)
    hammer_mod = (np.sin(2 * np.pi * 28 * t) ** 2) * 0.4 + 0.6
    chewing = teeth_crunch * hammer_mod
    
    # 3. Crisp high-speed roller chain clatter (continuous sprocket engagement)
    f_chain = 36.0
    phase_ch = 2 * np.pi * f_chain * t
    ch_pulses = (np.sin(phase_ch) ** 8)
    sos_ch = signal.butter(3, [2400, 6800], btype="bandpass", fs=SR, output="sos")
    chain_clatter = signal.sosfilt(sos_ch, ch_pulses * np.random.uniform(0.7, 1.0, n_pts)) * 0.95
    
    # 4. Deep chassis vibration rumble (48 Hz sub-bass)
    sub_vib = np.sin(2 * np.pi * 48 * t) * 0.5
    
    left = (motor * 0.8 + chewing * 0.85 + chain_clatter * 0.75 + sub_vib * 0.6).astype(np.float32)
    right = (motor * 0.85 + chewing * 0.8 + chain_clatter * 0.8 + sub_vib * 0.6).astype(np.float32)
    return left, right


def gen_gas_motor_jam_and_blowout(dur=1.0):
    """
    Frame 545 (18.167s): Deep torque jam (engine instantly bogs down, heavy stall thud).
    Frame 555 (18.500s): Shear pin snap (explosive crack) + chain whipping & clattering onto frame with backfire pop.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    left = np.zeros(n_pts, dtype=np.float32)
    right = np.zeros(n_pts, dtype=np.float32)
    
    # 1. Torque Jam at t = 0.0s (Frame 545)
    jam_thud = np.sin(2 * np.pi * 65 * np.exp(-t * 10) * t) * np.exp(-t * 16) * 1.35
    bog_groan = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 9) * 0.85
    left += jam_thud + bog_groan
    right += jam_thud + bog_groan
    
    # 2. Shear Pin Snap at t = 0.333s (Frame 555 = 10 frames after jam)
    t_snap = t - 0.333
    m_snap = t_snap >= 0
    if np.any(m_snap):
        dt = t_snap[m_snap]
        # Explosive shear crack
        crack_n = np.random.uniform(-1.0, 1.0, len(dt)) * np.exp(-dt * 90)
        sos_pin = signal.butter(4, [1800, 8000], btype="bandpass", fs=SR, output="sos")
        pin_crack = signal.sosfilt(sos_pin, crack_n) * 1.7
        pin_ring = np.sin(2 * np.pi * 4200 * dt) * np.exp(-dt * 55) * 0.75
        left[m_snap] += pin_crack + pin_ring
        right[m_snap] += pin_crack + pin_ring
        
    # 3. Exhaust backfire pop at t = 0.360s
    t_bf = t - 0.360
    m_bf = t_bf >= 0
    if np.any(m_bf):
        dt_bf = t_bf[m_bf]
        boom = np.sin(2 * np.pi * 70 * np.exp(-dt_bf * 6) * dt_bf) * np.exp(-dt_bf * 12) * 1.4
        crack = signal.sosfilt(
            signal.butter(3, [800, 4200], btype="bandpass", fs=SR, output="sos"),
            np.random.uniform(-0.9, 0.9, len(dt_bf))
        ) * np.exp(-dt_bf * 60) * 1.2
        left[m_bf] += (boom + crack) * 1.1
        right[m_bf] += (boom + crack) * 1.1
        
    # 4. Chain whipping and clattering down onto frame (t = 0.38s to 0.95s)
    np.random.seed(555)
    whip_times = [0.38, 0.44, 0.52, 0.61, 0.70, 0.79, 0.88]
    for idx_w, t_w in enumerate(whip_times):
        idx0 = int(t_w * SR)
        if idx0 < n_pts:
            dur_w = np.random.uniform(0.04, 0.09)
            nw = int(SR * dur_w)
            tw = np.linspace(0, dur_w, nw, False)
            fw = np.random.uniform(1400, 3200)
            amp_w = (0.78 ** idx_w) * 0.85
            whip_hit = (np.sin(2 * np.pi * fw * tw) + 0.35 * np.sin(2 * np.pi * 680 * tw)) * np.exp(-tw * 65) * amp_w
            slap_n = np.random.uniform(-0.5, 0.5, nw) * np.exp(-tw * 110) * amp_w
            pan = np.random.uniform(0.2, 0.8)
            left[idx0:min(idx0 + nw, n_pts)] += (whip_hit + slap_n)[:min(nw, n_pts - idx0)] * (1.0 - pan)
            right[idx0:min(idx0 + nw, n_pts)] += (whip_hit + slap_n)[:min(nw, n_pts - idx0)] * pan
            
    return left, right


# ==========================================================
# 5. TIER 3 ($1 000 DIAMOND CORE DRILL: 580..869f / 19.33..29.00s)
# ==========================================================

def gen_column_base_drop(dur=0.45):
    """
    Frame 580 (19.333s): Heavy column base drop.
    - Deep 58 Hz cast-iron anchor drop + sub-bass floor thump
    - Dovetail column slide transient
    - Heavy anchor bolt seating clunk
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    sub = np.sin(2 * np.pi * 58 * np.exp(-t * 6) * t) * np.exp(-t * 13) * 1.35
    thud_mid = np.sin(2 * np.pi * 165 * t) * np.exp(-t * 22) * 0.85
    ring = np.sin(2 * np.pi * 620 * t) * np.exp(-t * 32) * 0.4
    click = np.random.uniform(-0.75, 0.75, n_pts) * np.exp(-t * 90)
    sos_c = signal.butter(3, [1200, 4800], btype="bandpass", fs=SR, output="sos")
    click_filtered = signal.sosfilt(sos_c, click) * 0.95
    
    out = sub + thud_mid + ring + click_filtered
    return out.astype(np.float32)


def gen_water_manifold_snap(dur=0.18):
    """
    Frame 620 (20.667s): Quick-connect brass water hose coupling snap ('CLICK-SNAP!').
    Sleeve slide + spring ball latch snap + brass ring.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    snap1 = np.sin(2 * np.pi * 2800 * t) * np.exp(-t * 85) * 0.8
    snap2 = np.sin(2 * np.pi * 4800 * t) * np.exp(-t * 110) * 0.65
    mid = np.sin(2 * np.pi * 780 * t) * np.exp(-t * 40) * 0.9
    click = np.random.uniform(-0.7, 0.7, n_pts) * np.exp(-t * 140) * 0.7
    
    out = snap1 + snap2 + mid + click
    return out.astype(np.float32)


def gen_diamond_barrel_lock(dur=0.22):
    """
    Frame 640 (21.333s): 120mm diamond core barrel locking onto threaded arbor.
    Triple magnetic snap ('TS-TS-TS!') + resonant thin-wall core barrel chime (1450 Hz, 3100 Hz).
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    snap = gen_magnetic_snap(dur=dur, clicks=3, freq_base=840, metallic_gain=1.25)
    ring1 = np.sin(2 * np.pi * 1450 * t) * np.exp(-t * 26) * 0.55
    ring2 = np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 38) * 0.35
    
    out = snap + ring1 + ring2
    return out.astype(np.float32)


def gen_water_valve_hiss(dur=0.67):
    """
    Frame 680 (22.667s): Water valve hiss with pressure pulse.
    Solenoid valve snap open + pressurized water rush hiss with hydraulic pressure pulse.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Solenoid snap (t = 0.0)
    solenoid = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 60) * 0.7 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 35) * 0.5
    
    # Pressurized water rush hiss
    noise_water = np.random.uniform(-0.65, 0.65, n_pts)
    sos_water = signal.butter(3, [1200, 6800], btype="bandpass", fs=SR, output="sos")
    water_hiss = signal.sosfilt(sos_water, noise_water) * np.linspace(0.2, 0.95, n_pts) * 0.9
    
    # Hydraulic pressure pulse
    pressure_pulse = np.sin(2 * np.pi * 130 * t) * np.exp(-t * 14) * 0.6
    
    out = solenoid + water_hiss + pressure_pulse
    return out.astype(np.float32)


def gen_electric_motor_spoolup(dur=0.67):
    """
    Frame 700 (23.333s): Electric motor & diamond core bit accelerating to 3000 RPM high-pitch whine.
    - Smooth induction motor whine ramping (200 Hz -> 1100 Hz)
    - Planetary gearbox whine (2x harmonic)
    - Thin-wall diamond barrel acoustic resonance
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Induction motor whine ramping 200 Hz -> 1100 Hz
    t_norm = t / dur
    freq_whine = 200.0 + (1100.0 - 200.0) * (t_norm ** 1.35)
    phase_whine = 2 * np.pi * np.cumsum(freq_whine) / SR
    
    amp_ramp = np.linspace(0.2, 0.85, n_pts)
    motor_whine = np.sin(phase_whine) * amp_ramp * 0.8
    gear_whine = np.sin(phase_whine * 2.0) * amp_ramp * 0.45
    
    # Core barrel acoustic chime
    barrel_chime = np.sin(2 * np.pi * 1450 * t) * amp_ramp * 0.35
    
    out = motor_whine + gear_whine + barrel_chime
    return out.astype(np.float32)


def gen_diamond_core_drilling(dur=3.8):
    """
    Frames 720..834 (24.00s..27.80s): Clean wet diamond abrasive friction,
    bubbling water foam and slurry gurgle, high-frequency core resonance.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. Clean wet diamond abrasive friction (3.5 kHz - 8.5 kHz)
    noise_abrasive = np.random.uniform(-0.75, 0.75, n_pts)
    sos_ab = signal.butter(3, [3400, 8500], btype="bandpass", fs=SR, output="sos")
    abrasive_hiss = signal.sosfilt(sos_ab, noise_abrasive) * 0.85
    
    # 2. Bubbling water foam & slurry gurgle
    # Viscous liquid gurgle modulated by random bubble pops
    noise_slurry = np.random.uniform(-0.6, 0.6, n_pts)
    sos_slurry = signal.butter(3, [400, 1800], btype="bandpass", fs=SR, output="sos")
    gurgle_base = signal.sosfilt(sos_slurry, noise_slurry) * 0.75
    # Bubble pop modulation
    bubble_lfo = (0.6 + 0.4 * np.sin(2 * np.pi * 9.5 * t)) * (0.7 + 0.3 * np.cos(2 * np.pi * 14.0 * t))
    slurry_gurgle = gurgle_base * bubble_lfo
    
    # 3. High-frequency core barrel harmonic resonance (1450 Hz singing chime)
    core_sing = np.sin(2 * np.pi * 1450 * t) * 0.35 + np.sin(2 * np.pi * 2900 * t) * 0.18
    
    # 4. Electric gearmotor hum (100 Hz / 250 Hz)
    motor_hum = np.sin(2 * np.pi * 100 * t) * 0.45 + np.sin(2 * np.pi * 250 * t) * 0.25
    
    left = (abrasive_hiss * 0.85 + slurry_gurgle * 0.8 + core_sing * 0.75 + motor_hum * 0.6).astype(np.float32)
    right = (abrasive_hiss * 0.8 + slurry_gurgle * 0.85 + core_sing * 0.75 + motor_hum * 0.65).astype(np.float32)
    return left, right


def gen_hydraulic_water_hammer_blowout(dur=1.2):
    """
    Frame 835 (27.833s): Water hammer pop (hydraulic shockwave clunk inside manifold).
    Frame 845 (28.167s): Hose coupling blowout and explosive rushing 2.5m steam/spray hiss.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    left = np.zeros(n_pts, dtype=np.float32)
    right = np.zeros(n_pts, dtype=np.float32)
    
    # 1. Water hammer pop at t = 0.0s (Frame 835)
    hammer_knock = np.sin(2 * np.pi * 110 * np.exp(-t * 8) * t) * np.exp(-t * 18) * 1.4
    pipe_ring = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 28) * 0.6
    sub_surge = np.sin(2 * np.pi * 52 * t) * np.exp(-t * 12) * 0.95
    left += hammer_knock + pipe_ring + sub_surge
    right += hammer_knock + pipe_ring + sub_surge
    
    # 2. Hose coupling blowout pop at t = 0.333s (Frame 845 = 10 frames after hammer)
    t_blow = t - 0.333
    m_blow = t_blow >= 0
    if np.any(m_blow):
        dt = t_blow[m_blow]
        # Explosive fitting blowout pop
        pop_n = np.random.uniform(-1.0, 1.0, len(dt)) * np.exp(-dt * 85)
        sos_blow = signal.butter(3, [1200, 6800], btype="bandpass", fs=SR, output="sos")
        blowout_pop = signal.sosfilt(sos_blow, pop_n) * 1.55
        fitting_ring = np.sin(2 * np.pi * 2600 * dt) * np.exp(-dt * 45) * 0.65
        
        # Sustained explosive rushing 2.5m wet spray / steam purge hiss
        spray_n = np.random.uniform(-0.9, 0.9, len(dt))
        sos_spray = signal.butter(3, [800, 9200], btype="bandpass", fs=SR, output="sos")
        env_spray = (np.sin(np.pi * np.clip(dt / 0.15, 0, 1) * 0.5) ** 0.7) * np.exp(-dt * 2.5)
        turb_mod = 1.0 + 0.25 * np.sin(2 * np.pi * 16 * dt)
        spray_hiss = signal.sosfilt(sos_spray, spray_n) * env_spray * turb_mod * 1.35
        
        left[m_blow] += blowout_pop + fitting_ring + spray_hiss
        right[m_blow] += blowout_pop + fitting_ring + spray_hiss
        
    return left, right


# ==========================================================
# 6. TIER 4 ($100 000+ PLASMA TUNNEL SHIELD: 870..1159f / 29.00..38.67s)
# ==========================================================

def gen_titanium_shield_dock(dur=0.50):
    """
    Frame 870 (29.000s): Titanium shield casing dock.
    Massive 48 Hz sub-bass drop thud + titanium harmonic resonance (1150 Hz, 2400 Hz).
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    sub = np.sin(2 * np.pi * 48 * np.exp(-t * 5) * t) * np.exp(-t * 11) * 1.4
    thud_mid = np.sin(2 * np.pi * 175 * t) * np.exp(-t * 24) * 0.8
    ti_ring1 = np.sin(2 * np.pi * 1150 * t) * np.exp(-t * 30) * 0.6
    ti_ring2 = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 45) * 0.4
    click = np.random.uniform(-0.65, 0.65, n_pts) * np.exp(-t * 90)
    sos = signal.butter(3, [1400, 5600], btype="bandpass", fs=SR, output="sos")
    transient = signal.sosfilt(sos, click) * 0.8
    
    out = sub + thud_mid + ti_ring1 + ti_ring2 + transient
    return out.astype(np.float32)


def gen_rotary_laser_magnetic_lock(dur=0.20):
    """
    Frame 895 (29.833s): Rotary laser head magnetic lock.
    High-velocity magnetic lock ('TS-TS-TS!') with crisp multi-pole clamp.
    """
    return gen_magnetic_snap(dur=dur, clicks=3, freq_base=860, metallic_gain=1.4)


def gen_cryogenic_conduit_clamps(dur=0.25):
    """
    Frame 920 (30.667s): Cryogenic conduit clamps.
    Pneumatic cryo clamp thud + liquid nitrogen micro-vent hiss puff.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    thud = np.sin(2 * np.pi * 115 * t) * np.exp(-t * 26) * 0.9
    clack = np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 60) * 0.7
    cryo_n = np.random.uniform(-0.55, 0.55, n_pts)
    sos_cryo = signal.butter(3, [2400, 8200], btype="bandpass", fs=SR, output="sos")
    cryo_vent = signal.sosfilt(sos_cryo, cryo_n) * np.exp(-t * 24) * 0.85
    
    out = thud + clack + cryo_vent
    return out.astype(np.float32)


def gen_plasma_startup_swell(dur=0.83):
    """
    Frames 950..975 (31.67s..32.50s): Magnetic coil charging wave + 4 plasma laser emitter hums.
    - Magnetic coil charging wave (exponential pitch riser 80 Hz -> 320 Hz)
    - 4 plasma laser emitter hums (quad phased harmonics 440 Hz, 880 Hz, 1320 Hz, 1760 Hz)
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # Coil charging pitch riser
    f_charge = 80.0 + (320.0 - 80.0) * (t / dur) ** 2.2
    phase_charge = 2 * np.pi * np.cumsum(f_charge) / SR
    charging_wave = np.sin(phase_charge) * np.linspace(0.1, 0.85, n_pts)
    
    # 4 emitter hums
    h1 = np.sin(2 * np.pi * 440 * t) * 0.35
    h2 = np.sin(2 * np.pi * 880 * t) * 0.28
    h3 = np.sin(2 * np.pi * 1320 * t) * 0.22
    h4 = np.sin(2 * np.pi * 1760 * t) * 0.16
    emitters = (h1 + h2 + h3 + h4) * np.linspace(0.2, 0.9, n_pts)
    
    out = charging_wave + emitters
    return out.astype(np.float32)


def gen_plasma_vaporization(dur=6.13):
    """
    Frames 975..1159 (32.50s..38.67s): Hypersonic rotary plasma whine,
    crystalline vaporization sizzle, ultra-high-frequency laser beam resonance.
    """
    n_pts = int(SR * dur)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. Hypersonic rotary plasma whine (rotary cutter head spinning 2400 Hz - 4200 Hz)
    f_whine = 2400.0 + 200.0 * np.sin(2 * np.pi * 6.0 * t)
    phase_wh = 2 * np.pi * np.cumsum(f_whine) / SR
    rotary_whine = (np.sin(phase_wh) * 0.5 + np.sin(phase_wh * 1.5) * 0.25) * 0.85
    
    # 2. Crystalline rock vaporization sizzle (intense micro-plasma hiss 4 kHz - 12 kHz)
    raw_sizzle = np.random.uniform(-0.8, 0.8, n_pts)
    sos_sizzle = signal.butter(4, [3800, 11500], btype="bandpass", fs=SR, output="sos")
    plasma_sizzle = signal.sosfilt(sos_sizzle, raw_sizzle) * 1.15
    # Rapid plasma pulse tremolo (45 Hz)
    plasma_pulse = 0.75 + 0.25 * np.sin(2 * np.pi * 45 * t)
    sizzle_mod = plasma_sizzle * plasma_pulse
    
    # 3. Ultra-high-frequency laser beam resonance (harmonic choir: 1800, 3600, 5400, 7200 Hz)
    b1 = np.sin(2 * np.pi * 1800 * t) * 0.25
    b2 = np.sin(2 * np.pi * 3600 * t) * 0.2
    b3 = np.sin(2 * np.pi * 5400 * t) * 0.14
    b4 = np.sin(2 * np.pi * 7200 * t) * 0.09
    beam_resonance = b1 + b2 + b3 + b4
    
    left = (rotary_whine * 0.75 + sizzle_mod * 0.9 + beam_resonance * 0.7).astype(np.float32)
    right = (rotary_whine * 0.85 + sizzle_mod * 0.85 + beam_resonance * 0.7).astype(np.float32)
    return left, right


def gen_plasma_climax_coins_and_subbass(dur=5.0):
    """
    Frames 1010..1159 (33.67s..38.67s):
    - Massive 260+ resonant metal coin cascade clinks climbing exponentially to +$1 480 000
    - Deep resonant sub-bass climax chord (warm 40 Hz foundation + multi-octave choir)
    """
    n_pts = int(SR * dur)
    left = np.zeros(n_pts, dtype=np.float32)
    right = np.zeros(n_pts, dtype=np.float32)
    t = np.linspace(0, dur, n_pts, False)
    
    # 1. Deep resonant sub-bass climax chord
    # Majestic 40 Hz foundation + 80 Hz + 120 Hz rich harmonics
    sub_40 = np.sin(2 * np.pi * 40 * t) * 0.75
    sub_80 = np.sin(2 * np.pi * 80 * t) * 0.4
    sub_120 = np.sin(2 * np.pi * 120 * t) * 0.25
    lfo_l = 0.5 + 0.35 * np.sin(2 * np.pi * 0.3 * t)
    lfo_r = 0.5 + 0.35 * np.cos(2 * np.pi * 0.3 * t)
    
    # Swell envelope
    sub_env = np.linspace(0.4, 1.0, n_pts) ** 1.5
    left += (sub_40 * lfo_l + sub_80 * 0.6 + sub_120 * 0.5) * sub_env * 0.95
    right += (sub_40 * lfo_r + sub_80 * 0.6 + sub_120 * 0.5) * sub_env * 0.95
    
    # 2. 260+ Resonant metal coin cascade clinks
    np.random.seed(999)
    coin_count = 265
    for i in range(coin_count):
        # Exponential time distribution matching the HUD counter (+1 480 000 surge)
        u = np.random.uniform(0.0, 1.0)
        t_start = (u ** 1.9) * (dur - 0.16)
        
        freq = np.random.uniform(3400, 7800)
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
        vol = (np.random.uniform(0.35, 0.6) + progress * 0.5) * 0.85
        pan = np.random.uniform(0.08, 0.92)
        
        idx0 = int(t_start * SR)
        idx1 = min(idx0 + n_c, n_pts)
        cl_len = idx1 - idx0
        if cl_len > 0:
            left[idx0:idx1] += clink[:cl_len] * vol * (1.0 - pan)
            right[idx0:idx1] += clink[:cl_len] * vol * pan
            
    return left, right


# ==========================================================
# 7. MASTER SYNCHRONIZATION AND ASSEMBLY (1160 FRAMES @ 30 FPS)
# ==========================================================

def assemble_master_score():
    print("=" * 75)
    print("PRO PROCEDURAL ASMR GENERATOR: DrillProgression")
    print(f"Target: {DURATION:.4f}s ({DURATION_FRAMES} frames @ {FPS} FPS, {SR} Hz Stereo)")
    print(f"Total Master Buffer Samples: {N_SAMPLES}")
    print("=" * 75)
    
    # ----------------------------------------------------
    # Tier 1 ($10 Manual Auger, 0..289f / 0.0s..9.67s)
    # ----------------------------------------------------
    print("\n[Tier 1] $10 Manual Auger (0f - 289f, 0.000s - 9.667s):")
    
    # Frame 0 (0.000s): Vise clamp thud
    t_f0 = frame_to_sec(0)
    print(f"  - Frame   0 ({t_f0:.3f}s): Vise clamp thud")
    vise_thud = gen_vise_clamp_thud(dur=0.45)
    add_audio(t_f0, vise_thud * 1.3, vise_thud * 1.25)
    
    # Frame 25 (0.833s): Auger spiral drop
    t_f25 = frame_to_sec(25)
    print(f"  - Frame  25 ({t_f25:.3f}s): Auger spiral drop into chuck")
    spiral_drop = gen_auger_spiral_drop(dur=0.35)
    add_audio(t_f25, spiral_drop * 1.1, spiral_drop * 1.1)
    
    # Frame 50 (1.667s): Handle snap ('TS-TS!')
    t_f50 = frame_to_sec(50)
    print(f"  - Frame  50 ({t_f50:.3f}s): T-handle snap into chuck collar ('TS-TS!')")
    h_snap = gen_handle_snap(dur=0.18)
    add_audio(t_f50, h_snap * 1.35, h_snap * 1.35)
    
    # Frames 70..140 (2.33s..4.67s): Squeaky crank turns with dry stone rubbing friction and crumble plinks
    print(f"  - Frames 70-139 ({frame_to_sec(70):.3f}s - {frame_to_sec(140):.3f}s): Squeaky crank turns & dry stone rubbing")
    for f_crank, intens in [(72, 0.85), (94, 1.05), (116, 1.25)]:
        t_crk = frame_to_sec(f_crank)
        crk = gen_squeaky_crank_turn(dur=0.65, intensity=intens)
        add_audio(t_crk, crk * 0.9, crk * 0.85)
        
    # Frames 140..254 (4.67s..8.47s): Steady rhythmic boring ASMR with dry grit cascade
    t_bore_start = frame_to_sec(140)
    t_bore_end = frame_to_sec(255)
    dur_bore = t_bore_end - t_bore_start
    print(f"  - Frames 140-254 ({t_bore_start:.3f}s - {t_bore_end:.3f}s): Steady rhythmic boring ASMR with dry grit cascade")
    bore_l, bore_r = gen_manual_auger_boring(dur=dur_bore)
    add_audio(t_bore_start, bore_l * 1.15, bore_r * 1.15)
    
    # Frames 255..289 (8.50s..9.67s): Sudden stone jam (255f) + violent fracture crack (265f) + handle clatter
    t_f255 = frame_to_sec(255)
    print(f"  - Frame 255 ({t_f255:.3f}s): Sudden stone jam")
    print(f"  - Frame 265 ({frame_to_sec(265):.3f}s): Violent fracture crack of steel spiral + handle clatter")
    jam_l, jam_r = gen_auger_jam_and_fracture(dur=1.1)
    add_audio(t_f255, jam_l * 1.4, jam_r * 1.4)
    
    # ----------------------------------------------------
    # Tier 2 ($100 Gas Motor Drill, 290..579f / 9.67s..19.33s)
    # ----------------------------------------------------
    print("\n[Tier 2] $100 Gas Motor Drill (290f - 579f, 9.667s - 19.333s):")
    
    # Frame 290 (9.667s): Tubular sled frame drop
    t_f290 = frame_to_sec(290)
    print(f"  - Frame 290 ({t_f290:.3f}s): Tubular sled frame drop thud")
    sled_drop = gen_tubular_sled_drop(dur=0.42)
    add_audio(t_f290, sled_drop * 1.3, sled_drop * 1.25)
    
    # Frame 310 (10.333s): 2-stroke engine snap ('TS-TS!')
    t_f310 = frame_to_sec(310)
    print(f"  - Frame 310 ({t_f310:.3f}s): 2-stroke engine dock ('TS-TS!')")
    eng_snap = gen_magnetic_snap(dur=0.15, clicks=2, freq_base=820, metallic_gain=1.2)
    add_audio(t_f310, eng_snap * 1.3, eng_snap * 1.3)
    
    # Frame 330 (11.000s): Chain gearbox snap ('TS-TS-TS!')
    t_f330 = frame_to_sec(330)
    print(f"  - Frame 330 ({t_f330:.3f}s): Chain gearbox snap ('TS-TS-TS!')")
    gb_snap = gen_magnetic_snap(dur=0.15, clicks=3, freq_base=850, metallic_gain=1.3)
    add_audio(t_f330, gb_snap * 1.35, gb_snap * 1.35)
    
    # Frame 350 (11.667s): Drill bit lock ('CLACK!')
    t_f350 = frame_to_sec(350)
    print(f"  - Frame 350 ({t_f350:.3f}s): Drill bit lock into hex drive ('CLACK!')")
    bit_lock = gen_drill_bit_lock(dur=0.22)
    add_audio(t_f350, bit_lock * 1.35, bit_lock * 1.35)
    
    # Frame 370 (12.333s): Heavy clutch lever clack
    t_f370 = frame_to_sec(370)
    print(f"  - Frame 370 ({t_f370:.3f}s): Heavy clutch lever throw clack")
    clutch_lever = gen_brass_lever_throw(dur=0.28)
    add_audio(t_f370, clutch_lever * 1.45, clutch_lever * 1.45)
    
    # Frame 390 (13.000s): Engine first compression cough with exhaust puff
    t_f390 = frame_to_sec(390)
    print(f"  - Frame 390 ({t_f390:.3f}s): Engine first compression cough with exhaust puff")
    eng_cough = gen_twostroke_startup(dur=0.67)
    add_audio(t_f390, eng_cough * 1.35, eng_cough * 1.35)
    
    # Frame 410 (13.667s): Chain tensioning and accelerating rattle spool-up
    t_f410 = frame_to_sec(410)
    print(f"  - Frame 410 ({t_f410:.3f}s): Chain tensioning and accelerating rattle spool-up")
    chain_spool = gen_chain_spoolup(dur=0.70)
    add_audio(t_f410, chain_spool * 1.25, chain_spool * 1.25)
    
    # Frames 430..544 (14.33s..18.13s): Aggressive carbide teeth chewing stone with motor vibration & chain clatter
    t_chew_start = frame_to_sec(430)
    t_chew_end = frame_to_sec(545)
    dur_chew = t_chew_end - t_chew_start
    print(f"  - Frames 430-544 ({t_chew_start:.3f}s - {t_chew_end:.3f}s): Aggressive carbide teeth chewing stone")
    chew_l, chew_r = gen_gas_drill_chewing(dur=dur_chew)
    add_audio(t_chew_start, chew_l * 1.2, chew_r * 1.2)
    
    # Frames 545..579 (18.17s..19.33s): Deep torque jam (545f) + shear pin snap (555f) + chain whip & backfire
    t_f545 = frame_to_sec(545)
    print(f"  - Frame 545 ({t_f545:.3f}s): Deep torque jam")
    print(f"  - Frame 555 ({frame_to_sec(555):.3f}s): Shear pin snap + chain whip/clatter & backfire pop")
    gas_blow_l, gas_blow_r = gen_gas_motor_jam_and_blowout(dur=1.0)
    add_audio(t_f545, gas_blow_l * 1.45, gas_blow_r * 1.45)
    
    # ----------------------------------------------------
    # Tier 3 ($1 000 Diamond Core Drill, 580..869f / 19.33s..29.00s)
    # ----------------------------------------------------
    print("\n[Tier 3] $1 000 Diamond Core Drill (580f - 869f, 19.333s - 29.000s):")
    
    # Frame 580 (19.333s): Heavy column base drop
    t_f580 = frame_to_sec(580)
    print(f"  - Frame 580 ({t_f580:.3f}s): Heavy anchor column base drop thud")
    col_drop = gen_column_base_drop(dur=0.45)
    add_audio(t_f580, col_drop * 1.35, col_drop * 1.3)
    
    # Frame 600 (20.000s): Electric motor dock ('TS-TS!')
    t_f600 = frame_to_sec(600)
    print(f"  - Frame 600 ({t_f600:.3f}s): Electric motor dock ('TS-TS!')")
    mot_dock = gen_magnetic_snap(dur=0.15, clicks=2, freq_base=820, metallic_gain=1.25)
    add_audio(t_f600, mot_dock * 1.35, mot_dock * 1.35)
    
    # Frame 620 (20.667s): Water manifold snap ('CLICK-SNAP!')
    t_f620 = frame_to_sec(620)
    print(f"  - Frame 620 ({t_f620:.3f}s): Water manifold coupling snap ('CLICK-SNAP!')")
    w_snap = gen_water_manifold_snap(dur=0.18)
    add_audio(t_f620, w_snap * 1.3, w_snap * 1.3)
    
    # Frame 640 (21.333s): Diamond barrel lock ('TS-TS-TS!')
    t_f640 = frame_to_sec(640)
    print(f"  - Frame 640 ({t_f640:.3f}s): Diamond barrel lock & chime ('TS-TS-TS!')")
    bar_lock = gen_diamond_barrel_lock(dur=0.22)
    add_audio(t_f640, bar_lock * 1.4, bar_lock * 1.4)
    
    # Frame 660 (22.000s): Red mushroom button palm thwack
    t_f660 = frame_to_sec(660)
    print(f"  - Frame 660 ({t_f660:.3f}s): Red mushroom button palm thwack with spring bounce")
    btn_thwack = gen_pushbutton_thwack(dur=0.28)
    add_audio(t_f660, btn_thwack * 1.5, btn_thwack * 1.5)
    
    # Frame 680 (22.667s): Water valve hiss with pressure pulse
    t_f680 = frame_to_sec(680)
    print(f"  - Frame 680 ({t_f680:.3f}s): Water valve hiss with pressure pulse")
    w_hiss = gen_water_valve_hiss(dur=0.67)
    add_audio(t_f680, w_hiss * 1.25, w_hiss * 1.25)
    
    # Frame 700 (23.333s): Electric motor & diamond core bit accelerating to 3000 RPM high-pitch whine
    t_f700 = frame_to_sec(700)
    print(f"  - Frame 700 ({t_f700:.3f}s): Electric motor & diamond core accelerating to 3000 RPM whine")
    mot_spool = gen_electric_motor_spoolup(dur=0.67)
    add_audio(t_f700, mot_spool * 1.3, mot_spool * 1.3)
    
    # Frames 720..834 (24.00s..27.80s): Clean wet diamond abrasive friction, bubbling slurry gurgle, core resonance
    t_diam_start = frame_to_sec(720)
    t_diam_end = frame_to_sec(835)
    dur_diam = t_diam_end - t_diam_start
    print(f"  - Frames 720-834 ({t_diam_start:.3f}s - {t_diam_end:.3f}s): Wet diamond abrasive friction & slurry gurgle")
    diam_l, diam_r = gen_diamond_core_drilling(dur=dur_diam)
    add_audio(t_diam_start, diam_l * 1.2, diam_r * 1.2)
    
    # Frames 835..869 (27.83s..29.00s): Water hammer pop (835f) + coupling blowout & rushing spray hiss (845f)
    t_f835 = frame_to_sec(835)
    print(f"  - Frame 835 ({t_f835:.3f}s): Water hammer hydraulic pop")
    print(f"  - Frame 845 ({frame_to_sec(845):.3f}s): Hose coupling blowout & explosive rushing spray hiss")
    spray_l, spray_r = gen_hydraulic_water_hammer_blowout(dur=1.2)
    add_audio(t_f835, spray_l * 1.45, spray_r * 1.45)
    
    # ----------------------------------------------------
    # Tier 4 ($100 000+ Plasma Tunnel Shield, 870..1159f / 29.00s..38.67s)
    # ----------------------------------------------------
    print("\n[Tier 4] $100 000+ Plasma Tunnel Shield (870f - 1159f, 29.000s - 38.667s):")
    
    # Frame 870 (29.000s): Titanium shield casing dock
    t_f870 = frame_to_sec(870)
    print(f"  - Frame 870 ({t_f870:.3f}s): Titanium shield casing dock thud")
    ti_dock = gen_titanium_shield_dock(dur=0.50)
    add_audio(t_f870, ti_dock * 1.4, ti_dock * 1.35)
    
    # Frame 895 (29.833s): Rotary laser head magnetic lock ('TS-TS-TS!')
    t_f895 = frame_to_sec(895)
    print(f"  - Frame 895 ({t_f895:.3f}s): Rotary laser head magnetic lock ('TS-TS-TS!')")
    las_lock = gen_rotary_laser_magnetic_lock(dur=0.20)
    add_audio(t_f895, las_lock * 1.4, las_lock * 1.4)
    
    # Frame 920 (30.667s): Cryogenic conduit clamps
    t_f920 = frame_to_sec(920)
    print(f"  - Frame 920 ({t_f920:.3f}s): Cryogenic conduit clamps thud & nitrogen vent")
    cryo_clamp = gen_cryogenic_conduit_clamps(dur=0.25)
    add_audio(t_f920, cryo_clamp * 1.3, cryo_clamp * 1.3)
    
    # Frame 950 (31.667s): Armored power cable plug slam + 100 Hz mains hum & electric arc ('ZZZZT!')
    t_f950 = frame_to_sec(950)
    print(f"  - Frame 950 ({t_f950:.3f}s): Armored power cable plug slam + mains buzz + arc spark ('ZZZZT!')")
    plug_slam = gen_armored_cable_plug_slam(dur=0.55)
    add_audio(t_f950, plug_slam * 1.55, plug_slam * 1.55)
    
    # Frames 950..975 (31.67s..32.50s): Magnetic coil charging wave & 4 plasma laser emitter hums
    print(f"  - Frames 950-975 ({t_f950:.3f}s - {frame_to_sec(975):.3f}s): Magnetic coil charging wave & 4 laser hums")
    plasma_swell = gen_plasma_startup_swell(dur=frame_to_sec(975) - t_f950)
    add_audio(t_f950, plasma_swell * 1.25, plasma_swell * 1.25)
    
    # Frames 975..1159 (32.50s..38.67s): Hypersonic rotary plasma whine, crystalline vaporization sizzle & beam resonance
    t_plas_start = frame_to_sec(975)
    dur_plas = DURATION - t_plas_start
    print(f"  - Frames 975-1159 ({t_plas_start:.3f}s - {DURATION:.3f}s): Hypersonic rotary whine & vaporization sizzle")
    plas_l, plas_r = gen_plasma_vaporization(dur=dur_plas)
    add_audio(t_plas_start, plas_l * 1.15, plas_r * 1.15)
    
    # Frames 1010..1159 (33.67s..38.67s): Massive 260+ coin cascade clinking surge climbing exponentially to +$1 480 000
    t_coins_start = frame_to_sec(1010)
    dur_coins = DURATION - t_coins_start
    print(f"  - Climax Cascade ({t_coins_start:.3f}s - {DURATION:.3f}s, frames 1010-1159): 260+ resonant coin cascade clinks & sub-bass climax chord")
    climax_l, climax_r = gen_plasma_climax_coins_and_subbass(dur=dur_coins)
    add_audio(t_coins_start, climax_l * 1.2, climax_r * 1.2)


def master_and_export():
    assemble_master_score()

    # Peak normalization to exactly -1.0 dBFS (amplitude = 10^(-1.0 / 20) ≈ 0.8912509)
    target_peak = 10.0 ** (-1.0 / 20.0)  # ~0.8912509
    current_max = np.max(np.abs(stereo))
    print("\n" + "=" * 75)
    print(f"Pre-normalized peak amplitude: {current_max:.5f}")

    if current_max > 0:
        norm_factor = target_peak / current_max
        stereo_master = stereo * norm_factor
    else:
        stereo_master = stereo

    final_peak = np.max(np.abs(stereo_master))
    final_peak_db = 20.0 * np.log10(final_peak)

    # Convert to 16-bit PCM WAV
    int16_data = np.clip(stereo_master * 32767.0, -32768, 32767).astype(np.int16)

    out_wav = os.path.abspath("remotion_studio/public/audio/asmr_drill_progression.wav")
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    wavfile.write(out_wav, SR, int16_data.T)

    actual_samples = stereo_master.shape[1]
    actual_dur = actual_samples / float(SR)
    actual_frames = actual_dur * FPS

    print(f"Master ASMR track written to: {out_wav}")
    print(f"Track Duration: {actual_dur:.4f}s ({actual_samples} samples, {actual_frames:.1f} frames @ {FPS} FPS)")
    print(f"Audio Format: {SR} Hz Stereo 16-bit PCM WAV")
    print(f"Final Peak Amplitude: {final_peak:.5f} ({final_peak_db:.2f} dBFS)")
    print("=" * 75)

    return out_wav, actual_dur, final_peak, final_peak_db


if __name__ == "__main__":
    master_and_export()
