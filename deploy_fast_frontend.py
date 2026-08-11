import paramiko
import os
import zipfile

def zip_frontend(local_dir, zip_path):
    print(f"Creating zip file {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(local_dir):
            # Ignore node_modules, build, .git
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'build', '.git']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_dir)
                zipf.write(full_path, rel_path)
    print(f"Zip created! Size: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")

def deploy():
    local_frontend = r"D:\coding\crm-school\MERN-School-Management-System\frontend"
    zip_path = r"D:\coding\crm-school\MERN-School-Management-System\frontend.zip"
    
    zip_frontend(local_frontend, zip_path)
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=30)
    print("Connected!")

    def run_cmd(cmd):
        print(f"[REMOTE CMD] {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err and "warning" not in err.lower():
            print("ERR:", err.strip())

    print("\n=== STEP 1: UPLOADING FRONTEND.ZIP TO VPS ===")
    sftp = ssh.open_sftp()
    sftp.put(zip_path, "/root/frontend.zip")
    sftp.close()
    print("Uploaded frontend.zip successfully!")

    print("\n=== STEP 2: EXTRACTING FRONTEND CODE ===")
    run_cmd("apt-get install -y unzip")
    run_cmd("mkdir -p /root/school-frontend")
    run_cmd("unzip -o /root/frontend.zip -d /root/school-frontend")
    run_cmd("rm -f /root/frontend.zip")

    print("\n=== STEP 3: SETTING PRODUCTION ENV & BUILDING WEB APP ===")
    run_cmd("echo 'REACT_APP_BASE_URL=http://200.141.9.19:5000' > /root/school-frontend/.env")
    run_cmd("cd /root/school-frontend && npm install --legacy-peer-deps")
    run_cmd("cd /root/school-frontend && npm run build")

    print("\n=== STEP 4: COPYING BUILD TO BACKEND & RESTARTING PM2 ===")
    run_cmd("rm -rf /root/school-backend/build")
    run_cmd("cp -r /root/school-frontend/build /root/school-backend/build")
    run_cmd("cd /root/school-backend && pm2 restart school-backend")
    run_cmd("pm2 save")

    ssh.close()
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print("\n=== FRONTEND DEPLOYMENT COMPLETE! LIVE AT http://200.141.9.19:5000 ===")

if __name__ == '__main__':
    deploy()
