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
import socket
from pathlib import Path

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler with CORS support and better error handling"""

    def __init__(self, *args, directory=None, **kwargs):
        # Serve files from current directory
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
        try:
            print(f"[{client_address}] {format % args}")
        except UnicodeEncodeError:
            print(f"[{client_address}] [Encoded Message]")

    def log_error(self, format, *args):
        # Suppress common connection errors
        error_msg = format % args
        # Ignore these common errors (browser closing tabs, network issues)
        ignore_errors = [
            'ConnectionAbortedError',
            'ConnectionResetError',
            'BrokenPipeError',
            '10053',  # Windows connection aborted
            '10054',  # Windows connection reset
            'An established connection was aborted',
            'An existing connection was forcibly closed'
        ]

        if any(err in error_msg for err in ignore_errors):
            # Silently ignore these errors
            return

        # Log other errors
        super().log_error(format, *args)

    def handle_one_request(self):
        """Handle one request with error catching"""
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Silently ignore connection errors
            pass

def main():
    # Get port and host from command line or use defaults
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    host = sys.argv[2] if len(sys.argv) > 2 else '0.0.0.0'

    # Create server
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((host, port), CORSRequestHandler) as httpd:
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
        except Exception as e:
            print(f"\n\nServer error: {e}")

if __name__ == '__main__':
    main()
