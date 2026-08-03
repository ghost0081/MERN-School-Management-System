import paramiko
import os

def upload_directory(sftp, local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass
    
    for item in os.listdir(local_dir):
        if item in ['node_modules', '.git', 'build']:
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isfile(local_path):
            print(f"  Uploading {item}...")
            sftp.put(local_path, remote_path)
        elif os.path.isdir(local_path):
            upload_directory(sftp, local_path, remote_path)

def deploy_frontend_to_vps():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=20)
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

    print("\n=== STEP 1: UPLOADING FRONTEND CODE TO /root/school-frontend ===")
    sftp = ssh.open_sftp()
    local_frontend = r"D:\coding\crm-school\MERN-School-Management-System\frontend"
    upload_directory(sftp, local_frontend, "/root/school-frontend")
    sftp.close()

    print("\n=== STEP 2: SETTING PRODUCTION REACT_APP_BASE_URL ===")
    run_cmd("echo 'REACT_APP_BASE_URL=http://200.141.9.19:5000' > /root/school-frontend/.env")

    print("\n=== STEP 3: INSTALLING FRONTEND DEPENDENCIES & BUILDING PRODUCTION WEB APP ===")
    run_cmd("cd /root/school-frontend && npm install --legacy-peer-deps")
    run_cmd("cd /root/school-frontend && npm run build")

    print("\n=== STEP 4: COPYING BUILD TO BACKEND & RESTARTING PM2 ===")
    run_cmd("rm -rf /root/school-backend/build")
    run_cmd("cp -r /root/school-frontend/build /root/school-backend/build")
    run_cmd("cd /root/school-backend && pm2 restart school-backend")
    run_cmd("pm2 save")

    ssh.close()
    print("\n=== FRONTEND IS NOW LIVE ON http://200.141.9.19:5000 ! ===")

if __name__ == '__main__':
    deploy_frontend_to_vps()
