import paramiko

def check_tracker_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
    
    print("\n=== RECENT SERVER LOGS FOR IMEI 864163085084979 ===")
    stdin, stdout, stderr = ssh.exec_command("pm2 logs school-backend --lines 30 --nostream")
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    
    found = False
    for line in out.splitlines():
        if "Tracker" in line or "864163085084979" in line or "Connected" in line:
            print(line)
            found = True
            
    if not found:
        print("No connections from IMEI 864163085084979 yet. Waiting for SMS command...")
        
    ssh.close()

if __name__ == '__main__':
    check_tracker_logs()
