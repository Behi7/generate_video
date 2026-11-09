#!/usr/bin/env python3
"""
run_render.py: Smart Render Runner executed on the GPU worker.
Tries hardware GPU EGL acceleration first; falls back gracefully to swangle if needed.
"""
import sys
import os
import subprocess

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 run_render.py <composition> <output_path>")
        sys.exit(1)

    composition = sys.argv[1]
    out_mp4 = sys.argv[2]
    cwd = os.path.dirname(os.path.abspath(__file__))

    # Candidate GL backends in order of speed and stability
    gl_candidates = ["angle-egl", "egl", "swangle"]

    for gl in gl_candidates:
        print(f"🎬 Attempting render with --gl={gl}...")
        cmd = [
            "xvfb-run", "-a",
            "npx", "remotion", "render",
            "src/index.ts",
            composition,
            out_mp4,
            "--concurrency=2",
            f"--gl={gl}",
            "--log=info"
        ]
        res = subprocess.run(cmd, cwd=cwd, text=True)
        if res.returncode == 0 and os.path.exists(out_mp4) and os.path.getsize(out_mp4) > 1000:
            print(f"✅ Render succeeded with --gl={gl}!")
            sys.exit(0)
        else:
            print(f"⚠️ Render with --gl={gl} failed. Trying next backend...")

    print("❌ All OpenGL backends failed.")
    sys.exit(1)

if __name__ == "__main__":
    main()
