import paramiko
import sys

# Force UTF-8 stdout for Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def fetch_ble_logs(since="24h"):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to VPS 200.141.9.19 to fetch BLE logs...")
    ssh.connect("200.141.9.19", username="root", password="Meets@081105", timeout=30)

    cmd = f"docker logs --since {since} school-backend 2>&1"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    raw_logs = stdout.read().decode('utf-8', errors='ignore')
    ssh.close()

    lines = raw_logs.splitlines()
    ble_logs = [line for line in lines if "[BLE TELEMETRY RECEIVE]" in line or "GEOFENCE" in line or "tracker" in line.lower()]

    print(f"\n==================================================")
    print(f"SERVER BLE LOGS (Total Server Log Lines: {len(lines)} | Matched BLE Lines: {len(ble_logs)})")
    print(f"==================================================\n")

    if not ble_logs:
        print("[NO MATCHED BLE LOGS FOUND IN SPECIFIED TIME RANGE]")
        print("\nLast 30 Raw Docker Server Logs:")
        for line in lines[-30:]:
            print("  ", line)
    else:
        # Show last 50 BLE logs
        for line in ble_logs[-50:]:
            # Sanitize for display
            safe_line = line.encode('ascii', errors='replace').decode('ascii')
            print(safe_line)

if __name__ == "__main__":
    since_arg = sys.argv[1] if len(sys.argv) > 1 else "24h"
    fetch_ble_logs(since_arg)
