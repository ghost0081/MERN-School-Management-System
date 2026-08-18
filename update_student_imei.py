import os
import sys
from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb+srv://praneetsrivastava4:l6uU7fS3aNn4Mpx1@cluster0.a8c4r.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0")

def update_imei(new_imei="86416308508497"):
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    students = db.students
    trackers = db.trackers

    # Find student suresh
    student = students.find_one({"rollNum": 230050101134})
    if not student:
        print("[ERROR] Student suresh (Roll: 230050101134) not found!")
        return

    old_imei = student.get("imei", "None")
    
    # Update student record
    students.update_one({"_id": student["_id"]}, {"$set": {"imei": new_imei}})
    print(f"[SUCCESS] Updated Student '{student.get('name')}' (Roll: 230050101134)")
    print(f"  * Old IMEI: {old_imei}")
    print(f"  * New IMEI: {new_imei}")

    # Ensure tracker record exists for new IMEI
    trackers.update_one(
        {"imei": new_imei},
        {
            "$set": {
                "imei": new_imei,
                "deviceType": "BLE_BEACON",
                "status": "Online",
                "last_updated": None
            }
        },
        upsert=True
    )
    print(f"[SUCCESS] Tracker record initialized for IMEI {new_imei} in MongoDB!")

if __name__ == "__main__":
    new_imei = sys.argv[1] if len(sys.argv) > 1 else "86416308508497"
    update_imei(new_imei)
