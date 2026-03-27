const mongoose = require('mongoose');

/**
 * 📡 DATABASE CONNECTION ENGINE
 * Is engine ko is tarah design kiya gaya hai ki ye terminal mein 
 * saaf bataye ki cluster ke andar kaunsa specific DB connect hua hai.
 */
const connectDB = async () => {
    try {
        // StrictQuery setup (Optional but good practice for Mongoose 7+)
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`-----------------------------------------`);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // 👉 CRITICAL LOG: Ye batayega ki aap 'campus_connect' mein ho ya 'judgementDB' mein
        console.log(`📂 Active Database:  ${conn.connection.name}`); 
        console.log(`-----------------------------------------`);

    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;