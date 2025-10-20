const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new category
router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().isLength({ min: 2, max: 50 }),
    body('description').optional().isString().isLength({ max: 200 }),
    body('slug').optional().isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const categoryData = req.body;
      const newCategory = new Category(categoryData);
      await newCategory.save();
      res.status(201).json({ message: 'Category created successfully', data: newCategory });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// UPDATE category by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: `Category ${id} updated successfully`, data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: `Category ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;