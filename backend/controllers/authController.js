const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // 👉 IMPORT BCRYPT

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// ==========================================
// REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, handle, role } = req.body; // 👉 ADD PASSWORD TO REQUEST

        const userExists = await User.findOne({ $or: [{ email }, { handle }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or handle already exists' });
        }

        // 👉 HASH THE PASSWORD BEFORE SAVING
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword, // 👉 SAVE THE HASHED PASSWORD
            handle,
            role: role || 'student'
        });

        const token = generateToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, 
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            handle: user.handle,
            role: user.role
        });

    } catch (error) {
        console.error("Error in registration:", error.message);
        res.status(500).json({ message: error.message }); 
    }
};

// ==========================================
// LOGIN USER
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // 👉 EXPECT PASSWORD IN LOGIN
        console.log("🚀 LOGIN ATTEMPT - Email:", email, "| Password:", password);
        
        const user = await User.findOne({ email });
        console.log("🕵️ USER FOUND IN DB:", user ? "YES! Name: " + user.name : "NO USER FOUND!") ;

        // 👉 VERIFY USER EXISTS AND PASSWORD MATCHES THE HASH
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);
            console.log("🔑 PASSWORD MATCH RESULT:", isMatch);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, 
            });

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                handle: user.handle,
                role: user.role
            });
        } else {
            // Send generic error for security (don't tell them if email or password was wrong)
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), // Sets the expiration date to the past so it deletes instantly
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
};
module.exports = { registerUser, loginUser, logoutUser };