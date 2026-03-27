const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Generate JWT Token
 * @param   {String} id - User ID
 * @returns {String} JWT
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Set JWT Cookie in Response
 */
const setTokenCookie = (res, token) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

// ==========================================
// 🌐 GOOGLE LOGIN / REGISTER (Social Auth)
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
        const { email, name, picture, sub } = payload; 

        // 2. Check if user already exists (by email or googleId)
        let user = await User.findOne({ $or: [{ email }, { googleId: sub }] });

        if (!user) {
            // 3. Create new user if they don't exist
            // Generate a unique handle from email (e.g., "john.doe@gmail.com" -> "johndoe_482")
            const baseHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const uniqueHandle = `${baseHandle}_${Math.floor(100 + Math.random() * 899)}`;

            user = await User.create({
                name,
                email,
                handle: uniqueHandle,
                avatar: picture,
                googleId: sub,
                role: 'student', // Default role
                vTokens: 1000   // New user bonus
            });
            console.log("🆕 New User onboarded via Google:", user.handle);
        } else {
            // If user exists but googleId wasn't linked yet, link it
            if (!user.googleId) {
                user.googleId = sub;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        }

        // 4. Auth success - Generate Token & Send Cookie
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            handle: user.handle,
            role: user.role,
            avatar: user.avatar,
            vTokens: user.vTokens
        });

    } catch (error) {
        console.error("❌ Google Auth Error:", error.message);
        res.status(401).json({ message: "Authentication failed. Please try again." });
    }
};

// ==========================================
// 📧 REGISTER USER (Manual Email/Password)
// ==========================================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, handle, role } = req.body; 

        // 1. Validation check for existing email/handle
        const userExists = await User.findOne({ $or: [{ email }, { handle }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or handle already exists' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            handle: handle.toLowerCase().trim(),
            role: role || 'student',
            vTokens: 500 // Joining bonus for manual register
        });

        // 4. Set Token
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            handle: user.handle,
            role: user.role,
            avatar: user.avatar,
            vTokens: user.vTokens
        });

    } catch (error) {
        console.error("Error in registration:", error.message);
        res.status(500).json({ message: "Registration failed. Server error." }); 
    }
};

// ==========================================
// 🔑 LOGIN USER (Manual Email/Password)
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 
        
        // Find user by email
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (user && user.password) {
            // Verify Password
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const token = generateToken(user._id);
                setTokenCookie(res, token);

                return res.status(200).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    handle: user.handle,
                    role: user.role,
                    avatar: user.avatar,
                    vTokens: user.vTokens
                });
            }
        }

        res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error("Error in login:", error.message);
        res.status(500).json({ message: "Login failed. Server error." });
    }
};

// ==========================================
// 🚪 LOGOUT USER
// ==========================================
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), 
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, logoutUser, googleLogin };