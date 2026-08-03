import paramiko

def upload_file(sftp, local_path, remote_path):
    print(f"Uploading {local_path} -> {remote_path}...")
    sftp.put(local_path, remote_path)

def deploy():
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
    
    print("\n=== STEP 1: UPLOADING BLE ALLOTMENT PAGES ===")
    upload_file(sftp, r"D:\coding\crm-school\MERN-School-Management-System\frontend\src\pages\admin\studentRelated\ShowStudents.js", "/root/school-frontend/src/pages/admin/studentRelated/ShowStudents.js")
    upload_file(sftp, r"D:\coding\crm-school\MERN-School-Management-System\frontend\src\pages\admin\studentRelated\ViewStudent.js", "/root/school-frontend/src/pages/admin/studentRelated/ViewStudent.js")
    
    sftp.close()

    print("\n=== STEP 2: REMOVING FAKE TEST IMEI FROM MONGODB ===")
    clean_cmd = """node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    const TrackerData = require('./models/trackerSchema');
    mongoose.connect(process.env.MONGO_URL).then(async () => {
        const delRes = await TrackerData.deleteMany({ imei: { \\$ne: '864163085084979' } });
        console.log('Removed test IMEIs:', delRes.deletedCount);
        process.exit(0);
    }).catch(() => process.exit(0));
    " """
    run_cmd(f"cd /root/school-backend && {clean_cmd}")

    print("\n=== STEP 3: REBUILDING FRONTEND ON VPS ===")
    run_cmd("cd /root/school-frontend && npm run build")
    run_cmd("rm -rf /root/school-backend/build && cp -r /root/school-frontend/build /root/school-backend/build")
    run_cmd("cd /root/school-backend && pm2 restart school-backend && pm2 save")
    
    ssh.close()
    print("\n=== DEPLOYMENT COMPLETE! ===")

if __name__ == '__main__':
    deploy()
