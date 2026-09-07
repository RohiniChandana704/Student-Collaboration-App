const Post = require("../models/Post");
const Notification = require("../models/Notification");

// @desc Create a new post
// @route POST /api/posts
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
  return res.status(400).json({
    message: "Please provide title, content and category",
  });
}

if (title.length > 150) {
  return res.status(400).json({ message: "Title must be 150 characters or fewer" });
}

if (content.length > 5000) {
  return res.status(400).json({ message: "Content must be 5000 characters or fewer" });
}

if (category.length > 50) {
  return res.status(400).json({ message: "Category must be 50 characters or fewer" });
}

    const post = await Post.create({
      author: req.user._id,
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

// @desc Get all posts (optionally filter by category)
// @route GET /api/posts
const getPosts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const posts = await Post.find(filter)
      .populate("author", "name email")
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

// @desc Get a single post by id
// @route GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate("comments.author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.user) {
      const alreadyViewed = post.viewedBy.some(
        (id) => id.toString() === req.user._id.toString()
      );

      if (!alreadyViewed) {
        post.views += 1;
        post.viewedBy.push(req.user._id);
        await post.save();
      }
    }

    res.json(post);
  } catch (error) {
    console.error("GET POST ERROR:", error);
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
};

// @desc Update a post (author only)
// @route PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { title, content, category } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;

    await post.save();

    res.json(post);
  } catch (error) {
    console.error("UPDATE POST ERROR:", error);
    res.status(500).json({ message: "Failed to update post", error: error.message });
  }
};

// @desc Delete a post (author only)
// @route DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

// @desc Like or unlike a post (toggle)
// @route PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);

      // Notify the post author, but not if they liked their own post
      if (post.author.toString() !== userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: "like",
          post: post._id,
          message: `${req.user.name} liked your post "${post.title}"`,
        });
      }
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("TOGGLE LIKE ERROR:", error);
    res.status(500).json({ message: "Failed to toggle like", error: error.message });
  }
};

// @desc Add a comment to a post
// @route POST /api/posts/:id/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

   if (!text) {
  return res.status(400).json({ message: "Comment text is required" });
}

if (text.length > 1000) {
  return res.status(400).json({ message: "Comment must be 1000 characters or fewer" });
}

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      author: req.user._id,
      text,
    });

    await post.save();

    // Notify the post author, but not if they commented on their own post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: "comment",
        post: post._id,
        message: `${req.user.name} commented on your post "${post.title}"`,
      });
    }

    const updatedPost = await Post.findById(req.params.id).populate(
      "comments.author",
      "name email"
    );

    res.status(201).json(updatedPost.comments);
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

// @desc Delete a comment (comment author only)
// @route DELETE /api/posts/:id/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
};