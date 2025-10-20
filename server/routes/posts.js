
const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CREATE new post
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().isLength({ max: 100 }),
    body('content').isString().notEmpty(),
    body('slug').isString().notEmpty(),
    body('author').isMongoId(),
    body('category').isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const postData = req.body;
      const newPost = new Post(postData);
      await newPost.save();
      res.status(201).json({ message: 'Post created successfully', data: newPost });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


// UPDATE post by ID
router.put(
  '/:id',
  [
    body('title').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('content').optional().isString().notEmpty(),
    body('slug').optional().isString().notEmpty(),
    body('author').optional().isMongoId(),
    body('category').optional().isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const updateData = req.body;
      const post = await Post.findByIdAndUpdate(id, updateData, { new: true });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json({ message: `Post ${id} updated successfully`, data: post });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE post by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: `Post ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;