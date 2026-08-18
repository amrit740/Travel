import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, MapPin, Tag, Globe, Lock, Loader2, Sparkles } from 'lucide-react';
import { CommunityService } from '../../services/communityService';
import { CommunityPost, CommunityPostVisibility } from '../../types';

interface EditPostModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (post: CommunityPost) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onPostUpdated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [visibility, setVisibility] = useState<CommunityPostVisibility>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setDestination(post.destination || '');
      setTagsInput((post.tags || []).join(', '));
      setVisibility(post.visibility || 'public');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    try {
      const updated = await CommunityService.updatePost(post.id, {
        title: title.trim(),
        content: content.trim(),
        destination: destination.trim() || 'Global Travel',
        tags: parsedTags.length > 0 ? parsedTags : ['Travel'],
        visibility,
      });

      onPostUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-[#E5C365]" />
              </div>
              <h3 className="text-base font-serif font-bold text-slate-900">Edit Community Post</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C59B27]" /> Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">Content</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#C59B27]" /> Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Beaches, Culture, Solo, Food"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            {/* Visibility */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Visibility</span>
                <span className="text-[11px] text-slate-500">
                  {visibility === 'public' ? 'Public on community feed' : 'Private to your account'}
                </span>
              </div>
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    visibility === 'public' ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  <Globe className="w-3 h-3" /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    visibility === 'private' ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  <Lock className="w-3 h-3" /> Private
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-md hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E5C365]" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E5C365]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
