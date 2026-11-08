#!/usr/bin/env python3
"""
Root forwarding wrapper for Remotion Studio CLI.
"""
import os
import sys

studio_cli = os.path.join(os.path.dirname(os.path.abspath(__file__)), "remotion_studio", "remotion_cli.py")
os.execv(sys.executable, [sys.executable, studio_cli] + sys.argv[1:])

