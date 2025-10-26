const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
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

    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    // Get paginated posts
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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

// SEARCH posts by query (title, content, tags)
router.get('/search', async (req, res) => {
  try {
    const { q: searchQuery, page = 1, limit = 10 } = req.query;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build search query - search in title and content (temporarily exclude tags)
    const searchRegex = new RegExp(searchQuery.trim(), 'i');

    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let query = {};

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
        // If authenticated, search published posts + user's own posts (including drafts)
        query = {
          $or: [
            { isPublished: true },
            { author: decoded.userId }
          ],
          $or: [
            { title: searchRegex },
            { content: searchRegex }
            // { tags: { $regex: searchRegex } } // Temporarily disabled
          ]
        };
      } catch (err) {
        // If token is invalid, just search published posts
        query = {
          isPublished: true,
          $or: [
            { title: searchRegex },
            { content: searchRegex }
            // { tags: { $regex: searchRegex } } // Temporarily disabled
          ]
        };
      }
    } else {
      // If not authenticated, only search published posts
      query = {
        isPublished: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex }
          // { tags: { $regex: searchQuery } } // Temporarily disabled
        ]
      };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limitNum);

    // Get search results
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPosts,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        searchQuery: searchQuery.trim()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET comments for a specific post
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get comments with populated user data
    const postWithComments = await Post.findById(postId)
      .populate('comments.user', 'name email')
      .select('comments');

    res.status(200).json(postWithComments.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD comment to a specific post (Protected route)
router.post(
  '/:postId/comments',
  authenticateToken,
  [
    body('content').isString().trim().notEmpty().isLength({ max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { postId } = req.params;
      const { content } = req.body;

      // Check if post exists
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Add comment using the model's addComment method
      const newComment = {
        user: req.user._id || req.user.userId,
        content: content.trim(),
        createdAt: new Date()
      };

      post.comments.push(newComment);
      await post.save();

      // Populate the new comment's user data
      const populatedPost = await Post.findById(postId)
        .populate('comments.user', 'name email')
        .select('comments');

      // Return the newly added comment
      const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

      res.status(201).json({
        message: 'Comment added successfully',
        comment: addedComment
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

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
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CREATE new post (Protected route)
router.post(
  '/',
  authenticateToken,
  upload,
  [
    body('title').isString().trim().notEmpty().isLength({ max: 100 }),
    body('content').isString().notEmpty(),
    body('slug').isString().notEmpty(),
    body('category').isMongoId(),
    body('isPublished').optional().isIn(['true', 'false']).toBoolean(),
  ],
  async (req, res) => {
    console.log('POST /api/posts - req.body:', req.body);
    console.log('POST /api/posts - req.file:', req.file);
    console.log('Incoming request body:', req.body);
    console.log('Incoming request file:', req.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Ensure featuredImage is a string path. Multer puts a file object on req.file;
      // client may also send a featuredImage field (e.g. when editing). Sanitize that.
      const postData = { ...req.body };

      // If multer provided a file, use its public uploads path.
      if (req.file && req.file.filename) {
        postData.featuredImage = `/uploads/${req.file.filename}`;
      } else if (postData.featuredImage && typeof postData.featuredImage === 'object') {
        // Remove any accidental object that would fail Mongoose string cast
        delete postData.featuredImage;
      }

      // Ensure author is set from the authenticated user
      postData.author = req.user._id || req.user.userId;

      const newPost = new Post(postData);
      await newPost.save();
      const populatedPost = await newPost.populate('author', 'name email').populate('category', 'name');
      res.status(201).json({ message: 'Post created successfully', data: populatedPost });
    } catch (error) {
      console.error('Post creation error:', error);
      // If Mongoose validation error, return 400 with details
      if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ errors: details });
      }
      res.status(500).json({ error: error.message });
    }
  }
);


// UPDATE post by ID (Protected route - only author can update)
router.put(
  '/:id',
  authenticateToken,
  upload,
  [
    body('title').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('content').optional().isString().notEmpty(),
    body('slug').optional().isString().notEmpty(),
    body('category').optional().isMongoId(),
    body('isPublished').optional().isIn(['true', 'false']).toBoolean(),
  ],
  async (req, res) => {
    console.log('PUT /api/posts/:id - req.body:', req.body);
    console.log('PUT /api/posts/:id - req.file:', req.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.file && req.file.filename) {
        updateData.featuredImage = `/uploads/${req.file.filename}`;
      } else if (updateData.featuredImage && typeof updateData.featuredImage === 'object') {
        // Remove invalid object-valued featuredImage so Mongoose won't attempt to cast it
        delete updateData.featuredImage;
      }

      // First check if post exists and user is the author
      const existingPost = await Post.findById(id);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const requesterId = req.user && (req.user._id ? req.user._id.toString() : req.user.userId);
      if (existingPost.author.toString() !== requesterId) {
        return res.status(403).json({ message: 'You can only update your own posts' });
      }

      const post = await Post.findByIdAndUpdate(id, updateData, { new: true })
        .populate('author', 'name email')
        .populate('category', 'name');
      res.status(200).json({ message: `Post ${id} updated successfully`, data: post });
    } catch (error) {
      console.error('Post update error:', error);
      if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({ errors: details });
      }
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

    // Get requester ID with proper validation
    if (!req.user || (!req.user._id && !req.user.userId)) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const requesterId = req.user._id ? req.user._id.toString() : req.user.userId.toString();
    const postAuthorId = existingPost.author.toString();

    console.log('Delete attempt:', {
      postId: id,
      requesterId,
      postAuthorId,
      isOwner: postAuthorId === requesterId
    });

    if (postAuthorId !== requesterId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: `Post ${id} deleted successfully` });
  } catch (error) {
    console.error('Delete post error:', error);
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
    const requesterId = req.user && (req.user._id ? req.user._id.toString() : req.user.userId);
    if (post.author.toString() !== requesterId) {
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