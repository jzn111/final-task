#!/usr/bin/env python3
"""Custom HTTP server with UTF-8 charset for JS/CSS files."""
import http.server
import socketserver

PORT = 8772
DIRECTORY = r"."

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        ctype = super().guess_type(path)
        # Force UTF-8 for text-based files
        if path.endswith('.js'):
            return 'text/javascript; charset=utf-8'
        elif path.endswith('.css'):
            return 'text/css; charset=utf-8'
        elif path.endswith('.json'):
            return 'application/json; charset=utf-8'
        elif path.endswith('.html'):
            return 'text/html; charset=utf-8'
        return ctype

if __name__ == '__main__':
    with socketserver.TCPServer(("127.0.0.1", PORT), MyHandler) as httpd:
        print(f"Serving at http://127.0.0.1:{PORT}")
        httpd.serve_forever()
