import urllib.request
import json
import time

BASE_URL = "http://200.141.9.19:5000"
TEST_IMEI = "123456789012345"

def test_ble():
    print(f"=== TESTING BLE BEACON TELEMETRY PIPELINE ===")
    
    # Step 1: Post BLE Telemetry (Simulating Mobile BLE Gateway parsing BCK advertisement)
    payload = {
        "imei": TEST_IMEI,
        "sequence": 42,
        "battery": 85,
        "batteryMv": 4150,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "speed": 5
    }
    
    print(f"\n1. Sending POST /api/tracker/ble-telemetry for IMEI {TEST_IMEI}...")
    req = urllib.request.Request(
        f"{BASE_URL}/api/tracker/ble-telemetry",
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = (time.time() - start_time) * 1000
            res_data = json.loads(resp.read().decode('utf-8'))
            print(f"   [SUCCESS] Status Code: {resp.getcode()} (Latency: {elapsed:.1f}ms)")
            print(f"   Response JSON: {json.dumps(res_data, indent=2)}")
            
            assert res_data.get("status") == 1, "Status should be 1"
            assert "receiptId" in res_data, "Response must contain receiptId"
            receipt_id = res_data["receiptId"]
            print(f"   [OK] Received 32-bit uint32 LE Receipt ID: {receipt_id} (0x{receipt_id:08X})")
    except Exception as e:
        print(f"   [FAILED] {e}")
        return

    # Step 2: Fetch Device Data (Simulating Parent/Admin App fetching telemetry)
    print(f"\n2. Verifying GET /api/admin/{TEST_IMEI}...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/api/admin/{TEST_IMEI}", timeout=10) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            print(f"   [SUCCESS] Status Code: {resp.getcode()}")
            print(f"   Response JSON: {json.dumps(res_data, indent=2)}")
            
            assert res_data.get("imei") == TEST_IMEI
            assert res_data.get("status") == "Online"
            assert res_data.get("battery") == 85
            assert res_data.get("batteryMv") == 4150
            assert res_data.get("sequence") == 42
            assert res_data.get("deviceType") == "BLE_BEACON"
            print(f"   [OK] Verified MongoDB updated status to 'Online', battery 85%, 4150mV, Sequence 42")
    except Exception as e:
        print(f"   [FAILED] {e}")
        return

    print("\n=== ALL BLE PROTOCOL TESTS PASSED 100%! ===")

if __name__ == '__main__':
    test_ble()
