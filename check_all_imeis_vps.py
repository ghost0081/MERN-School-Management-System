import paramiko

def check_remote_imeis():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to VPS 200.141.9.19 to inspect all registered IMEIs...\n")
    client.connect("200.141.9.19", username="root", password="Meets@081105", timeout=30)
    
    js_content = """
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(async () => {
    const Student = require('./models/studentSchema');
    const Tracker = require('./models/trackerSchema');

    console.log('=== 1. TRACKERS IN DATABASE (trackers collection) ===');
    const trackers = await Tracker.find({});
    if (trackers.length === 0) {
        console.log('No tracker records found.');
    } else {
        trackers.forEach((t, i) => {
            console.log(`[${i+1}] IMEI: ${t.imei} | Type: ${t.deviceType || 'N/A'} | Status: ${t.status} | Bat: ${t.battery}% | Last Updated: ${t.last_updated} | Path Points: ${(t.path_history || []).length}`);
        });
    }

    console.log('\\n=== 2. STUDENTS ASSIGNED TO TRACKERS (students collection) ===');
    const students = await Student.find({ imei: { $exists: true, $ne: null } });
    if (students.length === 0) {
        console.log('No students assigned to IMEIs.');
    } else {
        students.forEach((s, i) => {
            console.log(`[${i+1}] Student: ${s.name} (Roll: ${s.rollNum}) | Assigned IMEI: ${s.imei} | Geofences: ${(s.geofences || []).length}`);
        });
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
"""
    
    sftp = client.open_sftp()
    with sftp.open("/root/check_imeis.js", "w") as f:
        f.write(js_content)
    sftp.close()

    client.exec_command("docker cp /root/check_imeis.js school-backend:/app/check_imeis.js")
    stdin, stdout, stderr = client.exec_command("docker exec school-backend node /app/check_imeis.js")
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    
    print(out)
    if err:
        print("[VPS ERR]:", err)
        
    client.close()

if __name__ == "__main__":
    check_remote_imeis()
