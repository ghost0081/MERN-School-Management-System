import paramiko

def check():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
    
    print("=== PM2 STATUS ===")
    _, stdout, _ = ssh.exec_command('pm2 status')
    print(stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii'))
    
    print("=== PORT 5000 LISTENING ===")
    _, stdout, _ = ssh.exec_command('ss -tlpn | grep 5000 || netstat -tlpn | grep 5000')
    print(stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii'))
    
    print("=== UFW FIREWALL STATUS ===")
    _, stdout, _ = ssh.exec_command('ufw status')
    print(stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii'))
    
    ssh.close()

if __name__ == '__main__':
    check()
