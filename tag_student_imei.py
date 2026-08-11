import paramiko

def tag_student():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
    
    script = """
    require('dotenv').config();
    const mongoose = require('mongoose');
    const Student = require('./models/studentSchema');
    mongoose.connect(process.env.MONGO_URL).then(async () => {
        const res = await Student.findOneAndUpdate(
            { name: /suresh/i },
            { $set: { imei: '123456789012345' } },
            { new: true }
        );
        console.log('SUCCESS:', res.name, 'Roll:', res.rollNum, 'IMEI:', res.imei);
        process.exit(0);
    });
    """
    
    sftp = ssh.open_sftp()
    with sftp.file('/root/school-backend/tag_script.js', 'w') as f:
        f.write(script)
    sftp.close()
    
    _, stdout, stderr = ssh.exec_command("cd /root/school-backend && node tag_script.js && rm -f tag_script.js")
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    print(out.strip())
    ssh.close()

if __name__ == '__main__':
    tag_student()
