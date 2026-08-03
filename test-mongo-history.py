import paramiko

def check_mongo_count():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to root@200.141.9.19...")
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=15)
    
    cmd = """node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    const TrackerData = require('./models/trackerSchema');
    mongoose.connect(process.env.MONGO_URL).then(async () => {
        const count = await TrackerData.countDocuments({ imei: '864163085084979' });
        const latest10 = await TrackerData.find({ imei: '864163085084979' }).sort({ last_updated: -1 }).limit(10);
        console.log('=== MONGODB ATLAS STORAGE VERIFICATION ===');
        console.log('Total Saved Coordinates for IMEI 864163085084979:', count);
        console.log('Latest 10 coordinates:');
        latest10.forEach((d, idx) => {
            console.log(`  ${idx+1}. Lat: ${d.latitude}, Lon: ${d.longitude}, Time: ${d.last_updated}, Fix: ${d.status}`);
        });
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
    check_mongo_count()
