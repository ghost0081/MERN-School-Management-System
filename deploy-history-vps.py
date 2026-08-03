import paramiko
import os

def upload_file(sftp, local_path, remote_path):
    print(f"Uploading {local_path} -> {remote_path}...")
    sftp.put(local_path, remote_path)

def deploy_all():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=20)
    
    def run_cmd(cmd):
        print(f"[REMOTE CMD] {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err and "warning" not in err.lower():
            print("ERR:", err.strip())

    sftp = ssh.open_sftp()
    
    print("\n=== STEP 1: UPLOADING BACKEND SCHEMA & SERVER ===")
    upload_file(sftp, r"D:\coding\crm-school\MERN-School-Management-System\backend\models\trackerSchema.js", "/root/school-backend/models/trackerSchema.js")
    upload_file(sftp, r"D:\coding\crm-school\MERN-School-Management-System\backend\tracker-server.js", "/root/school-backend/tracker-server.js")
    
    print("\n=== STEP 2: UPLOADING FRONTEND TRACKERPAGE ===")
    upload_file(sftp, r"D:\coding\crm-school\MERN-School-Management-System\frontend\src\pages\admin\TrackerPage.js", "/root/school-frontend/src/pages/admin/TrackerPage.js")
    
    sftp.close()

    print("\n=== STEP 3: RESTARTING BACKEND & REBUILDING FRONTEND ===")
    run_cmd("cd /root/school-backend && pm2 restart school-backend")
    run_cmd("cd /root/school-frontend && npm run build")
    run_cmd("rm -rf /root/school-backend/build && cp -r /root/school-frontend/build /root/school-backend/build")
    run_cmd("cd /root/school-backend && pm2 restart school-backend && pm2 save")
    
    ssh.close()
    print("\n=== DEPLOYMENT COMPLETE! ===")

if __name__ == '__main__':
    deploy_all()
