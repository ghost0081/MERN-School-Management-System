# ESP32-C3 & EC200U Tracking API Integration Guide

This guide describes how to send telemetry data from the ESP32-C3 wearable to the backend server, and how the Admin dashboard retrieves the coordinates.

---

## 1. Base Server URLs
* **Local Development**: `http://localhost:5000`
* **Production API**: `https://api.yourdomain.com` (Update this in production)

---

## 2. API Endpoints

### Endpoint 1: Send GPS Coordinates (Client ➜ Server)
Updates the latitude, longitude, and speed of the wearable.

* **Method**: `POST`
* **Path**: `/api/tracker/gps`
* **Headers**:
  * `Content-Type: application/json`
  * `X-Device-Token: esp32c3_secret_token_123`
  * `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36` (Spoofs a standard browser to bypass automated bot detection)
* **Request Body**:
  ```json
  {
    "device_id": "student_device_001",
    "latitude": 29.3445,
    "longitude": 79.5634,
    "speed": 12.5,
    "timestamp": 1780838890
  }
  ```
  *(Note: `timestamp` is a Unix timestamp in seconds or milliseconds. If omitted, the server defaults to the current server time).*

---

### Endpoint 2: Send Cell Tower Info (Client ➜ Server)
Pushes network metrics and signal strength for redundancy/fallback localization.

* **Method**: `POST`
* **Path**: `/api/tracker/cell`
* **Headers**:
  * `Content-Type: application/json`
  * `X-Device-Token: esp32c3_secret_token_123`
  * `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
* **Request Body**:
  ```json
  {
    "device_id": "student_device_001",
    "mcc": 404,
    "mnc": 45,
    "lac": "4F1E",
    "cell_id": "3B8A",
    "signal": -72
  }
  ```

---

### Endpoint 3: Fetch Location and Cell Data (Admin ➜ Server)
Retrieves aggregated telemetry for the selected wearable device.

* **Method**: `GET`
* **Path**: `/api/admin/:device_id`
* **Response Body**:
  ```json
  {
    "device_id": "student_device_001",
    "gps": {
      "latitude": 29.3445,
      "longitude": 79.5634,
      "speed": 12.5,
      "last_updated": "2026-06-07T13:28:10.000Z"
    },
    "network": {
      "mcc": 404,
      "mnc": 45,
      "lac": "4F1E",
      "cell_id": "3B8A",
      "signal": -72,
      "last_updated": "2026-06-07T16:09:29.208Z"
    }
  }
  ```

---

### Endpoint 4: List Active Wearable Device IDs (Admin ➜ Server)
Lists all device IDs currently cached in RAM.

* **Method**: `GET`
* **Path**: `/api/tracker/devices`
* **Response Body**:
  ```json
  [
    "student_device_001",
    "student_device_002"
  ]
  ```

---

## 3. How to Test / Send Requests

### Option A: Testing via PowerShell (Windows)

**GPS Coordinates Update**:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tracker/gps" `
  -Method Post `
  -Headers @{
    "X-Device-Token" = "esp32c3_secret_token_123"
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  } `
  -ContentType "application/json" `
  -Body '{"device_id":"student_device_001","latitude":29.3445,"longitude":79.5634,"speed":25.0,"timestamp":1780838890}'
```

**Cell Metrics Update**:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tracker/cell" `
  -Method Post `
  -Headers @{
    "X-Device-Token" = "esp32c3_secret_token_123"
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  } `
  -ContentType "application/json" `
  -Body '{"device_id":"student_device_001","mcc":404,"mnc":45,"lac":"4F1E","cell_id":"3B8A","signal":-72}'
```

---

### Option B: Testing via cURL (macOS / Linux / Command Prompt)

**GPS Coordinates Update**:
```bash
curl -X POST http://localhost:5000/api/tracker/gps \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: esp32c3_secret_token_123" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -d '{"device_id":"student_device_001","latitude":29.3445,"longitude":79.5634,"speed":25.0,"timestamp":1780838890}'
```

**Cell Metrics Update**:
```bash
curl -X POST http://localhost:5000/api/tracker/cell \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: esp32c3_secret_token_123" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -d '{"device_id":"student_device_001","mcc":404,"mnc":45,"lac":"4F1E","cell_id":"3B8A","signal":-72}'
```

---

### Option C: Python Request Script (`requests` library)
```python
import requests
import json
import time

url = "http://localhost:5000/api/tracker/gps"
headers = {
    "Content-Type": "application/json",
    "X-Device-Token": "esp32c3_secret_token_123",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
payload = {
    "device_id": "student_device_001",
    "latitude": 29.3445,
    "longitude": 79.5634,
    "speed": 18.2,
    "timestamp": int(time.time())
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```
