import paramiko

def check_all_tracker_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=15)
    
    print("\n=== RECENT TRACKER LOGS ON HOSTINGER VPS (200.141.9.19) ===")
    stdin, stdout, stderr = ssh.exec_command("pm2 logs school-backend --lines 100 --nostream")
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    
    lines_found = []
    for line in out.splitlines():
        if any(keyword in line for keyword in ["Tracker", "864163085084979", "IMEI", "Connected", "Location", "Battery", "Logged In", "Disconnected", "Error"]):
            lines_found.append(line)
            
    if lines_found:
        for l in lines_found:
            print(l)
    else:
        print("No recent tracker connection events found in the last 100 lines of PM2 logs.")
        print("\nChecking raw netstat/ss connections on port 5023:")
        stdin2, stdout2, stderr2 = ssh.exec_command("ss -tnp | grep 5023 || echo 'No active TCP sockets on 5023 right now'")
        print(stdout2.read().decode('utf-8', errors='ignore').strip())
        
    ssh.close()

if __name__ == '__main__':
    check_all_tracker_logs()
