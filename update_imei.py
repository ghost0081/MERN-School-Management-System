import paramiko

def update_imei():
    print("Connecting to VPS root@200.141.9.19...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=15)
    
    script = """
    require('dotenv').config();
    const mongoose = require('mongoose');
    const Student = require('./models/studentSchema');
    const Tracker = require('./models/trackerSchema');

    mongoose.connect(process.env.MONGO_URL).then(async () => {
        // Update Student suresh
        const sRes = await Student.findOneAndUpdate(
            { imei: '123456789012345' },
            { $set: { imei: '123456789012354' } },
            { new: true }
        ) || await Student.findOneAndUpdate(
            { name: /suresh/i },
            { $set: { imei: '123456789012354' } },
            { new: true }
        );

        console.log('STUDENT UPDATED:', sRes ? sRes.name : 'None', '| New IMEI:', sRes ? sRes.imei : 'None');

        // Update or create Tracker document
        const tRes = await Tracker.findOneAndUpdate(
            { imei: '123456789012345' },
            { $set: { imei: '123456789012354' } },
            { new: true }
        ) || await Tracker.findOneAndUpdate(
            { imei: '123456789012354' },
            { $set: { imei: '123456789012354', status: 'Online', deviceType: 'BLE_BEACON' } },
            { upsert: true, new: true }
        );

        console.log('TRACKER UPDATED:', tRes ? tRes.imei : 'None');
        process.exit(0);
    });
    """
    
    sftp = ssh.open_sftp()
    with sftp.file('/root/school-backend/update_imei_script.js', 'w') as f:
        f.write(script)
    sftp.close()
    
    _, stdout, stderr = ssh.exec_command("cd /root/school-backend && node update_imei_script.js && rm -f update_imei_script.js")
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    print(out.strip())
    ssh.close()

if __name__ == '__main__':
    update_imei()
