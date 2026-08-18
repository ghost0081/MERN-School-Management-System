import paramiko
import sys

# Force UTF-8 stdout for Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def fetch_lat_lng_logs(count=15):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to VPS 200.141.9.19 to fetch last {count} Lat/Lng logs...\n")
    ssh.connect("200.141.9.19", username="root", password="Meets@081105", timeout=30)

    cmd = "docker logs --tail 300 school-backend 2>&1"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    raw_logs = stdout.read().decode('utf-8', errors='ignore')
    ssh.close()

    lines = raw_logs.splitlines()
    lat_lng_logs = [line for line in lines if "Lat:" in line and "Lng:" in line]

    print("==================================================")
    print(f"LAST {min(count, len(lat_lng_logs))} LATITUDE & LONGITUDE TELEMETRY LOGS")
    print("==================================================\n")

    for line in lat_lng_logs[-count:]:
        safe_line = line.encode('ascii', errors='replace').decode('ascii')
        print("📍", safe_line)

if __name__ == "__main__":
    count_arg = int(sys.argv[1]) if len(sys.argv) > 1 else 15
    fetch_lat_lng_logs(count_arg)
