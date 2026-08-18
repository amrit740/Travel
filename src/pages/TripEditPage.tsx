import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Trip } from '../types';
import { apiTrips } from '../services/api';

export const TripEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [transportation, setTransportation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await apiTrips.getById(id);
        setTrip(data);
        setTitle(data.title);
        setBudget(data.total_budget);
        setStartDate(data.start_date);
        setEndDate(data.end_date);
        setSummary(data.summary || '');
        setAccommodation(data.accommodation_preference || 'Hotel');
        setTransportation(data.transportation_preference || 'Mixed');
      } catch (err: any) {
        alert(err.message || 'Could not load trip.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim()) return;

    setIsSaving(true);
    try {
      await apiTrips.update(id, {
        title: title.trim(),
        total_budget: Number(budget) || 0,
        start_date: startDate,
        end_date: endDate,
        summary: summary.trim(),
        accommodation_preference: accommodation,
        transportation_preference: transportation,
      });
      navigate(`/trips/${id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update trip.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center text-slate-500">
        Loading trip settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        type="button"
        onClick={() => navigate(`/trips/${id}`)}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#C59B27]" />
        <span>Back to Itinerary</span>
      </button>

      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl overflow-hidden">
        <div className="bg-[#0f172a] text-white p-6 sm:p-8 border-b border-[#C59B27]/30">
          <span className="text-xs uppercase font-bold text-[#C59B27] tracking-wider">Settings</span>
          <h1 className="text-2xl font-bold font-display mt-1">Edit Trip Details</h1>
          <p className="text-xs text-slate-300 mt-1">Update title, dates, budget targets, and notes for {trip?.destination}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Trip Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] focus:ring-4 focus:ring-[#0f172a]/10 font-bold text-[#0f172a] outline-none bg-[#FAFAF8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] text-sm font-semibold outline-none bg-[#FAFAF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] text-sm font-semibold outline-none bg-[#FAFAF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Target Total Budget ({trip?.currency || 'INR'})
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] font-bold text-base outline-none bg-[#FAFAF8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
                Accommodation Preference
              </label>
              <input
                type="text"
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] text-xs font-semibold outline-none bg-[#FAFAF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
                Transportation Preference
              </label>
              <input
                type="text"
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] text-xs font-semibold outline-none bg-[#FAFAF8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0f172a] mb-2">
              Trip Overview & Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-4 rounded-2xl border border-[#e2e8f0] focus:border-[#0f172a] text-xs text-[#0f172a] leading-relaxed outline-none bg-[#FAFAF8]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => navigate(`/trips/${id}`)}
              className="px-5 py-2.5 rounded-xl text-[#64748b] font-semibold text-xs hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] font-bold text-xs shadow-md border border-[#C59B27]/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4 text-[#C59B27]" />
              {isSaving ? 'Saving Changes...' : 'Save Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
