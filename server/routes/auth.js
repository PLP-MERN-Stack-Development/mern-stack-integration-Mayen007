const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

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
      const newUser = new User(userData);
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully', data: newUser });
    } catch (error) {
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
      res.status(200).json({ message: 'Login successful', data: user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;