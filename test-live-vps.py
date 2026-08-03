import socket
import binascii

def test_remote_gt06():
    host = '200.141.9.19'
    port = 5023
    
    print(f"Connecting across internet to Hostinger VPS GT06 Server at {host}:{port}...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(10)
    try:
        s.connect((host, port))
        print("Connected! Sending GT06 Login Packet (0x01)...")
        
        # Example Login hex from manual: 78780D010353419033412836000D33510D0A (IMEI 353419033412836)
        login_packet = binascii.unhexlify("78780D010353419033412836000D33510D0A")
        s.send(login_packet)
        
        data = s.recv(1024)
        ack_hex = binascii.hexlify(data).decode('ascii').upper()
        print(f"Received Server ACK from {host}: {ack_hex}")
        
        if ack_hex.startswith("78780501"):
            print("=== SUCCESS! HOSTINGER VPS GT06 TRACKING SERVER IS 100% WORKING AND ACCESSIBLE FROM THE INTERNET! ===")
        else:
            print("Received unexpected ACK format.")
        s.close()
    except Exception as e:
        print("Connection failed:", str(e))

if __name__ == '__main__':
    test_remote_gt06()
