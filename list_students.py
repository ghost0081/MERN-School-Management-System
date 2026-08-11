import paramiko

def list_students():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
    
    cmd = """node -e "
    require('dotenv').config();
    const mongoose = require('mongoose');
    const Student = require('./models/studentSchema');
    mongoose.connect(process.env.MONGO_URL).then(async () => {
        const students = await Student.find({}, 'name rollNum imei sclassName _id').lean();
        console.log(JSON.stringify(students, null, 2));
        process.exit(0);
    });
    " """
    
    _, stdout, stderr = ssh.exec_command(f"cd /root/school-backend && {cmd}")
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    print(out.strip())
    ssh.close()

if __name__ == '__main__':
    list_students()
