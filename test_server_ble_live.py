#!/usr/bin/env python3
"""
BLE Server Telemetry & ACK Protocol Tester
-------------------------------------------
Tests the live backend BLE endpoint on http://200.141.9.19:5000

Usage:
  python test_server_ble_live.py               # Run single test packet for IMEI 123456789012345
  python test_server_ble_live.py --loop 5       # Loop every 5 seconds continuously
  python test_server_ble_live.py --imei 123456  # Test with custom IMEI
"""

import urllib.request
import urllib.error
import json
import struct
import time
import sys
import argparse

SERVER_URL = "http://200.141.9.19:5000"
DEFAULT_IMEI = "123456789012345"

def build_bak_ack_hex(sequence, imei_str, status, receipt_id):
    """
    Constructs the 19-byte BAK ACK binary payload according to ANDROID_BLE_PROTOCOL.pdf:
    - Offset 0..2:   ASCII "BAK" (0x42, 0x41, 0x4B)
    - Offset 3:      Version 0x01
    - Offset 4..5:   ACK Sequence uint16 Little-Endian
    - Offset 6..13:  IMEI uint64 Little-Endian
    - Offset 14:     Status (0x01 = Success)
    - Offset 15..18: Receipt ID uint32 Little-Endian
    """
    imei_int = int(imei_str)
    raw_bytes = struct.pack('<3sBHQB I', b'BAK', 1, sequence, imei_int, status, receipt_id)
    return raw_bytes.hex().upper()

def send_ble_telemetry(imei, sequence, battery, battery_mv, lat, lng, speed):
    url = f"{SERVER_URL}/api/tracker/ble-telemetry"
    payload = {
        "imei": str(imei),
        "sequence": int(sequence),
        "battery": int(battery),
        "batteryMv": int(battery_mv),
        "latitude": float(lat),
        "longitude": float(lng),
        "speed": float(speed)
    }

    headers = {'Content-Type': 'application/json'}
    data = json.dumps(payload).encode('utf-8')

    print(f"\n==================================================")
    print(f"[BLE TEST] SENDING TELEMETRY TO SERVER ({url})")
    print(f"==================================================")
    print(f"  * IMEI:       {imei}")
    print(f"  * Sequence:   {sequence}")
    print(f"  * Battery:    {battery}% ({battery_mv} mV)")
    print(f"  * Location:   Lat {lat}, Lng {lng} (Speed: {speed} km/h)")

    req = urllib.request.Request(url, data=data, headers=headers, method='POST')

    start_t = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            latency = (time.time() - start_t) * 1000
            res_body = json.loads(response.read().decode('utf-8'))

            print(f"\n[SUCCESS] SERVER RESPONSE (Status {response.getcode()} in {latency:.1f}ms):")
            print(json.dumps(res_body, indent=2))

            receipt_id = res_body.get("receiptId")
            if receipt_id is not None:
                ack_hex = build_bak_ack_hex(sequence, imei, 1, receipt_id)
                print(f"\n[ACK GENERATED] 19-BYTE BAK ACK PACKET FOR HARDWARE TAG:")
                print(f"  * Receipt ID (Dec): {receipt_id}")
                print(f"  * Receipt ID (Hex): 0x{receipt_id:08X}")
                print(f"  * Wire HEX Payload: {ack_hex}")
                print(f"    (Breakdown: BAK | Ver 01 | Seq {sequence:04X} | IMEI | Status 01 | Receipt 0x{receipt_id:08X})")
            return True, receipt_id
    except urllib.error.HTTPError as e:
        print(f"\n[FAIL] SERVER HTTP ERROR {e.code}: {e.read().decode('utf-8', errors='ignore')}")
        return False, None
    except Exception as e:
        print(f"\n[FAIL] CONNECTION ERROR: {e}")
        return False, None

def verify_mongo_device_state(imei):
    url = f"{SERVER_URL}/api/admin/{imei}"
    print(f"\n[DATABASE CHECK] VERIFYING MONGODB DEVICE STATE FOR IMEI {imei}...")
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            print(f"[OK] MONGODB STATE:")
            print(f"  * Status:       {res_body.get('status')}")
            print(f"  * Device Type:  {res_body.get('deviceType')}")
            print(f"  * Battery:      {res_body.get('battery')}% ({res_body.get('batteryMv')} mV)")
            print(f"  * Sequence:     {res_body.get('sequence')}")
            print(f"  * Last Updated: {res_body.get('last_updated')}")
            print(f"  * Path History: {len(res_body.get('path_history', []))} points recorded")
    except Exception as e:
        print(f"[WARNING] Could not fetch device state: {e}")

def main():
    parser = argparse.ArgumentParser(description="BLE Server Telemetry & ACK Protocol Tester")
    parser.add_argument("--imei", default=DEFAULT_IMEI, help="IMEI string (default: 123456789012345)")
    parser.add_argument("--seq", type=int, default=1, help="Starting sequence number (default: 1)")
    parser.add_argument("--battery", type=int, default=85, help="Battery percentage (default: 85)")
    parser.add_argument("--mv", type=int, default=4150, help="Battery voltage in mV (default: 4150)")
    parser.add_argument("--lat", type=float, default=28.6139, help="Latitude (default: 28.6139)")
    parser.add_argument("--lng", type=float, default=77.2090, help="Longitude (default: 77.2090)")
    parser.add_argument("--loop", type=int, default=0, help="Loop interval in seconds (0 = single run)")

    args = parser.parse_args()

    seq = args.seq
    if args.loop <= 0:
        success, _ = send_ble_telemetry(args.imei, seq, args.battery, args.mv, args.lat, args.lng, 5)
        if success:
            verify_mongo_device_state(args.imei)
    else:
        print(f"🔄 Starting continuous test loop every {args.loop} seconds... (Press Ctrl+C to stop)")
        try:
            while True:
                send_ble_telemetry(args.imei, seq, args.battery, args.mv, args.lat, args.lng, 5)
                seq += 1
                time.sleep(args.loop)
        except KeyboardInterrupt:
            print("\nStopped test loop.")

if __name__ == '__main__':
    main()
