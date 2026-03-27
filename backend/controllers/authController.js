const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// ==========================================
// GOOGLE LOGIN / REGISTER (Social Auth)
// ==========================================
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Google ID Token is required" });
        }

        // 1. Verify the ID Token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload; // 'sub' is the unique Google ID

        // 2. Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // 3. Create new user if they don't exist
            // We generate a random handle based on their Google ID
            const generatedHandle = `user_${sub.substring(0, 6)}`;
            
            // Generate a random password since field is likely required in Model
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);

            user = await User.create({
                name,
                email,
                handle: generatedHandle,
                avatar: picture,
                password: hashedPassword,
                role: 'student' // Default role
            });
            console.log("🆕 New User created via Google:", user.email);
        }

        // 4. Create our app's JWT
        const token = generateToken(user._id);

        // 5. Send Cookie
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
            role: user.role,
            avatar: user.avatar
        });

    } catch (error) {
        console.error("❌ Google Auth Error:", error.message);
        res.status(401).json({ message: "Invalid Google Token" });
    }
};

// ==========================================
// REGISTER USER (Email/Password)
// ==========================================
const registerUser = async (req, res) => {
    try {
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
            avatar,
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
            avatar: user.avatar
        });

    } catch (error) {
        console.error("Error in registration:", error.message);
        res.status(500).json({ message: error.message }); 
    }
};

// ==========================================
// LOGIN USER (Email/Password)
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();
        
        const user = await User.findOne({ email: cleanEmail });

        if (user) {
            const isMatch = await bcrypt.compare(cleanPassword, user.password);

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
                    avatar: user.avatar
                });
            }
        }

        res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// LOGOUT USER
// ==========================================
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), 
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, logoutUser, googleLogin };