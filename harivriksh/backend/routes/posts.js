const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, optionalAuth } = require('../middleware/auth');

// GET /api/posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, page = 1, limit = 10, sort = 'latest' } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    let sortOpt = { createdAt: -1 };
    if (sort === 'popular') sortOpt = { likes: -1 };
    if (sort === 'views') sortOpt = { views: -1 };
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name avatar city')
      .populate('plant', 'name emoji')
      .sort(sortOpt)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    res.json({ success: true, posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/posts
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, images, plant, tags } = req.body;
    const post = await Post.create({ author: req.user._id, title, content, category, images, plant, tags });
    await post.populate('author', 'name avatar city');
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('author', 'name avatar city')
     .populate('plant', 'name emoji')
     .populate('comments.author', 'name avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'name avatar');
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/posts/:id/comments/:commentId/solution - Toggle Verified Solution
router.post('/:id/comments/:commentId/solution', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only post author can mark verified solution' });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.isSolution = !comment.isSolution;
    post.isSolved = post.comments.some(c => c.isSolution);
    await post.save();
    await post.populate('comments.author', 'name avatar');

    res.json({ success: true, post, isSolved: post.isSolved, isSolution: comment.isSolution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
