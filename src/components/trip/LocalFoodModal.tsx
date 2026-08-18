import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  X,
  Star,
  Plus,
  CheckCircle2,
  Filter,
  DollarSign,
  MapPin,
  Sparkles,
  Search,
  Leaf,
} from 'lucide-react';
import { Trip, Activity, ItineraryDay } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCurrentTrip } from '../../contexts/TripContext';

interface LocalFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

interface LocalFoodItem {
  id: string;
  name: string;
  category: 'Street Food' | 'Heritage Dining' | 'Sweet / Dessert' | 'Seafood / Regional' | 'Cafe & Bakery';
  dietary: 'Veg' | 'Non-Veg' | 'Vegan' | 'Jain-Friendly';
  description: string;
  famousPlace: string;
  avgCost: number;
  rating: number;
  image: string;
  distanceKm: string;
}

const DESTINATION_FOODS: Record<string, LocalFoodItem[]> = {
  Goa: [
    {
      id: 'food-goa-1',
      name: 'Goan Fish Thali & Kokum Kadi',
      category: 'Seafood / Regional',
      dietary: 'Non-Veg',
      description: 'Traditional plate with rawa fried surmai, spiced prawn curry, tisrya shell curry, kismoor, and steamed red rice.',
      famousPlace: 'Vinayak Family Restaurant, Assagao',
      avgCost: 320,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80',
      distanceKm: '1.2 km from beach strip',
    },
    {
      id: 'food-goa-2',
      name: 'Bebinca 7-Layered Coconut Pudding',
      category: 'Sweet / Dessert',
      dietary: 'Veg',
      description: 'Rich Indo-Portuguese dessert baked layer-by-layer with coconut milk, egg yolk, ghee, and nutmeg.',
      famousPlace: 'Confeitaria 31 De Janeiro, Fontainhas',
      avgCost: 180,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
      distanceKm: '0.6 km from Latin Quarter',
    },
    {
      id: 'food-goa-3',
      name: 'Mushroom / Chicken Xacuti & Poi Bread',
      category: 'Heritage Dining',
      dietary: 'Veg',
      description: 'Complex aromatic curry roasted with 18 Goan spices, grated coconut, and served with freshly baked earthen poi bread.',
      famousPlace: 'Ritz Classic, Panaji',
      avgCost: 280,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
      distanceKm: '2.1 km from city center',
    },
    {
      id: 'food-goa-4',
      name: 'Ros Omelette with Hot Gravy',
      category: 'Street Food',
      dietary: 'Non-Veg',
      description: 'Fluffy masala omelette drowned in bubbling hot xacuti gravy with chopped onions and lime.',
      famousPlace: 'Sandhya Ros Omelette Stall, Panaji Market',
      avgCost: 110,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
      distanceKm: '0.4 km from bus terminus',
    },
  ],
  Jaipur: [
    {
      id: 'food-jpr-1',
      name: 'Authentic Dal Baati Churma with Pure Ghee',
      category: 'Heritage Dining',
      dietary: 'Veg',
      description: 'Hard wheat rolls baked over coal, dipped in melted desi ghee, served with panchmel dal and sweet jaggery churma.',
      famousPlace: 'LMB (Laxmi Misthan Bhandar), Johari Bazaar',
      avgCost: 450,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
      distanceKm: '0.8 km from City Palace',
    },
    {
      id: 'food-jpr-2',
      name: 'Rawat Pyaaz Ki Kachori & Sweet Lassi',
      category: 'Street Food',
      dietary: 'Veg',
      description: 'Crispy deep-fried pastry stuffed with spiced onions and garam masala, paired with thick clay-cup malai lassi.',
      famousPlace: 'Rawat Mishthan Bhandar, Station Road',
      avgCost: 90,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
      distanceKm: '1.5 km from Hawa Mahal',
    },
    {
      id: 'food-jpr-3',
      name: 'Paneer Ghewar Sweet Honeycomb Cake',
      category: 'Sweet / Dessert',
      dietary: 'Veg',
      description: 'Disc-shaped sweet pastry soaked in cardamom saffron syrup, topped with rich rabri and silver vark.',
      famousPlace: 'Sambhar Fini Wale, Kishanpole Bazar',
      avgCost: 220,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
      distanceKm: '1.1 km from Albert Hall',
    },
  ],
  Default: [
    {
      id: 'food-def-1',
      name: 'Local Chef Special Thali & Artisanal Bread',
      category: 'Heritage Dining',
      dietary: 'Veg',
      description: 'Seasonal tasting menu featuring 5 locally harvested dishes with cold-pressed oils and organic condiments.',
      famousPlace: 'Central Heritage Dining Hall',
      avgCost: 350,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
      distanceKm: '0.9 km from itinerary route',
    },
    {
      id: 'food-def-2',
      name: 'Artisan Chai & Fresh Street Snacks',
      category: 'Street Food',
      dietary: 'Veg',
      description: 'Clay-cup spiced tea paired with crispy savory pastries and mint-coriander dip.',
      famousPlace: 'Old Town Corner Stall',
      avgCost: 75,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
      distanceKm: '0.4 km from town square',
    },
  ],
};

export const LocalFoodModal: React.FC<LocalFoodModalProps> = ({ isOpen, onClose, trip }) => {
  const { addSpotToDay, selectedDayNumber } = useCurrentTrip();
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Veg' | 'Non-Veg' | 'Vegan' | 'Jain-Friendly'>('All');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [targetDay, setTargetDay] = useState<number>(selectedDayNumber || 1);

  if (!isOpen || !trip) return null;

  const destKey = Object.keys(DESTINATION_FOODS).find(
    (k) => trip.destination.toLowerCase().includes(k.toLowerCase())
  ) || 'Default';

  const foodItems = DESTINATION_FOODS[destKey] || DESTINATION_FOODS.Default;

  const filteredFoods = dietaryFilter === 'All'
    ? foodItems
    : foodItems.filter((f) => f.dietary === dietaryFilter || (dietaryFilter === 'Veg' && f.dietary === 'Vegan'));

  const handleAddFoodToTrip = async (item: LocalFoodItem) => {
    setAddingId(item.id);
    try {
      const days = trip.itinerary_days || [];
      const day = days.find((d) => d.day_number === targetDay) || days[0];

      if (day) {
        await addSpotToDay(day.id, {
          name: `${item.name} (${item.famousPlace})`,
          category: 'Food & Dining',
          description: item.description,
          start_time: '01:30 PM',
          end_time: '02:45 PM',
          estimated_cost: item.avgCost,
          location: `${item.famousPlace}, ${trip.destination}`,
          image: item.image,
          notes: `Must-try authentic local culinary specialty. ${item.dietary} verified.`,
        });
        setAddedIds((prev) => [...prev, item.id]);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add food activity.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-[#C59B27]/40 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-[#E5C365]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#E5C365] font-semibold block">
                  Gastronomy Concierge
                </span>
                <h2 className="font-serif-title text-2xl font-medium tracking-tight text-white">
                  Local Food & Culinary Discovery
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {/* Dietary Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['All', 'Veg', 'Non-Veg', 'Vegan', 'Jain-Friendly'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDietaryFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    dietaryFilter === filter
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Target Day for Add */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Add to:</span>
              <select
                value={targetDay}
                onChange={(e) => setTargetDay(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
              >
                {(trip.itinerary_days || []).map((d) => (
                  <option key={d.day_number} value={d.day_number}>
                    Day {d.day_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Food Items List */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAFAF8]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFoods.map((item) => {
                const isAdded = addedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-400 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                                item.dietary === 'Veg' || item.dietary === 'Vegan'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.dietary}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.category}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 text-amber-800 text-[11px] font-bold shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs font-light leading-relaxed">
                        {item.description}
                      </p>

                      <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                        <p className="font-medium text-slate-900">
                          📍 <strong>Best at:</strong> {item.famousPlace}
                        </p>
                        <p className="text-slate-400">📏 {item.distanceKm}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-800">
                        ~{formatCurrency(item.avgCost, trip.currency)} <span className="text-[10px] font-light text-slate-400">/ plate</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddFoodToTrip(item)}
                        disabled={isAdded || addingId === item.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Added to Day {targetDay}</span>
                          </>
                        ) : addingId === item.id ? (
                          <span>Adding...</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-[#E5C365]" />
                            <span>Add to Day {targetDay}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span>✨ Showing {filteredFoods.length} authentic dishes curated for {trip.destination}</span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
