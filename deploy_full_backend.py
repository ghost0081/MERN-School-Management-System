import paramiko
import os
import zipfile
import time

def zip_backend(local_dir, zip_path):
    print(f"Creating zip file {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(local_dir):
            # Ignore node_modules, .git, build
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'build']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_dir)
                zipf.write(full_path, rel_path)
    print(f"Zip created! Size: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")

def deploy():
    local_backend = r"D:\coding\crm-school\MERN-School-Management-System\backend"
    zip_path = r"D:\coding\crm-school\MERN-School-Management-System\backend.zip"
    
    zip_backend(local_backend, zip_path)
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=30)
    print("Connected successfully!")

    def run_cmd(cmd):
        print(f"[REMOTE CMD] {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err and "warning" not in err.lower():
            print("ERR:", err.strip())
        return out

    print("\n=== STEP 1: UPLOADING BACKEND.ZIP TO VPS ===")
    sftp = ssh.open_sftp()
    sftp.put(zip_path, "/root/backend.zip")
    sftp.close()
    print("Uploaded backend.zip successfully!")

    print("\n=== STEP 2: EXTRACTING BACKEND CODE ON VPS ===")
    run_cmd("apt-get install -y unzip")
    run_cmd("mkdir -p /root/school-backend")
    run_cmd("unzip -o /root/backend.zip -d /root/school-backend")
    run_cmd("rm -f /root/backend.zip")

    print("\n=== STEP 3: INSTALLING PRODUCTION DEPENDENCIES ===")
    run_cmd("cd /root/school-backend && npm install --production")

    print("\n=== STEP 4: STARTING/RESTARTING PM2 BACKEND ===")
    run_cmd("pm2 delete school-backend || true")
    run_cmd("cd /root/school-backend && pm2 start index.js --name school-backend")
    run_cmd("pm2 save")
    run_cmd("pm2 startup systemd -u root --hp /root || true")

    print("\n=== STEP 5: VERIFYING LISTENING PORTS ===")
    time.sleep(3)
    run_cmd("ss -tlpn | grep -E '5000|5023' || netstat -tlpn | grep -E '5000|5023'")

    ssh.close()
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print("\n=== BACKEND DEPLOYMENT COMPLETE! ===")

if __name__ == '__main__':
    deploy()
