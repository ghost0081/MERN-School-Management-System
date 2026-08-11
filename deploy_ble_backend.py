import paramiko
import os

def deploy():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to VPS root@200.141.9.19...")
    try:
        ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
        print("Connected!")
    except Exception as e:
        print("Connection skipped or server offline:", e)
        return

    def run_cmd(cmd):
        print(f"[REMOTE CMD] {cmd}")
        _, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err and "warning" not in err.lower():
            print("ERR:", err.strip())

    sftp = ssh.open_sftp()
    
    print("\n=== UPLOADING UPDATED BACKEND FILES ===")
    sftp.put(r"D:\coding\crm-school\MERN-School-Management-System\backend\models\trackerSchema.js", "/root/school-backend/models/trackerSchema.js")
    sftp.put(r"D:\coding\crm-school\MERN-School-Management-System\backend\controllers\tracker-controller.js", "/root/school-backend/controllers/tracker-controller.js")
    sftp.put(r"D:\coding\crm-school\MERN-School-Management-System\backend\routes\route.js", "/root/school-backend/routes/route.js")
    sftp.close()

    print("\n=== RESTARTING PM2 ===")
    run_cmd("cd /root/school-backend && pm2 restart school-backend")
    run_cmd("pm2 save")

    ssh.close()
    print("\n=== BACKEND BLE DEPLOYMENT COMPLETE! ===")

if __name__ == '__main__':
    deploy()
