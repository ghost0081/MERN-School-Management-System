import paramiko
import os
import zipfile

def zip_backend(local_dir, zip_path):
    print(f"Creating zip file {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(local_dir):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'build']]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, local_dir)
                zipf.write(full_path, rel_path)
    print(f"Zip created! Size: {os.path.getsize(zip_path) / (1024*1024):.2f} MB")

def deploy_docker():
    local_backend = r"D:\coding\crm-school\MERN-School-Management-System\backend"
    zip_path = r"D:\coding\crm-school\MERN-School-Management-System\backend_docker.zip"
    
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

    print("\n=== STEP 1: UPLOADING BACKEND CODE TO VPS ===")
    sftp = ssh.open_sftp()
    sftp.put(zip_path, "/root/backend_docker.zip")
    sftp.close()

    print("\n=== STEP 2: EXTRACTING BACKEND CODE ===")
    run_cmd("apt-get install -y unzip docker.io docker-compose-v2 || apt-get install -y unzip docker.io docker-compose")
    run_cmd("mkdir -p /root/school-backend")
    run_cmd("unzip -o /root/backend_docker.zip -d /root/school-backend")
    run_cmd("rm -f /root/backend_docker.zip")

    print("\n=== STEP 3: STOPPING OLD PM2 PROCESS IF RUNNING ===")
    run_cmd("pm2 delete school-backend || true")

    print("\n=== STEP 4: BUILDING & STARTING DOCKER CONTAINER ===")
    run_cmd("cd /root/school-backend && docker compose up -d --build || cd /root/school-backend && docker-compose up -d --build")

    print("\n=== STEP 5: VERIFYING DOCKER CONTAINER STATUS ===")
    run_cmd("docker ps")

    ssh.close()
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    print("\n=== DOCKER BACKEND DEPLOYMENT COMPLETE! LIVE AT http://200.141.9.19:5000 ===")

if __name__ == '__main__':
    deploy_docker()
