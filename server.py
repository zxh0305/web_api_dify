#!/usr/bin/env python3
"""
Simple HTTP Server for Dify Chat System
Usage: python server.py [port] [host]
Example: python server.py 8000 0.0.0.0
"""

import http.server
import socketserver
import sys
import os
from pathlib import Path

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler with CORS support"""

    def __init__(self, *args, directory=None, **kwargs):
        # Serve files from the current directory
        super().__init__(*args, directory=Path(__file__).parent, **kwargs)

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Custom log format
        client_address = self.client_address[0]
        print(f"[{client_address}] {format % args}")

def main():
    # Get port and host from command line or use defaults
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    host = sys.argv[2] if len(sys.argv) > 2 else '0.0.0.0'

    # Create server
    with socketserver.TCPServer((host, port), CORSRequestHandler) as httpd:
        # Allow address reuse
        httpd.allow_reuse_address = True

        print("=" * 60)
        print("Dify Chat System - HTTP Server")
        print("=" * 60)
        print(f"Server running on: http://{host}:{port}")
        print(f"Local access:      http://localhost:{port}")
        print(f"Network access:   http://<your-ip-address>:{port}")
        print("=" * 60)
        print("\nPress Ctrl+C to stop the server\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped by user")

if __name__ == '__main__':
    main()
