
const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET all posts (public - only published posts, or user's own posts if authenticated)
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
        // If authenticated, show published posts + user's own posts (including drafts)
        query = {
          $or: [
            { isPublished: true },
            { author: decoded.userId }
          ]
        };
      } catch (err) {
        // If token is invalid, just show published posts
        query = { isPublished: true };
      }
    } else {
      // If not authenticated, only show published posts
      query = { isPublished: true };
    }

    const posts = await Post.find(query).populate('author', 'name email').populate('category', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET posts by current user (protected route)
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('author', 'name email').populate('category', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post is published or if user is the author
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    console.log('Post access check:', {
      postId: post._id,
      isPublished: post.isPublished,
      authorId: post.author._id.toString(),
      hasToken: !!token
    });

    if (!post.isPublished) {
      if (!token) {
        console.log('Access denied: No token provided for unpublished post');
        return res.status(403).json({ message: 'This post is not published. Please sign in if you are the author.' });
      }

      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
        console.log('Token decoded:', { userId: decoded.userId, authorId: post.author._id.toString() });

        if (post.author._id.toString() !== decoded.userId) {
          console.log('Access denied: User is not the author');
          return res.status(403).json({ message: 'This post is not published and you are not the author.' });
        }

        console.log('Access granted: User is the author');
      } catch (err) {
        console.log('Access denied: Token verification failed', err.message);
        return res.status(403).json({ message: 'Invalid authentication token.' });
      }
    } res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CREATE new post (Protected route)
router.post(
  '/',
  authenticateToken,
  [
    body('title').isString().trim().notEmpty().isLength({ max: 100 }),
    body('content').isString().notEmpty(),
    body('slug').isString().notEmpty(),
    body('category').isMongoId(),
    body('isPublished').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const postData = {
        ...req.body,
        author: req.user._id || req.user.userId // Use authenticated user's ID
      };

      const newPost = new Post(postData);
      await newPost.save();

      res.status(201).json({ message: 'Post created successfully', data: newPost });
    } catch (error) {
      console.error('Post creation error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);


// UPDATE post by ID (Protected route - only author can update)
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('content').optional().isString().notEmpty(),
    body('slug').optional().isString().notEmpty(),
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

      // First check if post exists and user is the author
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (existingPost.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'You can only update your own posts' });
      }

      const post = await Post.findByIdAndUpdate(id, updateData, { new: true });
      res.status(200).json({ message: `Post ${id} updated successfully`, data: post });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE post by ID (Protected route - only author can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if post exists and user is the author
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (existingPost.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: `Post ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLISH/UNPUBLISH post (Protected route - only author can publish)
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only publish/unpublish your own posts' });
    }

    post.isPublished = isPublished;
    await post.save();

    const action = isPublished ? 'published' : 'unpublished';
    res.status(200).json({
      message: `Post ${action} successfully`,
      data: post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports = router;