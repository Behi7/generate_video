#!/usr/bin/env python3
"""
Remotion Studio CLI: Operator Dispatcher for React + Three.js Viral Video Production.
Provides fast still frame previews, 8-frame QC contact sets, and 30 FPS master rendering
for the canonical 1160-frame (38.67s @ 30 FPS) Triple-A architecture.

MODULAR PROJECT ARCHITECTURE:
All outputs (stills, QC frames, inspect sheets, PC bundles, rendered MP4s) are automatically
isolated and saved to their respective project directory:
  output/<project>/stills/
  output/<project>/qc/
  output/<project>/inspect/
  output/<project>/pc_bundle/
  output/<project>/<composition>_30fps.mp4
"""

import os
import sys
import argparse
import subprocess
import json
import re

STUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECTS_DIR = os.path.join(STUDIO_DIR, "src", "projects")
OUTPUT_DIR = os.path.join(STUDIO_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
CPU_CORES = min(2, os.cpu_count() or 2)


def run_command(cmd):
    is_win = sys.platform == "win32"
    res = subprocess.run(cmd, cwd=STUDIO_DIR, capture_output=True, text=True, shell=is_win)
    return res


def resolve_project(name_or_comp):
    """
    Resolves composition ID or project slug to (project_name, project_dir, project_output_dir).
    Supports:
      - Direct project name: 'hammer' -> 'hammer'
      - Full progression composition: 'HammerProgression' -> 'hammer'
      - Inspection composition: 'HammerTier1Inspection' -> 'hammer'
      - Generic names: 'Tier1Inspection' -> 'shredder'
    """
    if not name_or_comp:
        return ("_misc", None, os.path.join(OUTPUT_DIR, "_misc"))

    clean_name = name_or_comp.strip()
    lower_name = clean_name.lower()

    # 1. Exact project directory match in src/projects/
    if os.path.isdir(PROJECTS_DIR):
        for p in os.listdir(PROJECTS_DIR):
            p_dir = os.path.join(PROJECTS_DIR, p)
            if not os.path.isdir(p_dir):
                continue
            if p.lower() == lower_name:
                out_dir = os.path.join(OUTPUT_DIR, p)
                os.makedirs(out_dir, exist_ok=True)
                return (p, p_dir, out_dir)

    # 2. Match composition prefix or project.json
    if os.path.isdir(PROJECTS_DIR):
        for p in os.listdir(PROJECTS_DIR):
            p_dir = os.path.join(PROJECTS_DIR, p)
            if not os.path.isdir(p_dir):
                continue
            # Composition starts with project name (e.g. HammerProgression -> hammer)
            if lower_name.startswith(p.lower()):
                out_dir = os.path.join(OUTPUT_DIR, p)
                os.makedirs(out_dir, exist_ok=True)
                return (p, p_dir, out_dir)
            # Check project.json
            p_json = os.path.join(p_dir, "project.json")
            if os.path.exists(p_json):
                try:
                    with open(p_json, "r") as f:
                        data = json.load(f)
                        if data.get("compositionId") == clean_name or data.get("id") == lower_name:
                            out_dir = os.path.join(OUTPUT_DIR, p)
                            os.makedirs(out_dir, exist_ok=True)
                            return (p, p_dir, out_dir)
                except Exception:
                    pass
            # Check compositions folder
            comps_dir = os.path.join(p_dir, "compositions")
            if os.path.isdir(comps_dir):
                for c_file in os.listdir(comps_dir):
                    if c_file.endswith(".tsx") and c_file[:-4].lower() == lower_name:
                        out_dir = os.path.join(OUTPUT_DIR, p)
                        os.makedirs(out_dir, exist_ok=True)
                        return (p, p_dir, out_dir)

    # 3. Known project mapping fallbacks
    if "hammer" in lower_name:
        p = "hammer"
    elif "shredder" in lower_name or "tier" in lower_name:
        p = "shredder"
    elif "crusher" in lower_name:
        p = "crusher"
    elif "drill" in lower_name or "carbide" in lower_name:
        p = "drill"
    elif "press" in lower_name:
        p = "press"
    elif (
        "environment" in lower_name
        or "oildrum" in lower_name
        or "drum" in lower_name
        or "floor" in lower_name
        or "concrete" in lower_name
        or "bucket" in lower_name
        or "pallet" in lower_name
        or "hose" in lower_name
        or "brick" in lower_name
        or "wall" in lower_name
        or "blast" in lower_name
    ):
        p = "environment"
    else:
        p = "_misc"

    out_dir = os.path.join(OUTPUT_DIR, p)
    p_dir = os.path.join(PROJECTS_DIR, p) if os.path.isdir(os.path.join(PROJECTS_DIR, p)) else None
    os.makedirs(out_dir, exist_ok=True)
    return (p, p_dir, out_dir)


def resolve_composition_id(name_or_comp):
    """If user passes a project slug like 'hammer', resolves to its canonical progression composition ID."""
    proj_name, proj_dir, _ = resolve_project(name_or_comp)
    if proj_dir and os.path.exists(os.path.join(proj_dir, "project.json")):
        try:
            with open(os.path.join(proj_dir, "project.json"), "r") as f:
                data = json.load(f)
                if name_or_comp.lower() == proj_name.lower():
                    return data.get("compositionId", name_or_comp)
        except Exception:
            pass
    return name_or_comp


def get_project_output_path(composition, category, filename):
    """Returns an absolute destination path inside output/<project>/<category>/<filename>."""
    proj_name, _, proj_out_dir = resolve_project(composition)
    cat_dir = os.path.join(proj_out_dir, category)
    os.makedirs(cat_dir, exist_ok=True)
    return os.path.join(cat_dir, filename)


def cmd_still(args):
    """Renders a single frame to PNG (0.5s - 2s) for visual critique."""
    composition = resolve_composition_id(args.composition)
    frame = args.frame_pos if getattr(args, "frame_pos", None) is not None else args.frame
    out_file = (
        os.path.abspath(args.output)
        if args.output
        else get_project_output_path(composition, "stills", f"{composition}_frame_{frame}.png")
    )

    cmd = [
        "npx",
        "remotion",
        "still",
        "src/index.ts",
        composition,
        out_file,
        f"--frame={frame}",
        "--log=warn",
    ]
    print(f"📸 Rendering frame {frame} of {composition} to PNG: {out_file}...")
    res = run_command(cmd)

    if res.returncode != 0:
        print(
            json.dumps(
                {"success": False, "error": res.stderr, "stdout": res.stdout}, indent=2
            )
        )
        sys.exit(1)

    print(json.dumps({"success": True, "image_path": out_file}, indent=2))


def cmd_qc(args):
    """Renders an 8-frame forensic audit set across all 4 tiers of the 1160-frame timeline."""
    composition = resolve_composition_id(args.composition)
    # Checkpoints across 4 tiers (Assembly, Startup, Operating, Climax)
    # Tier 1: 50, 200
    # Tier 2: 330, 480
    # Tier 3: 620, 770
    # Tier 4: 950, 1080
    frames = [50, 200, 330, 480, 620, 770, 950, 1080]
    out_paths = []

    proj_name, _, _ = resolve_project(composition)
    print(f"🔍 Generating Forensic QC Frame Set (8 checkpoints) for {composition} in project '{proj_name}'...")
    for f in frames:
        out_file = get_project_output_path(composition, "qc", f"qc_{composition}_f{f}.png")
        cmd = [
            "npx",
            "remotion",
            "still",
            "src/index.ts",
            composition,
            out_file,
            f"--frame={f}",
            "--log=warn",
        ]
        res = run_command(cmd)
        if res.returncode == 0:
            out_paths.append(out_file)
            print(f"  + Frame {f} -> {out_file}")
        else:
            print(f"  ! Error on frame {f}: {res.stderr}")

    print(
        json.dumps(
            {
                "success": len(out_paths) == len(frames),
                "project": proj_name,
                "qc_frames": out_paths,
            },
            indent=2,
        )
    )


def get_active_colab_url(explicit_url=None):
    """Auto-detects active Colab GPU URL via zero-touch channel or cache, verifying with /ping."""
    import urllib.request
    import urllib.error

    SYNC_CHANNEL = "remotion_gpu_sync_98a7f14b62e0c"
    candidates = []

    if explicit_url:
        candidates.append(explicit_url.rstrip("/"))
    if os.environ.get("COLAB_GPU_URL"):
        candidates.append(os.environ.get("COLAB_GPU_URL").rstrip("/"))

    # Check Zero-Touch Sync Channel
    try:
        req = urllib.request.Request(
            f"https://ntfy.sh/{SYNC_CHANNEL}/raw?poll=1",
            headers={"User-Agent": "Mozilla/5.0"},
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            lines = [
                l.strip()
                for l in resp.read().decode().splitlines()
                if l.strip().startswith("http")
            ]
            if lines:
                candidates.append(lines[-1].rstrip("/"))
    except Exception:
        pass

    # Check cached .colab_url
    url_cache_file = os.path.join(STUDIO_DIR, ".colab_url")
    if os.path.exists(url_cache_file):
        try:
            with open(url_cache_file, "r") as f:
                c = f.read().strip()
                if c.startswith("http"):
                    candidates.append(c.rstrip("/"))
        except Exception:
            pass

    # Test candidates in order
    for cand in candidates:
        try:
            with urllib.request.urlopen(f"{cand}/ping", timeout=3) as chk:
                if chk.status == 200:
                    with open(url_cache_file, "w") as f:
                        f.write(cand)
                    return cand
        except Exception:
            continue

    return None


def cmd_render_local(args):
    """Renders locally on CPU using Remotion."""
    composition = resolve_composition_id(args.composition)
    proj_name, _, proj_out = resolve_project(composition)
    out_file = (
        os.path.abspath(args.output)
        if args.output
        else os.path.join(proj_out, f"{composition}_30fps.mp4")
    )

    cmd = [
        "npx",
        "remotion",
        "render",
        "src/index.ts",
        composition,
        out_file,
        f"--concurrency={CPU_CORES}",
        "--log=info",
    ]
    print(f"🚀 Rendering master 30 FPS video for {composition} on CPU (1160 frames) -> {out_file}...")
    res = run_command(cmd)

    if res.returncode != 0:
        print(
            json.dumps(
                {"success": False, "error": res.stderr, "stdout": res.stdout}, indent=2
            )
        )
        sys.exit(1)

    print(json.dumps({"success": True, "project": proj_name, "video_path": out_file}, indent=2))


def cmd_export_pc(args):
    """Packages all composition assets and scripts for 1-click rendering on user's powerful PC."""
    import zipfile
    composition = resolve_composition_id(args.composition)
    proj_name, _, proj_out = resolve_project(composition)

    bundle_name = f"{composition}_pc_bundle.zip"
    pc_bundle_dir = os.path.join(proj_out, "pc_bundle")
    os.makedirs(pc_bundle_dir, exist_ok=True)
    bundle_path = os.path.join(pc_bundle_dir, bundle_name)

    print(f"📦 Packaging {composition} (Project: '{proj_name}') for local PC GPU rendering...")

    render_bat_content = f"""@echo off
echo ========================================================
echo  Rendering {composition} on NVIDIA RTX 4060 (DirectX / ANGLE)
echo  Hardware: AMD Ryzen 7 7435HS (16 threads) + RTX 4060 8GB
echo  Project: {proj_name}
echo ========================================================
if not exist node_modules (
    echo [SETUP] Installing dependencies (first run only)...
    call npm install
)
if not exist output\\{proj_name} mkdir output\\{proj_name}
echo [RENDER] Launching 10 parallel GPU streams on RTX 4060...
call npx remotion render src/index.ts {composition} output/{proj_name}/{composition}.mp4 --gl=angle --concurrency=10
if exist output\\{proj_name}\\{composition}.mp4 (
    echo.
    echo ========================================================
    echo  [OK] Master 1080x1920 video rendered in ~20s!
    echo ========================================================
    start output\\{proj_name}\\{composition}.mp4
) else (
    echo.
    echo [ERROR] Render failed. See console output above.
)
pause
"""
    preview_bat_content = f"""@echo off
echo Opening Remotion Studio Live Web Preview...
if not exist node_modules (
    echo [SETUP] Installing dependencies (first run only)...
    call npm install
)
call npx remotion preview src/index.ts
"""

    with zipfile.ZipFile(bundle_path, "w", zipfile.ZIP_DEFLATED) as z:
        for folder in ["src", "public"]:
            for root, dirs, files in os.walk(os.path.join(STUDIO_DIR, folder)):
                dirs[:] = [d for d in dirs if d != "_legacy"]
                for f in files:
                    full = os.path.join(root, f)
                    rel = os.path.relpath(full, STUDIO_DIR)
                    z.write(full, rel)
        for root_file in ["package.json", "tsconfig.json", "remotion.config.ts"]:
            full = os.path.join(STUDIO_DIR, root_file)
            if os.path.exists(full):
                z.write(full, root_file)
        z.writestr("render.bat", render_bat_content)
        z.writestr("preview.bat", preview_bat_content)

    # Also keep a copy directly in project output directory for convenience
    convenience_path = os.path.join(proj_out, bundle_name)
    try:
        import shutil
        shutil.copy2(bundle_path, convenience_path)
    except Exception:
        pass

    size_mb = os.path.getsize(bundle_path) / (1024 * 1024)
    print(f"✅ Ready! PC Package created: {bundle_path} ({size_mb:.1f} MB)")
    print(f"\n💻 How to render on your powerful PC (20-30 seconds):")
    print(f"  1. Download/Copy '{bundle_path}' to your PC and unpack it (or run from your local repository).")
    print(f"  2. Run render.bat (or in PowerShell/CMD):")
    print(f"     npx remotion render src/index.ts {composition} output/{proj_name}/{composition}.mp4 --gl=angle --concurrency=10")
    print(f"  3. To preview in real-time in browser:")
    print(f"     npx remotion preview src/index.ts")
    return bundle_path


def cmd_render(args):
    """Unified Smart Render: checks Colab GPU -> user PC package -> local CPU only if forced."""
    if getattr(args, "cpu", False):
        print("🖥️ [--cpu flag active] Rendering directly on local 2-core CPU...")
        cmd_render_local(args)
        return

    print("🔍 [Smart Render] Checking for active Colab Tesla T4 GPU...")
    active_gpu_url = get_active_colab_url(getattr(args, "url", None))

    if active_gpu_url:
        print(f"⚡ [Smart Render] Active Tesla T4 GPU found at {active_gpu_url}! Routing render to cloud GPU...")
        cmd_render_cloud(args, active_url=active_gpu_url)
    else:
        print("⚡ [Smart Render] Cloud GPU is offline.")
        print("📦 2-Core Server CPU render takes ~1-2 hours. Packaging files for instant local PC render instead...")
        cmd_export_pc(args)
        print("\n💡 If you still want to render on this cloud server's CPU in background, run:")
        print(f"   python3 remotion_cli.py render {args.composition} --cpu")


def cmd_render_cloud(args, active_url=None):
    """Renders master MP4 using remote Google Colab NVIDIA Tesla T4 GPU."""
    import time
    import shutil
    import zipfile
    import urllib.request
    import urllib.error
    import uuid

    composition = resolve_composition_id(args.composition)
    proj_name, _, proj_out = resolve_project(composition)
    url = active_url or get_active_colab_url(getattr(args, "url", None))

    if not url:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "No active Colab GPU found. Please press Run in your Colab notebook, or provide --url",
                },
                indent=2,
            )
        )
        sys.exit(1)

    url = url.rstrip("/")
    url_cache_file = os.path.join(STUDIO_DIR, ".colab_url")
    with open(url_cache_file, "w") as f:
        f.write(url)

    print(f"📡 Verified connection to Colab GPU: {url} (Project: '{proj_name}')")

    # Package project bundle
    print(f"📦 Packaging current project bundle for {composition}...")
    bundle_path = os.path.join(STUDIO_DIR, "remotion_studio_colab.zip")
    with zipfile.ZipFile(bundle_path, "w", zipfile.ZIP_DEFLATED) as z:
        for folder in ["src", "public"]:
            for root, dirs, files in os.walk(os.path.join(STUDIO_DIR, folder)):
                dirs[:] = [d for d in dirs if d != "_legacy"]
                for f in files:
                    full = os.path.join(root, f)
                    rel = os.path.relpath(full, STUDIO_DIR)
                    z.write(full, rel)
        for root_file in ["package.json", "tsconfig.json", "remotion.config.ts", "run_render.py"]:
            full = os.path.join(STUDIO_DIR, root_file)
            if os.path.exists(full):
                z.write(full, root_file)

    size_mb = os.path.getsize(bundle_path) / (1024 * 1024)
    print(f"🚀 Uploading bundle ({size_mb:.1f} MB) to Tesla T4 GPU...")

    # Upload via multipart form
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(f'Content-Disposition: form-data; name="composition"\r\n\r\n{composition}\r\n'.encode())
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(f'Content-Disposition: form-data; name="bundle"; filename="{os.path.basename(bundle_path)}"\r\n'.encode())
    body.extend(b"Content-Type: application/zip\r\n\r\n")
    with open(bundle_path, "rb") as bf:
        body.extend(bf.read())
    body.extend(f"\r\n--{boundary}--\r\n".encode())

    req = urllib.request.Request(f"{url}/render", data=bytes(body))
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            init_resp = json.loads(resp.read().decode())
            print(f"🎬 Render job accepted: {init_resp}")
    except Exception as e:
        print(
            json.dumps(
                {"success": False, "error": f"Failed to submit render job: {e}"},
                indent=2,
            )
        )
        sys.exit(1)

    # Poll status until done
    print(f"⏳ Waiting for Tesla T4 GPU rendering to complete...")
    start_time = time.time()
    out_file = (
        os.path.abspath(args.output)
        if args.output
        else os.path.join(proj_out, f"{composition}_master_30fps.mp4")
    )

    while True:
        time.sleep(3)
        elapsed = int(time.time() - start_time)
        try:
            with urllib.request.urlopen(f"{url}/status", timeout=10) as s_resp:
                st = json.loads(s_resp.read().decode())
                state = st.get("state")
                if state in ["rendering", "starting"]:
                    print(f"  ⚡ [{elapsed}s] Rendering in progress on Tesla T4...")
                elif state == "done":
                    print(f"✅ Render finished in {elapsed}s! Downloading master MP4...")
                    break
                elif state == "error":
                    err_msg = st.get("error", "Unknown error")
                    print(
                        json.dumps(
                            {"success": False, "error": f"Remote render failed: {err_msg}", "log": st.get("log")},
                            indent=2,
                        )
                    )
                    sys.exit(1)
                else:
                    print(f"  ⏳ [{elapsed}s] State: {state}")
        except Exception as e:
            print(f"  ⚠️ Status check warning: {e}")

        if elapsed > 1200:  # 20 min safeguard
            print(
                json.dumps(
                    {"success": False, "error": "Remote render timed out after 20m"},
                    indent=2,
                )
            )
            sys.exit(1)

    # Download result
    try:
        with urllib.request.urlopen(f"{url}/download", timeout=60) as d_resp:
            with open(out_file, "wb") as out_f:
                shutil.copyfileobj(d_resp, out_f)
        print(f"🎉 Master MP4 saved to: {out_file}")
    except Exception as e:
        print(
            json.dumps(
                {"success": False, "error": f"Failed to download rendered MP4: {e}"},
                indent=2,
            )
        )
        sys.exit(1)

    if args.shutdown:
        print(f"🛑 Sending shutdown command to Colab to release GPU quotas...")
        try:
            with urllib.request.urlopen(urllib.request.Request(f"{url}/shutdown", data=b""), timeout=5) as sd:
                print("💤 Colab instance unassigned successfully.")
        except Exception as e:
            print(f"⚠️ Shutdown note: {e}")

    print(
        json.dumps(
            {"success": True, "project": proj_name, "video_path": out_file, "render_time_sec": elapsed},
            indent=2,
        )
    )


def cmd_inspect(args):
    """Renders a 4-View (2x2) contact sheet for a 3D asset/machine inspection."""
    from PIL import Image

    composition = args.composition
    if not composition.endswith("Inspection"):
        composition += "Inspection"

    proj_name, _, _ = resolve_project(composition)
    out_file = (
        os.path.abspath(args.output)
        if args.output
        else get_project_output_path(composition, "inspect", f"inspect_{composition}.png")
    )

    print(f"🔬 Rendering 4-View Forensic Contact Sheet for {composition} in project '{proj_name}' -> {out_file}...")
    temp_frames = []

    # Render 4 views: 1: Front, 2: Side, 3: Top, 4: Heroic Iso
    for f in [1, 2, 3, 4]:
        tmp_path = get_project_output_path(composition, "inspect", f"_tmp_{composition}_view_{f}.png")
        cmd = [
            "npx",
            "remotion",
            "still",
            "src/index.ts",
            composition,
            tmp_path,
            f"--frame={f}",
            "--gl=angle",
            "--timeout=90000",
            "--log=warn",
        ]
        res = run_command(cmd)
        if res.returncode != 0:
            print(
                json.dumps(
                    {"success": False, "error": res.stderr, "stdout": res.stdout}, indent=2
                )
            )
            sys.exit(1)
        temp_frames.append(tmp_path)

    # Stitch into 2x2 collage (1080x1080)
    img_w, img_h = 540, 540
    grid_img = Image.new("RGB", (1080, 1080), color=(10, 15, 26))

    coords = [(0, 0), (img_w, 0), (0, img_h), (img_w, img_h)]
    for idx, tmp_path in enumerate(temp_frames):
        with Image.open(tmp_path) as im:
            resized = im.resize((img_w, img_h), Image.Resampling.LANCZOS)
            grid_img.paste(resized, coords[idx])
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    grid_img.save(out_file, "PNG")
    print(json.dumps({"success": True, "project": proj_name, "inspection_image": out_file}, indent=2))


def cmd_check_collisions(args):
    """Universal Automated 3D Collision & Interpenetration Interceptor using Three.js Box3."""
    composition = resolve_composition_id(args.composition)
    proj_name, _, proj_out = resolve_project(composition)
    col_out_dir = os.path.join(proj_out, "collisions")
    os.makedirs(col_out_dir, exist_ok=True)

    cmd = [
        "npx",
        "tsx",
        "scripts/check_collisions.ts",
        composition,
    ]
    if getattr(args, "json", False):
        cmd.append("--json")
    if getattr(args, "max_overlap", None) is not None:
        cmd.append(f"--max-overlap={args.max_overlap}")
    if getattr(args, "tier", None) is not None:
        cmd.append(f"--tier={args.tier}")

    print(f"💥 Running 3D Collision Audit for {composition} (Project: '{proj_name}')...")
    res = subprocess.run(cmd, cwd=STUDIO_DIR)
    sys.exit(res.returncode)


def cmd_check_sync(args):
    """Universal Automated Camera-Physics-Audio Synchronization Interceptor."""
    composition = resolve_composition_id(args.composition)
    proj_name, _, _ = resolve_project(composition)

    cmd = [
        "npx",
        "tsx",
        "scripts/check_sync.ts",
        composition,
    ]
    if getattr(args, "json", False):
        cmd.append("--json")

    print(f"⏱️  Running Camera-Physics-Audio Sync Audit for {composition} (Project: '{proj_name}')...")
    res = subprocess.run(cmd, cwd=STUDIO_DIR)
    sys.exit(res.returncode)


def cmd_list_projects(args):
    """Lists all modular projects found in src/projects/ and their status."""
    if not os.path.isdir(PROJECTS_DIR):
        print(json.dumps({"projects": []}, indent=2))
        return

    projects = []
    for p in sorted(os.listdir(PROJECTS_DIR)):
        p_dir = os.path.join(PROJECTS_DIR, p)
        if not os.path.isdir(p_dir):
            continue
        p_json = os.path.join(p_dir, "project.json")
        meta = {"id": p, "name": p.capitalize(), "path": p_dir}
        if os.path.exists(p_json):
            try:
                with open(p_json, "r") as f:
                    meta.update(json.load(f))
            except Exception:
                pass

        # Check outputs
        out_dir = os.path.join(OUTPUT_DIR, p)
        qc_count = len(os.listdir(os.path.join(out_dir, "qc"))) if os.path.isdir(os.path.join(out_dir, "qc")) else 0
        inspect_count = len(os.listdir(os.path.join(out_dir, "inspect"))) if os.path.isdir(os.path.join(out_dir, "inspect")) else 0
        renders = [f for f in os.listdir(out_dir) if f.endswith(".mp4")] if os.path.isdir(out_dir) else []

        meta["outputs"] = {
            "output_dir": out_dir,
            "qc_frames": qc_count,
            "inspect_sheets": inspect_count,
            "has_master_mp4": len(renders) > 0,
            "renders": renders,
        }
        projects.append(meta)

    if getattr(args, "json", False):
        print(json.dumps({"projects": projects}, indent=2))
    else:
        print(f"\n📂 Registered Modular Projects ({len(projects)}):\n")
        for proj in projects:
            print(f"  🔹 {proj.get('id', '')} : {proj.get('name', '')}")
            print(f"     Main Composition: {proj.get('compositionId', 'N/A')}")
            print(f"     Output Folder:    {proj['outputs']['output_dir']}")
            print(f"     QC Frames:        {proj['outputs']['qc_frames']} | Inspect Sheets: {proj['outputs']['inspect_sheets']} | Master MP4: {'✅' if proj['outputs']['has_master_mp4'] else '❌'}")
            print()


def cmd_create_project(args):
    """Scaffolds a new modular project workspace inside src/projects/<name>/ with isolated outputs."""
    raw_name = args.name
    slug = re.sub(r"[_\-\s]+", "_", raw_name.lower()).strip("_")
    pascal_name = "".join(word.capitalize() for word in re.split(r"[_\-\s]+", raw_name))
    if not pascal_name.endswith("Progression"):
        pascal_name += "Progression"
    theme_base = pascal_name.replace("Progression", "")

    proj_dir = os.path.join(PROJECTS_DIR, slug)
    if os.path.exists(proj_dir):
        print(f"⚠️ Project '{slug}' already exists at {proj_dir}")
        return

    # Call scaffold script
    scaffold_script = os.path.join(STUDIO_DIR, "scripts", "scaffold_new_video.py")
    res = subprocess.run([sys.executable, scaffold_script, slug], cwd=STUDIO_DIR)
    if res.returncode == 0:
        print(f"\n🎉 Successfully created modular project: {slug}")
        print(f"   Source:  {proj_dir}")
        print(f"   Outputs: {os.path.join(OUTPUT_DIR, slug)}")
    else:
        print(f"❌ Failed to create project: code {res.returncode}")


def main():
    parser = argparse.ArgumentParser(description="Remotion Studio Operator CLI (Modular Project Architecture)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # list-projects
    p_list = subparsers.add_parser("list-projects", help="List all registered modular projects and their output status")
    p_list.add_argument("--json", action="store_true", help="Output JSON format")

    # create-project
    p_create = subparsers.add_parser("create-project", help="Scaffold a new modular project with isolated outputs")
    p_create.add_argument("name", help="Project name (e.g. plasma_cutter, hydraulic_crane)")

    # inspect (4-View Contact Sheet)
    p_inspect = subparsers.add_parser("inspect", help="Render 4-View (2x2) Contact Sheet for 3D Asset Inspection")
    p_inspect.add_argument("composition", default="HammerTier1Inspection", nargs="?", help="Inspection Composition ID or project name")
    p_inspect.add_argument("-o", "--output", help="Output PNG path override")

    # still
    p_still = subparsers.add_parser("still", help="Render a single frame PNG preview")
    p_still.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")
    p_still.add_argument("frame_pos", nargs="?", type=int, default=None, help="Frame index to render (positional)")
    p_still.add_argument("--frame", type=int, default=100, help="Frame index to render")
    p_still.add_argument("-o", "--output", help="Output PNG path override")

    # qc
    p_qc = subparsers.add_parser("qc", help="Render 8-keyframe forensic contact set for Critic inspection")
    p_qc.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")

    # render (Smart: Cloud GPU if online, CPU fallback if offline)
    p_render = subparsers.add_parser("render", help="Smart Render master MP4 (Cloud GPU first, local CPU fallback)")
    p_render.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")
    p_render.add_argument("-o", "--output", help="Output MP4 path override")
    p_render.add_argument("--cpu", action="store_true", help="Force local CPU rendering without checking cloud GPU")
    p_render.add_argument("--url", help="Colab Cloudflare tunnel URL override")
    p_render.add_argument("--shutdown", action="store_true", help="Automatically unassign Colab instance when finished")

    # render-cloud
    p_cloud = subparsers.add_parser("render-cloud", help="Render on remote Google Colab NVIDIA Tesla T4 GPU")
    p_cloud.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")
    p_cloud.add_argument("--url", help="Colab Cloudflare tunnel URL (e.g. https://xxx.trycloudflare.com)")
    p_cloud.add_argument("-o", "--output", help="Output MP4 path override")
    p_cloud.add_argument("--shutdown", action="store_true", help="Automatically unassign Colab instance when finished to preserve GPU quota")

    # export-pc (Package for instant rendering on local PC / RTX GPU)
    p_export = subparsers.add_parser("export-pc", help="Package project for instant rendering on local PC / RTX GPU")
    p_export.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")

    # check-collisions (Universal 3D Collision Interceptor)
    p_col = subparsers.add_parser("check-collisions", help="Universal Automated 3D Collision Interceptor (Three.js Box3)")
    p_col.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")
    p_col.add_argument("--json", action="store_true", help="Output raw structured JSON")
    p_col.add_argument("--max-overlap", type=float, default=10.0, help="Max allowed overlap percentage between toolhead and specimen (default: 10.0%%)")
    p_col.add_argument("--tier", type=int, default=None, help="Specific tier to audit (1, 2, 3, or 4)")

    # check-sync (Universal Synchronization Interceptor)
    p_sync = subparsers.add_parser("check-sync", help="Universal Automated Camera-Physics-Audio Synchronization Interceptor")
    p_sync.add_argument("composition", default="HammerProgression", nargs="?", help="Composition ID or project name")
    p_sync.add_argument("--json", action="store_true", help="Output raw structured JSON")

    args = parser.parse_args()
    if args.command == "list-projects":
        cmd_list_projects(args)
    elif args.command == "create-project":
        cmd_create_project(args)
    elif args.command == "inspect":
        cmd_inspect(args)
    elif args.command == "check-collisions":
        cmd_check_collisions(args)
    elif args.command == "check-sync":
        cmd_check_sync(args)
    elif args.command == "still":
        cmd_still(args)
    elif args.command == "qc":
        cmd_qc(args)
    elif args.command == "export-pc":
        cmd_export_pc(args)
    elif args.command == "render":
        cmd_render(args)
    elif args.command == "render-cloud":
        cmd_render_cloud(args)


if __name__ == "__main__":
    main()
