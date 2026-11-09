# Audit & Cleanup Plan: Dead, Deprecated, Redundant & Orphaned Files

**Workspace:** `c:\Users\user\Desktop\animation\remotions_renders`  
**Target Directories:** `generate_video/` & `generate_video/remotion_studio/`  
**Date of Audit:** November 9, 2026  
**Safety Validation:** TypeScript `npx tsc --noEmit` passed with 0 errors; full codebase regex dependency & import audit completed.

---

## Executive Summary

| Category | File Count | Size (Bytes) | Size (MB) | Recommended Action |
| :--- | :---: | :---: | :---: | :--- |
| **1. Root Loose Test PNGs** (`remotion_studio/`) | 8 | 20,409,004 | 19.46 MB | Move to `_archive/test_frames/` or Delete |
| **2. Output Loose Test PNGs** (`output/` root & `_misc/`) | 14 | 9,625,568 | 9.18 MB | Move to `_archive/test_frames/` or Delete |
| **3. Output Inspect Environment Sheets** (`output/environment/inspect/`) | 12 | 20,290,628 | 19.35 MB | Move to `_archive/inspections/` |
| **4. Legacy Directories** (`_legacy/` & `src/_legacy/`) | 91 | 885,820 | 0.88 MB | Move to `_archive/legacy_code/` |
| **5. Redundant & Single-Use Scripts** (`scripts/`) | 15 | 295,694 | 0.28 MB | Move to `_archive/legacy_scripts/` |
| **6. Colab & Standalone Render Scripts** | 3 | 18,370 | 0.02 MB | Move to `_archive/colab/` |
| **7. Legacy Unreferenced Audio Files** (`public/audio/`) | 5 | 17,311,807 | 16.51 MB | Move to `_archive/legacy_audio/` |
| **8. Ephemeral Build Artifacts** (`remotion_studio/build/`) | 234 | 130,096,650 | 124.07 MB | Delete (`.gitignore` clean) |
| **9. Orphaned Python Bytecode** (`__pycache__/`) | 3 | 83,687 | 0.08 MB | Delete |
| **10. Root Workspace Duplicate Video** (`PressProgression.mp4`) | 1 | 34,872,246 | 33.26 MB | Delete (identical duplicate) |
| **Total Obsolete / Redundant Footprint** | **386 files** | **233,889,474 B** | **~223.05 MB** | (or ~98.9 MB excluding `build/`) |

---

## Detailed Investigation

### 1. Root Loose Test Frame PNGs
During earlier manual inspection and debugging of singularity & trap visuals, multiple test stills were dumped directly into `remotion_studio/` without specifying an output directory. None are referenced by any script or component.

| File Path | Size | Reason / Status |
| :--- | :---: | :--- |
| `generate_video/remotion_studio/out_100.png` | 2.72 MB (2,856,270 B) | Manual render still (Frame 100), unreferenced |
| `generate_video/remotion_studio/out_605.png` | 2.68 MB (2,814,877 B) | Manual render still (Frame 605), unreferenced |
| `generate_video/remotion_studio/out_635.png` | 2.64 MB (2,772,029 B) | Manual render still (Frame 635), unreferenced |
| `generate_video/remotion_studio/out_blackhole_290.png` | 0.73 MB (766,774 B) | Manual still of BlackHole at frame 290, unreferenced |
| `generate_video/remotion_studio/test_singularity_605.png` | 2.68 MB (2,814,877 B) | Visual test still for Singularity Tier 4 at 605f |
| `generate_video/remotion_studio/test_singularity_620.png` | 2.60 MB (2,729,574 B) | Visual test still for Singularity Tier 4 at 620f |
| `generate_video/remotion_studio/test_singularity_635.png` | 2.64 MB (2,772,029 B) | Visual test still for Singularity Tier 4 at 635f |
| `generate_video/remotion_studio/test_trap_605.png` | 2.75 MB (2,882,574 B) | Visual test still for Trap Tier 4 at 605f |
| **Subtotal** | **19.46 MB (8 files)** | **Safe to archive / delete** |

---

### 2. Output Loose Test PNGs & Intermediate Inspect Images
`remotion_cli.py` now enforces canonical output subdirectories: `output/<project>/stills/`, `output/<project>/qc/`, `output/<project>/inspect/`. Loose files directly in `output/` and `output/_misc/` are obsolete test artifacts.

| File Path | Size | Reason / Status |
| :--- | :---: | :--- |
| `output/test.png` | 661.5 KB (661,542 B) | Generic test still, unreferenced |
| `output/test_blast_280.png` | 1.03 MB (1,082,084 B) | Blast door test frame 280 |
| `output/test_blast_315.png` | 922.3 KB (922,276 B) | Blast door test frame 315 |
| `output/test_pneumatic_285.png` | 0.99 MB (1,037,810 B) | Pneumatic preview test frame 285 |
| `output/test_pneumatic_315.png` | 922.3 KB (922,276 B) | Pneumatic preview test frame 315 |
| `output/test_stagedrop_288.png` | 0.97 MB (1,015,055 B) | Stage drop test frame 288 |
| `output/test_stagedrop_310.png` | 886.7 KB (908,016 B) | Stage drop test frame 310 |
| `output/test_stagedrop_315.png` | 856.3 KB (876,844 B) | Stage drop test frame 315 |
| `output/inspect_audio_asmr_press_progression.png` | 289.0 KB (295,949 B) | One-time spectrogram QC for Press audio |
| `output/_misc/test_brickwall_f1.png` | 337.3 KB (345,438 B) | Frame 1 brickwall test |
| `output/_misc/test_brickwall_f2.png` | 134.4 KB (137,652 B) | Frame 2 brickwall test |
| `output/_misc/test_brickwall_f3.png` | 162.2 KB (166,111 B) | Frame 3 brickwall test |
| `output/_misc/test_brickwall_f4.png` | 741.2 KB (758,941 B) | Frame 4 brickwall test |
| `output/_misc/test_oildrum.png` | 484.0 KB (495,574 B) | Oildrum test still |
| `output/environment/inspect/*.png` (12 files) | 19.35 MB (20,290,628 B) | Environment contact sheets (e.g. `SteelDeck.png` is 6.4 MB) |
| **Subtotal** | **28.53 MB (26 files)** | **Safe to archive / delete** |

---

### 3. Legacy Directories: `_legacy` & `src/_legacy`
The codebase transitioned from a monolithic flat structure into modular self-contained project directories (`src/projects/hammer/`, `src/projects/shredder/`, etc.) and `@shared/`.

- **Verification:**
  1. `tsconfig.json` line 20 explicitly excludes both: `"exclude": ["src/_legacy/**/*", "_legacy/**/*", ...]`.
  2. `remotion_cli.py` lines 368 & 458 explicitly ignore `_legacy`: `dirs[:] = [d for d in dirs if d != "_legacy"]`.
  3. A scan of all 117 active `.ts` / `.tsx` files in `src/projects/` and `src/shared/` shows **0 imports** or references to `_legacy`.
  4. `src/Root.tsx` registers only compositions from modular projects and active shared previews.

| Directory | File Count | Size | Contents |
| :--- | :---: | :---: | :--- |
| `generate_video/remotion_studio/_legacy/` | 17 | 80.6 KB (80,560 B) | Early prototypes: `PumpProgression.tsx`, `PilotViral.tsx`, `MechanicalTransformation.tsx`, `HyperbolicPilot.tsx`, `scene_manifest.json` |
| `generate_video/remotion_studio/src/_legacy/` | 74 | 805.3 KB (805,260 B) | Pre-modular versions: `EpicTransformation.tsx`, `GeneratorProgression.tsx`, plus 70 files in `old_flat_structure/` |
| **Subtotal** | **91 files** | **885.8 KB (0.88 MB)** | **100% orphaned. Safe to move to `_archive/legacy_code/`** |

---

### 4. Redundant & Obsolete Scripts in `remotion_studio/scripts/`
A detailed audit of all 25 files in `scripts/`:

#### A. Single-Use PowerShell Contact Sheet Scripts (5 files)
These scripts manually rendered 4 frames and composited them using .NET `System.Drawing`.
- `generate_blast_door_contact_sheet.ps1` (4,030 B)
- `generate_bucket_contact_sheet.ps1` (3,941 B)
- `generate_hose_contact_sheet.ps1` (3,934 B)
- `generate_riveted_wall_contact_sheet.ps1` (3,951 B)
- `generate_steel_deck_contact_sheet.ps1` (3,934 B)  
**Status:** Obsolete. Fully superceded by `remotion_cli.py inspect <Composition>`, which automatically produces standard 2x2 contact sheets using PIL.

#### B. Redundant Duplicate Audio Scripts (4 files)
Under the modular architecture, each project maintains its own audio generator in `src/projects/<project>/audio/`:
- `scripts/generate_crusher_asmr.py` (14,855 B) $\to$ **100% duplicate** of `src/projects/crusher/audio/generate_crusher_asmr.py`.
- `scripts/generate_drill_asmr.py` (59,696 B) $\to$ **100% duplicate** of `src/projects/drill/audio/generate_drill_asmr.py`.
- `scripts/generate_shredder_asmr.py` (24,065 B) $\to$ **100% duplicate** of `src/projects/shredder/audio/generate_shredder_asmr.py`.
- `scripts/generate_hammer_asmr.py` (24,673 B) $\to$ Early unmodularized version of `src/projects/hammer/audio/generate_hammer_asmr.py`.

#### C. Legacy / Deprecated ASMR Scripts (5 files)
- `scripts/generate_press_asmr.py` (60,040 B) $\to$ Standalone press script; press audio is already generated and checked in (`public/audio/asmr_press_progression.wav`).
- `scripts/generate_destruction_asmr.py` (24,507 B) $\to$ For legacy `EpicTransformation.tsx`.
- `scripts/generate_generator_asmr.py` (41,982 B) $\to$ For legacy `GeneratorProgression.tsx`.
- `scripts/generate_transformation_asmr.py` (10,662 B) $\to$ For legacy `MechanicalTransformation.tsx`.
- `scripts/generate_asmr_track.py` (9,691 B) $\to$ For legacy `PumpProgression.tsx`.

#### D. One-Time Setup Scripts (1 file)
- `scripts/ingest_foley_library.py` (5,733 B) $\to$ Ingested 162 CC0 Foley audio assets from Kenney mirrors into `public/audio/foley/`. The library is already committed and complete.

#### E. Active Scripts to RETAIN in `scripts/` (DO NOT ARCHIVE)
- `compose_asmr.py` (14,400 B) $\to$ **Active**. The central 4-Act Procedural Foley ASMR Master Composer (mandated in `GEMINI.md` and `SKILL.md`).
- `check_collisions.ts` (27,730 B) $\to$ **Active**. Backs `remotion_cli.py check-collisions`.
- `check_sync.ts` (25,812 B) $\to$ **Active**. Backs `remotion_cli.py check-sync`.
- `scaffold_new_video.py` (10,911 B) $\to$ **Active**. Backs `remotion_cli.py create-project`.
- `inspect_audio.py` (9,856 B) $\to$ **Active**. Used by Ruthless Sound Critic (`crew/sound_critic.md`) for forensic spectrogram/RMS audit.
- `check_props_collisions.ts` (19,528 B) $\to$ **Active**. Test suite for prop collision validator.
- `test_all_theme_props.ts` (11,467 B) $\to$ **Active**. Bounding box test suite for theme props.
- `render_on_pc.ps1` (3,374 B) $\to$ **Active**. RTX 4060 PC render script referenced in `README.md`.
- `rtx_bridge_server.py` (6,891 B) $\to$ **Active**. GPU bridge server.
- `rtx_daemon.ps1` (3,483 B) $\to$ **Active**. Zero-touch RTX 4060 daemon.

---

### 5. Colab / Standalone Scripts vs Modern `remotion_cli.py export-pc`
- `export_colab_bundle.py` (1,061 B) was a manual standalone zip script for Colab.
- `remotion_gpu_render.ipynb` (16,078 B) is an interactive notebook for Google Colab Tesla T4 rendering with ngrok.
- `run_render.py` (1,231 B) is the headless runner script executed on Colab Linux (`xvfb-run`).
- **Modern Replacement:**
  The project now has `remotion_cli.py export-pc <Composition>` which packages complete local 10-stream RTX 4060 GPU batch bundles (`render.bat`) directly for the host PC (DirectX/ANGLE).
- **Safety Check:**
  `remotion_cli.py:463` packages `run_render.py` only conditionally (`if os.path.exists(full): z.write(full, root_file)`).
- **Recommendation:**
  Group these 3 files into `_archive/colab/` (or retain them as optional remote Colab fallback).

---

### 6. Legacy Audio in `public/audio/`
The active compositions reference only 5 master WAVs:
`asmr_crusher_progression.wav`, `asmr_drill_progression.wav`, `asmr_hammer_progression.wav`, `asmr_press_progression.wav`, and `asmr_shredder_progression.wav`.

The following 5 audio files belong to archived legacy compositions and have 0 references:

| File Path | Size | Associated Legacy Composition |
| :--- | :---: | :--- |
| `public/audio/asmr_epic_transformation.wav` | 4.04 MB (4,233,644 B) | `EpicTransformation.tsx` |
| `public/audio/asmr_generator_progression.wav` | 4.04 MB (4,233,644 B) | `GeneratorProgression.tsx` |
| `public/audio/asmr_pump_progression.wav` | 3.87 MB (4,057,244 B) | `PumpProgression.tsx` |
| `public/audio/asmr_pump_progression.mp3` | 0.53 MB (553,631 B) | `PumpProgression.tsx` |
| `public/audio/asmr_transformation.wav` | 4.04 MB (4,233,644 B) | `MechanicalTransformation.tsx` |
| **Subtotal** | **16.51 MB (5 files)** | **Safe to move to `_archive/legacy_audio/`** |

---

### 7. Bundles, Temporary Build Artifacts & Bytecode Caches

- `generate_video/remotion_studio/build/`:
  - Contains 234 files totaling **124.07 MB** (`18.8 MB` JS chunks, `22.6 MB` source maps, and `87.7 MB` duplicate WAV files copied from `public/audio/`).
  - Already declared in `.gitignore` (line 6).
  - Safe action: Delete directory.
- `__pycache__/` and orphaned bytecode:
  - `generate_video/remotion_studio/__pycache__/test_solver_stack.cpython-314.pyc` (15,469 B) — **Orphaned**: `test_solver_stack.py` no longer exists.
  - `generate_video/remotion_studio/scripts/__pycache__/*.pyc` (2 files, 68,218 B).
  - Safe action: Delete bytecode caches.

---

### 8. Deliverables & Root Workspace Duplicate
- `remotions_renders/PressProgression.mp4` (34.87 MB) in the workspace root is a byte-for-byte duplicate of `generate_video/remotion_studio/output/PressProgression.mp4`.
- The 3 finished videos currently in `output/` (`HammerProgression.mp4` [15.4 MB], `PressProgression.mp4` [34.8 MB], `ShredderProgression.mp4` [12.8 MB]) should be relocated to their respective per-project folders (`output/hammer/`, `output/press/`, `output/shredder/`) to satisfy `remotion_cli.py list-projects`.

---

## Safe Cleanup Plan

To prevent accidental data loss, all non-temporary files will be moved into an organized archive directory:  
`generate_video/remotion_studio/_archive/`

### Archive Structure
```text
generate_video/remotion_studio/_archive/
├── test_frames/         # 8 root loose PNGs + 14 output test stills (28.6 MB)
├── inspections/         # 12 environment inspect sheets (19.4 MB)
├── legacy_code/         # _legacy/ (17 files) and src/_legacy/ (74 files) (0.88 MB)
├── legacy_scripts/      # 5 .ps1 contact sheet scripts + 10 redundant asmr scripts (0.30 MB)
├── colab/               # export_colab_bundle.py, remotion_gpu_render.ipynb, run_render.py (0.02 MB)
└── legacy_audio/        # 5 unreferenced legacy audio files (16.5 MB)
```

### Deletions (Zero-Risk Recreatable Files)
1. Delete `generate_video/remotion_studio/build/` (124 MB)
2. Delete `generate_video/remotion_studio/**/__pycache__/` (83.6 KB)
3. Delete root workspace duplicate `remotions_renders/PressProgression.mp4` (34.87 MB)

### Relocations (Project Deliverables)
1. Move `output/HammerProgression.mp4` $\to$ `output/hammer/HammerProgression.mp4`
2. Move `output/PressProgression.mp4` $\to$ `output/press/PressProgression.mp4`
3. Move `output/ShredderProgression.mp4` $\to$ `output/shredder/ShredderProgression.mp4`

---

## Safety Validation Matrix

| Target Component | Impact of Archival | Verification Performed |
| :--- | :--- | :--- |
| `src/projects/*` | Zero impact | All 117 TS/TSX files audited; 0 imports of `_legacy` or redundant scripts. |
| `src/Root.tsx` | Zero impact | Only references active modular projects and `@shared/previews/*`. |
| `remotion_cli.py` | Zero impact | `remotion_cli.py` already ignores `_legacy` and uses `compose_asmr.py`, `check_collisions.ts`, `check_sync.ts`, `scaffold_new_video.py`. |
| `TypeScript Compiler` | Zero impact | `npx tsc --noEmit` exits with code 0 (`tsconfig.json` already excludes `_legacy`). |
| `Audio Foley Library` | Zero impact | 162 CC0 WAV files in `public/audio/foley/` remain 100% untouched. |
