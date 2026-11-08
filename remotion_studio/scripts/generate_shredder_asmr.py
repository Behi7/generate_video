#!/usr/bin/env python3
"""
Procedural Multi-Layered Mechanical ASMR Audio Synthesizer: ShredderProgression
Generates a 38.6667-second 44.1kHz Stereo Master Track for 'ShredderProgression'
Tailored for 30 FPS timing (1160 frames, 1,705,200 samples).

Strictly follows The Pure ASMR Law (remotion_studio/crew/sound_editor.md):
1. Zero AI Voiceover.
2. Rich tactile mechanical ASMR synthesized to exactly 1160 frames (38.6667s @ 30 FPS, 44.1 kHz stereo WAV).
3. Synchronized audio events across 4 distinct Progression Tiers:
   - Tier 1 ($10 Manual Hand-Crank Desk Shredder, 0..289f):
     Wood clamp thud (0f), hex shafts click (20f), stripper frame snap (40f), brass crank snap (60f), slitter lock (75f).
     Wooden crank squeaks & gear ratcheting (75..149f), crunchy plastic bottle ASMR tearing (150..249f),
     wooden crank handle fracture snap & gear teeth strip clatter (265f).
   - Tier 2 ($100 Workshop Electric Twin-Shaft Shredder, 290..579f):
     Tubular chassis thud (290f), cutter bed lock (310f), housing snap (330f), hopper snap (350f), chain drive lock (365f).
     AC induction motor rising hum & chain link chatter (365..439f), dual aluminum can crushing & tearing ASMR (440..539f),
     high-tensile drive chain violent rupture whip & spark hiss (555f).
   - Tier 3 ($1 000 Heavy Industrial 2-Shaft Shredder, 580..869f):
     Cast monolith bed landing (580f), hex shafts & planetary gearboxes dock (600f), armored chamber lock (620f),
     hopper slam (640f), 600-bar hydraulic manifold lock (655f).
     Deep 48 Hz hydraulic sub-bass hum & valve hiss (655..729f), monstrous structural steel I-beam crunching ASMR (730..829f),
     600-bar explosive hydraulic hose blowout crack & rushing high-pressure steam blast (845f).
   - Tier 4 ($100 000+ Quantum Magnetic Plasma Disintegrator, 870..1159f):
     Anti-gravity pedestal dock (870f), toroid stator snap (890f), singularity rollers dock (910f),
     levitating plasma hopper snap (930f), armored cryo conduit slam + electric arc ZZZZT! (945f).
     Cryo purge hiss, plasma arc buzz & hypersonic roller spool-up (945..1019f),
     dark matter singularity crunch ASMR + exponential 140+ coin cascade clinking surge (1020..1129f),
     quantum spacetime singularity collapse shockwave & crystalline dispersion (1135f).
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
# 1. CORE TRANSIENT IMPACTS & ASSEMBLY DOCKING
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
# 2. TIER 1 GENERATORS: WOOD, GEAR CLICKS, PLASTIC CRUNCH & SNAP
# ==========================================================

def gen_wood_creak(dur=0.5, pitch_start=280.0, pitch_end=460.0):
    """Wooden crank handle squeak/creak."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    freq = np.linspace(pitch_start, pitch_end, len(t))
    # Harmonic wooden squeak
    sig = (
        np.sin(2 * np.pi * freq * t) * 0.5
        + np.sin(4 * np.pi * freq * t) * 0.25
        + np.sin(6 * np.pi * freq * t) * 0.12
    ) * (1 - np.cos(2 * np.pi * t / dur)) * 0.5
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 6.0) * 0.15
    out = sig * 0.75 + noise * 0.25
    return out, out * 0.88

def gen_gear_ratchet_tick(dur=0.08, freq=2800.0):
    """Spur gear teeth meshing tick."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    click = np.sin(2 * np.pi * freq * t) * np.exp(-t * 85.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 90.0) * 0.3
    sig = click * 0.7 + noise * 0.3
    return sig, sig * 0.95

def gen_plastic_crunch(dur=0.22):
    """Dense tactile ASMR plastic bottle crunch & crinkle."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    # Bandpass filter tuned for crunchy crisp PET plastic
    sos = signal.butter(4, [1200, 5500], btype='bandpass', fs=SR, output='sos')
    filtered = signal.sosfilt(sos, noise)
    
    # Random micro-envelope impulses for crackles
    np.random.seed(int(dur * 1000) % 997)
    impulse_env = np.exp(-t * 26.0)
    for _ in range(4):
        pos = np.random.uniform(0.02, dur * 0.8)
        idx = int(pos * SR)
        span = int(0.02 * SR)
        if idx + span < len(impulse_env):
            impulse_env[idx:idx+span] += np.hanning(span) * 1.8
            
    sig = filtered * impulse_env * 1.6
    return sig, sig * 0.92

def gen_wooden_crank_snap(dur=0.6):
    """Violent dry wooden crank fracture snap & splintering."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # 1. Primary crack impact transient
    crack_click = np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 120.0) * 0.8
    # 2. Wood body low-mid resonance
    wood_body = np.sin(2 * np.pi * 480 * np.exp(-t * 15.0) * t) * np.exp(-t * 22.0) * 0.7
    # 3. Splintering fibrous crackle
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(3, [800, 4800], btype='bandpass', fs=SR, output='sos')
    splinters = signal.sosfilt(sos, noise) * np.exp(-t * 18.0) * 0.6
    
    sig_l = crack_click * 0.4 + wood_body * 0.35 + splinters * 0.25
    sig_r = crack_click * 0.35 + wood_body * 0.38 + splinters * 0.27
    return sig_l, sig_r

# ==========================================================
# 3. TIER 2 GENERATORS: ELECTRIC MOTOR, CHAIN & ALUMINUM
# ==========================================================

def gen_electric_motor_startup(dur=2.4):
    """AC induction motor rising hum (60Hz -> 120Hz + harmonics)."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Accelerating motor frequency
    f_fund = 40.0 + (120.0 - 40.0) * (t / dur) ** 1.5
    hum = (
        np.sin(2 * np.pi * f_fund * t) * 0.4
        + np.sin(4 * np.pi * f_fund * t) * 0.25
        + np.sin(6 * np.pi * f_fund * t) * 0.15
    )
    # Mild electrical vibration buzz
    buzz = signal.sawtooth(2 * np.pi * 120.0 * t) * 0.1
    fade_in = np.minimum(1.0, t * 5.0)
    sig = (hum + buzz) * fade_in * 0.8
    return sig, sig * 0.95

def gen_chain_rattle_loop(dur=0.25):
    """Drive chain link chatter / metallic rattle."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(4, [2400, 6800], btype='bandpass', fs=SR, output='sos')
    chatter = signal.sosfilt(sos, noise)
    pulse = 0.5 + 0.5 * np.sin(2 * np.pi * 45.0 * t)
    sig = chatter * pulse * 0.4
    return sig, sig * 0.9

def gen_aluminum_crunch(dur=0.24):
    """Dual aluminum soda can crushing, tearing & popping ASMR."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(4, [1800, 7200], btype='bandpass', fs=SR, output='sos')
    can_crinkle = signal.sosfilt(sos, noise)
    
    # Sharp aluminum wall buckle pops
    buckle1 = np.sin(2 * np.pi * 1600 * t) * np.exp(-t * 45.0) * 0.4
    buckle2 = np.sin(2 * np.pi * 2800 * t) * np.exp(-t * 60.0) * 0.3
    env = np.exp(-t * 20.0)
    sig = (can_crinkle * 0.6 + buckle1 + buckle2) * env * 1.5
    return sig, sig * 0.94

def gen_chain_snap_whip(dur=0.65):
    """High-tensile drive chain rupture & whip crack."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # High-velocity whip transient
    crack = np.sin(2 * np.pi * 1800 * np.exp(-t * 40.0) * t) * np.exp(-t * 70.0) * 0.9
    # Metallic ringing links
    ring = np.sin(2 * np.pi * 4200 * t) * np.exp(-t * 25.0) * 0.4
    # Metal fragments sizzle
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(3, [2000, 9000], btype='bandpass', fs=SR, output='sos')
    debris = signal.sosfilt(sos, noise) * np.exp(-t * 12.0) * 0.3
    
    sig_l = crack * 0.6 + ring * 0.25 + debris * 0.15
    sig_r = crack * 0.55 + ring * 0.3 + debris * 0.15
    return sig_l, sig_r

# ==========================================================
# 4. TIER 3 GENERATORS: HYDRAULIC SUB-BASS, STEEL CRUNCH & BLOWOUT
# ==========================================================

def gen_hydraulic_sub_hum(dur=3.2):
    """Monstrous 48 Hz hydraulic pump hum with proportional valve hiss."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    sub = np.sin(2 * np.pi * 48.0 * t) * 0.4 + np.sin(2 * np.pi * 96.0 * t) * 0.2
    # Valve hiss & fluid cavitation
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(3, [500, 3200], btype='bandpass', fs=SR, output='sos')
    hiss = signal.sosfilt(sos, noise) * 0.18
    # High pressure pulsation
    pulse = 0.8 + 0.2 * np.sin(2 * np.pi * 1.16 * t)
    fade = np.minimum(1.0, np.minimum(t * 6.0, (dur - t) * 6.0))
    sig = (sub + hiss) * pulse * fade
    return sig, sig * 0.96

def gen_steel_beam_crunch(dur=0.32):
    """Massive structural steel I-beam tearing, shearing & buckling ASMR."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Deep steel groan resonance
    groan = np.sin(2 * np.pi * 180.0 * np.exp(-t * 6.0) * t) * np.exp(-t * 14.0) * 0.5
    # Violent claw shearing & tearing noise
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(4, [600, 3800], btype='bandpass', fs=SR, output='sos')
    rip = signal.sosfilt(sos, noise) * np.exp(-t * 16.0) * 0.7
    # Heavy metallic pop
    pop = np.sin(2 * np.pi * 920.0 * t) * np.exp(-t * 35.0) * 0.35
    sig = groan * 0.4 + rip * 0.4 + pop * 0.2
    return sig, sig * 0.92

def gen_hydraulic_blowout_600bar(dur=1.5):
    """600-bar catastrophic hydraulic blowout crack & high-pressure steam/oil jet."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Explosive manifold pressure pop
    pop = np.sin(2 * np.pi * 160.0 * t) * np.exp(-t * 22.0) * 0.9
    # High-pressure jet blast
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(3, [1400, 8500], btype='bandpass', fs=SR, output='sos')
    jet = signal.sosfilt(sos, noise) * np.exp(-t * 2.5) * 0.8
    sig = pop * 0.45 + jet * 0.55
    return sig, sig

# ==========================================================
# 5. TIER 4 GENERATORS: CRYO, PLASMA, SINGULARITY & CLIMAX COINS
# ==========================================================

def gen_plasma_arc_buzz(dur=0.7):
    """High-voltage plasma discharge buzz."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    hum = np.sin(2 * np.pi * 100.0 * t) * 0.4
    buzz = signal.sawtooth(2 * np.pi * 360.0 * t) * 0.35
    noise = np.random.uniform(-1, 1, len(t)) * 0.25
    env = np.exp(-t * 4.5)
    sig = (hum + buzz + noise) * env
    return sig, sig * 0.9

def gen_singularity_roller_whine(dur=2.5):
    """Hypersonic roller spin-up whine (200 Hz -> 3600 Hz)."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    f_inst = 200.0 * (18.0 ** (t / dur))  # 200 Hz to 3600 Hz exponential rise
    phase = 2 * np.pi * np.cumsum(f_inst) / SR
    whine = np.sin(phase) * 0.35
    # Cryo coolant hiss underlying
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(2, [3000, 9000], btype='bandpass', fs=SR, output='sos')
    cryo = signal.sosfilt(sos, noise) * 0.15
    fade = np.minimum(1.0, t * 4.0)
    sig = (whine + cryo) * fade
    return sig, sig * 0.95

def gen_dark_matter_crunch(dur=0.28):
    """Quantum dark matter singularity compression & disintegration ASMR."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Hypersonic laser sizzle & subatomic particle crackle
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(4, [2500, 11000], btype='bandpass', fs=SR, output='sos')
    sizzle = signal.sosfilt(sos, noise) * np.exp(-t * 18.0) * 0.6
    # Gravitational warp chirp
    chirp = np.sin(2 * np.pi * np.linspace(1200, 300, len(t)) * t) * np.exp(-t * 22.0) * 0.4
    sig = sizzle * 0.6 + chirp * 0.4
    return sig, sig * 0.9

def gen_quantum_collapse_shockwave(dur=2.0):
    """Catastrophic spacetime singularity collapse & shockwave."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Deep sub-bass implosion thud
    sub = np.sin(2 * np.pi * 32.0 * np.exp(-t * 4.0) * t) * np.exp(-t * 5.0) * 0.9
    # Explosive shockwave blast
    noise = np.random.uniform(-1, 1, len(t))
    sos = signal.butter(2, [80, 4000], btype='bandpass', fs=SR, output='sos')
    blast = signal.sosfilt(sos, noise) * np.exp(-t * 4.0) * 0.7
    # Crystalline dispersion tail
    crystal = np.sin(2 * np.pi * 5400 * t) * np.exp(-t * 8.0) * 0.35
    sig_l = sub * 0.5 + blast * 0.35 + crystal * 0.15
    sig_r = sub * 0.5 + blast * 0.38 + crystal * 0.12
    return sig_l, sig_r

def gen_climax_coins_and_subbass(dur=5.0):
    """Dense multi-layered golden coin cascade + sub-bass crescendo chord."""
    t = np.linspace(0, dur, int(round(SR * dur)), endpoint=False)
    # Deep sub-bass crescendo chord
    sub = (
        np.sin(2 * np.pi * 55.0 * t)
        + np.sin(2 * np.pi * 110.0 * t) * 0.6
        + np.sin(2 * np.pi * 220.0 * t) * 0.3
    ) * np.minimum(1.0, t * 0.8) * 0.35
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
# 6. MASTER SCORE SCOREBOARD ASSEMBLY
# ==========================================================

def assemble_master_score():
    print(f"Synthesizing 1160-frame Shredder ASMR track ({DURATION:.3f}s)...")

    # ==========================================================
    # TIER 1 ($10 Manual Hand-Crank Desk Shredder: frames 0..289 / 0..9.67s)
    # ==========================================================
    # Act 1 (0..69f): Assembly Snaps
    add_audio(frame_to_sec(0), *gen_thud(dur=0.35, freq=75.0, decay=20.0), gain=0.9)
    add_audio(frame_to_sec(20), *gen_metallic_snap(dur=0.15, freq1=3400, freq2=5800), gain=0.85)
    add_audio(frame_to_sec(40), *gen_metallic_snap(dur=0.15, freq1=4200, freq2=6800), gain=0.85)
    add_audio(frame_to_sec(60), *gen_heavy_latch_lock(dur=0.45, freq=520, ring_freq=3400), gain=1.0)
    add_audio(frame_to_sec(75), *gen_metallic_snap(dur=0.18, freq1=4800, freq2=7200), gain=0.9)

    # Act 2 (75..149f): Hand-crank wooden squeaks & gear ratcheting
    for f in [78, 98, 118, 138]:
        add_audio(frame_to_sec(f), *gen_wood_creak(dur=0.45, pitch_start=280 + (f-75)*2, pitch_end=480), gain=0.75)
        add_audio(frame_to_sec(f + 6), *gen_gear_ratchet_tick(dur=0.07, freq=3100), gain=0.6)

    # Act 3 (150..249f): Tactile ASMR Plastic Bottle Shredding
    for f in range(150, 245, 12):
        add_audio(frame_to_sec(f), *gen_plastic_crunch(dur=0.22), gain=0.95)
        add_audio(frame_to_sec(f + 4), *gen_wood_creak(dur=0.22, pitch_start=420, pitch_end=580), gain=0.45)
        add_audio(frame_to_sec(f + 6), *gen_gear_ratchet_tick(dur=0.06, freq=3400), gain=0.5)

    # Act 4 (250..289f): Overload jam & wooden crank snap
    add_audio(frame_to_sec(250), *gen_thud(dur=0.25, freq=90.0, decay=28.0), gain=0.8)
    add_audio(frame_to_sec(265), *gen_wooden_crank_snap(dur=0.65), gain=1.3)
    add_audio(frame_to_sec(268), *gen_gear_ratchet_tick(dur=0.15, freq=1800), gain=0.9)

    # ==========================================================
    # TIER 2 ($100 Workshop Electric Twin-Shaft: frames 290..579 / 9.67..19.33s)
    # ==========================================================
    # Act 1 (290..359f): Assembly Snaps
    add_audio(frame_to_sec(290), *gen_thud(dur=0.35, freq=60.0), gain=0.9)
    add_audio(frame_to_sec(310), *gen_metallic_snap(dur=0.15, freq1=3200, freq2=5200), gain=0.85)
    add_audio(frame_to_sec(330), *gen_metallic_snap(dur=0.15, freq1=4000, freq2=6200), gain=0.85)
    add_audio(frame_to_sec(350), *gen_heavy_latch_lock(dur=0.4, freq=460, ring_freq=3800), gain=1.0)
    add_audio(frame_to_sec(365), *gen_metallic_snap(dur=0.18, freq1=3600, freq2=6400), gain=0.9)

    # Act 2 (365..439f): Induction Motor Spool & Chain Rattle
    add_audio(frame_to_sec(368), *gen_electric_motor_startup(dur=2.4), gain=0.8)
    for f in range(375, 435, 15):
        add_audio(frame_to_sec(f), *gen_chain_rattle_loop(dur=0.25), gain=0.7)

    # Act 3 (440..539f): Dual Aluminum Can Shredding ASMR
    for f in range(440, 535, 10):
        add_audio(frame_to_sec(f), *gen_aluminum_crunch(dur=0.22), gain=1.0)
        add_audio(frame_to_sec(f + 3), *gen_chain_rattle_loop(dur=0.18), gain=0.55)

    # Act 4 (540..579f): Chain Snap Whip & Motor Rupture
    add_audio(frame_to_sec(545), *gen_thud(dur=0.15, freq=130.0), gain=0.8)
    add_audio(frame_to_sec(555), *gen_chain_snap_whip(dur=0.65), gain=1.3)
    add_audio(frame_to_sec(558), *gen_metallic_snap(dur=0.35, freq1=1400, freq2=5200, decay=18), gain=1.0)

    # ==========================================================
    # TIER 3 ($1 000 Heavy Industrial 2-Shaft: frames 580..869 / 19.33..29.00s)
    # ==========================================================
    # Act 1 (580..649f): Assembly Snaps
    add_audio(frame_to_sec(580), *gen_thud(dur=0.45, freq=48.0), gain=1.0)
    add_audio(frame_to_sec(600), *gen_metallic_snap(dur=0.18, freq1=2800, freq2=5000), gain=0.9)
    add_audio(frame_to_sec(620), *gen_metallic_snap(dur=0.18, freq1=3800, freq2=6400), gain=0.9)
    add_audio(frame_to_sec(640), *gen_heavy_latch_lock(dur=0.5, freq=420, ring_freq=4200), gain=1.0)
    add_audio(frame_to_sec(655), *gen_metallic_snap(dur=0.2, freq1=2200, freq2=4800), gain=0.95)

    # Act 2 (655..729f): Hydraulic Sub-bass Hum & Valve Hiss
    add_audio(frame_to_sec(658), *gen_hydraulic_sub_hum(dur=2.4), gain=0.95)

    # Act 3 (730..829f): Structural Steel I-Beam Shredding ASMR
    add_audio(frame_to_sec(730), *gen_hydraulic_sub_hum(dur=3.3), gain=0.9)
    for f in range(730, 825, 14):
        add_audio(frame_to_sec(f), *gen_steel_beam_crunch(dur=0.3), gain=1.1)

    # Act 4 (830..869f): 600-Bar Hydraulic Hose Blowout
    add_audio(frame_to_sec(840), *gen_thud(dur=0.2, freq=80.0), gain=0.7)
    add_audio(frame_to_sec(845), *gen_hydraulic_blowout_600bar(dur=1.5), gain=1.35)

    # ==========================================================
    # TIER 4 ($100 000+ Quantum Magnetic Plasma: frames 870..1159 / 29.00..38.67s)
    # ==========================================================
    # Act 1 (870..939f): Assembly Snaps
    add_audio(frame_to_sec(870), *gen_thud(dur=0.45, freq=42.0), gain=1.0)
    add_audio(frame_to_sec(890), *gen_metallic_snap(dur=0.18, freq1=4500, freq2=7800), gain=0.95)
    add_audio(frame_to_sec(910), *gen_metallic_snap(dur=0.18, freq1=5200, freq2=8500), gain=0.95)
    add_audio(frame_to_sec(930), *gen_heavy_latch_lock(dur=0.55, freq=320, ring_freq=6800), gain=1.1)
    # Armored Cryo Conduit slam + Electric Arc ZZZZT!
    add_audio(frame_to_sec(945), *gen_heavy_latch_lock(dur=0.55, freq=280, ring_freq=7200), gain=1.1)
    add_audio(frame_to_sec(947), *gen_plasma_arc_buzz(dur=0.7), gain=1.2)

    # Act 2 (945..1019f): Cryo hiss & Hypersonic Roller Spinup
    add_audio(frame_to_sec(955), *gen_singularity_roller_whine(dur=2.2), gain=0.85)

    # Act 3 (1020..1129f): Dark Matter Singularity Crunch + Climax Coin Cascade
    for f in range(1020, 1125, 12):
        add_audio(frame_to_sec(f), *gen_dark_matter_crunch(dur=0.25), gain=0.95)

    t_coins = frame_to_sec(1015)
    climax_l, climax_r = gen_climax_coins_and_subbass(dur=DURATION - t_coins)
    add_audio(t_coins, climax_l, climax_r, gain=1.25)

    # Act 4 (1130..1159f): Quantum Spacetime Singularity Collapse
    add_audio(frame_to_sec(1135), *gen_quantum_collapse_shockwave(dur=2.0), gain=1.4)


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

    out_wav = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio", "asmr_shredder_progression.wav")
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    wavfile.write(out_wav, SR, int16_data.T)

    actual_samples = stereo_master.shape[1]
    actual_dur = actual_samples / float(SR)
    print(f"Master ASMR track written to: {out_wav}")
    print(f"Track Duration: {actual_dur:.4f}s ({actual_samples} samples, {actual_dur * FPS:.1f} frames @ {FPS} FPS)")
    print(f"Final Peak Amplitude: {final_peak:.5f} ({final_peak_db:.2f} dBFS)")


if __name__ == "__main__":
    master_and_export()
