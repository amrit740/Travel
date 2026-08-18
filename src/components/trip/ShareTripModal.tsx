import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock, ExternalLink } from 'lucide-react';
import { Trip, TripShare } from '../../types';
import { apiTrips } from '../../services/api';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  shareInfo?: TripShare | null;
  onShareUpdated: (share: TripShare | null) => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  trip,
  shareInfo,
  onShareUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const currentToken = shareInfo?.share_token || trip.id;
  const shareUrl = `${window.location.origin}/shared-trip/${currentToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateShare = async () => {
    setIsGenerating(true);
    try {
      const res = await apiTrips.createShare(trip.id);
      onShareUpdated(res);
    } catch (err: any) {
      alert(err.message || 'Failed to create share link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeShare = async () => {
    try {
      await apiTrips.revokeShare(trip.id);
      onShareUpdated(null);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke link.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Share Itinerary</h3>
              <p className="text-xs text-slate-500">Allow friends or family to view your plan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 pt-4">
          {/* Link Container */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Public View Link
            </label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-2 text-xs font-medium text-slate-700 outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Quick Share
            </label>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out my travel itinerary for ${trip.destination}: ${shareUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>💬 WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Here is my AI-planned trip to ${trip.destination}!`
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>🐦 Twitter / X</span>
              </a>
            </div>
          </div>

          {/* Share to Community Feed */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-[#E5C365] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">TravelWise Community</p>
                <p className="text-slate-500">Share with fellow travelers so they can remix and get inspired</p>
              </div>
            </div>
            <a
              href="/community"
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shrink-0 ml-2"
            >
              Post to Feed
            </a>
          </div>

          {/* Privacy controls */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <p className="font-bold text-slate-800">Public Link Active</p>
                <p className="text-slate-500">Anyone with this link can view this itinerary.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
