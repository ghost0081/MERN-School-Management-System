import socket
import sys

def test_gt06_tcp(imei="864163085121037", lat=28.6139, lng=77.2090):
    server_ip = "200.141.9.19"
    server_port = 5023

    print(f"Connecting to GT06 TCP Server at {server_ip}:{server_port}...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(10)
    sock.connect((server_ip, server_port))
    print("[CONNECTED TO PORT 5023]")

    # 1. Send GT06 Login Packet (Protocol 0x01)
    # Header: 78 78 | Len: 0D | Prot: 01 | IMEI (8 bytes) | Serial: 00 01 | CRC: 2 bytes | Stop: 0D 0A
    # Convert 15-digit IMEI to 8-byte BCD buffer padded with 0
    padded_imei = imei.zfill(16)
    imei_bytes = bytes.fromhex(padded_imei)
    
    login_body = bytes([0x01]) + imei_bytes + bytes([0x00, 0x01])
    login_pkt = bytes([0x78, 0x78, len(login_body) + 4]) + login_body + bytes([0x00, 0x00, 0x0D, 0x0A])
    
    print(f"\n[1] SENDING GT06 LOGIN PACKET FOR IMEI {imei}...")
    sock.sendall(login_pkt)
    resp = sock.recv(1024)
    print(f"[LOGIN RESP]: {resp.hex().upper()}")

    # 2. Send GT06 Satellite Location Packet (Protocol 0x12)
    # Converts Lat/Lng to GT06 30000ths of minute encoding
    lat_val = int(abs(lat) * 60 * 30000)
    lng_val = int(abs(lng) * 60 * 30000)

    # Date: 2026-08-16 18:43:00 (YY MM DD HH MM SS)
    date_bytes = bytes([26, 8, 16, 18, 43, 0])
    
    # 12 bytes location info
    # course/status: bit 12=valid fix, bit 10=North, bit 11=East
    course_status = 0x1400 # GPS Valid + North + East
    
    loc_body = bytes([0x12]) + date_bytes + bytes([0x0C]) + lat_val.to_bytes(4, 'big') + lng_val.to_bytes(4, 'big') + bytes([0x0A]) + course_status.to_bytes(2, 'big') + bytes([0x00, 0x02])
    loc_pkt = bytes([0x78, 0x78, len(loc_body) + 4]) + loc_body + bytes([0x00, 0x00, 0x0D, 0x0A])

    print(f"\n[2] SENDING GT06 SATELLITE GPS LOCATION PACKET (Lat: {lat}, Lng: {lng})...")
    sock.sendall(loc_pkt)
    print("[SUCCESS] GT06 Satellite GPS Location Packet Transmitted over TCP Port 5023!")
    
    sock.close()

if __name__ == "__main__":
    test_gt06_tcp()
