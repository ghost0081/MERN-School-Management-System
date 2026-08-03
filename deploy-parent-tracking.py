import paramiko

def deploy():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=20)
    
    sftp = ssh.open_sftp()
    print("Uploading ParentTracking.js...")
    sftp.put(r"D:\coding\crm-school\MERN-School-Management-System\frontend\src\pages\parent\ParentTracking.js",
             "/root/school-frontend/src/pages/parent/ParentTracking.js")
    sftp.close()

    def run_cmd(cmd):
        print(f"[REMOTE CMD] {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
        if out:
            print(out.strip())
        if err and "warning" not in err.lower():
            print("ERR:", err.strip())

    print("Rebuilding frontend on VPS...")
    run_cmd("cd /root/school-frontend && npm run build")
    run_cmd("rm -rf /root/school-backend/build && cp -r /root/school-frontend/build /root/school-backend/build")
    run_cmd("cd /root/school-backend && pm2 restart school-backend && pm2 save")
    
    ssh.close()
    print("PARENT TRACKING DEPLOYMENT COMPLETE!")

if __name__ == '__main__':
    deploy()
