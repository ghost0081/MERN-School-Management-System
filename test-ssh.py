import paramiko

def test_connection():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to root@200.141.9.19...")
        ssh.connect('200.141.9.19', username='root', password='Meets@081105', timeout=10)
        print("Successfully connected!")
        
        stdin, stdout, stderr = ssh.exec_command('uname -a && uptime')
        output = stdout.read().decode().strip()
        print("Server Output:\n", output)
        ssh.close()
    except Exception as e:
        print("SSH Connection failed:", str(e))

if __name__ == '__main__':
    test_connection()
