import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db as firestoreDb } from '../lib/firebase';
import { apiCommunity } from './api';
import {
  CommunityPost,
  CommunityComment,
  CommunityLike,
  SavedCommunityPost,
  CommunityReport,
  PublicUserProfile,
} from '../types';

export class CommunityService {
  /**
   * Subscribe to real-time public community posts with fallback
   */
  static subscribeToFeed(
    onPostsUpdate: (posts: CommunityPost[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    let unsubscribeFirestore: (() => void) | null = null;
    let isFirestoreActive = false;

    try {
      if (firestoreDb) {
        const postsRef = collection(firestoreDb, 'community_posts');
        const q = query(
          postsRef,
          where('visibility', '==', 'public')
        );

        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            isFirestoreActive = true;
            const posts: CommunityPost[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              posts.push({
                id: docSnap.id,
                ...data,
                created_at: data.created_at || new Date().toISOString(),
                updated_at: data.updated_at || new Date().toISOString(),
              } as CommunityPost);
            });

            // Sort newest first
            posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            onPostsUpdate(posts);
          },
          (err) => {
            console.warn('Firestore subscription notice, syncing with API backend:', err);
            isFirestoreActive = false;
            // Fallback to API polling
            this.fetchPostsFromApi(onPostsUpdate, onError);
          }
        );
      }
    } catch (e) {
      console.warn('Could not initialize Firestore listener:', e);
      this.fetchPostsFromApi(onPostsUpdate, onError);
    }

    // Always do an initial API check to merge or fallback
    this.fetchPostsFromApi(onPostsUpdate, onError);

    // Periodic sync fallback
    const interval = setInterval(() => {
      if (!isFirestoreActive) {
        this.fetchPostsFromApi(onPostsUpdate, onError);
      }
    }, 12000);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearInterval(interval);
    };
  }

  private static async fetchPostsFromApi(
    onPostsUpdate: (posts: CommunityPost[]) => void,
    onError?: (err: Error) => void
  ) {
    try {
      const res = await apiCommunity.getPosts();
      if (res && res.posts) {
        onPostsUpdate(res.posts as CommunityPost[]);
      }
    } catch (err: any) {
      if (onError) onError(err);
    }
  }

  /**
   * Fetch posts with flexible filtering
   */
  static async getPosts(filters: {
    search?: string;
    tag?: string;
    destination?: string;
    post_type?: string;
    filter?: string;
    author_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ posts: CommunityPost[]; total: number }> {
    try {
      const res = await apiCommunity.getPosts(filters);
      return {
        posts: res.posts as CommunityPost[],
        total: res.total,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0 };
    }
  }

  /**
   * Get single post
   */
  static async getPostById(postId: string): Promise<CommunityPost | null> {
    try {
      const res = await apiCommunity.getPost(postId);
      return res.post as CommunityPost;
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  }

  /**
   * Create a new community post and write to both Firestore and Backend
   */
  static async createPost(postData: {
    author_id: string;
    author_name: string;
    author_image?: string;
    title: string;
    content: string;
    destination: string;
    trip_id?: string;
    trip_snapshot?: any;
    images?: string[];
    tags?: string[];
    post_type?: string;
    visibility?: 'public' | 'private';
  }): Promise<CommunityPost> {
    // 1. Send to backend
    const apiRes = await apiCommunity.createPost(postData);
    const createdPost = apiRes.post as CommunityPost;

    // 2. Also write to Firestore directly for real-time sync across connected clients
    try {
      if (firestoreDb && createdPost.id) {
        const postDocRef = doc(firestoreDb, 'community_posts', createdPost.id);
        await setDoc(postDocRef, {
          ...createdPost,
          created_at: createdPost.created_at || new Date().toISOString(),
          updated_at: createdPost.updated_at || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Direct Firestore post write notification:', err);
    }

    return createdPost;
  }

  /**
   * Update existing post
   */
  static async updatePost(
    postId: string,
    updates: Partial<CommunityPost>
  ): Promise<CommunityPost> {
    const res = await apiCommunity.updatePost(postId, updates);
    const updated = res.post as CommunityPost;

    try {
      if (firestoreDb) {
        const docRef = doc(firestoreDb, 'community_posts', postId);
        await updateDoc(docRef, {
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore update sync notification:', err);
    }

    return updated;
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string): Promise<boolean> {
    const res = await apiCommunity.deletePost(postId);

    try {
      if (firestoreDb) {
        const docRef = doc(firestoreDb, 'community_posts', postId);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.warn('Firestore delete sync notification:', err);
    }

    return res.success;
  }

  /**
   * Toggle Like
   */
  static async toggleLike(
    postId: string,
    userId: string,
    userName?: string
  ): Promise<{ is_liked: boolean; likes_count: number }> {
    const res = await apiCommunity.toggleLike(postId);

    try {
      if (firestoreDb) {
        const likeDocId = `${postId}_${userId}`;
        const likeDocRef = doc(firestoreDb, 'community_likes', likeDocId);
        const postDocRef = doc(firestoreDb, 'community_posts', postId);

        if (res.is_liked) {
          await setDoc(likeDocRef, {
            id: likeDocId,
            post_id: postId,
            user_id: userId,
            user_name: userName || 'Traveler',
            created_at: new Date().toISOString(),
          });
          await updateDoc(postDocRef, {
            likes_count: increment(1),
          }).catch(() => {});
        } else {
          await deleteDoc(likeDocRef).catch(() => {});
          await updateDoc(postDocRef, {
            likes_count: increment(-1),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Firestore like sync notice:', err);
    }

    return res;
  }

  /**
   * Get Comments
   */
  static async getComments(postId: string): Promise<CommunityComment[]> {
    try {
      const res = await apiCommunity.getComments(postId);
      return res.comments as CommunityComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Subscribe to Comments on a Post
   */
  static subscribeToComments(
    postId: string,
    onCommentsUpdate: (comments: CommunityComment[]) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;
    let isFirestoreActive = false;

    try {
      if (firestoreDb) {
        const commRef = collection(firestoreDb, 'community_comments');
        const q = query(commRef, where('post_id', '==', postId));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            isFirestoreActive = true;
            const list: CommunityComment[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...docSnap.data() } as CommunityComment);
            });
            list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            
            // Build threaded hierarchy
            const rootComments: CommunityComment[] = [];
            const replyMap = new Map<string, CommunityComment[]>();
            list.forEach((c) => {
              if (c.parent_comment_id) {
                const existing = replyMap.get(c.parent_comment_id) || [];
                existing.push(c);
                replyMap.set(c.parent_comment_id, existing);
              } else {
                rootComments.push({ ...c, replies: c.replies || [] });
              }
            });
            const structured = rootComments.map((root) => ({
              ...root,
              replies: replyMap.get(root.id) || root.replies || [],
            }));

            onCommentsUpdate(structured);
          },
          () => {
            isFirestoreActive = false;
          }
        );
      }
    } catch (e) {
      console.warn('Comments listener notice:', e);
    }

    // Initial fetch
    this.getComments(postId).then(onCommentsUpdate).catch(() => {});

    const interval = setInterval(() => {
      if (!isFirestoreActive) {
        this.getComments(postId).then(onCommentsUpdate).catch(() => {});
      }
    }, 6000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }

  /**
   * Add a comment (supports threaded replies)
   */
  static async addComment(
    postId: string,
    content: string,
    parentCommentId?: string,
    user?: { id: string; name: string; profile_image?: string }
  ): Promise<CommunityComment> {
    const res = await apiCommunity.addComment(postId, content, parentCommentId);
    const comment = res.comment as CommunityComment;

    try {
      if (firestoreDb && comment.id) {
        const commDocRef = doc(firestoreDb, 'community_comments', comment.id);
        await setDoc(commDocRef, comment);

        const postDocRef = doc(firestoreDb, 'community_posts', postId);
        await updateDoc(postDocRef, {
          comments_count: increment(1),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Firestore comment write notice:', err);
    }

    return comment;
  }

  /**
   * Update comment
   */
  static async updateComment(commentId: string, content: string): Promise<CommunityComment> {
    const res = await apiCommunity.updateComment(commentId, content);
    try {
      if (firestoreDb) {
        const commDocRef = doc(firestoreDb, 'community_comments', commentId);
        await updateDoc(commDocRef, {
          content,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore comment update notice:', err);
    }
    return res.comment as CommunityComment;
  }

  /**
   * Delete comment
   */
  static async deleteComment(commentId: string, postId?: string): Promise<boolean> {
    const res = await apiCommunity.deleteComment(commentId);
    try {
      if (firestoreDb) {
        const commDocRef = doc(firestoreDb, 'community_comments', commentId);
        await deleteDoc(commDocRef);
        if (postId) {
          const postDocRef = doc(firestoreDb, 'community_posts', postId);
          await updateDoc(postDocRef, {
            comments_count: increment(-1),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Firestore comment delete notice:', err);
    }
    return res.success;
  }

  /**
   * Toggle save/bookmark
   */
  static async toggleSave(
    postId: string,
    userId: string
  ): Promise<{ is_saved: boolean; saves_count: number }> {
    const res = await apiCommunity.toggleSave(postId);

    try {
      if (firestoreDb) {
        const saveDocId = `${postId}_${userId}`;
        const saveDocRef = doc(firestoreDb, 'saved_community_posts', saveDocId);
        const postDocRef = doc(firestoreDb, 'community_posts', postId);

        if (res.is_saved) {
          await setDoc(saveDocRef, {
            id: saveDocId,
            post_id: postId,
            user_id: userId,
            created_at: new Date().toISOString(),
          });
          await updateDoc(postDocRef, {
            saves_count: increment(1),
          }).catch(() => {});
        } else {
          await deleteDoc(saveDocRef).catch(() => {});
          await updateDoc(postDocRef, {
            saves_count: increment(-1),
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Firestore save toggle notice:', err);
    }

    return res;
  }

  /**
   * Get current user's saved posts
   */
  static async getSavedPosts(): Promise<CommunityPost[]> {
    try {
      const res = await apiCommunity.getSavedPosts();
      return (res.posts || []) as CommunityPost[];
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }
  }

  /**
   * Toggle Follow User
   */
  static async toggleFollow(userId: string): Promise<{
    is_following: boolean;
    followers_count: number;
    following_count: number;
    message: string;
  }> {
    return apiCommunity.toggleFollow(userId);
  }

  /**
   * Get user's followers
   */
  static async getFollowers(userId: string): Promise<any[]> {
    try {
      const res = await apiCommunity.getFollowers(userId);
      return res.followers || [];
    } catch {
      return [];
    }
  }

  /**
   * Get user's following list
   */
  static async getFollowing(userId: string): Promise<any[]> {
    try {
      const res = await apiCommunity.getFollowing(userId);
      return res.following || [];
    } catch {
      return [];
    }
  }

  /**
   * Get notifications for current user
   */
  static async getNotifications(): Promise<{ notifications: any[]; unread_count: number }> {
    try {
      const res = await apiCommunity.getNotifications();
      return {
        notifications: res.notifications || [],
        unread_count: res.unread_count || 0,
      };
    } catch {
      return { notifications: [], unread_count: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await apiCommunity.markNotificationRead(id);
      return res.success;
    } catch {
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsRead(): Promise<boolean> {
    try {
      const res = await apiCommunity.markAllNotificationsRead();
      return res.success;
    } catch {
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(id: string): Promise<boolean> {
    try {
      const res = await apiCommunity.deleteNotification(id);
      return res.success;
    } catch {
      return false;
    }
  }

  /**
   * Report post
   */
  static async reportPost(
    postId: string,
    reason: string,
    details?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiCommunity.reportPost(postId, { reason, details });
      return { success: true, message: res.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to submit report' };
    }
  }

  /**
   * Get public user profile
   */
  static async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    try {
      const res = await apiCommunity.getPublicProfile(userId);
      return res.profile as PublicUserProfile;
    } catch (error) {
      console.error('Error fetching public profile:', error);
      return null;
    }
  }
}
