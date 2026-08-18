import express from 'express';
import { db } from '../db/database';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

function checkIsAdminUser(user?: { role?: string; email?: string } | null) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const adminEmails = [
    'anjalireal24@gmail.com',
    'admin@travelwise.ai',
    'admin@aitripplanner.com',
    'amritis2415@gmail.com',
  ];
  return adminEmails.includes((user.email || '').toLowerCase());
}

// 1. Get community feed posts
router.get('/posts', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const {
      search,
      tag,
      destination,
      post_type,
      filter,
      author_id,
      limit,
      offset,
    } = req.query;

    const result = db.getCommunityPosts({
      search: search as string,
      tag: tag as string,
      destination: destination as string,
      post_type: post_type as string,
      filter: filter as 'latest' | 'popular' | 'most_liked',
      author_id: author_id as string,
      user_id: req.user?.id,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    res.json({
      posts: result.posts,
      total: result.total,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch community posts' });
  }
});

// 2. Get single community post
router.get('/posts/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const post = db.getCommunityPostById(req.params.id, req.user?.id);
    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }
    res.json({ post });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch post' });
  }
});

// 3. Create a community post
router.post('/posts', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const {
      title,
      content,
      destination,
      trip_id,
      trip_snapshot,
      images,
      tags,
      post_type,
      visibility,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Post title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const fullUser = db.findUserById(user.id);
    const authorImage = fullUser?.profile_image || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`;

    const newPost = db.createCommunityPost({
      author_id: user.id,
      author_name: user.name || 'Traveler',
      author_image: authorImage,
      title: title.trim(),
      content: content.trim(),
      destination: (destination || 'Global Travel').trim(),
      trip_id: trip_id || undefined,
      trip_snapshot: trip_snapshot || undefined,
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags : ['Travel'],
      post_type: post_type || 'story',
      visibility: visibility === 'private' ? 'private' : 'public',
    });

    db.recordEvent('community_post_created', user.id, {
      postId: newPost.id,
      destination: newPost.destination,
      post_type: newPost.post_type,
    });

    res.status(201).json({
      post: {
        ...newPost,
        is_liked_by_user: false,
        is_saved_by_user: false,
      },
      message: 'Post created successfully',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create post' });
  }
});

// 4. Update community post
router.put('/posts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const isAdmin = checkIsAdminUser(user);
    const updates = req.body;

    const updated = db.updateCommunityPost(req.params.id, user.id, updates, isAdmin);
    if (!updated) {
      return res.status(404).json({ error: 'Post not found or could not be updated' });
    }

    res.json({ post: updated, message: 'Post updated successfully' });
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Failed to update post' });
  }
});

// 5. Delete community post
router.delete('/posts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const isAdmin = checkIsAdminUser(user);

    const success = db.deleteCommunityPost(req.params.id, user.id, isAdmin);
    if (!success) {
      return res.status(404).json({ error: 'Post not found or deletion not authorized' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Failed to delete post' });
  }
});

// 6. Like / Unlike a post
router.post('/posts/:id/like', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const result = db.toggleCommunityPostLike(req.params.id, user.id, user.name);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle like' });
  }
});

// 7. Get likes for a post
router.get('/posts/:id/likes', (req, res) => {
  try {
    const likes = db.getCommunityPostLikes(req.params.id);
    res.json({ likes, count: likes.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch likes' });
  }
});

// 8. Get comments for a post
router.get('/posts/:id/comments', (req, res) => {
  try {
    const comments = db.getCommunityPostComments(req.params.id);
    res.json({ comments });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch comments' });
  }
});

// 9. Add comment to a post
router.post('/posts/:id/comments', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const fullUser = db.findUserById(user.id);
    const userImage = fullUser?.profile_image || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`;

    const comment = db.addCommunityComment({
      post_id: req.params.id,
      user_id: user.id,
      user_name: user.name || 'Traveler',
      user_image: userImage,
      content: content.trim(),
    });

    res.status(201).json({ comment, message: 'Comment added' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add comment' });
  }
});

// 10. Update comment
router.put('/comments/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const updated = db.updateCommunityComment(req.params.id, user.id, content.trim());
    res.json({ comment: updated, message: 'Comment updated' });
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Failed to update comment' });
  }
});

// 11. Delete comment
router.delete('/comments/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const isAdmin = checkIsAdminUser(user);

    const success = db.deleteCommunityComment(req.params.id, user.id, isAdmin);
    if (!success) {
      return res.status(404).json({ error: 'Comment not found or deletion not authorized' });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Failed to delete comment' });
  }
});

// 12. Save / Bookmark post
router.post('/posts/:id/save', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const result = db.toggleSaveCommunityPost(req.params.id, user.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle save' });
  }
});

// 13. Get current user's saved posts
router.get('/saved', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const posts = db.getSavedCommunityPosts(user.id);
    res.json({ posts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved posts' });
  }
});

// 14. Report a post
router.post('/posts/:id/report', optionalAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { reason, details } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Reason for report is required' });
    }

    const reporterId = req.user?.id || 'anonymous';
    const reporterName = req.user?.name || 'Anonymous Traveler';

    const report = db.createCommunityReport({
      post_id: req.params.id,
      reporter_id: reporterId,
      reporter_name: reporterName,
      reason,
      details: details || '',
    });

    res.status(201).json({ report, message: 'Report submitted for review. Thank you for keeping our community safe.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit report' });
  }
});

// 15. Admin: Get reports
router.get('/admin/reports', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    if (!checkIsAdminUser(user)) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const reports = db.getCommunityReports();
    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reports' });
  }
});

// 16. Admin: Update report status
router.put('/admin/reports/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    if (!checkIsAdminUser(user)) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { status } = req.body;
    const report = db.updateCommunityReport(req.params.id, status);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report, message: 'Report updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update report' });
  }
});

// 17. Get public user profile (safe info only, no email/private data)
router.get('/users/:id', (req, res) => {
  try {
    const profile = db.getPublicUserProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user profile' });
  }
});

export default router;
