const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
        // 👉 FIX 1: Frontend se avatar bhi accept karein
        const { name, email, password, handle, role, avatar } = req.body; 

        const userExists = await User.findOne({ $or: [{ email }, { handle }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or handle already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            handle,
            avatar, // 👉 FIX 2: Database mein avatar save karein
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
            role: user.role,
            avatar: user.avatar // 👉 FIX 3: Frontend ko photo bhejein
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
        const { email, password } = req.body; 
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        console.log("🚀 LOGIN ATTEMPT - Email:", cleanEmail, "| Password:", cleanPassword);
        
        const user = await User.findOne({ email: cleanEmail });
        console.log("🕵️ USER FOUND IN DB:", user ? "YES! Name: " + user.name : "NO USER FOUND!");

        if (user) {
            const isMatch = await bcrypt.compare(cleanPassword, user.password);
            console.log("🔑 PASSWORD MATCH RESULT:", isMatch);

            if (isMatch) {
                const token = generateToken(user._id);

                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', 
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000, 
                });

                return res.status(200).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    handle: user.handle,
                    role: user.role,
                    avatar: user.avatar // 👉 THE ULTIMATE FIX: Login ke waqt photo bhejein!
                });
            }
        }

        res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), 
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, logoutUser };