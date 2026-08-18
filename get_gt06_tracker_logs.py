import paramiko
import sys

# Force UTF-8 stdout for Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def fetch_gt06_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to VPS 200.141.9.19 to fetch GT06 GPS Tracker server logs...\n")
    ssh.connect("200.141.9.19", username="root", password="Meets@081105", timeout=30)

    cmd = "docker logs --tail 500 school-backend 2>&1"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    raw_logs = stdout.read().decode('utf-8', errors='ignore')
    ssh.close()

    lines = raw_logs.splitlines()
    gt06_logs = [line for line in lines if "Tracker" in line or "GT06" in line or "5023" in line]

    print("==================================================")
    print(f"GT06 HARDWARE GPS TRACKER SERVER LOGS (Total Matched: {len(gt06_logs)})")
    print("==================================================\n")

    if not gt06_logs:
        print("[NO GT06 TCP TRACKER PACKETS DETECTED YET ON PORT 5023]")
        print("\nLast 25 Raw Server Logs:")
        for line in lines[-25:]:
            print("  ", line.encode('ascii', errors='replace').decode('ascii'))
    else:
        for line in gt06_logs[-50:]:
            safe_line = line.encode('ascii', errors='replace').decode('ascii')
            print("📡", safe_line)

if __name__ == "__main__":
    fetch_gt06_logs()
