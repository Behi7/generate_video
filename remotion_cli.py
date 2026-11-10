#!/usr/bin/env python3
"""
Root forwarding wrapper for Remotion Studio CLI.
"""
import os
import sys
import subprocess

studio_cli = os.path.join(os.path.dirname(os.path.abspath(__file__)), "remotion_studio", "remotion_cli.py")
studio_dir = os.path.dirname(studio_cli)
res = subprocess.run([sys.executable, studio_cli] + sys.argv[1:], cwd=studio_dir)
sys.exit(res.returncode)
