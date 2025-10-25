const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// REGISTER new user
router.post(
  '/register',
  [
    body('name').isString().trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().trim().isLength({ min: 6, max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const userData = req.body;
      console.log('Registration attempt with data:', userData);

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const newUser = new User(userData);
      console.log('Created new user object:', { name: newUser.name, email: newUser.email });

      await newUser.save();
      console.log('User saved successfully');

      // Generate JWT token
      const token = generateToken(newUser);

      // Don't send password in response
      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      };

      res.status(201).json({
        message: 'User registered successfully',
        data: userResponse,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);
// LOGIN user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().trim().isLength({ min: 6, max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Don't send password in response
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };

      res.status(200).json({
        message: 'Login successful',
        data: userResponse,
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;