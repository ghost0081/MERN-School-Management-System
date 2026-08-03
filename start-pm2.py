import paramiko

def start_pm2():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=20)
    print("Connected successfully!")
    
    def run_cmd(cmd):
        print(f"[CMD] {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err and "warning" not in err.lower():
            print("ERR:", err.strip())

    run_cmd("cd /root/school-backend && pm2 start index.js --name school-backend || pm2 restart school-backend")
    run_cmd("pm2 save")
    print("\n=== CHECKING IF PORT 5000 and 5023 ARE OPEN & LISTENING ===")
    run_cmd("ss -tlpn | grep -E '5000|5023'")
    run_cmd("ufw status verbose | grep 5023")

    ssh.close()
    print("\n=== READY! ===")

if __name__ == '__main__':
    start_pm2()
