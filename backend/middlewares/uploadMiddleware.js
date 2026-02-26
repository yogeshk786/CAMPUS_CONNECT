const multer = require('multer');

// Store the file in memory
const storage = multer.memoryStorage();

// Accept any file up to 10MB
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

// 👉 Exporting the raw function, NO curly braces
module.exports = upload;