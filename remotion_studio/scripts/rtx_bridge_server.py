#!/usr/bin/env python3
"""
rtx_bridge_server.py: Autonomous Zero-Touch GPU Render Bridge.
Exposes:
- POST /api/queue_job   -> Server pushes a render job and waits synchronously until done
- GET  /api/poll_job    -> Windows RTX 4060 daemon polls this every 2 seconds
- GET  /bundle.zip      -> Windows daemon downloads fresh src/ & public/
- POST /api/complete    -> Windows daemon uploads master MP4 and marks job DONE
"""

import os
import io
import time
import zipfile
import json
import http.server
import socketserver
import urllib.parse

STUDIO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(STUDIO_DIR, "src")
PUBLIC_DIR = os.path.join(STUDIO_DIR, "public")
OUTPUT_DIR = os.path.join(STUDIO_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PORT = 8999

# Global Job State
current_job = None  # { id, composition, status: 'pending'|'rendering'|'done'|'failed', result_path: str }
last_poll_time = 0.0
last_worker_ip = None


class AutoBridgeHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Keep server console clean
        pass

    def do_GET(self):
        global current_job, last_poll_time, last_worker_ip

        if self.path == "/api/poll_job":
            last_poll_time = time.time()
            last_worker_ip = self.client_address[0]
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            if current_job and current_job["status"] == "pending":
                current_job["status"] = "rendering"
                print(f"⚡ [Bridge] RTX 4060 grabbed job: {current_job['composition']}")
                self.wfile.write(json.dumps(current_job).encode())
            else:
                self.wfile.write(b"null")
            return

        elif self.path == "/api/worker_status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            is_active = (time.time() - last_poll_time < 6.0) if last_poll_time > 0 else False
            status_data = {
                "active": is_active,
                "last_poll_seconds_ago": round(time.time() - last_poll_time, 1) if last_poll_time > 0 else None,
                "worker_ip": last_worker_ip,
            }
            self.wfile.write(json.dumps(status_data).encode())
            return

        elif self.path == "/api/job_status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(current_job or {}).encode())
            return

        elif self.path == "/bundle.zip":
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
                for folder in [SRC_DIR, PUBLIC_DIR]:
                    for root, _, files in os.walk(folder):
                        for f in files:
                            full_path = os.path.join(root, f)
                            rel_path = os.path.relpath(full_path, STUDIO_DIR)
                            z.write(full_path, rel_path)

            val = buf.getvalue()
            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Length", str(len(val)))
            self.end_headers()
            self.wfile.write(val)
            return

        elif self.path == "/ping":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"PONG")
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        global current_job

        if self.path == "/api/queue_job":
            content_len = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_len).decode())
            composition = body.get("composition", "DrillProgression")

            current_job = {
                "id": str(int(time.time())),
                "composition": composition,
                "status": "pending",
                "result_path": os.path.join(OUTPUT_DIR, f"{composition}_30fps.mp4"),
            }
            print(f"📥 [Bridge] Queued render job for {composition} on RTX 4060...")

            # Wait for Windows daemon to finish
            start_t = time.time()
            while current_job and current_job["status"] != "done":
                if current_job["status"] == "failed":
                    break
                if time.time() - start_t > 300:  # 5 min timeout
                    break
                time.sleep(0.5)

            if current_job and current_job["status"] == "done":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "video_path": current_job["result_path"]}).encode())
            else:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Render timed out or failed on worker"}).encode())
            return

        elif self.path.startswith("/api/complete"):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            filename = params.get("filename", ["master.mp4"])[0]

            out_path = os.path.join(OUTPUT_DIR, filename)
            content_len = int(self.headers.get("Content-Length", 0))

            with open(out_path, "wb") as f:
                remaining = content_len
                while remaining > 0:
                    chunk = self.rfile.read(min(remaining, 65536))
                    if not chunk:
                        break
                    f.write(chunk)
                    remaining -= len(chunk)

            if current_job:
                current_job["status"] = "done"
                current_job["result_path"] = out_path

            print(f"✅ [Bridge] Received master video from RTX 4060: {out_path} ({os.path.getsize(out_path):,} bytes)")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK")
            return

        self.send_response(404)
        self.end_headers()


def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AutoBridgeHandler) as httpd:
        print(f"🚀 RTX 4060 Auto-Bridge Daemon active on port {PORT}")
        httpd.serve_forever()


if __name__ == "__main__":
    run()
