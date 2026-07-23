import asyncio
import threading
import time
from flask import Flask, jsonify
from flask_cors import CORS
from bleak import BleakScanner

app = Flask(__name__)
# Enable CORS so your React app can fetch data from localhost:8765
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global dictionary to store detected beacons
# Format: { "SDE-John": { "rssi": -65, "last_seen": timestamp } }
detected_beacons = {}
lock = threading.Lock()

scanner_running = False
bluetooth_ok = True
scanner_error = None

# Background BLE scanning task
async def ble_scan_loop():
    global bluetooth_ok, scanner_running, scanner_error
    scanner_running = True
    
    print("BLE Scanner started. Listening for 'SDE-*' beacons...")
    
    def detection_callback(device, advertisement_data):
        name = advertisement_data.local_name
        if name and name.upper().startswith("SDE-"):
            with lock:
                detected_beacons[name] = {
                    "rssi": advertisement_data.rssi,
                    "last_seen": time.time()
                }
                print(f"Detected: {name} (RSSI: {advertisement_data.rssi} dBm)")

    try:
        scanner = BleakScanner(detection_callback)
        await scanner.start()
        
        while True:
            # Clean up beacons not seen in the last 6 seconds (marks them out-of-range/absent)
            current_time = time.time()
            with lock:
                expired = [k for k, v in detected_beacons.items() if current_time - v["last_seen"] > 6.0]
                for k in expired:
                    del detected_beacons[k]
                    print(f"Lost range/Disconnected: {k}")
            
            await asyncio.sleep(1)
            
    except Exception as e:
        bluetooth_ok = False
        scanner_error = str(e)
        print(f"Scanner Error: {e}")
    finally:
        scanner_running = False

# Thread helper to run Asyncio loop in background
def start_ble_thread():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(ble_scan_loop())

# Flask REST Endpoint for React App to poll
@app.route('/api/sightings', methods=['GET'])
def get_sightings():
    with lock:
        return jsonify({
            "sightings": detected_beacons,
            "bluetoothOk": bluetooth_ok,
            "scannerRunning": scanner_running,
            "error": scanner_error
        })

if __name__ == '__main__':
    # Start BLE Scanner in a background thread
    ble_thread = threading.Thread(target=start_ble_thread, daemon=True)
    ble_thread.start()
    
    # Run Flask Web Server on port 8765
    print("Flask Scan Server starting on http://localhost:8765")
    app.run(host='0.0.0.0', port=8765, debug=False, use_reloader=False)
