#!/usr/bin/env python3
"""
Hardware BLE Live Telemetry Monitor
------------------------------------
Streams real-time BLE telemetry logs directly from the production server
as your physical hardware tag broadcasts.

Usage:
  python hardware_ble_live_monitor.py
"""

import paramiko
import time
import sys
import datetime

SERVER_IP = '200.141.9.19'
SSH_USER = 'root'
SSH_PASS = 'Meets@081105'

def monitor_hardware():
    print("======================================================================")
    print("[MONITOR] HARDWARE BLE LIVE TELEMETRY MONITOR")
    print("======================================================================")
    print(f"Connecting to production server ({SERVER_IP})...")
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            SERVER_IP,
            username=SSH_USER,
            password=SSH_PASS,
            timeout=20,
            banner_timeout=20,
            auth_timeout=20
        )
        
        print("[OK] Connected successfully!")
        print("Listening for real-time hardware tag transmissions...\n")
        print("----------------------------------------------------------------------")
        print("Waiting for physical beacon broadcast (or mobile gateway app upload)...")
        print("----------------------------------------------------------------------\n")
        
        # Stream docker logs tailing only NEW lines (-f --tail 0)
        _, stdout, stderr = ssh.exec_command('docker logs school-backend -f --tail 0')
        
        while True:
            line = stdout.readline()
            if not line:
                time.sleep(0.1)
                continue
            
            text = line.strip()
            if not text:
                continue
                
            # Intercept BLE Telemetry receive logs
            if "[BLE TELEMETRY RECEIVE]" in text:
                now_str = datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3]
                print("\n" + "="*70)
                print(f"[BEACON DETECTED] HARDWARE TELEMETRY RECORDED AT {now_str}")
                print("="*70)
                
                # Parse log components
                parts = text.split(" [BLE TELEMETRY RECEIVE] ")
                log_data = parts[-1] if len(parts) > 1 else text
                
                print(f"  {log_data}")
                print("="*70 + "\n")
                sys.stdout.flush()
            elif "BLE" in text or "tracker" in text.lower():
                print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {text}")
                sys.stdout.flush()
                
    except KeyboardInterrupt:
        print("\n\nStopped hardware log monitor.")
    except Exception as e:
        print(f"\n[FAIL] Connection error: {e}")

if __name__ == '__main__':
    monitor_hardware()
