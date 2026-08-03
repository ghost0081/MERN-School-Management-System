import paramiko

def clean():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=15)
    
    cmd = """node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    const TrackerData = require('./models/trackerSchema');
    mongoose.connect(process.env.MONGO_URL).then(async () => {
        const delRes = await TrackerData.deleteMany({ imei: { \\$ne: '864163085084979' } });
        console.log('Deleted non-production test IMEIs:', delRes.deletedCount);
        const remaining = await TrackerData.find({}, 'imei status last_updated');
        console.log('Remaining active IMEIs in MongoDB:', remaining);
        process.exit(0);
    }).catch(err => {
        console.error('Mongo error:', err);
        process.exit(1);
    });
    " """
    stdin, stdout, stderr = ssh.exec_command(f"cd /root/school-backend && {cmd}")
    print(stdout.read().decode('utf-8', errors='ignore'))
    print(stderr.read().decode('utf-8', errors='ignore'))
    ssh.close()

if __name__ == '__main__':
    clean()
