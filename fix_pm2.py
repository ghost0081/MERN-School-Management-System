import paramiko

def fix():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to VPS...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
    
    def run_cmd(cmd):
        print(f"[REMOTE CMD] {cmd}")
        _, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err:
            print("ERR:", err.strip())

    print("Starting PM2 school-backend process...")
    run_cmd("cd /root/school-backend && pm2 start index.js --name school-backend")
    run_cmd("pm2 save")
    run_cmd("pm2 startup systemd -u root --hp /root || true")
    
    print("\nChecking listening ports...")
    run_cmd("ss -tlpn | grep 5000 || netstat -tlpn | grep 5000")
    
    ssh.close()
    print("\nFix completed!")

if __name__ == '__main__':
    fix()
