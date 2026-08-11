import paramiko

def fetch_logs():
    print("Connecting to root@200.141.9.19...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        '200.141.9.19',
        username='root',
        password='Meets@081105',
        timeout=25,
        banner_timeout=25,
        auth_timeout=25
    )
    
    _, stdout, stderr = ssh.exec_command('docker logs school-backend --tail 40')
    out = stdout.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    err = stderr.read().decode('utf-8', errors='ignore').encode('ascii', errors='ignore').decode('ascii')
    
    print("\n=== RECENT DOCKER SERVER LOGS ===")
    if out:
        print(out.strip())
    if err:
        print("STDERR:", err.strip())
        
    ssh.close()

if __name__ == '__main__':
    fetch_logs()
