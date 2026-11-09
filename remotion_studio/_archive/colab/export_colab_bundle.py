#!/usr/bin/env python3
"""
Packages remotion_studio into a lightweight zip ready for Google Colab GPU rendering.
Excludes node_modules, build artifacts, and output mp4s to keep upload fast.
"""

import os
import zipfile

STUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_ZIP = os.path.join(STUDIO_DIR, "remotion_studio_colab.zip")

print("📦 Packaging remotion_studio for Google Colab GPU...")
with zipfile.ZipFile(OUT_ZIP, "w", zipfile.ZIP_DEFLATED) as z:
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

size_mb = os.path.getsize(OUT_ZIP) / (1024 * 1024)
print(f"✅ Created: {OUT_ZIP} ({size_mb:.1f} MB)")
