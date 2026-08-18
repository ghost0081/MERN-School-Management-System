const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://praneetsrivastava4:l6uU7fS3aNn4Mpx1@cluster0.a8c4r.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const newImei = process.argv[2] || "86416308508497";

async function updateImei() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB!");

        const Student = require('./models/studentSchema');
        const Tracker = require('./models/trackerSchema');

        const student = await Student.findOne({ rollNum: 230050101134 });
        if (!student) {
            console.log("[ERROR] Student suresh (Roll: 230050101134) not found!");
            process.exit(1);
        }

        const oldImei = student.imei;
        student.imei = newImei;
        await student.save();

        console.log(`[SUCCESS] Updated Student '${student.name}' (Roll: 230050101134)`);
        console.log(`  * Old IMEI: ${oldImei}`);
        console.log(`  * New IMEI: ${newImei}`);

        await Tracker.findOneAndUpdate(
            { imei: newImei },
            {
                $set: {
                    imei: newImei,
                    deviceType: "BLE_BEACON",
                    status: "Online"
                }
            },
            { upsert: true, new: true }
        );

        console.log(`[SUCCESS] Tracker record initialized for IMEI ${newImei} in MongoDB!`);
        process.exit(0);
    } catch (e) {
        console.error("Error updating IMEI:", e.message);
        process.exit(1);
    }
}

updateImei();
