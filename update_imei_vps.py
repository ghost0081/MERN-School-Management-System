import paramiko

def add_trackers(imeis=["86416308508497", "864163085121037"]):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect("200.141.9.19", username="root", password="Meets@081105", timeout=30)
    
    imei_list_js = str(imeis)
    
    js_script = f"""
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(async () => {{
    const Tracker = require('./models/trackerSchema');
    const imeis = {imei_list_js};
    
    for (const imei of imeis) {{
        await Tracker.findOneAndUpdate(
            {{ imei: String(imei) }},
            {{ 
                imei: String(imei), 
                deviceType: 'BLE_BEACON', 
                status: 'Online',
                last_updated: new Date()
            }},
            {{ upsert: true, new: true }}
        );
        console.log('[TRACKER ADDED/UPDATED]:', imei);
    }}
    process.exit(0);
}}).catch(err => {{
    console.error(err);
    process.exit(1);
}});
"""
    
    cmd = f"docker exec -i school-backend node -e \"{js_script.replace(chr(10), ' ')}\""
    stdin, stdout, stderr = client.exec_command(cmd)
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    
    print("[VPS OUTPUT]:", out)
    if err:
        print("[VPS ERR]:", err)
        
    client.close()

if __name__ == "__main__":
    add_trackers(["86416308508497", "864163085121037"])
