import paramiko
import os
import stat

def run_remote_command(ssh, cmd):
    print(f"[REMOTE CMD] {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        safe_out = out.encode('ascii', errors='ignore').decode('ascii')
        print(safe_out.strip())
    if err and "warning" not in err.lower():
        safe_err = err.encode('ascii', errors='ignore').decode('ascii')
        print("ERR:", safe_err.strip())
    return out

def upload_directory(sftp, local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass
    
    for item in os.listdir(local_dir):
        if item in ['node_modules', '.git', '.env.local', 'test-gt06-packets.js']:
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_path):
            print(f"  Uploading {item}...")
            sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            upload_directory(sftp, local_path, remote_path)

def setup_vps():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=20)
    print("Connected successfully!")
    
    print("\n=== STEP 1: OPENING ALL REQUIRED FIREWALL PORTS (UFW) ===")
    run_remote_command(ssh, "ufw allow 22/tcp")    # SSH
    run_remote_command(ssh, "ufw allow 80/tcp")    # HTTP
    run_remote_command(ssh, "ufw allow 443/tcp")   # HTTPS
    run_remote_command(ssh, "ufw allow 5000/tcp")  # Backend API
    run_remote_command(ssh, "ufw allow 5023/tcp")  # GT06 TCP Tracker Port
    run_remote_command(ssh, "ufw allow 5023/udp")  # GT06 UDP Tracker Port
    run_remote_command(ssh, "ufw --force enable")  # Enable Firewall safely
    run_remote_command(ssh, "ufw status verbose")
    
    print("\n=== STEP 2: INSTALLING NODE.JS 20 LTS & PM2 ===")
    run_remote_command(ssh, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs")
    run_remote_command(ssh, "npm install -g pm2")
    
    print("\n=== STEP 3: UPLOADING BACKEND CODE TO /root/school-backend ===")
    sftp = ssh.open_sftp()
    local_backend = r"D:\coding\crm-school\MERN-School-Management-System\backend"
    upload_directory(sftp, local_backend, "/root/school-backend")
    sftp.close()
    
    print("\n=== STEP 4: INSTALLING NPM PACKAGES & STARTING PM2 SERVER ===")
    run_remote_command(ssh, "cd /root/school-backend && npm install --production")
    
    # Restart or start PM2
    run_remote_command(ssh, "pm2 delete school-backend || true")
    run_remote_command(ssh, "cd /root/school-backend && pm2 start index.js --name school-backend")
    run_remote_command(ssh, "pm2 save")
    
    print("\n=== STEP 5: CHECKING RUNNING PORTS ===")
    run_remote_command(ssh, "netstat -tlpn | grep -E '5000|5023' || ss -tlpn | grep -E '5000|5023'")
    
    ssh.close()
    print("\n=== DEPLOYMENT COMPLETE! ===")

if __name__ == '__main__':
    setup_vps()
