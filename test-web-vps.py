import urllib.request
import json

def test_api():
    url = "http://200.141.9.19:5000/api/admin/864163085084979"
    print(f"Fetching live tracker JSON from {url}...")
    try:
        req = urllib.request.urlopen(url, timeout=10)
        data = json.loads(req.read().decode('utf-8'))
        print("=== LIVE SERVER RESPONSE FOR IMEI 864163085084979 ===")
        print(json.dumps(data, indent=2))
    except Exception as e:
        print("Error fetching API:", str(e))

if __name__ == '__main__':
    test_api()
