const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;
        if (!name || !email || !address || !password) return res.status(400).json({ msg: 'All fields are required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const user = new User({ name, email, address, password });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, address, bio, profilePicture } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.user.userId, { name, address, bio, profilePicture }, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ msg: 'Server error', error });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
