#!/usr/bin/env python3
"""
ingest_foley_library.py
Downloads and converts over 150+ CC0 / Public Domain studio sound effects
into remotion_studio/public/audio/foley/ organized by material and mechanism.
All files converted to 44.1 kHz 16-bit PCM stereo WAV.
"""

import os
import sys
import json
import urllib.request
import subprocess
import shutil

STUDIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLEY_DIR = os.path.join(STUDIO_DIR, "public", "audio", "foley")
TEMP_DIR = os.path.join(STUDIO_DIR, "public", "audio", "_tmp_foley")

# Sources: Open Godot CC0 mirrors of Kenney Audio assets
SOURCES = [
    {
        "repo": "Boyquotes/kenney-impact-sounds-for-godot",
        "branch": "master",
        "path": "addons/kenney%20impact%20sounds",
        "raw_base": "https://raw.githubusercontent.com/Boyquotes/kenney-impact-sounds-for-godot/master/addons/kenney%20impact%20sounds/",
        "mapping": {
            "impact_metal": "materials/metal",
            "impact_plate": "materials/metal",
            "impact_tin": "materials/metal",
            "impact_wood": "materials/wood",
            "impact_plank": "materials/wood",
            "impact_glass": "materials/glass",
            "impact_mining": "materials/stone",
            "impact_soft": "materials/soft_plastic",
            "footstep_concrete": "materials/stone",
        }
    },
    {
        "repo": "Boyquotes/kenney-sci-fi-sounds-for-godot",
        "branch": "master",
        "path": "addons/kenney%20sci-fi%20sounds",
        "raw_base": "https://raw.githubusercontent.com/Boyquotes/kenney-sci-fi-sounds-for-godot/master/addons/kenney%20sci-fi%20sounds/",
        "mapping": {
            "engine_circular": "mechanisms/motors",
            "space_engine": "mechanisms/motors",
            "thruster_fire": "mechanisms/motors",
            "laser_large": "mechanisms/scifi_laser",
            "force_field": "mechanisms/scifi_laser",
            "explosion_crunch": "impacts/explosions",
            "low_frequency_explosion": "impacts/explosions",
            "door_close": "impacts/locks",
        }
    },
    {
        "repo": "Calinou/kenney-interface-sounds",
        "branch": "master",
        "path": "addons/kenney_interface_sounds",
        "raw_base": "https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/",
        "mapping": {
            "switch": "mechanisms/switches",
            "toggle": "mechanisms/switches",
            "click": "mechanisms/switches",
            "tick": "mechanisms/switches",
            "drop": "impacts/locks",
        }
    }
]

def fetch_file_list(repo, path):
    url = f"https://api.github.com/repos/{repo}/contents/{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Remotion-Foley-Ingest)"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  ⚠️ Warning fetching {repo}: {e}")
        return []

def main():
    print("🎧 Initializing Foley Audio Ingestion Engine...")
    os.makedirs(FOLEY_DIR, exist_ok=True)
    os.makedirs(TEMP_DIR, exist_ok=True)

    manifest = {}
    total_downloaded = 0

    for src in SOURCES:
        print(f"📦 Fetching manifest from {src['repo']}...")
        files = fetch_file_list(src['repo'], src['path'])
        for f in files:
            name = f['name']
            if not (name.endswith(".ogg") or name.endswith(".wav")):
                continue

            target_folder = None
            for prefix, folder in src['mapping'].items():
                if name.startswith(prefix):
                    target_folder = folder
                    break

            if not target_folder:
                continue

            out_dir = os.path.join(FOLEY_DIR, target_folder)
            os.makedirs(out_dir, exist_ok=True)

            clean_name = os.path.splitext(name)[0] + ".wav"
            out_wav = os.path.join(out_dir, clean_name)

            if os.path.exists(out_wav):
                manifest.setdefault(target_folder, []).append(clean_name)
                total_downloaded += 1
                continue

            # Download raw file to temp
            tmp_src = os.path.join(TEMP_DIR, name)
            raw_url = src['raw_base'] + name
            try:
                urllib.request.urlretrieve(raw_url, tmp_src)
                # Convert to 44.1kHz 16-bit PCM Stereo WAV via ffmpeg
                cmd = [
                    "ffmpeg", "-y", "-i", tmp_src,
                    "-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le",
                    out_wav
                ]
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                os.remove(tmp_src)
                manifest.setdefault(target_folder, []).append(clean_name)
                total_downloaded += 1
            except Exception as e:
                print(f"  ! Error downloading/converting {name}: {e}")

    # Clean up temp
    shutil.rmtree(TEMP_DIR, ignore_errors=True)

    # Save manifest
    manifest_path = os.path.join(FOLEY_DIR, "foley_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✅ Successfully ingested and converted {total_downloaded} CC0 Foley WAV samples!")
    print(f"📄 Manifest written to: {manifest_path}")

    for cat, flist in sorted(manifest.items()):
        print(f"  • {cat}: {len(flist)} samples")

if __name__ == "__main__":
    main()
