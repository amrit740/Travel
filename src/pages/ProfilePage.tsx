import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Sparkles, Check, Save, Heart, DollarSign, Compass, Utensils, Camera, Upload, Trash2, FolderLock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updatePreferences, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [preferredCurrency, setPreferredCurrency] = useState(
    user?.preferences?.preferred_currency || 'INR'
  );
  const [dietary, setDietary] = useState(user?.preferences?.dietary_restrictions || 'None');
  const [pace, setPace] = useState(user?.preferences?.pace_preference || 'Balanced');
  const [accommodation, setAccommodation] = useState(
    user?.preferences?.accommodation_style || 'Mid-range Hotel'
  );
  const [transportation, setTransportation] = useState(
    user?.preferences?.transportation_mode || 'Cab / Ride-share'
  );
  const [favoriteStyles, setFavoriteStyles] = useState<string[]>(
    user?.preferences?.favorite_travel_styles || ['Culture & History', 'Food & Culinary']
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleOptions = [
    'Culture & History',
    'Food & Culinary',
    'Beaches & Relaxation',
    'Adventure & Trekking',
    'Shopping & Bazaars',
    'Photography & Scenic',
    'Nightlife & Clubs',
    'Luxury & Wellness',
  ];

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Url = e.target?.result as string;
      setProfileImage(base64Url);
      try {
        await updateProfile({ name: name || user?.name, profile_image: base64Url });
      } catch (err) {
        console.warn('Could not persist avatar to server immediately:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const toggleStyle = (style: string) => {
    setFavoriteStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, profile_image: profileImage });
    updatePreferences({
      preferred_currency: preferredCurrency,
      dietary_restrictions: dietary,
      pace_preference: pace,
      accommodation_style: accommodation,
      transportation_mode: transportation,
      favorite_travel_styles: favoriteStyles,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header with Avatar & Drag-and-Drop / Click File Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-3xl bg-[#0f172a] text-[#f8fafc] flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden border-2 border-[#C59B27]/40">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] shadow-md transition-all active:scale-95 border border-[#C59B27]/40"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5 text-[#C59B27]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {user?.name || 'Traveler Profile'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0f172a]/10 text-[#0f172a] text-xs font-semibold uppercase">
                Traveler
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Drag and Drop Box for Avatar/Photo */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-3 sm:px-5 sm:py-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3 ${
            isDragging
              ? 'border-[#C59B27] bg-[#C59B27]/10 text-[#0f172a]'
              : 'border-[#e2e8f0] hover:border-[#C59B27] bg-[#FAFAF8] text-[#64748b]'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#0f172a]/10 text-[#0f172a] flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-[#C59B27]" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[#0f172a]">
              {isUploading ? 'Uploading photo...' : 'Drag & drop avatar photo'}
            </p>
            <p className="text-[10px] text-[#64748b]">or click to browse from device (max 5MB)</p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl p-4 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Travel preferences updated successfully! New AI itineraries will use these settings automatically.</span>
        </div>
      )}

      {/* Cloud Document Vault Banner */}
      <div className="p-5 rounded-3xl bg-[#FAFAF8] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0f172a]/10 text-[#0f172a] flex items-center justify-center shrink-0">
            <FolderLock className="w-6 h-6 text-[#C59B27]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Your Personal Document Vault</h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Securely store and manage your flight tickets, booking confirmations, visa copies, and travel receipts.
            </p>
          </div>
        </div>
        <Link
          to="/files"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-semibold shrink-0 transition-colors self-start sm:self-auto"
        >
          <span>Open Vault</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-[#C59B27]" />
            AI Itinerary Personalization
          </h3>
          <p className="text-xs text-[#64748b] mt-0.5">
            Configure your default travel habits so AI generates schedules tailored to your comfort and taste.
          </p>
        </div>

        {/* Currency and Dietary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Default Currency
            </label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] font-semibold text-xs text-[#0f172a] outline-none bg-[#FAFAF8]"
            >
              <option value="INR">INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">USD ($) - US Dollar (International Visitors)</option>
              <option value="EUR">EUR (€) - Euro (International Visitors)</option>
              <option value="GBP">GBP (£) - British Pound (International Visitors)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Dietary Preference
            </label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] font-semibold text-xs text-[#0f172a] outline-none bg-[#FAFAF8]"
            >
              <option value="None">All Cuisines (No restrictions)</option>
              <option value="Vegetarian">Pure Vegetarian</option>
              <option value="Vegan">Strict Vegan</option>
              <option value="Halal">Halal Preferred</option>
              <option value="Gluten-Free">Gluten-Free / Celiac</option>
              <option value="Jain">Jain Vegetarian</option>
            </select>
          </div>
        </div>

        {/* Pace & Accommodation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Travel Pace
            </label>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] font-semibold text-xs text-[#0f172a] outline-none bg-[#FAFAF8]"
            >
              <option value="Relaxed">Relaxed (1-2 stops/day)</option>
              <option value="Balanced">Balanced (3-4 stops/day)</option>
              <option value="Fast-Paced">Packed (5+ stops/day)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Accommodation Style
            </label>
            <select
              value={accommodation}
              onChange={(e) => setAccommodation(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] font-semibold text-xs text-[#0f172a] outline-none bg-[#FAFAF8]"
            >
              <option value="Budget Hostel">Budget Hostel</option>
              <option value="Mid-range Hotel">Mid-range Hotel</option>
              <option value="Boutique / Heritage">Boutique / Heritage</option>
              <option value="5-Star Luxury Resort">5-Star Luxury Resort</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Transit Mode
            </label>
            <select
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] font-semibold text-xs text-[#0f172a] outline-none bg-[#FAFAF8]"
            >
              <option value="Public Transit (Metro/Bus)">Public Transit (Metro/Bus)</option>
              <option value="Cab / Ride-share">Cab / Ride-share</option>
              <option value="Rental Car / Scooter">Rental Car / Scooter</option>
              <option value="Walking & Walking Tours">Walking & Trails</option>
            </select>
          </div>
        </div>

        {/* Favorite Travel Styles */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a]">
            Favorite Travel Interests
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {styleOptions.map((style) => {
              const isSelected = favoriteStyles.includes(style);
              return (
                <button
                  type="button"
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    isSelected
                      ? 'border-[#0f172a] bg-[#0f172a] text-[#f8fafc] shadow-xs'
                      : 'border-[#e2e8f0] bg-[#FAFAF8] text-[#64748b] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{style}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C59B27]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-[#e2e8f0] flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] font-bold text-xs shadow-md border border-[#C59B27]/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4 text-[#C59B27]" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
