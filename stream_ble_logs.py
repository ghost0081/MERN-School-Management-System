import paramiko
import time
import sys

def stream_ble_logs():
    print("=== CONNECTING TO VPS TO STREAM LIVE BLE TELEMETRY LOGS ===")
    print("Press Ctrl+C at any time to stop streaming.\n")
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            '200.141.9.19',
            username='root',
            password='Meets@081105',
            timeout=20
        )
        
        print("Connected! Listening for live incoming BLE Beacon packets...\n")
        
        # Run docker logs -f to stream continuously
        _, stdout, stderr = ssh.exec_command('docker logs school-backend -f --tail 10')
        
        while True:
            line = stdout.readline()
            if not line:
                time.sleep(0.1)
                continue
            clean_line = line.strip()
            if clean_line:
                print(f"[SERVER LOG] {clean_line}")
                sys.stdout.flush()
                
    except KeyboardInterrupt:
        print("\nLog streaming stopped by user.")
    except Exception as e:
        print(f"Streaming error: {e}")

if __name__ == '__main__':
    stream_ble_logs()
