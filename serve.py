#!/usr/bin/env python3
"""Local dev server with no-cache headers"""
import http.server, socketserver, os, webbrowser, threading

PORT = 8081  # changed port to force fresh connection
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    def log_message(self, format, *args):
        print(args[0], args[1])

def open_browser():
    import time; time.sleep(0.8)
    webbrowser.open('http://localhost:' + str(PORT) + '/index.html')

print('Server: http://localhost:' + str(PORT) + '/index.html')
print('No-cache headers enabled. Press Ctrl+C to stop.')
threading.Thread(target=open_browser, daemon=True).start()
with socketserver.TCPServer(('', PORT), NoCacheHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
