const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const redisClient = require('../config/redis');

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
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, 
    });
};

// ==========================================
// 🌐 GOOGLE LOGIN / REGISTER (Social Auth + Redis)
// ==========================================
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Google ID Token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload; 

        // 1. Get base user without populating yet (to save DB effort if cached)
        let user = await User.findOne({ $or: [{ email }, { googleId: sub }] });

        if (!user) {
            const baseHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const uniqueHandle = `${baseHandle}_${Math.floor(100 + Math.random() * 899)}`;

            user = await User.create({
                name,
                email,
                handle: uniqueHandle,
                avatar: picture,
                googleId: sub,
                role: 'student', 
                vTokens: 1000   
            });
            console.log("🆕 New User onboarded via Google:", user.handle);
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.avatar) user.avatar = picture;
            await user.save();
        }

        const token = generateToken(user._id);
        setTokenCookie(res, token);
        const cacheKey = `user_profile:${user._id}`;

        // ⚡ 2. REDIS: Check Cache First
        try {
            const cachedProfile = await redisClient.get(cacheKey);
            if (cachedProfile) {
                console.log("⚡ CACHE HIT (Google): Serving profile from Redis RAM!");
                return res.status(200).json({ ...JSON.parse(cachedProfile), token });
            }
        } catch (cacheErr) {
            console.error("Redis read error:", cacheErr);
        }

        // 🐢 3. CACHE MISS: Query MongoDB and Populate
        console.log("🐢 CACHE MISS (Google): Querying MongoDB and Populating...");
        const populatedUser = await User.findById(user._id)
            .populate('connections', '_id name avatar handle')
            .populate('sentRequests', '_id name handle');

        const profileData = {
            _id: populatedUser._id,
            name: populatedUser.name,
            email: populatedUser.email,
            handle: populatedUser.handle,
            role: populatedUser.role,
            avatar: populatedUser.avatar,
            vTokens: populatedUser.vTokens,
            connections: populatedUser.connections || [],
            sentRequests: populatedUser.sentRequests || []
        };

        // 💾 4. Save to Redis for next time! (Expires in 1 hour)
        try {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(profileData));
        } catch (cacheErr) {
            console.error("Redis write error:", cacheErr);
        }

        return res.status(200).json({ ...profileData, token });

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
            handle: handle.toLowerCase().trim(),
            role: role || 'student',
            vTokens: 500 
        });

        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            handle: user.handle,
            role: user.role,
            avatar: user.avatar,
            vTokens: user.vTokens,
            connections: [],
            sentRequests: []
        });

    } catch (error) {
        console.error("Error in registration:", error.message);
        res.status(500).json({ message: "Registration failed. Server error." }); 
    }
};

// ==========================================
// 🔑 LOGIN USER (Manual Email/Password + Redis)
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; 
        
        // 1. Find basic user to check password
        const baseUser = await User.findOne({ email: email.trim().toLowerCase() });

        if (baseUser && baseUser.password) {
            const isMatch = await bcrypt.compare(password, baseUser.password);

            if (isMatch) {
                const token = generateToken(baseUser._id);
                setTokenCookie(res, token);
                
                const cacheKey = `user_profile:${baseUser._id}`;

                // ⚡ 2. REDIS: Check Cache First
                try {
                    const cachedProfile = await redisClient.get(cacheKey);
                    if (cachedProfile) {
                        console.log("⚡ CACHE HIT (Login): Serving profile from Redis RAM in 2ms!");
                        return res.status(200).json({ ...JSON.parse(cachedProfile), token });
                    }
                } catch (cacheErr) {
                    console.error("Redis read error:", cacheErr);
                }

                // 🐢 3. CACHE MISS: Query MongoDB and Populate
                console.log("🐢 CACHE MISS (Login): Querying MongoDB and Populating...");
                const populatedUser = await User.findById(baseUser._id)
                    .populate('connections', '_id name avatar handle')
                    .populate('sentRequests', '_id name handle');

                const profileData = {
                    _id: populatedUser._id,
                    name: populatedUser.name,
                    email: populatedUser.email,
                    handle: populatedUser.handle,
                    role: populatedUser.role,
                    avatar: populatedUser.avatar,
                    vTokens: populatedUser.vTokens,
                    connections: populatedUser.connections || [],
                    sentRequests: populatedUser.sentRequests || []
                };

                // 💾 4. Save to Redis for next time! (Expires in 1 hour)
                try {
                    await redisClient.setEx(cacheKey, 3600, JSON.stringify(profileData));
                } catch (cacheErr) {
                    console.error("Redis write error:", cacheErr);
                }

                return res.status(200).json({ ...profileData, token });
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